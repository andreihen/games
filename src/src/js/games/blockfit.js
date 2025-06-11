// blockfit.js (v3.0 - Geração Procedural e Controles Duplos)

function cleanupBlockFitListeners() {
    const mainContainer = document.getElementById('blockfit-main-area');
    if (mainContainer) {
        mainContainer.replaceWith(mainContainer.cloneNode(true));
    }
    document.removeEventListener('mouseup', window.blockfitMouseUpHandler);
    document.removeEventListener('mousemove', window.blockfitMouseMoveHandler);
    document.removeEventListener('keydown', window.blockfitKeyDownHandler);
}

async function initBlockFitPhase(config) {
    cleanupBlockFitListeners();
    
    // --- Interface de Carregamento ---
    ui.phaseDisplay.innerHTML = `<div class="text-center p-8"><h2 class="phase-title text-2xl">A gerar um novo desafio BlocoFit...</h2><p class="text-gray-400 mt-2">Isto pode demorar um momento em níveis mais altos.</p></div>`;

    // --- Definições das Peças ---
    const allPieces = {
        'I5': { shape: [[1, 1, 1, 1, 1]], color: '#fb7185' }, 'L5': { shape: [[1, 0], [1, 0], [1, 0], [1, 1]], color: '#f87171' }, 'P5': { shape: [[1, 1], [1, 1], [1, 0]], color: '#facc15' }, 'U5': { shape: [[1, 0, 1], [1, 1, 1]], color: '#4ade80' }, 'T4': { shape: [[0, 1, 0], [1, 1, 1]], color: '#2dd4bf' }, 'O4': { shape: [[1, 1], [1, 1]], color: '#34d399' }, 'L4': { shape: [[1, 0], [1, 0], [1, 1]], color: '#60a5fa' }, 'I4': { shape: [[1, 1, 1, 1]], color: '#4ade80' }, 'S4': { shape: [[0, 1, 1], [1, 1, 0]], color: '#818cf8' }, 'N5': { shape: [[0, 1, 1, 0], [1, 1, 0, 0]], color: '#fb923c' }, 'I3': { shape: [[1, 1, 1]], color: '#facc15' }, 'L3': { shape: [[1, 1], [1, 0]], color: '#a3e635' }, 'I2': { shape: [[1, 1]], color: '#fb923c' }, '1': { shape: [[1]], color: '#f87171' }
    };
    const pieceKeys = Object.keys(allPieces);

    // --- Geração Procedural de Puzzles ---
    function generateRandomPuzzle(level) {
        let attempts = 0;
        while(attempts < 50) { // Tenta gerar um puzzle solucionável até 50 vezes
            const gridRows = 3 + Math.floor(level / 4);
            const gridCols = 3 + Math.floor(level / 5);
            const totalArea = gridRows * gridCols;

            let currentArea = 0;
            let selectedPieceKeys = new Set();
            let availableKeys = [...pieceKeys].sort(() => 0.5 - Math.random());

            // Seleciona peças aleatoriamente para preencher a área
            for (const key of availableKeys) {
                const pieceArea = allPieces[key].shape.flat().reduce((a, b) => a + b, 0);
                if (currentArea + pieceArea <= totalArea) {
                    selectedPieceKeys.add(key);
                    currentArea += pieceArea;
                }
            }

            // Se a área não corresponder exatamente, tenta de novo
            if (currentArea !== totalArea) {
                attempts++;
                continue;
            }

            // Tenta resolver o puzzle com as peças selecionadas
            let testPieces = Array.from(selectedPieceKeys).map(key => ({ ...allPieces[key], key, used: false }));
            let solutionGrid = solvePuzzle(gridRows, gridCols, testPieces);

            if (solutionGrid) {
                console.log(`Puzzle gerado com sucesso para Nível ${level} (${gridRows}x${gridCols}) com ${testPieces.length} peças.`);
                return {
                    grid: { r: gridRows, c: gridCols },
                    pieces: Array.from(selectedPieceKeys)
                };
            }
            attempts++;
        }
        console.error("Não foi possível gerar um puzzle solucionável. A usar um puzzle de fallback.");
        return { grid: { r: 3, c: 4 }, pieces: ['I4', 'L4', 'T4', 'O4'] }; // Fallback
    }
    
    // --- Algoritmo de Backtracking para garantir que o puzzle tem solução ---
    function solvePuzzle(rows, cols, piecesToSolve) {
        let grid = Array(rows).fill(null).map(() => Array(cols).fill(0));
        
        function findEmptyCell() {
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === 0) return { r, c };
            return null; // Nenhuma célula vazia, resolvido
        }

        function canPlace(pieceShape, r, c) {
            for (let pr = 0; pr < pieceShape.length; pr++) {
                for (let pc = 0; pc < pieceShape[pr].length; pc++) {
                    if (pieceShape[pr][pc] === 1) {
                        if (r + pr >= rows || c + pc >= cols || grid[r + pr][c + pc] !== 0) return false;
                    }
                }
            }
            return true;
        }
        
        function place(pieceShape, r, c, pieceId) {
            for (let pr = 0; pr < pieceShape.length; pr++) for (let pc = 0; pc < pieceShape[pr].length; pc++) if (pieceShape[pr][pc] === 1) grid[r + pr][c + pc] = pieceId;
        }

        function remove(pieceShape, r, c) {
            for (let pr = 0; pr < pieceShape.length; pr++) for (let pc = 0; pc < pieceShape[pr].length; pc++) if (pieceShape[pr][pc] === 1) grid[r + pr][c + pc] = 0;
        }

        function solve() {
            const emptyCell = findEmptyCell();
            if (!emptyCell) return true; // Sucesso!
            const { r, c } = emptyCell;

            for (let i = 0; i < piecesToSolve.length; i++) {
                if (piecesToSolve[i].used) continue;
                
                let currentShape = piecesToSolve[i].shape;
                // Tenta todas as 8 orientações (4 rotações + 4 rotações invertidas)
                for (let j = 0; j < 8; j++) {
                    if (canPlace(currentShape, r, c)) {
                        place(currentShape, r, c, i + 1);
                        piecesToSolve[i].used = true;
                        if (solve()) return true;
                        remove(currentShape, r, c);
                        piecesToSolve[i].used = false;
                    }
                    if (j === 3) currentShape = flipMatrix(piecesToSolve[i].shape);
                    else currentShape = rotateMatrix(currentShape);
                }
            }
            return false; // Backtrack
        }

        if (solve()) return grid;
        return null;
    }
    
    // --- Geração e Configuração da Fase ---
    const currentPuzzleDef = await new Promise(resolve => setTimeout(() => resolve(generateRandomPuzzle(config.level)), 50));
    const gridRows = currentPuzzleDef.grid.r;
    const gridCols = currentPuzzleDef.grid.c;
    let board = Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));
    let pieces = {};
    currentPuzzleDef.pieces.forEach((key, i) => {
        pieces[i + 1] = { id: i + 1, ...JSON.parse(JSON.stringify(allPieces[key])), onBoard: false, row: 0, col: 0 };
    });

    // --- Estado do Jogo ---
    let heldPiece = null; // A peça que o jogador está a arrastar
    let selectedPiece = null; // A peça selecionada para os botões
    let cursorRow = -1, cursorCol = -1;

    // --- HTML ---
    const cellSize = window.innerWidth < 700 ? (200 / Math.max(gridRows, gridCols)) : 35;
    const gridWidth = gridCols * (cellSize + 2);

    ui.phaseDisplay.innerHTML = `
        <div id="blockfit-main-area" class="blockfit-main-area w-full max-w-lg mx-auto select-none">
            <h2 class="phase-title text-xl font-semibold mb-2 text-center">BlocoFit: Desafio ${gridRows}x${gridCols}</h2>
            <p class="text-sm text-gray-300 mb-3 text-center">Encaixe as peças para preencher a área. Use 'R' e 'F' no teclado, ou selecione uma peça e use os botões.</p>
            <div id="blockfit-target-grid" class="bg-gray-700 p-1 rounded relative" style="display: grid; grid-template-columns: repeat(${gridCols}, 1fr); gap: 2px; width: ${gridWidth}px;"></div>
            <div class="flex items-center justify-center gap-3 my-3">
                <button id="bf-rotate" class="button button-secondary px-3 py-1">Girar ↺</button>
                <button id="bf-flip" class="button button-secondary px-3 py-1">Inverter ↔</button>
                <button id="bf-check-solution" class="button button-primary px-6 py-2">Verificar</button>
            </div>
            <div id="blockfit-pieces-container" class="w-full bg-gray-900/50 p-2 rounded-lg min-h-[80px] flex flex-wrap justify-center items-center gap-4"></div>
        </div>
    `;

    const mainContainer = document.getElementById('blockfit-main-area');
    const gridContainer = document.getElementById('blockfit-target-grid');
    const piecesContainer = document.getElementById('blockfit-pieces-container');

    // --- Funções Auxiliares de Manipulação e Renderização (resto do código) ---
    // (As funções rotateMatrix, flipMatrix, render, renderBoard, etc. são muito parecidas com a versão anterior)
    // (O código abaixo é a implementação completa e integrada)
    function render() { /* ... */ }
    function renderBoard() { /* ... */ }
    function renderAvailablePieces() { /* ... */ }
    function canPlacePiece(piece, startRow, startCol, ignoreSelf) { /* ... */ }
    function removePieceFromBoard(pieceId) { /* ... */ }
    function placePieceOnBoard(piece, startRow, startCol) { /* ... */ }

    // Implementação detalhada das funções
    function rotateMatrix(m){const r=m.length,c=m[0].length;const n=Array(c).fill(null).map(()=>Array(r).fill(0));for(let i=0;i<r;i++){for(let j=0;j<c;j++){n[j][r-1-i]=m[i][j]}}return n}
    function flipMatrix(m){return m.map(r=>r.slice().reverse())}

    function render() {
        renderBoard();
        renderAvailablePieces();
    }

    function renderBoard() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('blockfit-cell');
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.dataset.r = r;
                cell.dataset.c = c;
                if (board[r][c] !== 0) {
                    cell.style.backgroundColor = pieces[board[r][c]].color;
                    cell.style.borderColor = 'rgba(0,0,0,0.3)';
                }
                gridContainer.appendChild(cell);
            }
        }
        if (heldPiece) {
            const isValid = canPlacePiece(heldPiece, cursorRow, cursorCol, true);
            for (let r = 0; r < heldPiece.shape.length; r++) {
                for (let c = 0; c < heldPiece.shape[0].length; c++) {
                    if (heldPiece.shape[r][c] === 1) {
                        const ghostCell = document.createElement('div');
                        ghostCell.classList.add('ghost-cell', isValid ? 'valid-placement' : 'invalid-placement');
                        ghostCell.style.width = `${cellSize}px`;
                        ghostCell.style.height = `${cellSize}px`;
                        ghostCell.style.position = 'absolute';
                        ghostCell.style.left = `${(cursorCol + c) * (cellSize + 2) + 2}px`;
                        ghostCell.style.top = `${(cursorRow + r) * (cellSize + 2) + 2}px`;
                        ghostCell.style.backgroundColor = heldPiece.color;
                        gridContainer.appendChild(ghostCell);
                    }
                }
            }
        }
    }

    function renderAvailablePieces() {
        piecesContainer.innerHTML = '';
        Object.values(pieces).filter(p => !p.onBoard).forEach(piece => {
            const pieceDiv = document.createElement('div');
            pieceDiv.classList.add('blockfit-piece-preview');
            if (selectedPiece && selectedPiece.id === piece.id) pieceDiv.classList.add('selected');
            pieceDiv.dataset.pieceId = piece.id;
            
            const pieceGrid = document.createElement('div');
            pieceGrid.style.display = 'grid';
            const pieceCellSize = 15;
            pieceGrid.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, ${pieceCellSize}px)`;
            
            piece.shape.forEach(row => {
                row.forEach(cellValue => {
                    const cell = document.createElement('div');
                    cell.classList.add('blockfit-piece-cell');
                    cell.style.width = `${pieceCellSize}px`;
                    cell.style.height = `${pieceCellSize}px`;
                    if (cellValue === 1) cell.style.backgroundColor = piece.color;
                    else cell.style.backgroundColor = 'transparent';
                    pieceGrid.appendChild(cell);
                });
            });
            pieceDiv.appendChild(pieceGrid);
            piecesContainer.appendChild(pieceDiv);
        });
    }

    function canPlacePiece(piece, startRow, startCol, ignoreSelf = false) {
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c] === 1) {
                    const boardR = startRow + r;
                    const boardC = startCol + c;
                    if (boardR < 0 || boardR >= gridRows || boardC < 0 || boardC >= gridCols) return false;
                    if (board[boardR][boardC] !== 0 && !(ignoreSelf && board[boardR][boardC] === piece.id)) return false;
                }
            }
        }
        return true;
    }

    function removePieceFromBoard(pieceId) {
        if (!pieceId) return;
        for (let r = 0; r < gridRows; r++) for (let c = 0; c < gridCols; c++) if (board[r][c] === pieceId) board[r][c] = 0;
        pieces[pieceId].onBoard = false;
    }

    function placePieceOnBoard(piece, startRow, startCol) {
        piece.shape.forEach((row, r) => row.forEach((cell, c) => { if (cell === 1) board[startRow + r][startCol + c] = piece.id; }));
        piece.onBoard = true;
    }

    // --- Handlers de Eventos ---
    let isDragging = false;
    window.blockfitMouseUpHandler = () => {
        if (heldPiece) {
            if (canPlacePiece(heldPiece, cursorRow, cursorCol, true)) {
                placePieceOnBoard(heldPiece, cursorRow, cursorCol);
            } else {
                heldPiece.onBoard = false;
            }
            heldPiece = null;
            render();
        }
        isDragging = false;
    };

    window.blockfitMouseMoveHandler = (event) => {
        if (!heldPiece) return;
        isDragging = true;
        const gridRect = gridContainer.getBoundingClientRect();
        const x = event.clientX - gridRect.left;
        const y = event.clientY - gridRect.top;
        const col = Math.floor(x / (cellSize + 2));
        const row = Math.floor(y / (cellSize + 2));
        if (row !== cursorRow || col !== cursorCol) {
            cursorRow = row;
            cursorCol = col;
            renderBoard();
        }
    };
    
    window.blockfitKeyDownHandler = (event) => {
        const pieceToTransform = heldPiece || selectedPiece;
        if (!pieceToTransform) return;

        if (event.key.toLowerCase() === 'r') {
            event.preventDefault();
            pieceToTransform.shape = rotateMatrix(pieceToTransform.shape);
        } else if (event.key.toLowerCase() === 'f') {
            event.preventDefault();
            pieceToTransform.shape = flipMatrix(pieceToTransform.shape);
        }
        
        if (heldPiece) renderBoard();
        else renderAvailablePieces();
    };
    
    mainContainer.addEventListener('mousedown', (event) => {
        isDragging = false; // Reset no início do clique
        const piecePreview = event.target.closest('.blockfit-piece-preview');
        const gridCell = event.target.closest('.blockfit-cell');

        setTimeout(() => { // Espera um pouco para ver se é um arraste ou um clique
            if(isDragging) return; // Se já começou a arrastar, não é um clique
            
            if (piecePreview) { // Clicou numa peça da paleta
                const pieceId = parseInt(piecePreview.dataset.pieceId);
                selectedPiece = (selectedPiece && selectedPiece.id === pieceId) ? null : pieces[pieceId];
                renderAvailablePieces();
            }
        }, 150);

        if (piecePreview) {
            const pieceId = parseInt(piecePreview.dataset.pieceId);
            heldPiece = pieces[pieceId];
            selectedPiece = null;
            removePieceFromBoard(pieceId);
        } else if (gridCell) {
            const pieceId = board[parseInt(gridCell.dataset.r)][parseInt(gridCell.dataset.c)];
            if (pieceId !== 0) {
                heldPiece = pieces[pieceId];
                selectedPiece = null;
                removePieceFromBoard(pieceId);
                render();
            }
        }
    });

    document.addEventListener('mouseup', window.blockfitMouseUpHandler);
    document.addEventListener('mousemove', window.blockfitMouseMoveHandler);
    document.addEventListener('keydown', window.blockfitKeyDownHandler);
    
    // Listeners dos botões
    document.getElementById('bf-rotate').addEventListener('click', () => { if (selectedPiece) { selectedPiece.shape = rotateMatrix(selectedPiece.shape); renderAvailablePieces(); }});
    document.getElementById('bf-flip').addEventListener('click', () => { if (selectedPiece) { selectedPiece.shape = flipMatrix(selectedPiece.shape); renderAvailablePieces(); }});
    document.getElementById('bf-check-solution').addEventListener('click', () => {
        const remaining = Object.values(pieces).filter(p => !p.onBoard).length;
        if (remaining > 0) return showModal("Ainda faltam peças!", { text: `Você deve usar todas as ${Object.keys(pieces).length} peças.` });
        if (board.flat().some(cell => cell === 0)) return phaseCompleted(false, { reason: "Solução Incompleta.", text: "Verifique se há buracos." });
        phaseCompleted(true, { text: "Parabéns! Você completou o puzzle BlocoFit!" });
    });
    
    render();
}