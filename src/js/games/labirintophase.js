function initLabirintoPhase(config) {
    const gridSizes = [7, 9, 11, 13, 15, 17, 19, 21, 23, 25]; 
    const numKeysOptions = [0, 1, 1, 1, 2, 2, 2, 3, 3, 3]; 

    const size = gridSizes[Math.min(config.level, gridSizes.length - 1)];
    const numKeys = numKeysOptions[Math.min(config.level, numKeysOptions.length - 1)];
    const cellSize = Math.floor(320 / size); 

    let maze = Array(size).fill(null).map(() => Array(size).fill(1)); 
    let playerPos = { r: 1, c: 1 };
    let exitPos = { r: size - 2, c: size - 2 };
    let keys = []; 
    let doors = []; 
    let collectedKeyIds = new Set();

    const moveLimits = [50, 60, 75, 90, 110, 130, 150, 180, 210, 250];
    currentPhaseAttemptsLeft = moveLimits[Math.min(config.level, moveLimits.length - 1)];
    ui.limitDisplay.textContent = `Movimentos restantes: ${currentPhaseAttemptsLeft}`;
    let movesMade = 0;

    function carvePassages(r, c) {
        maze[r][c] = 0; 
        const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]]; 
        directions.sort(() => Math.random() - 0.5); 

        for (let [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const wallR = r + dr / 2;
            const wallC = c + dc / 2;

            if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && maze[nr][nc] === 1) {
                maze[wallR][wallC] = 0; 
                carvePassages(nr, nc);
            }
        }
    }
    carvePassages(playerPos.r, playerPos.c); 
    maze[exitPos.r][exitPos.c] = 0;
    if (maze[exitPos.r-1] && maze[exitPos.r-1][exitPos.c] === 1 && maze[exitPos.r-1][exitPos.c-1] === 0 ) maze[exitPos.r-1][exitPos.c] = 0;
    if (maze[exitPos.r][exitPos.c-1] === 1 && maze[exitPos.r-1] && maze[exitPos.r-1][exitPos.c-1] === 0) maze[exitPos.r][exitPos.c-1] = 0;

    for (let i = 0; i < numKeys; i++) {
        let kr, kc, dr, dc;
        do { kr = Math.floor(Math.random() * (size - 2)) + 1; kc = Math.floor(Math.random() * (size - 2)) + 1; }
        while (maze[kr][kc] !== 0 || (kr === playerPos.r && kc === playerPos.c) || (kr === exitPos.r && kc === exitPos.c) || keys.find(k=>k.r===kr && k.c===kc));
        keys.push({ r: kr, c: kc, id: i, collected: false });

        do { dr = Math.floor(Math.random() * (size - 2)) + 1; dc = Math.floor(Math.random() * (size - 2)) + 1; }
        while (maze[dr][dc] !== 0 || (dr === playerPos.r && dc === playerPos.c) || (dr === exitPos.r && dc === exitPos.c) || (dr === kr && dc === kc) || doors.find(d=>d.r===dr && d.c===dc));
        doors.push({ r: dr, c: dc, keyId: i, open: false });
    }

    ui.phaseDisplay.innerHTML = `
        <div class="p-2 md:p-3 rounded-lg shadow-md w-full max-w-lg mx-auto flex flex-col items-center">
            <h2 class="phase-title text-lg font-semibold mb-1 text-center">Labirinto Especial</h2>
            <p class="text-xs text-gray-300 mb-2 text-center">Use as setas para mover. Colete 🔑 para abrir 🚪. Chegue ao 🏁.</p>
            <div id="maze-grid-container" class="maze-grid" 
                 style="grid-template-columns: repeat(${size}, ${cellSize}px); width: ${size * cellSize}px; height: ${size * cellSize}px;">
            </div>
            <div id="maze-inventory" class="maze-inventory mt-2">Chaves: 0/${numKeys}</div>
        </div>
    `;

    const gridContainer = document.getElementById('maze-grid-container');
    const inventoryDiv = document.getElementById('maze-inventory');
    let keydownHandler = null; 

    function renderMaze() {
        gridContainer.innerHTML = '';
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('maze-cell');
                cellDiv.style.width = `${cellSize}px`;
                cellDiv.style.height = `${cellSize}px`;

                if (maze[r][c] === 0) cellDiv.classList.add('path');
                
                if (r === playerPos.r && c === playerPos.c) cellDiv.classList.add('player');
                else if (r === exitPos.r && c === exitPos.c) cellDiv.classList.add('exit');
                else if (r === playerPos.r && c === playerPos.c && r === exitPos.r && c === exitPos.c) { 
                     cellDiv.classList.add('player'); 
                }

                const key = keys.find(k => k.r === r && k.c === c && !k.collected);
                if (key) {
                    cellDiv.classList.add('key');
                    cellDiv.textContent = '🔑';
                }

                const door = doors.find(d => d.r === r && d.c === c);
                if (door) {
                    cellDiv.classList.add('door');
                    if (door.open) cellDiv.classList.add('open');
                    else cellDiv.textContent = '🚪';
                }
                gridContainer.appendChild(cellDiv);
            }
        }
        inventoryDiv.textContent = `Chaves: ${collectedKeyIds.size}/${numKeys}`;
    }

    function movePlayer(dr, dc) {
        if (!gameActive || currentPhaseAttemptsLeft - movesMade <= 0) return;

        const newR = playerPos.r + dr;
        const newC = playerPos.c + dc;

        if (newR >= 0 && newR < size && newC >= 0 && newC < size && maze[newR][newC] === 0) {
            const door = doors.find(d => d.r === newR && d.c === newC);
            if (door && !door.open && !collectedKeyIds.has(door.keyId)) {
                return; 
            }
            if (door && !door.open && collectedKeyIds.has(door.keyId)) {
                door.open = true; 
            }

            playerPos = { r: newR, c: newC };
            movesMade++;
            ui.limitDisplay.textContent = `Movimentos restantes: ${currentPhaseAttemptsLeft - movesMade}`;

            const key = keys.find(k => k.r === newR && k.c === newC && !k.collected);
            if (key) {
                key.collected = true;
                collectedKeyIds.add(key.id);
                inventoryDiv.textContent = `Chaves: ${collectedKeyIds.size}/${numKeys}`;
            }
            renderMaze();

            if (newR === exitPos.r && newC === exitPos.c) {
                if(keydownHandler) document.removeEventListener('keydown', keydownHandler);
                phaseCompleted(true, { text: `Labirinto concluído em ${movesMade} movimentos!` });
            } else if (currentPhaseAttemptsLeft - movesMade <= 0) {
                 if(keydownHandler) document.removeEventListener('keydown', keydownHandler);
                 phaseCompleted(false, { reason: "Limite de movimentos excedido!" });
            }
        }
    }
    
    keydownHandler = (e) => {
        if (!gameActive) return;
        switch (e.key) {
            case "ArrowUp": case "w": movePlayer(-1, 0); break;
            case "ArrowDown": case "s": movePlayer(1, 0); break;
            case "ArrowLeft": case "a": movePlayer(0, -1); break;
            case "ArrowRight": case "d": movePlayer(0, 1); break;
        }
        e.preventDefault(); 
    };
    document.addEventListener('keydown', keydownHandler);
    
    const originalPhaseCompletedLab = phaseCompleted;
    phaseCompleted = (success, details) => { // Sobrescreve temporariamente para limpar o listener
        if(keydownHandler) document.removeEventListener('keydown', keydownHandler);
        phaseCompleted = originalPhaseCompletedLab; // Restaura a original
        originalPhaseCompletedLab(success, details);
    };
    renderMaze();
}