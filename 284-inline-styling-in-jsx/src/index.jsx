import React from "react";
import ReactDOM from "react-dom";

// Inline style object (JS camelCase property names, string or number values)
const headingStyle = {
	color: "purple",
	fontSize: "3rem",
	border: "3px solid #4b0082",
	padding: "0.75rem 1.25rem",
	borderRadius: "12px",
	textAlign: "center",
	background: "linear-gradient(135deg,#ffe9ff,#f3d1ff)",
	fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

// Dynamic inline style modification example (e.g. change color based on time)
const hour = new Date().getHours();
if (hour < 12) {
	headingStyle.color = "#d97706"; // morning amber
} else if (hour < 18) {
	headingStyle.color = "#2563eb"; // afternoon blue
} else {
	headingStyle.color = "#9333ea"; // evening purple
}

function App() {
	return (
		<div className="app-wrapper">
			<h1 style={headingStyle}>Inline Styling Demo</h1>
			<p className="tagline">This heading above is styled using a JavaScript object passed to the style prop.</p>
			<ul className="notes">
				<li>Property names use camelCase (e.g. backgroundColor, borderRadius).</li>
				<li>Values are usually strings; numbers imply px for some properties.</li>
				<li>You can compute / mutate the style object before rendering for dynamic effects.</li>
				<li>Use external CSS (like the list you are reading) for reusable / scalable styling.</li>
			</ul>
		</div>
	);
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you're running this locally in VS Code use the commands:
// npm install
// to install the node modules and
// npm run dev
// to launch your react project in your browser
