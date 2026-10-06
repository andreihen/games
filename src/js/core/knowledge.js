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
