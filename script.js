
let dino = document.getElementById("dino");
let obstacle = document.getElementById("obstacle");
let scoreDisplay = document.getElementById("score");
let isJumping = false;
let gravity = 7.5;
let score = 0;
let gameOver = false;

function jump() {
    if (isJumping) return;
    let position = 0;
    isJumping = true;

    let upInterval = setInterval(() => {
        if (position >= 150) {
            clearInterval(upInterval);
            let downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                }
                position -= gravity;
                dino.style.bottom = position + "px";
            }, 15);
        }
        position += gravity;
        dino.style.bottom = position + "px";
    }, 15);
}

document.addEventListener("keydown", function (event) {
    if ((event.code === "Space" || event.code === "ArrowUp") && !gameOver) {
        jump();
    }
});

function moveObstacle() {
    let obstaclePosition = 900;
    let obstacleInterval = setInterval(() => {
        if (obstaclePosition <= 0) {
            obstaclePosition = 900;
            score++;
            scoreDisplay.innerText = "Score: " + score;
        }
        obstaclePosition -= 7;
        obstacle.style.right = (900 - obstaclePosition) + "px";

        if (obstaclePosition < 90 && obstaclePosition > 50 && parseInt(dino.style.bottom) < 40) {
            clearInterval(obstacleInterval);
            alert("Game Over! Final Score: " + score);
            gameOver = true;
        }
    }, 20);
}
moveObstacle();