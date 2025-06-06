// main.js
// Este ficheiro contém a lógica principal do jogo, gestão de modos, UI, etc.

// --- Configurações Globais ---
let currentLevel = 0; // Nível atual do jogo (0-indexed)
let gameActive = false; // Indica se um jogo/jornada está ativo
let currentPhaseTimerId = null; // ID do timer para fases com tempo limite
let currentPhaseAttemptsLeft = null; // Tentativas restantes para fases com limite
let currentMode = null; // 'journey' ou 'progressive_practice'
let activePhaseFunction = null; // Função que inicializa a fase atual

// --- Elementos da UI ---
const ui = {
    mainMenu: document.getElementById('game-main-menu'),
    phaseSelectionScreen: document.getElementById('phase-selection-screen'),
    phaseButtonsContainer: document.getElementById('phase-buttons-container'),
    difficultySelect: document.getElementById('difficulty-select'),
    backToMainMenuBtn: document.getElementById('back-to-main-menu'),
    roguelikeGameArea: document.getElementById('roguelike-game-area'),
    currentModeTitle: document.getElementById('current-mode-title'),
    quitCurrentGameBtn: document.getElementById('quit-current-game'),
    phaseDisplay: document.getElementById('phase-display'),
    runStatusDisplay: document.getElementById('run-status'),
    limitDisplay: document.getElementById('phase-limit-display'),
    messageModal: document.getElementById('messageModal'),
    modalMessageText: document.getElementById('modalMessageText'),
    modalDetailsDisplay: document.getElementById('modalDetailsDisplay'),
    modalCloseButton: document.getElementById('modalCloseButton'),
    startJourneyBtn: document.getElementById('start-journey-mode'),
    startPracticeBtn: document.getElementById('start-practice-mode-select'),
    phaseSelectionTitle: document.getElementById('phase-selection-title'), // Adicionado para título dinâmico
    difficultyControlsContainer: document.getElementById('difficulty-controls-container') // Adicionado para controle de visibilidade
};

// --- Mapeamento de Nomes de Fase para Funções ---
// IMPORTANTE: Cada uma destas funções DEVE aceitar um objeto `difficultyConfig`
// e usar `difficultyConfig.level` para ajustar a dificuldade da fase.
const phaseNameMapping = {
    "Decifrador de Cores": initDecodeColorsPhase,
    "Completar Sequência": initSequencePhase,
    "Apague as Luzes": initLightsOutPhase,
    "Nonogram": initNonogramPhase,
    "Quebra-Cabeça Deslizante": initSlidingPuzzlePhase,
    "Balança Misteriosa": initMysteryScalePhase,
    "Criptograma": initCriptogramPhase,
    "Labirinto Especial": initLabirintoPhase,
    "Torre de Hanói": initHanoiPhase,
    "Resta Um Estratégico": initRestaUmPhase,
    "Cálculo Rápido": initMathEquationsPhase,
    "Mini Sudoku": initMiniSudokuPhase,
    "Jogo da Velha": initTicTacToeModernPhase,
    "Jogo da Memória": initMemoryGamePhase,
    // Adicione novas fases aqui e no array orderedPhaseGenerators
};

// --- Lista ORDENADA de Geradores de Fase para ciclar no Modo Jornada ---
// A ordem aqui define a sequência em que as fases aparecem na jornada.
const orderedPhaseGenerators = [
    initDecodeColorsPhase, initMathEquationsPhase, initSequencePhase, initLightsOutPhase,
    initSlidingPuzzlePhase, initNonogramPhase, initMysteryScalePhase,
    initCriptogramPhase, initLabirintoPhase, initRestaUmPhase, initMiniSudokuPhase,
    initTicTacToeModernPhase, initMemoryGamePhase
    // Adicione os mesmos geradores de fase do phaseNameMapping aqui, na ordem desejada
];

// --- Funções Utilitárias ---
function clearPhaseTimer() {
    if (currentPhaseTimerId) {
        clearInterval(currentPhaseTimerId);
        currentPhaseTimerId = null;
    }
}

// --- Navegação e Gerenciamento de Modal ---
function showScreen(screenElement) {
    ui.mainMenu.classList.add('hidden');
    ui.phaseSelectionScreen.classList.add('hidden');
    ui.roguelikeGameArea.classList.add('hidden');
    screenElement.classList.remove('hidden');

    // Controla a visibilidade dos controles de dificuldade
    if (screenElement === ui.phaseSelectionScreen) {
        if (ui.difficultyControlsContainer) ui.difficultyControlsContainer.classList.remove('hidden');
    } else {
        if (ui.difficultyControlsContainer) ui.difficultyControlsContainer.classList.add('hidden');
    }
}

const modalEnterKeyListener = (event) => {
    if (event.key === 'Enter' && ui.messageModal.style.display === "block") {
        event.preventDefault();
        ui.modalCloseButton.click();
    }
};

