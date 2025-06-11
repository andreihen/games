// sliding_puzzle.js

// Variável para armazenar a referência do listener de keydown ativo para esta fase.
// Isso ajuda a remover o listener anterior se a fase for reiniciada.
var SPUZZLE_activeKeydownListener = null;

function initSlidingPuzzlePhase(config) {
    // --- Lógica para determinar o tamanho da grade ---
    const minGridSize = 2; // Começa com 2x2 (4 espaços)
    const maxGridSize = 6; // Tamanho máximo da grade (ex: 6x6)
    const levelsForFirstIncrease = 5; // Nível (0-indexed) em que o primeiro aumento ocorre
    const levelsPerSubsequentIncrease = 10; // Aumenta o tamanho a cada 10 níveis APÓS o primeiro aumento

    let currentGridSize;

    if (config.level < levelsForFirstIncrease) {
        currentGridSize = minGridSize;
    } else {
        // Primeiro aumento para minGridSize + 1
        currentGridSize = minGridSize + 1;
        // Calcula aumentos subsequentes
        const levelsAfterFirstJump = config.level - levelsForFirstIncrease;
        const subsequentIncreases = Math.floor(levelsAfterFirstJump / levelsPerSubsequentIncrease);
        currentGridSize += subsequentIncreases;
    }

    const gridSize = Math.min(maxGridSize, currentGridSize);


    const numTiles = gridSize * gridSize;
    let tiles = Array.from({ length: numTiles - 1 }, (_, i) => i + 1); // Cria peças de 1 a N-1
    tiles.push(0); // Adiciona a peça vazia (0)

    // --- Função para verificar se o tabuleiro está resolvido ---
    function isSolved(currentTiles) {
        for (let i = 0; i < numTiles - 1; i++) {
            if (currentTiles[i] !== i + 1) {
                return false;
            }
        }
        return currentTiles[numTiles - 1] === 0;
    }

    // --- Embaralha o tabuleiro ---
    const sizeFactorForShuffle = gridSize - minGridSize;
    let shuffleMoves = gridSize * gridSize * (5 + config.level * 1 + sizeFactorForShuffle * 3); // Reduzido um pouco para evitar embaralhamentos excessivamente longos
    if (gridSize === 2) shuffleMoves = Math.max(5, shuffleMoves / 2); // Menos movimentos para 2x2

    // Loop de embaralhamento principal
    for (let i = 0; i < shuffleMoves; i++) {
        const emptyIndex = tiles.indexOf(0);
        const rE = Math.floor(emptyIndex / gridSize);
        const cE = emptyIndex % gridSize;
        const possibleMoves = [];
        if (rE > 0) possibleMoves.push(emptyIndex - gridSize);
        if (rE < gridSize - 1) possibleMoves.push(emptyIndex + gridSize);
        if (cE > 0) possibleMoves.push(emptyIndex - 1);
        if (cE < gridSize - 1) possibleMoves.push(emptyIndex + 1);

        if (possibleMoves.length > 0) {
            const randomMoveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            [tiles[emptyIndex], tiles[randomMoveIndex]] = [tiles[randomMoveIndex], tiles[emptyIndex]];
        }
    }

    // --- Garante que o tabuleiro não comece resolvido ---
    let attempt = 0;
    const maxAttemptsToUnsolve = 10; // Evita loop infinito, embora improvável
    while (isSolved(tiles) && attempt < maxAttemptsToUnsolve) {
        // Faz alguns movimentos aleatórios extras para "desresolver"
        // Para 2x2, 1 ou 2 movimentos são suficientes. Para maiores, um pouco mais.
        const extraMoves = gridSize === 2 ? 2 : 3;
        for (let i = 0; i < extraMoves; i++) {
            const emptyIndex = tiles.indexOf(0);
            const rE = Math.floor(emptyIndex / gridSize);
            const cE = emptyIndex % gridSize;
            const possibleMoves = [];
            if (rE > 0) possibleMoves.push(emptyIndex - gridSize);
            if (rE < gridSize - 1) possibleMoves.push(emptyIndex + gridSize);
            if (cE > 0) possibleMoves.push(emptyIndex - 1);
            if (cE < gridSize - 1) possibleMoves.push(emptyIndex + 1);

            if (possibleMoves.length > 0) {
                const randomMoveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                [tiles[emptyIndex], tiles[randomMoveIndex]] = [tiles[randomMoveIndex], tiles[emptyIndex]];
            }
        }
        attempt++;
    }
    // Se mesmo após tentativas ainda estiver resolvido (extremamente raro),
    // faz uma troca simples e garantida se for 2x2.
    if (isSolved(tiles) && gridSize === 2) {
        if (tiles[0] === 1 && tiles[1] === 2 && tiles[2] === 3 && tiles[3] === 0) { // Estado resolvido 2x2
             // Troca as duas últimas peças não vazias se o vazio for o último
            [tiles[1], tiles[2]] = [tiles[2], tiles[1]];
        } else {
            // Tenta uma troca simples que não seja a solução
            const emptyIdx = tiles.indexOf(0);
            if (emptyIdx === 0) [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
            else [tiles[emptyIdx], tiles[0]] = [tiles[0], tiles[emptyIdx]];
        }
    }


    // --- Define dimensões das peças e da grade ---
    let tileDimension;
    if (gridSize === 2) {
        tileDimension = 80;
    } else if (gridSize === 3) {
        tileDimension = 60;
    } else if (gridSize === 4) {
        tileDimension = 50;
    } else if (gridSize === 5) {
        tileDimension = 40;
    } else { // Para gridSize 6 ou mais
        tileDimension = 35;
    }
    const gapSize = 4; // Espaço entre as peças
    const gridDimension = gridSize * tileDimension + (gridSize - 1) * gapSize;

    ui.phaseDisplay.innerHTML = `
        <div class="p-1 md:p-2 rounded-lg shadow-md w-full flex flex-col items-center" style="max-width: ${gridDimension + 40}px;">
            <h2 class="phase-title text-lg md:text-xl font-semibold mb-2 text-center">Quebra-Cabeça Deslizante (${gridSize}x${gridSize})</h2>
            <p class="text-xs md:text-sm text-gray-300 mb-3 text-center">Organize os números em ordem. Use as setas ou clique.</p>
            <div id="sliding-puzzle-grid-container" class="sliding-puzzle-grid mx-auto"
                 style="grid-template-columns: repeat(${gridSize}, 1fr);
                        gap: ${gapSize}px;">
                <!-- As peças serão renderizadas aqui -->
            </div>
            <p id="sliding-puzzle-moves" class="text-center text-sm text-gray-400 mt-2">Movimentos: 0</p>
        </div>`;

    const gridContainer = document.getElementById('sliding-puzzle-grid-container');
    const movesP = document.getElementById('sliding-puzzle-moves');
    let moveCount = 0;

    /**
     * Renderiza o tabuleiro do quebra-cabeça deslizante na tela.
     */
    function renderSlidingPuzzle() {
        gridContainer.innerHTML = ''; // Limpa o container
        tiles.forEach((tileNum, index) => {
            const tileDiv = document.createElement('div');
            tileDiv.classList.add('sliding-puzzle-tile');
            // Aplicar dimensões diretamente para garantir consistência
            tileDiv.style.width = `${tileDimension}px`;
            tileDiv.style.height = `${tileDimension}px`;
            // Ajustar tamanho da fonte com base no tamanho da peça
            tileDiv.style.fontSize = `${tileDimension * 0.4}px`;


            if (tileNum === 0) {
                tileDiv.classList.add('sliding-puzzle-empty');
            } else {
                tileDiv.textContent = tileNum;
            }
            tileDiv.addEventListener('click', () => handleTileClick(index));
            gridContainer.appendChild(tileDiv);
        });
        movesP.textContent = `Movimentos: ${moveCount}`;
    }

    /**
     * Lida com o clique em uma peça ou um movimento de teclado.
     * @param {number} clickedIndex - O índice da peça que foi clicada ou que se pretende mover.
     */
    function handleTileClick(clickedIndex) {
        if (!gameActive) return; // Só processa se o jogo estiver ativo

        const emptyIndex = tiles.indexOf(0);
        const rC = Math.floor(clickedIndex / gridSize); // Linha da peça clicada
        const cC = clickedIndex % gridSize; // Coluna da peça clicada
        const rE = Math.floor(emptyIndex / gridSize); // Linha da peça vazia
        const cE = emptyIndex % gridSize; // Coluna da peça vazia

        const isAdjacent = (Math.abs(rC - rE) === 1 && cC === cE) || (Math.abs(cC - cE) === 1 && rC === rE);

        if (isAdjacent) {
            [tiles[clickedIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[clickedIndex]];
            moveCount++;
            renderSlidingPuzzle();
            checkSlidingPuzzleWin();
        }
    }

    /**
     * Verifica se o jogador venceu o jogo.
     */
    function checkSlidingPuzzleWin() {
        // Usa a função 'isSolved' para verificar
        if (isSolved(tiles)) {
            if (SPUZZLE_activeKeydownListener) {
                document.removeEventListener('keydown', SPUZZLE_activeKeydownListener);
                SPUZZLE_activeKeydownListener = null;
            }
            phaseCompleted(true, { text: `Resolvido em ${moveCount} movimentos!` });
        }
    }

    /**
     * Lida com os eventos de pressionamento de tecla (setas).
     * @param {KeyboardEvent} event - O objeto do evento de teclado.
     */
    const handleKeyDown = (event) => {
        if (!gameActive || !document.getElementById('sliding-puzzle-grid-container')) {
            if (SPUZZLE_activeKeydownListener) {
                document.removeEventListener('keydown', SPUZZLE_activeKeydownListener);
                SPUZZLE_activeKeydownListener = null;
            }
            return;
        }

        const emptyIndex = tiles.indexOf(0);
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;
        let targetTileIndex = -1;

        switch (event.key) {
            case 'ArrowUp':
                if (emptyRow < gridSize - 1) {
                    targetTileIndex = emptyIndex + gridSize;
                }
                break;
            case 'ArrowDown':
                if (emptyRow > 0) {
                    targetTileIndex = emptyIndex - gridSize;
                }
                break;
            case 'ArrowLeft':
                if (emptyCol < gridSize - 1) {
                    targetTileIndex = emptyIndex + 1;
                }
                break;
            case 'ArrowRight':
                if (emptyCol > 0) {
                    targetTileIndex = emptyIndex - 1;
                }
                break;
            default:
                return;
        }

        if (targetTileIndex !== -1) {
            event.preventDefault();
            handleTileClick(targetTileIndex);
        }
    };

    if (SPUZZLE_activeKeydownListener) {
        document.removeEventListener('keydown', SPUZZLE_activeKeydownListener);
    }
    SPUZZLE_activeKeydownListener = handleKeyDown;
    document.addEventListener('keydown', SPUZZLE_activeKeydownListener);

    renderSlidingPuzzle();
}
