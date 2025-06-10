// mental_math_trainer.js - Nova fase: Arena de Cálculo Mental

function initMentalMathTrainerPhase(config) {
    // Cleanup any existing listeners or timers from this phase
    const oldPhase = document.getElementById('mm-container');
    if (oldPhase) oldPhase.remove();
    if (currentPhaseTimerId) clearInterval(currentPhaseTimerId);

    let currentProblem;
    let problemsSolved = 0;
    let problemsToWin;
    let timeLeftForProblem;
    let selectedMode = 'Misto'; // Default mode

    const problemTypes = {
        'Soma': { generator: generateAdditionProblem, minLevel: 0 },
        'Subtração': { generator: generateSubtractionProblem, minLevel: 0 },
        'Multiplicação': { generator: generateMultiplicationProblem, minLevel: 1 },
        'Divisão': { generator: generateDivisionProblem, minLevel: 4 },
        'Porcentagem': { generator: generatePercentageProblem, minLevel: 5 },
        'Expressões': { generator: generateExpressionProblem, minLevel: 6 },
        'Potenciação': { generator: generatePowerProblem, minLevel: 7 },
        'Raiz Quadrada': { generator: generateSqrtProblem, minLevel: 8 },
    };

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- PROBLEM GENERATORS ---
    function generateAdditionProblem(level) {
        const terms = 2 + Math.floor(level / 5);
        const numbers = Array.from({ length: terms }, () => getRandomInt(10, 50 + level * 10));
        const answer = numbers.reduce((sum, num) => sum + num, 0);
        const text = numbers.join(' + ');
        return { text, answer };
    }

    function generateSubtractionProblem(level) {
        const num1 = getRandomInt(50, 100 + level * 15);
        const num2 = getRandomInt(10, num1); // Ensure positive result for simplicity
        return { text: `${num1} - ${num2}`, answer: num1 - num2 };
    }

    function generateMultiplicationProblem(level) {
        const num1 = getRandomInt(2, 12 + level);
        const num2 = getRandomInt(2, 9 + Math.floor(level / 2));
        return { text: `${num1} × ${num2}`, answer: num1 * num2 };
    }

    function generateDivisionProblem(level) {
        // Mostly exact divisions
        const answer = getRandomInt(2, 9 + level);
        const divisor = getRandomInt(2, 9);
        const dividend = answer * divisor;
        return { text: `${dividend} ÷ ${divisor}`, answer: answer };
    }
    
    function generatePercentageProblem(level) {
        const percentages = [10, 20, 25, 50, 75];
        const percent = percentages[getRandomInt(0, percentages.length - 1)];
        const number = getRandomInt(2, 20) * (percent === 25 || percent === 75 ? 4 : 10);
        return { text: `${percent}% de ${number}`, answer: (number * percent) / 100 };
    }

    function generateExpressionProblem(level) {
        const num1 = getRandomInt(2, 10);
        const num2 = getRandomInt(2, 10);
        const num3 = getRandomInt(2, 10);
        const useMultiply = Math.random() > 0.5;
        if (useMultiply) {
            return { text: `(${num1} + ${num2}) × ${num3}`, answer: (num1 + num2) * num3 };
        } else {
            const dividend = (num1 + num2) * num3;
            return { text: `${dividend} ÷ (${num1} + ${num2})`, answer: num3 };
        }
    }
    
    function generatePowerProblem(level) {
        const base = getRandomInt(2, 12);
        const exponent = base > 9 ? 2 : getRandomInt(2,3);
        return { text: `${base}²${exponent === 3 ? ' (Oops, ³!)' : ''}`.replace('³', '³'), answer: Math.pow(base, exponent) };
    }

    function generateSqrtProblem(level) {
        const root = getRandomInt(2, 15 + level);
        const number = root * root;
        return { text: `√${number}`, answer: root };
    }

    function generateProblem() {
        let generator;
        if (selectedMode === 'Misto') {
            const availableTypes = Object.values(problemTypes).filter(type => config.level >= type.minLevel);
            generator = availableTypes[getRandomInt(0, availableTypes.length - 1)].generator;
        } else {
            generator = problemTypes[selectedMode].generator;
        }
        currentProblem = generator(config.level);
        document.getElementById('mm-problem-text').textContent = currentProblem.text;
        document.getElementById('mm-user-input').value = '';
        document.getElementById('mm-user-input').focus();
        startProblemTimer();
    }
    
    function startProblemTimer() {
        if (currentPhaseTimerId) clearInterval(currentPhaseTimerId);
        const timePerProblem = Math.max(5, 20 - config.level);
        timeLeftForProblem = timePerProblem;
        const timerBar = document.getElementById('mm-timer-bar');

        currentPhaseTimerId = setInterval(() => {
            timeLeftForProblem -= 0.1;
            timerBar.style.width = `${(timeLeftForProblem / timePerProblem) * 100}%`;
            if (timeLeftForProblem <= 0) {
                clearInterval(currentPhaseTimerId);
                phaseCompleted(false, { reason: "Tempo esgotado!", text: `A resposta era ${currentProblem.answer}.` });
            }
        }, 100);
    }
    
    function checkAnswer() {
        if (currentPhaseTimerId) clearInterval(currentPhaseTimerId);

        const inputElem = document.getElementById('mm-user-input');
        const userAnswer = parseInt(inputElem.value, 10);
        const feedbackEl = document.getElementById('mm-feedback');

        if (userAnswer === currentProblem.answer) {
            problemsSolved++;
            updateProgress();
            feedbackEl.textContent = 'Correto!';
            feedbackEl.className = 'text-green-400 h-6 text-center';
            
            if (problemsSolved >= problemsToWin) {
                setTimeout(() => phaseCompleted(true, { text: 'Ótimo trabalho! Desafio concluído.' }), 1000);
            } else {
                setTimeout(() => {
                    feedbackEl.textContent = '';
                    generateProblem();
                }, 1000);
            }
        } else {
            feedbackEl.textContent = `Incorreto. A resposta era ${currentProblem.answer}.`;
            feedbackEl.className = 'text-red-400 h-6 text-center';
            setTimeout(() => phaseCompleted(false, { reason: "Resposta incorreta.", text: `A resposta era ${currentProblem.answer}.` }), 2000);
        }
    }

    function updateProgress() {
        const progressText = document.getElementById('mm-progress-text');
        const progressBar = document.getElementById('mm-progress-bar-inner');
        if(progressText) progressText.textContent = `${problemsSolved} / ${problemsToWin}`;
        if(progressBar) progressBar.style.width = `${(problemsSolved / problemsToWin) * 100}%`;
    }
    
    function startGame(mode) {
        selectedMode = mode;
        problemsToWin = selectedMode === 'Misto' ? (3 + Math.floor(config.level / 2)) : 10;
        
        ui.phaseDisplay.innerHTML = `
            <div id="mm-container" class="w-full max-w-lg mx-auto p-6 bg-gray-800 rounded-2xl shadow-xl text-white">
                <h2 class="text-2xl font-bold text-cyan-300 mb-2 text-center">Arena de Cálculo Mental</h2>
                <p class="text-center text-gray-400 mb-4">${mode}</p>
                
                <div id="mm-timer-container" class="w-full bg-gray-700 rounded-full h-2.5 mb-4"><div id="mm-timer-bar" class="bg-yellow-400 h-2.5 rounded-full" style="width: 100%"></div></div>
                
                <div id="mm-problem-text" class="text-5xl font-bold text-center my-8 min-h-[60px]"></div>
                
                <input type="number" id="mm-user-input" class="w-full text-center text-3xl p-3 bg-gray-900 rounded-lg border-2 border-gray-600 focus:border-cyan-400 outline-none mb-4">
                
                <div id="mm-numpad" class="grid grid-cols-3 gap-2 mb-4"></div>
                
                <div id="mm-progress-container" class="w-full mt-4">
                    <div class="flex justify-between mb-1"><span class="text-base font-medium text-gray-400">Progresso</span><span id="mm-progress-text" class="text-sm font-medium text-gray-400">0 / ${problemsToWin}</span></div>
                    <div class="w-full bg-gray-700 rounded-full h-2.5"><div id="mm-progress-bar-inner" class="bg-green-500 h-2.5 rounded-full" style="width: 0%"></div></div>
                </div>
                 <p id="mm-feedback" class="h-6 text-center mt-2"></p>
            </div>
        `;

        const numpad = document.getElementById('mm-numpad');
        const input = document.getElementById('mm-user-input');
        
        ['1','2','3','4','5','6','7','8','9','C','0','✓'].forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'py-3 bg-gray-700 rounded-lg text-2xl font-semibold hover:bg-gray-600 transition-colors';
            if (key === '✓') btn.classList.add('bg-green-600', 'hover:bg-green-500');
            if (key === 'C') btn.classList.add('bg-red-600', 'hover:bg-red-500');
            btn.textContent = key;
            btn.onclick = () => {
                if(key === 'C') input.value = '';
                else if(key === '✓') checkAnswer();
                else input.value += key;
            };
            numpad.appendChild(btn);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });

        generateProblem();
        updateProgress();
    }
    
    // --- Initial Screen ---
    function showModeSelection() {
        const availableModes = Object.keys(problemTypes).filter(mode => config.level >= problemTypes[mode].minLevel);

        ui.phaseDisplay.innerHTML = `
            <div class="w-full max-w-xl mx-auto p-6 bg-gray-800 rounded-2xl shadow-xl text-white">
                <h2 class="text-2xl font-bold text-cyan-300 mb-4 text-center">Arena de Cálculo Mental</h2>
                <p class="text-center text-gray-400 mb-6">Escolha um modo para começar.</p>
                <div id="mm-mode-buttons" class="flex flex-col gap-3">
                    <button data-mode="Misto" class="button button-primary py-3 text-lg">Desafio Misto</button>
                    <h3 class="text-lg text-center font-semibold text-gray-400 pt-4">Treino Focado</h3>
                    ${availableModes.map(mode => `<button data-mode="${mode}" class="button button-secondary py-2">${mode}</button>`).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('mm-mode-buttons').addEventListener('click', (e) => {
            if(e.target.dataset.mode) {
                startGame(e.target.dataset.mode);
            }
        });
    }
    
    showModeSelection();
}
