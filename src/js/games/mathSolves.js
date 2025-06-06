// initQuickMathPhase.js - Nova fase: Cálculo Rápido

function initMathEquationsPhase(config) {
    const level = config.level;
    let score = 0; // Pontuação dentro da fase, se quisermos múltiplas rodadas
    let currentProblemAnswer;
    let problemsThisLevel = 3 + Math.floor(level / 3); // Mais problemas por nível
    let problemsSolved = 0;

    // Tempo por problema: diminui com o nível. Mínimo de 3s, máximo de 15s.
    // Níveis mais altos também têm problemas mais complexos.
    let timePerProblem = Math.max(3, 15 - level * 0.75 - Math.floor(level / 4) * 2);
    let timeLeftForProblem;

    // Limpa o temporizador anterior, se houver
    if (currentPhaseTimerId) {
        clearInterval(currentPhaseTimerId);
        currentPhaseTimerId = null;
    }

    function generateProblem() {
        let num1, num2, num3, operation1, operation2, problemText;
        const maxDigits = Math.min(2 + Math.floor(level / 2), 5); // Máximo de 5 dígitos
        const allowNegatives = level >= 3;

        function getRandomInt(digits, allowNegative = false, nonZero = false) {
            const max = Math.pow(10, digits) -1;
            const min = nonZero ? 1 : 0;
            let num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (allowNegative && Math.random() < 0.3) {
                num *= -1;
            }
            return num;
        }

        const problemTypes = ['add', 'subtract'];
        if (level >= 1) problemTypes.push('multiply_simple'); // 2dig * 1dig
        if (level >= 2) problemTypes.push('add_3_terms');
        if (level >= 3) problemTypes.push('subtract_neg'); // Envolve resultado negativo ou operandos
        if (level >= 4) problemTypes.push('multiply_medium'); // 2dig * 2dig or 3dig * 1dig
        if (level >= 5) problemTypes.push('divide_simple_exact'); // Divisão exata
        if (level >= 6) problemTypes.push('add_subtract_mixed');
        if (level >= 7) problemTypes.push('multiply_add_subtract'); // (a*b) +/- c
        if (level >= 8) problemTypes.push('divide_medium_exact');
        if (level >= 10) problemTypes.push('multiply_hard'); // 3dig * 2dig

        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];

        switch (type) {
            case 'add':
            default:
                num1 = getRandomInt(maxDigits, allowNegatives && level > 4);
                num2 = getRandomInt(maxDigits, allowNegatives && level > 4);
                currentProblemAnswer = num1 + num2;
                problemText = `${num1} + ${num2}`;
                break;
            case 'subtract':
                num1 = getRandomInt(maxDigits, allowNegatives && level > 4);
                num2 = getRandomInt(maxDigits, allowNegatives && level > 4);
                if (num2 > num1 && level < 3 && !allowNegatives) { // Evita negativo em níveis baixos sem permissão
                    [num1, num2] = [num2, num1];
                }
                currentProblemAnswer = num1 - num2;
                problemText = `${num1} - ${num2}`;
                break;
            case 'subtract_neg': // Garante que possa haver negativos
                 num1 = getRandomInt(maxDigits, true);
                 num2 = getRandomInt(maxDigits, true);
                 currentProblemAnswer = num1 - num2;
                 problemText = `${num1} - ${num2}`;
                 break;
            case 'multiply_simple':
                num1 = getRandomInt(Math.min(maxDigits, 2), allowNegatives && level > 5);
                num2 = getRandomInt(1, allowNegatives && level > 5, true); // 1 dígito, não zero
                currentProblemAnswer = num1 * num2;
                problemText = `${num1} × ${num2}`;
                break;
            case 'multiply_medium':
                if (Math.random() < 0.5) {
                    num1 = getRandomInt(2, allowNegatives && level > 6);
                    num2 = getRandomInt(2, allowNegatives && level > 6, true);
                } else {
                    num1 = getRandomInt(3, allowNegatives && level > 6);
                    num2 = getRandomInt(1, allowNegatives && level > 6, true);
                }
                currentProblemAnswer = num1 * num2;
                problemText = `${num1} × ${num2}`;
                break;
            case 'multiply_hard':
                 num1 = getRandomInt(3, allowNegatives && level > 7);
                 num2 = getRandomInt(2, allowNegatives && level > 7, true);
                 currentProblemAnswer = num1 * num2;
                 problemText = `${num1} × ${num2}`;
                 break;
            case 'divide_simple_exact':
                num2 = getRandomInt(1, false, true); // Divisor de 1 dígito, positivo, não zero
                currentProblemAnswer = getRandomInt(Math.min(maxDigits, 2), false); // Resultado
                num1 = currentProblemAnswer * num2;
                problemText = `${num1} ÷ ${num2}`;
                break;
            case 'divide_medium_exact':
                num2 = getRandomInt(Math.min(maxDigits-1, 2), false, true); // Divisor de 1 ou 2 dígitos
                if (num2 === 0) num2 = 1;
                currentProblemAnswer = getRandomInt(2, false);
                num1 = currentProblemAnswer * num2;
                problemText = `${num1} ÷ ${num2}`;
                break;
            case 'add_3_terms':
                num1 = getRandomInt(Math.min(maxDigits,3), allowNegatives && level > 5);
                num2 = getRandomInt(Math.min(maxDigits,3), allowNegatives && level > 5);
                num3 = getRandomInt(Math.min(maxDigits,3), allowNegatives && level > 5);
                currentProblemAnswer = num1 + num2 + num3;
                problemText = `${num1} + ${num2} + ${num3}`;
                break;
            case 'add_subtract_mixed':
                num1 = getRandomInt(maxDigits, allowNegatives && level > 6);
                num2 = getRandomInt(maxDigits, allowNegatives && level > 6);
                num3 = getRandomInt(maxDigits, allowNegatives && level > 6);
                if (Math.random() < 0.5) {
                    currentProblemAnswer = num1 + num2 - num3;
                    problemText = `${num1} + ${num2} - ${num3}`;
                } else {
                    currentProblemAnswer = num1 - num2 + num3;
                    problemText = `${num1} - ${num2} + ${num3}`;
                }
                break;
            case 'multiply_add_subtract':
                num1 = getRandomInt(2, allowNegatives && level > 8);
                num2 = getRandomInt(1, allowNegatives && level > 8, true);
                num3 = getRandomInt(2, allowNegatives && level > 8);
                if (Math.random() < 0.5) {
                    currentProblemAnswer = (num1 * num2) + num3;
                    problemText = `(${num1} × ${num2}) + ${num3}`;
                } else {
                    currentProblemAnswer = (num1 * num2) - num3;
                    problemText = `(${num1} × ${num2}) - ${num3}`;
                }
                break;
        }

        document.getElementById('quick-math-problem').textContent = problemText + " = ?";
        document.getElementById('quick-math-input').value = '';
        document.getElementById('quick-math-input').focus();
        startProblemTimer();
    }

    function startProblemTimer() {
        timeLeftForProblem = timePerProblem;
        ui.limitDisplay.textContent = `Tempo: ${Math.ceil(timeLeftForProblem)}s`;

        if (currentPhaseTimerId) clearInterval(currentPhaseTimerId); // Limpa timer anterior do problema
        currentPhaseTimerId = setInterval(() => {
            if (!gameActive) {
                clearInterval(currentPhaseTimerId);
                currentPhaseTimerId = null;
                return;
            }
            timeLeftForProblem -= 0.1;
            ui.limitDisplay.textContent = `Tempo: ${Math.ceil(timeLeftForProblem)}s`;
            if (timeLeftForProblem <= 0) {
                clearInterval(currentPhaseTimerId);
                currentPhaseTimerId = null;
                phaseCompleted(false, { reason: "Tempo esgotado para o cálculo!", text: `A resposta era ${currentProblemAnswer}.` });
            }
        }, 100);
    }

    function handleSubmitQuickMath() {
        if (!gameActive) return;
        clearInterval(currentPhaseTimerId); // Para o timer do problema atual
        currentPhaseTimerId = null;

        const inputElem = document.getElementById('quick-math-input');
        const userAnswer = parseInt(inputElem.value.trim());

        if (isNaN(userAnswer)) {
            // Não penaliza por input vazio ou não numérico, apenas não avança
            showModal("Entrada inválida.", {text: "Por favor, insira um número."});
            // Reinicia o timer para o mesmo problema ou gera um novo?
            // Por simplicidade, vamos gerar um novo se errar ou não responder.
            // Ou melhor, vamos considerar como erro.
            phaseCompleted(false, { reason: "Entrada inválida.", text: `A resposta era ${currentProblemAnswer}.` });
            return;
        }

        if (userAnswer === currentProblemAnswer) {
            score++;
            problemsSolved++;
            if (problemsSolved >= problemsThisLevel) {
                phaseCompleted(true, { text: `Cálculos concluídos! Pontuação: ${score}/${problemsThisLevel}` });
            } else {
                // Prepara para o próximo problema
                document.getElementById('quick-math-feedback').textContent = "Correto!";
                setTimeout(() => {
                     document.getElementById('quick-math-feedback').textContent = "";
                     generateProblem();
                }, 700); // Pequeno delay para feedback
            }
        } else {
            phaseCompleted(false, { reason: "Resposta incorreta.", text: `A resposta era ${currentProblemAnswer}.` });
        }
    }

    ui.phaseDisplay.innerHTML = `
        <div class="p-4 rounded-lg shadow-md w-full max-w-md mx-auto bg-gray-800 text-white">
            <h2 class="phase-title text-xl lg:text-2xl font-semibold mb-3 text-center">Cálculo Rápido!</h2>
            <div id="quick-math-problem" class="text-2xl md:text-3xl lg:text-4xl font-mono text-center text-amber-400 mb-4 p-3 bg-gray-700 rounded min-h-[60px] flex items-center justify-center"></div>
            <div class="flex justify-center items-center mb-3">
                <input type="number" id="quick-math-input" class="input-field px-3 py-2 w-40 text-center text-lg bg-gray-700 border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Sua Resposta">
                <button id="quick-math-submit" class="button button-primary ml-3 px-4 py-2 text-base">Verificar</button>
            </div>
            <p id="quick-math-feedback" class="text-center text-green-400 h-5"></p>
            <p class="text-xs text-gray-400 text-center mt-2">Resolva ${problemsThisLevel} cálculos para avançar.</p>
        </div>
    `;

    const input = document.getElementById('quick-math-input');
    const submitBtn = document.getElementById('quick-math-submit');

    submitBtn.addEventListener('click', handleSubmitQuickMath);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmitQuickMath();
        }
    });

    generateProblem(); // Inicia o primeiro problema
}
