const ArenaEngine = (() => {
    const version = 4,
        maxPlayers = 48;
    const clone = (value) => structuredClone(value);
    const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
    const integer = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
    const text = (s, max = 80) => typeof s === 'string' && s.trim().length > 0 && s.length <= max;
    const safeId = (s) => typeof s === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(s);
    const dArea = (kind) => ['grenade', 'firebomb', 'charge'].includes(kind);
    const profiles = ['balanced', 'aggressive', 'strategist', 'diplomat', 'cautious'];
    const behaviors = [...profiles, 'random'];
    function distributeDistricts(characters, preserve = true) {
        const out = clone(characters), counts = Array(12).fill(0);
        if (preserve) for (const c of out) if (integer(c.district, 1, 12)) counts[c.district - 1]++;
        for (const c of out) {
            if (preserve && integer(c.district, 1, 12)) continue;
            const next = counts.indexOf(Math.min(...counts));
            c.district = next + 1;
            counts[next]++;
        }
        return out;
    }
    function balanceAttributes(raw, budget = 36) {
        const keys = ['strength', 'agility', 'endurance', 'perception', 'cunning', 'social'];
        if (!integer(budget, 6, 60)) throw Error('O orçamento deve ter entre 6 e 60 pontos.');
        if (
            keys.every((k) => integer(raw?.[k], 1, 10)) &&
            keys.reduce((sum, k) => sum + raw[k], 0) === budget
        )
            return Object.fromEntries(keys.map((k) => [k, raw[k]]));
        const result = Object.fromEntries(keys.map((k) => [k, 1]));
        const weights = Object.fromEntries(
            keys.map((k) => [k, Math.max(0, Number(raw?.[k] || 1) - 1)])
        );
        let remaining = budget - 6;
        while (remaining > 0) {
            const pool = keys.filter((k) => result[k] < 10);
            const sum = pool.reduce((s, k) => s + weights[k], 0);
            const ideals = pool.map((k) => ({
                k,
                n: remaining * (sum ? weights[k] / sum : 1 / pool.length)
            }));
            let assigned = 0;
            for (const { k, n } of ideals) {
                const add = Math.min(10 - result[k], Math.floor(n));
                result[k] += add;
                assigned += add;
            }
            if (assigned) remaining -= assigned;
            else {
                ideals.sort((a, b) => b.n - a.n);
                result[ideals[0].k]++;
                remaining--;
            }
        }
        return result;
    }
    const imageUrl = (value) => ArenaAccess.imageUrl(value);
    function definitions(config, data) {
        return {
            ...data,
            items: {
                ...data.items,
                ...Object.fromEntries(
                    (config.customWeapons || []).map((i) => [
                        i.id,
                        {
                            name: i.name,
                            type: 'weapon',
                            power: i.power,
                            attribute: i.attribute,
                            ...(i.ammo ? { ammo: i.ammo } : {})
                        }
                    ])
                )
            }
        };
    }
    function normalizeGender(value) {
        const v = String(value || '')
            .trim()
            .toLowerCase();
        return ['male', 'masculino'].includes(v)
            ? 'male'
            : ['female', 'feminino'].includes(v)
              ? 'female'
              : ['other', 'genderless', 'non-binary', 'outro'].includes(v)
                ? 'other'
                : 'unknown';
    }
    function validateConfig(raw, data) {
        if (
            !raw ||
            typeof raw !== 'object' ||
            !Array.isArray(raw.characters) ||
            raw.characters.length < 2 ||
            raw.characters.length > maxPlayers
        )
            throw Error('Escolha de 2 a 48 participantes.');
        const seed = SeededRandom.normalize(raw.seed),
            arena = data.arenas.find((a) => a.id === raw.arena);
        if (!arena) throw Error('Arena desconhecida.');
        const pointBudget = raw.pointBudget ?? 36;
        if (!integer(pointBudget, 6, 60)) throw Error('O orçamento deve ter entre 6 e 60 pontos.');
        const customWeapons = (Array.isArray(raw.customWeapons) ? raw.customWeapons : []).map(
            (item, index) => {
                if (
                    !item ||
                    !safeId(item.id) ||
                    !item.id.startsWith('custom-') ||
                    Object.hasOwn(data.items, item.id) ||
                    !text(item.name, 40) ||
                    !integer(item.power, 3, 18) ||
                    !['strength', 'agility', 'cunning', 'perception'].includes(item.attribute)
                )
                    throw Error('Arma personalizada inválida. Potência: 3 a 18.');
                return {
                    id: item.id,
                    name: item.name.trim(),
                    power: item.power,
                    attribute: item.attribute,
                    ammo: ['arrows', 'stones'].includes(item.ammo) ? item.ammo : null
                };
            }
        );
        if (
            customWeapons.length > 12 ||
            new Set(customWeapons.map((i) => i.id)).size !== customWeapons.length
        )
            throw Error('Use até 12 armas com IDs distintos.');
        const defs = definitions({ customWeapons }, data);
        const weaponKinds = Object.keys(defs.items).filter((k) => defs.items[k].type === 'weapon');
        const weapons = Array.isArray(raw.weapons) ? [...new Set(raw.weapons)] : weaponKinds;
        if (weapons.some((k) => !weaponKinds.includes(k))) throw Error('Arma desconhecida.');
        const ids = new Set(),
            stats = SeededRandom.create(seed).fork('cast');
        const characters = raw.characters.map((c, i) => {
            if (
                !c ||
                !safeId(c.id) ||
                /^(r[0-9]{1,2}|spent)$/.test(c.id) ||
                ids.has(c.id) ||
                !text(c.name, 60)
            )
                throw Error('Elenco com ID repetido ou nome inválido.');
            ids.add(c.id);
            let attributes = {};
            for (const key of Object.keys(data.attributes)) {
                const value = c.attributes?.[key] ?? stats.int(2, 9);
                if (!integer(value, 1, 10)) throw Error('Atributos precisam estar entre 1 e 10.');
                attributes[key] = value;
            }
            if (raw.balance !== false) attributes = balanceAttributes(attributes, pointBudget);
            const starting = Array.isArray(c.starting) ? c.starting : [];
            if (starting.length > 4 || starting.some((k) => !Object.hasOwn(defs.items, k)))
                throw Error('Inventário inicial inválido.');
            if (c.district !== undefined && c.district !== null && !integer(c.district, 1, 12))
                throw Error('Escolha um distrito de 1 a 12.');
            return {
                id: c.id,
                name: c.name.trim(),
                universe: text(c.universe, 80) ? c.universe : 'Personagem original',
                source: text(c.source, 150) ? c.source : 'Criação manual',
                theme: text(c.theme, 30) ? c.theme : 'custom',
                type: text(c.type, 30) ? c.type : 'custom',
                catalogId: safeId(c.catalogId) ? c.catalogId : null,
                gender: normalizeGender(c.gender),
                portrait: safeId(c.portrait) ? c.portrait : null,
                image: imageUrl(c.image),
                imageSource: text(c.imageSource, 500) ? c.imageSource : '',
                imageKind: ['character', 'actor', 'illustration', 'custom'].includes(c.imageKind)
                    ? c.imageKind
                    : 'custom',
                behavior: behaviors.includes(c.behavior) ? c.behavior : 'inherit',
                district: integer(c.district, 1, 12) ? c.district : null,
                attributes,
                starting: [...starting]
            };
        });
        return {
            seed,
            arena: arena.id,
            characters: distributeDistricts(characters),
            pointBudget,
            balance: raw.balance !== false,
            behavior: behaviors.includes(raw.behavior) ? raw.behavior : 'random',
            topology: ['biome', 'ring', 'grid', 'branch'].includes(raw.topology)
                ? raw.topology
                : 'biome',
            abundance: ['scarce', 'normal', 'rich'].includes(raw.abundance)
                ? raw.abundance
                : 'normal',
            incidents: ['low', 'normal', 'high'].includes(raw.incidents) ? raw.incidents : 'normal',
            hazards: ['low', 'normal', 'high'].includes(raw.hazards) ? raw.hazards : 'low',
            startingKit: 'none',
            weapons,
            customWeapons,
            pace: ['short', 'normal', 'slow'].includes(raw.pace) ? raw.pace : 'short',
            hostility: ['calm', 'balanced', 'chaos'].includes(raw.hostility)
                ? raw.hostility
                : 'balanced',
            alliances: raw.alliances !== false,
            humor: raw.humor !== false
        };
    }
    const living = (w) => w.players.filter((p) => p.status === 'alive');
    const player = (w, id) => w.players.find((p) => p.id === id);
    const region = (w, id) => w.regions.find((r) => r.id === id);
    const owned = (w, p, kind) =>
        p.inventory
            .map((id) => w.items[id])
            .find(
                (item) => item?.kind === kind && (item.charges === undefined || item.charges > 0)
            );
    function usableWeapon(w, p, data) {
        const item = w.items[p.equipped];
        if (item && !data.items[item.kind]) data = definitions(w.config, data);
        if (!item || item.owner !== p.id || data.items[item.kind].type !== 'weapon') return null;
        return !data.items[item.kind].ammo || owned(w, p, data.items[item.kind].ammo) ? item : null;
    }
    function snapshot(w) {
        const { history, initial, ...state } = w;
        return clone(state);
    }
    function connected(regions, openOnly = false, excluded = null) {
        const allowed = regions.filter((r) => r.id !== excluded && (!openOnly || !r.closed));
        if (!allowed.length) return true;
        const ids = new Set(allowed.map((r) => r.id)),
            seen = new Set([allowed[0].id]),
            queue = [allowed[0].id];
        while (queue.length) {
            const next = queue.shift();
            for (const id of regions.find((r) => r.id === next).links)
                if (ids.has(id) && !seen.has(id)) {
                    seen.add(id);
                    queue.push(id);
                }
        }
        return seen.size === allowed.length;
    }
    function mapFor(arenaId, topology = 'biome', data) {
        const arena = data.arenas.find((a) => a.id === arenaId);
        if (!arena) throw Error('Arena desconhecida.');
        const n = arena.regions.length,
            edges = [],
            positions = [];
        if (topology === 'biome') {
            edges.push(...arena.edges);
            positions.push(...arena.positions);
        } else if (topology === 'ring') {
            positions.push([50, 50]);
            for (let i = 1; i < n; i++) {
                positions.push([
                    50 + 35 * Math.cos(((i - 1) * 2 * Math.PI) / (n - 1)),
                    50 + 35 * Math.sin(((i - 1) * 2 * Math.PI) / (n - 1))
                ]);
                edges.push([i, i === n - 1 ? 1 : i + 1]);
            }
            edges.push([0, 1], [0, Math.ceil((n - 1) / 2)]);
        } else if (topology === 'grid') {
            const cols = Math.ceil(Math.sqrt(n)),
                rows = Math.ceil(n / cols);
            for (let i = 0; i < n; i++) {
                positions.push([
                    15 + ((i % cols) * 70) / (cols - 1),
                    15 + (Math.floor(i / cols) * 70) / (rows - 1)
                ]);
                if (i % cols < cols - 1 && i + 1 < n) edges.push([i, i + 1]);
                if (i + cols < n) edges.push([i, i + cols]);
            }
        } else {
            for (let i = 0; i < n; i++) {
                const depth = Math.floor(Math.log2(i + 1)),
                    start = 2 ** depth - 1,
                    index = i - start;
                positions.push([12 + ((index + 0.5) * 76) / 2 ** depth, 12 + depth * 24]);
                if (i) edges.push([Math.floor((i - 1) / 2), i]);
            }
        }
        return arena.regions.map((name, i) => ({
            id: `r${i}`,
            name,
            x: positions[i][0],
            y: positions[i][1],
            closed: false,
            links: [
                ...new Set(
                    edges.filter((e) => e.includes(i)).map((e) => `r${e[0] === i ? e[1] : e[0]}`)
                )
            ],
            waterSource: arena.springs.includes(i),
            foodSource: arena.forage.includes(i),
            risk: arena.risks[i] || 1,
            environment: null,
            shelter: i > 0 && i % 3 === 0 ? 2 : 0,
            rough: 0,
            materialStock: i === 0 ? 0 : 3,
            waterStock: arena.springs.includes(i) ? 3 : 0,
            foodStock: arena.forage.includes(i) ? 3 : 0
        }));
    }
    function invariant(w, data) {
        data = definitions(w?.config || {}, data);
        if (
            !w ||
            w.version !== version ||
            w.dataVersion !== data.version ||
            !Array.isArray(w.players) ||
            w.players.length < 2 ||
            w.players.length > maxPlayers
        )
            throw Error('Estado de simulação incompatível.');
        if (
            !integer(w.randomCalls, 0, 200000) ||
            !integer(w.day, 0, 32) ||
            !['opening', 'day', 'night'].includes(w.period) ||
            !integer(w.itemCounter, 0, 3000)
        )
            throw Error('Relógio ou gerador inválido.');
        if (
            !Array.isArray(w.regions) ||
            w.regions.length < 7 ||
            w.regions.length > 16 ||
            new Set(w.regions.map((r) => r.id)).size !== w.regions.length ||
            !connected(w.regions)
        )
            throw Error('Mapa inválido.');
        for (const r of w.regions)
            if (
                !Array.isArray(r.links) ||
                new Set(r.links).size !== r.links.length ||
                r.links.some((id) => id === r.id || !region(w, id)?.links.includes(r.id)) ||
                typeof r.closed !== 'boolean' ||
                !integer(r.risk, 1, 3) ||
                !integer(r.waterStock, 0, 6) ||
                !integer(r.foodStock, 0, 6) ||
                (r.environment !== null &&
                    (!['poison', 'fire', 'storm', 'flood', 'blackout', 'quake', 'landslide', 'lightning', 'horde'].includes(
                        r.environment.kind
                    ) ||
                        !integer(r.environment.remaining, 1, 3) ||
                        !integer(r.environment.intensity, 1, 3)))
            )
                throw Error('Conexões inválidas.');
        const ids = new Set(),
            seenItems = new Set();
        for (const p of w.players) {
            if (
                !safeId(p.id) ||
                ids.has(p.id) ||
                !text(p.name, 60) ||
                !Array.isArray(p.inventory) ||
                !Array.isArray(p.allies)
            )
                throw Error('Participante inválido.');
            if (!integer(p.district, 1, 12) || !profiles.includes(p.behavior) ||
                !p.traits || !['courage', 'loyalty', 'opportunism', 'exploration'].every(k => integer(p.traits[k], 1, 10)) ||
                !Array.isArray(p.visited) || p.visited.some(id => !region(w, id)))
                throw Error('Personalidade ou distrito inválido.');
            ids.add(p.id);
            for (const key of ['health', 'energy', 'hunger', 'thirst'])
                if (!integer(p[key], 0, 100)) throw Error('Estado físico fora dos limites.');
            if (
                !integer(p.kills, 0, maxPlayers - 1) ||
                !integer(p.bleeding, 0, 4) ||
                !integer(p.morale, 0, 100) ||
                !integer(p.hidden, 0, 3) ||
                !integer(p.poisoned, 0, 3) ||
                !Array.isArray(p.effects) ||
                p.effects.length > 6 ||
                p.effects.some(
                    (e) =>
                        !Object.hasOwn(data.attributes, e.attribute) ||
                        !integer(e.amount, -3, 3) ||
                        !integer(e.remaining, 1, 6) ||
                        !text(e.name, 60)
                ) ||
                !Object.keys(data.attributes).every((k) => integer(p.attributes[k], 1, 10))
            )
                throw Error('Atributos inválidos.');
            if (
                !region(w, p.location) ||
                !['alive', 'dead'].includes(p.status) ||
                (p.status === 'dead') !== (p.health === 0)
            )
                throw Error('Localização ou condição de vida inválida.');
            if (
                p.status === 'dead' &&
                (!p.death || p.allies.length || p.inventory.length || p.equipped)
            )
                throw Error('Eliminação incompleta.');
            for (const id of p.inventory) {
                const item = w.items[id];
                if (!item || item.owner !== p.id || seenItems.has(id))
                    throw Error('Item duplicado ou sem proprietário.');
                seenItems.add(id);
            }
            if (
                p.equipped &&
                (!p.inventory.includes(p.equipped) ||
                    data.items[w.items[p.equipped]?.kind]?.type !== 'weapon')
            )
                throw Error('Arma equipada inválida.');
            if (new Set(p.allies).size !== p.allies.length || p.allies.includes(p.id))
                throw Error('Aliança inválida.');
            for (const id of p.allies) {
                const other = player(w, id);
                if (
                    !other ||
                    other.status !== 'alive' ||
                    p.status !== 'alive' ||
                    !other.allies.includes(p.id)
                )
                    throw Error('Aliança assimétrica.');
            }
        }
        if (!w.traps || !integer(w.trapCounter, 0, 3000)) throw Error('Armadilhas inválidas.');
        for (const [id, t] of Object.entries(w.traps))
            if (
                t.id !== id ||
                !ids.has(t.owner) ||
                !region(w, t.region) ||
                typeof t.active !== 'boolean' ||
                !integer(t.power, 1, 60)
            )
                throw Error('Armadilha sem origem válida.');
        for (const [id, item] of Object.entries(w.items)) {
            if (!safeId(id) || item.id !== id || !Object.hasOwn(data.items, item.kind))
                throw Error('Item desconhecido.');
            if (!item.origin || !region(w, item.origin.region) || !text(item.origin.method, 60))
                throw Error('Item sem origem na arena.');
            if (item.origin.inputs && (!Array.isArray(item.origin.inputs) || item.origin.inputs.some(id => !w.items[id] || id === item.id)))
                throw Error('Material de fabricação inexistente.');
            if (item.charges !== undefined && !integer(item.charges, 0, 8))
                throw Error('Quantidade inválida.');
            if (item.owner !== 'spent' && !ids.has(item.owner) && !region(w, item.owner))
                throw Error('Proprietário inexistente.');
            if (ids.has(item.owner) && !seenItems.has(id)) throw Error('Inventário incompleto.');
            if (item.owner === 'spent' && item.charges !== 0) throw Error('Consumo inválido.');
        }
        if (
            !Array.isArray(w.queue) ||
            new Set(w.queue).size !== w.queue.length ||
            w.queue.some((id) => !ids.has(id))
        )
            throw Error('Fila inválida.');
        if (
            !Array.isArray(w.eliminations) ||
            new Set(w.eliminations).size !== w.eliminations.length ||
            w.eliminations.length !== w.players.filter((p) => p.status === 'dead').length ||
            w.eliminations.some((id) => player(w, id)?.status !== 'dead')
        )
            throw Error('Classificação inválida.');
        if (w.finished && (living(w).length > 1 || w.winner !== (living(w)[0]?.id || null)))
            throw Error('Vencedor inválido.');
        return true;
    }
    function randomFor(w) {
        let state = 2166136261;
        for (const char of w.config.seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
        state += w.randomCalls * 0x6d2b79f5;
        const rng = {
            float() {
                state += 0x6d2b79f5;
                let n = state;
                n = Math.imul(n ^ (n >>> 15), n | 1);
                n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
                return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
            }
        };
        const r = {
            float() {
                w.randomCalls++;
                return rng.float();
            },
            int(lo, hi) {
                return lo + Math.floor(r.float() * (hi - lo + 1));
            },
            pick(list) {
                return list.length ? list[r.int(0, list.length - 1)] : null;
            },
            shuffle(list) {
                const out = [...list];
                for (let i = out.length - 1; i > 0; i--) {
                    const j = r.int(0, i);
                    [out[i], out[j]] = [out[j], out[i]];
                }
                return out;
            }
        };
        return r;
    }
    function give(w, kind, owner, data, origin = null) {
        if (!region(w, owner) && !origin) throw Error('Recurso precisa ter origem na arena.');
        const id = `item-${++w.itemCounter}`;
        w.items[id] = {
            id,
            kind,
            owner,
            origin: origin || { region: owner, method: 'depósito da arena', day: w.day },
            ...(data.items[kind].charges ? { charges: data.items[kind].charges } : {})
        };
        if (player(w, owner)) player(w, owner).inventory.push(id);
        return w.items[id];
    }
    function transfer(w, item, to) {
        const from = player(w, item.owner);
        if (from) {
            from.inventory = from.inventory.filter((id) => id !== item.id);
            if (from.equipped === item.id) from.equipped = null;
        }
        item.owner = to;
        const p = player(w, to);
        if (p) p.inventory.push(item.id);
    }
    function consume(w, p, item) {
        item.charges--;
        if (!item.charges) transfer(w, item, 'spent');
    }
    function relation(a, b, allied) {
        a.allies = a.allies.filter((id) => id !== b.id);
        b.allies = b.allies.filter((id) => id !== a.id);
        if (allied) {
            a.allies.push(b.id);
            b.allies.push(a.id);
        }
    }
    function damage(w, p, amount, cause) {
        p.health = clamp(p.health - Math.round(amount));
        if (p.health > 0 || p.status === 'dead') return;
        p.status = 'dead';
        p.death = { ...cause, day: w.day, period: w.period, region: p.location };
        w.eliminations.push(p.id);
        for (const id of [...p.allies]) relation(p, player(w, id), false);
        for (const id of [...p.inventory]) transfer(w, w.items[id], p.location);
        p.equipped = null;
        p.bleeding = 0;
        p.hidden = 0;
        p.poisoned = 0;
        if (cause.killer && player(w, cause.killer) && cause.killer !== p.id)
            player(w, cause.killer).kills++;
    }
    function equip(w, p, data) {
        const weapons = p.inventory
            .map((id) => w.items[id])
            .filter((i) => data.items[i.kind].type === 'weapon');
        const ready = (item) =>
            !data.items[item.kind].ammo || !!owned(w, p, data.items[item.kind].ammo);
        weapons.sort(
            (a, b) =>
                Number(ready(b)) - Number(ready(a)) ||
                data.items[b.kind].power - data.items[a.kind].power
        );
        p.equipped = weapons[0]?.id || null;
    }
    const pairs = (w, a) => living(w).filter((b) => b.id !== a.id && b.location === a.location);
    const hostile = (w, a) => pairs(w, a).filter((b) => !a.allies.includes(b.id));
    const ally = (w, a) => pairs(w, a).filter((b) => a.allies.includes(b.id));
    const need = (p, kind) => kind === 'water' ? p.thirst : kind === 'food' ? p.hunger : 100 - p.health + (p.bleeding || p.poisoned ? 25 : 0);
    const shareable = (w, a, b) => a.inventory.map(id => w.items[id]).filter(i =>
        ['food', 'water', 'med'].includes(i.kind) && !owned(w, b, i.kind) &&
        need(b, i.kind) > 25 && (need(b, i.kind) > need(a, i.kind) + 10 ||
            a.inventory.filter(id => w.items[id].kind === i.kind).length > 1));
    function tradePair(w, a, b) {
        const offer = a.inventory.map(id => w.items[id]).find(i => ['food', 'water', 'med'].includes(i.kind) && need(b, i.kind) > need(a, i.kind) + 15 && !owned(w, b, i.kind));
        const receive = b.inventory.map(id => w.items[id]).find(i => ['food', 'water', 'med'].includes(i.kind) && need(a, i.kind) > need(b, i.kind) + 15 && !owned(w, a, i.kind));
        return offer && receive ? [offer, receive] : null;
    }
    const foodMethods = {
        forest: 'Recolheu frutos maduros entre as folhas.', desert: 'Colheu frutos resistentes à seca perto do oásis.',
        arctic: 'Recuperou provisões no depósito protegido do gelo.', city: 'Vasculhou as prateleiras de um armazém abandonado.',
        islands: 'Recolheu mariscos entre as pedras da margem.', volcano: 'Colheu raízes na encosta livre das cinzas.'
    };
    function attributes(p) {
        const values = { ...p.attributes };
        for (const e of p.effects || []) values[e.attribute] += e.amount;
        for (const k of Object.keys(values)) values[k] = clamp(values[k], 1, 10);
        return values;
    }
    function effect(p, attribute, amount, remaining, name) {
        p.effects = p.effects.filter((e) => e.attribute !== attribute);
        p.effects.push({ attribute, amount, remaining, name });
    }
    function formGroup(w, a, b) {
        const members = new Set([a.id, b.id]),
            pending = [a, b];
        while (pending.length) {
            for (const id of pending.shift().allies) {
                if (!members.has(id) && player(w, id).status === 'alive') {
                    members.add(id);
                    pending.push(player(w, id));
                }
            }
        }
        const group = [...members].map((id) => player(w, id));
        for (let i = 0; i < group.length; i++)
            for (let j = i + 1; j < group.length; j++) {
                const already = group[i].allies.includes(group[j].id);
                relation(group[i], group[j], true);
                if (!already) trust(group[i], group[j], group[i].district === group[j].district ? 12 : 5);
            }
        return group.filter(p => p.location === a.location).map((p) => p.id);
    }
    function trust(a, b, amount) {
        a.trust[b.id] = clamp((a.trust[b.id] || 0) + amount, -50, 100);
        b.trust[a.id] = clamp((b.trust[a.id] || 0) + amount, -50, 100);
    }
    const readyGroup = (w, a) => [a, ...ally(w, a).filter((p) => w.queue.includes(p.id) && p.health > 25 && p.energy > 15 &&
        (p.trust[a.id] || 0) + p.traits.loyalty * 4 >= 20)];
    function escapeRoutes(w, from) {
        // A closed sector can require crossing another closed sector. Never strand NPCs in a leaf.
        const distance = {},
            pending = w.regions.filter((g) => !g.closed).map((g) => g.id);
        for (const id of pending) distance[id] = 0;
        while (pending.length) {
            const id = pending.shift();
            for (const link of region(w, id).links)
                if (distance[link] === undefined) {
                    distance[link] = distance[id] + 1;
                    pending.push(link);
                }
        }
        const neighbors = from.links.map((id) => region(w, id));
        const closest = Math.min(...neighbors.map((g) => distance[g.id] ?? Infinity));
        return neighbors.filter((g) => distance[g.id] === closest);
    }
    function canTravel(w, a) {
        return region(w, a.location).closed || region(w, a.location).links.some(id => !region(w, id).closed);
    }
    function paths(w, from) {
        const routes = { [from]: [] }, pending = [from];
        while (pending.length) {
            const id = pending.shift();
            for (const next of region(w, id).links) {
                if (routes[next] || region(w, next).closed) continue;
                routes[next] = [...routes[id], next];
                pending.push(next);
            }
        }
        return routes;
    }
    function destinationScore(w, a, g, distance = 0) {
        const enemies = living(w).filter(p => p.id !== a.id && !a.allies.includes(p.id) && p.location === g.id).length;
        const friends = ally(w, { ...a, location: g.id }).length;
        const loot = Object.values(w.items).filter(i => i.owner === g.id);
        const waterNeed = !owned(w, a, 'water') ? 6 + a.thirst / 3 : a.thirst / 10;
        const foodNeed = !owned(w, a, 'food') ? 5 + a.hunger / 4 : a.hunger / 12;
        const danger = g.environment ? 45 : 0;
        return (g.waterStock ? waterNeed : 0) + (g.foodStock ? foodNeed : 0) +
            loot.reduce((n, i) => n + (['food', 'water'].includes(i.kind) ? 1 :
                !a.equipped && w.config.weapons.includes(i.kind) ? 5 : 0.8), 0) +
            (!a.equipped ? g.materialStock * 2 : 0) +
            (a.health < 55 || a.energy < 35 ? g.shelter * 5 : g.shelter) +
            friends * (a.traits.loyalty / 2) +
            enemies * (a.health < 40 || a.behavior === 'cautious' ? -9 : a.behavior === 'aggressive' ? 4 : -4) -
            danger - distance * 3 - (a.visited.includes(g.id) ? 4 : -a.traits.exploration) -
            (a.previousLocation === g.id ? 12 : 0);
    }
    function travel(w, a, r, d, exploring = false) {
        const from = region(w, a.location),
            group = [a];
        let to;
        if (from.closed) to = r.pick(escapeRoutes(w, from));
        else {
            const routes = paths(w, from.id);
            const targets = w.regions.filter(g => g.id !== from.id && routes[g.id]?.length);
            const ranked = targets.map(g => ({ g, score: destinationScore(w, a, g, routes[g.id].length) + r.float() * 5 }))
                .sort((x, y) => y.score - x.score);
            const planned = region(w, a.exploreTarget);
            const best = ranked[0];
            const target = planned && routes[planned.id]?.length && !planned.environment &&
                destinationScore(w, a, planned, routes[planned.id].length) >= best.score - 12 ? planned : best.g;
            a.exploreTarget = target.id;
            to = region(w, routes[target.id][0]);
        }
        const participants = [],
            checks = [],
            moved = [],
            details = [];
        for (const member of group) {
            participants.push(member.id);
            if (member.id !== a.id) {
                w.queue = w.queue.filter((id) => id !== member.id);
                const exposure = maintenance(w, member, r, d);
                if (exposure?.extra) details.push(exposure.extra);
                checks.push(...(exposure?.checks || []));
                if (exposure?.interrupted) continue;
            }
            if (member.status !== 'alive' || member.location !== from.id) continue;
            member.location = to.id;
            member.previousLocation = from.id;
            if (!member.visited.includes(to.id)) member.visited.push(to.id);
            if (member.exploreTarget === to.id) member.exploreTarget = null;
            moved.push(member.name);
            member.energy = clamp(
                member.energy -
                    Math.max(1, w.arena.moveCost + 4 + to.rough - Math.floor(attributes(member).agility / 3))
            );
            const encounter = trapEncounter(w, member, r, d);
            if (encounter?.extra) details.push(encounter.extra);
            checks.push(...(encounter?.checks || []));
        }
        return {
            from: from.name,
            r: to.name,
            participants,
            checks,
            extra: `${a.allies.length && ally(w, { ...a, location: from.id }).length ? ` Os companheiros continuaram em ${from.name}; o acordo entre eles permaneceu de pé.` : ''}${details.join('')}`
        };
    }
    function groupAttack(w, a, b, r, d, unarmed, mode = 'combat') {
        const group = readyGroup(w, a),
            participants = [a.id, b.id],
            checks = [],
            attackers = [],
            details = [];
        let first;
        for (const member of group) {
            const target =
                b.status === 'alive' && !member.allies.includes(b.id) ? b : hostile(w, member)[0];
            if (!target || member.status !== 'alive' || member.location !== a.location) continue;
            if (member.id !== a.id) {
                w.queue = w.queue.filter((id) => id !== member.id);
                participants.push(member.id);
                const exposure = maintenance(w, member, r, d);
                checks.push(...(exposure?.checks || []));
                if (exposure?.extra) details.push(exposure.extra);
                if (
                    member.status !== 'alive' ||
                    member.location !== target.location ||
                    exposure?.interrupted
                )
                    continue;
            }
            if (!participants.includes(target.id)) participants.push(target.id);
            const hit = combat(
                w,
                member,
                target,
                r,
                d,
                member.id === a.id ? unarmed : !usableWeapon(w, member, d),
                member.id === a.id || (mode === 'ambush' && member.hidden) ? mode : 'combat'
            );
            attackers.push(member.id);
            for (const id of hit.participants || []) if (!participants.includes(id)) participants.push(id);
            first ||= hit;
            checks.push(...hit.checks);
            details.push(
                `${member.id === a.id ? '' : ` ${member.name} apoiou o ataque contra ${target.name}.`}${hit.extra || ''}`
            );
        }
        return {
            ...first,
            participants,
            checks,
            extra: `${attackers.length > 1 ? ' Os companheiros se aproximaram pelos flancos para amparar o ataque.' : ''}${details.join('')}`
        };
    }
    const environmentNames = {
        poison: 'nuvem de veneno',
        fire: 'incêndio',
        storm: 'tempestade de destroços',
        flood: 'inundação',
        blackout: 'apagão e neblina',
        quake: 'terremoto',
        landslide: 'deslizamento',
        lightning: 'tempestade de relâmpagos',
        horde: 'horda de criaturas'
    };
    function exposure(w, a, r, d) {
        const g = region(w, a.location),
            hazard = g.environment;
        if (!hazard) return null;
        const stat = attributes(a),
            tool = (owned(w, a, 'tool') ? 8 : 0) + g.shelter * 5;
        const check = roll(
            `Escapar de ${environmentNames[hazard.kind]}: agilidade + percepção`,
            a,
            null,
            stat.agility * 3 + stat.perception * 2 + tool,
            32 + hazard.intensity * 7 + g.risk * 2,
            r
        );
        let exits = g.links.map((id) => region(w, id)).filter((v) => !v.closed && !v.environment);
        if (!exits.length && g.closed) exits = escapeRoutes(w, g).filter((v) => !v.environment);
        if (check.success && exits.length) {
            const dest = r.pick(exits);
            a.location = dest.id;
            a.previousLocation = g.id;
            if (!a.visited.includes(dest.id)) a.visited.push(dest.id);
            a.exploreTarget = null;
            a.energy = clamp(a.energy - 7);
            const trap = trapEncounter(w, a, r, d);
            return {
                interrupted: true,
                checks: [check, ...(trap?.checks || [])],
                extra: ` ${a.name} escapou de ${environmentNames[hazard.kind]}, tomando a passagem até ${dest.name}.${trap?.extra || ''}`
            };
        }
        const loss =
            hazard.kind === 'blackout'
                ? 0
                : check.success
                  ? 3
                  : Math.max(2, r.int(5, 12) + hazard.intensity * 3 - Math.floor(stat.endurance / 2) - g.shelter * 3);
        damage(w, a, loss, { kind: 'environment', reason: environmentNames[hazard.kind] });
        if (a.status === 'alive')
            effect(
                a,
                hazard.kind === 'poison' ? 'endurance' : 'perception',
                -2,
                2,
                environmentNames[hazard.kind]
            );
        return {
            interrupted: true,
            checks: [check],
            extra: ` ${a.name} ${check.success || g.shelter ? 'se encolheu atrás de uma cobertura' : 'foi alcançado antes de encontrar abrigo'} em ${g.name}. ${loss ? 'O perigo deixou marcas e tornou os próximos passos mais difíceis.' : 'Saiu ileso, mas precisou esperar o perigo passar.'}`
        };
    }
    function environmentPeriod(w, r) {
        const texts = [];
        for (const p of living(w))
            p.effects = p.effects
                .map((e) => ({ ...e, remaining: e.remaining - 1 }))
                .filter((e) => e.remaining > 0);
        const spreading = [];
        for (const g of w.regions) {
            if (g.environment?.kind === 'fire' && g.environment.remaining > 1 && r.float() < 0.22) {
                const next = r.pick(g.links.map(id => region(w, id)).filter(v => !v.closed && !v.environment));
                if (next) spreading.push(next);
            }
            if (g.environment && --g.environment.remaining === 0) {
                texts.push(` ${environmentNames[g.environment.kind]} dissipou-se em ${g.name}.`);
                g.environment = null;
                g.rough = 0;
            }
            if (w.period === 'day' && !g.environment && !g.closed) {
                if (g.waterSource) g.waterStock = Math.min(6, g.waterStock + 1);
                if (g.foodSource && w.day % 2 === 0) g.foodStock = Math.min(6, g.foodStock + 1);
            }
        }
        for (const next of spreading.slice(0, 1)) {
            next.environment = { kind: 'fire', remaining: 2, intensity: 1 };
            next.foodStock = Math.max(0, next.foodStock - 2);
            next.shelter = Math.max(0, next.shelter - 1);
            texts.push(` O vento levou as chamas até ${next.name}.`);
        }
        if (w.day > 1 && r.float() < { low: 0.16, normal: 0.34, high: 0.55 }[w.config.incidents]) {
            const candidates = w.regions.filter((g) => !g.closed && !g.environment);
            if (candidates.length) {
                const g = weighted(
                    r,
                    candidates.map((v) => ({
                        value: v,
                        weight: v.risk + (living(w).some((p) => p.location === v.id) ? 2 : 0)
                    }))
                );
                const biome = {
                    forest: 'fire',
                    desert: 'storm',
                    arctic: 'storm',
                    city: 'blackout',
                    islands: 'flood',
                    volcano: 'fire'
                }[w.arena.id];
                const kind = r.pick(['poison', biome, biome, 'quake', 'landslide', 'lightning', 'horde']);
                g.environment = {
                    kind,
                    remaining: r.int(1, 3),
                    intensity: { low: 1, normal: 2, high: 3 }[w.config.hazards]
                };
                if (['poison', 'fire', 'flood', 'horde'].includes(kind)) {
                    g.waterStock = Math.max(0, g.waterStock - 1);
                    g.foodStock = Math.max(0, g.foodStock - 2);
                }
                if (['fire', 'quake', 'landslide', 'flood'].includes(kind)) g.shelter = Math.max(0, g.shelter - 1);
                if (['quake', 'landslide', 'flood'].includes(kind)) g.rough = 4;
                if (['quake', 'landslide'].includes(kind)) g.materialStock = Math.min(6, g.materialStock + 2);
                texts.push(
                    ` ${environmentNames[kind][0].toUpperCase() + environmentNames[kind].slice(1)} atingiu ${g.name}. ${['quake', 'landslide', 'flood'].includes(kind) ? 'As passagens ficaram difíceis de atravessar.' : kind === 'horde' ? 'As criaturas disputam comida e expulsam quem se aproxima.' : 'Quem estiver por perto precisará encontrar cobertura ou fugir.'}`
                );
            }
        }
        return texts.join('');
    }
    function dangerName(id) {
        return {
            forest: 'animais entre a vegetação',
            desert: 'uma tempestade de areia',
            arctic: 'uma rajada de frio intenso',
            city: 'destroços instáveis',
            islands: 'uma maré violenta',
            volcano: 'gases e pedras incandescentes'
        }[id];
    }
    function roll(label, a, b, attack, defense, r) {
        const chance = clamp(Math.round(55 + attack - defense), 8, 92),
            dice = r.int(1, 100);
        return {
            label,
            actor: a.id,
            target: b?.id || null,
            attack: Math.round(attack),
            defense: Math.round(defense),
            chance,
            dice,
            success: dice <= chance
        };
    }
    function weighted(r, choices) {
        let n = r.float() * choices.reduce((s, c) => s + c.weight, 0);
        for (const c of choices) {
            n -= c.weight;
            if (n < 0) return c.value;
        }
        return choices.at(-1)?.value;
    }
    function trapEncounter(w, a, r, d) {
        const trap = Object.values(w.traps).find(
            (t) =>
                t.active &&
                t.region === a.location &&
                t.owner !== a.id &&
                !a.allies.includes(t.owner)
        );
        if (!trap) return { extra: '', checks: [] };
        const owner = player(w, trap.owner),
            check = roll(
                'Percepção: detectar armadilha',
                a,
                owner,
                attributes(a).perception * 3 + attributes(a).agility,
                trap.power * 2,
                r
            );
        trap.active = false;
        if (check.success)
            return {
                extra: ` ${a.name} percebeu e desmontou uma armadilha de ${owner.name}.`,
                checks: [check]
            };
        const loss = clamp(18 + trap.power - attributes(a).endurance, 8, 42);
        damage(w, a, loss, {
            kind: 'trap',
            killer: owner.id,
            reason: `armadilha de ${owner.name}`
        });
        return {
            extra: ` ${a.name} caiu na armadilha de ${owner.name} e perdeu ${loss} de saúde.`,
            checks: [check]
        };
    }
    const rules = {
        search: {
            can: (w, a) =>
                a.energy >= 8 && Object.values(w.items).some((i) => i.owner === a.location),
            run(w, a, b, r, d) {
                a.energy = clamp(a.energy - 6);
                const loot = Object.values(w.items).filter((i) => i.owner === a.location);
                if (
                    loot.length &&
                    r.float() <
                        0.42 + attributes(a).perception * 0.035 + attributes(a).cunning * 0.015
                ) {
                    const item = r.pick(loot);
                    transfer(w, item, a.id);
                    equip(w, a, d);
                    return { item: d.items[item.kind].name };
                }
                return { failed: true };
            }
        },
        move: {
            can: canTravel,
            run: (w, a, b, r, d) => travel(w, a, r, d)
        },
        rest: {
            can: () => true,
            run(w, a) {
                a.energy = clamp(a.energy + 14 + attributes(a).endurance);
                a.morale = clamp(a.morale + 8);
                return {};
            }
        },
        drink: {
            can: (w, a) => a.thirst >= 15 && owned(w, a, 'water'),
            run(w, a) {
                consume(w, a, owned(w, a, 'water'));
                a.thirst = clamp(a.thirst - 55);
                return {};
            }
        },
        eat: {
            can: (w, a) => a.hunger >= 15 && owned(w, a, 'food'),
            run(w, a) {
                consume(w, a, owned(w, a, 'food'));
                a.hunger = clamp(a.hunger - 48);
                a.energy = clamp(a.energy + 5);
                return {};
            }
        },
        heal: {
            can: (w, a) => (a.health < 88 || a.poisoned || a.bleeding) && owned(w, a, 'med'),
            run(w, a) {
                consume(w, a, owned(w, a, 'med'));
                a.health = clamp(a.health + 14 + attributes(a).cunning);
                a.bleeding = 0;
                a.woundBy = null;
                a.poisoned = 0;
                a.poisonBy = null;
                return {};
            }
        },
        alliance: {
            can: (w, a) => (w.config.alliances ? hostile(w, a) : []),
            run(w, a, b, r) {
                const doubts = [...b.allies].map(id => player(w, id).trust[a.id] || 0);
                const chance = clamp(0.25 + (attributes(a).social + attributes(b).social) / 40 +
                    (a.district === b.district ? 0.12 : 0) + (b.trust[a.id] || 0) / 200 +
                    (b.behavior === 'diplomat' ? 0.08 : b.behavior === 'aggressive' ? -0.08 : 0) +
                    (doubts.length ? Math.min(...doubts) / 250 : 0), 0.08, 0.9);
                const combined = new Set([a.id, b.id, ...a.allies, ...b.allies]).size;
                if (r.float() < chance * (combined > Math.max(3, living(w).length * 0.6) ? 0.35 : 1)) {
                    return { participants: formGroup(w, a, b) };
                }
                return { extra: ` ${b.name} preferiu manter distância.`, failed: true };
            }
        },
        share: {
            can: (w, a) => ally(w, a).filter(b => shareable(w, a, b).length),
            run(w, a, b, r, d) {
                const item = shareable(w, a, b).sort((x, y) => need(b, y.kind) - need(b, x.kind))[0];
                transfer(w, item, b.id);
                trust(a, b, 8);
                return { item: d.items[item.kind].name };
            }
        },
        break: {
            can: (w, a) => living(w).filter(p => a.allies.includes(p.id)),
            run(w, a, b) {
                for (const id of [...a.allies]) relation(a, player(w, id), false);
                trust(a, b, -20);
                return { participants: [a.id], extra: ' Abandonou o grupo e passou a agir por conta própria.' };
            }
        },
        combat: {
            can: (w, a, d) => (usableWeapon(w, a, d) ? hostile(w, a) : []),
            run: (w, a, b, r, d) => groupAttack(w, a, b, r, d, false)
        },
        scuffle: {
            can: (w, a, d) => (!usableWeapon(w, a, d) ? hostile(w, a) : []),
            run: (w, a, b, r, d) => groupAttack(w, a, b, r, d, true)
        },
        betray: {
            can: (w, a) => ally(w, a),
            run(w, a, b, r, d) {
                for (const id of [...a.allies]) relation(a, player(w, id), false);
                trust(a, b, -50);
                return combat(w, a, b, r, d, !usableWeapon(w, a, d), 'betray');
            }
        },
        weather: {
            can: () => true,
            run(w, a, b, r) {
                const protection = owned(w, a, 'tool') ? 5 : 0;
                const check = roll(
                    'Resistência: perigo ambiental',
                    a,
                    null,
                    attributes(a).endurance * 3 + attributes(a).perception + protection,
                    w.arena.hazard * 3 + 8,
                    r
                );
                const loss = check.success
                    ? 0
                    : Math.max(
                          1,
                          r.int(3, 9) +
                              Math.floor(w.arena.hazard / 2) -
                              Math.floor(attributes(a).endurance / 3) -
                              protection
                      );
                damage(w, a, loss, { kind: 'environment', reason: dangerName(w.arena.id) });
                return {
                    danger: dangerName(w.arena.id),
                    extra: loss ? ` Saúde −${loss}.` : ' A proteção e o reflexo evitaram dano.',
                    checks: [check]
                };
            }
        },
        humor: {
            can: (w) => w.config.humor,
            run(w, a) {
                a.energy = clamp(a.energy + 3);
                return {};
            }
        }
    };
    Object.assign(rules, {
        salvage: {
            can: (w, a) => !region(w, a.location).environment && region(w, a.location).materialStock > 0 && a.energy > 8,
            run(w, a, b, r, d) {
                const g = region(w, a.location);
                g.materialStock--;
                a.energy = clamp(a.energy - 5);
                give(w, 'material', a.id, d, { region: g.id, method: 'materiais recolhidos no campo', day: w.day });
                return { extra: w.arena.id === 'city' ? ' Separou tecido e sucata aproveitável dos destroços.' : ' Separou fibras e galhos firmes do chão.' };
            }
        },
        craft: {
            can: (w, a) => owned(w, a, 'material') && a.energy > 10,
            run(w, a, b, r, d) {
                const ingredient = owned(w, a, 'material');
                const kind = !a.equipped && w.config.weapons.includes('spear') ? 'spear' : !owned(w, a, 'tool') ? 'tool' : 'rope';
                consume(w, a, ingredient);
                const item = give(w, kind, a.id, d, { region: a.location, method: 'fabricação', day: w.day, inputs: [ingredient.id] });
                a.energy = clamp(a.energy - 8);
                equip(w, a, d);
                return { item: d.items[item.kind].name };
            }
        },
        fish: {
            can: (w, a, d) => ['forest', 'islands'].includes(w.arena.id) && region(w, a.location).waterSource &&
                !region(w, a.location).environment && region(w, a.location).foodStock > 0 && (owned(w, a, 'rope') || usableWeapon(w, a, d)),
            run(w, a, b, r, d) {
                const check = roll('Pesca: percepção e agilidade', a, null, attributes(a).perception * 3 + attributes(a).agility, 25, r);
                a.energy = clamp(a.energy - 5);
                if (!check.success) return { failed: true, checks: [check] };
                const g = region(w, a.location);
                g.foodStock--;
                give(w, 'food', a.id, d, { region: g.id, method: 'pesca', day: w.day });
                return { checks: [check] };
            }
        },
        shelter: {
            can: (w, a) => region(w, a.location).shelter > 0 && a.energy < 75,
            run(w, a) {
                a.energy = clamp(a.energy + 22);
                a.health = clamp(a.health + 3);
                return {};
            }
        },
        trade: {
            can: (w, a) => a.inventory.length ? pairs(w, a).filter(b => b.inventory.length && tradePair(w, a, b)) : [],
            run(w, a, b, r, d) {
                const [offer, receive] = tradePair(w, a, b);
                const check = roll('Negociação: confiança e sociabilidade', a, b, attributes(a).social * 3 + (b.trust[a.id] || 0) / 3, 20 + b.traits.opportunism * 2, r);
                if (!check.success) return { failed: true, checks: [check] };
                transfer(w, offer, b.id);
                transfer(w, receive, a.id);
                trust(a, b, 6);
                equip(w, a, d); equip(w, b, d);
                return { item: d.items[receive.kind].name, offered: d.items[offer.kind].name, checks: [check] };
            }
        },
        flee: {
            can: (w, a) => hostile(w, a).length && canTravel(w, a),
            run(w, a, b, r, d) {
                const helper = readyGroup(w, a).slice(1).find(p => p.energy > 30);
                let extra = '', checks = [], participants = [a.id];
                if (helper) {
                    w.queue = w.queue.filter(id => id !== helper.id);
                    const upkeep = maintenance(w, helper, r, d);
                    checks.push(...(upkeep?.checks || []));
                    participants.push(helper.id);
                    if (!upkeep?.interrupted && helper.status === 'alive' && helper.location === a.location) {
                        helper.energy = clamp(helper.energy - 6);
                        extra = ` ${helper.name} distraiu os adversários enquanto ${a.name} procurava uma saída.`;
                        trust(a, helper, 8);
                    } else extra = upkeep?.extra || '';
                }
                const moved = travel(w, a, r, d, true);
                return { ...moved, participants, checks: [...checks, ...moved.checks], extra: extra + moved.extra };
            }
        },
        ambush: {
            can: (w, a, d) => (a.hidden > 0 && usableWeapon(w, a, d) ? hostile(w, a) : []),
            run: (w, a, b, r, d) => groupAttack(w, a, b, r, d, false, 'ambush')
        },
        duel: {
            can: (w, a, d) => (usableWeapon(w, a, d) && a.energy > 25 ? hostile(w, a) : []),
            run: (w, a, b, r, d) => combat(w, a, b, r, d, false, 'duel')
        },
        hide: {
            can: (w, a) => a.energy > 12 && a.hidden === 0,
            run(w, a) {
                a.hidden = 3;
                a.energy = clamp(a.energy - 5);
                return {
                    extra: ' A próxima emboscada terá vantagem, mas percepção alta pode denunciá-la.'
                };
            }
        },
        gather: {
            can: (w, a) =>
                !region(w, a.location).environment &&
                ((region(w, a.location).waterStock > 0 && (a.thirst > 25 || !owned(w, a, 'water'))) ||
                (region(w, a.location).foodStock > 0 && (a.hunger > 25 || !owned(w, a, 'food')))),
            run(w, a, b, r, d) {
                const g = region(w, a.location);
                const water = g.waterStock > 0 && (a.thirst > 25 || !owned(w, a, 'water')),
                    food = g.foodStock > 0 && (a.hunger > 25 || !owned(w, a, 'food'));
                if (water) {
                    if (a.thirst > 25) a.thirst = clamp(a.thirst - 45);
                    else give(w, 'water', a.id, d, { region: g.id, method: 'água da fonte', day: w.day });
                    g.waterStock--;
                }
                if (food) {
                    if (a.hunger > 25) a.hunger = clamp(a.hunger - 35);
                    else give(w, 'food', a.id, d, { region: g.id, method: 'coleta de alimento', day: w.day });
                    g.foodStock--;
                }
                a.energy = clamp(a.energy - 2);
                return {
                    extra: [
                        water ? ' A água da fonte trouxe algum alívio à caminhada.' : '',
                        food ? ` ${foodMethods[w.arena.id]}` : ''
                    ].join('')
                };
            }
        },
        trap: {
            can: (w, a) =>
                a.energy > 12 &&
                (owned(w, a, 'trapkit') || owned(w, a, 'rope')) &&
                Object.values(w.traps).filter((t) => t.active && t.region === a.location).length <
                    2,
            run(w, a, b, r) {
                consume(w, a, owned(w, a, 'trapkit') || owned(w, a, 'rope'));
                const id = `trap-${++w.trapCounter}`;
                w.traps[id] = {
                    id,
                    owner: a.id,
                    region: a.location,
                    power: 8 + attributes(a).cunning + attributes(a).perception,
                    active: true
                };
                a.energy = clamp(a.energy - 8);
                return {
                    extra: ' A cilada só atinge quem entrar nesta região; aliados identificados não a acionam.'
                };
            }
        },
        steal: {
            can: (w, a) => hostile(w, a).filter((b) => b.inventory.length),
            run(w, a, b, r, d) {
                const check = roll(
                    'Astúcia e agilidade: furto',
                    a,
                    b,
                    attributes(a).cunning * 2 + attributes(a).agility * 2,
                    attributes(b).perception * 3 + attributes(b).agility,
                    r
                );
                if (check.success) {
                    const i = r.pick(b.inventory.map((id) => w.items[id]));
                    transfer(w, i, a.id);
                    equip(w, a, d);
                    equip(w, b, d);
                    return { extra: ` Levou ${d.items[i.kind].name}.`, checks: [check] };
                }
                a.morale = clamp(a.morale - 5);
                return {
                    extra: ` ${b.name} percebeu a tentativa e protegeu o inventário.`,
                    checks: [check]
                };
            }
        },
        persuade: {
            can: (w, a) => (w.config.alliances ? hostile(w, a) : []),
            run(w, a, b, r) {
                const check = roll(
                    'Sociabilidade: persuadir',
                    a,
                    b,
                    attributes(a).social * 3 + attributes(a).cunning + (a.district === b.district ? 10 : 0) + (b.trust[a.id] || 0) / 4,
                    attributes(b).perception * 2 + attributes(b).cunning * 2 +
                        Math.max(0, new Set([a.id, b.id, ...a.allies, ...b.allies]).size - 3) * 12,
                    r
                );
                if (check.success) {
                    const participants = formGroup(w, a, b);
                    a.morale = clamp(a.morale + 10);
                    b.morale = clamp(b.morale + 10);
                    return {
                        participants,
                        extra: ` ${b.name} aceitou a proposta. Os dois estenderam o acordo aos companheiros, mesmo àqueles que exploravam outras trilhas.`,
                        checks: [check]
                    };
                }
                return {
                    extra: check.success
                        ? ` ${b.name} aceitou a proposta; formaram uma aliança.`
                        : ` ${b.name} desconfiou e recusou.`,
                    checks: [check]
                };
            }
        },
        intimidate: {
            can: (w, a) => hostile(w, a),
            run(w, a, b, r) {
                const check = roll(
                    'Força e presença: intimidar',
                    a,
                    b,
                    attributes(a).strength * 2 + attributes(a).social * 2,
                    attributes(b).endurance * 2 + attributes(b).social * 2,
                    r
                );
                if (check.success) b.morale = clamp(b.morale - 25);
                return {
                    extra: check.success
                        ? ` ${b.name} perdeu 25 de moral e tende a fugir ou descansar.`
                        : ` ${b.name} manteve a firmeza.`,
                    checks: [check]
                };
            }
        },
        poison: {
            can: (w, a) =>
                owned(w, a, 'poison')
                    ? hostile(w, a).filter((b) => owned(w, b, 'food') || owned(w, b, 'water'))
                    : [],
            run(w, a, b, r) {
                consume(w, a, owned(w, a, 'poison'));
                const check = roll(
                    'Astúcia: envenenar',
                    a,
                    b,
                    attributes(a).cunning * 4,
                    attributes(b).perception * 3 + attributes(b).endurance,
                    r
                );
                if (check.success) {
                    b.poisoned = 3;
                    b.poisonBy = a.id;
                }
                return {
                    extra: check.success
                        ? ` ${b.name} foi intoxicado; curativos podem neutralizar a toxina.`
                        : ` ${b.name} percebeu a adulteração e descartou a dose.`,
                    checks: [check]
                };
            }
        },
        sabotage: {
            can: (w, a) => (a.energy > 15 ? hostile(w, a).filter((b) => b.equipped) : []),
            run(w, a, b, r, d) {
                const check = roll(
                    'Astúcia: sabotar equipamento',
                    a,
                    b,
                    attributes(a).cunning * 3 + attributes(a).agility,
                    attributes(b).perception * 3 + attributes(b).agility,
                    r
                );
                a.energy = clamp(a.energy - 5);
                if (check.success) {
                    const item = w.items[b.equipped];
                    item.charges = 0;
                    transfer(w, item, 'spent');
                    equip(w, b, d);
                }
                return {
                    extra: check.success
                        ? ` A arma de ${b.name} ficou inutilizada.`
                        : ` ${b.name} protegeu o equipamento.`,
                    checks: [check]
                };
            }
        },
        rescue: {
            can: (w, a) =>
                owned(w, a, 'med')
                    ? ally(w, a).filter((b) => b.health < 75 || b.poisoned || b.bleeding)
                    : [],
            run(w, a, b) {
                consume(w, a, owned(w, a, 'med'));
                const amount = 12 + attributes(a).social;
                b.health = clamp(b.health + amount);
                b.bleeding = 0;
                b.poisoned = 0;
                b.woundBy = null;
                b.poisonBy = null;
                a.morale = clamp(a.morale + 6);
                trust(a, b, 12);
                return {
                    extra: ` ${b.name} recebeu curativos; recuperou até ${amount} de saúde.`,
                    medical: true
                };
            }
        },
        explore: {
            can: canTravel,
            run: (w, a, b, r, d) => travel(w, a, r, d, true)
        },
        boost: {
            can: (w, a) =>
                owned(w, a, 'adrenaline') && !a.effects.some((e) => e.name === 'adrenalina'),
            run(w, a) {
                consume(w, a, owned(w, a, 'adrenaline'));
                effect(a, 'agility', 3, 3, 'adrenalina');
                effect(a, 'perception', 2, 3, 'adrenalina');
                a.energy = clamp(a.energy + 18);
                return { extra: ' Agilidade +3 e percepção +2 por três períodos, limitadas a 10.' };
            }
        },
        antidote: {
            can: (w, a) =>
                owned(w, a, 'antidote') &&
                (a.poisoned || a.effects.some((e) => e.name === 'nuvem de veneno')),
            run(w, a) {
                consume(w, a, owned(w, a, 'antidote'));
                a.poisoned = 0;
                a.poisonBy = null;
                a.effects = a.effects.filter((e) => e.name !== 'nuvem de veneno');
                return {
                    extra: ' Intoxicação e penalidade da nuvem neutralizadas; a região continua perigosa.'
                };
            }
        },
        areaattack: {
            can: (w, a) =>
                a.inventory.some((id) => dArea(w.items[id]?.kind)) && hostile(w, a).length > 0,
            run(w, a, b, r, d) {
                const item = a.inventory
                    .map((id) => w.items[id])
                    .find((i) => d.items[i.kind].areaDamage);
                const def = d.items[item.kind],
                    where = a.location;
                consume(w, a, item);
                a.energy = clamp(a.energy - 12);
                // The thrower uses cover. Every other occupant, including allies, is exposed.
                const targets = pairs(w, a),
                    participants = [a.id],
                    checks = [],
                    details = [];
                for (const target of targets) {
                    participants.push(target.id);
                    const stats = attributes(target);
                    const check = roll(
                        'Evitar explosão: percepção + agilidade',
                        target,
                        a,
                        stats.perception * 3 + stats.agility * 3,
                        38 + attributes(a).cunning * 2,
                        r
                    );
                    checks.push(check);
                    const loss = check.success
                        ? Math.max(5, Math.round(def.areaDamage * 0.16) - stats.endurance)
                        : def.areaDamage;
                    damage(w, target, loss, {
                        kind: 'explosion',
                        killer: a.id,
                        reason: `${def.name} de ${a.name}`
                    });
                    details.push(
                        ` ${target.name} ${check.success ? 'alcançou cobertura' : 'não conseguiu escapar'}: saúde −${loss}.`
                    );
                    if (target.status === 'alive' && target.allies.includes(a.id)) {
                        relation(a, target, false);
                        target.morale = clamp(target.morale - 30);
                        details.push(` ${target.name} rompeu com ${a.name} após o fogo amigo.`);
                    }
                }
                if (item.kind === 'firebomb')
                    region(w, where).environment = { kind: 'fire', remaining: 2, intensity: 2 };
                return {
                    item: def.name,
                    participants,
                    checks,
                    extra: ` ${a.name} lançou o objeto a partir de cobertura. Todos os demais ocupantes, inclusive aliados, tiveram de reagir.${details.join('')}`
                };
            }
        },
        incident: {
            can: () => true,
            run(w, a, b, r, d) {
                const g = region(w, a.location), which = r.int(0, 7);
                if (which === 0) {
                    const drop = r.pick(w.regions.filter(v => !v.closed));
                    const kind = r.pick(['water', 'food', 'med']);
                    give(w, kind, drop.id, d, { region: drop.id, method: 'suprimento lançado na arena', day: w.day });
                    return { extra: ` Um drone deixou um pacote em ${drop.name}; será preciso chegar até lá para procurá-lo.` };
                }
                if (which === 1) {
                    g.shelter = Math.min(3, g.shelter + 1);
                    return { extra: ` ${a.name} descobriu um abrigo protegido em ${g.name}.` };
                }
                if (which === 2) {
                    const loot = Object.values(w.items).filter(i => i.owner === g.id);
                    if (loot.length) {
                        const item = r.pick(loot);
                        transfer(w, item, a.id); equip(w, a, d);
                        return { extra: ` ${a.name} abriu um esconderijo e recuperou ${d.items[item.kind].name}.` };
                    }
                    return { extra: ` O compartimento encontrado por ${a.name} já havia sido esvaziado.` };
                }
                if (which === 3) {
                    a.energy = clamp(a.energy - 6);
                    return { extra: ` Uma pista falsa levou ${a.name} a perder tempo entre caminhos sem saída.` };
                }
                if (which === 4) {
                    const other = r.pick(hostile(w, a));
                    if (other) { a.hidden = 2; return { participants: [a.id, other.id], extra: ` ${a.name} percebeu os rastros de ${other.name} e se ocultou antes do encontro.` }; }
                    a.exploreTarget = r.pick(g.links.map(id => region(w, id)).filter(v => !v.closed))?.id || null;
                    return { extra: ` Marcas recentes no chão chamaram a atenção de ${a.name} para outra trilha.` };
                }
                if (which === 5) {
                    a.morale = clamp(a.morale + 12);
                    return { extra: ` Uma mensagem esquecida fez ${a.name} rir, mesmo em meio à tensão.` };
                }
                const attribute = r.pick(Object.keys(d.attributes)), amount = which === 6 ? 2 : -2;
                effect(a, attribute, amount, 2, which === 6 ? 'inspiração' : 'desorientação');
                return { extra: which === 6 ? ` Uma descoberta renovou o ânimo de ${a.name}.` : ` ${a.name} se desorientou entre ruídos e sombras.` };
            }
        }
    });
    function combat(w, a, b, r, d, unarmed, mode = 'combat') {
        const weapon = unarmed ? null : usableWeapon(w, a, d);
        if (!unarmed && !weapon) throw Error('Arma ou munição indisponível.');
        const def = weapon ? d.items[weapon.kind] : null,
            armor = owned(w, b, 'armor');
        if (def?.ammo) consume(w, a, owned(w, a, def.ammo));
        const primary = def?.attribute || 'strength',
            support = (p) => Math.min(3, readyGroup(w, p).length - 1) * 2;
        let guardian = readyGroup(w, b).slice(1).find(p => p.id !== a.id), guardText = '';
        const guardChecks = [], participants = [a.id, b.id];
        if (guardian) {
            w.queue = w.queue.filter(id => id !== guardian.id);
            participants.push(guardian.id);
            const upkeep = maintenance(w, guardian, r, d);
            guardChecks.push(...(upkeep?.checks || []));
            if (upkeep?.interrupted || guardian.status !== 'alive' || guardian.location !== b.location) {
                guardText = upkeep?.extra || '';
                guardian = null;
            } else {
                guardian.energy = clamp(guardian.energy - 6);
                guardText = ` ${guardian.name} se colocou ao lado de ${b.name} para proteger o companheiro.`;
                trust(guardian, b, 8);
            }
        }
        const attack =
            attributes(a)[primary] * 2 +
            attributes(a).strength +
            attributes(a).agility +
            (def?.power || 0) +
            a.energy / 18 +
            (a.morale - 50) / 8 +
            support(a) +
            (mode === 'ambush' ? 14 : 0);
        const defense =
            attributes(b).endurance * 1.8 +
            attributes(b).agility * 1.6 +
            attributes(b).perception +
            (armor ? d.items[armor.kind].power : 0) +
            b.energy / 25 +
            support(b) + (guardian ? attributes(guardian).agility + 3 : 0);
        const check = roll(
                `${mode === 'ambush' ? 'Emboscada' : mode === 'duel' ? 'Duelo' : 'Ataque'}: ${d.attributes[primary]} × defesa`,
                a,
                b,
                attack,
                defense,
                r
            ),
            checks = [check, ...guardChecks];
        a.energy = clamp(a.energy - 8);
        b.energy = clamp(b.energy - 4);
        a.hidden = 0;
        equip(w, a, d);
        if (!check.success) {
            let extra = ` ${b.name} defendeu ou desviou do ataque.`;
            const counterWeapon = usableWeapon(w, b, d),
                cd = counterWeapon ? d.items[counterWeapon.kind] : null;
            if (r.float() < 0.35) {
                if (cd?.ammo) consume(w, b, owned(w, b, cd.ammo));
                const counter = roll(
                    'Contra-ataque',
                    b,
                    a,
                    attributes(b)[cd?.attribute || 'strength'] * 2 +
                        attributes(b).agility +
                        (cd?.power || 0),
                    attributes(a).agility * 2 + attributes(a).perception + attributes(a).endurance,
                    r
                );
                checks.push(counter);
                if (counter.success) {
                    const loss = Math.max(
                        3,
                        r.int(8, 17) + (cd?.power || 0) - Math.floor(attributes(a).endurance / 2)
                    );
                    damage(w, a, loss, {
                        kind: 'combat',
                        killer: b.id,
                        reason: `contra-ataque de ${b.name}`
                    });
                    extra += ` ${b.name} contra-atacou: ${a.name} perdeu ${loss} de saúde.`;
                } else extra += ' A tentativa de contra-ataque também foi evitada.';
                equip(w, b, d);
            }
            return { weapon: def?.name || 'as próprias mãos', extra: extra + guardText, checks, participants };
        }
        const critical = r.float() < 0.04 + attributes(a).perception * 0.012;
        const loss = Math.max(
            4,
            r.int(unarmed ? 13 : 28, unarmed ? 22 : 40) +
                (def?.power || 0) +
                Math.floor(attributes(a).strength / 2) -
                Math.floor(attributes(b).endurance / 2) -
                (armor ? 3 : 0) +
                (critical ? 20 : 0)
        );
        const protectedLoss = guardian ? Math.floor(loss * 0.23) : 0;
        if (protectedLoss) damage(w, guardian, protectedLoss, { kind: 'combat', killer: a.id, reason: `defendendo ${b.name}` });
        damage(w, b, loss - protectedLoss, {
            kind: 'combat',
            killer: a.id,
            reason: mode === 'ambush' ? `emboscada de ${a.name}` : def?.name || 'disputa sem armas'
        });
        b.morale = clamp(b.morale - 12);
        a.morale = clamp(a.morale + 4);
        if (b.status === 'alive' && !unarmed && r.float() < 0.18) {
            b.bleeding = 3;
            b.woundBy = a.id;
        }
        return {
            weapon: def?.name || 'as próprias mãos',
            extra: ` ${critical ? 'Golpe crítico! ' : ''}${b.name} perdeu ${loss - protectedLoss} de saúde${b.bleeding ? ' e sofreu um ferimento' : ''}.${guardText}${protectedLoss ? ` ${guardian.name} também se feriu ao aparar parte do golpe.` : ''}`,
            checks, participants
        };
    }
    function maintenance(w, a, r, d) {
        a.hunger = clamp(a.hunger + 3);
        a.thirst = clamp(a.thirst + (w.arena.water < 4 ? 4 : 3));
        a.energy = clamp(a.energy - 2);
        if (a.hidden) a.hidden--;
        if (a.bleeding) {
            a.bleeding--;
            damage(w, a, 2, { kind: 'injury', killer: a.woundBy, reason: 'sangramento anterior' });
        }
        if (a.status === 'dead') return;
        if (a.poisoned) {
            a.poisoned--;
            damage(w, a, Math.max(2, 8 - Math.floor(attributes(a).endurance / 2)), {
                kind: 'poison',
                killer: a.poisonBy,
                reason: 'intoxicação anterior'
            });
        }
        if (a.status === 'dead') return;
        const unmet = (a.thirst >= 98 ? 2 : 0) + (a.hunger >= 98 ? 1 : 0),
            cold = w.arena.id === 'arctic' && w.period === 'night' && !owned(w, a, 'tool') ? 1 : 0;
        if (unmet + cold)
            damage(w, a, unmet + cold, {
                kind: 'survival',
                reason: unmet ? 'fome ou sede extremas' : 'exposição ao frio'
            });
        if (a.status === 'alive' && region(w, a.location).closed)
            damage(w, a, 8, { kind: 'environment', reason: 'permanência em região fechada' });
        if (a.status === 'alive' && w.gas > 0)
            damage(w, a, w.gas, { kind: 'environment', reason: 'cerco final da arena' });
        if (a.status === 'alive' && r && d) return exposure(w, a, r, d);
    }
    function immersive(text) {
        return text
            .replace(/ perdeu \d+ de saúde/g, ' sofreu com o golpe')
            .replace(/: saúde −\d+/gi, ', sofrendo ferimentos')
            .replace(/ Saúde −\d+\./g, ' O impacto deixou ferimentos.')
            .replace(/ Energia −\d+\./g, ' O esforço cobrou seu preço.')
            .replace(/ recuperou até \d+ de saúde/g, ' pôde se recompor')
            .replace(/ perdeu \d+ de moral e tende a fugir ou descansar/g, ' se abalou com a ameaça')
            .replace(/ Agilidade \+3 e percepção \+2 por três períodos, limitadas a 10\./g, ' O estimulante tornou os movimentos mais rápidos e os sentidos mais atentos.')
            .replace(/ A próxima emboscada terá vantagem, mas percepção alta pode denunciá-la\./g, '')
            .replace(/ A cilada só atinge quem entrar nesta região; aliados identificados não a acionam\./g, '')
            .replace(/Golpe crítico! /g, 'O golpe encontrou uma brecha! ');
    }
    function eventRecord(before, after, description, actors, type, place) {
        const changes = { players: [], items: [], regions: [], traps: [], meta: {} };
        for (const p of after.players) {
            const old = before.players.find((x) => x.id === p.id);
            if (JSON.stringify(old) !== JSON.stringify(p))
                changes.players.push({ id: p.id, before: old, after: clone(p) });
        }
        for (const [id, item] of Object.entries(after.items))
            if (JSON.stringify(before.items[id]) !== JSON.stringify(item))
                changes.items.push({ id, before: before.items[id] || null, after: clone(item) });
        for (const reg of after.regions)
            if (JSON.stringify(before.regions.find((x) => x.id === reg.id)) !== JSON.stringify(reg))
                changes.regions.push({ id: reg.id, after: clone(reg) });
        for (const k of [
            'day',
            'period',
            'queue',
            'gas',
            'finished',
            'winner',
            'eliminations',
            'randomCalls',
            'itemCounter',
            'trapCounter',
            'narrativeMemory'
        ])
            changes.meta[k] = clone(after[k]);
        for (const [id, t] of Object.entries(after.traps))
            if (JSON.stringify(before.traps[id]) !== JSON.stringify(t))
                changes.traps.push({ id, after: clone(t) });
        const newDeaths = after.eliminations.slice(before.eliminations.length);
        const suffix = newDeaths
            .map((id) => {
                const p = player(after, id);
                return `${p.name} foi eliminado: ${p.death.reason}.`;
            })
            .join(' ');
        return {
            id: 0,
            day: after.day,
            period: after.period,
            type,
            participants: [...actors],
            acted: before.queue.filter((id) => !after.queue.includes(id)),
            region: place,
            text: [description, suffix].filter(Boolean).join(' '),
            changes,
            eliminations: newDeaths
        };
    }
    function create(config, data) {
        config = validateConfig(config, data);
        data = definitions(config, data);
        const arena = clone(data.arenas.find((a) => a.id === config.arena));
        const w = {
            version,
            dataVersion: data.version,
            config,
            arena,
            players: config.characters.map((c) => ({
                ...clone(c),
                morale: 75,
                hidden: 0,
                poisoned: 0,
                poisonBy: null,
                effects: [],
                behavior: c.behavior === 'inherit' ? config.behavior : c.behavior,
                health: 100,
                energy: 85,
                hunger: 0,
                thirst: 0,
                status: 'alive',
                location: 'r0',
                inventory: [],
                equipped: null,
                allies: [],
                bleeding: 0,
                woundBy: null,
                kills: 0,
                death: null
            })),
            items: {},
            itemCounter: 0,
            regions: mapFor(config.arena, config.topology, data),
            traps: {},
            trapCounter: 0,
            day: 0,
            period: 'opening',
            queue: [],
            gas: 0,
            finished: false,
            winner: null,
            eliminations: [],
            randomCalls: 0,
            history: []
        };
        const r = randomFor(w);
        for (const p of w.players) {
            if (p.behavior === 'random') p.behavior = r.pick(profiles);
            p.traits = Object.fromEntries(['courage', 'loyalty', 'opportunism', 'exploration'].map(k => [k, r.int(1, 10)]));
            p.trust = {};
            p.visited = ['r0'];
            p.previousLocation = null;
            p.exploreTarget = null;
        }
        w.narrativeMemory = [];
        const lootPool = [
            ...arena.loot.filter(
                (k) => data.items[k].type !== 'weapon' || config.weapons.includes(k)
            ),
            ...config.customWeapons.filter((i) => config.weapons.includes(i.id)).map((i) => i.id),
            'food',
            'water',
            'med',
            'armor',
            'tool',
            'trapkit',
            'poison',
            'adrenaline',
            'antidote', 'material', 'rope'
        ];
        const size = { scarce: 3, normal: 5, rich: 8 }[config.abundance];
        for (const reg of w.regions) {
            const pool = [...lootPool, ...(reg.waterSource ? ['water', 'water'] : []),
                ...(reg.foodSource ? ['food', 'food'] : []), ...(reg.shelter ? ['tool', 'med'] : [])];
            const count = reg.id === 'r0' ? Math.min(4, size) : size + Math.ceil(config.characters.length / 12);
            for (let i = 0; i < count; i++) give(w, r.pick(pool), reg.id, data);
            if (reg.id !== 'r0' && Number(reg.id.slice(1)) % 3 === 0)
                give(w, r.pick(['grenade', 'firebomb', 'charge']), reg.id, data);
        }
        w.queue = r.shuffle(w.players.map((p) => p.id));
        invariant(w, data);
        w.initial = snapshot(w);
        const blank = snapshot(w);
        w.history.push(
            eventRecord(
                blank,
                blank,
                `A arena ${arena.name} abriu. ${w.players.length} participantes aguardavam no centro, de mãos vazias. Além das primeiras trilhas, os campos guardavam tudo de que precisariam para sobreviver.`,
                w.players.map((p) => p.id),
                'opening',
                'r0'
            )
        );
        return attach(w, data);
    }
    function attach(world, data) {
        function commit(draft, before, desc, actors, type, place, checks = []) {
            if (living(draft).length <= 1) {
                draft.finished = true;
                draft.winner = living(draft)[0]?.id || null;
                desc += living(draft).length
                    ? ` A competição terminou. ${living(draft)[0].name} é o último participante vivo.`
                    : ' A competição terminou sem sobreviventes.';
            }
            invariant(draft, data);
            const entry = eventRecord(before, draft, desc, actors, type, place);
            entry.checks = clone(checks);
            entry.id = world.history.length;
            Object.assign(world, draft);
            world.history.push(entry);
            return clone(entry);
        }
        function execute(id, actorId, otherId = null, upkeep = false) {
            if (world.finished) return null;
            const before = snapshot(world),
                draft = clone(before),
                r = randomFor(draft),
                a = player(draft, actorId),
                other = otherId ? player(draft, otherId) : null,
                def = data.events.find((e) => e.id === id);
            if (!a || a.status !== 'alive' || !draft.queue.includes(a.id))
                throw Error('Participante sem turno válido.');
            if (!def || !rules[def.handler]) throw Error('Evento desconhecido.');
            const eligible = rules[def.handler].can(draft, a, data);
            if (
                !eligible ||
                (Array.isArray(eligible) && (!other || !eligible.some((p) => p.id === other.id)))
            )
                throw Error('Condições incompatíveis com o evento.');
            draft.queue = draft.queue.filter((i) => i !== a.id);
            const hazard = upkeep ? maintenance(draft, a, r, data) : null;
            if (hazard?.interrupted)
                return commit(
                    draft,
                    before,
                    hazard.extra,
                    [a.id],
                    'environment',
                    before.players.find((p) => p.id === a.id).location,
                    hazard.checks
                );
            if (a.status === 'dead')
                return commit(
                    draft,
                    before,
                    `${a.name} não resistiu às condições da arena.`,
                    [a.id],
                    'survival',
                    a.location
                );
            // Re-check after upkeep (injury, exhaustion and death can invalidate an action).
            const recheck = rules[def.handler].can(draft, a, data);
            if (!recheck || (Array.isArray(recheck) && !recheck.some((p) => p.id === other?.id)))
                return commit(
                    draft,
                    before,
                    `${a.name} interrompeu o plano para recuperar o fôlego.`,
                    [a.id],
                    'survival',
                    a.location
                );
            const result = rules[def.handler].run(draft, a, other, r, data),
                values = {
                    a: a.name,
                    b: other?.name || '',
                    r: region(draft, a.location).name,
                    ...result
                };
            const options = result.failed && def.failTexts.length ? def.failTexts : def.texts;
            const available = options.map((text, index) => ({ text, key: `${id}:${result.failed ? 'fail' : 'ok'}:${index}` }))
                .filter(v => !draft.narrativeMemory.slice(-24).includes(v.key));
            const picked = r.pick(available.length ? available : options.map((text, index) => ({ text, key: `${id}:${result.failed ? 'fail' : 'ok'}:${index}` })));
            draft.narrativeMemory = [...draft.narrativeMemory.slice(-47), picked.key];
            const mechanical = picked.text.replace(/\{(\w+)\}/g, (_, key) => values[key] || '') + (result.extra || '');
            const description = immersive(mechanical);
            const entry = commit(
                draft,
                before,
                description,
                [...new Set(result.participants || [a.id, ...(other ? [other.id] : [])])],
                def.category,
                a.location,
                result.checks || []
            );
            entry.action = id;
            entry.details = mechanical;
            world.history.at(-1).action = id;
            world.history.at(-1).details = mechanical;
            return entry;
        }
        function step() {
            if (world.finished) return null;
            while (world.queue.length && player(world, world.queue[0]).status === 'dead')
                world.queue.shift();
            if (!world.queue.length) {
                const before = snapshot(world),
                    draft = clone(before),
                    r = randomFor(draft);
                if (draft.period === 'opening') {
                    draft.day = 1;
                    draft.period = 'day';
                } else if (draft.period === 'day') draft.period = 'night';
                else {
                    draft.day++;
                    draft.period = 'day';
                }
                const start = { short: 3, normal: 5, slow: 8 }[draft.config.pace];
                let extra = '';
                if (
                    draft.period === 'day' &&
                    draft.day >= start &&
                    (draft.day - start) % (draft.config.pace === 'slow' ? 2 : 1) === 0
                ) {
                    const close = r.pick(
                        draft.regions.filter(
                            (g) =>
                                g.id !== 'r0' && !g.closed && connected(draft.regions, true, g.id)
                        )
                    );
                    if (close) {
                        close.closed = true;
                        extra = ` ${close.name} deixou de ser segura; permanecer ali custa saúde.`;
                    }
                }
                if (draft.regions.slice(1).every((g) => g.closed))
                    draft.gas = Math.max(
                        draft.gas,
                        2 +
                            Math.max(
                                0,
                                draft.day -
                                    start -
                                    draft.regions.length * (draft.config.pace === 'slow' ? 2 : 1)
                            ) *
                                2
                    );
                if (draft.day >= { short: 16, normal: 20, slow: 26 }[draft.config.pace])
                    draft.gas = 100;
                if (draft.period === 'day' && draft.day % 2 === 0) {
                    const drop = r.pick(draft.regions.filter(g => !g.closed));
                    for (let i = 0; i < Math.max(1, Math.ceil(living(draft).length / 6)); i++)
                        give(draft, r.pick(['food', 'water', 'med', 'arrows']), drop.id, data,
                            { region: drop.id, method: 'suprimento lançado na arena', day: draft.day });
                    extra += ` Um paraquedas desceu sobre ${drop.name}, levando provisões para quem chegasse primeiro.`;
                }
                extra += environmentPeriod(draft, r);
                draft.queue = r.shuffle(living(draft).map((p) => p.id));
                return commit(
                    draft,
                    before,
                    `${draft.period === 'day' ? 'Amanheceu' : 'Anoiteceu'}: dia ${draft.day}.${extra}`,
                    [],
                    'period',
                    null
                );
            }
            const actor = player(world, world.queue[0]),
                beforeCalls = world.randomCalls,
                r = randomFor(world);
            const choices = data.events
                .map((def) => {
                    const eligible = rules[def.handler]?.can(world, actor, data);
                    let weight = def.weight;
                    const local = region(world, actor.location);
                    if (['move', 'explore'].includes(def.id)) {
                        weight *= 0.5 + actor.traits.exploration / 8;
                        const routes = paths(world, actor.location);
                        const here = destinationScore(world, actor, local);
                        const better = world.regions.some(g => routes[g.id]?.length && destinationScore(world, actor, g, routes[g.id].length) > here + 8);
                        if (better) weight *= 3;
                        else if (local.waterStock || local.foodStock || Object.values(world.items).some(i => i.owner === local.id)) weight *= 0.3;
                        if (hostile(world, actor).length > 2 && actor.behavior !== 'aggressive') weight *= 2;
                    }
                    if (['combat', 'scuffle', 'ambush', 'duel', 'areaattack'].includes(def.id)) {
                        const cornered = !canTravel(world, actor);
                        weight *= (0.3 + actor.traits.courage / 8) * (actor.health < 35 && !cornered ? 0.08 : actor.energy < 20 && !cornered ? 0.25 : 1);
                        if (world.day >= 5) weight *= 2 + world.day / 5;
                        if (cornered) weight *= 3;
                    }
                    if (['share', 'rescue', 'alliance', 'persuade'].includes(def.id)) weight *= 0.5 + actor.traits.loyalty / 8;
                    if (['steal', 'betray', 'break'].includes(def.id)) weight *= (0.2 + actor.traits.opportunism / 8) * (1.2 - actor.traits.loyalty / 12);
                    if (['break', 'betray'].includes(def.id) && (actor.allies.length >= living(world).length / 2 || local.closed)) weight *= 4;
                    if (['break', 'betray'].includes(def.id) && world.gas > 0) weight *= 12;
                    if (['alliance', 'persuade'].includes(def.id) && (world.day > 7 || actor.allies.length > 3)) weight *= 0.15;
                    if (def.id === 'trap' && !hostile(world, actor).length) weight *= 0.1;
                    if (world.narrativeMemory.slice(-4).some(k => k.startsWith(def.id + ':'))) weight *= 0.5;
                    if (world.period === 'opening' && def.id === 'search') weight *= 3;
                    if (def.id === 'rest' && world.period === 'night')
                        weight *=
                            actor.behavior === 'aggressive'
                                ? 2
                                : actor.behavior === 'strategist'
                                  ? 3
                                  : 6;
                    if (world.period === 'night' && ['search', 'explore'].includes(def.id))
                        weight *= actor.behavior === 'strategist' ? 1.4 : 0.6;
                    if (def.id === 'drink' && actor.thirst > 65) weight *= 5;
                    if (def.id === 'eat' && actor.hunger > 65) weight *= 4;
                    if (def.id === 'heal' && actor.health < 45) weight *= 4;
                    if (
                        ['combat', 'scuffle', 'betray', 'ambush', 'duel', 'areaattack'].includes(
                            def.id
                        )
                    )
                        weight *= { calm: 0.5, balanced: 1, chaos: 2.5 }[world.config.hostility];
                    if (def.id === 'weather') weight *= world.arena.hazard / 4;
                    if (['weather'].includes(def.id))
                        weight *= { low: 0.35, normal: 1, high: 2 }[world.config.hazards];
                    if (['incident', 'humor'].includes(def.id))
                        weight *= { low: 0.4, normal: 1, high: 2.5 }[world.config.incidents];
                    const intent = {
                        balanced: {},
                        aggressive: {
                            combat: 2.4,
                            duel: 2,
                            ambush: 1.5,
                            scuffle: 2,
                            intimidate: 2,
                            alliance: 0.4,
                            rest: 0.7
                        },
                        strategist: {
                            hide: 3,
                            ambush: 3,
                            trap: 3,
                            sabotage: 2,
                            poison: 2,
                            steal: 1.5,
                            combat: 0.8
                        },
                        diplomat: {
                            persuade: 3,
                            alliance: 2,
                            share: 2,
                            rescue: 3,
                            intimidate: 1.4,
                            combat: 0.5
                        },
                        cautious: {
                            rest: 1.6,
                            hide: 2,
                            gather: 2,
                            move: 1.4,
                            combat: 0.5,
                            scuffle: 0.5,
                            duel: 0.3
                        }
                    }[actor.behavior] || {};
                    weight *= intent[def.id] ?? 1;
                    if (['ambush', 'trap', 'steal', 'sabotage', 'poison'].includes(def.id))
                        weight *= 0.4 + attributes(actor).cunning / 6;
                    if (['alliance', 'persuade', 'share', 'rescue'].includes(def.id))
                        weight *= 0.4 + attributes(actor).social / 6;
                    if (
                        ['move', 'explore'].includes(def.id) &&
                        (region(world, actor.location).closed ||
                            region(world, actor.location).environment)
                    )
                        weight *= 40;
                    if (
                        def.id === 'explore' &&
                        ((actor.hunger > 45 && !local.foodStock && !owned(world, actor, 'food')) ||
                         (actor.thirst > 45 && !local.waterStock && !owned(world, actor, 'water')) ||
                         (!actor.inventory.length && !Object.values(world.items).some(i => i.owner === actor.location)))
                    )
                        weight *= 4;
                    if (def.id === 'search' && !actor.equipped) weight *= 2;
                    if (def.id === 'craft' && !actor.equipped) weight *= 3;
                    if (def.id === 'flee' && actor.health < 35) weight *= 8;
                    if (def.id === 'betray')
                        weight *=
                            (actor.behavior === 'strategist'
                                ? 2
                                : actor.behavior === 'diplomat'
                                  ? 0.25
                                  : 1) *
                            (0.5 + attributes(actor).cunning / 10) *
                            (living(world).length <= 4 ? 4 : 1);
                    if (def.id === 'areaattack') weight *= hostile(world, actor).length > 1 ? 2 : 1;
                    if (def.id === 'rest' && actor.energy < 25) weight *= 7;
                    if (def.id === 'gather' && (actor.thirst > 65 || actor.hunger > 65))
                        weight *= 8;
                    if (def.id === 'move' && actor.morale < 30) weight *= 4;
                    if (
                        ['combat', 'duel', 'ambush', 'scuffle'].includes(def.id) &&
                        actor.morale < 30
                    )
                        weight *= 0.35;
                    return { def, eligible, weight };
                })
                .filter((x) => x.eligible && (!Array.isArray(x.eligible) || x.eligible.length));
            let cursor = r.float() * choices.reduce((n, c) => n + c.weight, 0),
                choice = choices[0];
            for (const c of choices) {
                cursor -= c.weight;
                if (cursor < 0) {
                    choice = c;
                    break;
                }
            }
            const other = Array.isArray(choice.eligible) ? weighted(r, choice.eligible.map(p => ({ value: p,
                weight: ['alliance', 'persuade'].includes(choice.def.id) ? (p.district === actor.district ? 1.6 : 1) :
                    ['share', 'rescue'].includes(choice.def.id) ? 1 + p.thirst / 20 + (100 - p.health) / 20 : 1 }))) : null;
            const calls = world.randomCalls;
            world.randomCalls = beforeCalls;
            // Preserve the selection draws in the transaction so the history can reproduce them.
            const old = world.randomCalls;
            world.randomCalls = calls;
            try {
                return execute(choice.def.id, actor.id, other?.id, true);
            } catch (error) {
                world.randomCalls = old;
                throw error;
            }
        }
        function viewAt(index) {
            if (!integer(index, 0, world.history.length - 1))
                throw Error('Acontecimento inexistente.');
            const state = clone(world.initial);
            for (const e of world.history.slice(0, index + 1)) {
                for (const c of e.changes.players)
                    state.players[state.players.findIndex((p) => p.id === c.id)] = clone(c.after);
                for (const c of e.changes.items) state.items[c.id] = clone(c.after);
                for (const c of e.changes.regions)
                    state.regions[state.regions.findIndex((g) => g.id === c.id)] = clone(c.after);
                for (const c of e.changes.traps) state.traps[c.id] = clone(c.after);
                Object.assign(state, clone(e.changes.meta));
            }
            return state;
        }
        return {
            get state() {
                return clone(world);
            },
            current: () => snapshot(world),
            step,
            execute,
            viewAt,
            save: () => JSON.stringify(world),
            summary() {
                const alive = living(world);
                return {
                    winner: world.winner,
                    days: world.day,
                    initial: world.players.length,
                    survivors: alive.length,
                    eliminations: [...world.eliminations],
                    combat: world.players.filter((p) =>
                        ['combat', 'injury', 'trap', 'poison', 'explosion'].includes(p.death?.kind)
                    ).length,
                    environment: world.players.filter(
                        (p) => p.death && ['environment', 'survival'].includes(p.death.kind)
                    ).length,
                    mostKills: [...world.players].sort((a, b) => b.kills - a.kills)[0],
                    events: world.history.length
                };
            }
        };
    }
    function restore(raw, data) {
        if (typeof raw === 'string') {
            if (raw.length > 64 * 1024 * 1024) throw Error('Save muito grande.');
            raw = JSON.parse(raw);
        }
        if (
            !raw ||
            !Array.isArray(raw.history) ||
            raw.history.length < 1 ||
            raw.history.length > 6000
        )
            throw Error('Histórico inválido.');
        const w = clone(raw);
        w.config = validateConfig(w.config, data);
        invariant(w, data);
        invariant(w.initial, data);
        for (let i = 0; i < w.history.length; i++) {
            const e = w.history[i];
            if (
                e.id !== i ||
                !text(e.text, 20000) ||
                !Array.isArray(e.participants) ||
                e.participants.some((id) => !player(w, id)) ||
                !e.changes ||
                !Array.isArray(e.changes.players) ||
                !Array.isArray(e.changes.items) ||
                !Array.isArray(e.changes.regions)
            )
                throw Error('Registro de histórico inválido.');
        }
        const canonical = create(w.config, data);
        const stable = (value) =>
            JSON.stringify(value, function (key, item) {
                if (item && typeof item === 'object' && !Array.isArray(item))
                    return Object.fromEntries(
                        Object.keys(item)
                            .sort()
                            .map((k) => [k, item[k]])
                    );
                return item;
            });
        if (stable(canonical.state.initial) !== stable(w.initial))
            throw Error('Estado inicial incompatível com a configuração.');
        if (stable(canonical.state.history[0]) !== stable(w.history[0]))
            throw Error('Abertura incompatível com a configuração.');
        for (let i = 1; i < w.history.length; i++) {
            const event = canonical.step();
            if (!event || stable(event) !== stable(w.history[i]))
                throw Error('Save alterado ou histórico inconsistente.');
        }
        if (stable(canonical.current()) !== stable(snapshot(w)))
            throw Error('Save e histórico não correspondem.');
        return canonical;
    }
    return Object.freeze({
        version,
        maxPlayers,
        normalizeGender,
        balanceAttributes,
        mapFor,
        connected,
        definitions,
        distributeDistricts,
        validateConfig,
        create,
        restore,
        invariant,
        usableWeapon,
        effectiveAttributes: attributes
    });
})();
