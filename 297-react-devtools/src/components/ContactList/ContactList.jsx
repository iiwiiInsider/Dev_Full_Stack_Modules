import React from 'react';
import contacts from '../../contacts';
import ContactCard from '../ContactCard/ContactCard';

// ContactList: maps domain data to UI components
function ContactList() {
  return (
    <div className="cards" role="list" aria-label="Contacts list">
      {contacts.map(c => (
        <ContactCard
          key={c.id}
          name={c.name}
          img={c.imgURL}
          tel={c.phone}
          email={c.email}
        />
      ))}
    </div>
  );
}

export default ContactList;
