// symbolhunt.js (v2.0 - "Malha de Caracteres")

let sh_gameTimerId = null;
let sh_gridClickListener = null;

function cleanupSymbolHuntListeners() {
    if (sh_gameTimerId) {
        clearInterval(sh_gameTimerId);
        sh_gameTimerId = null;
    }
    const grid = document.getElementById('symbol-hunt-grid');
    if (grid && sh_gridClickListener) {
        grid.removeEventListener('click', sh_gridClickListener);
        sh_gridClickListener = null;
    }
}

function initSubtleDifferencePhase(config) {
    cleanupSymbolHuntListeners();

    // --- Configuração da Fase ---
    const level = config.level;
    const settings = {
        gridSize: 8 + Math.floor(level / 2),
        roundsToWin: 3, // O desafio é a varredura, então 3 rodadas são suficientes.
        // ALTERADO: Tempo significativamente maior para permitir a varredura da grelha.
        timePerRound: 30 - level,
        // ALTERADO: Número de alvos a encontrar aumenta com o nível.
        targetCount: 3 + Math.floor(level / 2),
    };
    settings.timePerRound = Math.max(10, settings.timePerRound); // Tempo mínimo de 10 segundos.

    // ALTERADO: Pool de Símbolos agora usa caracteres parecidos.
    const CHAR_PAIRS = [
        { target: 'Q', distractors: ['O', '0', 'D'] },
        { target: 'I', distractors: ['l', '1', 'j'] },
        { target: 'S', distractors: ['5', '$', '8'] },
        { target: 'G', distractors: ['6', 'C', 'b'] },
        { target: 'E', distractors: ['F', 'L'] },
        { target: 'v', distractors: ['u', 'w', 'y'] },
        { target: 'Z', distractors: ['2', '7', '?'] },
        { target: '8', distractors: ['B', '3', 'S'] },
        { target: 'd', distractors: ['b', 'p', 'q'] },
        { target: 'P', distractors: ['R', 'F', 'B'] },
    ];


    // --- Estado do Jogo ---
    let currentRound = 0;
    let timeLeft = settings.timePerRound;
    let targetsRemaining = 0;
    let isRoundActive = false;

    // --- HTML da UI ---
    ui.phaseDisplay.innerHTML = `
        <div id="symbol-hunt-container" class="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
            <h2 class="phase-title text-2xl font-bold">Caça ao Símbolo</h2>
            <div id="sh-stats" class="w-full flex justify-around text-lg font-semibold">
                <p>Alvos Restantes: <span id="sh-targets-left" class="font-bold text-green-400">${targetsRemaining}</span></p>
                <p>Tempo: <span id="sh-timer-display" class="text-yellow-400">${timeLeft}s</span></p>
            </div>
            <div id="sh-target-area" class="flex items-center justify-center gap-4 bg-gray-800 p-3 rounded-lg">
                <span class="text-lg text-gray-300">Encontre todos os:</span>
                <span id="sh-target-symbol" class="text-5xl font-mono font-bold"></span>
            </div>
            <div id="symbol-hunt-grid" class="grid gap-1 select-none font-mono">
                </div>
        </div>
    `;

    const gridEl = document.getElementById('symbol-hunt-grid');
    const targetSymbolEl = document.getElementById('sh-target-symbol');
    const timerDisplayEl = document.getElementById('sh-timer-display');
    const targetsLeftEl = document.getElementById('sh-targets-left');
    
    // --- Lógica do Jogo ---
    function startNewRound() {
        isRoundActive = true;
        currentRound++;
        timeLeft = settings.timePerRound;
        targetsRemaining = settings.targetCount;

        timerDisplayEl.textContent = `${timeLeft}s`;
        targetsLeftEl.textContent = targetsRemaining;

        // Seleciona um grupo de caracteres e um alvo
        const charSet = CHAR_PAIRS[Math.floor(Math.random() * CHAR_PAIRS.length)];
        const targetSymbol = charSet.target;
        targetSymbolEl.textContent = targetSymbol;
        targetSymbolEl.className = 'text-5xl font-mono font-bold text-sky-400';

        // Cria a lista de símbolos para a grelha
        const gridSymbols = [];
        for (let i = 0; i < settings.targetCount; i++) {
            gridSymbols.push(targetSymbol);
        }
        
        // Preenche o resto da grelha com distratores
        const totalCells = settings.gridSize * settings.gridSize;
        for (let i = settings.targetCount; i < totalCells; i++) {
            gridSymbols.push(charSet.distractors[Math.floor(Math.random() * charSet.distractors.length)]);
        }

        // Embaralha a grelha
        gridSymbols.sort(() => 0.5 - Math.random());

        // Renderiza a grelha
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${settings.gridSize}, 1fr)`;
        gridSymbols.forEach(symbol => {
            const cell = document.createElement('div');
            cell.className = 'sh-char-cell';
            cell.textContent = symbol;
            if (symbol === targetSymbol) {
                cell.dataset.target = 'true';
            }
            gridEl.appendChild(cell);
        });

        startTimer();
    }

    function startTimer() {
        if (sh_gameTimerId) clearInterval(sh_gameTimerId);
        sh_gameTimerId = setInterval(() => {
            if (!gameActive) {
                cleanupSymbolHuntListeners();
                return;
            }
            timeLeft--;
            timerDisplayEl.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                isRoundActive = false;
                clearInterval(sh_gameTimerId);
                phaseCompleted(false, { reason: "Tempo esgotado!", text: `Você não encontrou todos os alvos a tempo.` });
            }
        }, 1000);
    }
    
    sh_gridClickListener = (event) => {
        if (!isRoundActive) return;
        const cell = event.target.closest('.sh-char-cell');
        if (!cell || cell.classList.contains('found')) return;

        if (cell.dataset.target === 'true') {
            // Acertou
            cell.classList.add('found');
            targetsRemaining--;
            targetsLeftEl.textContent = targetsRemaining;

            if (targetsRemaining === 0) {
                isRoundActive = false;
                clearInterval(sh_gameTimerId);
                targetSymbolEl.textContent = '✔️';
                targetSymbolEl.className = 'text-5xl text-green-400';
                
                if (currentRound >= settings.roundsToWin) {
                    setTimeout(() => phaseCompleted(true, { text: "Excelente percepção! Desafio concluído." }), 1000);
                } else {
                    setTimeout(startNewRound, 1000);
                }
            }
        } else {
            // Errou
            cell.classList.add('incorrect');
            setTimeout(() => cell.classList.remove('incorrect'), 300);
        }
    };
    
    gridEl.addEventListener('click', sh_gridClickListener);
    
    // Inicia a primeira rodada
    startNewRound();
}