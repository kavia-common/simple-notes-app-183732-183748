/* Notes service powered by Supabase.
   Expects a "notes" table with columns:
   - id: uuid (primary key, default: gen_random_uuid())
   - title: text
   - content: text
   - created_at: timestamptz (default: now())
   - updated_at: timestamptz (default: now())
*/
import { getSupabaseClient } from '../lib/supabaseClient';

const TABLE = 'notes';

/**
 * PUBLIC_INTERFACE
 * listNotes
 * Returns all notes ordered by updated_at desc.
 */
export async function listNotes() {
  /** This is a public function. Fetch all notes. */
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * createNote
 * Creates a new empty note with sane defaults.
 */
export async function createNote(payload = {}) {
  /** This is a public function. Create a new note. */
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        title: payload.title ?? '',
        content: payload.content ?? '',
        created_at: now,
        updated_at: now
      }
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * updateNote
 * Updates note fields. Expects note.id to be present.
 */
export async function updateNote(note) {
  /** This is a public function. Update an existing note. */
  if (!note?.id) throw new Error('Note id is required for update');
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      title: note.title ?? '',
      content: note.content ?? '',
      updated_at: new Date().toISOString()
    })
    .eq('id', note.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteNote
 * Deletes a note by id.
 */
export async function deleteNote(id) {
  /** This is a public function. Delete a note by id. */
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}
