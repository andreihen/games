GameRegistry.register('logicmaze', session => {
    const ui = session.ui;
    const setTimeout = session.timeout, setInterval = session.interval, clearTimeout = session.clear, clearInterval = session.clear;
    const requestAnimationFrame = session.frame, cancelAnimationFrame = session.clear;
    const phaseCompleted = session.complete, showModal = session.notify;
    let currentPhaseTimerId = null, currentPhaseAttemptsLeft = null;
    function clearPhaseTimer() { session.clear(currentPhaseTimerId); currentPhaseTimerId = null; }

let lm_keydownHandler = null;

function cleanupLogicMaze() {
    if (lm_keydownHandler) {
        document.removeEventListener('keydown', lm_keydownHandler);
        lm_keydownHandler = null;
    }
    const puzzleModal = document.getElementById('lm-puzzle-modal');
    if (puzzleModal) {
        puzzleModal.remove();
    }
}

function initLogicMazePhase(config) {
    cleanupLogicMaze();
    const level = config.level;
    const settings = {
        gridSize: 9 + Math.floor(level / 2) * 2,
        numDoors: 2 + Math.floor(level / 2),
    };
    settings.gridSize = Math.min(21, settings.gridSize);
    settings.numDoors = Math.min(8, settings.numDoors);
    const cellSize = Math.floor(Math.min(400, Math.max(240, window.innerWidth-70)) / settings.gridSize);
    let maze = Array(settings.gridSize).fill(null).map(() => Array(settings.gridSize).fill(1));
    let playerPos = { r: 1, c: 1 };
    let exitPos = { r: settings.gridSize - 2, c: settings.gridSize - 2 };
    let doors = [];
    let isPuzzleActive = false;
    const puzzleGenerators = [
        { // Padrão de Cores
            generate: () => {
                const colors = ['🔴', '🔵', '🟢', '🟡'];
                const pattern = [colors[0], colors[1], colors[0]];
                return {
                    type: 'color',
                    question: `${pattern.join(' ')} ...?`,
                    options: GameAlgorithms.shuffle(colors),
                    correctAnswer: colors[1]
                };
            }
        },
        { // Sequência Numérica
            generate: () => {
                const start = Math.floor(Math.random() * 5) + 1;
                const step = Math.floor(Math.random() * 3) + 2;
                const pattern = [start, start + step, start + step * 2];
                const answer = start + step * 3;
                return {
                    type: 'sequence',
                    question: `${pattern.join(', ')} ...?`,
                    options: GameAlgorithms.shuffle([answer, answer + 1, answer - 1]),
                    correctAnswer: answer
                };
            }
        },
        { // Pergunta Simples
            generate: () => {
                return {
                    type: 'trivia',
                    question: 'Qual forma tem 3 lados?',
                    options: ['■', '●', '▲'],
                    correctAnswer: '▲'
                };
            }
        }
    ];
    function carvePassages(r, c) {
        maze[r][c] = 0;
        const directions = GameAlgorithms.shuffle([[0, 2], [2, 0], [0, -2], [-2, 0]]);
        for (let [dr, dc] of directions) {
            const nr = r + dr, nc = c + dc;
            if (nr > 0 && nr < settings.gridSize - 1 && nc > 0 && nc < settings.gridSize - 1 && maze[nr][nc] === 1) {
                maze[r + dr / 2][c + dc / 2] = 0;
                carvePassages(nr, nc);
            }
        }
    }
    carvePassages(playerPos.r, playerPos.c);
    maze[exitPos.r][exitPos.c] = 0; // Garante que a saída esteja acessível
    function route(r,c,visited=new Set()) {
        if(r===exitPos.r&&c===exitPos.c)return [{r,c}]; visited.add(`${r},${c}`);
        for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nr=r+dr,nc=c+dc; if(maze[nr]?.[nc]===0&&!visited.has(`${nr},${nc}`)) { const rest=route(nr,nc,visited); if(rest)return [{r,c},...rest]; } }
        return null;
    }
    const doorCandidates = GameAlgorithms.shuffle(route(1,1).slice(1,-1));
    for(const pos of doorCandidates.slice(0, settings.numDoors)) doors.push({...pos,open:false,puzzle:puzzleGenerators[Math.floor(Math.random()*puzzleGenerators.length)].generate()});
        ui.phaseDisplay.innerHTML = `
        <div id="lm-container" class="flex flex-col items-center gap-4 w-full">
            <h2 class="phase-title text-2xl font-bold">Labirinto Lógico</h2>
            <p class="text-sm text-gray-300">Use setas, WASD ou os botões para mover. Resolva os enigmas (❓) para abrir as portas.</p>
            <div id="lm-grid-container" class="grid gap-0 border-2 border-gray-600"></div><div id="lm-touch-controls" class="direction-pad"><button data-direction="up" aria-label="Mover para cima">↑</button><button data-direction="left" aria-label="Mover para esquerda">←</button><button data-direction="down" aria-label="Mover para baixo">↓</button><button data-direction="right" aria-label="Mover para direita">→</button></div>
        </div>
    `;

    const gridContainer = document.getElementById('lm-grid-container');

    function renderMaze() {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${settings.gridSize}, ${cellSize}px)`;
        for (let r = 0; r < settings.gridSize; r++) {
            for (let c = 0; c < settings.gridSize; c++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'lm-cell';
                cellDiv.style.width = `${cellSize}px`;
                cellDiv.style.height = `${cellSize}px`;
                if (maze[r][c] === 1) cellDiv.classList.add('wall');
                if (r === playerPos.r && c === playerPos.c) cellDiv.classList.add('player');
                if (r === exitPos.r && c === exitPos.c) { cellDiv.classList.add('exit'); cellDiv.textContent = 'S'; }
                
                const door = doors.find(d => d.r === r && d.c === c);
                if (door) {
                    cellDiv.classList.add('door');
                    if (!door.open) cellDiv.textContent = '❓'; else cellDiv.classList.add('open');
                }
                gridContainer.appendChild(cellDiv);
            }
        }
    }
    function movePlayer(dr, dc) {
        if (!session.active || isPuzzleActive) return;
        const newR = playerPos.r + dr;
        const newC = playerPos.c + dc;

        if (newR < 0 || newR >= settings.gridSize || newC < 0 || newC >= settings.gridSize || maze[newR][newC] === 1) return;

        const door = doors.find(d => d.r === newR && d.c === newC);
        if (door && !door.open) {
            showPuzzleModal(door);
            return;
        }

        playerPos = { r: newR, c: newC };
        renderMaze();

        if (newR === exitPos.r && newC === exitPos.c) {
            phaseCompleted(true, { text: `Você escapou do Labirinto Lógico!` });
        }
    }
    function showPuzzleModal(door) {
        isPuzzleActive = true;
        
        const existingModal = document.getElementById('lm-puzzle-modal');
        if (existingModal) existingModal.remove();

        const puzzle = door.puzzle;
        const modal = document.createElement('div');
        modal.id = 'lm-puzzle-modal';
        modal.className = 'lm-modal-overlay';
        modal.innerHTML = `
            <div class="lm-modal-content">
                <p id="lm-puzzle-question" class="text-xl mb-4">${puzzle.question}</p>
                <div id="lm-puzzle-options" class="flex justify-center gap-4">
                    ${puzzle.options.map(opt => `<button class="button button-choice px-6 py-2 text-lg">${opt}</button>`).join('')}
                </div>
                <p id="lm-feedback" class="h-6 mt-4 text-red-500"></p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-labelledby','lm-puzzle-question');
        document.getElementById('lm-container').inert = true;
        modal.querySelector('button').focus();
        session.listen(modal, 'keydown', e => { if (e.key==='Tab') { const buttons=[...modal.querySelectorAll('button')]; const index=buttons.indexOf(document.activeElement); e.preventDefault(); buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus(); } });

        session.listen(document.getElementById('lm-puzzle-options'), 'click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            if (btn.textContent == puzzle.correctAnswer) {
                door.open = true;
                isPuzzleActive = false;
                modal.remove();
                document.getElementById('lm-container').inert = false;
                renderMaze(); document.querySelector('#lm-touch-controls button').focus();
            } else {
                const feedbackEl = document.getElementById('lm-feedback');
                feedbackEl.textContent = 'Resposta incorreta. Tente novamente.';
                btn.classList.add('incorrect');
                setTimeout(() => {
                    feedbackEl.textContent = '';
                    btn.classList.remove('incorrect');
                }, 1000);
            }
        });
    }

    lm_keydownHandler = (e) => {
        if (!session.active || isPuzzleActive) return;
        switch (e.key) {
            case "ArrowUp": case "w": movePlayer(-1, 0); break;
            case "ArrowDown": case "s": movePlayer(1, 0); break;
            case "ArrowLeft": case "a": movePlayer(0, -1); break;
            case "ArrowRight": case "d": movePlayer(0, 1); break;
        }
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)) e.preventDefault();
    };
    session.listen(document.getElementById('lm-touch-controls'), 'click', event => { const button=event.target.closest('button'); const directions={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}; if(button)movePlayer(...directions[button.dataset.direction]); });
    setTimeout(() => { // Garante que a UI principal foi renderizada
        renderMaze();
        session.listen(document, 'keydown', lm_keydownHandler);
    }, 0);
}

    session.cleanup(cleanupLogicMaze);

    return { init: initLogicMazePhase, destroy: session.destroy, pause: session.pause, resume: session.resume };
});
