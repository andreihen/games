const ReplayEngine = Object.freeze({
    deck(random, items, recent = [], key = (item) => (typeof item === 'string' ? item : item.id)) {
        const unique = [...new Map(items.map((item) => [key(item), item])).values()];
        const seen = new Set(recent);
        let pending = random
            .shuffle(unique.filter((item) => !seen.has(key(item))))
            .concat(random.shuffle(unique.filter((item) => seen.has(key(item)))));
        let previous = null;
        return {
            next(excluded = [], preferred = null) {
                const blocked = new Set(excluded);
                if (!unique.some((item) => !blocked.has(key(item)))) return null;
                if (!pending.some((item) => !blocked.has(key(item)))) {
                    const remaining = new Set(pending.map(key));
                    pending.push(
                        ...random.shuffle(unique.filter((item) => !remaining.has(key(item))))
                    );
                    if (pending.length > 1 && key(pending[0]) === previous)
                        [pending[0], pending[1]] = [pending[1], pending[0]];
                }
                let at = preferred
                    ? pending.findIndex((item) => !blocked.has(key(item)) && preferred(item))
                    : -1;
                if (at < 0) at = pending.findIndex((item) => !blocked.has(key(item)));
                const [item] = pending.splice(at, 1);
                previous = key(item);
                return item;
            },
            get size() {
                return unique.length;
            }
        };
    }
});

const KnowledgeEngine = (() => {
    const areas = {
        Americas: 'Américas',
        Europe: 'Europa',
        Africa: 'África',
        Asia: 'Ásia',
        Oceania: 'Oceania',
        Antarctic: 'Antártida',
        'North America': 'América do Norte',
        'South America': 'América do Sul',
        'Central America': 'América Central',
        Caribbean: 'Caribe',
        'Central Asia': 'Ásia Central',
        'Eastern Asia': 'Ásia Oriental',
        'Southern Asia': 'Ásia Meridional',
        'South-Eastern Asia': 'Sudeste Asiático',
        'Western Asia': 'Ásia Ocidental',
        'Central Europe': 'Europa Central',
        'Eastern Europe': 'Europa Oriental',
        'Northern Europe': 'Europa Setentrional',
        'Southern Europe': 'Europa Meridional',
        'Southeast Europe': 'Sudeste Europeu',
        'Western Europe': 'Europa Ocidental',
        'Eastern Africa': 'África Oriental',
        'Middle Africa': 'África Central',
        'Northern Africa': 'África Setentrional',
        'Southern Africa': 'África Austral',
        'Western Africa': 'África Ocidental',
        'Australia and New Zealand': 'Austrália e Nova Zelândia',
        Melanesia: 'Melanésia',
        Micronesia: 'Micronésia',
        Polynesia: 'Polinésia'
    };
    const areaName = (country) =>
        areas[country.subregion] || areas[country.region] || 'Localização geográfica';
    const flagGroups = [
        ['ROU', 'TCD', 'AND', 'MDA'],
        ['IDN', 'MCO', 'POL'],
        ['NLD', 'LUX', 'RUS', 'SVK', 'SVN', 'HRV'],
        ['IRL', 'CIV', 'ITA'],
        ['SWE', 'FIN', 'NOR', 'DNK', 'ISL'],
        ['AUS', 'NZL', 'FJI', 'TUV'],
        ['BHR', 'QAT'],
        ['JOR', 'PSE', 'SDN', 'KWT', 'ARE'],
        ['MLI', 'GIN', 'SEN', 'CMR'],
        ['COL', 'ECU', 'VEN'],
        ['ARG', 'URY', 'GTM', 'HND', 'SLV', 'NIC'],
        ['USA', 'LBR', 'MYS']
    ];
    const normalize = (value) => GameArt.normalize(String(value)).replace(/[^a-z0-9]/g, '');
    function matches(value, accepted) {
        const normalized = normalize(value);
        return normalized.length > 0 && accepted.some((answer) => normalize(answer) === normalized);
    }
    function aliases(country) {
        const extras = {
            USA: ['Estados Unidos', 'EUA'],
            GBR: ['Reino Unido'],
            COD: ['República Democrática do Congo', 'Congo Kinshasa'],
            COG: ['República do Congo', 'Congo Brazzaville'],
            CZE: ['Tchéquia', 'República Tcheca'],
            KOR: ['Coreia do Sul'],
            PRK: ['Coreia do Norte'],
            CIV: ['Costa do Marfim']
        };
        return [
            ...new Set(
                [country.name, country.englishName, ...(extras[country.id] || [])].filter(Boolean)
            )
        ];
    }
    function alternatives(random, target, pool, count = 4, kind = 'country', exclude = []) {
        const excluded = new Set([target.id, ...exclude]);
        const eligible = [
            ...new Map(
                pool
                    .filter((country) => !excluded.has(country.id))
                    .map((country) => [country.id, country])
            ).values()
        ];
        const local = eligible.filter(
            (country) => country.subregion && country.subregion === target.subregion
        );
        const continental = eligible.filter((country) => country.region === target.region);
        // Mantém todas as alternativas na mesma área quando há pelo menos duas falsas plausíveis.
        const candidates =
            local.length >= 2 ? local : continental.length >= 2 ? continental : eligible;
        const family = flagGroups.find((group) => group.includes(target.id)) || [];
        const ranked = random.shuffle(candidates).sort((a, b) => {
            const score = (country) =>
                (kind === 'flag' && family.includes(country.id) ? 100 : 0) +
                (country.subregion === target.subregion ? 20 : 0) +
                (target.borders?.includes(country.id) ? 5 : 0);
            return score(b) - score(a);
        });
        return random.shuffle([target, ...ranked.slice(0, count - 1)]);
    }
    return Object.freeze({ normalize, matches, aliases, alternatives, areaName });
})();

