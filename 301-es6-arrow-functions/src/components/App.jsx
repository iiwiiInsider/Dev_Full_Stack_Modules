import React from "react";
import Entry from "./Entry";
import emojipedia from "../emojipedia";

// Arrow function component with inline mapping + implicit return inside map
const App = () => (
  <div>
    <h1>
      <span>emojipedia</span>
    </h1>
    <dl className="dictionary">
      {emojipedia.map(({ id, emoji, name, meaning }) => (
        <Entry
          key={id}
          emoji={emoji}
          name={name}
          description={meaning}
        />
      ))}
    </dl>
  </div>
);

export default App;
