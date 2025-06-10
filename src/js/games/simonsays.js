// simonsays.js

let ss_padClickListener = null;
let ss_modeClickListener = null;
let ss_synth = null;

function cleanupSimonSays() {
    const gameContainer = document.getElementById('ss-game-container');
    if (gameContainer && ss_padClickListener) {
        gameContainer.removeEventListener('click', ss_padClickListener);
    }
    const modeContainer = document.getElementById('ss-mode-selection');
     if (modeContainer && ss_modeClickListener) {
        modeContainer.removeEventListener('click', ss_modeClickListener);
    }
    ss_padClickListener = null;
    ss_modeClickListener = null;
    ss_synth = null;
}

function initSimonSaysPhase(config) {
    cleanupSimonSays();
    
    // --- Tela de Seleção de Modo ---
    function showModeSelection() {
        ui.phaseDisplay.innerHTML = `
            <div id="ss-mode-selection" class="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
                <h2 class="phase-title text-2xl font-bold">Simon Diz</h2>
                <p class="text-gray-300 text-center">Escolha o seu modo de desafio:</p>
                <button data-mode="levels" class="button button-primary w-full py-3 text-lg">Modo por Níveis</button>
                <button data-mode="infinite" class="button button-secondary w-full py-3 text-lg">Modo Infinito</button>
            </div>
        `;

        ss_modeClickListener = (event) => {
            const mode = event.target.dataset.mode;
            if (mode) {
                // Inicia o Tone.js com um gesto do utilizador
                if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
                    Tone.start();
                }
                startGame(mode, config);
            }
        };
        document.getElementById('ss-mode-selection').addEventListener('click', ss_modeClickListener);
    }

    // --- Lógica Principal do Jogo ---
    function startGame(mode, config) {
        // --- Configuração e Estado ---
        let sequence = [];
        let playerSequence = [];
        let isPlayerTurn = false;
        let isAnimating = false;
        
        // --- NOVO: Lógica de níveis internos ---
        let internalLevel = 1;
        const maxInternalLevels = 10; // O modo Níveis terá 10 fases
        
        const settings = {
            gameMode: mode,
            // A lógica de comprimento da sequência agora é tratada dentro de startNewRound
        };

        // --- Sintetizador de Som ---
        ss_synth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.1 }
        }).toDestination();
        const notes = { 0: 'C4', 1: 'E4', 2: 'G4', 3: 'C5' }; // Verm, Ver, Azu, Ama

        // --- Renderização da UI do Jogo ---
        ui.phaseDisplay.innerHTML = `
            <div id="ss-game-container" class="flex flex-col items-center gap-4">
                <h2 class="phase-title text-2xl font-bold">Simon Diz</h2>
                <p id="ss-status" class="text-lg text-gray-300 h-8">A preparar...</p>
                <div class="ss-pad-container">
                    <div class="ss-pad" data-pad="0" style="--pad-color: #EF4444;"></div>
                    <div class="ss-pad" data-pad="1" style="--pad-color: #22C55E;"></div>
                    <div class="ss-pad" data-pad="2" style="--pad-color: #3B82F6;"></div>
                    <div class="ss-pad" data-pad="3" style="--pad-color: #F59E0B;"></div>
                    <div id="ss-center-display" class="ss-center"></div>
                </div>
            </div>
        `;

        const statusDisplay = document.getElementById('ss-status');
        const centerDisplay = document.getElementById('ss-center-display');
        const pads = document.querySelectorAll('.ss-pad');

        // --- Funções do Jogo ---
        let internalTurn = 0;
let fullSequence = [];

function startNewRound() {
    isPlayerTurn = false;
    isAnimating = true;
    playerSequence = [];

    if (settings.gameMode === 'levels') {
        // Se for o primeiro turno do nível, reinicia a sequência
        if (internalTurn === 0) {
            fullSequence = [];
            for (let i = 0; i < internalLevel; i++) {
                fullSequence.push(Math.floor(Math.random() * 4));
            }
        }

        // Define o trecho da sequência que será usada neste turno
        sequence = fullSequence.slice(0, internalTurn + 1);
        statusDisplay.textContent = `Nível ${internalLevel} - Turno ${internalTurn + 1}`;
        centerDisplay.textContent = `${internalTurn + 1}`;
    } else {
        // Modo Infinito tradicional
        sequence.push(Math.floor(Math.random() * 4));
        statusDisplay.textContent = 'A observar...';
        centerDisplay.textContent = sequence.length;
    }

    playSequence();
}

        async function playSequence() {
            await new Promise(res => setTimeout(res, 500));
            for (let i = 0; i < sequence.length; i++) {
                const padIndex = sequence[i];
                await lightUpPad(padIndex);
            }
            isAnimating = false;
            isPlayerTurn = true;
            statusDisplay.textContent = `Nível ${internalLevel} - Sua vez!`;
        }

        function lightUpPad(index) {
            return new Promise(resolve => {
                const pad = pads[index];
                if(ss_synth) ss_synth.triggerAttackRelease(notes[index], '8n');
                pad.classList.add('active');
                setTimeout(() => {
                    pad.classList.remove('active');
                    setTimeout(resolve, 150);
                }, 400);
            });
        }

        function checkPlayerSequence() {
            const currentStep = playerSequence.length - 1;
            if (playerSequence[currentStep] !== sequence[currentStep]) {
                statusDisplay.textContent = 'Errado! Fim de jogo.';
                phaseCompleted(false, { reason: `Sequência incorreta no nível ${internalLevel}.` });
                return;
            }

            if (playerSequence.length === sequence.length) {
                if (settings.gameMode === 'levels') {
                    internalTurn++;
                    if (internalTurn >= internalLevel) {
                        if (internalLevel >= maxInternalLevels) {
                            statusDisplay.textContent = 'Parabéns!';
                            phaseCompleted(true, { text: `Você completou todos os ${maxInternalLevels} níveis!` });
                        } else {
                            statusDisplay.textContent = 'Nível completo!';
                            internalLevel++;
                            internalTurn = 0;
                            setTimeout(startNewRound, 1500);
                        }
                    } else {
                        statusDisplay.textContent = 'Correto!';
                        setTimeout(startNewRound, 1000);
                    }
                } else {
                    statusDisplay.textContent = 'Correto!';
                    setTimeout(startNewRound, 1000);
                }
            }
        }

        // --- Listener de Eventos ---
        ss_padClickListener = (event) => {
            if (!isPlayerTurn || isAnimating) return;
            
            const pad = event.target.closest('.ss-pad');
            if (pad) {
                const padIndex = parseInt(pad.dataset.pad);
                lightUpPad(padIndex);
                playerSequence.push(padIndex);
                checkPlayerSequence();
            }
        };
        document.getElementById('ss-game-container').addEventListener('click', ss_padClickListener);
        
        // Inicia o jogo
        setTimeout(startNewRound, 500);
    }
    
    // Mostra a tela inicial de seleção de modo
    showModeSelection();
}
