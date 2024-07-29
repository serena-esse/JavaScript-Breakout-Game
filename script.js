const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const paddleWidth = 100;
const paddleHeight = 10;
const ballRadius = 10;
const initialBallSpeed = 4;
const speedIncrease = 0.5;
const blockRowCount = 5;
const blockColumnCount = 7;
const blockWidth = 75;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 30;
const blockOffsetLeft = 35;

let playerScore = 0;
let level = 1;
let blocks = [];
let isPaused = false;

const collisionSound = new Audio("collision.mp3");
const scoreSound = new Audio("score.mp3");
const powerUpSound = new Audio("powerup.mp3");

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomPower() {
  const powers = [null, "flame", "double_power", "speed"];
  return powers[Math.floor(Math.random() * powers.length)];
}

function initBlocks() {
  blocks = [];
  for (let c = 0; c < blockColumnCount; c++) {
    blocks[c] = [];
    for (let r = 0; r < blockRowCount; r++) {
      const x = c * (blockWidth + blockPadding) + blockOffsetLeft;
      const y = r * (blockHeight + blockPadding) + blockOffsetTop;
      blocks[c][r] = {
        x,
        y,
        width: blockWidth,
        height: blockHeight,
        status: 1,
        color: getRandomColor(),
        power: getRandomPower(),
      };
    }
  }
}

let playerPaddle = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - paddleHeight - 10,
  width: paddleWidth,
  height: paddleHeight,
  dx: 0,
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  dx: initialBallSpeed,
  dy: -initialBallSpeed,
};

function draw3DRect(x, y, width, height, color = "#fff") {
  const lightColor = shadeColor(color, 20);
  const darkColor = shadeColor(color, -20);

  context.fillStyle = color;
  context.fillRect(x, y, width, height);

  context.fillStyle = darkColor;
  context.beginPath();
  context.moveTo(x + width, y);
  context.lineTo(x + width, y + height);
  context.lineTo(x + width - 10, y + height - 10);
  context.lineTo(x + width - 10, y - 10);
  context.closePath();
  context.fill();

  context.fillStyle = lightColor;
  context.beginPath();
  context.moveTo(x, y + height);
  context.lineTo(x + width, y + height);
  context.lineTo(x + width - 10, y + height - 10);
  context.lineTo(x - 10, y + height - 10);
  context.closePath();
  context.fill();
}

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

function drawCircle(x, y, radius) {
  context.fillStyle = "#fff";
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.closePath();
  context.fill();
}

function drawText(text, x, y) {
  context.fillStyle = "#fff";
  context.font = "24px Arial";
  context.fillText(text, x, y);
}

function drawBlocks() {
  for (let c = 0; c < blockColumnCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      const block = blocks[c][r];
      if (block.status === 1) {
        draw3DRect(block.x, block.y, block.width, block.height, block.color);
      }
    }
  }
}

function movePaddle() {
  playerPaddle.x += playerPaddle.dx;
  if (playerPaddle.x < 0) {
    playerPaddle.x = 0;
  } else if (playerPaddle.x + playerPaddle.width > canvas.width) {
    playerPaddle.x = canvas.width - playerPaddle.width;
  }
}

function activatePower(power) {
  if (power === "flame") {
    ball.color = "red";
    setTimeout(() => (ball.color = "#fff"), 5000);
  } else if (power === "double_power") {
    ball.dx *= 2;
    ball.dy *= 2;
    setTimeout(() => {
      ball.dx /= 2;
      ball.dy /= 2;
    }, 5000);
  } else if (power === "speed") {
    ball.dx *= 1.5;
    ball.dy *= 1.5;
    setTimeout(() => {
      ball.dx /= 1.5;
      ball.dy /= 1.5;
    }, 5000);
  }
  powerUpSound.play();
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
    collisionSound.play();
  }
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
    collisionSound.play();
  }

  if (
    ball.y + ball.radius > playerPaddle.y &&
    ball.x > playerPaddle.x &&
    ball.x < playerPaddle.x + playerPaddle.width
  ) {
    ball.dy *= -1;
    ball.dy += speedIncrease * Math.sign(ball.dy);
    ball.dx += speedIncrease * Math.sign(ball.dx);
    collisionSound.play();
  }

  for (let c = 0; c < blockColumnCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      const block = blocks[c][r];
      if (block.status === 1) {
        if (ball.x > block.x && ball.x < block.x + block.width && ball.y > block.y && ball.y < block.y + block.height) {
          ball.dy *= -1;
          block.status = 0;
          playerScore++;
          scoreSound.play();

          if (block.power) {
            activatePower(block.power);
          }

          anime({
            targets: block,
            width: 0,
            height: 0,
            duration: 500,
            easing: "easeInOutQuad",
          });
        }
      }
    }
  }

  if (ball.y + ball.radius > canvas.height) {
    resetBall();
  }

  if (blocks.flat().every((block) => block.status === 0)) {
    nextLevel();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = initialBallSpeed * Math.sign(ball.dx);
  ball.dy = -initialBallSpeed * Math.sign(ball.dy);
}

function nextLevel() {
  level++;
  initialBallSpeed += 1;
  initBlocks();
  resetBall();
}

function update() {
  if (!isPaused) {
    movePaddle();
    moveBall();
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  draw3DRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, "#fff");
  drawCircle(ball.x, ball.y, ball.radius);
  drawText(`Score: ${playerScore}`, 10, 20);
  drawText(`Level: ${level}`, canvas.width - 100, 20);
  drawBlocks();
  if (isPaused) {
    drawText("Paused", canvas.width / 2 - 50, canvas.height / 2);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    playerPaddle.dx = -20; // Increased paddle speed
  } else if (event.key === "ArrowRight") {
    playerPaddle.dx = 20; // Increased paddle speed
  } else if (event.key === " ") {
    isPaused = !isPaused;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    playerPaddle.dx = 0;
  }
});

document.getElementById("saveGame").addEventListener("click", () => {
  const gameState = {
    playerScore,
    level,
    blocks,
    playerPaddle,
    ball,
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
  alert("Game Saved!");
});

document.getElementById("loadGame").addEventListener("click", () => {
  const savedState = JSON.parse(localStorage.getItem("gameState"));
  if (savedState) {
    playerScore = savedState.playerScore;
    level = savedState.level;
    blocks = savedState.blocks;
    playerPaddle = savedState.playerPaddle;
    ball = savedState.ball;
    alert("Game Loaded!");
  } else {
    alert("No saved game found.");
  }
});

initBlocks();
gameLoop();
