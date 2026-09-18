const addNoteBtn = document.getElementById('add-note-btn');
const noteModal = document.getElementById('note-modal');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const noteForm = document.getElementById('note-form');
const notesGrid = document.getElementById('notes-grid');
const emptyState = document.getElementById('empty-state');
const notificationArea = document.getElementById('notification-area');

// Show notification
function showNotification(message) {
  notificationArea.textContent = message;
  notificationArea.classList.remove('hidden');
  setTimeout(() => {
    notificationArea.classList.add('hidden');
  }, 3000);
}

// Fetch and display notes
async function loadNotes() {
  try {
    const res = await fetch('/notes');
    if (!res.ok) throw new Error('Failed to fetch notes');
    const notes = await res.json();
    
    notesGrid.innerHTML = '';
    
    if (notes.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
          <div class="note-title"></div>
          <div class="note-content"></div>
          <div class="note-footer">
            <span></span>
            <button class="btn danger-btn" onclick="deleteNote('${note.id}')">Delete</button>
          </div>
        `;
        // Safe injection
        card.querySelector('.note-title').textContent = note.title;
        card.querySelector('.note-content').textContent = note.content;
        card.querySelector('.note-footer span').textContent = `${note.author} | ID: ${note.id}`;
        
        notesGrid.appendChild(card);
      });
    }
  } catch (error) {
    showNotification(error.message);
  }
}

// Create note
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('note-title').value.trim();
  const content = document.getElementById('note-content').value.trim();
  const author = document.getElementById('note-author').value.trim();
  
  if (!title || !content || !author) return;
  
  try {
    const res = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, author })
    });
    
    if (!res.ok) throw new Error('Failed to create note');
    
    closeModal();
    showNotification('Note created successfully');
    loadNotes();
  } catch (error) {
    showNotification(error.message);
  }
});

// Delete note
window.deleteNote = async function(id) {
  try {
    const res = await fetch(`/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete note');
    
    showNotification('Note deleted successfully');
    loadNotes();
  } catch (error) {
    showNotification(error.message);
  }
};

// Modal handling
function openModal() {
  noteModal.classList.remove('hidden');
  document.getElementById('note-title').focus();
}

function closeModal() {
  noteModal.classList.add('hidden');
  noteForm.reset();
}

addNoteBtn.addEventListener('click', openModal);
cancelNoteBtn.addEventListener('click', closeModal);
noteModal.addEventListener('click', (e) => {
  if (e.target === noteModal) closeModal();
});

// Initial load
loadNotes();
