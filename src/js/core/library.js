const GameLibrary = (() => {
    const categories = {
        Lógica: { color: '#ad9aff', label: 'Pense alguns passos à frente', glyph: '◇' },
        Memória: { color: '#ffbb78', label: 'Observe. Guarde. Relembre.', glyph: '▦' },
        Atenção: { color: '#ff8daa', label: 'Encontre o detalhe decisivo', glyph: '◎' },
        Matemática: { color: '#8fd9fc', label: 'Descubra a lógica dos números', glyph: '∑' },
        Conhecimento: { color: '#c7ef78', label: 'Conecte o que você sabe', glyph: '✦' },
        'Digitação e Palavras': { color: '#77e2bf', label: 'Letras, pistas e ritmo', glyph: '⌨' },
        Extras: { color: '#d7c7ab', label: 'Um desafio fora da rotina', glyph: '＋' }
    };
    const fresh = ['timeline', 'identity', 'connections'];
    const normalize = (text) => GameArt.normalize(text);
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
        return result.sort((a, b) =>
            sort === 'az'
                ? a.name.localeCompare(b.name, 'pt-BR')
                : sort === 'recent'
                  ? (prefs.recent.indexOf(a.id) < 0 ? 999 : prefs.recent.indexOf(a.id)) -
                    (prefs.recent.indexOf(b.id) < 0 ? 999 : prefs.recent.indexOf(b.id))
                  : Number(fresh.includes(b.id)) - Number(fresh.includes(a.id))
        );
    }
    function art(game, hero = false) {
        const c = categories[game.category]?.color || '#c7ef78';
        const name = game.id;
        let shapes = '';
        if (name === 'timeline') {
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
        } else if (name === 'flags' || name === 'capitals' || name === 'worldmap') {
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
            shapes = `<text x="105" y="120" font-size="62" font-weight="700" fill="${c}">7</text><text x="162" y="111" font-size="38" fill="${c}" opacity=".6">×</text><text x="204" y="120" font-size="62" font-weight="700" fill="${c}">3</text><path d="M95 140h140" stroke="${c}" stroke-opacity=".3" stroke-width="3"/>`;
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
            timeline: `${[4, 5, 6, 7][t]} eventos por rodada; ${t > 1 ? 'datas mais próximas' : 'eventos de um período mais amplo'}.`,
            identity: `${[3, 2, 1, 1][t]} pistas iniciais; pontue mais revelando menos pistas.${t === 3 ? ' Dois erros distintos revelam a resposta.' : ''}`,
            connections: `${[4, 4, 3, 2][t]} erros disponíveis; ${t === 0 ? 'um tema é revelado como pista' : 'descubra também os temas dos grupos'}.`,
            termo: `${[8, 7, 6, 5][t]} tentativas na palavra solo; dueto e quarteto acrescentam tentativas. O vocabulário depende do banco escolhido.`,
            capitals: `${[10, 12, 14, 16][t]} rodadas; até ${t >= 2 ? 6 : 4} alternativas da mesma região. Todos os países elegíveis podem aparecer.`,
            flags: `${[10, 12, 14, 16][t]} rodadas; até ${t >= 2 ? 6 : 4} alternativas plausíveis. Todos os países da categoria podem aparecer.`,
            worldmap: `${[8, 10, 12, 14][t]} explorações; até ${t >= 2 ? 6 : 4} alternativas. O modo digitado exige lembrar o nome.`,
            wordrain: `Palavras de até ${options.language === 'code' ? [4, 8, 16, 28][t] : p.maxLength} caracteres; ritmo inicial de ${p.baseWpm} WPM, com adaptação ao seu histórico.`,
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
            memory_game: `${p.pairs} pares; as associações dependem do modo escolhido.`,
            memorypath: `${p.length} passos numa grade ${p.size} × ${p.size}.`,
            memoryshelf: `${p.objects} objetos e ${p.changes} alterações no modo de mudanças.`,
            rightimpulse: `${p.symbols} estímulos; ${p.responseMs / 1000}s para cada resposta.`,
            mental_math: `${p.steps} etapa${p.steps === 1 ? '' : 's'} por expressão e ${p.target} respostas no modo de precisão.`,
            resta_um: `Até ${p.depth} saltos na construção reversa do tabuleiro; ${p.timeLimit}s de limite.`,
            subtledifference: `${p.changes} diferenças${p.subtle ? ', com alterações mais sutis' : ''}.`,
            symbol_inspector: `${p.days} dias, ${p.rules} regras e ${p.cases} documentos por dia.`,
            tictactoe: `Busca de até ${p.depth} jogadas; ${Math.round(p.random * 100)}% de escolhas aleatórias pelo adversário.`,
            weekday: `${[10, 12, 14, 16][t]} datas no intervalo de anos escolhido. A dificuldade aumenta a duração da partida.`,
            matrix: `${[10, 12, 14, 16][t]} problemas; valores de ${t ? -6 : 0} a ${[6, 9, 12, 15][t]}. Determinantes usam ${t >= 2 ? '3 × 3' : '2 × 2'}; outros modos mantêm 2 × 2.`,
            mutantoperator: `O significado dos operadores muda a cada ${[4, 3, 2, 1][t]} rodada${t === 3 ? '' : 's'}; ${t >= 2 ? 'expressões com duas operações' : 'uma operação por expressão'}.`,
            subitizing: `De 1 a ${[4, 6, 9, 12][t]} pontos; apresentação de ${[1000, 700, 450, 300][t]} ms antes de ocultar.`,
            compare: `${[10, 12, 14, 16][t]} comparações; expressões mais complexas conforme o nível e relações equilibradas em ordem aleatória.`,
            estimate: `Produtos com fatores de ${[12, 25, 80, 150][t]}–${[39, 99, 299, 999][t]} e 11–${[19, 49, 99, 299][t]}; uma única alternativa mais próxima.`,
            mentalrotation: `Figuras com até ${[5, 6, 8, 10][t]} células; ${[10, 12, 14, 16][t]} rodadas distinguindo rotação de espelhamento.`,
            spatialmemory: `${[3, 4, 6, 8][t]} alvos numa grade ${[4, 5, 6, 6][t]} × ${[4, 5, 6, 6][t]}; apresentação mais curta nos níveis altos.`,
            temporalorder: `${[3, 4, 6, 8][t]} eventos apresentados por ${[1000, 850, 650, 450][t]} ms cada. Depois, restaure a ordem.`,
            nback: `${options.n && options.n !== 'auto' ? options.n : [1, 2, 3, 3][t]}-back; 24 comparações. No modo manual, ${[5, 4, 3, 2.2][t]}s para responder; ritmo automático separado.`,
            workingmemory: `${[3, 4, 6, 8][t]} números; ${[4, 4, 3.5, 3][t]}s para memorizar. A transformação depende do modo.`,
            stroop: `${[10, 12, 14, 16][t]} rodadas; ${t ? `a regra alterna a cada ${[100, 4, 3, 2][t]} rodadas` : 'responda sempre pela cor da tinta'}.`,
            dynamicnumbers: `${[18, 24, 30, 36][t]} números até ${[40, 80, 130, 200][t]}; ${[5, 4, 3, 2.2][t]}s por resposta e três regras ao longo da partida.`,
            mutantrule: `Três blocos de ${[12, 14, 16, 18][t]} casos; ${[4.3, 3.8, 3.4, 2.9][t]}s por caso. Acompanhe as alterações do manual.`,
            checklist: `${[2, 3, 4, 4][t]} dias, ${[2, 3, 4, 5][t]} requisitos iniciais e ${[4, 6, 6, 8][t]} documentos por dia. A lista muda entre dias.`,
            colororder: `Seis rampas com ${[5, 6, 7, 8][t]} cores. A ordem depende de luminosidade, saturação ou matiz.`,
            oddcolor: `Quinze grades ${[3, 4, 5, 6][t]} × ${[3, 4, 5, 6][t]}; contraste inicial de ${[15, 12, 9, 7][t]} pontos de luminosidade, reduzido com a sequência de acertos.`
        };
        return (
            details[game.id] ||
            `O nível altera a complexidade dos estímulos e das regras. Leia o objetivo e as instruções na partida.`
        );
    }
    return Object.freeze({ categories, fresh, select, art, difficulty });
})();
