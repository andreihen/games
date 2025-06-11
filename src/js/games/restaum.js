// resta_um.js

// Variáveis globais para armazenar referências dos listeners e estado da fase
var RESTAUM_boardListener = null;
var RESTAUM_resetBtnListener = null;
var RESTAUM_isPhaseActive = false;
var RESTAUM_currentTimerId = null;

/**
 * Limpa todos os event listeners e timers específicos da fase Resta Um.
 * Função crucial para evitar que listeners antigos continuem ativos.
 */
function cleanupRestaUmListeners() {
    const boardContainer = document.getElementById('restaum-board-container');
    if (boardContainer && RESTAUM_boardListener) {
        boardContainer.removeEventListener('click', RESTAUM_boardListener);
        RESTAUM_boardListener = null;
    }

    const resetBtn = document.getElementById('restaum-reset-button');
    if (resetBtn && RESTAUM_resetBtnListener) {
        resetBtn.removeEventListener('click', RESTAUM_resetBtnListener);
        RESTAUM_resetBtnListener = null;
    }

    if (RESTAUM_currentTimerId) {
        clearInterval(RESTAUM_currentTimerId);
        RESTAUM_currentTimerId = null;
    }
    // Assegura que o timer global do main.js também seja limpo se era este
    if (currentPhaseTimerId === RESTAUM_currentTimerId) {
        currentPhaseTimerId = null;
    }

    RESTAUM_isPhaseActive = false;
}

/**
 * Inicializa a fase do jogo Resta Um.
 * @param {object} config - Configuração da dificuldade, incluindo `config.level`.
 */
