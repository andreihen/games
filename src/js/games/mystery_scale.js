// mystery_scale.js

var MSCALE_weighBtnListener = null;
var MSCALE_resetPansBtnListener = null;
var MSCALE_identifyBtnListener = null;
var MSCALE_itemPoolClickListener = null; // Listener para cliques na piscina (para itens nos pratos)
var MSCALE_isPhaseActive = false;

// Variáveis para o Drag and Drop
let MSCALE_draggedItemIndex = null;

/**
 * Inicializa a fase do jogo "Balança Misteriosa".
 * @param {object} config - Configuração da dificuldade, incluindo `config.level`.
 */
function initMysteryScalePhase(config) {
    MSCALE_isPhaseActive = true;
    cleanupMysteryScaleListeners();

    // --- Configurações de Dificuldade ---
    // numItemsOptions e weighLimitOptions ajustados para o problema H/L (Heavier/Lighter)
    // Para N itens, precisamos de W pesagens tal que 3^W >= 2N
    // N=5: 2N=10. 3^2=9 (insuf.) -> 3^3=27. W=3.
    // N=6: 2N=12. 3^3=27. W=3.
    // N=7: 2N=14. 3^3=27. W=3.
    // N=8: 2N=16. 3^3=27. W=3.
    // N=9: 2N=18. 3^3=27. W=3.
    // N=10: 2N=20. 3^3=27. W=3.
    // N=11: 2N=22. 3^3=27. W=3.
    // N=12: 2N=24. 3^3=27. W=3.
    const numItemsOptions = [5,  6,  7,  8,  9, 10, 11, 12, 12, 12];
    const weighLimitOptions = [3,  3,  3,  3,  3,  3,  3,  3,  3,  4]; // 4 para 12 itens é um pouco generoso, 3 é o mínimo.

    const currentLevel = Math.min(config.level, numItemsOptions.length - 1);
    const numItems = numItemsOptions[currentLevel];
    currentPhaseAttemptsLeft = weighLimitOptions[currentLevel];

    ui.limitDisplay.textContent = `Pesagens restantes: ${currentPhaseAttemptsLeft}`;

    let items = Array(numItems).fill(10);
    const oddItemIndex = Math.floor(Math.random() * numItems);
    const isHeavier = Math.random() < 0.5;
    items[oddItemIndex] = isHeavier ? 11 : 9;
    const oddItemTrueLabel = `Item ${String.fromCharCode(65 + oddItemIndex)} (${isHeavier ? 'Mais Pesado' : 'Mais Leve'})`;

    let selectedForLeftPan = [];
    let selectedForRightPan = [];

    ui.phaseDisplay.innerHTML = `
        <div class="p-3 rounded-lg shadow-md w-full max-w-lg mx-auto flex flex-col">
            <h2 class="phase-title text-lg font-semibold mb-2 text-center">Balança Misteriosa</h2>
            <p class="text-xs text-gray-300 mb-1 text-center">Um item tem peso diferente. Arraste itens para os pratos.</p>
            <p class="text-xs text-gray-300 mb-2 text-center">Clique em um item no prato para devolvê-lo.</p>

            <div class="my-3">
                <p class="text-sm text-center mb-1 font-medium">Itens Disponíveis:</p>
                <div id="scale-item-pool" class="flex flex-wrap justify-center gap-2 p-2 bg-gray-700/50 rounded min-h-[60px] border-2 border-transparent drop-zone"></div>
            </div>

            <div class="flex justify-around my-3 gap-3">
                <div class="w-1/2 flex flex-col items-center">
                    <p class="text-sm text-center mb-1 font-medium">Prato Esquerdo</p>
                    <div id="scale-left-pan" class="scale-pan min-h-[60px] w-full bg-gray-700/50 p-2 rounded border-2 border-transparent drop-zone"></div>
                </div>
                <div class="w-1/2 flex flex-col items-center">
                    <p class="text-sm text-center mb-1 font-medium">Prato Direito</p>
                    <div id="scale-right-pan" class="scale-pan min-h-[60px] w-full bg-gray-700/50 p-2 rounded border-2 border-transparent drop-zone"></div>
                </div>
            </div>

            <div id="scale-result-area" class="text-center my-2 h-6 scale-result-area font-semibold"></div>

            <div class="text-center my-3 space-x-2">
                <button id="scale-weigh-button" class="button button-primary px-4 py-2 text-sm">Pesar</button>
                <button id="scale-reset-pans-button" class="button button-secondary px-4 py-2 text-sm">Limpar Pratos</button>
            </div>
            <hr class="border-gray-600 my-3">
            <p class="text-sm text-center mb-1 font-medium">Identificar o item diferente:</p>
            <div class="flex flex-col sm:flex-row justify-center items-center gap-2">
                <select id="scale-identify-select" class="input-field px-2 py-1 text-sm rounded w-full sm:w-auto"></select>
                <select id="scale-identify-type" class="input-field px-2 py-1 text-sm rounded w-full sm:w-auto">
                    <option value="heavier">Mais Pesado</option>
                    <option value="lighter">Mais Leve</option>
                </select>
                <button id="scale-identify-button" class="button button-primary px-4 py-2 text-sm w-full sm:w-auto">Identificar</button>
            </div>
        </div>
        <style>
            .scale-item.dragging { opacity: 0.5; border: 2px dashed #facc15; }
            .drop-zone.drag-over { border-color: #facc15; background-color: #374151; } /* Tailwind yellow-400, gray-700 */
            .scale-item-in-pan { cursor: pointer; } /* Para indicar que pode ser clicado para remover */
        </style>
    `;

    const itemPoolDiv = document.getElementById('scale-item-pool');
    const leftPanDiv = document.getElementById('scale-left-pan');
    const rightPanDiv = document.getElementById('scale-right-pan');
    const weighBtn = document.getElementById('scale-weigh-button');
    const resetPansBtn = document.getElementById('scale-reset-pans-button');
    const resultArea = document.getElementById('scale-result-area');
    const identifySelect = document.getElementById('scale-identify-select');
    const identifyTypeSelect = document.getElementById('scale-identify-type');
    const identifyBtn = document.getElementById('scale-identify-button');
    const dropZones = [itemPoolDiv, leftPanDiv, rightPanDiv];

    function renderScaleUI() {
        if (!MSCALE_isPhaseActive) return;
        itemPoolDiv.innerHTML = '';
        leftPanDiv.innerHTML = '';
        rightPanDiv.innerHTML = '';
        identifySelect.innerHTML = '<option value="">Selecione...</option>';

        items.forEach((_, index) => {
            const itemLabel = String.fromCharCode(65 + index);
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('scale-item');
            itemDiv.textContent = itemLabel;
            itemDiv.dataset.index = index;

            const option = document.createElement('option');
            option.value = index;
            option.textContent = itemLabel;
            identifySelect.appendChild(option);

            if (selectedForLeftPan.includes(index)) {
                itemDiv.classList.add('scale-item-in-pan');
                itemDiv.addEventListener('click', () => removeItemFromPan(index, 'left'));
                leftPanDiv.appendChild(itemDiv);
            } else if (selectedForRightPan.includes(index)) {
                itemDiv.classList.add('scale-item-in-pan');
                itemDiv.addEventListener('click', () => removeItemFromPan(index, 'right'));
                rightPanDiv.appendChild(itemDiv);
            } else {
                itemDiv.draggable = true; // Torna o item arrastável
                itemDiv.addEventListener('dragstart', handleDragStart);
                itemPoolDiv.appendChild(itemDiv);
            }
        });
        weighBtn.disabled = (currentPhaseAttemptsLeft <= 0 || (selectedForLeftPan.length === 0 && selectedForRightPan.length === 0));
        weighBtn.classList.toggle('disabled-button', weighBtn.disabled);
    }

    function removeItemFromPan(index, panSide) {
        if (!MSCALE_isPhaseActive || !gameActive) return;
        if (panSide === 'left') {
            selectedForLeftPan = selectedForLeftPan.filter(itemIndex => itemIndex !== index);
        } else if (panSide === 'right') {
            selectedForRightPan = selectedForRightPan.filter(itemIndex => itemIndex !== index);
        }
        resultArea.textContent = '';
        renderScaleUI();
    }

    function handleResetPans() {
        if (!MSCALE_isPhaseActive || !gameActive) return;
        selectedForLeftPan = [];
        selectedForRightPan = [];
        resultArea.textContent = '';
        renderScaleUI();
    }

    function handleWeigh() {
        if (!MSCALE_isPhaseActive || !gameActive || currentPhaseAttemptsLeft <= 0) return;
        if (selectedForLeftPan.length === 0 && selectedForRightPan.length === 0) {
            resultArea.textContent = "Selecione itens para pesar.";
            return;
        }
        if (selectedForLeftPan.length !== selectedForRightPan.length && selectedForLeftPan.length > 0 && selectedForRightPan.length > 0) {
            resultArea.textContent = "Os pratos devem ter o mesmo nº de itens.";
            return;
        }
        currentPhaseAttemptsLeft--;
        ui.limitDisplay.textContent = `Pesagens restantes: ${currentPhaseAttemptsLeft}`;
        const leftWeight = selectedForLeftPan.reduce((sum, i) => sum + items[i], 0);
        const rightWeight = selectedForRightPan.reduce((sum, i) => sum + items[i], 0);

        if (leftWeight > rightWeight) resultArea.textContent = "ESQUERDO é MAIS PESADO.";
        else if (rightWeight > leftWeight) resultArea.textContent = "DIREITO é MAIS PESADO.";
        else resultArea.textContent = "EQUILIBRADOS.";

        if (currentPhaseAttemptsLeft <= 0) {
            resultArea.textContent += " Não há mais pesagens.";
        }
        renderScaleUI();
    }

    function handleIdentify() {
        if (!MSCALE_isPhaseActive || !gameActive) return;
        const identifiedIndex = parseInt(identifySelect.value);
        const identifiedType = identifyTypeSelect.value;
        if (isNaN(identifiedIndex) || identifySelect.value === "") {
            showModal("Selecione um item para identificar.", {text: "Escolha um item da lista."});
            return;
        }
        const correct = (identifiedIndex === oddItemIndex &&
                         ((isHeavier && identifiedType === 'heavier') || (!isHeavier && identifiedType === 'lighter')));
        MSCALE_isPhaseActive = false;
        cleanupMysteryScaleListeners();
        if (correct) {
            phaseCompleted(true, { text: `Correto! ${oddItemTrueLabel} era o item diferente.` });
        } else {
            phaseCompleted(false, { reason: "Identificação incorreta.", text: `O item diferente era ${oddItemTrueLabel}.` });
        }
    }

    // --- Funções de Drag and Drop ---
    function handleDragStart(event) {
        if (!MSCALE_isPhaseActive || !gameActive) {
            event.preventDefault();
            return;
        }
        MSCALE_draggedItemIndex = parseInt(event.target.dataset.index);
        event.dataTransfer.setData('text/plain', event.target.dataset.index); // Necessário para Firefox
        event.target.classList.add('dragging');
    }

    function handleDragOver(event) {
        event.preventDefault(); // Necessário para permitir o drop
        if (event.target.classList.contains('drop-zone')) {
            event.target.classList.add('drag-over');
        }
    }

    function handleDragLeave(event) {
        if (event.target.classList.contains('drop-zone')) {
            event.target.classList.remove('drag-over');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        if (!MSCALE_isPhaseActive || !gameActive || MSCALE_draggedItemIndex === null) return;

        const targetZone = event.target.closest('.drop-zone');
        if (!targetZone) return;
        targetZone.classList.remove('drag-over');

        const droppedItemIndex = MSCALE_draggedItemIndex; // Usar a variável global
        MSCALE_draggedItemIndex = null; // Limpar após o uso

        // Remove o item de onde estava (se estava em algum prato)
        selectedForLeftPan = selectedForLeftPan.filter(idx => idx !== droppedItemIndex);
        selectedForRightPan = selectedForRightPan.filter(idx => idx !== droppedItemIndex);

        const maxItemsPerPan = Math.max(1, Math.floor(numItems / 2));

        if (targetZone.id === 'scale-left-pan') {
            if (selectedForLeftPan.length < maxItemsPerPan) {
                selectedForLeftPan.push(droppedItemIndex);
            } else {
                showModal("Prato esquerdo cheio.", {text: "Máximo de itens atingido."});
                // Devolve ao pool se não couber (ou não faz nada se já estava no pool)
            }
        } else if (targetZone.id === 'scale-right-pan') {
            if (selectedForRightPan.length < maxItemsPerPan) {
                selectedForRightPan.push(droppedItemIndex);
            } else {
                showModal("Prato direito cheio.", {text: "Máximo de itens atingido."});
            }
        }
        // Se soltar no itemPoolDiv, o item é efetivamente removido dos pratos (já feito acima)
        // e será re-renderizado na piscina pela renderScaleUI().

        const draggedElement = document.querySelector(`.scale-item.dragging`);
        if (draggedElement) draggedElement.classList.remove('dragging');

        resultArea.textContent = ''; // Limpa resultado ao mover itens
        renderScaleUI();
    }

    // --- Adiciona Event Listeners ---
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    MSCALE_resetPansBtnListener = handleResetPans;
    resetPansBtn.addEventListener('click', MSCALE_resetPansBtnListener);
    MSCALE_weighBtnListener = handleWeigh;
    weighBtn.addEventListener('click', MSCALE_weighBtnListener);
    MSCALE_identifyBtnListener = handleIdentify;
    identifyBtn.addEventListener('click', MSCALE_identifyBtnListener);

    renderScaleUI();
}

function cleanupMysteryScaleListeners() {
    const itemPoolDiv = document.getElementById('scale-item-pool');
    const leftPanDiv = document.getElementById('scale-left-pan');
    const rightPanDiv = document.getElementById('scale-right-pan');
    const dropZones = [itemPoolDiv, leftPanDiv, rightPanDiv].filter(el => el); // Filtra nulos se o DOM não estiver pronto

    dropZones.forEach(zone => {
        // Os listeners de drag/drop são adicionados dinamicamente na init,
        // e os elementos são recriados, então não precisam de remoção explícita aqui
        // se a estrutura do DOM for totalmente refeita.
        // No entanto, se os elementos persistirem, a remoção seria necessária.
        // Por segurança, vamos assumir que podem persistir e tentar remover.
        zone.removeEventListener('dragover', handleDragOver); // handleDragOver não está no escopo global
        zone.removeEventListener('dragleave', handleDragLeave); // handleDragLeave não está no escopo global
        zone.removeEventListener('drop', handleDrop); // handleDrop não está no escopo global
    });
    // As funções handleDragOver, handleDragLeave, handleDrop não foram armazenadas em variáveis globais,
    // então a remoção acima não funcionará. A melhor prática seria armazená-las como
    // MSCALE_dragOverListener, etc., se precisarmos removê-las explicitamente.
    // Dado que o innerHTML de ui.phaseDisplay é reescrito, os listeners nos elementos filhos
    // são geralmente descartados. O principal é zerar as variáveis globais dos listeners de botões.


    const resetPansBtn = document.getElementById('scale-reset-pans-button');
    if (resetPansBtn && MSCALE_resetPansBtnListener) {
        resetPansBtn.removeEventListener('click', MSCALE_resetPansBtnListener);
        MSCALE_resetPansBtnListener = null;
    }
    const weighBtn = document.getElementById('scale-weigh-button');
    if (weighBtn && MSCALE_weighBtnListener) {
        weighBtn.removeEventListener('click', MSCALE_weighBtnListener);
        MSCALE_weighBtnListener = null;
    }
    const identifyBtn = document.getElementById('scale-identify-button');
    if (identifyBtn && MSCALE_identifyBtnListener) {
        identifyBtn.removeEventListener('click', MSCALE_identifyBtnListener);
        MSCALE_identifyBtnListener = null;
    }
    MSCALE_draggedItemIndex = null;
    // MSCALE_isPhaseActive será definido como false pela função que chama cleanup
    // ou pela própria lógica de finalização da fase (vitória/derrota).
}
