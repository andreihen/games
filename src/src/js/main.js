// main.js (versão final corrigida)

// ================================================================================= //
// ESCOPO GLOBAL - Acessível por todos os arquivos, incluindo os jogos individuais  //
// ================================================================================= //

// --- Variáveis de Estado Globais ---
let ui = {};
let gameActive = false;
let currentLevel = 0;
let currentMode = null;
let currentPhaseTimerId = null;
let currentPhaseAttemptsLeft = null;

// --- Estruturas de Dados Dinâmicas (preenchidas após carregamento) ---
let phaseNameMapping = {};
let orderedPhaseGenerators = [];

// --- Funções de Utilitário Globais ---
function clearPhaseTimer() {
    if (currentPhaseTimerId) {
        clearInterval(currentPhaseTimerId);
        currentPhaseTimerId = null;
    }
}

function showModal(message, details = null) {
    if (!ui.modalMessageText) return; // Proteção caso a UI não esteja pronta
    ui.modalMessageText.textContent = message;
    ui.modalDetailsDisplay.innerHTML = '';
    if (details) {
        const detailP = document.createElement('p');
        if (details.text) detailP.textContent = details.text;
        if (details.html) detailP.innerHTML = details.html;
        ui.modalDetailsDisplay.appendChild(detailP);
    }
    ui.messageModal.style.display = "block";
    // A função do listener pode ser local, pois só é usada aqui
    const modalEnterKeyListener = (event) => {
        if (event.key === 'Enter' && ui.messageModal.style.display === "block") {
            event.preventDefault();
            ui.modalCloseButton.click();
            document.removeEventListener('keypress', modalEnterKeyListener);
        }
    };
    document.addEventListener('keypress', modalEnterKeyListener);
}

// --- Função Principal de Conclusão de Fase (Global) ---
function phaseCompleted(success, detailsForModal = null) {
    if (!gameActive) return;
    clearPhaseTimer();

    // Funções auxiliares podem ser locais se só usadas aqui
    const getPhaseName = (func) => {
        for (const [name, generator] of Object.entries(phaseNameMapping)) {
            if (generator === func) return name;
        }
        return "Fase Desconhecida";
    };

    let modalTitle;
    if (success) {
        const completedLevelDisplay = currentLevel + 1;
        if (currentMode === 'journey') {
            modalTitle = `Jornada - Nível ${completedLevelDisplay} concluído!`;
            currentLevel++;
        } else if (currentMode === 'progressive_practice') {
            const phaseNameForMsg = getPhaseName(window.activePhaseFunction);
            modalTitle = `${phaseNameForMsg} - Nível ${completedLevelDisplay} concluído!`;
            currentLevel++;
        }
    } else {
        gameActive = false; // Fim de jogo
        const failedLevelDisplay = currentLevel + 1;
        modalTitle = currentMode === 'journey' ? `Fim de Jogo na Jornada - Nível ${failedLevelDisplay}` : `Fim do Treino de ${getPhaseName(window.activePhaseFunction)} no Nível ${failedLevelDisplay}`;
        detailsForModal = detailsForModal || {};
        modalTitle = detailsForModal.reason ? `${modalTitle}. ${detailsForModal.reason}` : modalTitle;
        detailsForModal.text = detailsForModal.text || "Tente novamente!";
    }
    showModal(modalTitle, detailsForModal);
}


// ================================================================================= //
// LÓGICA DE INICIALIZAÇÃO - Executada quando o DOM está pronto                      //
// ================================================================================= //

