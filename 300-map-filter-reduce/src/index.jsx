import React from "react";
import ReactDOM from "react-dom";
import emojipedia from "./emojipedia";

// Base data
const numbers = [3, 56, 2, 48, 5];

// 1. MAP
// Double each number
const doubled = numbers.map(n => n * 2);

// Pull first 100 chars of each meaning from emojipedia
const clippedMeanings = emojipedia.map(e => e.meaning.substring(0, 100));

// 2. FILTER
// Keep numbers less than 10
const smallNumbers = numbers.filter(n => n < 10);

// 3. REDUCE
// Sum of all numbers
const sum = numbers.reduce((acc, cur) => acc + cur, 0);

// 4. FIND
// First number greater than 10
const firstBig = numbers.find(n => n > 10);

// 5. FIND INDEX
const firstBigIndex = numbers.findIndex(n => n > 10);

// 6. Another REDUCE example: Total char count of all emoji meanings
const totalMeaningCharacters = emojipedia.reduce((total, item) => total + item.meaning.length, 0);

console.group("Numbers operations");
console.log("Original:   ", numbers);
console.log("Doubled:    ", doubled);
console.log("Filtered (<10):", smallNumbers);
console.log("Sum:        ", sum);
console.log("First >10:  ", firstBig, "at index", firstBigIndex);
console.groupEnd();
console.group("Emojipedia operations");
console.log("Clipped meanings (100 chars each):", clippedMeanings);
console.log("Total meaning characters:", totalMeaningCharacters);
console.groupEnd();

function OperationList() {
	return (
		<main style={{ fontFamily: "Montserrat, sans-serif", padding: "1.5rem", lineHeight: 1.4 }}>
			<h1>map / filter / reduce (plus find & findIndex)</h1>
			<section>
				<h2>Numbers</h2>
				<p><strong>Original:</strong> {numbers.join(", ")}</p>
				<p><strong>map (×2):</strong> {doubled.join(", ")}</p>
				<p><strong>filter (&lt;10):</strong> {smallNumbers.join(", ")}</p>
				<p><strong>reduce (sum):</strong> {sum}</p>
				<p><strong>find (&gt;10):</strong> {firstBig}</p>
				<p><strong>findIndex (&gt;10):</strong> {firstBigIndex}</p>
			</section>
			<section>
				<h2>Emojipedia Meanings (clipped with map)</h2>
				<ul>
					{clippedMeanings.map((text, i) => (
						<li key={i}>{text}...</li>
					))}
				</ul>
				<p><strong>Total characters across full meanings (reduce):</strong> {totalMeaningCharacters}</p>
			</section>
			<footer style={{ marginTop: "2rem", fontSize: ".8rem", opacity: .7 }}>
				Open the browser dev tools console to see raw arrays logged.
			</footer>
		</main>
	);
}

ReactDOM.render(<OperationList />, document.getElementById("root"));

// If you're running this locally in VS Code:
// 1. npm install
// 2. npm run dev
// Then open the shown localhost URL
