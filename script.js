const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;
const aiSpeed = 4; // Velocità del paddle AI
const initialBallSpeed = 2; // Velocità iniziale della pallina
const speedIncrease = 0.5; // Incremento della velocità della pallina
const blockCount = 20; // Numero di blocchi iniziale
const blockWidth = 75;
const blockHeight = 20;

let playerScore = 0;
let aiScore = 0;
let level = 1;
let blocks = [];

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function initBlocks() {
  blocks = [];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const areaWidth = canvas.width / 2;
  const areaHeight = canvas.height / 2;

  for (let i = 0; i < blockCount; i++) {
    const x = centerX + Math.random() * areaWidth - areaWidth / 2;
    const y = centerY + Math.random() * areaHeight - areaHeight / 2;
    const color = getRandomColor();
    blocks.push({ x, y, width: blockWidth, height: blockHeight, status: 1, color: color });
  }
}

let playerPaddle = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0,
};

let aiPaddle = {
  x: canvas.width - paddleWidth - 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0,
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  dx: initialBallSpeed,
  dy: -initialBallSpeed,
};

function drawRect(x, y, width, height, color = "#fff") {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
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
  context.font = "48px Arial";
  context.fillText(text, x, y);
}

function drawBlocks() {
  for (let block of blocks) {
    if (block.status === 1) {
      drawRect(block.x, block.y, block.width, block.height, block.color);
    }
  }
}

function movePaddle(paddle) {
  paddle.y += paddle.dy;
  if (paddle.y < 0) {
    paddle.y = 0;
  } else if (paddle.y + paddle.height > canvas.height) {
    paddle.y = canvas.height - paddle.height;
  }
}

function moveAIPaddle() {
  if (ball.y < aiPaddle.y + aiPaddle.height / 2) {
    aiPaddle.dy = -aiSpeed;
  } else if (ball.y > aiPaddle.y + aiPaddle.height / 2) {
    aiPaddle.dy = aiSpeed;
  } else {
    aiPaddle.dy = 0;
  }
  movePaddle(aiPaddle);
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Collisione con i muri superiore e inferiore
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Collisione con i paddle
  if (
    ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
    ball.y > playerPaddle.y &&
    ball.y < playerPaddle.y + playerPaddle.height
  ) {
    ball.dx *= -1;
    ball.dx += speedIncrease * Math.sign(ball.dx);
    ball.dy += speedIncrease * Math.sign(ball.dy);
  } else if (ball.x + ball.radius > aiPaddle.x && ball.y > aiPaddle.y && ball.y < aiPaddle.y + aiPaddle.height) {
    ball.dx *= -1;
    ball.dx += speedIncrease * Math.sign(ball.dx);
    ball.dy += speedIncrease * Math.sign(ball.dy);
  }

  // Collisione con i blocchi
  for (let block of blocks) {
    if (block.status === 1) {
      if (ball.x > block.x && ball.x < block.x + block.width && ball.y > block.y && ball.y < block.y + block.height) {
        ball.dy *= -1;
        block.status = 0;
      }
    }
  }

  // Reset palla se esce dai limiti e aggiornamento punteggio
  if (ball.x + ball.radius > canvas.width) {
    playerScore++;
    resetBall();
  } else if (ball.x - ball.radius < 0) {
    aiScore++;
    resetBall();
  }

  // Controlla se tutti i blocchi sono stati distrutti
  if (blocks.every((block) => block.status === 0)) {
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
  initialBallSpeed += 1; // Aumenta la velocità della pallina
  initBlocks(); // Reinizializza i blocchi
  resetBall(); // Resetta la posizione della pallina
}

function update() {
  movePaddle(playerPaddle);
  moveAIPaddle();
  moveBall();
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
  drawRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
  drawCircle(ball.x, ball.y, ball.radius);
  drawText(playerScore, canvas.width / 4, 50);
  drawText(aiScore, (3 * canvas.width) / 4, 50);
  drawText(`Level: ${level}`, canvas.width / 2 - 50, 50);
  drawBlocks();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    playerPaddle.dy = -5;
  } else if (event.key === "ArrowDown") {
    playerPaddle.dy = 5;
  }
});

document.addEventListener("keyup", () => {
  playerPaddle.dy = 0;
});

initBlocks();
gameLoop();
