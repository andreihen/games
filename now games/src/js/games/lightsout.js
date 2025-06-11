function initLightsOutPhase(config) { 
    const gridSizes = [3, 3, 4, 4, 4, 5, 5, 5, 5, 5]; 
    const gridSize = gridSizes[Math.min(config.level, gridSizes.length - 1)];
    let lights = Array(gridSize * gridSize).fill(false);
    const setupMovesFactor = [0.5, 0.6, 0.7, 0.8, 1, 1.1, 1.2, 1.3, 1.4, 1.5]; 
    const setupMoves = Math.floor(gridSize * gridSize * setupMovesFactor[Math.min(config.level, setupMovesFactor.length -1)]);
    function applyToggle(row, col, arr) {
        const indices = [[row,col]];
        if(row>0)indices.push([row-1,col]); if(row<gridSize-1)indices.push([row+1,col]);
        if(col>0)indices.push([row,col-1]); if(col<gridSize-1)indices.push([row,col+1]);
        indices.forEach(([r,c]) => arr[r*gridSize+c] = !arr[r*gridSize+c]);
    }
    for(let i=0; i < setupMoves; i++) applyToggle(Math.floor(Math.random()*gridSize), Math.floor(Math.random()*gridSize), lights);
    if (lights.every(l => !l)) applyToggle(0,0,lights); 
    ui.phaseDisplay.innerHTML = `
        <div class="p-3 rounded-lg shadow-md w-full max-w-sm mx-auto">
            <h2 class="phase-title text-lg font-semibold mb-2 text-center">Apague as Luzes</h2>
            <p class="text-sm text-gray-300 mb-3 text-center">Clique para mudar a luz e as adjacentes. Apague todas!</p>
            <div id="lights-out-grid-container" class="lights-out-grid mx-auto" style="grid-template-columns: repeat(${gridSize}, 1fr); width: ${gridSize * 45}px;"></div>
            <p id="lights-out-moves" class="text-center text-sm text-gray-400 mt-2">Movimentos: 0</p>
        </div>`;
    const gridContainer = document.getElementById('lights-out-grid-container');
    const movesP = document.getElementById('lights-out-moves');
    let moveCount = 0;
    function renderGridLO() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const btn = document.createElement('button');
                btn.classList.add('light-button');
                btn.classList.toggle('light-on', lights[r*gridSize+c]);
                btn.classList.toggle('light-off', !lights[r*gridSize+c]);
                btn.addEventListener('click', () => {
                    if (!gameActive) return;
                    applyToggle(r,c,lights);
                    moveCount++; 
                    movesP.textContent = `Movimentos: ${moveCount}`;
                    renderGridLO(); 
                    if (lights.every(l => !l)) {
                        phaseCompleted(true, {text: `Resolvido em ${moveCount} movimentos!`});
                    } 
                });
                gridContainer.appendChild(btn);
            }
        }
    }
    renderGridLO();
}