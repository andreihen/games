const RuleEngine = (() => {
    const domains = {
        shape: ['circle', 'triangle', 'square'],
        color: ['blue', 'red', 'green', 'yellow'],
        symbol: ['none', 'star', 'circle'],
        border: ['single', 'double']
    };
    const labels = {
        circle: 'círculo',
        triangle: 'triângulo',
        square: 'quadrado',
        blue: 'azul',
        red: 'vermelho',
        green: 'verde',
        yellow: 'amarelo',
        none: 'sem símbolo',
        star: 'estrela',
        single: 'simples',
        double: 'dupla'
    };
    const properties = { shape: 'forma', color: 'cor', symbol: 'símbolo', border: 'borda' };
    function matches(object, condition = {}) {
        if (condition.all) return condition.all.every((item) => matches(object, item));
        if (condition.any) return condition.any.some((item) => matches(object, item));
        return Object.entries(condition).every(([key, value]) =>
            Array.isArray(value) ? value.includes(object[key]) : object[key] === value
        );
    }
    function accepts(object, rule) {
        if (rule.type === 'allowOnly') return rule.values.includes(object[rule.property]);
        if (rule.type === 'forbid')
            return (
                !matches(object, rule.condition || { [rule.property]: rule.value }) ||
                Boolean(rule.except && matches(object, rule.except))
            );
        if (rule.type === 'require')
            return !matches(object, rule.condition) || matches(object, rule.requirement);
        throw new Error(`Regra desconhecida: ${rule.type}`);
    }
    const evaluate = (object, rules) => rules.every((rule) => accepts(object, rule));
    const universe = [];
    for (const shape of domains.shape)
        for (const color of domains.color)
            for (const symbol of domains.symbol)
                for (const border of domains.border)
                    universe.push({ shape, color, symbol, border });
    function validateRuleSet(rules, domain = universe) {
        try {
            return rules.length > 0 && domain.some((object) => evaluate(object, rules));
        } catch {
            return false;
        }
    }
    const conditionText = (condition) =>
        Object.entries(condition)
            .map(
                ([property, value]) =>
                    `${properties[property]} ${Array.isArray(value) ? value.map((v) => labels[v]).join(' ou ') : labels[value]}`
            )
            .join(' e ');
    function describe(rule) {
        if (rule.type === 'allowOnly')
            return `Permitir apenas ${properties[rule.property]}: ${rule.values.map((v) => labels[v]).join(' ou ')}.`;
        if (rule.type === 'forbid')
            return `Negar ${conditionText(rule.condition || { [rule.property]: rule.value })}${rule.except ? `, exceto ${conditionText(rule.except)}` : ''}.`;
        return `Se ${conditionText(rule.condition)}, exigir ${conditionText(rule.requirement)}.`;
    }
    function generate(random, count) {
        for (let attempt = 0; attempt < 40; attempt++) {
            const shapes = random.shuffle(domains.shape),
                colors = random.shuffle(domains.color);
            const rules = [
                { type: 'allowOnly', property: 'shape', values: shapes.slice(0, 2) },
                { type: 'forbid', property: 'color', value: colors[0] }
            ];
            if (count >= 3)
                rules.push({
                    type: 'require',
                    condition: { shape: shapes[0] },
                    requirement: { symbol: 'star' }
                });
            if (count >= 4)
                rules.push({
                    type: 'require',
                    condition: { color: colors[1], symbol: 'circle' },
                    requirement: { border: 'double' }
                });
            if (count >= 5)
                rules.push({
                    type: 'forbid',
                    condition: { shape: shapes[1], color: colors[2] },
                    except: { symbol: 'star' }
                });
            if (validateRuleSet(rules)) return rules;
        }
        throw new Error('Não foi possível construir um manual consistente.');
    }
    function evolve(rules, day, random) {
        const next = structuredClone(rules);
        let change;
        if (day === 1) {
            const allowed = next.find((r) => r.type === 'allowOnly').values;
            const added = {
                type: 'require',
                condition: { shape: random.pick(allowed) },
                requirement: { border: 'double' }
            };
            next.push(added);
            change = `Adicionada: ${describe(added)}`;
        } else if (day === 2) {
            const index = next.length - 1;
            change = `Removida: ${describe(next[index])}`;
            next.splice(index, 1);
        } else {
            const rule = next.find((r) => r.type === 'require');
            if (rule) {
                const index = next.indexOf(rule);
                next[index] = {
                    type: 'forbid',
                    condition: { ...rule.condition, ...rule.requirement }
                };
                change = `Invertida: ${describe(next[index])}`;
            } else {
                const rule = next.find((r) => r.type === 'forbid');
                rule.value = random.pick(domains.color.filter((c) => c !== rule.value));
                change = `Alterada: ${describe(rule)}`;
            }
        }
        if (!validateRuleSet(next))
            return {
                rules: generate(random, Math.min(5, rules.length)),
                change: 'Novo manual consistente substitui as diretrizes anteriores.'
            };
        return { rules: next, change };
    }
    function cases(rules, count, random, domain = universe) {
        const valid = domain.filter((object) => evaluate(object, rules)),
            invalid = domain.filter((object) => !evaluate(object, rules));
        if (!valid.length || !invalid.length)
            throw new Error('O manual precisa admitir casos válidos e inválidos.');
        const cases = [];
        // Casos testemunha tornam cada regra útil, incluindo condicionais e exceções.
        for (const rule of rules) {
            const witnesses = invalid.filter(
                (o) =>
                    !accepts(o, rule) && rules.filter((r) => r !== rule).every((r) => accepts(o, r))
            );
            if (witnesses.length && cases.length < count / 2)
                cases.push({ ...random.pick(witnesses) });
        }
        while (cases.length < count)
            cases.push({ ...random.pick(cases.length % 2 ? valid : invalid) });
        return random.shuffle(cases);
    }
    return Object.freeze({
        domains,
        labels,
        properties,
        matches,
        accepts,
        evaluate,
        validateRuleSet,
        describe,
        generate,
        evolve,
        cases,
        universe
    });
})();

const GameArt = Object.freeze({
    colors: { blue: '#60a5fa', red: '#f87171', green: '#4ade80', yellow: '#facc15' },
    svg(shape, color, symbol = 'none', border = 'single') {
        const paths = {
            circle: '<circle cx="50" cy="50" r="31"/>',
            square: '<rect x="20" y="20" width="60" height="60" rx="4"/>',
            triangle: '<path d="M50 12L87 82H13Z"/>',
            arrow: '<path d="M15 36H55V15L88 50L55 85V64H15Z"/>'
        };
        const inner =
            symbol === 'star'
                ? '<text x="50" y="61" text-anchor="middle" fill="#172238" stroke="none" font-size="32">★</text>'
                : symbol === 'circle'
                  ? '<circle cx="50" cy="51" r="10" fill="none" stroke="#14263e" stroke-width="4"/>'
                  : '';
        return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="${GameArt.colors[color] || color}" stroke="#d6e9ff" stroke-width="${border === 'double' ? 7 : 2}">${paths[shape] || paths.square}</g>${inner}</svg>`;
    },
    escape(value) {
        return String(value).replace(
            /[&<>"']/g,
            (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
        );
    },
    normalize(value) {
        return String(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ');
    }
});