function showModal(message, details = null) {
    ui.modalMessageText.textContent = message;
    ui.modalDetailsDisplay.innerHTML = ''; // Limpa detalhes anteriores
    if (details) {
        const detailP = document.createElement('p');
        if (details.text) detailP.textContent = details.text;
        if (details.html) detailP.innerHTML = details.html; // Permite HTML nos detalhes
        ui.modalDetailsDisplay.appendChild(detailP);
    }
    ui.messageModal.style.display = "block";
    document.addEventListener('keypress', modalEnterKeyListener);
}

ui.modalCloseButton.onclick = function() {
    ui.messageModal.style.display = "none";
    document.removeEventListener('keypress', modalEnterKeyListener);

    if (!gameActive) { // Se o jogo terminou (falha ou saiu)
        if (currentMode === 'journey' || currentMode === 'progressive_practice') {
            showScreen(ui.mainMenu); // Volta ao menu principal após falha
        }
    } else if (gameActive) { // Se o jogo está ativo (sucesso na fase)
         if (currentMode === 'journey') {
            loadNextJourneyPhase();
         } else if (currentMode === 'progressive_practice') {
            loadNextProgressivePracticeLevel();
         }
    }
};

// --- Listeners de Botões do Menu ---
ui.startJourneyBtn.addEventListener('click', () => {
    currentMode = 'journey';
    ui.currentModeTitle.textContent = "Modo Jornada Infinita";
    showScreen(ui.roguelikeGameArea);
    startNewJourney();
});

ui.startPracticeBtn.addEventListener('click', () => {
    currentMode = 'progressive_practice'; // Define o modo antes de popular os botões
    if (ui.phaseSelectionTitle) ui.phaseSelectionTitle.textContent = "Treino: Escolha Fase e Nível";
    populatePhaseSelectionButtonsForProgressivePractice();
    showScreen(ui.phaseSelectionScreen);
});

ui.backToMainMenuBtn.addEventListener('click', () => {
    if (gameActive) { // Se estava em um jogo, limpa tudo
        gameActive = false;
        clearPhaseTimer();
        ui.phaseDisplay.innerHTML = ''; // Limpa a área da fase
    }
    showScreen(ui.mainMenu);
});

ui.quitCurrentGameBtn.addEventListener('click', () => {
    gameActive = false;
    clearPhaseTimer();
    ui.phaseDisplay.innerHTML = '';
    // Volta para a tela de seleção de fases se estava no modo treino, senão menu principal
    if (currentMode === 'progressive_practice') {
        if (ui.phaseSelectionTitle) ui.phaseSelectionTitle.textContent = "Treino: Escolha Fase e Nível";
        populatePhaseSelectionButtonsForProgressivePractice();
        showScreen(ui.phaseSelectionScreen);
    } else {
        showScreen(ui.mainMenu);
    }
});


// --- Modo Jornada Infinita ---
function startNewJourney() {
    currentLevel = 0; // Começa do nível 0 (que será exibido como Nível 1)
    gameActive = true;
    activePhaseFunction = null; // Reseta a função da fase ativa
    ui.runStatusDisplay.textContent = `A iniciar nova jornada... Boa sorte!`;
    loadNextJourneyPhase();
}

function loadNextJourneyPhase() {
    clearPhaseTimer();
    ui.limitDisplay.textContent = ''; // Limpa display de limites
    currentPhaseAttemptsLeft = null; // Reseta tentativas

    if (!gameActive || currentMode !== 'journey') return; // Proteção

    ui.phaseDisplay.innerHTML = '<p class="text-center py-8 text-xl text-white">A carregar próxima fase...</p>';
    // currentLevel é 0-indexed, então para exibição somamos 1
    ui.runStatusDisplay.textContent = `Jornada - Nível ${currentLevel + 1}`;

    // Seleciona a próxima fase da lista ordenada, ciclando
    activePhaseFunction = orderedPhaseGenerators[currentLevel % orderedPhaseGenerators.length];
    
    // IMPORTANTE: A dificuldade é baseada no currentLevel.
    // Cada jogo (activePhaseFunction) DEVE usar este 'level' para se ajustar.
    const difficultyConfig = { level: currentLevel };

    setTimeout(() => { // Pequeno delay para dar feedback de carregamento
        if (gameActive) { // Verifica se o jogo ainda está ativo (não foi encerrado)
            activePhaseFunction(difficultyConfig);
        }
    }, 300);
}

// --- Modo Treino Progressivo ---
function startProgressivePractice(phaseGenFunc, initialDifficultyLevel) {
    currentMode = 'progressive_practice';
    currentLevel = initialDifficultyLevel; // Nível inicial (0-indexed)
    gameActive = true;
    activePhaseFunction = phaseGenFunc;
    const phaseName = getPhaseName(activePhaseFunction);
    ui.currentModeTitle.textContent = `Treino: ${phaseName}`;
    showScreen(ui.roguelikeGameArea);
    loadNextProgressivePracticeLevel();
}

