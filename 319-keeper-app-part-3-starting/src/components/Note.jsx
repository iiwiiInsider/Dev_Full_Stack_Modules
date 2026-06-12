import React, { memo, useCallback } from "react";

function Note({ id, title, content, onDelete }) {
  const handleDelete = useCallback(() => {
    onDelete && onDelete(id);
  }, [id, onDelete]);

  return (
    <div className="note" role="group" aria-label={`Note titled ${title || "(no title)"}`}>
      {title && <h1>{title}</h1>}
      {content && <p>{content}</p>}
      <button
        type="button"
        className="delete-btn"
        aria-label="Delete note"
        onClick={handleDelete}
      >
        ✕
      </button>
    </div>
  );
}

export default memo(Note);
