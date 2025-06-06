function initCriptogramPhase(config) { 
    const phrases = [
      { text: "A LOGICA LEVA DE A ATE B A IMAGINACAO LEVA A TODO LUGAR", author: "Albert Einstein" },
      { text: "PENSO LOGO EXISTO", author: "Rene Descartes" },
      { text: "O SABIO NUNCA DIZ TUDO O QUE PENSA MAS PENSA SEMPRE TUDO O QUE DIZ", author: "Aristoteles" }
    ];
    const phraseData = phrases[Math.floor(Math.random() * phrases.length)];
    const originalText = phraseData.text.toUpperCase();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    let shuffledAlphabetArray = alphabet.split('').sort(() => 0.5 - Math.random());
    for (let i = 0; i < alphabet.length; i++) {
        if (alphabet[i] === shuffledAlphabetArray[i]) {
            let j = (i + 1) % alphabet.length;
            let attempts = 0;
            while (j === i && attempts < alphabet.length) {
                j = (j + 1) % alphabet.length;
                attempts++;
            }
            if (j === i) {
                let k = (i + 2) % alphabet.length;
                if (k === i) k = (i > 0 ? i - 1 : (alphabet.length > 1 ? 1 : 0));
                j = k;
            }
            [shuffledAlphabetArray[i], shuffledAlphabetArray[j]] =
                [shuffledAlphabetArray[j], shuffledAlphabetArray[i]];
        }
    }
    const shuffledAlphabet = shuffledAlphabetArray.join('');
    
    const cryptoKey = {};
    const reverseKey = {};
    for (let i = 0; i < alphabet.length; i++) {
        cryptoKey[alphabet[i]] = shuffledAlphabet[i];
        reverseKey[shuffledAlphabet[i]] = alphabet[i];
    }
    const encryptedText = originalText
      .split('')
      .map(char => cryptoKey[char] || char)
      .join('');
    let userMapping = {};

    const revealedCountLevels = [0, 1, 1, 2, 2, 2, 3, 3, 3, 3];
    const numRevealed = revealedCountLevels[Math.min(config.level, revealedCountLevels.length - 1)];
    let revealedChars = [];
    if (numRevealed > 0) {
        // Correção aplicada aqui: colocar "..." antes de new Set
        const uniqueEncryptedChars = [...new Set(encryptedText.split('').filter(c => alphabet.includes(c)))];
        for (let i = 0; i < numRevealed && uniqueEncryptedChars.length > 0; i++) {
            const randIdx = Math.floor(Math.random() * uniqueEncryptedChars.length);
            const charToRevealEnc = uniqueEncryptedChars.splice(randIdx, 1)[0];
            userMapping[charToRevealEnc] = reverseKey[charToRevealEnc];
            revealedChars.push(`${charToRevealEnc}=${userMapping[charToRevealEnc]}`);
        }
    }
    const revealedHint = revealedChars.length > 0
      ? `Dica: ${revealedChars.join(', ')}`
      : "Nenhuma dica inicial.";

    const timeLimitsCrypto = [300, 270, 240, 210, 180, 180, 150, 150, 120, 120];
    let timeLeft = timeLimitsCrypto[Math.min(config.level, timeLimitsCrypto.length - 1)];
    ui.limitDisplay.textContent = `Tempo: ${timeLeft}s`;
    currentPhaseTimerId = setInterval(() => {
        if (!gameActive) {
            clearInterval(currentPhaseTimerId);
            return;
        }
        timeLeft--;
        ui.limitDisplay.textContent = `Tempo: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(currentPhaseTimerId);
            phaseCompleted(false, { 
              reason: "Tempo esgotado!", 
              text: `A frase era: "${originalText}"` 
            });
        }
    }, 1000);

    ui.phaseDisplay.innerHTML = `
        <div class="p-3 rounded-lg shadow-md w-full max-w-xl mx-auto">
            <h2 class="phase-title text-lg font-semibold mb-2 text-center">Criptograma</h2>
            <p class="text-xs text-gray-300 mb-1 text-center">Decifre a citação.</p>
            <p class="text-xs text-gray-400 mb-3 text-center">${revealedHint}</p>
            <div id="crypto-text-display" class="crypto-text p-2 bg-gray-800 rounded"></div>
            <p class="text-sm text-center my-3">Mapeamento (Cifrada -> Palpite):</p>
            <div id="crypto-mapping-inputs" class="crypto-mapping-area"></div>
            <div class="text-center mt-4">
                <button id="crypto-check-button" class="button button-primary px-3 py-1 text-sm">Verificar</button>
            </div>
        </div>`;

    const textDisplay = document.getElementById('crypto-text-display');
    const mappingInputsDiv = document.getElementById('crypto-mapping-inputs');
    const checkBtnCrypto = document.getElementById('crypto-check-button');

    function renderCryptoText() {
        textDisplay.innerHTML = encryptedText.split('').map(char => {
            if (alphabet.includes(char)) {
                const guess = userMapping[char] || '_';
                return `
                  <span class="relative group">
                    <span class="crypto-char-placeholder">${guess}</span>
                    <span class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1 py-0.5 
                                 text-xs bg-gray-900 text-sky-400 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${char}
                    </span>
                  </span>`;
            }
            return `<span>${char === ' ' ? '&nbsp;&nbsp;' : char}</span>`;
        }).join('');
    }

    const uniqueCharsInEncrypted = [...new Set(encryptedText.split(''))]
      .filter(c => alphabet.includes(c))
      .sort();
    uniqueCharsInEncrypted.forEach(encChar => {
        const pairDiv = document.createElement('div');
        pairDiv.classList.add('crypto-map-pair');
        const encCharLabel = document.createElement('span');
        encCharLabel.textContent = encChar;
        const input = document.createElement('input');
        input.type = "text";
        input.maxLength = 1;
        input.dataset.encChar = encChar;
        input.value = userMapping[encChar] || '';
        if (userMapping[encChar] && revealedChars.some(r => r.startsWith(encChar))) {
            input.disabled = true;
            input.classList.add('bg-gray-600', 'text-gray-400');
        }
        input.addEventListener('input', (e) => {
            let val = e.target.value.toUpperCase();
            if (val.length > 1) val = val[0];
            e.target.value = val;
            if (val && alphabet.includes(val)) {
                for (const key in userMapping) {
                    if (userMapping[key] === val && key !== encChar) {
                        const prevInput = mappingInputsDiv.querySelector(
                          `input[data-enc-char="${key}"]`
                        );
                        if (prevInput && !prevInput.disabled) {
                            prevInput.value = '';
                            delete userMapping[key];
                        }
                    }
                }
                userMapping[encChar] = val;
            } else if (!val) {
                delete userMapping[encChar];
            } else {
                e.target.value = userMapping[encChar] || '';
            }
            renderCryptoText();
        });
        pairDiv.appendChild(encCharLabel);
        pairDiv.appendChild(input);
        mappingInputsDiv.appendChild(pairDiv);
    });

    checkBtnCrypto.addEventListener('click', () => {
        if (!gameActive) return;
        const decryptedAttempt = encryptedText
          .split('')
          .map(char => userMapping[char] || (alphabet.includes(char) ? '_' : char))
          .join('');
        if (decryptedAttempt === originalText) {
            phaseCompleted(true, { 
              text: `Resolvido! Frase: "${originalText}" - ${phraseData.author}` 
            });
        } else {
            phaseCompleted(false, { 
              reason: "Decifração incorreta.", 
              text: `Sua tentativa: "${decryptedAttempt}". Correto: "${originalText}"` 
            });
        }
    });

    renderCryptoText();
}