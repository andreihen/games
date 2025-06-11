function initNonogramPhase(config) {
    // Função para gerar uma solução aleatória
    function generateRandomSolution(rows, cols, density) {
        const solution = [];
        let filledCells = 0;
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const cellValue = (Math.random() < density) ? 1 : 0;
                if (cellValue === 1) filledCells++;
                row.push(cellValue);
            }
            solution.push(row);
        }
        if (rows * cols > 1) {
            if (filledCells === 0) {
                solution[Math.floor(Math.random() * rows)][Math.floor(Math.random() * cols)] = 1;
            } else if (filledCells === rows * cols) {
                solution[Math.floor(Math.random() * rows)][Math.floor(Math.random() * cols)] = 0;
            }
        }
        return solution;
    }

    // Função para extrair as pistas de uma linha ou coluna
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

    // Define tamanho do grid com base no nível
    const baseMinSize = 3;
    const baseMaxSize = 15;
    let currentGridSize = Math.min(baseMaxSize, baseMinSize + Math.floor(config.level / 2));
    const numRows = currentGridSize;
    const numCols = currentGridSize;

    // Define densidade de preenchimento conforme o nível
    const minDensity = 0.35;
    const maxDensity = 0.65;
    let currentDensity = Math.min(maxDensity, minDensity + (config.level * 0.015));

    // Gera a solução e inicializa a grade do usuário
    const solution = generateRandomSolution(numRows, numCols, currentDensity);
    const puzzleName = `Aleatório ${numRows}x${numCols}`;
    let userGrid = Array(numRows).fill(null).map(() => Array(numCols).fill(0));

    // Calcula as pistas originais de linhas e colunas
    const rowHints = solution.map(row => getHints(row));
    const colHints = Array(numCols).fill(null).map((_, c) => getHints(solution.map(row => row[c])));

    // Calcula quantas pistas (máximo) existem em qualquer coluna e em qualquer linha
    const maxColHints = Math.max(...colHints.map(h => h.length));
    const maxRowHints = Math.max(...rowHints.map(h => h.length));

    // Calcula o tamanho de cada célula com base na largura disponível
    const CELL_SIZE_MAX = window.innerWidth < 600 ? 22 : 26;
    const availableWidthForGrid = ui.phaseDisplay.offsetWidth ? ui.phaseDisplay.offsetWidth * 0.60 : 250;
    const calculatedCellSize = Math.min(CELL_SIZE_MAX, Math.floor(availableWidthForGrid / numCols));
    const cellSize = Math.max(14, calculatedCellSize);

    // Ajusta variáveis CSS customizadas para usar nos estilos inline
    document.documentElement.style.setProperty('--nonogram-cell-size', `${cellSize}px`);
    document.documentElement.style.setProperty('--nonogram-cols', numCols);
    document.documentElement.style.setProperty('--nonogram-rows', numRows);

    const LINE_COLOR = '#4b5563';       // Tailwind gray-600
    const HINT_BG_COLOR = '#1f2937';    // Tailwind gray-800
    const CORNER_BG_COLOR = '#1f2937';  // Tailwind gray-800
    const HINT_TEXT_COLOR = '#e5e7eb';  // Tailwind gray-200

    // Monta o HTML base (incluindo botão de “Verificar Solução”)
    let html = `
        <div class="p-1 md:p-2 rounded-lg shadow-md w-full max-w-fit mx-auto flex flex-col items-center">
            <h2 class="phase-title text-lg md:text-xl font-semibold mb-1 text-center">Nonogram: ${puzzleName}</h2>
            <p class="text-xs md:text-sm text-gray-300 mb-2 text-center">Clique para pintar, botão direito para 'X'.</p>
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
            <div class="text-center mt-3">
                <button id="nonogram-check" class="button button-primary px-4 py-1.5 text-sm">
                    Verificar Solução
                </button>
            </div>
        </div>`;

    // Insere o HTML no container principal
    ui.phaseDisplay.innerHTML = html;

    // Seleciona os contêineres onde vamos injetar as pistas e a grade interativa
    const gridContainer = document.getElementById('nonogram-grid-container');
    const colHintsContainer = document.getElementById('nonogram-col-hints-container');
    const rowHintsContainer = document.getElementById('nonogram-row-hints-container');

    //
    // === 1. RENDERIZAÇÃO DAS PISTAS DAS COLUNAS (sempre com mesmo “espaço” reservado) ===
    //
    colHints.forEach(hintList => {
        // Cada coluna de pista ficará dentro de um bloco vertical
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
        // Reservamos um espaço mínimo de altura para todas as colunas de pistas:
        hintBlock.style.minHeight = `calc(var(--nonogram-cell-size) * ${maxColHints})`;

        // Adiciona “linhas vazias” para empurrar as pistas reais para baixo
        for (let i = 0; i < maxColHints - hintList.length; i++) {
            const empty = document.createElement('p');
            empty.textContent = '';
            empty.style.fontSize = `${Math.max(8, cellSize * 0.4)}px`;
            empty.style.margin = '0';
            empty.classList.add('select-none');
            hintBlock.appendChild(empty);
        }
        // Adiciona as pistas reais, já alinhadas na parte inferior
        hintList.forEach(h => {
            const p = document.createElement('p');
            p.textContent = h;
            p.style.fontSize = `${Math.max(8, cellSize * 0.4)}px`;
            p.style.lineHeight = '1';
            p.style.margin = '0';
            p.classList.add('select-none');
            hintBlock.appendChild(p);
        });

        colHintsContainer.appendChild(hintBlock);
    });

    //
    // === 2. RENDERIZAÇÃO DAS PISTAS DAS LINHAS (cada linha tem a mesma altura reservada) ===
    //
    rowHints.forEach(hintList => {
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
        // Reservamos um espaço mínimo de largura para cada linha:
        hintBlock.style.minWidth = `calc(var(--nonogram-cell-size) * ${maxRowHints})`;

        // Adiciona “colunas vazias” à esquerda para empurrar as pistas reais para a direita
        for (let i = 0; i < maxRowHints - hintList.length; i++) {
            const empty = document.createElement('span');
            empty.textContent = '';
            empty.style.fontSize = `${Math.max(8, cellSize * 0.4)}px`;
            empty.style.margin = '0 1px';
            empty.classList.add('select-none');
            hintBlock.appendChild(empty);
        }
        // Adiciona as pistas reais
        hintList.forEach(h => {
            const span = document.createElement('span');
            span.textContent = h;
            span.style.fontSize = `${Math.max(8, cellSize * 0.4)}px`;
            span.style.lineHeight = '1';
            span.style.margin = '0 1px';
            span.classList.add('select-none');
            hintBlock.appendChild(span);
        });

        rowHintsContainer.appendChild(hintBlock);
    });

    //
    // === 3. FUNÇÃO PARA RENDERIZAR AS CÉLULAS INTERATIVAS DO NONOGRAM ===
    //
    function renderNonogramGrid() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('nonogram-cell');
                cell.style.border = 'none';

                // Linhas de reforço a cada 5 células (opcional)
                if (cellSize > 10) {
                    if (numCols > 5 && (c + 1) % 5 === 0 && c < numCols - 1) {
                        cell.style.borderRight = '2px solid #60a5fa';
                    }
                    if (numRows > 5 && (r + 1) % 5 === 0 && r < numRows - 1) {
                        cell.style.borderBottom = '2px solid #60a5fa';
                    }
                }

                // Aplica classes conforme o estado do usuário (pintado ou marcado com X)
                if (userGrid[r][c] === 1) cell.classList.add('filled');
                else if (userGrid[r][c] === 2) cell.classList.add('marked');

                // Clique esquerdo para pintar/despintar
                cell.addEventListener('click', () => {
                    userGrid[r][c] = (userGrid[r][c] === 1) ? 0 : 1;
                    renderNonogramGrid();
                });

                // Clique direito para marcar/desmarcar com X
                cell.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    userGrid[r][c] = (userGrid[r][c] === 2) ? 0 : 2;
                    renderNonogramGrid();
                });

                gridContainer.appendChild(cell);
            }
        }
    }

    // Chama pela primeira vez para renderizar a grade vazia
    setTimeout(() => {
        renderNonogramGrid();
    }, 50);

    //
    // === 4. VERIFICAÇÃO DA SOLUÇÃO BASEADA EM PISTAS (ACEITA QUALQUER CONFIGURAÇÃO VÁLIDA) ===
    //
    document.getElementById('nonogram-check').addEventListener('click', () => {
        let isValid = true;

        // Verifica linha por linha
        for (let r = 0; r < numRows; r++) {
            const userRowHints = getHints(userGrid[r]);
            if (JSON.stringify(userRowHints) !== JSON.stringify(rowHints[r])) {
                isValid = false;
                break;
            }
        }

        // Só verifica colunas se as linhas estiverem corretas
        if (isValid) {
            for (let c = 0; c < numCols; c++) {
                const userCol = userGrid.map(row => row[c]);
                const userColHints = getHints(userCol);
                if (JSON.stringify(userColHints) !== JSON.stringify(colHints[c])) {
                    isValid = false;
                    break;
                }
            }
        }

        if (isValid) {
            phaseCompleted(true, { text: `Excelente! Nonogram ${puzzleName} resolvido!` });
        } else {
            phaseCompleted(false, { reason: "A solução não está correta com base nas dicas. Verifique as linhas e colunas." });
        }
    });
}