function loadNextProgressivePracticeLevel() {
    clearPhaseTimer();
    ui.limitDisplay.textContent = '';
    currentPhaseAttemptsLeft = null;

    if (!gameActive || currentMode !== 'progressive_practice' || !activePhaseFunction) return;

    const phaseName = getPhaseName(activePhaseFunction);
    ui.phaseDisplay.innerHTML = `<p class="text-center py-8 text-xl text-white">A carregar ${phaseName}...</p>`;
    ui.runStatusDisplay.textContent = `Treino: ${phaseName} - Nível ${currentLevel + 1}`;

    // IMPORTANTE: A dificuldade é baseada no currentLevel.
    // A função do jogo (activePhaseFunction) DEVE usar este 'level' para se ajustar.
    const difficultyConfig = { level: currentLevel };
    setTimeout(() => {
        if (gameActive) {
            activePhaseFunction(difficultyConfig);
        }
    }, 300);
}


// --- Lógica Comum de Conclusão de Fase ---
// Chamada por cada mini-jogo ao terminar (com sucesso ou falha)
// success: boolean
// detailsForModal: objeto opcional com { text: "...", html: "..." } ou { reason: "..." } para falhas
function phaseCompleted(success, detailsForModal = null) {
    if (!gameActive && !(currentMode === 'journey' && success && currentLevel >= 0)) {
        // Permite processar o modal de sucesso mesmo se gameActive for false por um instante
        // Evita múltiplos phaseCompleted se algo der errado
        return;
    }
    clearPhaseTimer(); // Limpa o timer da fase atual

    let modalTitle;
    let phaseNameForMsg;

    if (success) {
        const completedLevelDisplay = currentLevel + 1; // Nível para exibição (1-indexed)

        if (currentMode === 'journey') {
            modalTitle = `Jornada - Nível ${completedLevelDisplay} concluído!`;
            currentLevel++; // Incrementa para o próximo nível
            // gameActive permanece true para carregar a próxima fase
        } else if (currentMode === 'progressive_practice') {
            phaseNameForMsg = getPhaseName(activePhaseFunction);
            modalTitle = `${phaseNameForMsg} - Nível ${completedLevelDisplay} concluído!`;
            currentLevel++; // Incrementa para o próximo nível de treino
            // gameActive permanece true para carregar o próximo nível da mesma fase
        }
        // Não define gameActive = false aqui, pois o modal precisa ser fechado para prosseguir
    } else { // Falha na fase
        gameActive = false; // Termina o jogo/sessão de treino
        const failedLevelDisplay = currentLevel + 1;

        if (currentMode === 'journey') {
            modalTitle = `Fim de Jogo na Jornada - Nível ${failedLevelDisplay}`;
            ui.runStatusDisplay.textContent = `Fim de jogo na Jornada - Nível ${failedLevelDisplay}.`;
        } else if (currentMode === 'progressive_practice') {
            phaseNameForMsg = getPhaseName(activePhaseFunction);
            modalTitle = `Fim do Treino de ${phaseNameForMsg} no Nível ${failedLevelDisplay}`;
            ui.runStatusDisplay.textContent = `Fim do treino de ${phaseNameForMsg} no Nível ${failedLevelDisplay}.`;
        }
        
        detailsForModal = detailsForModal || {};
        if (detailsForModal.reason) { // Se uma razão específica foi passada
             modalTitle = `${modalTitle}. ${detailsForModal.reason}`;
        } else {
            detailsForModal.text = detailsForModal.text || "Tente novamente!"; // Mensagem padrão
        }
    }
    showModal(modalTitle, detailsForModal); // Mostra o modal. A lógica de fechar o modal cuidará do próximo passo.
}


// --- Funções Auxiliares ---
function getPhaseName(func) {
    for (const [name, generator] of Object.entries(phaseNameMapping)) {
        if (generator === func) return name;
    }
    return "Fase Desconhecida";
}

function populatePhaseSelectionButtonsForProgressivePractice() {
    ui.phaseButtonsContainer.innerHTML = ''; // Limpa botões antigos
    if (ui.difficultyControlsContainer) ui.difficultyControlsContainer.classList.remove('hidden');


    for (const [phaseName, genFunc] of Object.entries(phaseNameMapping)) {
        if (typeof genFunc === 'function') {
            const btn = document.createElement('button');
            btn.classList.add('button', 'button-choice', 'px-4', 'py-2', 'text-sm', 'm-1', 'w-full', 'sm:w-auto');
            btn.textContent = phaseName;
            btn.addEventListener('click', () => {
                // Nível de dificuldade é 1-indexed no input, mas 0-indexed internamente
                const selectedInitialDifficulty = parseInt(ui.difficultySelect.value) - 1; 
                // Valida se o nível está dentro de um limite razoável (0 a 998, pois o input é 1-999)
                if (selectedInitialDifficulty >= 0 && selectedInitialDifficulty < 999) { 
                    startProgressivePractice(genFunc, selectedInitialDifficulty);
                } else {
                    showModal("Nível de dificuldade inicial inválido.", {text: "Por favor, selecione um nível entre 1 e 999."});
                }
            });
            ui.phaseButtonsContainer.appendChild(btn);
        }
    }
}

