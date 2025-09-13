// 游戏配置
const config = {
    gridSize: 20, // 网格大小
    initialSnakeLength: 3, // 初始蛇的长度
    initialSpeed: 150, // 初始速度（毫秒）
    speedIncrement: 2, // 每吃一个食物增加的速度
    foodColor: '#FF4136', // 食物颜色
    snakeHeadColor: '#2ECC40', // 蛇头颜色
    snakeBodyColor: '#3D9970', // 蛇身颜色
    backgroundColor: '#222', // 背景颜色
    gridColor: '#333', // 网格颜色
};

// 游戏状态
const gameState = {
    snake: [], // 蛇的身体部分，每个元素是 {x, y} 坐标
    food: null, // 食物位置 {x, y}
    direction: 'right', // 当前方向: 'up', 'down', 'left', 'right'
    nextDirection: 'right', // 下一个方向
    score: 0, // 分数
    speed: config.initialSpeed, // 当前速度
    gameInterval: null, // 游戏循环间隔
    isRunning: false, // 游戏是否运行中
    isPaused: false, // 游戏是否暂停
    gameOver: false, // 游戏是否结束
};

// DOM 元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');

// 计算单元格大小
const cellSize = canvas.width / config.gridSize;

// 初始化游戏
function initGame() {
    // 创建蛇
    gameState.snake = [];
    for (let i = 0; i < config.initialSnakeLength; i++) {
        gameState.snake.push({
            x: Math.floor(config.gridSize / 2) - i,
            y: Math.floor(config.gridSize / 2)
        });
    }
    
    // 生成第一个食物
    generateFood();
    
    // 重置游戏状态
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    gameState.score = 0;
    gameState.speed = config.initialSpeed;
    gameState.gameOver = false;
    gameState.isRunning = false;
    gameState.isPaused = false;
    
    // 更新分数显示
    updateScore();
    
    // 绘制初始状态
    draw();
}

// 开始游戏
function startGame() {
    if (gameState.gameOver) {
        initGame();
    }
    
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameState.isPaused = false;
        gameState.gameInterval = setInterval(gameLoop, gameState.speed);
        pauseButton.textContent = '暂停';
        startButton.textContent = '游戏进行中';
        startButton.disabled = true;
    }
}

// 暂停游戏
function togglePause() {
    if (!gameState.isRunning || gameState.gameOver) return;
    
    if (gameState.isPaused) {
        // 恢复游戏
        gameState.isPaused = false;
        gameState.gameInterval = setInterval(gameLoop, gameState.speed);
        pauseButton.textContent = '暂停';
    } else {
        // 暂停游戏
        gameState.isPaused = true;
        clearInterval(gameState.gameInterval);
        pauseButton.textContent = '继续';
        
        // 在画布上显示暂停文本
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameState.gameInterval);
    initGame();
    startButton.disabled = false;
    startButton.textContent = '开始游戏';
}

// 游戏主循环
function gameLoop() {
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    if (checkFood()) {
        eatFood();
    }
    
    // 绘制游戏
    draw();
}

// 移动蛇
function moveSnake() {
    // 更新方向
    gameState.direction = gameState.nextDirection;
    
    // 根据当前方向计算新的头部位置
    const head = {...gameState.snake[0]};
    
    switch (gameState.direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 将新头部添加到蛇身体的前面
    gameState.snake.unshift(head);
    
    // 如果没有吃到食物，移除尾部；否则，在eatFood函数中处理
    if (!isEatingFood()) {
        gameState.snake.pop();
    }
}

// 检查是否吃到食物
function isEatingFood() {
    const head = gameState.snake[0];
    return head.x === gameState.food.x && head.y === gameState.food.y;
}

// 检查碰撞（墙壁或自身）
function checkCollision() {
    const head = gameState.snake[0];
    
    // 检查墙壁碰撞
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= config.gridSize ||
        head.y >= config.gridSize
    ) {
        return true;
    }
    
    // 检查自身碰撞（从第二个身体部分开始检查）
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    const head = gameState.snake[0];
    return head.x === gameState.food.x && head.y === gameState.food.y;
}

// 吃食物
function eatFood() {
    // 增加分数
    gameState.score += 10;
    updateScore();
    
    // 生成新食物
    generateFood();
    
    // 增加速度
    if (gameState.speed > 50) { // 设置最小速度限制
        gameState.speed -= config.speedIncrement;
        clearInterval(gameState.gameInterval);
        gameState.gameInterval = setInterval(gameLoop, gameState.speed);
    }
}

// 生成食物
function generateFood() {
    // 创建一个可能的食物位置列表（排除蛇身体占据的位置）
    const availablePositions = [];
    
    for (let x = 0; x < config.gridSize; x++) {
        for (let y = 0; y < config.gridSize; y++) {
            // 检查该位置是否被蛇占据
            let isOccupied = false;
            for (const segment of gameState.snake) {
                if (segment.x === x && segment.y === y) {
                    isOccupied = true;
                    break;
                }
            }
            
            if (!isOccupied) {
                availablePositions.push({x, y});
            }
        }
    }
    
    // 从可用位置中随机选择一个作为食物
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        gameState.food = availablePositions[randomIndex];
    } else {
        // 如果没有可用位置（蛇占满了整个网格），游戏胜利
        gameOver(true);
    }
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = gameState.score;
}

