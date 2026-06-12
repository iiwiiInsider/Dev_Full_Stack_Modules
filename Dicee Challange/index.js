// Generate a random integer between 1 and 6
var randomNumber1 = Math.floor(Math.random() * 6) + 1;

// Build image path like ./images/dice1.png - ./images/dice6.png
var randomDiceImage = "dice" + randomNumber1 + ".png";
var randomImageSource = "./images/" + randomDiceImage;

// Update the left dice image
document.querySelector(".img1").setAttribute("src", randomImageSource);

// Generate a second random integer between 1 and 6 for the right dice
var randomNumber2 = Math.floor(Math.random() * 6) + 1;

// Build image path for right dice and update the image
var randomDiceImage2 = "dice" + randomNumber2 + ".png";
var randomImageSource2 = "./images/" + randomDiceImage2;
document.querySelector(".img2").setAttribute("src", randomImageSource2);

// Update heading to show the winner or a draw
var headingEl = document.querySelector("h1");
if (randomNumber1 > randomNumber2) {
	headingEl.textContent = "🚩 Player 1 Wins!";
} else if (randomNumber2 > randomNumber1) {
	headingEl.textContent = "Player 2 Wins! 🚩";
} else {
	headingEl.textContent = "Draw!";
}
