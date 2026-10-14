const EquationPuzzle = Object.freeze({
    evaluate(text) {
        if (!/^(0|[1-9]\d*)([+*\/-](0|[1-9]\d*))*$/.test(text)) return null;
        const tokens = text.match(/\d+|[+*\/-]/g),
            terms = [Number(tokens[0])],
            ops = [];
        for (let i = 1; i < tokens.length; i += 2) {
            const op = tokens[i],
                n = Number(tokens[i + 1]);
            if (op === '*') terms[terms.length - 1] *= n;
            else if (op === '/') {
                if (!n) return null;
                terms[terms.length - 1] /= n;
            } else {
                ops.push(op);
                terms.push(n);
            }
        }
        let result = terms[0];
        ops.forEach((op, i) => (result += op === '+' ? terms[i + 1] : -terms[i + 1]));
        return Number.isFinite(result) ? result : null;
    },
    feedback(guess, target) {
        const flags = Array(guess.length).fill('absent'),
            remaining = {};
        for (let i = 0; i < target.length; i++)
            if (guess[i] === target[i]) flags[i] = 'exact';
            else remaining[target[i]] = (remaining[target[i]] || 0) + 1;
        for (let i = 0; i < guess.length; i++)
            if (flags[i] !== 'exact' && remaining[guess[i]]) {
                flags[i] = 'present';
                remaining[guess[i]]--;
            }
        return flags;
    }
});
GameRegistry.register('equation', (session) => ({
    init(config) {
        const tier = DifficultyEngine.index(config.difficulty),
            length = [5, 6, 7, 8][tier],
            bank = [];
        for (let a = 1; a <= 30; a++)
            for (let b = 1; b <= 30; b++)
                for (const op of tier < 2 ? ['+', '-'] : ['+', '-', '*', '/']) {
                    const lhs = `${a}${op}${b}`,
                        v = EquationPuzzle.evaluate(lhs);
                    if (Number.isInteger(v) && v >= 0 && `${lhs}=${v}`.length === length)
                        bank.push(`${lhs}=${v}`);
                    if (tier === 3 && op === '+')
                        for (let c = 1; c <= 9; c++) {
                            const lhs2 = `${a}+${b}*${c}`,
                                v2 = EquationPuzzle.evaluate(lhs2);
                            if (`${lhs2}=${v2}`.length === length) bank.push(`${lhs2}=${v2}`);
                        }
                }
        const unique = [...new Set(bank)].filter(
            (value) => tier < 3 || (value.split('=')[0].match(/[+*/-]/g) || []).length > 1
        );
        const target = session.random.pick(unique),
            attempts = [8, 7, 6, 6][tier],
            seen = new Set();
        const $ = GameUI.shell(
            session,
            'Equação Oculta',
            `Descubra a igualdade de ${length} caracteres em ${attempts} tentativas. ✓ lugar certo; ↔ existe em outro lugar; · ausente. Multiplicação e divisão têm prioridade. Não use espaços, números negativos ou zeros à esquerda.`,
            `<p id="eq-count" class="status-line"></p><div id="eq-history" class="equation-history"></div><form id="eq-form" class="controls"><input id="eq-input" class="compact-field" aria-label="Sua equação" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="${length}"><button class="button button-primary">Verificar</button></form><p id="eq-feedback" role="status"></p><div id="eq-keys" class="equation-keys">${[...'0123456789+-*/='].map((k) => `<button type="button" class="button" data-key="${k}">${k}</button>`).join('')}<button type="button" class="button" data-key="back">⌫</button></div>`
        );
        session.listen($('#eq-keys'), 'click', (event) => {
            const key = event.target.closest('[data-key]')?.dataset.key;
            if (!key) return;
            const input = $('#eq-input');
            input.value =
                key === 'back' ? input.value.slice(0, -1) : (input.value + key).slice(0, length);
            input.focus({ preventScroll: true });
        });
        $('#eq-count').textContent = `0/${attempts} tentativas · ${length} espaços`;
        session.listen($('#eq-form'), 'submit', (event) => {
            event.preventDefault();
            const value = $('#eq-input').value.trim(),
                parts = value.split('=');
            if (
                value.length !== length ||
                parts.length !== 2 ||
                !/^(0|[1-9]\d*)$/.test(parts[1]) ||
                EquationPuzzle.evaluate(parts[0]) !== Number(parts[1])
            ) {
                $('#eq-feedback').textContent =
                    `Digite uma igualdade verdadeira de ${length} caracteres. Exemplo: 2+3=5 (5 caracteres).`;
                return;
            }
            if (seen.has(value)) {
                $('#eq-feedback').textContent = 'Você já tentou esta equação.';
                return;
            }
            seen.add(value);
            const row = document.createElement('div');
            row.className = 'equation-row';
            const flags = EquationPuzzle.feedback(value, target);
            row.innerHTML = [...value]
                .map(
                    (char, i) =>
                        `<span class="equation-tile ${flags[i]}" aria-label="${char}: ${flags[i] === 'exact' ? 'posição correta' : flags[i] === 'present' ? 'outra posição' : 'ausente'}">${char}<small>${flags[i] === 'exact' ? '✓' : flags[i] === 'present' ? '↔' : '·'}</small></span>`
                )
                .join('');
            $('#eq-history').append(row);
            $('#eq-input').value = '';
            $('#eq-count').textContent = `${seen.size}/${attempts} tentativas`;
            const correct = value === target;
            session.score.attempt(correct);
            if (correct || seen.size === attempts) {
                if (correct) session.score.add((attempts - seen.size + 1) * 100);
                session.complete(correct, { text: `Equação: ${target}. ${seen.size} tentativas.` });
            } else $('#eq-feedback').textContent = 'Use as pistas para tentar outra igualdade.';
        });
        $('#eq-input').focus({ preventScroll: true });
    },
    destroy: session.destroy
}));