document.addEventListener('DOMContentLoaded', () => {

    // Preenche o objeto global 'ui'
    Object.assign(ui, {
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
        gameListView: document.getElementById('game-list-view'),
        difficultySelectionView: document.getElementById('difficulty-selection-view'),
        difficultySelectionTitle: document.getElementById('difficulty-selection-title'),
        startPracticeGameBtn: document.getElementById('start-practice-game-btn'),
        backToGameListBtn: document.getElementById('back-to-game-list-btn')
    });

    // Variáveis que só o main.js precisa conhecer
    let activePhaseFunction = null; // Função da fase atual (local para main.js)
    let selectedPracticeGameFunc = null; // Jogo escolhido no modo treino (local para main.js)
    window.activePhaseFunction = activePhaseFunction; // Expondo globalmente para depuração, se necessário

    // --- Funções que SÓ o main.js usa ---
    const showScreen = (screenElement) => {
        ui.mainMenu.classList.add('hidden');
        ui.phaseSelectionScreen.classList.add('hidden');
        ui.roguelikeGameArea.classList.add('hidden');
        screenElement.classList.remove('hidden');
    };

    const loadNextJourneyPhase = () => {
        clearPhaseTimer();
        ui.limitDisplay.textContent = '';
        currentPhaseAttemptsLeft = null;
        if (!gameActive || currentMode !== 'journey') return;
        ui.phaseDisplay.innerHTML = '<p class="text-center py-8 text-xl text-white">A carregar próxima fase...</p>';
        ui.runStatusDisplay.textContent = `Jornada - Nível ${currentLevel + 1}`;
        activePhaseFunction = orderedPhaseGenerators[Math.floor(Math.random() * orderedPhaseGenerators.length)];
        window.activePhaseFunction = activePhaseFunction; // Atualiza a referência global
        const difficultyConfig = { level: currentLevel };
        setTimeout(() => {
            if (gameActive) activePhaseFunction(difficultyConfig);
        }, 300);
    };

    const loadNextProgressivePracticeLevel = () => {
        clearPhaseTimer();
        ui.limitDisplay.textContent = '';
        currentPhaseAttemptsLeft = null;
        if (!gameActive || currentMode !== 'progressive_practice' || !activePhaseFunction) return;
        const getPhaseName = (func) => {
            for (const [name, generator] of Object.entries(phaseNameMapping)) {
                if (generator === func) return name;
            }
            return "Fase Desconhecida";
        };
        const phaseName = getPhaseName(activePhaseFunction);
        ui.phaseDisplay.innerHTML = `<p class="text-center py-8 text-xl text-white">A carregar ${phaseName}...</p>`;
        ui.runStatusDisplay.textContent = `Treino: ${phaseName} - Nível ${currentLevel + 1}`;
        const difficultyConfig = { level: currentLevel };
        setTimeout(() => {
            if (gameActive) activePhaseFunction(difficultyConfig);
        }, 300);
    };

    // --- Listener do Modal ---
    ui.modalCloseButton.onclick = () => {
        ui.messageModal.style.display = "none";
        if (!gameActive) {
            showScreen(ui.mainMenu);
        } else if (gameActive) {
            if (currentMode === 'journey') {
                loadNextJourneyPhase();
            } else if (currentMode === 'progressive_practice') {
                loadNextProgressivePracticeLevel();
            }
        }
    };

    // --- Inicialização da Aplicação ---
    function initializeApp() {
        // Popula as estruturas de dados a partir da configuração
        GAMES_CONFIG.forEach(game => {
            const initFunc = window[game.initFunc];
            if (typeof initFunc === 'function') {
                phaseNameMapping[game.name] = initFunc;
                orderedPhaseGenerators.push(initFunc);
            } else {
                console.error(`Função de inicialização ${game.initFunc} não encontrada para o jogo ${game.name}.`);
            }
        });

        // Prepara os botões do menu de treino
        ui.phaseButtonsContainer.innerHTML = '';
        GAMES_CONFIG.forEach(game => {
            const btn = document.createElement('button');
            btn.classList.add('button', 'button-choice', 'px-4', 'py-2', 'text-sm', 'm-1', 'w-full', 'sm:w-auto');
            btn.textContent = game.name;
            btn.addEventListener('click', () => {
                selectedPracticeGameFunc = phaseNameMapping[game.name];
                ui.gameListView.classList.add('hidden');
                ui.difficultySelectionView.classList.remove('hidden');
                ui.difficultySelectionTitle.textContent = `Treino: ${game.name}`;
            });
            ui.phaseButtonsContainer.appendChild(btn);
        });
        
        // Adiciona os listeners dos botões principais
        ui.startJourneyBtn.addEventListener('click', () => {
            currentMode = 'journey';
            ui.currentModeTitle.textContent = "Modo Jornada Infinita";
            showScreen(ui.roguelikeGameArea);
            currentLevel = 0;
            gameActive = true;
            loadNextJourneyPhase();
        });

        ui.startPracticeBtn.addEventListener('click', () => {
            currentMode = 'progressive_practice';
            ui.gameListView.classList.remove('hidden');
            ui.difficultySelectionView.classList.add('hidden');
            showScreen(ui.phaseSelectionScreen);
        });

        ui.backToMainMenuBtn.addEventListener('click', () => {
            if (gameActive) {
                gameActive = false;
                clearPhaseTimer();
                ui.phaseDisplay.innerHTML = '';
            }
            showScreen(ui.mainMenu);
        });

        ui.quitCurrentGameBtn.addEventListener('click', () => {
            gameActive = false;
            clearPhaseTimer();
            ui.phaseDisplay.innerHTML = '';
            showScreen(ui.mainMenu);
});

        ui.startPracticeGameBtn.addEventListener('click', () => {
            if (selectedPracticeGameFunc) {
                activePhaseFunction = selectedPracticeGameFunc;
                window.activePhaseFunction = activePhaseFunction; // Atualiza a referência global
                currentLevel = parseInt(ui.difficultySelect.value) - 1;
                gameActive = true;
                
                const getPhaseName = (func) => {
                    for (const [name, generator] of Object.entries(phaseNameMapping)) {
                        if (generator === func) return name;
                    }
                    return "Fase Desconhecida";
                };
                ui.currentModeTitle.textContent = `Treino: ${getPhaseName(activePhaseFunction)}`;
                showScreen(ui.roguelikeGameArea);
                loadNextProgressivePracticeLevel();
            }
        });

        ui.backToGameListBtn.addEventListener('click', () => {
            ui.difficultySelectionView.classList.add('hidden');
            ui.gameListView.classList.remove('hidden');
            selectedPracticeGameFunc = null;
        });

        // Exibe o menu principal
        showScreen(ui.mainMenu);
    }
    
    // --- Carregador de Scripts Dinâmico ---
    function loadGameScripts(games) {
        const promises = games.map(game => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `./src/js/games/${game.file}`;
                script.onload = () => resolve();
                script.onerror = () => reject(`Falha ao carregar ${game.file}`);
                document.head.appendChild(script);
            });
        });
        return Promise.all(promises);
    }

    // --- Ponto de Entrada ---
    loadGameScripts(GAMES_CONFIG)
        .then(() => {
            console.log("Todos os scripts de jogos foram carregados com sucesso.");
            initializeApp();
        })
        .catch(error => {
            console.error("Erro crítico ao carregar os scripts dos jogos:", error);
            alert("Não foi possível carregar os recursos do jogo. Por favor, recarregue a página.");
        });
});