const gridSize = 20;
const tileCount = 20;

let snake = [{ x: 10, y: 10 }];
let velocity = { x: 1, y: 0 };
let food = {};
let score = 0;

placeFood();
document.addEventListener('keydown', onKey);

function onKey(e) {
    switch (e.key) {
        case 'ArrowUp': if (velocity.y !== 1) velocity = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (velocity.y !== -1) velocity = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (velocity.x !== 1) velocity = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (velocity.x !== -1) velocity = { x: 1, y: 0 }; break;
    }
}

function placeFood() {
    do {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
    } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
}

function update() {
    const head = snake[0];
    const newHead = { x: head.x + velocity.x, y: head.y + velocity.y };
    newHead.x = (newHead.x + tileCount) % tileCount;
    newHead.y = (newHead.y + tileCount) % tileCount;

    if (snake.slice(1).some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        alert('游戏结束! 得分: ' + score);
        resetGame();
        return;
    }

    snake.unshift(newHead);
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }
}

function draw() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'lime';
    snake.forEach(seg => ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 2, gridSize - 2));

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('得分: ' + score, 10, canvas.height - 10);
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 1, y: 0 };
    score = 0;
    placeFood();
}

setInterval(() => {
    update();
    draw();
}, 100);
