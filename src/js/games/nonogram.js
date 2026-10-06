GameRegistry.register('nonogram', (session) => {
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
    function initNonogramPhase(config) {
        function getHints(line) {
            const hints = [];
            let count = 0;
            for (let i = 0; i < line.length; i++) {
                if (line[i] === 1) {
                    count++;
                } else {
                    if (count > 0) hints.push(count);
                    count = 0;
                }
            }
            if (count > 0) hints.push(count);
            return hints.length > 0 ? hints : [0];
        }
        const numRows = config.size,
            numCols = config.size;
        const generated = NonogramEngine.generate(
            config.size,
            config.density,
            session.random,
            config.difficulty === 'easy'
        );
        const solution = generated.board;
        const puzzleName = `${numRows}x${numCols} · solução única`;
        let userGrid = Array(numRows)
            .fill(null)
            .map(() => Array(numCols).fill(0));
        const rowHints = solution.map((row) => getHints(row));
        const colHints = Array(numCols)
            .fill(null)
            .map((_, c) => getHints(solution.map((row) => row[c])));
        const maxColHints = Math.max(...colHints.map((h) => h.length));
        const maxRowHints = Math.max(...rowHints.map((h) => h.length));
        const CELL_SIZE_MAX = 36;
        const availableWidthForGrid = ui.phaseDisplay.offsetWidth
            ? ui.phaseDisplay.offsetWidth * 0.6
            : 250;
        const calculatedCellSize = Math.min(
            CELL_SIZE_MAX,
            Math.floor(availableWidthForGrid / numCols)
        );
        const cellSize = Math.max(28, calculatedCellSize);
        document.documentElement.style.setProperty('--nonogram-cell-size', `${cellSize}px`);
        document.documentElement.style.setProperty('--nonogram-cols', numCols);
        document.documentElement.style.setProperty('--nonogram-rows', numRows);

        const LINE_COLOR = '#4b5563'; // Tailwind gray-600
        const HINT_BG_COLOR = '#1f2937'; // Tailwind gray-800
        const CORNER_BG_COLOR = '#1f2937'; // Tailwind gray-800
        const HINT_TEXT_COLOR = '#e5e7eb'; // Tailwind gray-200
        let html = `
        <div class="p-1 md:p-2 rounded-lg shadow-md w-full max-w-fit mx-auto flex flex-col items-center">
            <h2 class="phase-title text-lg md:text-xl font-semibold mb-1 text-center">Nonogram: ${puzzleName}</h2>
            <p class="text-xs md:text-sm text-gray-300 mb-2 text-center">Use Pintar ou Marcar X. No desktop, o botão direito também marca X.</p>
            <div id="nonogram-layout-container" class="nonogram-layout-container"
                 style="display: grid;
                        grid-template-columns: auto repeat(var(--nonogram-cols), var(--nonogram-cell-size));
                        grid-template-rows: auto repeat(var(--nonogram-rows), var(--nonogram-cell-size));
                        gap: 1px;
                        border: 1px solid ${LINE_COLOR};
                        background-color: ${LINE_COLOR};
                        margin: auto;">
                <!-- CANTO SUPERIOR-ESQUERDO -->
                <div id="nonogram-corner" style="grid-area: 1 / 1 / 2 / 2; background-color: ${CORNER_BG_COLOR};"></div>

                <!-- CONTÊINER DE PISTAS DAS COLUNAS -->
                <div id="nonogram-col-hints-container"
                     style="grid-area: 1 / 2 / 2 / span var(--nonogram-cols);
                            display: flex;
                            flex-direction: row;
                            align-items: flex-end;
                            justify-content: space-between;
                            background-color: ${LINE_COLOR};">
                </div>

                <!-- CONTÊINER DE PISTAS DAS LINHAS -->
                <div id="nonogram-row-hints-container"
                     style="grid-area: 2 / 1 / span var(--nonogram-rows) / 2;
                            display: flex;
                            flex-direction: column;
                            align-items: flex-end;
                            justify-content: space-between;
                            background-color: ${LINE_COLOR};">
                </div>

                <!-- GRADE PRINCIPAL DO NONOGRAM -->
                <div id="nonogram-grid-container" class="nonogram-grid"
                     style="grid-area: 2 / 2 / span var(--nonogram-rows) / span var(--nonogram-cols);
                            display: grid;
                            grid-template-columns: repeat(var(--nonogram-cols), var(--nonogram-cell-size));
                            grid-template-rows: repeat(var(--nonogram-rows), var(--nonogram-cell-size));
                            gap: 1px;
                            background-color: ${LINE_COLOR};
                            margin: 0;
                            border: 0;">
                </div>
            </div>

            <!-- BOTÃO PARA VERIFICAR A SOLUÇÃO -->
            <div class="text-center mt-3"><button id="nonogram-mode" class="button button-secondary px-4 py-2" aria-pressed="false">Modo: Pintar</button>
                <button id="nonogram-check" class="button button-primary px-4 py-1.5 text-sm">
                    Verificar Solução
                </button>
            </div>
        </div>`;
        ui.phaseDisplay.innerHTML = html;
        const gridContainer = document.getElementById('nonogram-grid-container');
        const colHintsContainer = document.getElementById('nonogram-col-hints-container');
        const rowHintsContainer = document.getElementById('nonogram-row-hints-container');
        colHints.forEach((hintList) => {
            const hintBlock = document.createElement('div');
            hintBlock.style.width = 'var(--nonogram-cell-size)';
            hintBlock.style.backgroundColor = HINT_BG_COLOR;
            hintBlock.style.display = 'flex';
            hintBlock.style.flexDirection = 'column';
            hintBlock.style.alignItems = 'center';
            hintBlock.style.justifyContent = 'flex-end';
            hintBlock.style.boxSizing = 'border-box';
            hintBlock.style.overflow = 'hidden';
            hintBlock.style.color = HINT_TEXT_COLOR;
            hintBlock.style.minHeight = `calc(var(--nonogram-cell-size) * ${maxColHints})`;
            for (let i = 0; i < maxColHints - hintList.length; i++) {
                const empty = document.createElement('p');
                empty.textContent = '';
                empty.style.fontSize = `${Math.max(12, cellSize * 0.4)}px`;
                empty.style.margin = '0';
                empty.classList.add('select-none');
                hintBlock.appendChild(empty);
            }
            hintList.forEach((h) => {
                const p = document.createElement('p');
                p.textContent = h;
                p.style.fontSize = `${Math.max(12, cellSize * 0.4)}px`;
                p.style.lineHeight = '1';
                p.style.margin = '0';
                p.classList.add('select-none');
                hintBlock.appendChild(p);
            });

            colHintsContainer.appendChild(hintBlock);
        });
        rowHints.forEach((hintList) => {
            const hintBlock = document.createElement('div');
            hintBlock.style.height = 'var(--nonogram-cell-size)';
            hintBlock.style.backgroundColor = HINT_BG_COLOR;
            hintBlock.style.display = 'flex';
            hintBlock.style.flexDirection = 'row';
            hintBlock.style.alignItems = 'center';
            hintBlock.style.justifyContent = 'flex-end';
            hintBlock.style.paddingRight = '3px';
            hintBlock.style.boxSizing = 'border-box';
            hintBlock.style.overflow = 'hidden';
            hintBlock.style.color = HINT_TEXT_COLOR;
            hintBlock.style.minWidth = `calc(var(--nonogram-cell-size) * ${maxRowHints})`;
            for (let i = 0; i < maxRowHints - hintList.length; i++) {
                const empty = document.createElement('span');
                empty.textContent = '';
                empty.style.fontSize = `${Math.max(12, cellSize * 0.4)}px`;
                empty.style.margin = '0 1px';
                empty.classList.add('select-none');
                hintBlock.appendChild(empty);
            }
            hintList.forEach((h) => {
                const span = document.createElement('span');
                span.textContent = h;
                span.style.fontSize = `${Math.max(12, cellSize * 0.4)}px`;
                span.style.lineHeight = '1';
                span.style.margin = '0 1px';
                span.classList.add('select-none');
                hintBlock.appendChild(span);
            });

            rowHintsContainer.appendChild(hintBlock);
        });
        let markMode = false;
        session.listen(document.getElementById('nonogram-mode'), 'click', (event) => {
            markMode = !markMode;
            event.target.textContent = markMode ? 'Modo: Marcar X' : 'Modo: Pintar';
            event.target.setAttribute('aria-pressed', markMode);
        });
        function renderNonogramGrid() {
            gridContainer.innerHTML = '';
            for (let r = 0; r < numRows; r++) {
                for (let c = 0; c < numCols; c++) {
                    const cell = document.createElement('div');
                    cell.classList.add('nonogram-cell');
                    cell.style.border = 'none';
                    cell.dataset.r = r;
                    cell.dataset.c = c;
                    if (cellSize > 10) {
                        if (numCols > 5 && (c + 1) % 5 === 0 && c < numCols - 1) {
                            cell.style.borderRight = '2px solid #60a5fa';
                        }
                        if (numRows > 5 && (r + 1) % 5 === 0 && r < numRows - 1) {
                            cell.style.borderBottom = '2px solid #60a5fa';
                        }
                    }
                    if (userGrid[r][c] === 1) cell.classList.add('filled');
                    else if (userGrid[r][c] === 2) cell.classList.add('marked');
                    session.listen(cell, 'click', () => {
                        const value = markMode ? 2 : 1;
                        userGrid[r][c] = userGrid[r][c] === value ? 0 : value;
                        renderNonogramGrid();
                    });
                    session.listen(cell, 'contextmenu', (e) => {
                        e.preventDefault();
                        userGrid[r][c] = userGrid[r][c] === 2 ? 0 : 2;
                        renderNonogramGrid();
                    });

                    gridContainer.appendChild(cell);
                }
            }
        }
        renderNonogramGrid();
        session.listen(document.getElementById('nonogram-check'), 'click', () => {
            let isValid = true;
            for (let r = 0; r < numRows; r++) {
                const userRowHints = getHints(userGrid[r]);
                if (JSON.stringify(userRowHints) !== JSON.stringify(rowHints[r])) {
                    isValid = false;
                    break;
                }
            }
            if (isValid) {
                for (let c = 0; c < numCols; c++) {
                    const userCol = userGrid.map((row) => row[c]);
                    const userColHints = getHints(userCol);
                    if (JSON.stringify(userColHints) !== JSON.stringify(colHints[c])) {
                        isValid = false;
                        break;
                    }
                }
            }

            if (isValid) {
                session.score.answer(true, 500);
                phaseCompleted(true, { text: `Excelente! Nonogram ${puzzleName} resolvido!` });
            } else {
                session.score.answer(false);
                showModal('As pistas ainda não conferem. Verifique as linhas e colunas.');
            }
        });
    }

    return {
        init: initNonogramPhase,
        destroy: session.destroy,
        pause: session.pause,
        resume: session.resume
    };
});
