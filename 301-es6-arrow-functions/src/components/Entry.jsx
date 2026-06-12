import React from "react";

// Destructure props + concise arrow component
const Entry = ({ emoji, name, description }) => (
  <div className="term">
    <dt>
      <span className="emoji" role="img" aria-label={name}>
        {emoji}
      </span>
      <span>{name}</span>
    </dt>
    <dd>{description}</dd>
  </div>
);

export default Entry;
