'use strict';

// Simon Game - vanilla JS implementation
// Buttons have ids: green, red, yellow, blue
// Sounds are located in ./sounds/<color>.mp3 and wrong.mp3

const buttonColors = ["red", "blue", "green", "yellow"];

let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;

// Play a color sound or the wrong sound
function playSound(name) {
	try {
		const audio = new Audio(`sounds/${name}.mp3`);
		// Some browsers block autoplay; ignore play errors.
		// eslint-disable-next-line promise/catch-or-return
		audio.play().catch(() => {});
	} catch (_) {
		// no-op if Audio is unavailable
	}
}

// Briefly style a button as pressed
function animatePress(color) {
	const btn = document.getElementById(color);
	if (!btn) return;
	btn.classList.add('pressed');
	setTimeout(() => btn.classList.remove('pressed'), 100);
}

// Simple flash effect without jQuery
function flash(color) {
	const btn = document.getElementById(color);
	if (!btn) return;
	const prev = btn.style.opacity;
	btn.style.opacity = '0.1';
	setTimeout(() => {
		btn.style.opacity = prev || '1';
	}, 100);
}

function setLevelTitle(text) {
	const title = document.getElementById('level-title');
	if (title) title.textContent = text;
}

// Generate the next step in the sequence
function nextSequence() {
	userClickedPattern = [];
	level += 1;
	setLevelTitle(`Level ${level}`);

	const randomNumber = Math.floor(Math.random() * 4);
	const randomChosenColor = buttonColors[randomNumber];
	gamePattern.push(randomChosenColor);

	// Indicate the newly added color
	setTimeout(() => {
		flash(randomChosenColor);
		playSound(randomChosenColor);
	}, 300);
}

// Check the user's input so far
function checkAnswer(currentIndex) {
	if (gamePattern[currentIndex] === userClickedPattern[currentIndex]) {
		// If the user has finished their turn for this level, queue the next
		if (userClickedPattern.length === gamePattern.length) {
			setTimeout(() => {
				nextSequence();
			}, 1000);
		}
	} else {
		// Wrong answer
		playSound('wrong');
		const body = document.body;
		if (body) {
			body.classList.add('game-over');
			setTimeout(() => body.classList.remove('game-over'), 200);
		}
		setLevelTitle('Game Over, Press Any Key to Restart');
		startOver();
	}
}

// Reset the game state
function startOver() {
	level = 0;
	gamePattern = [];
	started = false;
}

// Handle user clicking buttons
function setupButtonHandlers() {
	const buttons = document.querySelectorAll('.btn');
	buttons.forEach((btn) => {
		btn.addEventListener('click', function onClick() {
			if (!started) return; // ignore clicks until game starts
			const userChosenColor = this.id;
			userClickedPattern.push(userChosenColor);
			playSound(userChosenColor);
			animatePress(userChosenColor);
			checkAnswer(userClickedPattern.length - 1);
		});
	});
}

// Allow starting via keyboard or tapping the title (mobile-friendly)
function setupStartHandlers() {
	const start = () => {
		if (started) return;
		started = true;
		setLevelTitle('Level 0');
		nextSequence();
	};
	document.addEventListener('keydown', start);
	const title = document.getElementById('level-title');
	if (title) {
		title.addEventListener('click', start);
		title.addEventListener('touchstart', start, { passive: true });
	}
}

// Initialize once DOM is ready
function init() {
	setupButtonHandlers();
	setupStartHandlers();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

