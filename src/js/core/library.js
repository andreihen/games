const GameLibrary = (() => {
    const categories = {
        Lógica: { color: '#ad9aff', label: 'Pense alguns passos à frente', glyph: '◇' },
        Memória: { color: '#ffbb78', label: 'Observe. Guarde. Relembre.', glyph: '▦' },
        Atenção: { color: '#ff8daa', label: 'Encontre o detalhe decisivo', glyph: '◎' },
        Matemática: { color: '#8fd9fc', label: 'Descubra a lógica dos números', glyph: '∑' },
        Conhecimento: { color: '#c7ef78', label: 'Conecte o que você sabe', glyph: '✦' },
        'Digitação e Palavras': { color: '#77e2bf', label: 'Letras, pistas e ritmo', glyph: '⌨' },
        Simuladores: { color: '#dfb283', label: 'Histórias que saem do roteiro', glyph: '◈' },
        Extras: { color: '#d7c7ab', label: 'Um desafio fora da rotina', glyph: '＋' }
    };
    const fresh = [
        'chess', 'draughts', 'minesweeper', 'ludo',
        'survivalarena',
        'pokemon',
        'element',
        'equation',
        'sumexact',
        'colorrecall',
        'soundrecall',
        'timerecall',
        'shaperecall',
        'patternrepair',
        'temporebuild',
        'colormix',
        'colormemory',
        'timeline',
        'identity',
        'connections'
    ];
    const normalize = (text) => GameArt.normalize(text);
    const curated = [
        'termo',
        'simonsays',
        'memory_game',
        'lightsout',
        'flow',
        'mystery_scale',
        'mini_sudoku',
        'nonogram',
        'connections',
        'memorypath',
        'flags',
        'worldmap',
        'subtledifference',
        'tictactoe',
        'colororder',
        'wordrain'
    ];
    const skills = {
        chess: 'Estratégia e antecipação',
        draughts: 'Planejamento de capturas',
        minesweeper: 'Dedução espacial',
        ludo: 'Estratégia e probabilidade',
        survivalarena: 'Simulação narrativa',
        termo: 'Dedução de palavras',
        simonsays: 'Memória de sequência',
        memory_game: 'Memória e associação',
        lightsout: 'Planejamento de movimentos',
        flow: 'Planejamento espacial',
        mystery_scale: 'Dedução por experimentos',
        mini_sudoku: 'Dedução numérica',
        nonogram: 'Dedução visual',
        connections: 'Relações entre palavras',
        memorypath: 'Sequência e orientação',
        flags: 'Reconhecimento visual',
        worldmap: 'Orientação geográfica',
        subtledifference: 'Comparação visual',
        tictactoe: 'Estratégia em turnos',
        colororder: 'Discriminação de cores',
        wordrain: 'Coordenação e digitação',
        pokemon: 'Dedução de atributos',
        element: 'Dedução de atributos',
        equation: 'Dedução simbólica',
        sumexact: 'Planejamento de somas',
        colormix: 'Experimentação de cores',
        colormemory: 'Memória de cores',
        colorrecall: 'Memória de cores',
        soundrecall: 'Memória auditiva',
        timerecall: 'Percepção de tempo',
        shaperecall: 'Memória de formas',
        patternrepair: 'Memória e manipulação',
        temporebuild: 'Ritmo e coordenação',
        timeline: 'Ordenação histórica',
        identity: 'Inferência por pistas',
        decode_colors: 'Dedução de códigos',
        blockfit: 'Encaixe e rotação',
        hanoi_tower: 'Planejamento de movimentos',
        sliding_puzzle: 'Planejamento espacial',
        resta_um: 'Planejamento de saltos',
        capitals: 'Associação geográfica',
        weekday: 'Cálculo de calendário',
        stroop: 'Controle de atenção',
        oddcolor: 'Discriminação de cores',
        matrix: 'Operações matriciais',
        mental_math: 'Cálculo mental',
        mutantoperator: 'Aplicação de regras',
        mutantrule: 'Flexibilidade de atenção',
        nback: 'Atualização de memória',
        workingmemory: 'Manipulação mental',
        checklist: 'Memória de regras',
        temporalorder: 'Memória temporal',
        subitizing: 'Percepção de quantidades',
        compare: 'Comparação quantitativa',
        estimate: 'Estimativa numérica',
        spatialmemory: 'Memória espacial',
        mentalrotation: 'Rotação espacial',
        dynamicnumbers: 'Classificação e atenção',
        rightimpulse: 'Controle de impulsos',
        symbol_inspector: 'Dedução de regras',
        memoryshelf: 'Memória de objetos'
    };
    const skill = (game) => skills[game.id] || game.category;
    function select(
        games,
        { category = 'Todos', query = '', filter = 'all', sort = 'recommended' },
        prefs
    ) {
        let result = games.filter((game) =>
            category === 'Todos' ? game.primary : game.category === category
        );
        const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
        result = result.filter((game) =>
            terms.every((term) =>
                normalize(`${game.name} ${game.category} ${game.description}`).includes(term)
            )
        );
        if (filter === 'favorites')
            result = result.filter((game) => prefs.favorites.includes(game.id));
        if (filter === 'recent') result = result.filter((game) => prefs.recent.includes(game.id));
        if (filter === 'new') result = result.filter((game) => fresh.includes(game.id));
        if (filter === 'perception')
            result = result.filter((game) =>
                [
                    'colorrecall',
                    'colormemory',
                    'soundrecall',
                    'timerecall',
                    'shaperecall',
                    'patternrepair',
                    'temporebuild'
                ].includes(game.id)
            );
        return result.sort((a, b) =>
            sort === 'az'
                ? a.name.localeCompare(b.name, 'pt-BR')
                : sort === 'recent'
                  ? (prefs.recent.indexOf(a.id) < 0 ? 999 : prefs.recent.indexOf(a.id)) -
                    (prefs.recent.indexOf(b.id) < 0 ? 999 : prefs.recent.indexOf(b.id))
                  : (curated.includes(a.id) ? curated.indexOf(a.id) : 100) -
                    (curated.includes(b.id) ? curated.indexOf(b.id) : 100)
        );
    }
    function art(game, hero = false) {
        const c = categories[game.category]?.color || '#c7ef78';
        const name = game.id;
        let shapes = '';
        if (name === 'chess' || name === 'draughts') {
            shapes = Array.from({ length: 16 }, (_, i) => `<rect x="${88 + (i % 4) * 36}" y="${32 + Math.floor(i / 4) * 36}" width="36" height="36" fill="${(Math.floor(i / 4) + i % 4) % 2 ? '#587d73' : '#d9ddcf'}"/>`).join('');
            shapes += name === 'chess' ? '<text x="160" y="140" text-anchor="middle" font-size="100" fill="#172631">♞</text>' : '<circle cx="142" cy="86" r="15" fill="#172631"/><circle cx="214" cy="86" r="15" fill="#172631"/><circle cx="106" cy="158" r="15" fill="#fff8e0"/><circle cx="178" cy="158" r="15" fill="#fff8e0"/>';
        } else if (name === 'minesweeper') {
            shapes = Array.from({ length: 16 }, (_, i) => `<rect x="${88 + (i % 4) * 36}" y="${32 + Math.floor(i / 4) * 36}" width="33" height="33" rx="3" fill="${i < 6 ? '#dbe1de' : '#536b7a'}"/>${i < 6 && i % 3 ? `<text x="${104 + (i % 4) * 36}" y="${56 + Math.floor(i / 4) * 36}" text-anchor="middle" font-size="23" fill="#185a9a">${i % 3}</text>` : ''}`).join('');
            shapes += '<text x="176" y="133" text-anchor="middle" font-size="31" fill="#ffdd80">⚑</text>';
        } else if (name === 'ludo') {
            shapes = '<rect x="88" y="32" width="144" height="144" rx="7" fill="#dce0d4"/>' + ['#ec8d86', '#88bdf1', '#8ace9b', '#f1d173'].map((color, i) => `<rect x="${94 + i % 2 * 84}" y="${38 + Math.floor(i / 2) * 84}" width="48" height="48" rx="6" fill="${color}"/><circle cx="${118 + i % 2 * 84}" cy="${62 + Math.floor(i / 2) * 84}" r="9" fill="#293b42"/>`).join('') + '<rect x="140" y="85" width="40" height="40" rx="7" fill="#293b42"/><circle cx="150" cy="95" r="3" fill="#fff1c5"/><circle cx="160" cy="105" r="3" fill="#fff1c5"/><circle cx="170" cy="115" r="3" fill="#fff1c5"/>';
        } else if (name === 'survivalarena') {
            shapes = `<circle cx="160" cy="104" r="66" fill="#283b34" stroke="${c}" stroke-width="2"/><path d="M110 133l27-56 30 44 28-68 27 80z" fill="#759788"/>${[100, 135, 205, 226].map((x, i) => `<circle cx="${x}" cy="${76 + (i % 2) * 74}" r="10" fill="${c}"/>`).join('')}`;
        } else if (name === 'pokemon') {
            shapes = `<circle cx="160" cy="104" r="60" fill="#d9e1e8" stroke="#29343e" stroke-width="6"/><path d="M100 104a60 60 0 0 1 120 0z" fill="#b85b60"/><path d="M100 104h120" stroke="#29343e" stroke-width="8"/><circle cx="160" cy="104" r="18" fill="#d9e1e8" stroke="#29343e" stroke-width="8"/>`;
        } else if (name === 'element') {
            shapes = `<rect x="108" y="46" width="104" height="116" rx="8" fill="#293a32" stroke="${c}" stroke-width="2"/><text x="121" y="71" fill="${c}" font-size="18">26</text><text x="160" y="125" text-anchor="middle" fill="${c}" font-size="50">Fe</text><text x="160" y="147" text-anchor="middle" fill="${c}" font-size="14">FERRO</text>`;
        } else if (name === 'equation') {
            shapes = ['2', '+', '?', '=', '5']
                .map(
                    (label, i) =>
                        `<rect x="${53 + i * 43}" y="78" width="37" height="52" rx="6" fill="${i === 2 ? '#715919' : '#2c4944'}"/><text x="${71 + i * 43}" y="113" text-anchor="middle" font-size="26" fill="#e3ecf1">${label}</text>`
                )
                .join('');
        } else if (name === 'sumexact') {
            shapes = ['4', '2', '6', '3', '5', '8', '7', '7', '']
                .map(
                    (label, i) =>
                        `<rect x="${96 + (i % 3) * 44}" y="${48 + Math.floor(i / 3) * 44}" width="38" height="38" rx="5" fill="${i === 1 ? '#242b35' : i % 3 === 2 || i > 5 ? '#365248' : '#343c4c'}"/><text x="${115 + (i % 3) * 44}" y="${73 + Math.floor(i / 3) * 44}" text-anchor="middle" font-size="22" fill="${c}">${label}</text>`
                )
                .join('');
        } else if (name === 'soundrecall') {
            shapes = `<path d="M65 105q12-75 24 0t24 0 24 0 24 0 24 0 24 0 24 0 24 0" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
        } else if (name === 'timerecall') {
            shapes = `<circle cx="160" cy="104" r="62" fill="#293949" stroke="${c}" stroke-width="3"/><path d="M160 59v45l32 19" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
        } else if (name === 'shaperecall') {
            shapes = `<rect x="115" y="59" width="90" height="90" rx="4" transform="rotate(24 160 104)" fill="${c}" opacity=".85"/><rect x="115" y="59" width="90" height="90" rx="4" fill="none" stroke="#e8d4ad" stroke-dasharray="5 5" stroke-width="2"/>`;
        } else if (name === 'temporebuild') {
            shapes = [0, 1, 2]
                .map((row) =>
                    [0, 1, 2, 3, 4, 5]
                        .map(
                            (col) =>
                                `<rect x="${66 + col * 33}" y="${58 + row * 33}" width="26" height="26" rx="6" fill="${(row + col) % 3 === 0 ? c : '#344351'}"/>`
                        )
                        .join('')
                )
                .join('');
        } else if (name === 'patternrepair') {
            shapes = [0, 1, 2]
                .map((row) =>
                    [0, 1, 2]
                        .map(
                            (col) =>
                                `<rect x="${96 + col * 44}" y="${44 + row * 44}" width="38" height="38" rx="5" fill="${(row + col) % 2 ? '#91bbd3' : '#d8a385'}"/>`
                        )
                        .join('')
                )
                .join('');
        } else if (name === 'colormix' || name === 'colormemory' || name === 'colorrecall') {
            shapes = `<rect x="76" y="48" width="168" height="116" rx="14" fill="#e7e9ed"/>${['#edce32', '#dc4388', '#2cb3df'].map((color, i) => `<circle cx="${118 + i * 43}" cy="${90 + (i % 2) * 29}" r="27" fill="${color}" opacity=".85"/>`).join('')}`;
        } else if (name === 'timeline') {
            shapes = `<path d="M45 110H275" stroke="${c}" stroke-width="3"/>${[65, 125, 185, 245].map((x, i) => `<circle cx="${x}" cy="110" r="7" fill="${c}"/><rect x="${x - 24}" y="${i % 2 ? 128 : 53}" width="48" height="37" rx="8" fill="#333e35" stroke="${c}" stroke-opacity=".45"/><path d="M${x - 12} ${i % 2 ? 142 : 67}h24m-24 9h16" stroke="${c}" stroke-width="3"/>`).join('')}`;
        } else if (name === 'identity') {
            shapes = `<circle cx="160" cy="97" r="48" fill="#29343a" stroke="${c}" stroke-opacity=".4"/><text x="160" y="120" text-anchor="middle" font-size="72" font-weight="800" fill="${c}">?</text>${[
                [-75, -30],
                [70, 22],
                [-60, 56]
            ]
                .map(
                    ([x, y]) =>
                        `<rect x="${150 + x}" y="${90 + y}" width="45" height="22" rx="5" fill="#39443a"/><path d="M${160 + x} ${101 + y}h25" stroke="${c}" stroke-width="2"/>`
                )
                .join('')}`;
        } else if (['mini_sudoku', 'sliding_puzzle', 'nonogram'].includes(name)) {
            const labels =
                name === 'mini_sudoku'
                    ? ['8', '', '2', '', '4', '', '1', '', '9']
                    : name === 'sliding_puzzle'
                      ? ['1', '2', '3', '4', '5', '6', '7', '', '8']
                      : ['', '', '', '', '', '', '', '', ''];
            shapes = labels
                .map(
                    (label, i) =>
                        `<rect x="${95 + (i % 3) * 44}" y="${42 + Math.floor(i / 3) * 44}" width="39" height="39" rx="${name === 'mini_sudoku' ? 2 : 6}" fill="${name === 'nonogram' && [0, 2, 3, 4, 5, 7].includes(i) ? c : '#2c303f'}" stroke="${c}" stroke-opacity=".4"/><text x="${115 + (i % 3) * 44}" y="${68 + Math.floor(i / 3) * 44}" text-anchor="middle" fill="${c}" font-size="20" font-weight="700">${label}</text>`
                )
                .join('');
        } else if (name === 'hanoi_tower') {
            shapes = `<path d="M52 160h216M87 160V63m73 97V63m73 97V63" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".5"/>${[
                [87, 142, 58],
                [87, 121, 43],
                [160, 142, 35],
                [233, 142, 20]
            ]
                .map(
                    ([x, y, w]) =>
                        `<rect x="${x - w / 2}" y="${y}" width="${w}" height="16" rx="7" fill="${c}"/>`
                )
                .join('')}`;
        } else if (name === 'simonsays') {
            shapes = `<circle cx="160" cy="104" r="66" fill="#1c232b"/>${['#b3e774', '#93c9ff', '#ffae81', '#c5a6ff'].map((color, i) => `<path d="M160 104V46A58 58 0 0 1 218 104Z" fill="${color}" stroke="#1c232b" stroke-width="5" opacity="${i === 0 ? 1 : 0.4}" transform="rotate(${i * 90} 160 104)"/>`).join('')}<circle cx="160" cy="104" r="20" fill="#1c232b" stroke="${c}" stroke-opacity=".4"/>`;
        } else if (name === 'flags') {
            shapes = `<path d="M88 165V44" stroke="#b6c3ce" stroke-width="5"/><path d="M91 49q45-20 100 0t50 0v74q-20 16-50 0t-100 0z" fill="#a86166"/><path d="M91 77q45-20 100 0t50 0v21q-20 16-50 0t-100 0z" fill="#e4dfce"/>`;
        } else if (name === 'capitals') {
            shapes = `<path d="M70 160h180" stroke="${c}" stroke-width="3"/><rect x="89" y="100" width="39" height="60" fill="#566959"/><rect x="137" y="72" width="42" height="88" fill="#809780"/><rect x="189" y="90" width="42" height="70" fill="#566959"/><path d="M148 72V53h21v19M101 115h14m34-27h18m-18 19h18m35 0h14m-14 20h14" stroke="${c}" stroke-width="4"/>`;
        } else if (name === 'worldmap') {
            shapes = `<circle cx="160" cy="104" r="68" fill="#273c3b" stroke="${c}" stroke-opacity=".3"/><ellipse cx="160" cy="104" rx="32" ry="68" fill="none" stroke="${c}" stroke-opacity=".5"/><path d="M92 104h136M105 70h110M105 139h110" stroke="${c}" stroke-opacity=".5"/><path d="M113 81l19-13 22 4-5 17 14 11-10 20-18-6-4-17-13-1zm70 33 17-5 13 19-18 16-15-14z" fill="${c}" opacity=".8"/>`;
        } else if (game.category === 'Digitação e Palavras') {
            shapes =
                [0, 1, 2, 3, 4]
                    .map(
                        (i) =>
                            `<rect x="${45 + i * 47}" y="68" width="40" height="49" rx="7" fill="${i === 1 ? c : '#2c393e'}" stroke="${c}" stroke-opacity=".4"/><text x="${65 + i * 47}" y="100" text-anchor="middle" font-size="23" font-weight="700" fill="${i === 1 ? '#152124' : c}">${'JOGAR'[i]}</text>`
                    )
                    .join('') +
                `<path d="M68 143h184M95 157h130" stroke="${c}" stroke-width="8" stroke-linecap="round" opacity=".2"/>`;
        } else if (game.category === 'Matemática') {
            const labels = {
                mental_math: ['8', '×', '3'],
                matrix: ['a', 'b', 'c'],
                mutantoperator: ['◆', '=', '?'],
                compare: ['12', '>', '9'],
                estimate: ['≈', '50', '?'],
                subitizing: ['●', '●', '●']
            }[name] || ['7', '+', '3'];
            shapes =
                labels
                    .map(
                        (label, i) =>
                            `<text x="${85 + i * 65}" y="117" text-anchor="middle" font-size="${label.length > 1 ? 34 : 45}" fill="${c}" opacity="${i === 1 ? 0.65 : 1}">${label}</text>`
                    )
                    .join('') +
                `<path d="M65 143h190" stroke="${c}" stroke-opacity=".3" stroke-width="3"/>`;
        } else {
            const symbols =
                game.category === 'Memória'
                    ? ['◆', '●', '◆', '▲', '■', '●']
                    : game.category === 'Atenção'
                      ? ['●', '●', '●', '●', '◆', '●']
                      : ['', '●', '', '◆', '', '▲'];
            shapes = symbols
                .map(
                    (s, i) =>
                        `<rect x="${89 + (i % 3) * 49}" y="${56 + Math.floor(i / 3) * 50}" width="42" height="42" rx="8" fill="${name === 'connections' && i < 3 ? c : '#2c303f'}" stroke="${c}" stroke-opacity=".4"/><text x="${110 + (i % 3) * 49}" y="${84 + Math.floor(i / 3) * 50}" text-anchor="middle" font-size="23" fill="${name === 'connections' && i < 3 ? '#172129' : c}">${s}</text>`
                )
                .join('');
        }
        return `<svg class="game-cover-svg${hero ? ' hero-cover-svg' : ''}" viewBox="0 0 320 208" aria-hidden="true"><circle cx="160" cy="104" r="98" fill="none" stroke="${c}" stroke-opacity=".06"/><circle cx="160" cy="104" r="82" fill="none" stroke="${c}" stroke-opacity=".08"/>${shapes}<circle cx="53" cy="43" r="3" fill="${c}" opacity=".6"/><path d="M269 154v12m-6-6h12" stroke="${c}" opacity=".5"/></svg>`;
    }
    function difficulty(game, difficulty, options = {}) {
        const t = DifficultyEngine.index(difficulty),
            p = DifficultyEngine.resolve(game.id, difficulty, options);
        const details = {
            survivalarena:
                'Sem níveis de dificuldade: monte o elenco e configure o ritmo da competição dentro do simulador.',
            pokemon: `${[10, 9, 8, 7][t]} tentativas; ${options.generation && options.generation !== 'all' ? 'geração ' + options.generation : 'gerações 1 a ' + [1, 3, 6, 9][t]}. Consulta de candidatos disponível.`,
            element: `${[20, 36, 86, 118][t]} elementos; ${[9, 8, 7, 6][t]} tentativas.`,
            equation: `${[5, 6, 7, 8][t]} caracteres; ${[8, 7, 6, 6][t]} tentativas.`,
            sumexact: `Grade ${[3, 4, 5, 6][t]} × ${[3, 4, 5, 6][t]}; somas de linhas e colunas.`,
            colorrecall: `Cinco cores novas; referência visível por ${[3.5, 2.8, 2, 1.3][t]} segundos; objetivo de ${[70, 78, 85, 92][t]}% de proximidade.`,
            soundrecall: `Cinco notas em ${[1, 1.5, 2, 3][t]} oitavas; objetivo de ${Perception.precision(t)}% de precisão.`,
            timerecall: `Cinco intervalos de ${[0.8, 1.2, 1.5, 2][t]} a ${[2.5, 4, 5.5, 7.5][t]} segundos; objetivo de ${Perception.precision(t)}%.`,
            shaperecall: `Cinco formas; exposição de ${Perception.exposure(t) / 1000} segundos; objetivo de ${Perception.precision(t)}%.`,
            patternrepair: `Cinco grades de ${[3, 4, 5, 6][t]} × ${[3, 4, 5, 6][t]}; ${[1, 2, 3, 4][t]} pares trocados e três verificações por grade.`,
            temporebuild: `${[2, 3, 3, 4][t]} faixas de ${[8, 12, 16, 16][t]} tempos; tolerância de ${[180, 140, 110, 80][t]} ms; objetivo de ${Perception.precision(t)}%.`,
            colormix: `${[3, 4, 5, 5][t]} pigmentos disponíveis; receita de ${[10, 14, 18, 20][t]} gotas; objetivo de ${[80, 85, 90, 94][t]}% de proximidade. Cinco cores por partida.`,
            colormemory: `Cinco ilustrações diferentes; objetivo de ${[70, 78, 85, 92][t]}% de proximidade.${options.mode === 'study' ? ` Referência visível por ${[3.5, 2.8, 2, 1.3][t]} segundos.` : ' Reproduza sem ver a cor de referência.'}`,
            timeline: `${[4, 5, 6, 7][t]} eventos por rodada; ${t > 1 ? 'datas mais próximas' : 'eventos de um período mais amplo'}.`,
            identity: `${[3, 2, 1, 1][t]} pistas iniciais; pontue mais revelando menos pistas.${t === 3 ? ' Dois erros distintos revelam a resposta.' : ''}`,
            connections: `${[4, 4, 3, 2][t]} erros disponíveis; ${t === 0 ? 'um tema é revelado como pista' : 'descubra também os temas dos grupos'}.`,
            termo: `${[8, 7, 6, 5][t]} tentativas na palavra solo; dueto e quarteto acrescentam tentativas. O vocabulário depende do banco escolhido.`,
            capitals: `${[10, 12, 14, 16][t]} rodadas; até ${t >= 2 ? 6 : 4} alternativas da mesma região. Todos os países elegíveis podem aparecer.`,
            flags: `${[10, 12, 14, 16][t]} rodadas; até ${t >= 2 ? 6 : 4} alternativas plausíveis. Todos os países da categoria podem aparecer.`,
            worldmap: `${[8, 10, 12, 14][t]} explorações; até ${t >= 2 ? 6 : 4} alternativas. O modo digitado exige lembrar o nome.`,
            wordrain:
                options.mode === 'text'
                    ? `Texto com ${[2, 3, 4, 5][t]} parágrafos; sem limite de tempo. Português e inglês aceitam acentos opcionais; código exige caixa exata.`
                    : `Palavras de até ${options.language === 'code' ? [4, 8, 16, 28][t] : p.maxLength} caracteres; ritmo inicial de ${p.baseWpm} WPM, com adaptação ao seu histórico.`,
            nonogram: `Grade ${p.size} × ${p.size} com solução única.${t === 0 ? ' Resolúvel por cruzamento das pistas, sem adivinhação.' : ''}`,
            sliding_puzzle: `Tabuleiro ${p.size} × ${p.size}, embaralhado por movimentos válidos.`,
            mini_sudoku:
                'A dificuldade depende das técnicas necessárias para resolver, com uma única solução.',
            simonsays: 'A sequência cresce a cada acerto. O desafio não tem níveis fixos.',
            hanoi_tower: `${p.disks} discos em uma configuração válida e variada.`,
            mystery_scale: `${p.count} objetos e ${p.weighings} pesagens; ${p.knownHeavy ? 'o diferente é mais pesado' : 'ele pode ser mais pesado ou mais leve'}.`,
            blockfit: `Tabuleiro ${p.rows} × ${p.cols}, ${p.blocked} obstáculos${p.flip ? ', com espelhamento' : ''}.`,
            lightsout: `Grade ${p.size} × ${p.size}; a regra de vizinhança depende do modo.`,
            flow: `Grade ${p.size} × ${p.size} com ${p.pairs} pares para conectar.`,
            decode_colors: `${p.slots} posições, ${p.colors} cores, ${p.attempts} tentativas; ${p.repeats ? 'cores podem se repetir' : 'sem cores repetidas'}.`,
            memory_game:
                options.mode === 'sequence'
                    ? `${DifficultyEngine.resolve('memorypath', difficulty).length} posições que acendem uma por vez. Repita a sequência.`
                    : `${p.pairs} pares; cartas incorretas ficam abertas por ${(800 + p.delay) / 1000}s. As associações dependem do modo escolhido.`,
            memorypath: `${p.length} passos numa grade ${p.size} × ${p.size}.`,
            memoryshelf: `${p.objects} objetos e ${p.changes} alterações no modo de mudanças.`,
            rightimpulse: `${p.symbols} estímulos; ${p.responseMs / 1000}s para cada resposta.`,
            mental_math: `${p.steps} etapa${p.steps === 1 ? '' : 's'} por expressão e ${p.target} respostas no modo de precisão.`,
            resta_um: `Até ${p.depth} saltos na construção reversa do tabuleiro; ${p.timeLimit}s de limite.`,
            subtledifference: `${p.changes} diferenças${p.subtle ? ', com alterações mais sutis' : ''}.`,
            symbol_inspector: `${p.days} dias, ${p.rules} regras e ${p.cases} documentos por dia.`,
            tictactoe: `Busca de até ${p.depth} jogadas; ${Math.round(p.random * 100)}% de escolhas aleatórias pelo adversário.`,
            chess: options.mode === 'friend' ? '2 pessoas no mesmo aparelho. O nível só se aplica ao bot.' : `Bot ${p.difficultyName}: ${p.depth ? `busca progressiva de até ${p.depth} jogadas, limitada a ${p.nodes} posições` : 'escolhas aleatórias entre lances legais'}. O nível especialista é o mais forte deste jogo, sem classificação Elo.`,
            draughts: options.mode === 'friend' ? '2 pessoas no mesmo aparelho. O nível só se aplica ao bot.' : `Bot ${p.difficultyName}: ${p.depth ? `antecipa até ${p.depth} turnos, com orçamento de ${p.nodes} posições` : 'escolhe aleatoriamente entre os movimentos permitidos'}.`,
            minesweeper: `${p.rows} × ${p.cols} casas e ${p.mines} minas. Primeiro clique e casas vizinhas seguros. Sem limite de tempo.`,
            ludo: `As pessoas ocupam as primeiras cores; vagas restantes recebem bots. Se escolher mais pessoas que vagas, todos jogam localmente. ${['Bot escolhe peões aleatoriamente.', 'Bot prioriza chegadas, capturas e saída da base.', 'Bot também procura casas seguras e evita ameaças.', 'Bot pondera ameaças, desenvolvimento e reta final.'][t]} O dado usa as mesmas chances em todos os níveis.`,
            weekday: `${[10, 12, 14, 16][t]} datas no intervalo de anos escolhido. A dificuldade aumenta a duração da partida.`,
            matrix: `${[10, 12, 14, 16][t]} problemas; valores de ${t ? -6 : 0} a ${[6, 9, 12, 15][t]}. Determinantes usam ${t >= 2 ? '3 × 3' : '2 × 2'}; outros modos mantêm 2 × 2.`,
            mutantoperator: `O significado dos operadores muda a cada ${[4, 3, 2, 1][t]} rodada${t === 3 ? '' : 's'}; ${t >= 2 ? 'expressões com duas operações' : 'uma operação por expressão'}.`,
            subitizing: `De 1 a ${[4, 6, 9, 12][t]} pontos; apresentação de ${[1000, 700, 450, 300][t]} ms antes de ocultar.`,
            compare: `${[10, 12, 14, 16][t]} comparações; expressões mais complexas conforme o nível e relações equilibradas em ordem aleatória.`,
            estimate: `Produtos com fatores de ${[12, 25, 80, 150][t]}–${[39, 99, 299, 999][t]} e 11–${[19, 49, 99, 299][t]}; uma única alternativa mais próxima.`,
            mentalrotation: `Figuras com até ${[5, 6, 8, 10][t]} células; ${[10, 12, 14, 16][t]} rodadas distinguindo rotação de espelhamento.`,
            spatialmemory: `${[3, 4, 6, 8][t]} alvos numa grade ${[4, 5, 6, 6][t]} × ${[4, 5, 6, 6][t]}; apresentação mais curta nos níveis altos.`,
            temporalorder: `Seis rodadas: de ${p.events} a ${p.events + 2} eventos; começa com ${p.exposure} ms por evento e acelera a cada rodada. Pausa de ${p.retention} ms antes de responder.`,
            nback: `${options.n && options.n !== 'auto' ? options.n : [1, 2, 3, 3][t]}-back; 24 comparações. No modo manual, ${[5, 4, 3, 2.2][t]}s para responder; ritmo automático separado.`,
            workingmemory: `${[3, 4, 6, 8][t]} números; ${[4, 4, 3.5, 3][t]}s para memorizar. A transformação depende do modo.`,
            stroop: `${[10, 12, 14, 16][t]} rodadas; ${t ? `a regra alterna a cada ${[100, 4, 3, 2][t]} rodadas` : 'responda sempre pela cor da tinta'}.`,
            dynamicnumbers: `${[18, 24, 30, 36][t]} números até ${[40, 80, 130, 200][t]}; ${[5, 4, 3, 2.2][t]}s por resposta e três regras ao longo da partida.`,
            mutantrule: `Três blocos de ${[12, 14, 16, 18][t]} casos; ${[4.3, 3.8, 3.4, 2.9][t]}s por caso. Acompanhe as alterações do manual.`,
            checklist: `${[2, 3, 4, 4][t]} etapas, ${[2, 3, 4, 5][t]} suprimentos exigidos e ${[4, 6, 6, 8][t]} equipes por etapa. As exigências mudam entre etapas.`,
            colororder: `Seis rampas com ${[5, 6, 7, 8][t]} cores. A ordem depende de luminosidade, saturação ou matiz.`,
            oddcolor: `Quinze grades ${[3, 4, 5, 6][t]} × ${[3, 4, 5, 6][t]}; contraste inicial de ${[15, 12, 9, 7][t]} pontos de luminosidade, reduzido com a sequência de acertos.`
        };
        return (
            details[game.id] ||
            `O nível altera a complexidade dos estímulos e das regras. Leia o objetivo e as instruções na partida.`
        );
    }
    return Object.freeze({ categories, fresh, select, art, difficulty, skill });
})();
