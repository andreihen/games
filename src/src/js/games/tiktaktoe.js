// tiktaktoe.js (versão melhorada)

// Variáveis para armazenar referências dos listeners e estado da fase
var TTTM_boardClickListener = null;
var TTTM_modeSelectionListener = null;
var TTTM_isPhaseActive = false;

/**
 * Limpa todos os event listeners específicos da fase Jogo da Velha Infinito.
 */
function cleanupTicTacToeModernListeners() {
    if (TTTM_boardClickListener) {
        const boardDiv = document.getElementById('tttm-board');
        if (boardDiv) {
            boardDiv.removeEventListener('click', TTTM_boardClickListener);
        }
        TTTM_boardClickListener = null;
    }
    if (TTTM_modeSelectionListener) {
        const selectionDiv = document.getElementById('tttm-mode-selection');
        if (selectionDiv) {
            selectionDiv.removeEventListener('click', TTTM_modeSelectionListener);
        }
        TTTM_modeSelectionListener = null;
    }
    TTTM_isPhaseActive = false;
}

/**
 * Inicializa a fase do jogo Jogo da Velha Infinito.
 * @param {object} config - Configuração da dificuldade, incluindo `config.level`.
 */
function initTicTacToeModernPhase(config) {
    cleanupTicTacToeModernListeners();
    TTTM_isPhaseActive = true;

    // --- Estado do Jogo ---
    let board = Array(9).fill(null); // Tabuleiro 3x3
    let currentPlayer = 'X';
    let gameMode = null; // 'pvc' (Player vs Computer) ou 'pvp' (Player vs Player)
    let botDifficulty = Math.min(10, config.level); // Usado na profundidade do Minimax
    let isGameOver = false;

    // Rastreia as peças de cada jogador em ordem de colocação {player: [{r, c}, ...]}
    const playerPieces = { 'X': [], 'O': [] };
    
    // Estado da jogada atual: 'PLACE' ou 'MOVE'
    let moveState = 'PLACE';
    let pieceToMove = null; // Coordenadas da peça a ser movida

    // --- HTML Inicial: Seleção de Modo ---
    ui.phaseDisplay.innerHTML = `
        <div class="p-4 rounded-lg shadow-md w-full max-w-md mx-auto flex flex-col items-center">
            <h2 class="phase-title text-2xl font-bold mb-4 text-center">Jogo da Velha Infinito</h2>
            <p class="text-gray-300 mb-6 text-center">Cada jogador tem no máximo 3 peças. Na 4ª jogada, mova sua peça mais antiga.</p>
            <div id="tttm-mode-selection" class="w-full flex flex-col space-y-3">
                <button data-mode="pvc" class="button button-primary py-3 text-lg">Jogar Sozinho (vs. Bot)</button>
                <button data-mode="pvp" class="button button-secondary py-3 text-lg">Jogar com Amigo (2P)</button>
            </div>
        </div>
    `;

    /**
     * Inicia o jogo após a seleção do modo.
     */
    function startGame(mode) {
        gameMode = mode;
        renderGameUI(); // Renderiza a UI do tabuleiro e status
        addBoardListener();
    }

    /**
     * Renderiza a interface principal do jogo (tabuleiro e status).
     */
    function renderGameUI() {
        ui.phaseDisplay.innerHTML = `
            <div class="p-4 rounded-lg shadow-md w-full max-w-md mx-auto flex flex-col items-center">
                <h2 class="phase-title text-2xl font-bold mb-2 text-center">Jogo da Velha Infinito</h2>
                <div id="tttm-status" class="text-lg text-gray-300 mb-4 h-8 text-center"></div>
                <div id="tttm-board" class="grid grid-cols-3 gap-2 bg-gray-900 p-2 rounded-lg">
                    ${Array(9).fill('').map((_, i) => `<div class="w-20 h-20 md:w-24 md:h-24 bg-gray-800 rounded-md flex items-center justify-center text-5xl font-bold cursor-pointer hover:bg-gray-700 transition-colors" data-index="${i}"></div>`).join('')}
                </div>
                <button id="tttm-reset-button" class="button button-secondary px-4 py-2 text-sm mt-4">Reiniciar Jogo</button>
            </div>
            <style>
                /* Cores dos jogadores */
                .tttm-cell.X { color: #ef4444; } /* Vermelho (red-500) */
                .tttm-cell.O { color: #3b82f6; } /* Azul (blue-500) */

                /* Animação da peça que DEVE ser movida */
                .tttm-cell.must-move {
                    animation: tttm-pulse-move 1.5s infinite;
                }
                .tttm-cell.X.must-move { --pulse-color-rgb: 239, 68, 68; }
                .tttm-cell.O.must-move { --pulse-color-rgb: 59, 130, 246; }

                @keyframes tttm-pulse-move {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--pulse-color-rgb), 0.7); }
                    50% { transform: scale(1.05); box-shadow: 0 0 10px 10px rgba(var(--pulse-color-rgb), 0); }
                }

                /* Animação e cor das peças vencedoras */
                .tttm-cell.winner {
                    color: #22c55e !important; /* Verde (green-500) */
                    background-color: #166534; /* Verde escuro para fundo */
                    animation: tttm-pulse-win 1s infinite;
                }

                @keyframes tttm-pulse-win {
                   0%, 100% { transform: scale(1.05); opacity: 1; }
                   50% { transform: scale(0.95); opacity: 0.8; }
                }
            </style>
        `;
        document.getElementById('tttm-reset-button').addEventListener('click', () => initTicTacToeModernPhase(config));
        updateBoard();
    }
    
    /**
     * Adiciona o listener de clique ao tabuleiro.
     */
    function addBoardListener() {
        const boardDiv = document.getElementById('tttm-board');
        if (!boardDiv) return;
        
        TTTM_boardClickListener = (event) => {
            if (isGameOver) return;
            const cell = event.target.closest('div[data-index]');
            if (cell) {
                const index = parseInt(cell.dataset.index);
                handleCellClick(index);
            }
        };
        boardDiv.addEventListener('click', TTTM_boardClickListener);
    }
    
    /**
     * Atualiza a renderização do tabuleiro e do status.
     */
    function updateBoard() {
        if (!document.getElementById('tttm-board')) return; // Garante que a UI existe

        const cells = document.querySelectorAll('#tttm-board > div');
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            // Reseta classes antes de aplicar as novas, exceto a classe de vencedor
            if (!cell.classList.contains('winner')) {
               cell.className = `w-20 h-20 md:w-24 md:h-24 bg-gray-800 rounded-md flex items-center justify-center text-5xl font-bold cursor-pointer hover:bg-gray-700 transition-colors tttm-cell ${board[index] || ''}`;
            }
        });

        const statusDiv = document.getElementById('tttm-status');
        if (isGameOver || !statusDiv) return;

        // Determina se a próxima jogada é um 'MOVE' e destaca a peça
        if (playerPieces[currentPlayer].length === 3) {
            moveState = 'MOVE';
            pieceToMove = playerPieces[currentPlayer][0]; // A peça mais antiga
            const pieceIndex = pieceToMove.r * 3 + pieceToMove.c;
            if (cells[pieceIndex]) cells[pieceIndex].classList.add('must-move');
            statusDiv.textContent = `Vez de ${currentPlayer}: Mova sua peça.`;
        } else {
            moveState = 'PLACE';
            pieceToMove = null;
            statusDiv.textContent = `Vez de ${currentPlayer}: Coloque uma peça.`;
        }
    }

    /**
     * Lida com o clique em uma célula do tabuleiro.
     */
    function handleCellClick(index) {
        if (isGameOver || board[index] !== null && moveState !== 'MOVE') return;

        if (moveState === 'PLACE') {
            makeMove(index, currentPlayer);
        } else if (moveState === 'MOVE') {
            if (board[index] === null) { // Só pode mover para uma casa vazia
                const oldIndex = pieceToMove.r * 3 + pieceToMove.c;
                
                // Remove a peça antiga
                board[oldIndex] = null;
                playerPieces[currentPlayer].shift(); 

                // Coloca a peça na nova posição
                makeMove(index, currentPlayer);
            } else {
                 const statusDiv = document.getElementById('tttm-status');
                 if (statusDiv) statusDiv.textContent = "Escolha uma casa VAZIA para mover.";
            }
        }
    }
    
    /**
     * Executa a jogada, atualiza o estado e verifica o vencedor.
     */
    function makeMove(index, player) {
        board[index] = player;
        const r = Math.floor(index / 3);
        const c = index % 3;
        playerPieces[player].push({ r, c });

        // ATUALIZA O TABULEIRO *ANTES* DE VERIFICAR O VENCEDOR
        // Isso garante que a última peça apareça na tela.
        updateBoard();

        const winningPattern = checkWinner(player);
        if (winningPattern) {
            isGameOver = true;
            highlightWinner(winningPattern);
            document.getElementById('tttm-status').textContent = `Jogador ${player} venceu!`;
            
            // Espera para mostrar a vitória antes de concluir a fase
            setTimeout(() => {
                if (TTTM_isPhaseActive) {
                    phaseCompleted(true, { html: `Parabéns, jogador <b>${player}</b>!<br>Você venceu o Jogo da Velha Infinito.` });
                    cleanupTicTacToeModernListeners();
                }
            }, 2000); // 2 segundos de espera

        } else {
            currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
            updateBoard();
            if (gameMode === 'pvc' && currentPlayer === 'O') {
                setTimeout(botMove, 500); // Delay para a jogada do bot
            }
        }
    }

    /**
     * Destaca as células vencedoras.
     * @param {number[]} winningPattern - Array com os 3 índices vencedores.
     */
    function highlightWinner(winningPattern) {
        const cells = document.querySelectorAll('#tttm-board > div');
        winningPattern.forEach(index => {
            if (cells[index]) {
                cells[index].classList.add('winner');
            }
        });
    }

    /**
     * Verifica se um jogador venceu.
     * @returns {number[] | null} Retorna o padrão vencedor ou null.
     */
    function checkWinner(player) {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // Linhas
            [0,3,6], [1,4,7], [2,5,8], // Colunas
            [0,4,8], [2,4,6]          // Diagonais
        ];
        for (const pattern of winPatterns) {
            if (pattern.every(index => board[index] === player)) {
                return pattern; // Retorna o padrão que causou a vitória
            }
        }
        return null; // Nenhum vencedor
    }
    
    /**
     * Lógica para a jogada do bot.
     */
    function botMove() {
        if (isGameOver) return;
        const bestMove = findBestMove();
        
        if (bestMove.oldIndex !== undefined) { // É uma jogada de movimento
            board[bestMove.oldIndex] = null;
            playerPieces['O'].shift();
        }
        makeMove(bestMove.newIndex, 'O');
    }
    
    /**
     * Encontra a melhor jogada para o bot usando Minimax (sempre).
     */
    function findBestMove() {
        let bestScore = -Infinity;
        let move = {};

        // REMOVIDO: Lógica de jogada aleatória. O bot agora sempre joga para ganhar.
        const possibleMoves = getPossibleMoves('O');
        if (possibleMoves.length === 0) return null; // Segurança

        for (const possibleMove of possibleMoves) {
            // Simula a jogada em um tabuleiro temporário
            const tempBoard = [...board];
            const tempPieces = JSON.parse(JSON.stringify(playerPieces));

            if (possibleMove.oldIndex !== undefined) {
                tempBoard[possibleMove.oldIndex] = null;
                tempPieces['O'].shift();
            }
            tempBoard[possibleMove.newIndex] = 'O';
            const r = Math.floor(possibleMove.newIndex / 3);
            const c = possibleMove.newIndex % 3;
            tempPieces['O'].push({r, c});
            
            const score = minimax(tempBoard, tempPieces, 0, false);
            if (score > bestScore) {
                bestScore = score;
                move = possibleMove;
            }
        }
        return move;
    }
    
    /**
     * Algoritmo Minimax para a IA.
     */
    function minimax(currentBoard, currentPieces, depth, isMaximizing) {
        // Usa 'O' como maximizador e 'X' como minimizador
        if (checkWinnerForBoard(currentBoard, 'O')) return 10 - depth;
        if (checkWinnerForBoard(currentBoard, 'X')) return depth - 10;
        
        // Aumenta a profundidade da busca com a dificuldade
        if (depth > (2 + Math.floor(botDifficulty / 3))) return 0;

        const player = isMaximizing ? 'O' : 'X';
        const moves = getPossibleMoves(player, currentBoard, currentPieces);

        if (moves.length === 0) return 0;

        if (isMaximizing) { // 'O' quer maximizar a pontuação
            let bestScore = -Infinity;
            for (const move of moves) {
                const { newBoard, newPieces } = simulateMove(currentBoard, currentPieces, move, 'O');
                let score = minimax(newBoard, newPieces, depth + 1, false);
                bestScore = Math.max(score, bestScore);
            }
            return bestScore;
        } else { // 'X' quer minimizar a pontuação
            let bestScore = Infinity;
            for (const move of moves) {
                const { newBoard, newPieces } = simulateMove(currentBoard, currentPieces, move, 'X');
                let score = minimax(newBoard, newPieces, depth + 1, true);
                bestScore = Math.min(score, bestScore);
            }
            return bestScore;
        }
    }
    
    /**
     * Função auxiliar para simular uma jogada em um tabuleiro/peças temporários.
     */
    function simulateMove(board, pieces, move, player) {
        const newBoard = [...board];
        const newPieces = JSON.parse(JSON.stringify(pieces));
        if (move.oldIndex !== undefined) {
            newBoard[move.oldIndex] = null;
            newPieces[player].shift();
        }
        newBoard[move.newIndex] = player;
        const r = Math.floor(move.newIndex / 3);
        const c = move.newIndex % 3;
        newPieces[player].push({ r, c });
        return { newBoard, newPieces };
    }

    /**
     * Verifica o vencedor em um tabuleiro específico (para o Minimax).
     */
     function checkWinnerForBoard(board, player) {
        const winPatterns = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
        return winPatterns.some(pattern => pattern.every(index => board[index] === player));
    }


    /**
     * Obtém todas as jogadas possíveis para um jogador em um estado de jogo.
     */
    function getPossibleMoves(player, currentBoard = board, currentPieces = playerPieces) {
        const moves = [];
        const pieces = currentPieces[player];
        
        // Jogada de colocar peça
        if (pieces.length < 3) {
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    moves.push({ newIndex: i });
                }
            }
        } else { // Jogada de mover peça
            const oldPiece = pieces[0];
            const oldIndex = oldPiece.r * 3 + oldPiece.c;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    moves.push({ oldIndex: oldIndex, newIndex: i });
                }
            }
        }
        return moves;
    }


    // --- Listener para a seleção de modo ---
    TTTM_modeSelectionListener = (event) => {
        const button = event.target.closest('button[data-mode]');
        if (button) {
            startGame(button.dataset.mode);
        }
    };
    document.getElementById('tttm-mode-selection').addEventListener('click', TTTM_modeSelectionListener);
}