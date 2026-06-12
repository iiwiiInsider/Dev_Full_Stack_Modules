import React, { useState } from "react";

function InputArea(props) {
  const [inputText, setInputText] = useState("");

  function handleChange(event) {
    setInputText(event.target.value);
  }

  function submitItem() {
    props.onAdd && props.onAdd(inputText);
    setInputText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      submitItem();
    }
  }

  return (
    <div className="form">
      <input
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="text"
        value={inputText}
        placeholder="New item"
      />
      <button onClick={submitItem}>
        <span>Add</span>
      </button>
    </div>
  );
}

export default InputArea;
