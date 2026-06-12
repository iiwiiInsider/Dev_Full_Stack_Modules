// If you're running this locally in VS Code use the commands:
// npm install (installs dependencies)
// npm run dev (starts the Vite dev server)

import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple example demonstrating JSX expressions
const firstName = 'Ada';
const lastName = 'Lovelace';
const currentYear = new Date().getFullYear();

function App() {
	return (
		<div style={styles.appWrapper}>
			<h1>Hello, JSX 👋</h1>
			<p>Author: {firstName + ' ' + lastName}</p>
			<p>Year: {currentYear}</p>
			<ul>
				<li>JSX lets you embed expressions: 2 + 3 = {2 + 3}</li>
				<li>Call functions inline: {(() => 'inline IIFE result')()}</li>
				<li>Use objects/arrays safely: {[1, 2, 3].map(n => <span key={n}>{n} </span>)}</li>
			</ul>
		</div>
	);
}

const styles = {
	appWrapper: {
		fontFamily: 'Montserrat, system-ui, sans-serif',
		padding: '2rem',
		lineHeight: 1.5,
	}
};

const container = document.getElementById('root');
createRoot(container).render(<App />);
