// fastsequence.js (Corrigido e Melhorado)

let fs_animationFrameId = null;
let fs_clickListener = null;

function cleanupFastSequence() {
    if (fs_animationFrameId) {
        cancelAnimationFrame(fs_animationFrameId);
        fs_animationFrameId = null;
    }
    const optionsContainer = document.getElementById('fs-options-container');
    if (optionsContainer && fs_clickListener) {
        optionsContainer.removeEventListener('click', fs_clickListener);
        fs_clickListener = null;
    }
}

function initFastSequencePhase(config) {
    cleanupFastSequence();

    // --- Configuração da Fase ---
    const level = config.level;
    const settings = {
        roundsToWin: 5 + Math.floor(level / 2),
        timePerRound: (10 - Math.floor(level / 3)) * 1000,
        sequenceLength: 3 + Math.floor(level / 5),
        numOptions: 3 + Math.floor(level / 4)
    };
    settings.timePerRound = Math.max(4000, settings.timePerRound); // Tempo mínimo
    settings.sequenceLength = Math.min(5, settings.sequenceLength);
    settings.numOptions = Math.min(5, settings.numOptions);

    // --- HTML da UI ---
    ui.phaseDisplay.innerHTML = `
        <div id="fs-container" class="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
            <h2 class="phase-title text-2xl font-bold">Sequência Rápida</h2>
            <div id="fs-stats" class="w-full flex justify-around text-lg font-semibold">
                <span>Rodada: <span id="fs-round-display">1 / ${settings.roundsToWin}</span></span>
            </div>
            <div id="fs-timer-bar-container" class="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-500">
                <div id="fs-timer-bar" class="h-full bg-yellow-400 rounded-full"></div>
            </div>
            <p class="text-gray-300">Qual o próximo item da sequência?</p>
            <div id="fs-sequence-display" class="flex items-center justify-center gap-4 bg-gray-800 p-4 rounded-lg min-h-[80px]"></div>
            <div id="fs-options-container" class="flex flex-wrap items-center justify-center gap-4 mt-4"></div>
        </div>
    `;

    // Envolve toda a lógica do jogo num setTimeout para garantir que a UI foi renderizada
    setTimeout(() => {
        // --- Estado do Jogo ---
        let currentRound = 0;
        let roundStartTime = 0;
        let currentCorrectAnswer = null;
        let isRoundActive = false;
        
        // --- Geradores de Padrões (com minLevel ajustado) ---
        const patternGenerators = [
            {
                name: 'Arithmetic', minLevel: 0,
                generate: () => {
                    const start = Math.floor(Math.random() * 10) + 1;
                    const step = Math.floor(Math.random() * 5) + 1;
                    let sequence = [];
                    for (let i = 0; i < settings.sequenceLength; i++) {
                        sequence.push({ type: 'number', value: start + i * step });
                    }
                    const answer = { type: 'number', value: start + settings.sequenceLength * step };
                    const distractors = [
                        { type: 'number', value: answer.value + 1 },
                        { type: 'number', value: answer.value - 2 },
                        { type: 'number', value: answer.value + step + 1 },
                        { type: 'number', value: start }
                    ];
                    return { sequence, answer, distractors };
                }
            },
            {
                // ALTERADO: minLevel agora é 0 para aparecer desde o início
                name: 'Shape Cycle', minLevel: 0,
                generate: () => {
                    const shapes = ['●', '■', '▲', '◆', '★'].sort(() => 0.5 - Math.random());
                    const colors = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'];
                    let sequence = [];
                    for (let i = 0; i < settings.sequenceLength; i++) {
                        sequence.push({ type: 'shape', value: shapes[i % shapes.length], color: colors[i % colors.length] });
                    }
                    const answer = { type: 'shape', value: shapes[settings.sequenceLength % shapes.length], color: colors[settings.sequenceLength % colors.length] };
                    const distractors = shapes.slice(1).map(s => ({type: 'shape', value: s, color: colors[Math.floor(Math.random()*colors.length)]}));
                    return { sequence, answer, distractors };
                }
            },
            {
                // ALTERADO: minLevel ajustado para aparecer mais cedo
                name: 'Size Progression', minLevel: 2,
                generate: () => {
                    const sizes = [{label: 'P', scale: 0.6}, {label: 'M', scale: 1.0}, {label: 'G', scale: 1.4}];
                    const shape = '◆';
                    const color = '#34d399';
                    let sequence = [];
                    for (let i = 0; i < settings.sequenceLength; i++) {
                        sequence.push({ type: 'size', value: shape, color, size: sizes[i % sizes.length] });
                    }
                    const answer = { type: 'size', value: shape, color, size: sizes[settings.sequenceLength % sizes.length] };
                    const distractors = sizes.map(s => ({type: 'size', value: shape, color, size: s}));
                    return { sequence, answer, distractors };
                }
            },
            {
                // ALTERADO: minLevel ajustado para aparecer mais cedo
                name: 'Geometric', minLevel: 4,
                generate: () => {
                    const start = Math.floor(Math.random() * 3) + 2;
                    const factor = 2; // Mantém simples
                    let sequence = [];
                    for (let i = 0; i < settings.sequenceLength; i++) {
                        sequence.push({ type: 'number', value: start * Math.pow(factor, i) });
                    }
                    const answer = { type: 'number', value: start * Math.pow(factor, settings.sequenceLength) };
                    const distractors = [
                        { type: 'number', value: answer.value + factor },
                        { type: 'number', value: answer.value - 1 },
                        { type: 'number', value: answer.value / factor }
                    ];
                    return { sequence, answer, distractors };
                }
            }
        ];

        const timerBarEl = document.getElementById('fs-timer-bar');
        const roundDisplayEl = document.getElementById('fs-round-display');
        const sequenceDisplayEl = document.getElementById('fs-sequence-display');
        const optionsContainerEl = document.getElementById('fs-options-container');

        if (!timerBarEl || !roundDisplayEl || !sequenceDisplayEl || !optionsContainerEl) {
            console.error("Falha ao inicializar a UI da Sequência Rápida.");
            return;
        }

        function startNewRound() {
            isRoundActive = true;
            currentRound++;
            roundDisplayEl.textContent = `${currentRound} / ${settings.roundsToWin}`;

            const availableGenerators = patternGenerators.filter(p => p.minLevel <= level);
            const generator = availableGenerators[Math.floor(Math.random() * availableGenerators.length)];
            const puzzle = generator.generate();

            currentCorrectAnswer = puzzle.answer;

            sequenceDisplayEl.innerHTML = '';
            puzzle.sequence.forEach(item => {
                sequenceDisplayEl.appendChild(createItemElement(item));
            });

            optionsContainerEl.innerHTML = '';
            let options = [puzzle.answer];
            puzzle.distractors.sort(() => 0.5 - Math.random());
            for (let i = 0; options.length < settings.numOptions && i < puzzle.distractors.length; i++) {
                if (!options.some(opt => JSON.stringify(opt) === JSON.stringify(puzzle.distractors[i]))) {
                    options.push(puzzle.distractors[i]);
                }
            }
            options.sort(() => 0.5 - Math.random());
            options.forEach(opt => {
                const btn = createItemElement(opt);
                btn.classList.add('fs-option-btn');
                btn.dataset.answer = JSON.stringify(opt);
                optionsContainerEl.appendChild(btn);
            });

            roundStartTime = Date.now();
            if (fs_animationFrameId) cancelAnimationFrame(fs_animationFrameId);
            gameLoop();
        }
        
        function createItemElement(item) {
            const el = document.createElement('div');
            el.className = 'fs-item';
            switch (item.type) {
                case 'number':
                    el.textContent = item.value;
                    el.classList.add('fs-item-number');
                    break;
                case 'shape':
                    el.textContent = item.value;
                    el.style.color = item.color;
                    break;
                case 'size':
                    el.textContent = item.value;
                    el.style.color = item.color;
                    el.style.transform = `scale(${item.size.scale})`;
                    break;
            }
            return el;
        }

        function gameLoop() {
            if (!gameActive) {
                cleanupFastSequence();
                return;
            }
            const elapsedTime = Date.now() - roundStartTime;
            const remainingPercentage = Math.max(0, (settings.timePerRound - elapsedTime) / settings.timePerRound * 100);
            timerBarEl.style.width = `${remainingPercentage}%`;

            if (remainingPercentage <= 0) {
                isRoundActive = false;
                phaseCompleted(false, { reason: "Tempo esgotado!" });
                return;
            }
            fs_animationFrameId = requestAnimationFrame(gameLoop);
        }
        
        fs_clickListener = (event) => {
            if (!isRoundActive) return;
            const btn = event.target.closest('.fs-option-btn');
            if (!btn) return;

            isRoundActive = false;
            cancelAnimationFrame(fs_animationFrameId);
            
            const isCorrect = btn.dataset.answer === JSON.stringify(currentCorrectAnswer);

            if (isCorrect) {
                btn.classList.add('correct');
                if (currentRound >= settings.roundsToWin) {
                    setTimeout(() => phaseCompleted(true, { text: "Excelente! Sequência decifrada!" }), 500);
                } else {
                    setTimeout(startNewRound, 500);
                }
            } else {
                btn.classList.add('incorrect');
                document.querySelectorAll('.fs-option-btn').forEach(opt => {
                    if (opt.dataset.answer === JSON.stringify(currentCorrectAnswer)) {
                        opt.classList.add('correct');
                    }
                });
                setTimeout(() => phaseCompleted(false, { reason: "Resposta incorreta." }), 1500);
            }
        };
        optionsContainerEl.addEventListener('click', fs_clickListener);

        startNewRound();
    }, 0);
}
