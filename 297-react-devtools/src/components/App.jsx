import React from "react";
import ContactList from "./ContactList/ContactList";

// Top-level App component kept lean; layout & page-level composition lives here.
function App() {
  return (
    <main>
      <h1 className="heading">My Contacts</h1>
      <ContactList />
    </main>
  );
}

export default App;
