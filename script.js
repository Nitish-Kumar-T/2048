const grid = document.getElementById('grid');
const scoreDisplay = document.querySelector('#score span');
const newGameButton = document.getElementById('new-game');

let board = [];
let score = 0;

function initializeGame() {
    board = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    scoreDisplay.textContent = score;
    addNewTile();
    addNewTile();
    updateGrid();
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
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
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = board[i][j] || '';
            if (board[i][j] > 0) {
                cell.style.backgroundColor = getTileColor(board[i][j]);
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
        while (newRow.length < 4) {
            newRow.push(0);
        }
        return newRow;
    }

    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            const row = newBoard[i];
            const newRow = direction === 'left' ? shiftTiles(row) : shiftTiles(row.reverse()).reverse();
            if (JSON.stringify(newBoard[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            newBoard[i] = newRow;
        }
    } else {
        for (let j = 0; j < 4; j++) {
            const column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
            const newColumn = direction === 'up' ? shiftTiles(column) : shiftTiles(column.reverse()).reverse();
            if (JSON.stringify([newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]]) !== JSON.stringify(newColumn)) {
                moved = true;
            }
            for (let i = 0; i < 4; i++) {
                newBoard[i][j] = newColumn[i];
            }
        }
    }

    if (moved) {
        board = newBoard;
        addNewTile();
        updateGrid();
        scoreDisplay.textContent = score;
        if (isGameOver()) {
            alert('Game Over!');
        }
    }
}

function isGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                return false;
            }
            if (i < 3 && board[i][j] === board[i + 1][j]) {
                return false;
            }
            if (j < 3 && board[i][j] === board[i][j + 1]) {
                return false;
            }
        }
    }
    return true;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
});

newGameButton.addEventListener('click', initializeGame);

initializeGame();