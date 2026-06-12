import React, { useState, useCallback } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";

function App() {
  // State for all notes
  const [notes, setNotes] = useState([]);

  // Add a new note (memoized to avoid unnecessary re-renders)
  const addNote = useCallback(note => {
    // Guard: ignore empty submissions
    if (!note) return;
    const title = note.title?.trim();
    const content = note.content?.trim();
    if (!title && !content) return; // both empty, ignore
    setNotes(prev => [
      { id: Date.now().toString() + Math.random().toString(36).slice(2), title, content },
      ...prev
    ]);
  }, []);

  // Delete a note by id
  const deleteNote = useCallback(id => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      <div className="notes-container" aria-live="polite">
        {notes.length === 0 && (
          <p className="empty-hint">No notes yet. Start typing to add one!</p>
        )}
        {notes.map(note => (
          <Note
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            onDelete={deleteNote}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default App;
