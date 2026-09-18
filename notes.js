// In-memory notes store for demo application

let notes = [];
let nextId = 1;

/**
 * Creates a new note and stores it in memory.
 * @param {Object} noteData
 * @param {string} noteData.title
 * @param {string} noteData.content
 * @param {string} [noteData.author]
 * @returns {Object} The created note
 */
function createNote({ title, content, author = "anonymous" }) {
  if (!title || typeof title !== "string") {
    throw new Error("Title is required and must be a string");
  }
  if (!content || typeof content !== "string") {
    throw new Error("Content is required and must be a string");
  }

  const note = {
    id: String(nextId++),
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    createdAt: new Date().toISOString(),
  };

  notes.push(note);
  return note;
}

/**
 * Retrieves all notes.
 * @returns {Array<Object>} List of notes
 */
function getAllNotes() {
  return [...notes];
}

/**
 * Retrieves a single note by ID.
 * @param {string} id
 * @returns {Object | null}
 */
function getNoteById(id) {
  const note = notes.find((n) => n.id === String(id));
  return note ? { ...note } : null;
}

/**
 * Resets the in-memory store (useful for tests or clean state).
 */
function resetNotes() {
  notes = [];
  nextId = 1;
}

/**
 * Deletes a note by ID.
 * @param {string} id
 * @returns {boolean} True if deleted, false if not found
 */
function deleteNote(id) {
  const initialLength = notes.length;
  notes = notes.filter((n) => n.id !== String(id));
  return notes.length !== initialLength;
}

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  resetNotes,
  deleteNote,
};
