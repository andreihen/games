GameRegistry.register('symbol_inspector', (session) => {
    function init(config) {
        let rules = RuleEngine.generate(session.random, config.rules),
            day = 0,
            index = 0,
            cases = [],
            lives = 3,
            locked = false;
        const $ = GameUI.shell(
            session,
            'Inspetor',
            'O manual permanece disponível. Compare cada documento com todas as regras. As diretrizes mudam entre os dias.',
            `<div id="inspector-manual" class="manual"></div><p id="inspector-directive" class="notice directive" role="status"></p><p id="inspector-progress" class="status-line"></p><div id="inspector-object" style="width:160px"></div><p id="inspector-properties" class="status-line"></p><div class="controls">${GameUI.button('Aprovar', 'inspector-approve', 'primary')}${GameUI.button('Negar', 'inspector-deny')}</div><p id="inspector-feedback" class="notice hidden" role="status"></p>${GameUI.button('Continuar', 'inspector-next', 'primary')}`
        );
        function manual(change = 'Manual inicial.') {
            if (!RuleEngine.validateRuleSet(rules)) throw Error('Manual sem solução.');
            $('#inspector-manual').innerHTML =
                `<h3>Manual · Dia ${day + 1}</h3><ul>${rules.map((rule) => `<li>${RuleEngine.describe(rule)}</li>`).join('')}</ul>`;
            $('#inspector-directive').textContent = day ? `⚠ NOVA DIRETRIZ · ${change}` : change;
            cases = RuleEngine.cases(rules, config.cases, session.random);
            index = 0;
        }
        function render() {
            locked = false;
            $('#inspector-next').classList.add('hidden');
            $('#inspector-feedback').classList.add('hidden');
            $('#inspector-approve').disabled = false;
            $('#inspector-deny').disabled = false;
            const object = cases[index];
            $('#inspector-object').innerHTML = GameArt.svg(
                object.shape,
                object.color,
                object.symbol,
                object.border
            );
            $('#inspector-properties').textContent =
                `${RuleEngine.labels[object.shape]} · ${RuleEngine.labels[object.color]} · ${RuleEngine.labels[object.symbol]} · borda ${RuleEngine.labels[object.border]}`;
            $('#inspector-progress').textContent =
                `Dia ${day + 1}/${config.days} · Caso ${index + 1}/${config.cases} · Vidas: ${lives}`;
        }
        function decide(approve) {
            if (locked) return;
            locked = true;
            const object = cases[index],
                valid = RuleEngine.evaluate(object, rules),
                correct = approve === valid;
            session.score.answer(correct);
            if (!correct) lives--;
            const broken = rules.filter((rule) => !RuleEngine.accepts(object, rule));
            $('#inspector-feedback').classList.remove('hidden');
            $('#inspector-feedback').textContent = correct
                ? 'Decisão correta.'
                : valid
                  ? 'O caso atende a todas as regras do manual.'
                  : `Deveria ser negado: ${broken.map(RuleEngine.describe).join(' ')}`;
            $('#inspector-approve').disabled = true;
            $('#inspector-deny').disabled = true;
            if (lives === 0)
                return session.complete(false, {
                    text: 'Três decisões incorretas. Consulte o manual e experimente o mesmo desafio.'
                });
            $('#inspector-next').classList.remove('hidden');
            $('#inspector-next').focus();
        }
        session.listen($('#inspector-approve'), 'click', () => decide(true));
        session.listen($('#inspector-deny'), 'click', () => decide(false));
        session.listen($('#inspector-next'), 'click', () => {
            index++;
            if (index === cases.length) {
                day++;
                if (day === config.days)
                    return session.complete(true, {
                        text: `Inspeção concluída em ${config.days} dias. Diretrizes verificadas sem contradições.`
                    });
                const evolved = RuleEngine.evolve(rules, day, session.random);
                rules = evolved.rules;
                manual(evolved.change);
            }
            render();
        });
        manual();
        render();
    }
    return { init, destroy: session.destroy };
});
