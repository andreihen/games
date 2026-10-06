GameRegistry.register('checklist', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            days = [2, 3, 4, 4][tier],
            count = [4, 6, 6, 8][tier],
            fields = [
                'arquivo STL',
                'antagonista',
                'gengiva',
                'imagem',
                'biblioteca',
                'identificação',
                'referência'
            ],
            keys = fields.map((_, i) => `field${i}`),
            domain = Array.from({ length: 128 }, (_, mask) =>
                Object.fromEntries(keys.map((key, i) => [key, Boolean(mask & (1 << i))]))
            );
        let rules = session.random
                .shuffle(keys)
                .slice(0, [2, 3, 4, 5][tier])
                .map((property) => ({ type: 'allowOnly', property, values: [true] })),
            day = 0,
            index = 0,
            cases = [],
            locked = true;
        const describe = (r) =>
            `${r.values[0] ? 'Exigir' : 'Deve estar ausente'}: ${fields[keys.indexOf(r.property)]}.`;
        const $ = GameUI.shell(
            session,
            'Checklist',
            'Memorize a lista de requisitos. Depois aprove os casos que atendem a todos eles; a checklist muda entre os blocos.',
            `<p id="check-directive" class="notice directive"></p><div id="check-manual" class="manual"></div><p id="check-progress" class="status-line"></p><div id="check-object" class="case-checklist"></div><div id="check-controls" class="controls hidden">${GameUI.button('Aprovar', 'check-yes', 'primary')}${GameUI.button('Negar', 'check-no')}</div><p id="check-feedback" class="notice hidden"></p>${GameUI.button('Continuar', 'check-next', 'primary')}${GameUI.button('Estudar checklist', 'check-study', 'primary')}`
        );
        function showManual(change) {
            if (!RuleEngine.validateRuleSet(rules, domain)) throw Error('Checklist inconsistente.');
            locked = true;
            cases = RuleEngine.cases(rules, count, session.random, domain);
            index = 0;
            $('#check-object').replaceChildren();
            $('#check-controls').classList.add('hidden');
            $('#check-next').classList.add('hidden');
            $('#check-feedback').classList.add('hidden');
            $('#check-manual').classList.remove('hidden');
            $('#check-manual').innerHTML =
                `<h3>Checklist · Bloco ${day + 1}</h3><ul>${rules.map((r) => `<li>${describe(r)}</li>`).join('')}</ul><p>Itens não citados são opcionais.</p>`;
            $('#check-directive').textContent = change;
            $('#check-study').classList.remove('hidden');
            $('#check-progress').textContent =
                'Ao iniciar, você terá cinco segundos para memorizar.';
        }
        function showCase() {
            locked = false;
            $('#check-manual').classList.add('hidden');
            $('#check-directive').textContent = `Bloco ${day + 1}: aplique a checklist memorizada.`;
            $('#check-controls').classList.remove('hidden');
            $('#check-yes').disabled = false;
            $('#check-no').disabled = false;
            $('#check-feedback').classList.add('hidden');
            $('#check-next').classList.add('hidden');
            $('#check-progress').textContent =
                `Bloco ${day + 1}/${days} · Caso ${index + 1}/${count}`;
            const o = cases[index];
            $('#check-object').innerHTML = keys
                .map(
                    (key, i) =>
                        `<p><span class="${o[key] ? 'case-present' : 'case-missing'}">${o[key] ? '✓' : '✗'}</span> ${fields[i]}</p>`
                )
                .join('');
        }
        function answer(approved) {
            if (locked) return;
            locked = true;
            const o = cases[index],
                expected = RuleEngine.evaluate(o, rules),
                correct = approved === expected;
            session.score.answer(correct);
            $('#check-yes').disabled = true;
            $('#check-no').disabled = true;
            $('#check-feedback').classList.remove('hidden');
            $('#check-feedback').textContent = correct
                ? 'Decisão correta.'
                : expected
                  ? 'O caso atendia a todos os requisitos.'
                  : `Negar: ${rules
                        .filter((r) => !RuleEngine.accepts(o, r))
                        .map(describe)
                        .join(' ')}`;
            $('#check-next').classList.remove('hidden');
        }
        function evolve() {
            if (day === 1) {
                const property = session.random.pick(
                        keys.filter((key) => !rules.some((r) => r.property === key))
                    ),
                    rule = { type: 'allowOnly', property, values: [true] };
                rules.push(rule);
                return `Adicionada: ${describe(rule)}`;
            }
            if (day === 2) {
                const removed = rules.shift();
                return `Removida: ${describe(removed)}`;
            }
            const rule = session.random.pick(rules);
            rule.values = [!rule.values[0]];
            return `Invertida: ${describe(rule)}`;
        }
        session.listen($('#check-study'), 'click', () => {
            $('#check-study').classList.add('hidden');
            $('#check-progress').textContent = 'Memorize: cinco segundos.';
            session.timeout(showCase, 5000);
        });
        session.listen($('#check-yes'), 'click', () => answer(true));
        session.listen($('#check-no'), 'click', () => answer(false));
        session.listen($('#check-next'), 'click', () => {
            index++;
            if (index === count) {
                day++;
                if (day === days) {
                    const s = session.score.snapshot();
                    return session.complete(s.accuracy >= 60, {
                        text: `${s.correct} decisões corretas nos ${days} blocos.`
                    });
                }
                showManual(`NOVA DIRETRIZ · ${evolve()}`);
            } else showCase();
        });
        showManual('Memorize a checklist inicial.');
    },
    destroy: session.destroy
}));
