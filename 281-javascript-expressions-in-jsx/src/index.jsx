import React from "react";
import ReactDOM from "react-dom";

// Define the requested constants
const name = "Kyle";
const number = 7;

// Render a sentence that uses the JavaScript constants inside JSX
ReactDOM.render(
	<div>
		<h1>My name is {name} and my lucky number is {number}.</h1>
	</div>,
	document.getElementById("root")
);

// If you're running this locally in VS Code use the commands:
// npm install
// to install the node modules and
// npm run dev
// to launch your react project in your browser
