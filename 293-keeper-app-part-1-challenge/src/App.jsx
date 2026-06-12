import React from "react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Note from "./Note.jsx";

// Temporary sample notes data (static for Part 1)
const notes = [
  { id: 1, title: "This is the note title", content: "This is the note content." },
  { id: 2, title: "Shopping List", content: "Milk\nEggs\nBread" },
  { id: 3, title: "Ideas", content: "Build a React app\nRead a book" }
];

function App() {
  return (
    <div>
      <Header />
      {notes.map(note => (
        <Note key={note.id} title={note.title} content={note.content} />
      ))}
      <Footer />
    </div>
  );
}

export default App;
