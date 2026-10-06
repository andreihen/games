GameRegistry.register('sliding_puzzle', (session) => {
    const ui = session.ui;
    const setTimeout = session.timeout,
        setInterval = session.interval,
        clearTimeout = session.clear,
        clearInterval = session.clear;
    const requestAnimationFrame = session.frame,
        cancelAnimationFrame = session.clear;
    const phaseCompleted = session.complete,
        showModal = session.notify;
    let currentPhaseTimerId = null,
        currentPhaseAttemptsLeft = null;
    function clearPhaseTimer() {
        session.clear(currentPhaseTimerId);
        currentPhaseTimerId = null;
    }
    var SPUZZLE_activeKeydownListener = null;

    function initSlidingPuzzlePhase(config) {
        const gridSize = config.size;
        const numTiles = gridSize * gridSize;
        let tiles = Array.from({ length: numTiles - 1 }, (_, i) => i + 1); // Cria peças de 1 a N-1
        tiles.push(0); // Adiciona a peça vazia (0)
        function isSolved(currentTiles) {
            for (let i = 0; i < numTiles - 1; i++) {
                if (currentTiles[i] !== i + 1) {
                    return false;
                }
            }
            return currentTiles[numTiles - 1] === 0;
        }
        tiles = GameAlgorithms.sliding(gridSize, config.scramble, session.random);

        let tileDimension;
        if (gridSize === 2) {
            tileDimension = 80;
        } else if (gridSize === 3) {
            tileDimension = 60;
        } else if (gridSize === 4) {
            tileDimension = 50;
        } else if (gridSize === 5) {
            tileDimension = 40;
        } else {
            // Para gridSize 6 ou mais
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
                tileDiv.style.width = `${tileDimension}px`;
                tileDiv.style.height = `${tileDimension}px`;
                tileDiv.style.fontSize = `${tileDimension * 0.4}px`;

                if (tileNum === 0) {
                    tileDiv.classList.add('sliding-puzzle-empty');
                } else {
                    tileDiv.textContent = tileNum;
                }
                session.listen(tileDiv, 'click', () => handleTileClick(index));
                gridContainer.appendChild(tileDiv);
            });
            movesP.textContent = `Movimentos: ${moveCount}`;
        }

        /**
         * Lida com o clique em uma peça ou um movimento de teclado.
         * @param {number} clickedIndex - O índice da peça que foi clicada ou que se pretende mover.
         */
        function handleTileClick(clickedIndex) {
            if (!session.active) return; // Só processa se o jogo estiver ativo

            const emptyIndex = tiles.indexOf(0);
            const rC = Math.floor(clickedIndex / gridSize); // Linha da peça clicada
            const cC = clickedIndex % gridSize; // Coluna da peça clicada
            const rE = Math.floor(emptyIndex / gridSize); // Linha da peça vazia
            const cE = emptyIndex % gridSize; // Coluna da peça vazia

            const isAdjacent =
                (Math.abs(rC - rE) === 1 && cC === cE) || (Math.abs(cC - cE) === 1 && rC === rE);

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
            if (!session.active || !document.getElementById('sliding-puzzle-grid-container')) {
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
        session.listen(document, 'keydown', SPUZZLE_activeKeydownListener);

        renderSlidingPuzzle();
    }

    return {
        init: initSlidingPuzzlePhase,
        destroy: session.destroy,
        pause: session.pause,
        resume: session.resume
    };
});
