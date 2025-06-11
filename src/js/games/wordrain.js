// wordrain.js

let wr_animationFrameId = null;
let wr_inputListener = null;

function cleanupWordRain() {
    if (wr_animationFrameId) {
        cancelAnimationFrame(wr_animationFrameId);
        wr_animationFrameId = null;
    }
    const inputEl = document.getElementById('wr-input');
    if (inputEl && wr_inputListener) {
        inputEl.removeEventListener('input', wr_inputListener);
        wr_inputListener = null;
    }
}

function initWordRainPhase(config) {
    cleanupWordRain();

    // --- Configuração da Fase ---
    const level = config.level;
    const settings = {
        wordsToClear: 15 + level * 5,
        initialLives: 5,
        spawnRate: 120 - level * 5, // A cada X frames, uma nova palavra pode surgir
        baseSpeed: 0.5 + level * 0.1,
        wordLengthMin: 3 + Math.floor(level / 5),
        wordLengthMax: 5 + Math.floor(level / 3),
    };
    settings.spawnRate = Math.max(30, settings.spawnRate);

    // --- Banco de Palavras (em Português) ---
    const WORD_BANK = [
        'casa', 'bola', 'gato', 'azul', 'verde', 'sol', 'lua', 'rio', 'mar', 'flor', 'amor', 'vida', 'paz',
        'amigo', 'festa', 'doce', 'feliz', 'cores', 'vento', 'chuva', 'fogo', 'terra', 'olhar', 'risos',
        'tempo', 'força', 'sonho', 'magia', 'brisa', 'calma', 'forte', 'lindo', 'belo', 'suave', 'quente',
        'frio', 'noite', 'manhã', 'tarde', 'viagem', 'praia', 'campo', 'cidade', 'ponte', 'estrada',
        'música', 'dança', 'poema', 'livro', 'letra', 'papel', 'janela', 'porta', 'chave', 'segredo',
        'tesouro', 'desafio', 'lógica', 'mente', 'ideia', 'futuro', 'agora', 'memória', 'espaço'
    ];

    // --- Estado do Jogo ---
    let wordsOnScreen = [];
    let lives = settings.initialLives;
    let score = 0;
    let frameCount = 0;

    // --- HTML da UI ---
    ui.phaseDisplay.innerHTML = `
        <div id="wr-container" class="flex flex-col items-center gap-3 w-full max-w-xl mx-auto">
            <h2 class="phase-title text-2xl font-bold">Chuva de Palavras</h2>
            <div id="wr-stats" class="w-full flex justify-between items-center text-lg font-semibold px-4">
                <div>Vidas: <span id="wr-lives" class="text-red-500"></span></div>
                <div>Pontos: <span id="wr-score" class="text-green-400">0 / ${settings.wordsToClear}</span></div>
            </div>
            <div class="relative w-full">
                <canvas id="wr-canvas" class="bg-gray-900 rounded-lg border-2 border-gray-700 w-full"></canvas>
            </div>
            <input type="text" id="wr-input" class="input-field w-full md:w-2/3 text-center text-xl p-2" placeholder="Digite a palavra aqui..." autocomplete="off" autofocus />
        </div>
    `;

    const canvas = document.getElementById('wr-canvas');
    const ctx = canvas.getContext('2d');
    const inputEl = document.getElementById('wr-input');
    const livesEl = document.getElementById('wr-lives');
    const scoreEl = document.getElementById('wr-score');
    
    // Ajusta o tamanho do canvas
    const containerWidth = canvas.parentElement.clientWidth;
    canvas.width = containerWidth;
    canvas.height = 400;


    // --- Lógica do Jogo ---
    function spawnWord() {
        const filteredWords = WORD_BANK.filter(w => w.length >= settings.wordLengthMin && w.length <= settings.wordLengthMax);
        const text = filteredWords[Math.floor(Math.random() * filteredWords.length)];
        
        ctx.font = 'bold 18px monospace';
        const wordWidth = ctx.measureText(text).width;

        wordsOnScreen.push({
            text: text,
            x: Math.random() * (canvas.width - wordWidth - 20) + 10,
            y: 0,
            speed: settings.baseSpeed + Math.random() * 0.5,
            color: `hsl(${Math.random() * 360}, 90%, 75%)`
        });
    }
    
    function updateLives() {
        livesEl.textContent = '♥'.repeat(lives);
    }

    // --- Loop Principal do Jogo ---
    function gameLoop() {
        if (!gameActive) {
            cleanupWordRain();
            return;
        }

        frameCount++;
        if (frameCount % settings.spawnRate === 0) {
            spawnWord();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = wordsOnScreen.length - 1; i >= 0; i--) {
            const word = wordsOnScreen[i];
            word.y += word.speed;

            // Desenha a palavra
            ctx.fillStyle = word.color;
            ctx.font = 'bold 18px monospace';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText(word.text, word.x, word.y);
            ctx.shadowBlur = 0;


            // Verifica se a palavra chegou ao fundo
            if (word.y > canvas.height) {
                wordsOnScreen.splice(i, 1);
                lives--;
                updateLives();
                if (lives <= 0) {
                    phaseCompleted(false, { reason: 'Vidas esgotadas!' });
                    return;
                }
            }
        }
        wr_animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // --- Listener de Input ---
    wr_inputListener = () => {
        const typedText = inputEl.value.trim().toLowerCase();
        if (typedText === '') return;

        let foundIndex = -1;
        // Encontra a palavra correspondente (dá prioridade à que está mais abaixo)
        wordsOnScreen.sort((a, b) => b.y - a.y);
        foundIndex = wordsOnScreen.findIndex(word => word.text === typedText);
        
        if (foundIndex !== -1) {
            wordsOnScreen.splice(foundIndex, 1);
            score++;
            scoreEl.textContent = `${score} / ${settings.wordsToClear}`;
            inputEl.value = ''; // Limpa o input
            
            if (score >= settings.wordsToClear) {
                phaseCompleted(true, { text: `Excelente agilidade! Você digitou ${score} palavras.` });
            }
        }
    };

    // --- Inicialização ---
    updateLives();
    inputEl.addEventListener('input', wr_inputListener);
    inputEl.focus();
    gameActive = true;
    gameLoop();
}