// --- Inicialização ---
// Garante que todos os elementos da UI foram carregados antes de tentar manipulá-los
document.addEventListener('DOMContentLoaded', () => {
    // Reatribui elementos da UI caso algum não exista no momento da declaração inicial
    // (embora com 'defer' ou script no final do body, isso seja menos provável de ser um problema)
    ui.mainMenu = document.getElementById('game-main-menu');
    ui.phaseSelectionScreen = document.getElementById('phase-selection-screen');
    ui.phaseButtonsContainer = document.getElementById('phase-buttons-container');
    ui.difficultySelect = document.getElementById('difficulty-select');
    ui.backToMainMenuBtn = document.getElementById('back-to-main-menu');
    ui.roguelikeGameArea = document.getElementById('roguelike-game-area');
    ui.currentModeTitle = document.getElementById('current-mode-title');
    ui.quitCurrentGameBtn = document.getElementById('quit-current-game');
    ui.phaseDisplay = document.getElementById('phase-display');
    ui.runStatusDisplay = document.getElementById('run-status');
    ui.limitDisplay = document.getElementById('phase-limit-display');
    ui.messageModal = document.getElementById('messageModal');
    ui.modalMessageText = document.getElementById('modalMessageText');
    ui.modalDetailsDisplay = document.getElementById('modalDetailsDisplay');
    ui.modalCloseButton = document.getElementById('modalCloseButton');
    ui.startJourneyBtn = document.getElementById('start-journey-mode');
    ui.startPracticeBtn = document.getElementById('start-practice-mode-select');
    ui.phaseSelectionTitle = document.getElementById('phase-selection-title');
    ui.difficultyControlsContainer = document.getElementById('difficulty-controls-container');


    // Adiciona listeners de evento aqui, após garantir que os elementos existem
    if(ui.startJourneyBtn) {
        ui.startJourneyBtn.addEventListener('click', () => {
            currentMode = 'journey';
            ui.currentModeTitle.textContent = "Modo Jornada Infinita";
            showScreen(ui.roguelikeGameArea);
            startNewJourney();
        });
    }

    if(ui.startPracticeBtn) {
        ui.startPracticeBtn.addEventListener('click', () => {
            currentMode = 'progressive_practice';
            if (ui.phaseSelectionTitle) ui.phaseSelectionTitle.textContent = "Treino: Escolha Fase e Nível";
            populatePhaseSelectionButtonsForProgressivePractice();
            showScreen(ui.phaseSelectionScreen);
        });
    }

    if(ui.backToMainMenuBtn) {
        ui.backToMainMenuBtn.addEventListener('click', () => {
            if (gameActive) {
                gameActive = false;
                clearPhaseTimer();
                ui.phaseDisplay.innerHTML = '';
            }
            showScreen(ui.mainMenu);
        });
    }
    
    if(ui.quitCurrentGameBtn) {
        ui.quitCurrentGameBtn.addEventListener('click', () => {
            gameActive = false;
            clearPhaseTimer();
            ui.phaseDisplay.innerHTML = '';
            if (currentMode === 'progressive_practice') {
                 if (ui.phaseSelectionTitle) ui.phaseSelectionTitle.textContent = "Treino: Escolha Fase e Nível";
                populatePhaseSelectionButtonsForProgressivePractice();
                showScreen(ui.phaseSelectionScreen);
            } else {
                showScreen(ui.mainMenu);
            }
        });
    }

    if(ui.modalCloseButton) {
        ui.modalCloseButton.onclick = function() { // Mantém como onclick para sobrescrever se necessário
            ui.messageModal.style.display = "none";
            document.removeEventListener('keypress', modalEnterKeyListener);

            if (!gameActive) {
                if (currentMode === 'journey' || currentMode === 'progressive_practice') {
                     showScreen(ui.mainMenu); // Volta ao menu principal após falha ou se o jogo terminou
                }
            } else if (gameActive) { // Sucesso na fase
                 if (currentMode === 'journey') {
                    loadNextJourneyPhase();
                 } else if (currentMode === 'progressive_practice') {
                    loadNextProgressivePracticeLevel();
                 }
            }
        };
    }
    
    showScreen(ui.mainMenu); // Mostra o menu principal ao carregar
});