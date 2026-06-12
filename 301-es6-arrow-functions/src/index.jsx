import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

ReactDOM.render(<App />, document.getElementById("root"));

// Example array
// const numbers = [3, 56, 2, 48, 5];

// Map - double each number
// const doubled = numbers.map(x => x * 2);

// Filter - keep numbers < 10
// const small = numbers.filter(num => num < 10);

// Reduce - sum all numbers (showing both verbose + concise forms)
// const sum = numbers.reduce((acc, cur) => acc + cur, 0);

// Find - first number > 10
// const firstLarge = numbers.find(num => num > 10);

// FindIndex - index of first number > 10
// const firstLargeIndex = numbers.findIndex(num => num > 10);

// If you're running this locally in VS Code use the commands:
// npm install
// to install the node modules and
// npm run dev
// to launch your react project in your browser