function initRestaUmPhase(config) {
    cleanupRestaUmListeners(); // Garante a limpeza antes de iniciar uma nova fase
    RESTAUM_isPhaseActive = true;

    // --- Configurações de Dificuldade e Tabuleiros ---
    // A lista agora foca em tabuleiros maiores para uma melhor jogabilidade.
    // Layout: 0 = inválido, 2 = posição de peça jogável. O buraco inicial (1) será gerado aleatoriamente.
    const boardPatterns = [
        {
            name: "Diamante",
            layout: [ [0,0,2,0,0], [0,2,2,2,0], [2,2,2,2,2], [0,2,2,2,0], [0,0,2,0,0] ],
            targetPegs: 1
        },
        {
            name: "Cruz Clássica",
            layout: [
                [0,0,2,2,2,0,0], [0,0,2,2,2,0,0], [2,2,2,2,2,2,2],
                [2,2,2,2,2,2,2], [2,2,2,2,2,2,2], [0,0,2,2,2,0,0],
                [0,0,2,2,2,0,0]
            ],
            targetPegs: 1
        },
        {
            name: "Flecha",
            layout: [ [0,0,2,0,0], [0,2,2,2,0], [2,2,2,2,2], [0,0,2,0,0], [0,0,2,0,0] ],
            targetPegs: 1
        },
        {
            name: "Europeu",
            layout: [
                [0,0,2,2,2,0,0], [0,2,2,2,2,2,0], [2,2,2,2,2,2,2],
                [2,2,2,2,2,2,2], [2,2,2,2,2,2,2], [0,2,2,2,2,2,0],
                [0,0,2,2,2,0,0]
            ],
            targetPegs: 1
        }
    ];

    const patternChoice = boardPatterns[config.level % boardPatterns.length];
    let board = JSON.parse(JSON.stringify(patternChoice.layout));
    const rows = board.length;
    const cols = board[0].length;
    
    // --- Geração Aleatória do Buraco Inicial ---
    const possiblePegPositions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === 2) { // Encontra todas as posições jogáveis
                possiblePegPositions.push({r, c});
            }
        }
    }

    if (possiblePegPositions.length > 0) {
        // Escolhe uma posição aleatória para ser o buraco inicial
        const randomIndex = Math.floor(Math.random() * possiblePegPositions.length);
        const { r: emptyR, c: emptyC } = possiblePegPositions[randomIndex];
        board[emptyR][emptyC] = 1; // Define o buraco vazio
    } else {
        console.error("Nenhuma posição de peça encontrada para o layout:", patternChoice.name);
    }
    
    // O objetivo aumenta em 1 para cada ciclo completo de padrões
    const targetPegs = patternChoice.targetPegs + Math.floor(config.level / boardPatterns.length);

    // --- Estado do Jogo ---
    let selectedPeg = null; // {r, c} da peça selecionada
    let movesCount = 0;

    // --- Temporizador ---
    const timeLimitsRestaUm = [180, 160, 150, 140, 130, 120, 110, 100, 90, 80];
    let timeLeft = timeLimitsRestaUm[Math.min(config.level, timeLimitsRestaUm.length - 1)];
    ui.limitDisplay.textContent = `Tempo: ${timeLeft}s`;

    RESTAUM_currentTimerId = setInterval(() => {
        if (!gameActive || !RESTAUM_isPhaseActive) {
            cleanupRestaUmListeners();
            return;
        }
        timeLeft--;
        ui.limitDisplay.textContent = `Tempo: ${timeLeft}s`;
        if (timeLeft <= 0) {
            if (RESTAUM_isPhaseActive) {
                RESTAUM_isPhaseActive = false;
                cleanupRestaUmListeners();
                phaseCompleted(false, { reason: "Tempo esgotado!", text: `Não conseguiu atingir o objetivo de ${targetPegs} peça(s).` });
            }
        }
    }, 1000);
    currentPhaseTimerId = RESTAUM_currentTimerId;

    // --- HTML da Fase ---
    const cellSize = 35;
    const gapSize = 2;
    const boardDimension = cols * (cellSize + gapSize);

    ui.phaseDisplay.innerHTML = `
        <div class="p-2 md:p-3 rounded-lg shadow-md w-full max-w-md mx-auto flex flex-col items-center">
            <h2 class="phase-title text-lg font-semibold mb-1 text-center">Resta Um: ${patternChoice.name}</h2>
            <p class="text-xs text-gray-300 mb-2 text-center">Objetivo: Deixar ${targetPegs} peça(s) no tabuleiro.</p>
            <p id="restaum-moves" class="text-sm text-gray-400 mb-2">Movimentos: 0 | Peças: 0</p>
            <div id="restaum-board-container" class="restaum-board"
                 style="display: grid; grid-template-columns: repeat(${cols}, 1fr); width: ${boardDimension}px; gap: ${gapSize}px;">
            </div>
            <button id="restaum-reset-button" class="button button-secondary px-3 py-1 text-sm mt-3">Reiniciar Tabuleiro</button>
        </div>
        <style>
            .restaum-cell.valid-move::after {
                content: ''; position: absolute; width: 50%; height: 50%;
                background-color: rgba(96, 165, 250, 0.5); border-radius: 50%;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        </style>
    `;

    const boardContainer = document.getElementById('restaum-board-container');
    const movesP = document.getElementById('restaum-moves');
    const resetBtn = document.getElementById('restaum-reset-button');

    function renderRestaUmBoard() {
        if (!boardContainer) return;
        boardContainer.innerHTML = '';
        let pegCount = 0;
        let validMoveTargets = selectedPeg ? getValidMovesForPeg(selectedPeg.r, selectedPeg.c) : [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('restaum-cell');
                cellDiv.dataset.r = r;
                cellDiv.dataset.c = c;
                cellDiv.style.width = `${cellSize}px`;
                cellDiv.style.height = `${cellSize}px`;

                if (board[r][c] === 2) {
                    cellDiv.classList.add('peg');
                    pegCount++;
                } else if (board[r][c] === 0) {
                    cellDiv.classList.add('invalid');
                }

                if (selectedPeg && selectedPeg.r === r && selectedPeg.c === c) {
                    cellDiv.classList.add('selected');
                }
                if (validMoveTargets.some(move => move.r === r && move.c === c)) {
                    cellDiv.classList.add('valid-move');
                }
                boardContainer.appendChild(cellDiv);
            }
        }
        movesP.textContent = `Movimentos: ${movesCount} | Peças: ${pegCount}`;

        // Verifica condição de derrota (sem movimentos possíveis e objetivo não alcançado)
        if (gameActive && !canAnyMove() && pegCount > targetPegs) {
             if (RESTAUM_isPhaseActive) {
                RESTAUM_isPhaseActive = false;
                cleanupRestaUmListeners();
                phaseCompleted(false, { reason: "Sem mais movimentos possíveis!", text: `Restaram ${pegCount} peças.` });
            }
        }
    }

    function handleCellClick(r, c) {
        if (!gameActive || !RESTAUM_isPhaseActive || board[r][c] === 0) return;

        // Caso 1: Uma peça já está selecionada.
        if (selectedPeg) {
            const { r: sr, c: sc } = selectedPeg;

            // Tentativa de fazer um movimento
            const isValidMove = getValidMovesForPeg(sr, sc).some(move => move.r === r && move.c === c);

            if (isValidMove) {
                const jumpedR = sr + (r - sr) / 2;
                const jumpedC = sc + (c - sc) / 2;
                board[sr][sc] = 1;
                board[jumpedR][jumpedC] = 1;
                board[r][c] = 2;
                movesCount++;
                selectedPeg = null; // Desseleciona após o movimento
                renderRestaUmBoard();
                checkRestaUmWin();
                return; // Fim da ação para este clique
            }
        }

        // Caso 2: Nenhuma peça selecionada, ou o clique não foi um movimento válido.
        // A ação agora é determinar a nova seleção.
        if (board[r][c] === 2) { // Se clicou numa peça
             // Se clicou na mesma peça que já estava selecionada, deseleciona. Senão, seleciona a nova.
            if (selectedPeg && selectedPeg.r === r && selectedPeg.c === c) {
                selectedPeg = null;
            } else {
                selectedPeg = { r, c };
            }
        } else { // Se clicou num buraco vazio (que não era um movimento válido)
            selectedPeg = null; // Deseleciona
        }
        renderRestaUmBoard();
    }
    
    function getValidMovesForPeg(r, c) {
        const validMoves = [];
        const directions = [[-2,0], [2,0], [0,-2], [0,2]];
        for (const [dr, dc] of directions) {
            const newR = r + dr;
            const newC = c + dc;
            const jumpedR = r + dr / 2;
            const jumpedC = c + dc / 2;

            if (newR >= 0 && newR < rows && newC >= 0 && newC < cols &&
                board[newR][newC] === 1 &&
                board[jumpedR][jumpedC] === 2) {
                validMoves.push({ r: newR, c: newC });
            }
        }
        return validMoves;
    }

    function canAnyMove() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === 2) {
                    if (getValidMovesForPeg(r, c).length > 0) return true;
                }
            }
        }
        return false;
    }

    function checkRestaUmWin() {
        let pegCount = 0;
        board.forEach(row => row.forEach(cell => { if (cell === 2) pegCount++; }));

        if (pegCount <= targetPegs && !canAnyMove()) {
            if (RESTAUM_isPhaseActive) {
                RESTAUM_isPhaseActive = false;
                cleanupRestaUmListeners();
                if (pegCount === targetPegs) {
                     phaseCompleted(true, { text: `Objetivo alcançado com ${pegCount} peça(s) em ${movesCount} movimentos!` });
                } else {
                     phaseCompleted(false, { reason: "Sem mais movimentos!", text: `Não atingiu o objetivo de ${targetPegs} peça(s). Restaram ${pegCount}.` });
                }
            }
        }
    }

    const handleBoardClickWrapper = (event) => {
        const cell = event.target.closest('.restaum-cell');
        if (cell) {
            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);
            handleCellClick(r, c);
        }
    };

    const handleResetClick = () => {
        if (!gameActive || !RESTAUM_isPhaseActive) return;
        // Recria o tabuleiro com um novo buraco aleatório
        board = JSON.parse(JSON.stringify(patternChoice.layout));
        const possiblePegs = [];
        for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { if (board[r][c] === 2) possiblePegs.push({r,c}); } }
        if (possiblePegs.length > 0) {
            const { r, c } = possiblePegs[Math.floor(Math.random() * possiblePegs.length)];
            board[r][c] = 1;
        }
        selectedPeg = null;
        movesCount = 0;
        renderRestaUmBoard();
    };


    // --- Adiciona Event Listeners ---
    RESTAUM_boardListener = handleBoardClickWrapper;
    boardContainer.addEventListener('click', RESTAUM_boardListener);

    RESTAUM_resetBtnListener = handleResetClick;
    resetBtn.addEventListener('click', RESTAUM_resetBtnListener);

    // --- Renderização Inicial ---
    renderRestaUmBoard();
}
