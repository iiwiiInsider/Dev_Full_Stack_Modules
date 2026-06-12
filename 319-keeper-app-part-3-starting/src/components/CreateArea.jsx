import React, { useState, useRef, useEffect, useCallback } from "react";

function CreateArea({ onAdd }) {
  const [note, setNote] = useState({ title: "", content: "" });
  const [expanded, setExpanded] = useState(false);
  const titleRef = useRef(null);
  const textRef = useRef(null);

  // Auto-focus textarea when expanding
  useEffect(() => {
    if (expanded && textRef.current) {
      textRef.current.focus();
    }
  }, [expanded]);

  const handleChange = e => {
    const { name, value } = e.target;
    setNote(prev => ({ ...prev, [name]: value }));
  };

  const submitNote = useCallback(
    e => {
      e.preventDefault();
      onAdd && onAdd(note);
      // Reset
      setNote({ title: "", content: "" });
      setExpanded(false);
      // Return focus to title for accessibility
      if (titleRef.current) titleRef.current.focus();
    },
    [note, onAdd]
  );

  const expand = () => setExpanded(true);

  const isDisabled = !note.title.trim() && !note.content.trim();

  return (
    <div className={`create-area ${expanded ? "expanded" : "collapsed"}`}>
      <form onSubmit={submitNote} aria-label="Create a new note">
        {expanded && (
          <input
            ref={titleRef}
            name="title"
            placeholder="Title"
            value={note.title}
            onChange={handleChange}
            aria-label="Note title"
            maxLength={120}
          />
        )}
        <textarea
          ref={textRef}
            name="content"
            placeholder="Take a note..."
            rows={expanded ? 3 : 1}
            value={note.content}
            onClick={expand}
            onChange={handleChange}
            aria-label="Note content"
            maxLength={2000}
        />
        <button
          type="submit"
          disabled={isDisabled}
          aria-disabled={isDisabled}
          title={isDisabled ? "Enter some text first" : "Add note"}
        >
          +
        </button>
      </form>
    </div>
  );
}

export default CreateArea;
