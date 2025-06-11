// symbol_inspector.js (v4.0 - Revisão de Interface e Lógica)

// Scope variables for listeners and phase state
let SI_listeners = {};
let SI_isPhaseActive = false;
let SI_timeoutId = null;
let SI_synth = null;
let SI_currentRules = [];
let SI_levelChanges = {};

function cleanupSymbolInspectorListeners() {
    for (const key in SI_listeners) {
        const { element, event, handler } = SI_listeners[key];
        if (element) element.removeEventListener(event, handler);
    }
    SI_listeners = {};
    if (SI_timeoutId) clearTimeout(SI_timeoutId);
    SI_isPhaseActive = false;
    SI_synth = null;
    SI_currentRules = [];
    SI_levelChanges = {};
}

/**
 * Initializes the Symbol Inspector phase.
 * @param {object} config - Difficulty configuration, including `config.level`.
 */
function initSymbolInspectorPhase(config) {
    cleanupSymbolInspectorListeners();
    SI_isPhaseActive = true;
    if (typeof Tone !== 'undefined') {
        SI_synth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.2 } }).toDestination();
    }

    // --- Game State ---
    let lives = 3;
    let score = 0;
    const documentsToWin = 10 + Math.floor(config.level);

    // --- EXPANDED ASSET POOLS ---
    const assets = {
        shapes: {'CÍRCULO': '●', 'QUADRADO': '■', 'TRIÂNGULO': '▲', 'LOSANGO': '◆', 'ESTRELA': '★', 'HEXÁGONO': '⬢', 'CRUZ': '✚', 'PENTÁGONO': '⬟'},
        colors: {'AZUL': '#3B82F6', 'VERMELHO': '#EF4444', 'VERDE': '#22C55E', 'AMARELO': '#F59E0B', 'ROXO': '#8B5CF6', 'CIANO': '#14B8A6', 'MAGENTA': '#DB2777', 'LIMA': '#84CC16', 'LARANJA': '#F97316', 'PRETO': '#111827'},
        textures: {'LISTRADO': 'repeating-linear-gradient(45deg,rgba(0,0,0,0.2) 0,rgba(0,0,0,0.2) 4px,transparent 4px,transparent 8px)', 'PONTILHADO': 'radial-gradient(circle,rgba(0,0,0,0.25) 20%,transparent 20%)', 'XADREZ': 'linear-gradient(45deg,rgba(0,0,0,0.1) 25%,transparent 25%),linear-gradient(-45deg,rgba(0,0,0,0.1) 25%,transparent 25%)', 'ONDULADO': 'repeating-radial-gradient(circle,rgba(0,0,0,0.2),rgba(0,0,0,0.2) 5px,transparent 5px,transparent 10px)', 'DIAMANTE': 'linear-gradient(135deg,rgba(255,255,255,0.15) 25%,transparent 25%),linear-gradient(225deg,rgba(255,255,255,0.15) 25%,transparent 25%),linear-gradient(45deg,rgba(255,255,255,0.15) 25%,transparent 25%),linear-gradient(315deg,rgba(255,255,255,0.15) 25%,transparent 25%)'},
        seals: {'AUTORIDADE': '🛡️', 'OFICIAL': '⚖️', 'CONFIDENCIAL': '🔒', 'CORPORATIVO': '🏢', 'ESPECIAL': '⚜️'},
        origins: ['SETOR ALFA', 'DISTRITO GAMA', 'ZONA KILO', 'REGIÃO ÔMEGA', 'ÁREA DELTA', 'NÚCLEO CENTRAL'],
        statuses: ['VÁLIDO', 'EXPIRADO', 'PENDENTE', 'REVOGADO', 'EM ANÁLISE'],
        borders: {'SÓLIDA': '4px solid #111827', 'TRACEJADA': '4px dashed #111827', 'DUPLA': '6px double #111827', 'PONTILHADA': '4px dotted #111827'}
    };
    const assetKeys = {
        shape:   Object.keys(assets.shapes),
        color:   Object.keys(assets.colors),
        texture: Object.keys(assets.textures),
        seal:    Object.keys(assets.seals),
        origin:  assets.origins.slice(),
        status:  assets.statuses.slice(),
        border:  Object.keys(assets.borders)
    };
    // --- SMART & DYNAMIC MASTER RULEBOOK ---
    const allPossibleRules = [
        { id: 'R01', group: 'shape_primary', minLevel: 0, type: 'require', prop: 'shape', val: 'CÍRCULO', text: 'Forma DEVE ser <strong>CÍRCULO</strong>' },
        { id: 'R02', group: 'color_primary', minLevel: 0, type: 'require', prop: 'color', val: 'AZUL', text: 'Cor DEVE ser <strong>AZUL</strong>' },
        { id: 'R03', group: 'shape_deny', minLevel: 1, type: 'deny', prop: 'shape', val: 'QUADRADO', text: 'Forma <strong>NÃO PODE</strong> ser QUADRADO' },
        { id: 'R04', group: 'color_primary', minLevel: 2, type: 'require_one_of', prop: 'color', val: ['VERMELHO', 'VERDE'], text: 'Cor deve ser <strong>VERMELHO</strong> OU <strong>VERDE</strong>', replaces: 'R02' },
        { id: 'R05', group: 'shape_color_cond', minLevel: 3, type: 'conditional', cond: { p: 'shape', v: 'TRIÂNGULO' }, cons: { p: 'color', v: 'AMARELO' }, text: '<strong>SE</strong> forma for TRIÂNGULO, a cor <strong>DEVE</strong> ser AMARELO' },
        { id: 'R06', group: 'texture_primary', minLevel: 4, type: 'require', prop: 'texture', val: 'LISTRADO', text: 'DEVE ter textura <strong>LISTRADO</strong>' },
        { id: 'R07', group: 'shape_texture_excl', minLevel: 5, type: 'exclusive', cond: { p: 'shape', v: 'LOSANGO' }, cons: { p: 'texture', v: 'PONTILHADO' }, text: '<strong>SE</strong> forma for LOSANGO, <strong>NÃO PODE</strong> ter textura PONTILHADO' },
        { id: 'R08', group: 'origin_primary', minLevel: 6, type: 'require', prop: 'origin', val: 'SETOR ALFA', text: 'Origem DEVE ser <strong>SETOR ALFA</strong>' },
        { id: 'R09', group: 'status_deny', minLevel: 7, type: 'deny', prop: 'status', val: 'EXPIRADO', text: 'Status <strong>NÃO PODE</strong> ser EXPIRADO' },
        { id: 'R10', group: 'seal_primary', minLevel: 8, type: 'require', prop: 'seal', val: 'AUTORIDADE', text: 'DEVE ter o selo de <strong>AUTORIDADE</strong>' },
        { id: 'R11', group: 'origin_seal_cond', minLevel: 9, type: 'conditional', cond: { p: 'origin', v: 'DISTRITO GAMA' }, cons: { p: 'seal', v: 'OFICIAL' }, text: '<strong>SE</strong> origem for DISTRITO GAMA, selo <strong>DEVE</strong> ser OFICIAL' },
        { id: 'R12', group: 'border_primary', minLevel: 10, type: 'require', prop: 'border', val: 'SÓLIDA', text: 'Borda <strong>DEVE</strong> ser SÓLIDA'},
        { id: 'R13', group: 'status_color_excl', minLevel: 12, type: 'exclusive', cond: {p: 'status', v: 'REVOGADO'}, cons: {p: 'color', v: 'VERDE'}, text: 'Status <strong>REVOGADO</strong> não pode ter cor <strong>VERDE</strong>'},
    ];
    
    function generateRulesForLevel(level) {
        let potentialRules = allPossibleRules.filter(rule => level >= rule.minLevel);
        let finalRules = [];
        let usedGroups = new Set();

        const replacements = potentialRules.filter(r => r.replaces);
        for (const replacement of replacements) {
            potentialRules = potentialRules.filter(r => r.id !== replacement.replaces);
        }

        potentialRules.sort(() => 0.5 - Math.random());

        const maxRules = 2 + Math.floor(level / 2);

        for (const rule of potentialRules) {
            if (finalRules.length >= maxRules) break;
            if (!usedGroups.has(rule.group)) {
                finalRules.push(rule);
                usedGroups.add(rule.group);
            }
        }
        return finalRules.sort((a,b) => a.minLevel - b.minLevel);
    }

    function getRuleChanges(level) {
        if (level === 0) return { current: generateRulesForLevel(0), added: generateRulesForLevel(0), removed: [], modified: [] };
        const oldRules = generateRulesForLevel(level - 1);
        const newRules = generateRulesForLevel(level);

        const added = newRules.filter(nr => !oldRules.some(or => or.id === nr.id));
        const removed = oldRules.filter(or => !newRules.some(nr => nr.id === or.id || (or.replaces && or.replaces === nr.id) ));
        const modified = newRules.filter(nr => nr.replaces && oldRules.some(or => or.id === nr.replaces));
        
        return { current: newRules, added, removed, modified };
    }

    function isDocumentValid(doc, rules) {
        for (const rule of rules) {
            const docProp = doc[rule.prop];
            switch (rule.type) {
                case 'require': if (docProp !== rule.val) return false; break;
                case 'deny': if (docProp === rule.val) return false; break;
                case 'require_one_of': if (!rule.val.includes(docProp)) return false; break;
                case 'conditional': if (doc[rule.cond.p] === rule.cond.v && doc[rule.cons.p] !== rule.cons.v) return false; break;
                case 'exclusive': if (doc[rule.cond.p] === rule.cond.v && doc[rule.cons.p] === rule.cons.v) return false; break;
            }
        }
        return true;
    }
    
    // ** BUG FIXED ** Robust document generation
    function generateDocument() {
        let doc;
        let isValid;
        let attempts = 0;
        const shouldBeValid = Math.random() > 0.45;

        do {
            doc = {};
            for (const key of Object.keys(assetKeys)) {
                const keys = assetKeys[key];
                doc[key] = keys[Math.floor(Math.random() * keys.length)];
            }
            isValid = isDocumentValid(doc, SI_currentRules);
            attempts++;
        } while (isValid !== shouldBeValid && attempts < 100);

        // If it fails to generate the desired validity, just return what it has.
        doc.isValid = isDocumentValid(doc, SI_currentRules);
        return doc;
    }
    
    function renderGameUI() {
        ui.phaseDisplay.innerHTML = `
            <div id="si-container" class="w-full max-w-6xl mx-auto p-4 font-mono bg-[#374151] rounded-xl border-4 border-[#1f2937]">
                <div id="si-status-bar" class="flex justify-between items-center mb-4 px-2 text-white">
                    <div id="si-lives-display" class="flex gap-2 items-center"></div>
                    <p class="text-base md:text-lg">DOCUMENTOS: <span id="si-score" class="font-bold text-xl md:text-2xl">0/${documentsToWin}</span></p>
                </div>
                <div class="flex flex-col lg:flex-row gap-6 h-[500px]">
                    <!-- Document & Actions -->
                    <div class="lg:w-3/5 flex flex-col justify-between items-center h-full">
                        <div id="si-document-container" class="w-full max-w-md">
                            <div id="si-document-display" class="bg-gray-200 rounded-lg shadow-xl p-6 relative overflow-hidden">
                                <div id="si-seal-display" class="absolute top-4 right-4 text-5xl opacity-80"></div>
                                <div id="si-symbol-display" class="flex items-center justify-center h-48"></div>
                            </div>
                            <div id="si-document-properties" class="bg-gray-700 text-white p-4 mt-1 rounded-b-lg text-sm leading-relaxed"></div>
                        </div>
                        <div id="si-decision-buttons" class="flex gap-4 w-full max-w-md mt-4">
                            <button data-action="reject" class="si-stamp reject"><span class="si-stamp-text">RECUSAR</span></button>
                            <button data-action="approve" class="si-stamp approve"><span class="si-stamp-text">APROVAR</span></button>
                        </div>
                    </div>
                    <!-- Fixed Rulebook -->
                    <div class="lg:w-2/5 flex flex-col bg-[#f3eadd] p-4 rounded-md shadow-lg h-full">
                        <h3 class="text-2xl font-bold text-gray-800 border-b-2 border-gray-400 pb-2 mb-3 font-serif flex-shrink-0">MANUAL DE REGRAS</h3>
                        <div id="si-rule-list-container" class="flex-grow overflow-y-auto pr-2">
                             <ul id="si-rule-list" class="text-gray-700 space-y-3 text-base"></ul>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                #si-rule-list-container::-webkit-scrollbar { width: 8px; }
                #si-rule-list-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
                #si-rule-list-container::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
                #si-rule-list-container::-webkit-scrollbar-thumb:hover { background: #555; }
                .si-stamp { width:100%; height:80px; font-size:clamp(1rem,5vw,1.5rem); font-weight:bold; color:white; border-radius:10px; border:4px solid; transition:all 0.1s ease; }
                .si-stamp.approve { background-color:#16a34a; border-color:#166534; } .si-stamp.reject { background-color:#dc2626; border-color:#991b1b; }
                .si-stamp:active { transform:scale(0.95); }
                #si-symbol { font-size:clamp(6rem, 20vw, 10rem); line-height:1; }
                #si-document-display { transition: box-shadow 0.3s; }
                #si-document-display.correct { box-shadow: 0 0 25px 10px #22C55E; }
                #si-document-display.incorrect { box-shadow: 0 0 25px 10px #EF4444; }
                .rule-item { list-style-type: '⏵'; padding-left: 0.5rem; margin-left: 1rem; margin-bottom: 0.5rem; position: relative; }
                .rule-item.new::before, .rule-item.modified::before, .rule-item.removed::before {
                    content: '●'; font-size: 1.5rem; line-height: 1; position: absolute; left: -1.5rem; top: 0.1rem;
                }
                .rule-item.new::before { color: #22c55e; }
                .rule-item.modified::before { color: #f59e0b; }
                .rule-item.removed::before { color: #ef4444; }
                .life-heart { font-size: 2rem; transition: all 0.3s; }
                .life-heart.lost { color: #4b5569; transform: scale(0.8); }
            </style>
        `;
        attachAllListeners();
    }
    
    function renderLives(count) {
        const livesContainer = document.getElementById('si-lives-display');
        if (!livesContainer) return;
        let html = '';
        for (let i = 0; i < 3; i++) {
            html += `<span class="life-heart ${i < count ? 'text-red-500' : 'lost'}">♥</span>`;
        }
        livesContainer.innerHTML = html;
    }

    function updateRulebookDisplay() {
        const ruleList = document.getElementById('si-rule-list');
        if (!ruleList) return;
        
        const changes = SI_levelChanges;
        ruleList.innerHTML = SI_currentRules.map(rule => {
            let changeClass = '';
            if (changes.added && changes.added.some(r => r.id === rule.id)) changeClass = 'new';
            else if (changes.modified && changes.modified.some(r => r.id === rule.id)) changeClass = 'modified';
            
            return `<li class="rule-item ${changeClass}">${rule.text}</li>`;
        }).join('');

        if (changes.removed && changes.removed.length > 0) {
            ruleList.innerHTML += `<hr class="my-3 border-gray-400"><h4 class="text-red-700 font-bold">Regras Revogadas:</h4>`;
            ruleList.innerHTML += changes.removed.map(rule => `<li class="rule-item removed"><s>${rule.text}</s></li>`).join('');
        }
    }
    
    function renderNextDocument() {
        if (!SI_isPhaseActive || lives <= 0) return;
        const doc = generateDocument();
        const docDisplay = document.getElementById('si-document-display');
        
        docDisplay.style.border = assets.borders[doc.border];

        const symbolEl = document.createElement('div');
        symbolEl.id = 'si-symbol';
        symbolEl.textContent = assets.shapes[doc.shape];
        let style = `color: ${assets.colors[doc.color]};`;
        if (doc.texture) {
            style += `background-image: ${assets.textures[doc.texture]}, linear-gradient(${assets.colors[doc.color]}, ${assets.colors[doc.color]}); -webkit-background-clip: text; background-clip: text; color: transparent;`;
        }
        symbolEl.setAttribute('style', style);
        document.getElementById('si-symbol-display').innerHTML = '';
        document.getElementById('si-symbol-display').appendChild(symbolEl);
        document.getElementById('si-seal-display').textContent = assets.seals[doc.seal];
        document.getElementById('si-document-properties').innerHTML = `
            <strong>ORIGEM:</strong> ${doc.origin}<br>
            <strong>COR:</strong> ${doc.color}<br>
            <strong>TEXTURA:</strong> ${doc.texture}<br>
            <strong>BORDA:</strong> ${doc.border}<br>
            <strong>STATUS:</strong> ${doc.status}`;
        
        docDisplay.dataset.isValid = doc.isValid;
    }

    function attachAllListeners() {
        const decisionHandler = (event) => {
            const button = event.target.closest('button[data-action]');
            if (button && !isChecking) {
                if (SI_synth) SI_synth.triggerAttackRelease("C2", "0.1s");
                handleDecision(button.dataset.action === 'approve');
            }
        };
        const decisionButtons = document.getElementById('si-decision-buttons');
        decisionButtons.addEventListener('click', decisionHandler);
        SI_listeners.decision = { element: decisionButtons, event: 'click', handler: decisionHandler };
    }
    
    let isChecking = false;
    async function handleDecision(approved) {
        if (isChecking) return;
        isChecking = true;

        const display = document.getElementById('si-document-display');
        display.classList.remove('correct', 'incorrect');
        
        const correctDecision = (approved.toString() === display.dataset.isValid);
        
        if (correctDecision) {
            score++;
            if (SI_synth) SI_synth.triggerAttackRelease("G4", "0.2s", Tone.now() + 0.1);
            display.classList.add('correct');
        } else {
            lives--;
            if (SI_synth) SI_synth.triggerAttackRelease("E2", "0.3s", Tone.now() + 0.1);
            display.classList.add('incorrect');
            renderLives(lives);
        }
        
        document.getElementById('si-score').textContent = `${score}/${documentsToWin}`;

        if (lives <= 0) {
            SI_timeoutId = setTimeout(() => phaseCompleted(false, { text: `Fim de turno! Você processou ${score} documentos.` }), 700);
            return;
        }
        if (score >= documentsToWin) {
            SI_timeoutId = setTimeout(() => phaseCompleted(true, { text: 'Excelente trabalho, inspetor! Turno concluído.' }), 700);
            return;
        }

        await new Promise(res => SI_timeoutId = setTimeout(res, 700));
        display.classList.remove('correct', 'incorrect');
        
        await new Promise(res => SI_timeoutId = setTimeout(res, 300));
        renderNextDocument();
        isChecking = false;
    }

    function startGame() {
        renderGameUI();
        SI_levelChanges = getRuleChanges(config.level);
        SI_currentRules = SI_levelChanges.current;
        if (config.level === 0) {
            const shapes = Object.keys(assets.shapes);
            const colors = Object.keys(assets.colors);
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            SI_currentRules = [
                { id: 'R01', type: 'require', prop: 'shape', val: randomShape,
                text: `Forma DEVE ser <strong>${randomShape}</strong>` },
                { id: 'R02', type: 'require', prop: 'color', val: randomColor,
                text: `Cor DEVE ser <strong>${randomColor}</strong>` }
            ];
        }
        renderLives(lives);
        updateRulebookDisplay();
        renderNextDocument();
    }
    startGame();
}
