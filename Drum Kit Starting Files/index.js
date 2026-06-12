// Add listeners so each button plays its corresponding sound
var buttons = document.querySelectorAll("button.drum");

for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
        var key = this.innerHTML.toLowerCase();
        playSound(key);
        buttonAnimation(key);
    });
}

// Optional: support keyboard keys
document.addEventListener("keydown", function (event) {
    var key = event.key.toLowerCase();
    playSound(key);
    buttonAnimation(key);
});

function playSound(key) {
    var src;
    switch (key) {
        case "w":
            src = "sounds/crash.mp3";
            break;
        case "a":
            src = "sounds/kick-bass.mp3";
            break;
        case "s":
            src = "sounds/snare.mp3";
            break;
        case "d":
            src = "sounds/tom-1.mp3";
            break;
        case "j":
            src = "sounds/tom-2.mp3";
            break;
        case "k":
            src = "sounds/tom-3.mp3";
            break;
        case "l":
            src = "sounds/tom-4.mp3";
            break;
        default:
            return; // ignore other keys
    }
    var audio = new Audio(src);
    audio.currentTime = 0;
    audio.play();
}

function buttonAnimation(key) {
    var activeButton = document.querySelector("." + key);
    if (!activeButton) return;
    activeButton.classList.add("pressed");
    setTimeout(function () {
        activeButton.classList.remove("pressed");
    }, 100);
}
