// Game Elements
let dino = document.getElementById("dino");
let obstacle = document.getElementById("obstacle");
let scoreDisplay = document.getElementById("score");
let highScoreDisplay = document.getElementById("highScore");
let gameOverOverlay = document.getElementById("gameOverOverlay");
let finalScoreDisplay = document.getElementById("finalScore");
let highScoreGameOverDisplay = document.getElementById("highScoreDisplay");
let restartBtn = document.getElementById("restartBtn");
let startScreen = document.getElementById("startScreen");
let startBtn = document.getElementById("startBtn");
let cloudsContainer = document.getElementById("cloudsContainer");


let isJumping = false;
let gravity = 7.5;
let score = 0;
let gameOver = false;
let gameStarted = false;
let obstacleInterval = null;
let cloudIntervals = [];
let obstacleSpeed = 7;
let baseSpeed = 7;
let gameRunning = false;

let highScore = parseInt(localStorage.getItem("dinoHighScore")) || 0;
highScoreDisplay.innerText = "High Score: " + highScore;


dino.style.bottom = "40%";


startBtn.addEventListener("click", startGame);

function startGame() {
    startScreen.classList.add("hidden");
    gameStarted = true;
    gameRunning = true;
    moveObstacle();
    createClouds();
}

// Jump Function
function jump() {
    if (isJumping || !gameRunning || gameOver) return;
    let position = 0;
    isJumping = true;

    let upInterval = setInterval(() => {
        if (position >= 150) {
            clearInterval(upInterval);
            let downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                    position = 0;
                    dino.style.bottom = "40%"; // Ensure it rests exactly at 40%
                } else {
                    position -= gravity;
                    // Clamp position to 0 to prevent sinking below ground
                    if (position < 0) position = 0;
                    dino.style.bottom = (40 + position) + "%";
                }
            }, 15);
        } else {
            position += gravity;
            dino.style.bottom = (40 + position) + "%";
        }
    }, 15);
}


document.addEventListener("keydown", function (event) {
    if ((event.code === "Space" || event.code === "ArrowUp") && !gameOver) {
        if (!gameStarted) {
            startGame();
        } else if (gameRunning) {
            jump();
        }
        event.preventDefault();
    }
});

function createClouds() {

    for (let i = 0; i < 5; i++) {
        createCloud(Math.random() * 900, Math.random() * 150 + 20);
    }


    setInterval(() => {
        if (gameRunning && !gameOver) {
            createCloud(900, Math.random() * 150 + 20);
        }
    }, 3000);
}

function createCloud(x, y) {
    const cloud = document.createElement("div");
    cloud.className = "cloud";

    const size = Math.random() * 30 + 50;
    cloud.style.width = size + "px";
    cloud.style.height = size * 0.4 + "px";
    cloud.style.left = x + "px";
    cloud.style.top = y + "%";


    const cloudType = Math.floor(Math.random() * 3) + 1;
    cloud.classList.add("cloud" + cloudType);

    cloudsContainer.appendChild(cloud);

    let cloudPosition = x;
    const cloudSpeed = Math.random() * 2 + 1;

    const cloudInterval = setInterval(() => {
        if (!gameRunning || gameOver) {
            clearInterval(cloudInterval);
            return;
        }

        cloudPosition -= cloudSpeed;
        cloud.style.left = cloudPosition + "px";

        if (cloudPosition < -200) {
            cloud.remove();
            clearInterval(cloudInterval);
        }
    }, 20);

    cloudIntervals.push(cloudInterval);
}

function moveObstacle() {
    let obstaclePosition = 900;

    obstacleInterval = setInterval(() => {
        if (gameOver || !gameRunning) {
            clearInterval(obstacleInterval);
            return;
        }

        obstacleSpeed = baseSpeed + Math.floor(score / 10) * 0.5;

        if (obstaclePosition <= -100) {
            obstaclePosition = 900;
            score++;
            scoreDisplay.innerText = "Score: " + score;


            if (score > highScore) {
                highScore = score;
                highScoreDisplay.innerText = "High Score: " + highScore;
                localStorage.setItem("dinoHighScore", highScore);
            }
        }

        obstaclePosition -= obstacleSpeed;
        obstacle.style.right = (900 - obstaclePosition) + "px";

        const dinoRect = dino.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();


        if (
            dinoRect.right > obstacleRect.left + 10 &&
            dinoRect.left < obstacleRect.right - 10 &&
            dinoRect.bottom > obstacleRect.top + 10 &&
            dinoRect.top < obstacleRect.bottom - 10
        ) {
            endGame();
        }
    }, 20);
}


function endGame() {
    if (gameOver) return;

    gameOver = true;
    gameRunning = false;


    if (obstacleInterval) {
        clearInterval(obstacleInterval);
    }

    cloudIntervals.forEach(interval => clearInterval(interval));
    cloudIntervals = [];


    finalScoreDisplay.innerText = score;
    highScoreGameOverDisplay.innerText = highScore;


    gameOverOverlay.classList.add("show");
}

restartBtn.addEventListener("click", restartGame);

function restartGame() {

    gameOver = false;
    gameRunning = false;
    score = 0;
    obstacleSpeed = baseSpeed;
    isJumping = false;


    scoreDisplay.innerText = "Score: 0";
    gameOverOverlay.classList.remove("show");

    dino.style.bottom = "40%";
    obstacle.style.right = "0px";


    if (obstacleInterval) {
        clearInterval(obstacleInterval);
    }

    cloudIntervals.forEach(interval => clearInterval(interval));
    cloudIntervals = [];


    cloudsContainer.innerHTML = "";

    gameRunning = true;
    moveObstacle();
    createClouds();
}
