// initMiniSudokuPhase.js - Fase Mini Sudoku

function initMiniSudokuPhase(config) {
    const level = config.level;
    let gridSize;
    let blockSize; // {rows, cols}
    let numbersToRemove;
    let board; // Matriz representando o tabuleiro completo (solução)
    let puzzleBoard; // Matriz representando o tabuleiro do puzzle (com células vazias)

    // Configuração baseada no nível
    if (level < 4) { // Níveis 0-3: 4x4
        gridSize = 4;
        blockSize = { rows: 2, cols: 2 };
        if (level < 2) numbersToRemove = 8 + Math.floor(Math.random() * 2); // ~8-9 vazias -> 7-8 preenchidas
        else numbersToRemove = 10 + Math.floor(Math.random() * 2);         // ~10-11 vazias -> 5-6 preenchidas
    } else { // Níveis 4+: 6x6
        gridSize = 6;
        blockSize = { rows: 2, cols: 3 }; // Blocos 2x3
        if (level < 7) numbersToRemove = 18 + Math.floor(Math.random() * 3); // ~18-20 vazias -> 16-18 preenchidas
        else if (level < 10) numbersToRemove = 22 + Math.floor(Math.random() * 3); // ~22-24 vazias -> 12-14 preenchidas
        else numbersToRemove = 25 + Math.floor(Math.random() * 3); // ~25-27 vazias -> 9-11 preenchidas
    }
    if (numbersToRemove >= gridSize * gridSize) numbersToRemove = gridSize * gridSize - (gridSize + 1); // Garante alguns preenchidos

    // --- Funções Geradoras e Validadoras de Sudoku ---

    // Função para criar um tabuleiro de Sudoku resolvido (simplificado)
    function generateSolvedBoard() {
        let baseBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));

        // Backtracking simples para preencher o tabuleiro
        function solve(boardToSolve) {
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (boardToSolve[r][c] === 0) {
                        let nums = shuffleArray([...Array(gridSize).keys()].map(i => i + 1));
                        for (let num of nums) {
                            if (isValidPlacement(boardToSolve, num, r, c)) {
                                boardToSolve[r][c] = num;
                                if (solve(boardToSolve)) {
                                    return true;
                                }
                                boardToSolve[r][c] = 0; // Backtrack
                            }
                        }
                        return false; // Nenhum número válido encontrado
                    }
                }
            }
            return true; // Tabuleiro preenchido
        }
        solve(baseBoard);
        return baseBoard;
    }

    function isValidPlacement(currentBoard, num, row, col) {
        // Verifica linha
        for (let c = 0; c < gridSize; c++) {
            if (currentBoard[row][c] === num && c !== col) return false;
        }
        // Verifica coluna
        for (let r = 0; r < gridSize; r++) {
            if (currentBoard[r][col] === num && r !== row) return false;
        }
        // Verifica bloco
        const blockStartRow = row - (row % blockSize.rows);
        const blockStartCol = col - (col % blockSize.cols);
        for (let r = 0; r < blockSize.rows; r++) {
            for (let c = 0; c < blockSize.cols; c++) {
                if (currentBoard[blockStartRow + r][blockStartCol + c] === num &&
                    (blockStartRow + r !== row || blockStartCol + c !== col)) {
                    return false;
                }
            }
        }
        return true;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createPuzzle(solvedBoard, numToRemove) {
        let pBoard = solvedBoard.map(row => [...row]);
        let cells = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                cells.push({ r, c });
            }
        }
        shuffleArray(cells);

        let removedCount = 0;
        for (let i = 0; i < cells.length && removedCount < numToRemove; i++) {
            const { r, c } = cells[i];
            if (pBoard[r][c] !== 0) {
                // Para garantir a solubilidade (de forma simplificada), não vamos implementar
                // um verificador de solução única aqui, pois é complexo.
                // Apenas removemos. Para um Sudoku real, isso seria crucial.
                pBoard[r][c] = 0;
                removedCount++;
            }
        }
        return pBoard;
    }

    board = generateSolvedBoard();
    puzzleBoard = createPuzzle(board, numbersToRemove);

    // --- Renderização da UI ---
    function renderSudokuGrid() {
        ui.phaseDisplay.innerHTML = `
            <div class="p-3 rounded-lg shadow-md w-full max-w-lg mx-auto bg-gray-800 text-white">
                <h2 class="phase-title text-xl lg:text-2xl font-semibold mb-3 text-center">Mini Sudoku ${gridSize}x${gridSize}</h2>
                <p class="text-sm text-gray-300 mb-4 text-center">Preencha a grelha. Cada linha, coluna e bloco ${blockSize.rows}x${blockSize.cols} deve conter os números de 1 a ${gridSize} sem repetição.</p>
                <div id="sudoku-grid-container" class="grid gap-0.5 bg-gray-600 p-1 rounded shadow-lg mx-auto" style="width: fit-content;">
                    </div>
                <div class="text-center mt-4">
                    <button id="sudoku-check-button" class="button button-primary px-5 py-2 text-base">Verificar Solução</button>
                </div>
                <p id="sudoku-feedback" class="text-center h-6 mt-2"></p>
            </div>
        `;

        const gridContainer = document.getElementById('sudoku-grid-container');
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('input');
                cell.type = "text"; // Usar text para permitir apagar e para maxLength
                cell.inputMode = "numeric";
                cell.pattern = "[1-9]*";
                cell.maxLength = 1;
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.classList.add('sudoku-cell', 'w-10', 'h-10', 'sm:w-12', 'sm:h-12', 'text-center', 'text-lg', 'sm:text-xl', 'font-semibold', 'bg-gray-700', 'text-white', 'border', 'border-gray-500', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:bg-gray-600');

                if (puzzleBoard[r][c] !== 0) {
                    cell.value = puzzleBoard[r][c];
                    cell.disabled = true;
                    cell.classList.add('prefilled', 'text-sky-300');
                } else {
                    cell.addEventListener('input', handleCellInput);
                    cell.addEventListener('focus', (e) => e.target.select());
                }

                // Adiciona bordas mais grossas para os blocos
                if (blockSize.rows > 1 && (r + 1) % blockSize.rows === 0 && r < gridSize - 1) {
                    cell.style.borderBottomWidth = '3px';
                    cell.style.borderBottomColor = 'rgb(107 114 128)'; // gray-500
                }
                if (blockSize.cols > 1 && (c + 1) % blockSize.cols === 0 && c < gridSize - 1) {
                    cell.style.borderRightWidth = '3px';
                    cell.style.borderRightColor = 'rgb(107 114 128)'; // gray-500
                }
                gridContainer.appendChild(cell);
            }
        }
        document.getElementById('sudoku-check-button').addEventListener('click', checkSolution);
    }

    function handleCellInput(event) {
        const input = event.target;
        const value = input.value;
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);

        // Remove feedback de erro anterior
        input.classList.remove('error-cell', 'border-red-500');
        document.getElementById('sudoku-feedback').textContent = "";


        if (value === "") { // Permite apagar
            puzzleBoard[r][c] = 0;
            return;
        }

        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > gridSize) {
            input.value = ""; // Limpa inválido (não número ou fora do range)
            puzzleBoard[r][c] = 0;
            return;
        }

        // Atualiza o puzzleBoard com o input do usuário
        puzzleBoard[r][c] = num;

        // Validação em tempo real (opcional, mas bom para UX)
        if (!isValidPlacement(puzzleBoard, num, r, c)) {
            input.classList.add('error-cell', 'border-red-500', 'text-red-400');
            // Não precisa de mensagem global aqui, o highlight da célula é suficiente
        } else {
            input.classList.remove('error-cell', 'border-red-500', 'text-red-400');
            input.classList.add('text-white'); // Garante cor normal
        }
    }

    function checkSolution() {
        if (!gameActive) return;
        const feedbackEl = document.getElementById('sudoku-feedback');
        feedbackEl.textContent = "";
        let isCompletelyFilled = true;
        let isValid = true;

        // Remove todos os destaques de erro anteriores
        document.querySelectorAll('.sudoku-cell.error-cell').forEach(cell => {
            cell.classList.remove('error-cell', 'border-red-500', 'text-red-400');
            if(!cell.classList.contains('prefilled')) cell.classList.add('text-white');
        });


        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cellInput = document.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
                const cellValue = puzzleBoard[r][c]; // Usa o valor do puzzleBoard que foi atualizado

                if (cellValue === 0) {
                    isCompletelyFilled = false;
                    // Não precisa marcar como erro ainda, apenas não está completo
                    continue;
                }

                if (!isValidPlacement(puzzleBoard, cellValue, r, c)) {
                    isValid = false;
                    if (cellInput && !cellInput.disabled) { // Só marca erro em células editáveis
                        cellInput.classList.add('error-cell', 'border-red-500', 'text-red-400');
                    }
                }
            }
        }

        if (!isCompletelyFilled) {
            feedbackEl.textContent = "A grelha não está completamente preenchida.";
            feedbackEl.className = 'text-center h-6 mt-2 text-yellow-400';
            return;
        }

        if (isValid && isCompletelyFilled) {
            // Dupla verificação: comparar com a solução original 'board'
            // (Isso é mais para garantir que o puzzle gerado era bom)
            // Na prática, se isValid e isCompletelyFilled, o jogador resolveu o puzzle que lhe foi dado.
            let matchesOriginalSolution = true;
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (puzzleBoard[r][c] !== board[r][c]) {
                        matchesOriginalSolution = false;
                        break;
                    }
                }
                if (!matchesOriginalSolution) break;
            }

            // if (matchesOriginalSolution) { // Se quiser ser super estrito
            phaseCompleted(true, { text: "Sudoku resolvido corretamente!" });
            // } else {
            //     feedbackEl.textContent = "Solução válida, mas diferente da original. Bom trabalho!";
            //     feedbackEl.className = 'text-center h-6 mt-2 text-green-400';
            //     // Considerar como vitória mesmo assim, pois o puzzle pode ter múltiplas soluções
            //     // se a geração não for estritamente de solução única.
            //     setTimeout(() => phaseCompleted(true, { text: "Sudoku resolvido!" }), 1000);
            // }
        } else {
            feedbackEl.textContent = "Existem erros na grelha. Verifique os números destacados.";
            feedbackEl.className = 'text-center h-6 mt-2 text-red-400';
        }
    }

    // Inicialização
    ui.limitDisplay.textContent = ""; // Sudoku geralmente não tem limite de tempo global
    renderSudokuGrid();
}
