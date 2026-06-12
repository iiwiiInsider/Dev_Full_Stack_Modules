import React, { useState } from "react";
import PropTypes from "prop-types";

// Single emoji dictionary entry card
function Card({ emoji, name, meaning }) {
  const [expanded, setExpanded] = useState(false);
  const shortMeaning = meaning.length > 100 ? meaning.slice(0, 100) + "…" : meaning;

  return (
    <div className="term" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setExpanded((x) => !x)}>
      <dt onClick={() => setExpanded((x) => !x)} role="button" aria-expanded={expanded} style={{ cursor: "pointer" }}>
        <span className="emoji" role="img" aria-label={name} title={name}>
          {emoji}
        </span>
        <span>{name}</span>
      </dt>
      <dd>{expanded ? meaning : shortMeaning}</dd>
      {meaning.length > 100 && (
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          style={{ marginTop: "0.75rem", border: "none", background: "#2ec2b0", color: "#fff", padding: "0.35rem 0.75rem", borderRadius: 4, cursor: "pointer" }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

Card.propTypes = {
  emoji: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  meaning: PropTypes.string.isRequired
};

export default Card;