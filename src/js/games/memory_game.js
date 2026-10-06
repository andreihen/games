GameRegistry.register('memory_game', (session) => {
    function init(config) {
        const mode = config.options.mode || 'classic',
            category = config.options.category || 'mixed';
        const pools = {
            classic: '🐶 🍎 🚗 🐝 🌙 🌻 🐢 🎵 ⚽ 🐟 🏠 🔑 📷 🌈 🚀 🍋 🧩 ⛵ 🦋 🍇 ☕ 🕯️ 🪴 📕'
                .split(' ')
                .map((icon) => [icon, icon]),
            world: [
                ['Brasil', 'Brasília'],
                ['França', 'Paris'],
                ['Itália', 'Roma'],
                ['Portugal', 'Lisboa'],
                ['Canadá', 'Ottawa'],
                ['Japão', 'Tóquio'],
                ['Argentina', 'Buenos Aires'],
                ['Chile', 'Santiago'],
                ['Espanha', 'Madri'],
                ['Alemanha', 'Berlim'],
                ['Austrália', 'Canberra'],
                ['México', 'Cidade do México']
            ],
            science: [
                ['H₂O', 'água'],
                ['O₂', 'oxigênio'],
                ['CO₂', 'dióxido de carbono'],
                ['NaCl', 'sal de cozinha'],
                ['triângulo', '3 lados'],
                ['quadrado', '4 lados iguais'],
                ['hexágono', '6 lados'],
                ['octógono', '8 lados'],
                ['1 metro', '100 centímetros'],
                ['1 hora', '60 minutos'],
                ['1 quilograma', '1000 gramas'],
                ['1 litro', '1000 mililitros']
            ],
            daily: [
                ['🐝', 'mel'],
                ['🐔', 'ovo'],
                ['🔑', 'fechadura'],
                ['📷', 'fotografia'],
                ['☂️', 'chuva'],
                ['🎵', 'música'],
                ['📕', 'leitura'],
                ['🕯️', 'vela'],
                ['🪴', 'planta'],
                ['🚗', 'carro'],
                ['⛵', 'vela de barco'],
                ['🧩', 'quebra-cabeça']
            ],
            concepts: [
                ['perímetro', 'medida do contorno'],
                ['área', 'medida da superfície'],
                ['sinônimo', 'palavra de sentido semelhante'],
                ['antônimo', 'palavra de sentido contrário'],
                ['par', 'divisível por 2'],
                ['ímpar', 'não divisível por 2'],
                ['soma', 'resultado de uma adição'],
                ['produto', 'resultado de uma multiplicação'],
                ['fração', 'razão entre dois inteiros'],
                ['vértice', 'encontro de lados'],
                ['raio', 'centro até a circunferência'],
                ['diâmetro', 'duas vezes o raio']
            ],
            english: [
                ['sun', 'sol'],
                ['moon', 'lua'],
                ['water', 'água'],
                ['house', 'casa'],
                ['book', 'livro'],
                ['tree', 'árvore'],
                ['dog', 'cachorro'],
                ['cat', 'gato'],
                ['red', 'vermelho'],
                ['blue', 'azul'],
                ['green', 'verde'],
                ['yellow', 'amarelo'],
                ['window', 'janela'],
                ['rain', 'chuva'],
                ['key', 'chave'],
                ['flower', 'flor']
            ],
            symbols: [
                ['+', 'adição'],
                ['−', 'subtração'],
                ['×', 'multiplicação'],
                ['÷', 'divisão'],
                ['=', 'igualdade'],
                ['≠', 'diferente de'],
                ['<', 'menor que'],
                ['>', 'maior que'],
                ['%', 'porcentagem'],
                ['∞', 'infinito'],
                ['√', 'raiz quadrada'],
                ['≈', 'aproximadamente igual']
            ]
        };
        let pool =
            mode === 'association'
                ? category === 'mixed'
                    ? [...pools.world, ...pools.science, ...pools.daily]
                    : pools[category]
                : pools[mode];
        if (mode === 'math') {
            pool = [];
            const answers = new Set();
            while (pool.length < 24) {
                const a = session.random.int(2, 12),
                    b = session.random.int(2, 12),
                    answer = a * b;
                if (answers.has(answer)) continue;
                answers.add(answer);
                pool.push([`${a} × ${b}`, String(answer)]);
            }
        }
        const pairs = session.random.shuffle(pool).slice(0, config.pairs),
            deck = session.random.shuffle(
                pairs.flatMap(([a, b], pair) => [
                    { text: a, pair },
                    { text: b, pair }
                ])
            );
        let open = [],
            matched = new Set(),
            locked = false;
        const $ = GameUI.shell(
            session,
            'Jogo da Memória',
            mode === 'classic'
                ? 'Encontre os pares iguais.'
                : `Combine pares relacionados. Modo: ${mode === 'association' ? 'Associação' : mode === 'math' ? 'Matemática' : mode === 'english' ? 'Inglês' : mode === 'symbols' ? 'Símbolos' : 'Conceitos'}.`,
            `<p id="mg-progress" class="status-line"></p><div id="mg-board" class="memory-board"></div>`
        );
        const buttons = deck.map((card, i) => {
            const button = document.createElement('button');
            button.className = 'memory-card closed';
            button.dataset.card = i;
            $('#mg-board').append(button);
            return button;
        });
        function render() {
            buttons.forEach((button, i) => {
                const visible = open.includes(i) || matched.has(deck[i].pair);
                button.textContent = visible ? deck[i].text : '?';
                button.className = `memory-card${visible ? '' : ' closed'}${matched.has(deck[i].pair) ? ' matched' : ''}`;
                button.disabled = locked || matched.has(deck[i].pair) || open.includes(i);
                button.setAttribute(
                    'aria-label',
                    visible ? deck[i].text : `Carta ${i + 1}, fechada`
                );
            });
            $('#mg-progress').textContent = `Pares: ${matched.size}/${pairs.length}`;
        }
        session.listen($('#mg-board'), 'click', (event) => {
            const button = event.target.closest('[data-card]');
            if (!button || locked) return;
            const i = +button.dataset.card;
            if (open.includes(i) || matched.has(deck[i].pair)) return;
            open.push(i);
            render();
            if (open.length === 2) {
                locked = true;
                const same = deck[open[0]].pair === deck[open[1]].pair;
                session.score.answer(same);
                if (same) {
                    matched.add(deck[i].pair);
                    open = [];
                    locked = false;
                    render();
                    if (matched.size === pairs.length)
                        session.complete(true, {
                            text: `${pairs.length} associações encontradas.`
                        });
                } else {
                    render();
                    session.timeout(() => {
                        open = [];
                        locked = false;
                        render();
                    }, 800 + config.delay);
                }
            }
        });
        render();
    }
    return { init, destroy: session.destroy };
});
