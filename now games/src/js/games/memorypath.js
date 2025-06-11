// memorypath.js (v1.1 - Corrigido)

// As variáveis agora usam o prefixo 'mp_' para evitar conflitos.
let mp_gridClickListener = null;

function cleanupMemoryPath() {
    const grid = document.getElementById('mp-grid-container');
    if (grid && mp_gridClickListener) {
        grid.removeEventListener('click', mp_gridClickListener);
        mp_gridClickListener = null;
    }
}

function initMemoryPathPhase(config) {
    cleanupMemoryPath();

    // --- Configuração da Fase ---
    const level = config.level;
    const settings = {
        gridSize: 4 + Math.floor(level / 4),
        pathLength: 3 + Math.floor(level / 2),
    };
    settings.gridSize = Math.min(8, settings.gridSize);
    settings.pathLength = Math.min(Math.floor(settings.gridSize * settings.gridSize / 2), settings.pathLength);

    // --- Estado do Jogo ---
    let path = [];
    let playerPathIndex = 0;
    let isPlayerTurn = false;

    // --- Geração da Trilha ---
    function generatePath() {
        let attempts = 0;
        while (attempts < 100) {
            let tempPath = [];
            let visited = new Set();
            let r = Math.floor(Math.random() * settings.gridSize);
            let c = Math.floor(Math.random() * settings.gridSize);

            tempPath.push({ r, c });
            visited.add(`${r},${c}`);

            for (let i = 1; i < settings.pathLength; i++) {
                const neighbors = [
                    { r: r - 1, c: c }, { r: r + 1, c: c },
                    { r: r, c: c - 1 }, { r: r, c: c + 1 }
                ].filter(n => 
                    n.r >= 0 && n.r < settings.gridSize &&
                    n.c >= 0 && n.c < settings.gridSize &&
                    !visited.has(`${n.r},${n.c}`)
                );

                if (neighbors.length === 0) break;

                const nextStep = neighbors[Math.floor(Math.random() * neighbors.length)];
                r = nextStep.r;
                c = nextStep.c;
                tempPath.push({ r, c });
                visited.add(`${r},${c}`);
            }

            if (tempPath.length === settings.pathLength) {
                return tempPath;
            }
            attempts++;
        }
        return [{r:0,c:0}, {r:0,c:1}, {r:1,c:1}]; // Fallback
    }

    // --- Renderização ---
    ui.phaseDisplay.innerHTML = `
        <div id="mp-container" class="flex flex-col items-center gap-4 w-full">
            <h2 class="phase-title text-2xl font-bold">Trilha da Memória</h2>
            <p id="mp-status" class="text-lg text-gray-300 h-8">Memorize a trilha...</p>
            <div id="mp-grid-container" class="grid gap-2 p-2 bg-gray-900 rounded-lg">
            </div>
        </div>
    `;

    setTimeout(() => {
        const gridEl = document.getElementById('mp-grid-container');
        const statusEl = document.getElementById('mp-status');

        if (!gridEl || !statusEl) {
            console.error("Falha ao renderizar a UI da Trilha da Memória.");
            return;
        }

        function renderGrid() {
            gridEl.innerHTML = '';
            gridEl.style.gridTemplateColumns = `repeat(${settings.gridSize}, 1fr)`;
            for (let r = 0; r < settings.gridSize; r++) {
                for (let c = 0; c < settings.gridSize; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'mp-cell';
                    cell.dataset.r = r;
                    cell.dataset.c = c;
                    gridEl.appendChild(cell);
                }
            }
        }

        async function showPathAnimation() {
            for (let i = 0; i < path.length; i++) {
                const step = path[i];
                const cellEl = gridEl.querySelector(`[data-r="${step.r}"][data-c="${step.c}"]`);
                if (cellEl) {
                    cellEl.classList.add('path-show');
                    await new Promise(res => setTimeout(res, 400 - level * 10));
                    cellEl.classList.remove('path-show');
                    await new Promise(res => setTimeout(res, 100));
                }
            }
            isPlayerTurn = true;
            statusEl.textContent = 'Sua vez! Recrie a trilha.';
        }

        function revealCorrectPath() {
            path.forEach(step => {
                const cellEl = gridEl.querySelector(`[data-r="${step.r}"][data-c="${step.c}"]`);
                if (cellEl) cellEl.classList.add('revealed');
            });
        }
        
        mp_gridClickListener = (event) => {
            if (!isPlayerTurn) return;
            const cell = event.target.closest('.mp-cell');
            if (!cell || cell.classList.contains('correct')) return;

            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);
            const expectedStep = path[playerPathIndex];

            if (r === expectedStep.r && c === expectedStep.c) {
                cell.classList.add('correct');
                playerPathIndex++;
                if (playerPathIndex === path.length) {
                    isPlayerTurn = false;
                    statusEl.textContent = 'Trilha completa!';
                    phaseCompleted(true, { text: `Você memorizou uma trilha de ${path.length} passos!` });
                }
            } else {
                isPlayerTurn = false;
                cell.classList.add('incorrect');
                statusEl.textContent = 'Ops! Trilha incorreta.';
                revealCorrectPath();
                setTimeout(() => {
                    phaseCompleted(false, { reason: 'Você se perdeu na trilha.' });
                }, 2000);
            }
        };

        path = generatePath();
        renderGrid();
        gridEl.addEventListener('click', mp_gridClickListener);
        setTimeout(showPathAnimation, 1000);
    }, 0);
}