const VocabularyEngine = Object.freeze({
    targets(dictionary, vocabulary, length, bank = 'common') {
        if (bank === 'wide') return dictionary[String(length)];
        const allowed = new Set(dictionary[String(length)]);
        return [
            ...new Set([
                ...(dictionary.answers?.[String(length)] || []),
                ...vocabulary.pt
                    .map((word) => GameArt.normalize(word).toUpperCase())
                    .filter((word) => word.length === length && allowed.has(word))
            ])
        ].sort();
    }
});
function KnowledgeDeduction(session, config, spec) {
    const recent = config.options.recentItems || [];
    const secret = ReplayEngine.deck(session.random, spec.bank, recent, (p) => String(p.id)).next();
    Progress.remember(spec.id, [String(secret.id)]);
    const seen = new Set();
    const $ = GameUI.shell(
        session,
        spec.title,
        spec.intro,
        `<p id="ded-count" class="status-line">0/${spec.attempts} tentativas · ${spec.bank.length} candidatos</p><details class="ded-reference"><summary>Consultar candidatos e atributos</summary><label>Filtrar candidatos <input id="ded-filter" class="compact-field" autocomplete="off"></label><div id="ded-reference-list"></div></details><form id="ded-form" class="controls"><input id="ded-input" class="compact-field" list="ded-names" aria-label="Seu palpite" placeholder="Digite um nome para comparar" autocomplete="off" autocapitalize="off"><datalist id="ded-names">${spec.bank.map((p) => `<option value="${GameArt.escape(p.name)}"></option>`).join('')}</datalist><button class="button button-primary">Comparar</button></form><p id="ded-feedback" role="status"></p><div id="ded-history" class="ded-history"></div>`
    );
    function reference() {
        const query = GameArt.normalize($('#ded-filter').value);
        $('#ded-reference-list').replaceChildren();
        for (const p of spec.bank
            .filter((p) =>
                GameArt.normalize(`${p.name} ${p.symbol || ''} ${p.alias}`).includes(query)
            )
            .slice(0, 60)) {
            const button = document.createElement('button');
            button.className = 'ded-candidate';
            button.type = 'button';
            button.textContent = spec.reveal(p);
            button.dataset.candidate = p.id;
            $('#ded-reference-list').append(button);
        }
    }
    session.listen($('#ded-reference-list'), 'click', (event) => {
        const button = event.target.closest('[data-candidate]');
        if (!button) return;
        const candidate = spec.bank.find((p) => String(p.id) === button.dataset.candidate);
        $('#ded-input').value = candidate.name;
        $('#ded-input').focus({ preventScroll: true });
    });
    reference();
    session.listen($('#ded-filter'), 'input', reference);
    session.listen($('#ded-form'), 'submit', (event) => {
        event.preventDefault();
        const value = GameArt.normalize($('#ded-input').value.trim());
        const guess = spec.bank.find((p) =>
            [p.name, p.alias, p.symbol].filter(Boolean).some((n) => GameArt.normalize(n) === value)
        );
        if (!guess) {
            $('#ded-feedback').textContent =
                'Escolha um candidato do banco desta partida. Consulte a lista se precisar.';
            return;
        }
        if (seen.has(guess.id)) {
            $('#ded-feedback').textContent =
                'Esse palpite já foi comparado. Tente outro candidato.';
            return;
        }
        seen.add(guess.id);
        const row = document.createElement('article');
        row.className = 'ded-row';
        const title = document.createElement('strong');
        title.textContent = guess.name;
        row.append(title);
        for (const field of spec.fields) {
            const a = field.value(guess),
                b = field.value(secret),
                mark = field.compare
                    ? field.compare(guess, secret)
                    : a === b
                      ? '✓'
                      : field.numeric
                        ? a < b
                            ? '↑'
                            : '↓'
                        : '✕';
            const cell = document.createElement('span');
            cell.className =
                'ded-cell ' + (mark === '✓' ? 'matched' : mark === '≈' ? 'partial' : '');
            cell.textContent = `${field.label}: ${a} ${mark}`;
            cell.setAttribute(
                'aria-label',
                `${field.label}: ${a}; ${mark === '✓' ? 'igual ao segredo' : mark === '↑' ? 'segredo maior' : mark === '↓' ? 'segredo menor' : mark === '≈' ? 'parcialmente igual' : 'diferente'}`
            );
            row.append(cell);
        }
        $('#ded-history').prepend(row);
        $('#ded-count').textContent =
            `${seen.size}/${spec.attempts} tentativas · ${spec.bank.length} candidatos`;
        $('#ded-input').value = '';
        const correct = guess.id === secret.id;
        session.score.attempt(correct);
        if (correct || seen.size === spec.attempts) {
            if (correct) session.score.add((spec.attempts - seen.size + 1) * 100);
            session.complete(correct, { text: spec.reveal(secret) });
        } else
            $('#ded-feedback').textContent =
                'Comparação adicionada. Combine as pistas antes do próximo palpite.';
    });
    $('#ded-input').focus({ preventScroll: true });
}
