const express = require("express");
const notesStore = require("./notes");
const authHelper = require("./auth");
const analyticsHelper = require("./analytics");

const app = express();
const PORT = process.env.PORT || 3000;

// CASE 1: Provider-specific hardcoded secret
const OPENAI_API_KEY = "sk-proj-1234567890abcdef1234567890abcdef";

// CASE 2: Generic suspicious high-entropy secret
const API_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0";
// Normal identifier to test contextual detection
const requestId = "req_88f8d9b89";


app.use(express.json());
app.use(express.static("public"));

// 0. Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the Secure Notes Demo API. Try accessing /health or /notes.");
});

// 1. Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "secure-notes",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Create a note
app.post("/notes", (req, res) => {
  try {
    const { title, content, author } = req.body || {};
    const newNote = notesStore.createNote({ title, content, author });

    // Track creation event
    analyticsHelper.trackEvent("note_created", {
      noteId: newNote.id,
      author: newNote.author,
    });

    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Fetch all notes
app.get("/notes", (req, res) => {
  const notes = notesStore.getAllNotes();

  // Track fetch event
  analyticsHelper.trackEvent("notes_fetched", { count: notes.length });

  res.json(notes);
});

// Fetch single note by ID
app.get("/notes/:id", (req, res) => {
  const note = notesStore.getNoteById(req.params.id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json(note);
});

// Delete a note
app.delete("/notes/:id", (req, res) => {
  const success = notesStore.deleteNote(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json({ message: "Note deleted successfully" });
});

// 4. Authentication helper demo route (protected notes view)
app.get("/auth/verify", authHelper.authMiddleware, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
    message: "Synthetic demo authentication verified successfully",
  });
});

// 5. Analytics helper demo route (inspect logged events)
app.get("/analytics", (req, res) => {
  res.json(analyticsHelper.getTrackedEvents());
});

// CASE 7: Response/client exposure sink
app.get("/demo/secret", (req, res) => {
  res.json({ 
    message: "Intentional secret exposure for demo",
    key: API_KEY,
    openai: OPENAI_API_KEY
  });
});


// Only start the server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Secure Notes demo server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
