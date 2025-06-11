// Versão aprimorada: ícones mais claros, mapa de SVG organizado e feedback visual nas respostas

let ms_answerClickListener = null;

function cleanupMemoryShelf() {
  const answerContainer = document.getElementById('ms-answer-buttons');
  if (answerContainer && ms_answerClickListener) {
    answerContainer.removeEventListener('click', ms_answerClickListener);
    ms_answerClickListener = null;
  }
}

function initMemoryShelfPhase(config) {
  cleanupMemoryShelf();

  // --- Configuração da Fase ---
  const level = config.level;
  const settings = {
    numObjects: Math.min(8, 3 + Math.floor(level / 2)),
    numQuestions: Math.min(6, 2 + Math.floor(level / 2)),
    viewingTime: Math.max(2, 5 - Math.floor(level / 4)), // segundos
  };

  // --- Pools de Dados para Geração ---
  const OBJECT_POOL = [
    { name: 'Carro', type: 'car' },
    { name: 'Casa', type: 'house' },
    { name: 'Árvore', type: 'tree' },
    { name: 'Estrela', type: 'star' },
    { name: 'Coração', type: 'heart' },
    { name: 'Chave', type: 'key' },
    { name: 'Lâmpada', type: 'lightbulb' },
    { name: 'Maçã', type: 'apple' },
  ];
  const COLOR_POOL = [
    { name: 'Vermelho', hex: '#EF4444' },
    { name: 'Azul', hex: '#3B82F6' },
    { name: 'Verde', hex: '#22C55E' },
    { name: 'Amarelo', hex: '#F59E0B' },
    { name: 'Roxo', hex: '#8B5CF6' },
    { name: 'Laranja', hex: '#F97316' }
  ];

  // --- Mapa de SVGs claros e consistentes ---
  const ICON_SVGS = {
    car: `<svg viewBox="0 0 24 24" aria-label="Carro"><path d="M3 13h18v6H3v-6zm2-5l4-4h4l4 4h2v2H5V8z" fill="currentColor"/></svg>`,
    house: `<svg viewBox="0 0 24 24" aria-label="Casa"><path d="M3 12l9-9 9 9v9H3v-9z" fill="currentColor"/></svg>`,
    tree: `<svg viewBox="0 0 24 24" aria-label="Árvore"><path d="M12 2l4 6H8l4-6zm-4 8h8v8H8v-8z" fill="currentColor"/></svg>`,
    star: `<svg viewBox="0 0 24 24" aria-label="Estrela"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="currentColor"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" aria-label="Coração"><path d="M12 21s-6-4.35-10-8.36C-1.18 7.55 3.27 2 8.5 2 11.24 2 12 4 12 4s.76-2 3.5-2C20.73 2 25.18 7.55 22 12.64 18 16.65 12 21 12 21z" fill="currentColor"/></svg>`,
    key: `<svg viewBox="0 0 24 24" aria-label="Chave"><path d="M2 12a5 5 0 0110 0 5 5 0 11-10 0zm10 0h10v2H12v-2z" fill="currentColor"/></svg>`,
    lightbulb: `<svg viewBox="0 0 24 24" aria-label="Lâmpada"><path d="M9 2a7 7 0 00-3 13.92V19a1 1 0 001 1h6a1 1 0 001-1v-3.08A7 7 0 009 2z" fill="currentColor"/></svg>`,
    apple: `<svg viewBox="0 0 24 24" aria-label="Maçã"><path d="M16 6a4 4 0 010 8 4 4 0 01-4-4 4 4 0 014-4zm-6 8C4 14 2 10 2 7s2-5 6-5 6 2 6 5-2 7-6 7z" fill="currentColor"/></svg>`
  };

  // --- Estado do Jogo ---
  let sceneObjects = [];
  let questions = [];
  let currentQuestionIndex = 0;
  let correctAnswers = 0;

  // --- Geração da Cena e Perguntas ---
  function generatePuzzle() {
    // Seleciona objetos únicos
    const shuffled = OBJECT_POOL.sort(() => 0.5 - Math.random());
    sceneObjects = shuffled.slice(0, settings.numObjects).map(obj => ({
      ...obj,
      color: COLOR_POOL[Math.floor(Math.random() * COLOR_POOL.length)]
    }));

    // Gera perguntas garantindo variedade
    questions = [];
    const usedForAttribute = new Set();

    while (questions.length < settings.numQuestions) {
      const isAttribute = Math.random() > 0.5 && usedForAttribute.size < sceneObjects.length;
      if (isAttribute) {
        const candidates = sceneObjects.filter((_, i) => !usedForAttribute.has(i));
        const idx = Math.floor(Math.random() * candidates.length);
        const obj = candidates[idx];
        usedForAttribute.add(sceneObjects.indexOf(obj));

        const distractors = COLOR_POOL.filter(c => c.name !== obj.color.name)
                                      .sort(() => 0.5 - Math.random())
                                      .slice(0, 2);
        const options = [obj.color, ...distractors].sort(() => 0.5 - Math.random());

        questions.push({
          text: `Qual era a cor do(a) ${obj.name}?`,
          options,
          correctAnswer: obj.color.name
        });
      } else {
        // Pergunta de presença
        const obj = Math.random() > 0.5 && sceneObjects.length > 0
          ? sceneObjects[Math.floor(Math.random() * sceneObjects.length)]
          : OBJECT_POOL.find(o => !sceneObjects.some(s => s.name === o.name));
        const wasPresent = sceneObjects.some(s => s.name === obj.name);
        questions.push({
          text: `Havia um(a) ${obj.name} na prateleira?`,
          options: ['Sim', 'Não'],
          correctAnswer: wasPresent ? 'Sim' : 'Não'
        });
      }
    }
  }

  // --- Renderização ---
  function showMemorizationScreen() {
    const shelf = document.createElement('div');
    shelf.className = 'ms-shelf flex gap-4';

    sceneObjects.forEach(obj => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ms-object p-2 bg-gray-100 rounded';
      wrapper.innerHTML = `
        <div class="icon text-4xl text-[${obj.color.hex}]">
          ${ICON_SVGS[obj.type]}
        </div>
        <div class="name text-center mt-1">${obj.name}</div>
      `;
      shelf.appendChild(wrapper);
    });

    ui.phaseDisplay.innerHTML = '';
    ui.phaseDisplay.append(
      createTitle(),
      createStatus(`Memorize os objetos em ${settings.viewingTime}s...`),
      shelf
    );

    startTimer(settings.viewingTime, showQuestionScreen);
  }

  function showQuestionScreen() {
    if (currentQuestionIndex >= questions.length) {
      const passed = correctAnswers >= Math.ceil(settings.numQuestions * 0.75);
      return phaseCompleted(passed, {
        text: passed
          ? `Você acertou ${correctAnswers} de ${settings.numQuestions}! 🎉`
          : `Você acertou apenas ${correctAnswers} de ${settings.numQuestions}. Tente novamente.`
      });
    }

    const q = questions[currentQuestionIndex];
    ui.phaseDisplay.innerHTML = '';
    ui.phaseDisplay.append(
      createTitle(),
      createProgress(currentQuestionIndex + 1, settings.numQuestions, correctAnswers),
      createQuestionText(q.text),
      createAnswerButtons(q.options)
    );

    ms_answerClickListener = event => {
      const btn = event.target.closest('button[data-answer]');
      if (!btn) return;
      const ans = btn.dataset.answer;
      if (ans === q.correctAnswer) {
        correctAnswers++;
        btn.classList.add('bg-green-200');
      } else {
        btn.classList.add('bg-red-200');
      }
      // Delay para feedback visual
      setTimeout(() => {
        currentQuestionIndex++;
        showQuestionScreen();
      }, 500);
    };

    document.getElementById('ms-answer-buttons')
      .addEventListener('click', ms_answerClickListener);
  }

  // --- Helpers de UI ---
  function createTitle() {
    const h2 = document.createElement('h2');
    h2.className = 'phase-title text-2xl font-bold';
    h2.textContent = 'Prateleira da Memória';
    return h2;
  }
  function createStatus(text) {
    const p = document.createElement('p');
    p.className = 'text-lg text-gray-500';
    p.textContent = text;
    return p;
  }
  function startTimer(sec, callback) {
    let remaining = sec;
    const status = document.querySelector('#ms-status');
    const interval = setInterval(() => {
      remaining--;
      if (status) status.textContent = `Memorize os objetos em ${remaining}s...`;
      if (remaining <= 0) {
        clearInterval(interval);
        callback();
      }
    }, 1000);
  }
  function createProgress(cur, total, score) {
    const div = document.createElement('div');
    div.className = 'w-full flex justify-between text-lg';
    div.innerHTML = `<span>Pergunta: ${cur}/${total}</span><span>Acertos: ${score}</span>`;
    return div;
  }
  function createQuestionText(text) {
    const p = document.createElement('p');
    p.id = 'ms-question-text';
    p.className = 'text-xl text-center my-8';
    p.textContent = text;
    return p;
  }
  function createAnswerButtons(options) {
    const container = document.createElement('div');
    container.id = 'ms-answer-buttons';
    container.className = 'flex flex-wrap justify-center gap-4';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'button button-choice w-40 py-2 bg-white border rounded';
      btn.dataset.answer = opt;
      btn.textContent = opt;
      container.appendChild(btn);
    });
    return container;
  }

  // --- Início ---
  generatePuzzle();
  showMemorizationScreen();
}