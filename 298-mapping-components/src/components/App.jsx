import React from "react";
import Card from "./Card";
import contacts from "../contacts";

function App() {
  return (
    <div>
      <h1 className="heading">My Contacts</h1>
      <div className="cards" role="list" aria-label="Contacts list">
        {contacts.map(contact => (
          <Card
            key={contact.id}
            id={contact.id}
            name={contact.name}
            img={contact.imgURL}
            tel={contact.phone}
            email={contact.email}
          />
        ))}
      </div>
      {/* Extra simple mapping example rendering just the IDs */}
      <section aria-label="Contact IDs">
        {contacts.map(c => (
          <p key={`id-${c.id}`}>Contact ID: {c.id}</p>
        ))}
      </section>
    </div>
  );
}

export default App;
