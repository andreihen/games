GameRegistry.register('mutantrule', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            rng = session.random,
            shapes = rng.shuffle(RuleEngine.domains.shape),
            colors = rng.shuffle(RuleEngine.domains.color);
        const manuals = [
                [
                    { type: 'allowOnly', property: 'shape', values: [shapes[0]] },
                    { type: 'allowOnly', property: 'color', values: [colors[0]] }
                ],
                [{ type: 'allowOnly', property: 'shape', values: [shapes[1]] }],
                [
                    { type: 'allowOnly', property: 'shape', values: [shapes[1]] },
                    { type: 'forbid', property: 'color', value: colors[1] }
                ],
                [{ type: 'allowOnly', property: 'border', values: ['double'] }]
            ],
            plans = manuals.map((rules, i) =>
                RuleEngine.cases(rules, [12, 14, 16, 18][tier], rng.fork(`block${i}`))
            );
        const $ = GameUI.shell(
            session,
            'Regra Mutante',
            'Clique apenas nos objetos aceitos pela regra atual. Deixe os demais passar. A regra muda a cada vinte segundos.',
            `<p id="mutant-rule" class="notice directive"></p><p id="mutant-progress" class="status-line"></p><div id="mutant-field" class="moving-field"></div><p id="mutant-feedback" class="status-line" role="status"></p>${GameUI.button('Começar', 'mutant-start', 'primary')}`
        );
        let block = -1,
            spawned = 0,
            active = [],
            started = 0,
            previous = 0,
            spawnJob = null,
            running = false;
        function decide(item, clicked) {
            if (item.done) return;
            item.done = true;
            const accepted = RuleEngine.evaluate(item.object, manuals[block]),
                correct = clicked === accepted;
            session.score.answer(correct, clicked ? 100 : 40);
            if (clicked)
                $('#mutant-feedback').textContent = correct
                    ? 'Objeto aceito.'
                    : 'Esse objeto viola a regra atual.';
            item.el.remove();
        }
        function spawn() {
            if (spawned >= plans[block].length) return;
            const index = spawned++,
                object = plans[block][index],
                el = document.createElement('button');
            el.className = 'moving-object';
            el.innerHTML = GameArt.svg(object.shape, object.color, object.symbol, object.border);
            el.setAttribute(
                'aria-label',
                `${RuleEngine.labels[object.shape]} ${RuleEngine.labels[object.color]}, ${RuleEngine.labels[object.symbol]}, borda ${RuleEngine.labels[object.border]}`
            );
            const item = { object, el, done: false, born: session.now(), lane: index % 3 };
            session.listen(el, 'click', () => decide(item, true));
            $('#mutant-field').append(el);
            active.push(item);
        }
        function change() {
            session.clear(spawnJob);
            for (const item of active) decide(item, false);
            active = [];
            block++;
            if (block === 4) {
                running = false;
                const s = session.score.snapshot();
                return session.complete(s.accuracy >= 60, {
                    text: 'Quatro regras aplicadas em oitenta segundos.'
                });
            }
            started = session.now();
            spawned = 0;
            $('#mutant-rule').textContent =
                `${block ? 'NOVA REGRA' : 'REGRA INICIAL'} · ${manuals[block].map(RuleEngine.describe).join(' ')}`;
            $('#mutant-feedback').textContent = '';
            spawn();
            spawnJob = session.interval(spawn, Math.floor(16500 / plans[block].length));
            session.timeout(change, 20000);
        }
        function frame(time) {
            if (!running) return;
            const width = $('#mutant-field').clientWidth || 360,
                duration = [4300, 3800, 3400, 2900][tier];
            for (const item of active) {
                if (item.done) continue;
                const progress = (time - item.born) / duration;
                item.el.style.transform = `translate(${Math.max(0, (width - 64) * progress)}px, ${item.lane * 76 + 8}px)`;
                if (progress >= 1) decide(item, false);
            }
            active = active.filter((i) => !i.done);
            if (time - previous > 100) {
                $('#mutant-progress').textContent =
                    `Bloco ${block + 1}/4 · Próxima mudança em ${Math.ceil((20000 - (time - started)) / 1000)}s`;
                previous = time;
            }
            session.frame(frame);
        }
        session.listen($('#mutant-start'), 'click', () => {
            $('#mutant-start').remove();
            running = true;
            change();
            session.frame(frame);
        });
        $('#mutant-rule').textContent = 'Quatro blocos de vinte segundos.';
    },
    destroy: session.destroy
}));
