/* Hook to manage notes with debounced autosave to Supabase. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../services/notesService';

// PUBLIC_INTERFACE
export function useNotes() {
  /** Provides notes state, active selection, create/update/delete and loading/error. */
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceTimer = useRef(null);
  const dirtyNoteRef = useRef(null); // latest dirty note pending save

  // initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const list = await api.listNotes();
        if (!cancelled) {
          setNotes(list);
          if (list.length > 0) setActiveNoteId(list[0].id);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load notes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const activeNote = useMemo(
    () => notes.find(n => n.id === activeNoteId) || null,
    [notes, activeNoteId]
  );

  const createNote = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const fresh = await api.createNote({ title: 'Untitled', content: '' });
      setNotes(prev => [fresh, ...prev]);
      setActiveNoteId(fresh.id);
    } catch (e) {
      setError(e.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced persist of active note changes
  const flushSave = useCallback(async () => {
    const pending = dirtyNoteRef.current;
    if (!pending || !pending.id) return;
    try {
      const saved = await api.updateNote(pending);
      setNotes(prev => prev.map(n => (n.id === saved.id ? saved : n)));
    } catch (e) {
      setError(e.message || 'Failed to save note');
    } finally {
      dirtyNoteRef.current = null;
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flushSave, 500);
  }, [flushSave]);

  const updateNote = useCallback((updated) => {
    setNotes(prev => prev.map(n => (n.id === updated.id ? { ...n, ...updated, updated_at: new Date().toISOString() } : n)));
    dirtyNoteRef.current = updated;
    scheduleSave();
  }, [scheduleSave]);

  const deleteNote = useCallback(async (id) => {
    try {
      setLoading(true);
      setError('');
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) {
        // pick next available note
        const remaining = notes.filter(n => n.id !== id);
        setActiveNoteId(remaining[0]?.id || null);
      }
    } catch (e) {
      setError(e.message || 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  }, [activeNoteId, notes]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    notes,
    activeNoteId,
    setActiveNoteId,
    activeNote,
    createNote,
    updateNote,
    deleteNote,
    loading,
    error
  };
}
