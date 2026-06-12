import React from "react";
import ReactDOM from "react-dom";
import Heading from "./Heading";

const foods = [
  { name: "Bacon", emoji: "🥓" },
  { name: "Noodles", emoji: "🍜" },
  { name: "Hamburgers", emoji: "🍔" },
  { name: "Pizza", emoji: "🍕" }
];

ReactDOM.render(
  <main className="container">
    <Heading />
    <ul className="food-list">
      {foods.map(f => (
        <li key={f.name} className="food-item">
          <span className="food-emoji" aria-hidden>
            {f.emoji}
          </span>{" "}
          <span className="food-name">{f.name}</span>
        </li>
      ))}
    </ul>
  </main>,
  document.getElementById("root")
);

// If you're running this locally in VS Code use the commands:
// npm install
// to install the node modules and
// npm run dev
// to launch your react project in your browser
