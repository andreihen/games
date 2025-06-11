// memory_game.js (Versão Final - Estética Aprimorada e Mais Cores)

// Variáveis de escopo para listeners e estado da fase
let MG_boardClickListener = null;
let MG_isPhaseActive = false;
let MG_timerIntervalId = null;

/**
 * Limpa todos os recursos da fase Jogo da Memória.
 */
function cleanupMemoryGameListeners() {
    if (MG_boardClickListener) {
        const board = document.getElementById('mg-board');
        if (board) {
            board.removeEventListener('click', MG_boardClickListener);
        }
        MG_boardClickListener = null;
    }
    if (MG_timerIntervalId) {
        clearInterval(MG_timerIntervalId);
        MG_timerIntervalId = null;
    }
    clearPhaseTimer(); 
    MG_isPhaseActive = false;
}

/**
 * Inicializa a fase do Jogo da Memória de Cores.
 * @param {object} config - Configuração de dificuldade, incluindo `config.level`.
 */
function initMemoryGamePhase(config) {
    cleanupMemoryGameListeners();
    MG_isPhaseActive = true;

    // --- Estado do Jogo ---
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let isChecking = false;

    // --- Configuração de Dificuldade ---
    const difficulty = getDifficultySettings(config.level);
    const totalPairs = (difficulty.cols * difficulty.rows) / 2;
    let timeLimit = difficulty.timeLimit;

    // --- LÓGICA DO JOGO DE CORES APRIMORADA ---

    // Paleta de cores expandida para 18 cores distintas e visualmente agradáveis
    const colorPool = [
        { name: 'RUBI', hex: '#E11D48' },     // Vermelho intenso
        { name: 'SAFIRA', hex: '#2563EB' },   // Azul vivo
        { name: 'ESMERALDA', hex: '#16A34A' },// Verde rico
        { name: 'ÂMBAR', hex: '#F59E0B' },    // Amarelo/Laranja
        { name: 'AMETISTA', hex: '#9333EA' }, // Roxo
        { name: 'TANGERINA', hex: '#F97316' },// Laranja
        { name: 'QUARTZO', hex: '#DB2777' },  // Rosa/Magenta
        { name: 'JADE', hex: '#0D9488' },     // Ciano/Verde-azulado
        { name: 'OLIVA', hex: '#84CC16' },    // Verde-limão
        { name: 'GRAFITE', hex: '#475569' },  // Cinza escuro
        { name: 'COBRE', hex: '#A16207' },    // Marrom/Ocre
        { name: 'LILÁS', hex: '#A78BFA' },    // Lavanda
        { name: 'CELESTE', hex: '#38BDF8' },  // Azul claro
        { name: 'DOURADO', hex: '#CA8A04' },  // Dourado
        { name: 'TURQUESA', hex: '#2DD4BF' }, // Turquesa
        { name: 'SALMÃO', hex: '#FB923C' },   // Salmão
        { name: 'MUSGO', hex: '#4D7C0F' },    // Verde escuro
        { name: 'BORDÔ', hex: '#9F1239' }     // Vinho
    ];
    
    // Mapeamento de nome para hex para facilitar a verificação
    const nameToHexMap = colorPool.reduce((map, color) => {
        map[color.name] = color.hex;
        return map;
    }, {});

    /**
     * Gera o baralho com a lógica de pares.
     */
    function createShuffledBoard() {
        let board = [];
        const availableColors = [...colorPool].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < totalPairs; i++) {
            const colorA = availableColors[i % availableColors.length];
            const colorB = availableColors[(i + 1) % availableColors.length]; 
            board.push({ backgroundColor: colorA.hex, word: colorB.name });
            board.push({ backgroundColor: colorB.hex, word: colorA.name });
        }

        for (let i = board.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [board[i], board[j]] = [board[j], board[i]];
        }
        return board;
    }

    const boardState = createShuffledBoard();

    /**
     * Renderiza a UI do jogo com o novo design "clean".
     */
    function render() {
        ui.phaseDisplay.innerHTML = `
            <div class="flex flex-col items-center w-full max-w-2xl mx-auto bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
                <h2 class="phase-title text-2xl sm:text-3xl font-bold mb-2 text-sky-300">Memória das Cores</h2>
                <p class="text-sm text-gray-300 mb-4 text-center px-2">Combine a <b>COR DE FUNDO</b> de uma carta com a <b>PALAVRA</b> em outra.</p>
                <div id="mg-status" class="text-base sm:text-lg text-gray-300 mb-5 w-full flex justify-around">
                    <span>Movimentos: <span id="mg-moves" class="font-semibold text-white">0</span></span>
                    ${timeLimit ? `<span>Tempo: <span id="mg-timer" class="font-semibold text-white">${timeLimit}</span>s</span>` : ''}
                </div>
                <div id="mg-board" class="grid gap-3 sm:gap-4 justify-center" style="grid-template-columns: repeat(${difficulty.cols}, 1fr);">
                    ${boardState.map((card, index) => `
                        <div class="mg-card" data-index="${index}">
                            <div class="mg-card-inner">
                                <div class="mg-card-front">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 152v-32a12 12 0 0 1 24 0v32a12 12 0 0 1-24 0m20-80a28 28 0 0 1-51.44-16a12 12 0 0 1 23.44-5.2a4 4 0 0 0 7.32-2.8a12 12 0 1 1 23.44 5.2a28 28 0 0 1-2.76 30.8Z"/></svg>
                                </div>
                                <div class="mg-card-back" style="background-color: ${card.backgroundColor};">
                                    <span class="mg-word">${card.word}</span>
                                </div>
                                <div class="mg-matched-overlay">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12l5 5l10-10"/></svg>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <style>
                .mg-card {
                    min-width: 65px;
                    height: 65px;
                    perspective: 1000px;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent; /* Remove highlight em mobile */
                }
                @media (min-width: 640px) {
                    .mg-card { min-width: 80px; height: 80px; }
                }

                .mg-card-inner {
                    position: relative; width: 100%; height: 100%;
                    transition: transform 0.6s; transform-style: preserve-3d;
                }
                .mg-card.flipped .mg-card-inner { transform: rotateY(180deg); }
                .mg-card-front, .mg-card-back, .mg-matched-overlay {
                    position: absolute; width: 100%; height: 100%;
                    -webkit-backface-visibility: hidden; backface-visibility: hidden;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 12px;
                }
                .mg-card-front {
                    background: linear-gradient(145deg, #3b82f6, #60a5fa);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .mg-card-back {
                    transform: rotateY(180deg);
                    font-weight: bold;
                    transition: filter 0.3s;
                }
                .mg-word {
                    color: white;
                    font-size: clamp(0.7rem, 4vw, 0.9rem);
                    text-align: center;
                    padding: 4px;
                    text-shadow: 0 0 5px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.8);
                }
                .mg-card.matched { cursor: default; }
                .mg-card.matched .mg-card-back {
                    filter: saturate(0.5) brightness(0.6);
                }
                .mg-matched-overlay {
                    display: flex;
                    transform: rotateY(180deg);
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.4s ease-in-out;
                    pointer-events: none;
                }
                .mg-card.matched .mg-matched-overlay {
                    opacity: 1;
                    background-color: rgba(22, 163, 74, 0.75); /* Fundo verde semi-transparente */
                    color: white;
                }
            </style>
        `;
        addBoardListener();
        if (timeLimit) startTimer();
    }

    function addBoardListener() {
        const board = document.getElementById('mg-board');
        if (!board) return;
        MG_boardClickListener = (event) => {
            const card = event.target.closest('.mg-card');
            if (card && !isChecking && !card.classList.contains('matched') && !card.classList.contains('flipped')) {
                handleCardClick(card);
            }
        };
        board.addEventListener('click', MG_boardClickListener);
    }

    function handleCardClick(cardElement) {
        cardElement.classList.add('flipped');
        flippedCards.push({ index: parseInt(cardElement.dataset.index), element: cardElement });

        if (flippedCards.length === 2) {
            isChecking = true;
            moves++;
            document.getElementById('mg-moves').textContent = moves;
            setTimeout(checkForMatch, 1000);
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const card1Data = boardState[card1.index];
        const card2Data = boardState[card2.index];

        const matchCondition = (card1Data.backgroundColor === nameToHexMap[card2Data.word]) && (card2Data.backgroundColor === nameToHexMap[card1Data.word]);

        if (matchCondition) {
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            matchedPairs++;
            if (matchedPairs === totalPairs) {
                endGame(true);
            }
        } else {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }
        flippedCards = [];
        isChecking = false;
    }
    
    function startTimer() {
        const timerDisplay = document.getElementById('mg-timer');
        MG_timerIntervalId = setInterval(() => {
            timeLimit--;
            if (timerDisplay) timerDisplay.textContent = timeLimit;
            if (timeLimit <= 0) {
                endGame(false, { reason: "Tempo esgotado!" });
            }
        }, 1000);
        currentPhaseTimerId = MG_timerIntervalId;
    }

    function endGame(success, details = null) {
        if (!MG_isPhaseActive) return;
        cleanupMemoryGameListeners();
        
        if (success) {
            phaseCompleted(true, { text: `Você superou o desafio em ${moves} movimentos!` });
        } else {
            phaseCompleted(false, details || { text: "Não foi desta vez. Tente novamente!" });
        }
    }

    function getDifficultySettings(level) {
        if (level < 3) return { rows: 2, cols: 4, timeLimit: null };  // 4 pares
        if (level < 6) return { rows: 3, cols: 4, timeLimit: 90 };   // 6 pares
        if (level < 10) return { rows: 4, cols: 4, timeLimit: 120 }; // 8 pares
        if (level < 15) return { rows: 4, cols: 5, timeLimit: 150 }; // 10 pares
        if (level < 20) return { rows: 4, cols: 6, timeLimit: 180 }; // 12 pares
        return { rows: 4, cols: 7, timeLimit: 210 };                 // 14 pares
    }

    render();
}