// 游戏结束
function gameOver(isWin = false) {
    clearInterval(gameState.gameInterval);
    gameState.isRunning = false;
    gameState.gameOver = true;
    
    // 绘制游戏结束画面
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    
    if (isWin) {
        ctx.fillText('恭喜你赢了!', canvas.width / 2, canvas.height / 2 - 30);
    } else {
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
    }
    
    ctx.font = '18px Arial';
    ctx.fillText(`最终分数: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('按"重新开始"按钮再玩一次', canvas.width / 2, canvas.height / 2 + 40);
    
    startButton.disabled = false;
    startButton.textContent = '开始游戏';
}

// 绘制游戏
function draw() {
    // 清除画布
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格（可选）
    drawGrid();
    
    // 绘制食物
    drawFood();
    
    // 绘制蛇
    drawSnake();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= config.gridSize; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= config.gridSize; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(canvas.width, y * cellSize);
        ctx.stroke();
    }
}

// 绘制食物
function drawFood() {
    if (!gameState.food) return;
    
    ctx.fillStyle = config.foodColor;
    ctx.beginPath();
    const centerX = gameState.food.x * cellSize + cellSize / 2;
    const centerY = gameState.food.y * cellSize + cellSize / 2;
    const radius = cellSize / 2 * 0.8; // 食物稍小于单元格
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < gameState.snake.length; i++) {
        const segment = gameState.snake[i];
        ctx.fillStyle = config.snakeBodyColor;
        ctx.fillRect(
            segment.x * cellSize,
            segment.y * cellSize,
            cellSize,
            cellSize
        );
    }
    
    // 绘制蛇头（与身体颜色不同）
    const head = gameState.snake[0];
    ctx.fillStyle = config.snakeHeadColor;
    ctx.fillRect(
        head.x * cellSize,
        head.y * cellSize,
        cellSize,
        cellSize
    );
    
    // 添加眼睛（可选）
    ctx.fillStyle = 'white';
    const eyeSize = cellSize / 5;
    const eyeOffset = cellSize / 3;
    
    // 根据方向绘制眼睛
    switch (gameState.direction) {
        case 'up':
            ctx.fillRect(head.x * cellSize + eyeOffset, head.y * cellSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * cellSize + cellSize - eyeOffset - eyeSize, head.y * cellSize + eyeOffset, eyeSize, eyeSize);
            break;
        case 'down':
            ctx.fillRect(head.x * cellSize + eyeOffset, head.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            ctx.fillRect(head.x * cellSize + cellSize - eyeOffset - eyeSize, head.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
        case 'left':
            ctx.fillRect(head.x * cellSize + eyeOffset, head.y * cellSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * cellSize + eyeOffset, head.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
        case 'right':
            ctx.fillRect(head.x * cellSize + cellSize - eyeOffset - eyeSize, head.y * cellSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(head.x * cellSize + cellSize - eyeOffset - eyeSize, head.y * cellSize + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
            break;
    }
}

// 处理键盘输入
function handleKeydown(event) {
    // 如果游戏结束或暂停，不处理键盘输入
    if (gameState.gameOver || gameState.isPaused) return;
    
    // 如果游戏尚未开始，按任意方向键开始游戏
    if (!gameState.isRunning) {
        startGame();
    }
    
    // 根据按键设置下一个方向
    // 防止180度转弯（例如，向右移动时不能直接向左转）
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (gameState.direction !== 'down') {
                gameState.nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (gameState.direction !== 'up') {
                gameState.nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (gameState.direction !== 'right') {
                gameState.nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (gameState.direction !== 'left') {
                gameState.nextDirection = 'right';
            }
            break;
        case ' ': // 空格键暂停/继续
            togglePause();
            break;
    }
}

// 添加触摸控制（适用于移动设备）
function setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        event.preventDefault(); // 防止滚动
    }, false);
    
    canvas.addEventListener('touchmove', function(event) {
        event.preventDefault(); // 防止滚动
    }, false);
    
    canvas.addEventListener('touchend', function(event) {
        if (gameState.gameOver || gameState.isPaused) return;
        
        // 如果游戏尚未开始，开始游戏
        if (!gameState.isRunning) {
            startGame();
            return;
        }
        
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // 确定滑动方向（水平或垂直）
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0 && gameState.direction !== 'left') {
                gameState.nextDirection = 'right';
            } else if (deltaX < 0 && gameState.direction !== 'right') {
                gameState.nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (deltaY > 0 && gameState.direction !== 'up') {
                gameState.nextDirection = 'down';
            } else if (deltaY < 0 && gameState.direction !== 'down') {
                gameState.nextDirection = 'up';
            }
        }
        
        event.preventDefault();
    }, false);
}

// 事件监听器
document.addEventListener('keydown', handleKeydown);
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);

// 设置触摸控制
setupTouchControls();

// 初始化游戏
initGame();