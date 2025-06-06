function initSequencePhase(config) {
    const level = config.level;

    // 1. Ajuste Dinâmico do Limite de Tempo
    let timeLeft = Math.max(15, 80 - level * 3.5); // Mínimo 15s, diminui mais rápido
    ui.limitDisplay.textContent = `Tempo: ${Math.ceil(timeLeft)}s`; // Arredonda para cima para exibição inicial
    let answer;
    let detailedExplanation = ""; // Para sequências muito complexas

    if (currentPhaseTimerId) {
        clearInterval(currentPhaseTimerId);
        currentPhaseTimerId = null;
    }

    currentPhaseTimerId = setInterval(() => {
        if (!gameActive) {
            clearInterval(currentPhaseTimerId);
            currentPhaseTimerId = null;
            return;
        }
        timeLeft -= 0.1; // Contagem mais granular para percepção
        ui.limitDisplay.textContent = `Tempo: ${Math.ceil(timeLeft)}s`;
        if (timeLeft <= 0) {
            clearInterval(currentPhaseTimerId);
            currentPhaseTimerId = null;
            phaseCompleted(false, {
                reason: "Tempo esgotado!",
                text: `A resposta correta era ${answer}. ${detailedExplanation}`.trim()
            });
        }
    }, 100); // Intervalo de 100ms

    // 2. Parâmetros e Comprimento
    const baseLength = Math.min(3 + Math.floor(level / 1.5), 8); // Aumenta mais rápido, máx 8
    let sequence = [];
    const paramDifficulty = Math.min(Math.floor(level / 1.5) + 1, 15);
    const allowNegativeParams = level >= 2; // Negativos mais cedo
    const maxStartNum = 10 + paramDifficulty * 3;
    const maxDiffRatio = 4 + paramDifficulty;

    function getRandomParam(maxVal, allowNegative = false, ensureNonZero = false, allowFraction = false, precision = 1) {
        let val = (Math.random() * maxVal);
        if (!allowFraction) val = Math.floor(val);
        else val = parseFloat(val.toFixed(precision));

        if (ensureNonZero && val === 0) val = allowFraction ? 0.5 : 1;

        if (allowNegative && Math.random() < 0.45) { // 45% de chance
            val *= -1;
            if (ensureNonZero && val === 0) val = allowFraction ? (Math.random() < 0.5 ? 0.5 : -0.5) : (Math.random() < 0.5 ? 1 : -1);
        }
        return val;
    }

    const sequenceTypes = [
        'arithmetic', 'geometric', 'fibonacci_like', 'alternating_add_subtract',
        'squared_offset', 'prime_numbers', 'quadratic', 'geometric_offset',
        'second_order_arithmetic', 'interleaved_simple',
        'cubic', // Novo: a*n^3 + b*n^2 + c*n + d
        'power_sum_diff', // Novo: n^a +/- (n+1)^b
        'recursive_complex' // Novo: T(n) = a*T(n-1) + b*T(n-2) + c
    ];

    // Filtra tipos baseados no nível para progressão
    let availableTypes = [...sequenceTypes];
    if (level < 1) availableTypes = ['arithmetic', 'geometric'];
    else if (level < 2) availableTypes = availableTypes.filter(t => !['cubic', 'power_sum_diff', 'recursive_complex', 'interleaved_simple', 'second_order_arithmetic'].includes(t));
    else if (level < 3) availableTypes = availableTypes.filter(t => !['cubic', 'power_sum_diff', 'recursive_complex'].includes(t));
    else if (level < 4) availableTypes = availableTypes.filter(t => !['cubic'].includes(t));


    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    // console.log(`Lvl: ${level}, Tipo: ${type}, Compr: ${baseLength}, ParamDiff: ${paramDifficulty}`);
    let p1, p2, p3, p4, r1, nStart; // Parâmetros

    switch (type) {
        case 'arithmetic':
            p1 = getRandomParam(maxStartNum, allowNegativeParams);
            p2 = getRandomParam(maxDiffRatio, allowNegativeParams, true);
            for (let i = 0; i < baseLength; i++) sequence.push(p1 + i * p2);
            answer = p1 + baseLength * p2;
            detailedExplanation = `PA: início ${p1}, razão ${p2}.`;
            break;

        case 'geometric':
            p1 = getRandomParam(Math.min(maxStartNum, 15), false, true);
            p2 = getRandomParam(Math.min(maxDiffRatio, level < 3 ? 3 : 4), level > 4, true);
            if (Math.abs(p2) === 1 && level > 2) p2 = Math.sign(p2) * (Math.random() < 0.5 ? 2 : 3);
            if (Math.abs(p2) > 3 && baseLength > 5) p2 = Math.sign(p2) * 3;
            let currentValGeo = p1;
            for (let i = 0; i < baseLength; i++) {
                sequence.push(currentValGeo);
                if (Math.abs(currentValGeo) > 200000 && i < baseLength - 1) {
                    answer = currentValGeo * p2; sequence = sequence.slice(0, i + 1); baseLength = sequence.length; break;
                }
                currentValGeo *= p2;
            }
            if (sequence.length === baseLength) answer = currentValGeo;
            detailedExplanation = `PG: início ${p1}, razão ${p2}.`;
            break;

        case 'fibonacci_like': // T(n) = T(n-1) + T(n-2)
            p1 = getRandomParam(maxStartNum, allowNegativeParams && level > 4);
            p2 = getRandomParam(maxStartNum, allowNegativeParams && level > 4);
            if (p1 === 0 && p2 === 0) p2 = 1;
            sequence.push(p1); sequence.push(p2);
            for (let i = 2; i < baseLength; i++) sequence.push(sequence[i - 1] + sequence[i - 2]);
            answer = sequence[baseLength - 1] + sequence[baseLength - 2];
            detailedExplanation = `Fibonacci-like: T(n) = T(n-1) + T(n-2). Início: ${p1}, ${p2}.`;
            break;

        case 'alternating_add_subtract':
            p1 = getRandomParam(maxStartNum, allowNegativeParams); // start
            p2 = getRandomParam(maxDiffRatio, false, true); // add
            p3 = getRandomParam(maxDiffRatio, false, true); // subtract
            if (p2 === p3 && level < 5) p3 +=1;
            let currentValAlt = p1; sequence.push(currentValAlt);
            for (let i = 1; i < baseLength; i++) {
                if (i % 2 !== 0) currentValAlt += p2; else currentValAlt -= p3;
                sequence.push(currentValAlt);
            }
            answer = (baseLength % 2 !== 0) ? currentValAlt + p2 : currentValAlt - p3;
            detailedExplanation = `Alternada: início ${p1}, +${p2}, -${p3}.`;
            break;

        case 'squared_offset': // (n+a)^2 + b  OU  n^2 + a
            nStart = Math.random() < 0.4 ? getRandomParam(3, false) : 0;
            if (Math.random() < 0.5 || level < 3) { // (n+a)^2 + b
                p1 = getRandomParam(paramDifficulty, allowNegativeParams && level > 3); // a
                p2 = getRandomParam(paramDifficulty, allowNegativeParams); // b
                for (let i = 0; i < baseLength; i++) sequence.push(Math.pow(nStart + i + p1, 2) + p2);
                answer = Math.pow(nStart + baseLength + p1, 2) + p2;
                detailedExplanation = `Quadrática: (n+${p1})^2 + ${p2}, com n começando em ${nStart}.`;
            } else { // a*n^2 + b
                p1 = getRandomParam(paramDifficulty, allowNegativeParams && level > 3, true); // a (non-zero)
                p2 = getRandomParam(paramDifficulty, allowNegativeParams); // b
                for (let i = 0; i < baseLength; i++) sequence.push(p1 * Math.pow(nStart + i, 2) + p2);
                answer = p1 * Math.pow(nStart + baseLength, 2) + p2;
                detailedExplanation = `Quadrática: ${p1}*n^2 + ${p2}, com n começando em ${nStart}.`;
            }
            break;

        case 'prime_numbers':
            const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113];
            p1 = Math.floor(Math.random() * (primes.length - baseLength - Math.min(level, 10)));
            if (p1 + baseLength >= primes.length) p1 = Math.max(0, primes.length - baseLength -1);
            sequence = primes.slice(p1, p1 + baseLength);
            answer = primes[p1 + baseLength];
            detailedExplanation = `Sequência de números primos.`;
            break;

        case 'quadratic': // a*n^2 + b*n + c
            nStart = Math.random() < 0.4 && level > 2 ? getRandomParam(3, false) : 0;
            p1 = getRandomParam(Math.min(paramDifficulty, 6), allowNegativeParams && level > 4, true); // a
            p2 = getRandomParam(paramDifficulty, allowNegativeParams);      // b
            p3 = getRandomParam(maxStartNum, allowNegativeParams);          // c
            for (let i = 0; i < baseLength; i++) { let n = nStart + i; sequence.push(p1*n*n + p2*n + p3); }
            let nextNQuad = nStart + baseLength; answer = p1*nextNQuad*nextNQuad + p2*nextNQuad + p3;
            detailedExplanation = `Polinomial: ${p1}n² + ${p2}n + ${p3}, n começando em ${nStart}.`;
            break;

        case 'geometric_offset': // k * r^n + c
            nStart = Math.random() < 0.4 ? getRandomParam(2, false) : 0;
            p1 = getRandomParam(Math.min(paramDifficulty, 5), false, true); // k
            r1 = getRandomParam(Math.min(paramDifficulty, 3), level > 5, true); // r
            if (Math.abs(r1) === 1 && level > 3) r1 = Math.sign(r1) * 2;
            p2 = getRandomParam(maxStartNum, allowNegativeParams); // c
            for (let i = 0; i < baseLength; i++) {
                let n = nStart + i; let term = p1 * Math.pow(r1, n) + p2;
                if (Math.abs(term) > 200000 && i < baseLength -1) {
                    answer = p1 * Math.pow(r1, nStart + baseLength) + p2; sequence = sequence.slice(0,i+1); baseLength=sequence.length; break;
                }
                sequence.push(term);
            }
            if(sequence.length === baseLength) answer = p1 * Math.pow(r1, nStart + baseLength) + p2;
            detailedExplanation = `Geométrica com Offset: ${p1}*(${r1}^n) + ${p2}, n começando em ${nStart}.`;
            break;

        case 'second_order_arithmetic': // Diferenças formam PA
            p1 = getRandomParam(maxStartNum, allowNegativeParams); // start
            p2 = getRandomParam(paramDifficulty, allowNegativeParams);      // first diff
            p3 = getRandomParam(Math.min(paramDifficulty,6), allowNegativeParams, true); // common diff of diffs
            sequence.push(p1); let currentDiff = p2; let lastTerm = p1;
            for (let i = 1; i < baseLength; i++) { lastTerm += currentDiff; sequence.push(lastTerm); currentDiff += p3; }
            answer = lastTerm + currentDiff;
            detailedExplanation = `Aritmética de 2ª Ordem: início ${p1}, 1ª diferença ${p2}, razão das diferenças ${p3}.`;
            break;

        case 'interleaved_simple':
            let seq1 = [], seq2 = [];
            p1 = getRandomParam(maxStartNum, allowNegativeParams); p2 = getRandomParam(maxDiffRatio, allowNegativeParams, true); // seq1 params
            p3 = getRandomParam(maxStartNum, allowNegativeParams); p4 = getRandomParam(maxDiffRatio, allowNegativeParams, true); // seq2 params
            if (p1===p3 && p2===p4) p4 += (p4 > 0 ? 1: -1);
            const termsNeeded = Math.ceil(baseLength / 2);
            for (let i = 0; i < termsNeeded + 1; i++) { seq1.push(p1 + i * p2); seq2.push(p3 + i * p4); }
            for (let i = 0; i < baseLength; i++) { sequence.push(i % 2 === 0 ? seq1[Math.floor(i/2)] : seq2[Math.floor(i/2)]); }
            answer = baseLength % 2 === 0 ? seq1[termsNeeded] : seq2[termsNeeded];
            detailedExplanation = `Intercalada: [${p1}, diff ${p2}] e [${p3}, diff ${p4}].`;
            break;

        case 'cubic': // a*n^3 + b*n^2 + c*n + d (disponível level >= 4)
            nStart = Math.random() < 0.3 && level > 5 ? getRandomParam(2, false) : 0;
            p1 = getRandomParam(Math.min(paramDifficulty, 3), allowNegativeParams && level > 6, true); // a
            p2 = getRandomParam(Math.min(paramDifficulty, 4), allowNegativeParams && level > 5); // b
            p3 = getRandomParam(paramDifficulty, allowNegativeParams); // c
            p4 = getRandomParam(maxStartNum, allowNegativeParams); // d
            for (let i = 0; i < baseLength; i++) { let n = nStart + i; sequence.push(p1*n*n*n + p2*n*n + p3*n + p4); }
            let nextNCubic = nStart + baseLength; answer = p1*nextNCubic*nextNCubic*nextNCubic + p2*nextNCubic*nextNCubic + p3*nextNCubic + p4;
            detailedExplanation = `Cúbica: ${p1}n³ + ${p2}n² + ${p3}n + ${p4}, n começando em ${nStart}.`;
            break;

        case 'power_sum_diff': // n^a +/- (n+k)^b (disponível level >= 3)
            nStart = getRandomParam(5, false) +1; // n começa > 0
            p1 = getRandomParam(3, false, true) +1; // a (expoente >=2)
            p2 = getRandomParam(3, false, true) +1; // b (expoente >=2)
            p3 = getRandomParam(3, false); // k (offset para o segundo termo)
            const operation = Math.random() < 0.5 ? 1 : -1; // 1 para soma, -1 para diferença

            for (let i = 0; i < baseLength; i++) {
                let n = nStart + i;
                sequence.push(Math.pow(n, p1) + operation * Math.pow(n + p3, p2));
            }
            let nextNPower = nStart + baseLength;
            answer = Math.pow(nextNPower, p1) + operation * Math.pow(nextNPower + p3, p2);
            detailedExplanation = `Potências: n^${p1} ${operation > 0 ? '+':'-'} (n+${p3})^${p2}, n começando em ${nStart}.`;
            break;

        case 'recursive_complex': // T(n) = a*T(n-1) + b*T(n-2) + c (disponível level >= 3)
            p1 = getRandomParam(maxStartNum, allowNegativeParams && level > 5); // Termo 1
            p2 = getRandomParam(maxStartNum, allowNegativeParams && level > 5); // Termo 2
            let coefA = getRandomParam(3, level > 6, true); // Coeficiente a para T(n-1)
            let coefB = getRandomParam(3, level > 7); // Coeficiente b para T(n-2)
            let constC = getRandomParam(paramDifficulty, allowNegativeParams && level > 4); // Constante c
            if (coefA === 0 && coefB === 0) coefA = 1; // Evitar T(n) = c

            sequence.push(p1);
            if (baseLength > 1) sequence.push(p2);
            for (let i = 2; i < baseLength; i++) {
                let term = coefA * sequence[i-1] + coefB * sequence[i-2] + constC;
                if (Math.abs(term) > 300000 && i < baseLength -1) { // Prevenção de estouro
                     answer = coefA * sequence[baseLength-1] + coefB * sequence[baseLength-2] + constC;
                     sequence = sequence.slice(0,i+1); baseLength=sequence.length; break;
                }
                sequence.push(term);
            }
            if (sequence.length === baseLength) {
                 answer = coefA * sequence[baseLength-1] + coefB * sequence[baseLength-2] + constC;
            }
            detailedExplanation = `Recursiva: T(n) = ${coefA}*T(n-1) + ${coefB}*T(n-2) + ${constC}. Início: ${p1}, ${p2}.`;
            break;

        default: // Fallback
            p1 = getRandomParam(10, false); p2 = getRandomParam(5, false, true);
            for (let i = 0; i < baseLength; i++) sequence.push(p1 + i * p2);
            answer = p1 + baseLength * p2;
            detailedExplanation = `PA (fallback): início ${p1}, razão ${p2}.`;
            break;
    }

    // Final check for extremely large numbers or NaN/Infinity
    if (isNaN(answer) || !isFinite(answer) || Math.abs(answer) > 1000000 || sequence.some(n => isNaN(n) || !isFinite(n) || Math.abs(n) > 1000000)) {
        // console.warn("Fallback final devido a número inválido/grande. Nível:", level, "Tipo:", type, "Seq:", sequence, "Resp:", answer);
        p1 = getRandomParam(10, false); p2 = getRandomParam(3, false, true); sequence = [];
        for (let i = 0; i < baseLength; i++) sequence.push(p1 + i * p2);
        answer = p1 + baseLength * p2;
        detailedExplanation = `PA (fallback final): início ${p1}, razão ${p2}.`;
    }

    // Arredondar se a resposta for um float com muitas casas decimais (improvável com a lógica atual, mas seguro)
    if (typeof answer === 'number' && !Number.isInteger(answer)) {
        answer = parseFloat(answer.toFixed(2)); // Arredonda para 2 casas decimais
    }


    ui.phaseDisplay.innerHTML = `
        <div class="p-3 rounded-lg shadow-md w-full max-w-xl mx-auto bg-gray-800">
            <h2 class="phase-title text-xl lg:text-2xl font-semibold mb-2 text-center text-white">Completar a Sequência</h2>
            <p class="text-sm text-gray-300 mb-3 text-center">Qual o próximo número na sequência?</p>
            <p class="text-2xl md:text-3xl lg:text-4xl font-mono text-center text-amber-400 mb-4 break-words p-3 bg-gray-700 rounded shadow-inner">
                ${sequence.map(n => (typeof n === 'number' && !Number.isInteger(n)) ? n.toFixed(2) : n).join(',&nbsp; ')}<span class="text-teal-400">, ?</span>
            </p>
            <div class="flex justify-center items-center mb-2">
                <input type="text" id="sequence-input" class="input-field px-3 py-2 w-40 text-center text-lg bg-gray-700 border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Resposta">
                <button id="sequence-submit" class="button button-primary ml-3 px-4 py-2 text-base">Verificar</button>
            </div>
        </div>`;

    const input = document.getElementById('sequence-input');
    const submitBtn = document.getElementById('sequence-submit');
    if(input) input.focus();

    function handleSubmit() {
        if (!gameActive) return;
        const userAnswerText = input.value.trim().replace(',', '.'); // Aceita vírgula como decimal
        if (userAnswerText === "") { showModal("Por favor, insira um número."); return; }

        const userAnswer = parseFloat(userAnswerText); // Usa parseFloat para decimais

        if (isNaN(userAnswer)) { showModal("Entrada inválida. Insira apenas números."); return; }

        // Comparação com tolerância para floats
        const tolerance = 0.01; // Ajuste conforme necessário
        if (Math.abs(userAnswer - answer) < tolerance) {
            phaseCompleted(true, { text: "Sequência correta!" });
        } else {
            phaseCompleted(false, {
                reason: "Resposta incorreta.",
                text: `A resposta correta era ${answer}. ${detailedExplanation}`.trim()
            });
        }
    }
    submitBtn.addEventListener('click', handleSubmit);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } });
}
