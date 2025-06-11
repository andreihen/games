// decode_colors.js

/**
 * Initializes the Mastermind (Decifrador de Código) phase.
 * Difficulty is scaled based on config.level (0-indexed, potentially very high).
 * - Code length increases with level.
 * - Number of available colors increases with level.
 * - Number of attempts increases with code length and number of colors.
 */
function initDecodeColorsPhase(config) {
    // --- Difficulty Parameters ---
    const currentLevel = config.level; // 0-indexed

    // codeLength: Number of pegs in the secret code.
    // Starts at 3, increases by 1 every 3 levels. Capped at a max of, say, 8.
    const codeLength = Math.min(3 + Math.floor(currentLevel / 3), 8);

    // numColors: Number of unique colors available.
    // Starts at 4, increases by 1 every 2 levels. Capped by allPossibleColors.length.
    const allPossibleColors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
        '#FFA500', '#800080', '#A52A2A', '#008000', '#808080', '#FFFFFF' // Added Gray, White
    ];
    const numColors = Math.min(4 + Math.floor(currentLevel / 2), allPossibleColors.length);
    const availableColors = allPossibleColors.slice(0, numColors);

    // Attempts Calculation:
    const baseAttempts = 8;
    const calculatedAttempts = baseAttempts + numColors + (codeLength - 3) * 2;
    currentPhaseAttemptsLeft = Math.max(calculatedAttempts, codeLength + Math.ceil(numColors / 2) + Math.floor(currentLevel / 5)); // Add a small bonus for very high levels


    ui.limitDisplay.textContent = `Tentativas: ${currentPhaseAttemptsLeft}`;

    // --- Game State ---
    let secretCode = [];
    for (let i = 0; i < codeLength; i++) {
        secretCode.push(availableColors[Math.floor(Math.random() * availableColors.length)]);
    }
    // console.log(`Lvl ${currentLevel} Secret Code (${codeLength} long, ${numColors} colors):`, secretCode.join(', '));

    let currentGuess = [];
    const initialAttemptsForWinMessage = currentPhaseAttemptsLeft; // Store for win message

    // --- UI Setup ---
    // (A estrutura HTML é a mesma da versão anterior, apenas os valores dinâmicos mudam)
    ui.phaseDisplay.innerHTML = `
        <div class="p-3 rounded-lg shadow-md w-full max-w-md mx-auto bg-gray-800">
            <h2 class="phase-title text-xl font-semibold mb-2 text-center text-white">Decifrador de Código</h2>
            <p class="text-sm text-gray-300 mb-3 text-center">
                Adivinhe a sequência de ${codeLength} cores. Cores disponíveis: ${numColors}.<br>
                Feedback: Pino Preto = Cor e Posição corretas. Pino Branco = Apenas Cor correta.
            </p>

            <div id="mastermind-color-palette" class="flex justify-center flex-wrap my-3 gap-2">
                ${availableColors.map(color => `<div class="color-peg-mastermind" style="background-color:${color};" data-color="${color}"></div>`).join('')}
            </div>

            <p class="text-center text-gray-400 text-sm mb-1">Sua tentativa atual:</p>
            <div id="mastermind-current-guess" class="flex justify-center space-x-2 mb-3 min-h-[35px] bg-gray-700 p-2 rounded">
                ${Array(codeLength).fill(0).map((_, i) => `<div class="guess-slot-mastermind" data-index="${i}"></div>`).join('')}
            </div>

            <div class="text-center mb-3">
                <button id="mastermind-submit" class="button button-primary px-4 py-2 text-base">Verificar</button>
                <button id="mastermind-clear" class="button button-secondary ml-2 px-4 py-2 text-base">Limpar</button>
            </div>

            <div id="mastermind-history-container" class="mt-2">
                <p class="text-center text-gray-400 text-sm mb-1">Histórico de Tentativas:</p>
                <div id="mastermind-history" class="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-900 rounded text-sm custom-scrollbar">
                    </div>
            </div>
        </div>`;

    const paletteDiv = document.getElementById('mastermind-color-palette');
    const guessSlotsContainer = document.getElementById('mastermind-current-guess');
    const submitBtn = document.getElementById('mastermind-submit');
    const clearBtn = document.getElementById('mastermind-clear');
    const historyDiv = document.getElementById('mastermind-history');

    function updateGuessDisplay() {
        const guessSlots = guessSlotsContainer.querySelectorAll('.guess-slot-mastermind');
        guessSlots.forEach((slot, i) => {
            if (currentGuess[i]) {
                slot.style.backgroundColor = currentGuess[i];
                slot.classList.add('filled');
            } else {
                slot.style.backgroundColor = '';
                slot.classList.remove('filled');
            }
        });
        submitBtn.disabled = currentGuess.length !== codeLength;
        submitBtn.classList.toggle('disabled-button', submitBtn.disabled);
    }

    paletteDiv.querySelectorAll('.color-peg-mastermind').forEach(peg => {
        peg.addEventListener('click', () => {
            if (currentGuess.length < codeLength) {
                currentGuess.push(peg.dataset.color);
                updateGuessDisplay();
            }
        });
    });

    guessSlotsContainer.querySelectorAll('.guess-slot-mastermind').forEach(slot => {
        slot.addEventListener('click', (event) => {
            const index = parseInt(event.currentTarget.dataset.index);
            if (currentGuess[index]) {
                // To remove a specific peg, we can rebuild the guess array without it
                // or, more simply, clear the specific slot and require re-filling in order.
                // For now, let's make clicking a filled slot remove THAT color from the guess.
                // This means we need to find its actual position in currentGuess if it's not full.
                // Simpler: just clear the peg visually and remove the *last added* color if this slot was the last.
                // Best approach: if a slot is clicked, remove the color AT THAT SLOT's corresponding position in currentGuess
                currentGuess.splice(index, 1); // This removes the item at 'index' and shifts subsequent items.
                                               // This might not be the desired UX if they want to just "clear" a slot
                                               // and re-insert.
                                               // A better UX for "clearing" a slot to replace it:
                // currentGuess[index] = undefined; // Or some placeholder
                // Then filter out undefineds before submission or when adding new colors.

                // Let's go with: clicking a slot removes the color from that *visual position*.
                // The `currentGuess` array should then reflect this.
                // If `currentGuess` has fewer items than `codeLength`, this logic is tricky.
                // Simplest robust "remove":
                if (currentGuess.length > index) { // Ensure there's a color at that conceptual index
                    currentGuess.splice(index, 1);
                }
                updateGuessDisplay(); // Re-renders based on the modified currentGuess
            }
        });
    });


    clearBtn.addEventListener('click', () => {
        currentGuess = [];
        updateGuessDisplay();
    });

    submitBtn.addEventListener('click', () => {
        if (currentGuess.length !== codeLength || !gameActive) return;

        currentPhaseAttemptsLeft--;
        ui.limitDisplay.textContent = `Tentativas: ${currentPhaseAttemptsLeft}`;

        let correctPos = 0;
        let correctCol = 0;
        const tempSecret = [...secretCode];
        const tempGuess = [...currentGuess];
        const secretChecked = Array(codeLength).fill(false);
        const guessChecked = Array(codeLength).fill(false);

        for (let i = 0; i < codeLength; i++) {
            if (tempGuess[i] === tempSecret[i]) {
                correctPos++;
                secretChecked[i] = true;
                guessChecked[i] = true;
            }
        }

        for (let i = 0; i < codeLength; i++) {
            if (!guessChecked[i]) {
                for (let j = 0; j < codeLength; j++) {
                    if (!secretChecked[j] && tempGuess[i] === tempSecret[j]) {
                        correctCol++;
                        secretChecked[j] = true;
                        break;
                    }
                }
            }
        }

        const entry = document.createElement('div');
        entry.classList.add('flex', 'justify-between', 'items-center', 'p-1', 'bg-gray-700', 'rounded', 'shadow');
        const guessDisplayDiv = document.createElement('div');
        guessDisplayDiv.classList.add('flex', 'space-x-1');
        currentGuess.forEach(color => {
            const pegEl = document.createElement('div');
            pegEl.classList.add('guess-slot-mastermind', 'history-peg');
            pegEl.style.backgroundColor = color;
            guessDisplayDiv.appendChild(pegEl);
        });
        const feedbackDisplayDiv = document.createElement('div');
        feedbackDisplayDiv.classList.add('flex', 'space-x-0.5');
        for (let i = 0; i < correctPos; i++) {
            const pegEl = document.createElement('div');
            pegEl.classList.add('feedback-peg', 'black-peg');
            feedbackDisplayDiv.appendChild(pegEl);
        }
        for (let i = 0; i < correctCol; i++) {
            const pegEl = document.createElement('div');
            pegEl.classList.add('feedback-peg', 'white-peg');
            feedbackDisplayDiv.appendChild(pegEl);
        }
        if (correctPos === 0 && correctCol === 0 && currentGuess.length > 0) { // only show "Nada" if a guess was made
            const noMatchText = document.createElement('span');
            noMatchText.textContent = "Nada";
            noMatchText.classList.add('text-gray-400', 'text-xs');
            feedbackDisplayDiv.appendChild(noMatchText);
        }

        entry.appendChild(guessDisplayDiv);
        entry.appendChild(feedbackDisplayDiv);
        historyDiv.prepend(entry);

        if (correctPos === codeLength) {
            phaseCompleted(true, { text: `Código decifrado em ${initialAttemptsForWinMessage - currentPhaseAttemptsLeft} tentativas!` });
        } else if (currentPhaseAttemptsLeft <= 0) {
            phaseCompleted(false, {
                reason: "Tentativas esgotadas!",
                html: `O código secreto era: <div class="flex justify-center mt-1 space-x-1">${secretCode.map(c => `<div class="guess-slot-mastermind" style="background-color:${c}; width:20px;height:20px; border-radius: 50%;"></div>`).join('')}</div>`
            });
        }

        currentGuess = [];
        updateGuessDisplay();
    });

    updateGuessDisplay();
}
