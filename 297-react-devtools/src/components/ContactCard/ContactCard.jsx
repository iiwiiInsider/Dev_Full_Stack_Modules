import React from 'react';
import Avatar from '../Avatar/Avatar';

// ContactCard: isolated presentation of a single contact
function ContactCard({ name, img, tel, email }) {
  return (
    <div className="card" role="listitem">
      <div className="top">
        <Avatar src={img} alt={`${name} avatar`} size={80} />
        <h2 className="name">{name}</h2>
      </div>
      <div className="bottom">
        <p className="info" aria-label="Phone number">{tel}</p>
        <p className="info" aria-label="Email address">{email}</p>
      </div>
    </div>
  );
}

export default ContactCard;
