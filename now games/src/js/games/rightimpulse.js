// rightimpulse.js

let ri_gameLoopId = null;
let ri_clickListener = null;
let ri_keyListener = null;

function cleanupRightImpulse() {
    if (ri_gameLoopId) {
        clearTimeout(ri_gameLoopId);
        ri_gameLoopId = null;
    }
    const gameArea = document.getElementById('ri-game-area');
    if (gameArea && ri_clickListener) {
        gameArea.removeEventListener('click', ri_clickListener);
    }
    if (ri_keyListener) {
        document.removeEventListener('keydown', ri_keyListener);
    }
    ri_clickListener = null;
    ri_keyListener = null;
}

function initRightImpulsePhase(config) {
    cleanupRightImpulse();

    // --- Configuração da Fase ---
    const level = config.level;
    const settings = {
        totalSymbols: 20 + level,
        initialLives: 3,
        targetChance: 0.3, // 30% de chance de um símbolo ser o alvo
        displayTime: 1500 - level * 80,
    };
    settings.displayTime = Math.max(600, settings.displayTime); // Tempo mínimo de 600ms

    // --- Pools de Dados ---
    const shapes = ['●', '■', '▲', '◆', '★', '⬢'];
    const colors = [
        { name: 'Vermelho', hex: '#EF4444' }, { name: 'Azul', hex: '#3B82F6' },
        { name: 'Verde', hex: '#22C55E' }, { name: 'Amarelo', hex: '#F59E0B' },
        { name: 'Roxo', hex: '#8B5CF6' }, { name: 'Ciano', hex: '#14B8A6' }
    ];

    // --- Estado do Jogo ---
    let lives = settings.initialLives;
    let score = 0;
    let symbolsShown = 0;
    let currentSymbol = null;
    let targetSymbol = null;
    let waitingForAction = false;

    // --- HTML da UI ---
    ui.phaseDisplay.innerHTML = `
        <div id="ri-container" class="flex flex-col items-center gap-2 w-full max-w-lg mx-auto">
            <h2 class="phase-title text-2xl font-bold">Impulso Certo</h2>
            <div id="ri-stats" class="w-full flex justify-between items-center text-lg font-semibold px-4">
                <div id="ri-lives" class="flex gap-1"></div>
                <span>Pontos: <span id="ri-score">0</span></span>
            </div>
            <div id="ri-instructions" class="text-center p-2 bg-gray-800 rounded-md">
                <p class="text-gray-300">Clique (ou aperte Espaço) APENAS para o:</p>
                <div id="ri-target-display" class="ri-symbol-display"></div>
            </div>
            <div id="ri-game-area" class="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer select-none">
                <div id="ri-symbol-presentation" class="ri-symbol-display text-8xl"></div>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div id="ri-progress-bar" class="bg-sky-500 h-2.5 rounded-full transition-width duration-200 ease-linear" style="width: 0%"></div>
            </div>
        </div>
    `;

    const livesEl = document.getElementById('ri-lives');
    const scoreEl = document.getElementById('ri-score');
    const targetDisplayEl = document.getElementById('ri-target-display');
    const symbolPresentationEl = document.getElementById('ri-symbol-presentation');
    const gameAreaEl = document.getElementById('ri-game-area');
    const progressBarEl = document.getElementById('ri-progress-bar');
    
    // --- Lógica do Jogo ---
    function startRound() {
        targetSymbol = {
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            color: colors[Math.floor(Math.random() * colors.length)]
        };
        targetDisplayEl.textContent = targetSymbol.shape;
        targetDisplayEl.style.color = targetSymbol.color.hex;
        updateLives();
        showNextSymbol();
    }

    function showNextSymbol() {
        if (symbolsShown >= settings.totalSymbols) {
            phaseCompleted(true, { text: `Ótimo controlo! Pontuação final: ${score}` });
            return;
        }

        waitingForAction = true;
        symbolPresentationEl.textContent = '';
        symbolPresentationEl.classList.remove('correct', 'incorrect');
        
        const isTarget = Math.random() < settings.targetChance;
        if (isTarget) {
            currentSymbol = targetSymbol;
        } else {
            let distractorShape, distractorColor;
            do {
                distractorShape = shapes[Math.floor(Math.random() * shapes.length)];
                distractorColor = colors[Math.floor(Math.random() * colors.length)];
            } while (distractorShape === targetSymbol.shape && distractorColor.name === targetSymbol.color.name);
            currentSymbol = { shape: distractorShape, color: distractorColor };
        }
        
        symbolPresentationEl.textContent = currentSymbol.shape;
        symbolPresentationEl.style.color = currentSymbol.color.hex;

        ri_gameLoopId = setTimeout(() => handleAction(false), settings.displayTime); // Ação "Não Clicar"
        symbolsShown++;
        progressBarEl.style.width = `${(symbolsShown / settings.totalSymbols) * 100}%`;
    }

    function handleAction(isClick) {
        if (!waitingForAction) return;
        
        clearTimeout(ri_gameLoopId);
        waitingForAction = false;
        
        const isCurrentSymbolTarget = (currentSymbol.shape === targetSymbol.shape && currentSymbol.color.name === targetSymbol.color.name);
        let correctAction = false;

        if (isClick) {
            if (isCurrentSymbolTarget) correctAction = true; // "Go" correto
            else correctAction = false; // "Go" incorreto
        } else {
            if (isCurrentSymbolTarget) correctAction = false; // "No-Go" incorreto (falha)
            else correctAction = true; // "No-Go" correto
        }

        if (correctAction) {
            score++;
            symbolPresentationEl.classList.add('correct');
        } else {
            lives--;
            symbolPresentationEl.classList.add('incorrect');
            updateLives();
        }
        scoreEl.textContent = score;

        if (lives <= 0) {
            phaseCompleted(false, { reason: 'Vidas esgotadas!' });
            return;
        }

        ri_gameLoopId = setTimeout(showNextSymbol, 500);
    }
    
    function updateLives() {
        livesEl.innerHTML = '';
        for (let i = 0; i < settings.initialLives; i++) {
            livesEl.innerHTML += `<span class="text-red-500 text-2xl ${i < lives ? '' : 'opacity-25'}">♥</span>`;
        }
    }

    // --- Listeners de Eventos ---
    ri_clickListener = () => handleAction(true);
    ri_keyListener = (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            handleAction(true);
        }
    };
    
    gameAreaEl.addEventListener('click', ri_clickListener);
    document.addEventListener('keydown', ri_keyListener);

    // Inicia o jogo
    startRound();
}
