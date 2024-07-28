const grid = document.getElementById('grid');
const scoreDisplay = document.querySelector('#score span');
const bestScoreDisplay = document.querySelector('#best-score span');
const newGameButton = document.getElementById('new-game');
const undoButton = document.getElementById('undo');
const themeToggleButton = document.getElementById('theme-toggle');
const gridSizeSelect = document.getElementById('grid-size');

let board = [];
let score = 0;
let bestScore = 0;
let gridSize = 4;
let history = [];

function initializeGame() {
    gridSize = parseInt(gridSizeSelect.value);
    board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    score = 0;
    history = [];
    updateScore();
    addNewTile();
    addNewTile();
    updateGrid();
    saveGameState();
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({row: i, col: j});
            }
        }
    }
    if (emptyTiles.length > 0) {
        const {row, col} = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateGrid() {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, ${400 / gridSize}px)`;
    grid.style.gridTemplateRows = `repeat(${gridSize}, ${400 / gridSize}px)`;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = board[i][j] || '';
            if (board[i][j] > 0) {
                cell.style.backgroundColor = getTileColor(board[i][j]);
                cell.style.color = board[i][j] <= 4 ? '#776e65' : '#f9f6f2';
            }
            grid.appendChild(cell);
        }
    }
}

function getTileColor(value) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
}

function move(direction) {
    const oldBoard = JSON.parse(JSON.stringify(board));
    const oldScore = score;

    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function shiftTiles(row) {
        const filteredRow = row.filter(tile => tile !== 0);
        for (let i = 0; i < filteredRow.length - 1; i++) {
            if (filteredRow[i] === filteredRow[i + 1]) {
                filteredRow[i] *= 2;
                score += filteredRow[i];
                filteredRow[i + 1] = 0;
                moved = true;
            }
        }
        const newRow = filteredRow.filter(tile => tile !== 0);
        while (newRow.length < gridSize) {
            newRow.push(0);
        }
        return newRow;
    }

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < gridSize; i++) {
            const row = newBoard[i];
            const newRow = direction === 'left' ? shiftTiles(row) : shiftTiles(row.reverse()).reverse();
            if (JSON.stringify(newBoard[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            newBoard[i] = newRow;
        }
    } else {
        for (let j = 0; j < gridSize; j++) {
            const column = newBoard.map(row => row[j]);
            const newColumn = direction === 'up' ? shiftTiles(column) : shiftTiles(column.reverse()).reverse();
            if (JSON.stringify(newBoard.map(row => row[j])) !== JSON.stringify(newColumn)) {
                moved = true;
            }
            for (let i = 0; i < gridSize; i++) {
                newBoard[i][j] = newColumn[i];
            }
        }
    }

    if (moved) {
        history.push({board: oldBoard, score: oldScore});
        board = newBoard;
        addNewTile();
        updateGrid();
        updateScore();
        saveGameState();
        if (isGameWon()) {
            alert('Congratulations! You won!');
        } else if (isGameOver()) {
            alert('Game Over!');
        }
    }
}

function updateScore() {
    scoreDisplay.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestScoreDisplay.textContent = bestScore;
        localStorage.setItem('bestScore', bestScore);
    }
}

function isGameWon() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 2048) {
                return true;
            }
        }
    }
    return false;
}

function isGameOver() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) {
                return false;
            }
            if (i < gridSize - 1 && board[i][j] === board[i + 1][j]) {
                return false;
            }
            if (j < gridSize - 1 && board[i][j] === board[i][j + 1]) {
                return false;
            }
        }
    }
    return true;
}

function undo() {
    if (history.length > 0) {
        const lastState = history.pop();
        board = lastState.board;
        score = lastState.score;
        updateGrid();
        updateScore();
        saveGameState();
    }
}

function saveGameState() {
    const gameState = {
        board: board,
        score: score,
        bestScore: bestScore,
        gridSize: gridSize
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        board = gameState.board;
        score = gameState.score;
        bestScore = gameState.bestScore;
        gridSize = gameState.gridSize;
        gridSizeSelect.value = gridSize;
        updateGrid();
        updateScore();
    } else {
        initializeGame();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
});

newGameButton.addEventListener('click', initializeGame);
undoButton.addEventListener('click', undo);
themeToggleButton.addEventListener('click', toggleTheme);
gridSizeSelect.addEventListener('change', initializeGame);

let touchStartX, touchStartY;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) move('right');
        else move('left');
    } else {
        if (dy > 0) move('down');
        else move('up');
    }
});

bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
bestScoreDisplay.textContent = bestScore;

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

loadGameState();