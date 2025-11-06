import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNotes } from './hooks/useNotes';

// Header component
function Header({ theme, onToggleTheme }) {
  return (
    <header className="navbar" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span role="img" aria-label="notes" style={{ fontSize: 22 }}>📝</span>
          <h1 className="title" style={{ margin: 0, fontSize: 20 }}>Simple Notes</h1>
        </div>
        <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}

// Notes list component
function NotesList({ notes, activeId, onSelect, onDelete }) {
  return (
    <aside className="notes-list" aria-label="Notes list">
      {notes.length === 0 && (
        <div className="empty">No notes yet. Click + to create one.</div>
      )}
      {notes.map(n => (
        <button
          key={n.id}
          className={`note-list-item ${activeId === n.id ? 'active' : ''}`}
          onClick={() => onSelect(n.id)}
          aria-current={activeId === n.id ? 'true' : 'false'}
        >
          <div className="note-list-title">{n.title || 'Untitled'}</div>
          <div className="note-list-meta">
            {n.updated_at ? new Date(n.updated_at).toLocaleString() : '—'}
          </div>
          <div className="spacer" />
          <span
            role="button"
            aria-label={`Delete ${n.title || 'Untitled'}`}
            className="delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
            title="Delete"
          >
            🗑️
          </span>
        </button>
      ))}
    </aside>
  );
}

// Note editor component
function NoteEditor({ note, onChange }) {
  if (!note) {
    return <div className="editor empty">Select or create a note to start editing.</div>;
  }
  return (
    <div className="editor">
      <input
        aria-label="Note title"
        className="editor-title"
        placeholder="Note title"
        value={note.title || ''}
        onChange={(e) => onChange({ ...note, title: e.target.value })}
      />
      <textarea
        aria-label="Note content"
        className="editor-body"
        placeholder="Start typing..."
        value={note.content || ''}
        onChange={(e) => onChange({ ...note, content: e.target.value })}
      />
    </div>
  );
}

// Floating action button
function Fab({ onClick }) {
  return (
    <button className="fab" aria-label="Create note" onClick={onClick}>＋</button>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const { notes, activeNoteId, setActiveNoteId, activeNote, createNote, updateNote, deleteNote, loading, error } = useNotes();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // memoize sorted notes (recent first)
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  }, [notes]);

  return (
    <div className="App">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="main">
        <div className="container two-col">
          <NotesList
            notes={sortedNotes}
            activeId={activeNoteId}
            onSelect={setActiveNoteId}
            onDelete={deleteNote}
          />
          <section className="content-area">
            {loading && <div className="banner info">Loading notes…</div>}
            {error && <div className="banner error" role="alert">{error}</div>}
            <NoteEditor note={activeNote} onChange={updateNote} />
          </section>
        </div>
      </main>
      <Fab onClick={createNote} />
    </div>
  );
}

export default App;
