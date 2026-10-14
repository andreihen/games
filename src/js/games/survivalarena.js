GameRegistry.register('survivalarena', (session) => {
    let data,
        draft,
        engine = null,
        playing = false,
        timer = null,
        tab = 'story',
        viewed = null,
        inspected = null,
        replacing = 0,
        controller = null,
        savingOK = true,
        historyLimit = 150,
        filteredHistory = [],
        returnFocus = null;
    let $,
        setupRandom,
        catalogue = [],
        prepTab = 'roster',
        libraryFolder = 'folder-default',
        libraryEditing = null,
        libraryCandidate = null,
        presetsRefresh = () => {};
    const prepScroll = {};
    const behaviorNames = {
        inherit: 'Usar perfil geral',
        random: 'Aleatório · personalidade individual',
        balanced: 'Equilibrado',
        aggressive: 'Agressivo',
        strategist: 'Estrategista',
        diplomat: 'Diplomata',
        cautious: 'Cauteloso'
    };
    const itemInfo = (kind) => draft?.customWeapons?.find((i) => i.id === kind) || data.items[kind];
    function switchPrep(next) {
        prepScroll[prepTab] = $('.sa-prep-scroll')?.scrollTop || 0;
        prepTab = next;
        for (const pane of session.ui.phaseDisplay.querySelectorAll('[data-prep-panel]'))
            pane.classList.toggle('hidden', pane.dataset.prepPanel !== next);
        for (const b of session.ui.phaseDisplay.querySelectorAll('[data-preptab]'))
            b.setAttribute('aria-pressed', String(b.dataset.preptab === next));
        if (next === 'arena') renderMapPreview();
        if (next === 'catalog') renderCatalog();
        if (next === 'library') renderLibrary();
        if ($('.sa-prep-scroll')) $('.sa-prep-scroll').scrollTop = prepScroll[next] || 0;
    }
    function renderThemes() {
        const type = $('#sa-theme').value;
        if (['tv', 'movies', 'games'].includes(type) && $('#sa-api-kind')) $('#sa-api-kind').value = type;
        const old = $('#sa-universe').value;
        const names = [
            ...new Set(
                catalogue.filter((c) => type === 'mix' || c.type === type).map((c) => c.universe)
            )
        ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        $('#sa-universe').innerHTML =
            '<option value="">Todas as obras</option>' +
            names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
        if (names.includes(old)) $('#sa-universe').value = old;
        renderCatalog();
    }
    function renderCatalog() {
        const q = GameArt.normalize($('#sa-catalog-search')?.value || '');
        const rows = catalogPool().filter((c) => GameArt.normalize(c.name).includes(q));
        $('#sa-catalog-grid').innerHTML =
            rows
                .map(
                    (c) =>
                        `<article class="sa-catalog-card">${avatar(c)}<strong>${esc(c.name)}</strong><small>${esc(c.universe)}</small>${c.imageKind === 'actor' ? '<small>Foto do intérprete</small>' : ''}<button data-catalogadd="${esc(c.id)}" ${draft.characters.some((p) => p.catalogId === c.id) && !$('#sa-duplicates').checked ? 'disabled' : ''}>${draft.characters.some((p) => p.catalogId === c.id) ? ($('#sa-duplicates').checked ? 'Adicionar cópia' : 'No elenco') : 'Adicionar'}</button><button data-catalogstore="${esc(c.id)}">Guardar na biblioteca</button></article>`
                )
                .join('') ||
            '<p>Nenhum personagem neste filtro. Busque outra obra ou crie um personagem.</p>';
        $('#sa-catalog-count').textContent = `${rows.length} personagens · ${draft.characters.length}/48 no elenco`;
        loadPortraits();
    }
    function addCatalogCharacter(c) {
        if (draft.characters.length >= ArenaEngine.maxPlayers)
            throw Error('Limite de 48 participantes.');
        if (
            !$('#sa-duplicates').checked &&
            draft.characters.some((p) => p.name === c.name && p.universe === c.universe)
        )
            return false;
        draft.characters.push(makeCharacter(c, ++replacing + 500));
        return true;
    }
    function renderWeapons() {
        const defs = ArenaEngine.definitions(draft, data).items;
        const enabled = draft.weapons || Object.keys(defs).filter((k) => defs[k].type === 'weapon');
        $('#sa-weapons').innerHTML = Object.entries(defs)
            .filter(([, i]) => i.type === 'weapon')
            .map(
                ([k, i]) =>
                    `<label><input type="checkbox" data-weapon="${esc(k)}" ${enabled.includes(k) ? 'checked' : ''}>${esc(i.name)} <small>${i.power} · ${esc(data.attributes[i.attribute || 'strength'])}</small></label>`
            )
            .join('');
    }
    function renderMapPreview() {
        if (!$('#sa-map-preview')) return;
        const arena = data.arenas.find((a) => a.id === $('#sa-arena').value);
        $('#sa-map-preview').innerHTML = map({
            arena,
            regions: ArenaEngine.mapFor(arena.id, $('#sa-topology').value, data),
            players: [],
            preview: true
        });
    }
    function validateRosterDraft(raw, data) {
        if (!Array.isArray(raw.characters))
            throw Error('O elenco precisa ter uma lista de personagens.');
        const n = raw.characters.length;
        const chars = [...raw.characters];
        while (chars.length < 2)
            chars.push({
                id: `validation-only-${chars.length}`,
                name: 'Validação',
                attributes: ArenaEngine.balanceAttributes({}, raw.pointBudget || 36)
            });
        const out = ArenaEngine.validateConfig({ ...raw, characters: chars }, data);
        out.characters = out.characters.slice(0, n);
        return out;
    }
    function hydrate(characters) {
        return characters.map((c) => {
            const known = catalogue.find((p) => p.name === c.name && p.universe === c.universe);
            return {
                ...known,
                ...c,
                image: c.image || known?.image,
                imageSource: c.imageSource || known?.imageSource,
                imageKind: c.imageKind || known?.imageKind
            };
        });
    }
    function rosterSettings(raw) {
        return Object.fromEntries(
            ['pointBudget', 'balance', 'behavior', 'customWeapons', 'weapons']
                .filter((k) => raw?.[k] !== undefined)
                .map((k) => [k, structuredClone(raw[k])])
        );
    }

    const esc = (value) => GameArt.escape(String(value ?? ''));
    const categoryNames = {
        opening: 'Abertura',
        period: 'Novo período',
        exploration: 'Exploração',
        movement: 'Deslocamento',
        survival: 'Sobrevivência',
        relations: 'Relações',
        conflict: 'Confronto',
        environment: 'Ambiente',
        story: 'Imprevisto'
    };
    const genderNames = {
        male: 'Masculino',
        female: 'Feminino',
        other: 'Outro / sem gênero',
        unknown: 'Não informado'
    };
    const environmentLabels = {
        poison: 'Nuvem de veneno',
        fire: 'Incêndio',
        storm: 'Tempestade',
        flood: 'Inundação',
        blackout: 'Apagão / neblina', quake: 'Terremoto', landslide: 'Deslizamento', lightning: 'Relâmpagos', horde: 'Horda de criaturas'
    };
    const periods = { opening: 'Abertura', day: 'Dia', night: 'Noite' };
    function status(message) {
        $('#sa-status').textContent = message;
    }
    function randomStats(behavior = 'inherit') {
        const profile =
            behavior === 'inherit' ? $('#sa-behavior')?.value || draft.behavior : behavior;
        const bias =
            {
                balanced: {},
                aggressive: { strength: 3, agility: 2, endurance: 1 },
                strategist: { cunning: 3, perception: 2 },
                diplomat: { social: 4, cunning: 1 },
                cautious: { endurance: 3, perception: 2, agility: 1 }
            }[profile] || {};
        const raw = Object.fromEntries(
            Object.keys(data.attributes).map((k) => [
                k,
                Math.min(10, setupRandom.int(1, 10) + (bias[k] || 0))
            ])
        );
        return draft?.balance === false
            ? raw
            : ArenaEngine.balanceAttributes(raw, draft?.pointBudget || 36);
    }
    function catalogPool() {
        const theme = $('#sa-theme').value,
            excluded = $('#sa-exclude')
                .value.split(',')
                .map((s) => GameArt.normalize(s.trim()))
                .filter(Boolean);
        return catalogue.filter(
            (p) =>
                (theme === 'mix' || p.type === theme) &&
                (!$('#sa-universe').value || p.universe === $('#sa-universe').value) &&
                !excluded.includes(GameArt.normalize(p.universe))
        );
    }
    function makeCharacter(p, index) {
        return {
            ...structuredClone(p),
            id: `slot-${index}-${p.id}`.slice(0, 64),
            catalogId: p.id,
            behavior: p.behavior || 'inherit',
            attributes: p.attributes ? structuredClone(p.attributes) : randomStats(p.behavior || 'inherit'),
            district: p.district || null,
            starting: []
        };
    }
    function drawCast() {
        const count = Number($('#sa-count').value);
        if (!Number.isInteger(count) || count < 2 || count > 48)
            throw Error('Use de 2 a 48 participantes.');
        let bank = catalogPool();
        const repeats = $('#sa-duplicates').checked;
        if (!$('#sa-mixed').checked) {
            const universes = [...new Set(bank.map((p) => p.universe))].filter(
                (u) => repeats || bank.filter((p) => p.universe === u).length >= count
            );
            if (!universes.length)
                throw Error('Não há uma franquia com participantes suficientes para este elenco.');
            const universe = setupRandom.pick(universes);
            bank = bank.filter((p) => p.universe === universe);
        }
        if (!bank.length || (!repeats && bank.length < count))
            throw Error(
                'O filtro não tem personagens suficientes. Ajuste a quantidade ou as franquias excluídas.'
            );
        let selected = [];
        if ($('#sa-quotas').checked) {
            const counts = ['male', 'female', 'other', 'unknown'].map((g) => [
                g,
                Number($(`#sa-${g}`).value)
            ]);
            if (
                counts.some(([, n]) => !Number.isInteger(n) || n < 0) ||
                counts.reduce((sum, [, n]) => sum + n, 0) !== count
            )
                throw Error(
                    'As quatro cotas devem somar exatamente a quantidade de participantes.'
                );
            for (const [gender, n] of counts) {
                const pool = setupRandom.shuffle(bank.filter((p) => p.gender === gender));
                if ((!pool.length && n) || (!repeats && pool.length < n))
                    throw Error(`Não há candidatos suficientes: ${genderNames[gender]}.`);
                for (let i = 0; i < n; i++)
                    selected.push(repeats ? setupRandom.pick(pool) : pool[i]);
            }
        } else
            selected = repeats
                ? Array.from({ length: count }, () => setupRandom.pick(bank))
                : setupRandom.shuffle(bank).slice(0, count);
        draft.characters = setupRandom.shuffle(selected).map((p, i) => makeCharacter(p, i + 1));
        renderRoster();
        status(
            'Elenco sorteado. Revise os distritos e as personalidades. Todos entrarão de mãos vazias.'
        );
    }
    function avatar(p) {
        const colors = ['#8bbfa3', '#c59d78', '#9db6d7', '#b0a0ca', '#b6be88'];
        const n = [...p.id].reduce((s, c) => s + c.charCodeAt(0), 0);
        const initials = p.name
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join('');
        return `<span class="sa-avatar ${p.status === 'dead' ? 'sa-dead' : ''}" style="--avatar-color:${colors[n % colors.length]}" ${p.portrait ? `data-pic="${esc(p.portrait)}"` : ''}><b>${esc(initials)}</b>${p.image ? `<img src="${esc(ArenaAccess.resolveImage(p.image))}" alt="${esc(p.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}</span>`;
    }
    function loadPortraits() {
        for (const img of session.ui.phaseDisplay.querySelectorAll('.sa-avatar img'))
            img.onerror = () => {
                img.remove();
            };
        for (const node of session.ui.phaseDisplay.querySelectorAll('[data-pic]')) {
            const id = node.dataset.pic;
            ArenaAccess.portrait(id).then((src) => {
                if (!session.alive || !node.isConnected || !src) return;
                const image = document.createElement('img');
                image.src = src;
                image.alt = 'Retrato personalizado';
                image.loading = 'lazy';
                image.decoding = 'async';
                image.onerror = () => image.remove();
                node.append(image);
            });
        }
    }
    function renderRoster() {
        const grouped = ArenaEngine.distributeDistricts(draft.characters).sort((a, b) => a.district - b.district);
        $('#sa-roster').innerHTML = grouped
            .map(
                (p) =>
                    `<article class="sa-cast-card" data-gender="${esc(p.gender)}"><span class="sa-district">Distrito ${p.district}</span>${avatar(p)}<div><strong>${esc(p.name)}</strong><small>${esc(p.universe)}</small><span>${Object.values(p.attributes).reduce((a, b) => a + b, 0)} pontos · ${esc(behaviorNames[p.behavior] || behaviorNames.inherit)}</span></div><div class="sa-card-actions"><button data-edit="${esc(p.id)}" type="button">Editar</button><button data-store="${esc(p.id)}" type="button" aria-label="Guardar ${esc(p.name)} na biblioteca">Guardar</button><button data-replace="${esc(p.id)}" type="button">Trocar</button><button data-remove="${esc(p.id)}" type="button" aria-label="Remover ${esc(p.name)}">×</button></div></article>`
            )
            .join('');
        $('#sa-roster-count').textContent = `${draft.characters.length}/48 selecionados · ${48 - draft.characters.length} vagas`;
        $('#sa-ready').textContent = draft.characters.length < 2 ? 'Escolha pelo menos 2 participantes para começar.' : `${draft.characters.length} participantes prontos. Todos começam sem equipamentos.`;
        $('#sa-start').disabled = draft.characters.length < 2;
        loadPortraits();
    }
    function renderLibrary() {
        const lib = ArenaAccess.library();
        if (!lib.folders.some(f => f.id === libraryFolder)) libraryFolder = 'folder-default';
        $('#sa-library-folder').innerHTML = lib.folders.map(f => `<option value="${esc(f.id)}" ${f.id === libraryFolder ? 'selected' : ''}>${esc(f.name)} (${lib.characters.filter(c => c.folder === f.id).length})</option>`).join('');
        const query = GameArt.normalize($('#sa-library-search').value);
        $('#sa-library-grid').innerHTML = lib.characters.filter(c => c.folder === libraryFolder && GameArt.normalize(c.character.name + ' ' + c.character.universe).includes(query)).map(entry => {
            const c = entry.character;
            return `<article class="sa-catalog-card">${avatar(c)}<strong>${esc(c.name)}</strong><small>${esc(c.universe)} · ${c.district ? `Distrito ${c.district}` : 'Distrito automático'}</small><span>${esc(behaviorNames[c.behavior])}</span><div class="sa-buttons"><button data-libraryadd="${esc(entry.id)}">Adicionar ao elenco</button><button data-libraryedit="${esc(entry.id)}">Editar</button><button data-librarydelete="${esc(entry.id)}" aria-label="Excluir ${esc(c.name)} da biblioteca">Excluir</button></div><label>Mover para pasta<select data-librarymove="${esc(entry.id)}">${lib.folders.map(f => `<option value="${esc(f.id)}" ${f.id === entry.folder ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label></article>`;
        }).join('') || '<div class="sa-empty">Esta pasta ainda não tem personagens neste filtro. Guarde um personagem do catálogo ou crie um aqui.</div>';
        loadPortraits();
    }
    function updateDraft() {
        draft.arena = $('#sa-arena').value;
        draft.seed = SeededRandom.normalize($('#sa-seed').value);
        draft.pace = $('#sa-pace').value;
        draft.hostility = $('#sa-hostility').value;
        draft.alliances = $('#sa-alliances').checked;
        draft.humor = $('#sa-humor').checked;
        for (const [id, key] of [
            ['sa-topology', 'topology'],
            ['sa-behavior', 'behavior'],
            ['sa-abundance', 'abundance'],
            ['sa-incidents', 'incidents'],
            ['sa-hazards', 'hazards'],
            ['sa-kit', 'startingKit']
        ])
            draft[key] = $('#' + id).value;
        draft.pointBudget = Number($('#sa-budget').value);
        draft.balance = $('#sa-balance').checked;
        draft.weapons = [...session.ui.phaseDisplay.querySelectorAll('[data-weapon]:checked')].map(
            (el) => el.dataset.weapon
        );

        return ArenaEngine.validateConfig(draft, data);
    }
    function save() {
        if (!engine) return;
        savingOK = ArenaAccess.write('save', engine.state);
        if (!savingOK)
            status(
                'Sem espaço para salvar no navegador. Use Exportar save para guardar a partida.'
            );
    }
    function stopAuto() {
        playing = false;
        if (timer !== null) session.clear(timer);
        timer = null;
    }
    function showPlay() {
        $('#sa-setup').classList.add('hidden');
        $('#sa-play').classList.remove('hidden');
        closeDetail();
        viewed = null;
        tab = 'story';
        renderPlay();
    }
    function startDraft() {
        stopAuto();
        draft = updateDraft();
        engine = ArenaEngine.create(draft, data);
        save();
        showPlay();
        status(
            'A competição começou. Você é o observador; o acaso e o estado da arena determinam os resultados.'
        );
    }
    function advance(kind = 'event') {
        if (!engine) return;
        viewed = null;
        const before = engine.current();
        for (let i = 0; i < ArenaEngine.maxPlayers * 2 + 10; i++) {
            const event = engine.step();
            if (!event) break;
            const now = engine.current();
            if (
                kind === 'event' ||
                now.finished ||
                (kind === 'period' && (now.period !== before.period || now.day !== before.day)) ||
                (kind === 'day' && now.day > before.day)
            )
                break;
        }
        if (engine.current().finished) {
            stopAuto();
            tab = 'result';
        }
        save();
        renderPlay();
    }
    function stateView() {
        return viewed === null ? engine.current() : engine.viewAt(viewed);
    }
    function phaseLabel(w) {
        return w.period === 'opening' ? 'Abertura' : `${periods[w.period]} ${w.day}`;
    }
    function map(w) {
        const nodes = w.regions,
            lines = [];
        for (const r of nodes)
            for (const id of r.links)
                if (r.id < id) {
                    const b = nodes.find((n) => n.id === id);
                    lines.push(
                        `<line x1="${r.x * 3 + 20}" y1="${r.y * 2.5 + 20}" x2="${b.x * 3 + 20}" y2="${b.y * 2.5 + 20}"/>`
                    );
                }
        const terrain = {
            forest: '<path d="M35 245L58 175L81 245ZM112 110L135 35L158 110ZM247 220L275 130L303 220Z"/><path d="M95 300Q175 180 140 0" fill="none" stroke="#799fa4" stroke-width="12"/>',
            desert: '<path d="M0 220Q100 130 190 215T340 205V300H0ZM0 100Q80 40 160 100T340 90V125Q250 145 160 120T0 135Z"/>',
            arctic: '<path d="M0 160L80 35L135 140L215 10L340 160ZM50 300L120 215L205 285L290 200L340 300Z"/>',
            city: '<path d="M30 25H80V90H30ZM140 25H200V65H140ZM270 30H320V110H270ZM35 220H95V285H35ZM225 205H300V285H225Z"/><path d="M0 185H340M100 0V300M245 0V300" fill="none" stroke="currentColor" stroke-width="10"/>',
            islands:
                '<path d="M30 120Q0 10 95 25Q180 15 135 100Q150 175 30 120ZM215 180Q180 80 270 110Q340 135 305 245Q240 295 215 180Z"/><path d="M0 200Q75 165 145 200T340 180" fill="none" stroke="#829ab9" stroke-width="8"/>',
            volcano:
                '<path d="M15 285L165 40L325 285Z"/><path d="M140 85L165 40L190 85L165 70Z" fill="#ecac7c"/><path d="M165 40Q145 25 180 0M170 115L150 180L185 270" fill="none" stroke="#ecac7c" stroke-width="12"/>'
        }[w.arena.id];
        return `<svg class="sa-map" viewBox="0 0 340 300" role="group" aria-label="Mapa de ${esc(w.arena.name)}"><rect width="340" height="300" rx="14" fill="${esc(w.arena.color)}" opacity=".18"/><g fill="${esc(w.arena.color)}" color="${esc(w.arena.color)}" opacity=".2" aria-hidden="true">${terrain}</g><g class="sa-map-links" aria-hidden="true">${lines.join('')}</g>${nodes
            .map((r) => {
                const occupants = w.players.filter(
                    (p) => p.status === 'alive' && p.location === r.id
                );
                return `<g ${w.preview ? '' : `role="button" tabindex="0" data-region="${r.id}"`} aria-label="${esc(r.name)}, ${occupants.length} participantes${r.closed ? ', região fechada' : ''}"><circle cx="${r.x * 3 + 20}" cy="${r.y * 2.5 + 20}" r="23" fill="${r.closed ? '#72464a' : r.environment ? '#675329' : '#334a43'}" stroke="${r.closed ? '#e49b9b' : w.arena.color}" stroke-width="3"/><text x="${r.x * 3 + 20}" y="${r.y * 2.5 + 25}" text-anchor="middle" class="sa-map-count">${r.environment ? '⚠ ' : ''}${occupants.length}${r.closed ? ' ×' : ''}</text><text x="${r.x * 3 + 20}" y="${r.y * 2.5 + 54}" text-anchor="middle" class="sa-map-name">${esc(r.name.slice(0, 21))}</text>${
                    !w.preview
                        ? `<foreignObject x="${r.x * 3 - 5}" y="${r.y * 2.5 + 46}" width="52" height="22"><div xmlns="http://www.w3.org/1999/xhtml" class="sa-map-faces">${occupants
                              .slice(0, 2)
                              .map((p) => avatar(p))
                              .join('')}</div></foreignObject>`
                        : ''
                }<text x="${r.x * 3 + 42}" y="${r.y * 2.5 + 25}" class="sa-map-source">${r.waterSource ? '≈' : r.foodSource ? '♧' : ''}</text></g>`;
            })
            .join('')}</svg>`;
    }
    function currentEvent() {
        const all = engine.state.history;
        return all[viewed === null ? all.length - 1 : viewed];
    }
    function story(w) {
        const e = currentEvent();
        const shown = [
            ...new Set([
                ...e.participants,
                ...e.eliminations
                    .map((id) => w.players.find((p) => p.id === id)?.death?.killer)
                    .filter(Boolean)
            ])
        ];
        const actors = shown.map((id) => w.players.find((p) => p.id === id)).filter(Boolean);
        const losses = e.changes.players
            .map((c) => ({ p: c.after, n: c.after.health - c.before.health }))
            .filter((c) => c.n);
        return `<div class="sa-story-layout"><article class="sa-event sa-event-${esc(e.type)}"><span class="sa-event-kind">${esc(categoryNames[e.type] || e.type)} · #${e.id}</span><div class="sa-event-cast">${actors
            .map(
                (p) =>
                    `<button data-person="${esc(p.id)}">${avatar(p)}<span>${esc(p.name)}</span></button>`
            )
            .join(
                ''
            )}</div><p class="sa-narrative">${esc(e.text)}</p><details class="sa-checks"><summary>Consequências e detalhes das regras</summary><p>${esc(e.details || e.text)}</p><p>${e.acted?.length || 0} ações usadas neste acontecimento.</p><div class="sa-effect-chips">${e.changes.players
            .filter((c) => JSON.stringify(c.before?.effects) !== JSON.stringify(c.after.effects))
            .map(
                (c) =>
                    `<span class="sa-effect-change">${esc(c.after.name)}: ${c.after.effects.map((f) => `${esc(data.attributes[f.attribute])} ${f.amount > 0 ? '+' : ''}${f.amount}`).join(' · ') || 'efeitos encerrados'}</span>`
            )
            .join('')}${e.changes.regions
            .filter((c) => c.after.environment)
            .map(
                (c) =>
                    `<span class="sa-danger-chip">⚠ ${esc(c.after.name)}: ${esc(environmentLabels[c.after.environment.kind])}</span>`
            )
            .join(
                ''
            )}${losses.map((c) => `<span class="${c.n < 0 ? 'sa-loss' : 'sa-gain'}">${esc(c.p.name)}: ${c.n > 0 ? '+' : ''}${c.n} saúde</span>`).join('')}</div></details><small>${e.region ? esc(w.regions.find((r) => r.id === e.region)?.name) : esc(w.arena.name)}</small>${e.checks?.length ? `<details class="sa-checks"><summary>Rolagens e atributos (${e.checks.length})</summary>${e.checks.map((c) => `<p>${esc(c.label)} · ${c.chance}% de chance · d100: ${c.dice} · <strong>${c.success ? 'Sucesso' : 'Defesa / falha'}</strong></p>`).join('')}</details>` : ''}</article><aside class="sa-mini-map">${map(w)}<p>Toque numa região para consultar ocupantes.</p></aside></div>`;
    }
    function participants(w) {
        return `<div class="sa-panel-filters"><label>Buscar <input id="sa-player-search" type="search" value="${esc($('#sa-player-search')?.value || '')}" placeholder="Nome ou universo"></label><label>Estado <select id="sa-player-filter"><option value="all">Todos</option><option value="alive">Vivos</option><option value="dead">Eliminados</option></select></label></div><div id="sa-player-list">${participantCards(w.players)}</div>`;
    }
    function participantCards(players) {
        return `<div class="sa-participant-grid">${players.map((p) => `<button class="sa-participant ${p.status === 'dead' ? 'sa-eliminated' : ''}" data-person="${esc(p.id)}">${avatar(p)}<strong>${esc(p.name)}</strong><small>Distrito ${p.district} · ${esc(p.universe)}</small><span>${p.status === 'alive' ? `♥ ${p.health} · ${esc(stateView().regions.find((r) => r.id === p.location)?.name)}` : `Eliminação: ${phaseLabel({ period: p.death.period, day: p.death.day })}`}</span><meter min="0" max="100" value="${p.health}" aria-label="Saúde de ${esc(p.name)}"></meter></button>`).join('')}</div>`;
    }
    function historyPanel() {
        const w = engine.current();
        return `<div class="sa-panel-filters"><label>Participante<select id="sa-history-person"><option value="">Todos</option>${w.players.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label><label>Dia<input id="sa-history-day" type="number" min="0" max="30" placeholder="Todos"></label><label>Categoria<select id="sa-history-type"><option value="">Todas</option>${Object.entries(
            categoryNames
        )
            .map(([k, v]) => `<option value="${k}">${v}</option>`)
            .join(
                ''
            )}</select></label></div><p>Selecione um registro para consultar o mapa e as fichas daquele momento.</p><div id="sa-history-list">${historyRows(engine.state.history, true)}</div>`;
    }
    function historyRows(events, paginate = false) {
        if (paginate) filteredHistory = events;
        const players = engine?.current().players || [];
        return (
            events
                .slice(paginate ? -historyLimit : -150)
                .reverse()
                .map(
                    (e) =>
                        `<button class="sa-history-row" data-event="${e.id}"><span class="sa-history-faces">${e.participants
                            .slice(0, 2)
                            .map((id) => players.find((p) => p.id === id))
                            .filter(Boolean)
                            .map((p) => avatar(p))
                            .join(
                                ''
                            )}</span><strong>#${e.id} · ${phaseLabel(e)} · ${esc(categoryNames[e.type] || e.type)}</strong><span>${esc(e.text)}</span></button>`
                )
                .join('') +
                (paginate && events.length > historyLimit
                    ? '<button data-command="morehistory">Mostrar acontecimentos anteriores</button>'
                    : '') || '<p>Nenhum acontecimento nesse filtro.</p>'
        );
    }
    function result(w) {
        if (!w.finished)
            return '<div class="sa-empty">A arena ainda está em andamento. O resultado será calculado pelos acontecimentos reais.</div>';
        const summary = engine.summary(),
            winner = w.players.find((p) => p.id === w.winner),
            ranking = [w.winner, ...[...w.eliminations].reverse()].filter(Boolean);
        return `<article class="sa-winner">${winner ? avatar(winner) : ''}<span>${winner ? 'ÚLTIMO PARTICIPANTE VIVO' : 'SEM SOBREVIVENTES'}</span><h2>${winner ? esc(winner.name) : 'A arena venceu'}</h2><p>${winner ? esc(winner.universe) : 'Todos foram eliminados'} · ${summary.days} dias · ${summary.events} acontecimentos</p></article><div class="sa-result-stats"><span>${summary.initial} participantes iniciais</span><span>${summary.combat} eliminações por confronto/ferimento</span><span>${summary.environment} eliminações ambientais/sobrevivência</span><span>${summary.mostKills.kills ? `Mais abates: ${esc(summary.mostKills.name)} (${summary.mostKills.kills})` : 'Nenhum abate por participante registrado'}</span></div><ol class="sa-ranking">${ranking
            .map((id) => {
                const p = w.players.find((p) => p.id === id);
                return `<li><button data-person="${esc(id)}">${avatar(p)}<span>${esc(p.name)}</span></button><small>${p.death ? `${phaseLabel(p.death)} · ${esc(p.death.reason)}` : 'Vencedor'}</small></li>`;
            })
            .join(
                ''
            )}</ol><div class="sa-buttons"><button data-command="repeat">Repetir esta competição</button><button data-command="newseed">Mesmo elenco, nova seed</button><button data-command="exportresult">Exportar resultado</button></div>`;
    }
    function renderPlay() {
        if (!engine) return;
        const w = stateView(),
            actual = engine.current();
        $('#sa-phase').textContent = phaseLabel(w);
        const runStatus = document.getElementById('run-status');
        if (runStatus) runStatus.textContent = `Simulação narrativa · Seed: ${actual.config.seed}`;
        $('#sa-alive-count').textContent =
            `${w.players.filter((p) => p.status === 'alive').length}/${w.players.length} vivos`;
        $('#sa-view-message').classList.toggle('hidden', viewed === null);
        $('#sa-view-message').textContent =
            viewed === null
                ? ''
                : `Consultando o passado: acontecimento #${viewed}. O mundo atual continua preservado.`;
        $('#sa-tabs')
            .querySelectorAll('button')
            .forEach((b) => {
                b.setAttribute('aria-selected', String(b.dataset.tab === tab));
                b.tabIndex = b.dataset.tab === tab ? 0 : -1;
            });
        $('#sa-panel').setAttribute('aria-labelledby', `sa-tab-${tab}`);
        $('#sa-panel').innerHTML =
            tab === 'story'
                ? story(w)
                : tab === 'map'
                  ? `${map(w)}<div class="sa-region-list">${w.regions.map((r) => `<button data-region="${r.id}">${esc(r.name)} ${r.closed ? '· fechada' : ''}${r.environment ? ' · ⚠ ' + esc(environmentLabels[r.environment.kind]) : ''} · ${w.players.filter((p) => p.status === 'alive' && p.location === r.id).length} vivos</button>`).join('')}</div>`
                  : tab === 'players'
                    ? participants(w)
                    : tab === 'history'
                      ? historyPanel()
                      : result(actual);
        $('#sa-auto').textContent = playing ? 'Pausar reprodução' : '▶ Reproduzir';
        $('#sa-auto').disabled = actual.finished || viewed !== null;
        for (const id of ['sa-next', 'sa-period', 'sa-day'])
            $('#' + id).disabled = actual.finished || viewed !== null;
        $('#sa-present').classList.toggle('hidden', viewed === null);
        loadPortraits();
    }
    function inspectPerson(id) {
        const w = stateView(),
            p = w.players.find((p) => p.id === id);
        if (!p) return;
        inspected = id;
        const items = p.inventory.map((i) => w.items[i]),
            weapon = w.items[p.equipped];
        const events = engine.state.history
            .filter(
                (e) =>
                    e.id <= (viewed ?? Infinity) &&
                    (e.participants.includes(id) || e.changes.players.some((c) => c.id === id))
            )
            .slice(-30);
        $('#sa-detail-body').innerHTML =
            `${avatar(p)}<h2>${esc(p.name)}</h2><p>${esc(p.universe)} · Distrito ${p.district} · ${esc(genderNames[p.gender])}</p><p>${esc(p.source)}</p>${p.imageKind === 'actor' ? '<small>Foto do intérprete; representa este personagem.</small>' : ''}${ArenaAccess.imageUrl(p.imageSource) ? `<p><a href="${esc(p.imageSource)}" target="_blank" rel="noopener noreferrer">Fonte da imagem</a></p>` : ''}<p>${p.status === 'alive' ? `♥ ${p.health} saúde · ${p.energy} energia · ${p.hunger} fome · ${p.thirst} sede` : `Eliminação: ${esc(p.death.reason)}`}</p><p>Moral: ${p.morale} · ${esc(behaviorNames[p.behavior])} · ${p.hidden ? 'Oculto' : 'Visível'}${p.poisoned ? ' · Intoxicado' : ''}</p><p>Turno neste período: ${w.queue.includes(p.id) && p.status === 'alive' ? 'disponível' : 'já utilizado ou eliminado'}</p><p>Efeitos temporários: ${p.effects?.map((e) => `${esc(e.name)} · ${esc(data.attributes[e.attribute])} ${e.amount > 0 ? '+' : ''}${e.amount} · ${e.remaining} períodos`).join('; ') || 'nenhum'}</p><p>Local: ${esc(w.regions.find((r) => r.id === p.location).name)}</p><p>Equipamento: ${weapon ? esc(itemInfo(weapon.kind).name) + (itemInfo(weapon.kind).ammo && !ArenaEngine.usableWeapon(w, p, data) ? ' (sem munição)' : '') : 'Sem arma equipada'}</p><p>${p.bleeding ? `Sangramento: ${p.bleeding} turnos restantes` : 'Sem sangramento'}</p><div class="sa-stat-grid">${Object.entries(
                data.attributes
            )
                .map(
                    ([key, label]) =>
                        `<span>${label}<strong>${ArenaEngine.effectiveAttributes(p)[key]}/10 <small>base ${p.attributes[key]}</small></strong></span>`
                )
                .join(
                    ''
                )}</div><h3>Inventário</h3><p>${items.map((i) => `${esc(itemInfo(i.kind).name)}${i.charges !== undefined ? ` ×${i.charges}` : ''}`).join(' · ') || 'Vazio'}</p><h3>Alianças</h3><p>${p.allies.map((i) => esc(w.players.find((p) => p.id === i).name)).join(' · ') || 'Nenhuma aliança ativa'}</p><h3>Últimos acontecimentos</h3>${historyRows(events)}`;
        openDetail();
        loadPortraits();
    }
    function editPerson(id, savedId = null) {
        libraryEditing = savedId;
        const p = savedId === 'new' ? libraryCandidate : savedId ? ArenaAccess.library().characters.find(c => c.id === savedId)?.character : draft.characters.find((p) => p.id === id);
        if (!p) return;
        const defs = ArenaEngine.definitions(draft, data).items;
        inspected = id;
        $('#sa-detail-body').innerHTML =
            `<h2>Editar participante</h2><form id="sa-edit-form"><label>Nome<input name="name" value="${esc(p.name)}" maxlength="60" required></label><label>Universo<input name="universe" value="${esc(p.universe)}" maxlength="80" required></label><label>Distrito<select name="district"><option value="">Distribuição automática</option>${Array.from({ length: 12 }, (_, i) => `<option value="${i+1}" ${p.district === i+1 ? 'selected' : ''}>Distrito ${i+1}</option>`).join('')}</select></label><label>Gênero informado<select name="gender">${Object.entries(
                genderNames
            )
                .map(
                    ([k, v]) =>
                        `<option value="${k}" ${k === p.gender ? 'selected' : ''}>${v}</option>`
                )
                .join(
                    ''
                )}</select></label><label>Comportamento<select name="behavior">${Object.entries(
                behaviorNames
            )
                .map(
                    ([k, v]) =>
                        `<option value="${k}" ${p.behavior === k ? 'selected' : ''}>${v}</option>`
                )
                .join(
                    ''
                )}</select></label><label>Foto por URL HTTPS<input name="image" type="url" value="${esc(p.image?.startsWith('https:') ? p.image : '')}" placeholder="https://..."></label>${avatar(p)}<fieldset class="sa-attribute-edit"><legend>Atributos 1–10 · orçamento ${draft.pointBudget} pontos</legend>${Object.entries(
                data.attributes
            )
                .map(
                    ([k, v]) =>
                        `<label>${v}<input name="${k}" type="number" min="1" max="10" value="${p.attributes[k]}" required></label>`
                )
                .join(
                    ''
                )}</fieldset><p>Todos começam sem equipamentos. Itens de arquivos antigos são preservados apenas para compatibilidade.</p><label class="sa-photo-reset"><input name="resetPhoto" type="checkbox">Usar a foto original do catálogo</label><label>Retrato personalizado (opcional)<input id="sa-portrait-file" type="file" accept="image/png,image/jpeg,image/webp"></label><small>Até 250 KB. A imagem fica neste navegador e acompanha os backups exportados.</small><div class="sa-buttons"><button type="button" data-randomstats="${esc(p.id)}">Sortear atributos</button><button type="submit">Salvar participante</button></div></form>`;
        openDetail();
    }
    function inspectRegion(id) {
        const w = stateView(),
            r = w.regions.find((r) => r.id === id);
        if (!r) return;
        $('#sa-detail-body').innerHTML =
            `<h2>${esc(r.name)}</h2><p>${r.closed ? 'Região fechada: permanência causa dano.' : 'Região aberta.'} Risco de imprevistos: ${r.risk}/3. ${r.environment ? esc(environmentLabels[r.environment.kind]) + ': ' + r.environment.remaining + ' períodos restantes.' : 'Sem perigo temporário.'}</p><p>Fontes naturais: ${[r.waterSource ? 'água (' + r.waterStock + ' coletas)' : '', r.foodSource ? 'alimento (' + r.foodStock + ' coletas)' : ''].filter(Boolean).join(' e ') || 'nenhuma'}. Armadilhas ativas: ${Object.values(w.traps).filter((t) => t.region === id && t.active).length}.</p><p>Conexões: ${r.links.map((i) => esc(w.regions.find((x) => x.id === i).name)).join(' · ')}</p><p>Recursos no local: ${
                Object.values(w.items)
                    .filter((i) => i.owner === id)
                    .map((i) => esc(itemInfo(i.kind).name))
                    .join(' · ') || 'Nenhum item disponível'
            }</p><h3>Ocupantes vivos</h3>${participantCards(w.players.filter((p) => p.status === 'alive' && p.location === id))}`;
        openDetail();
        loadPortraits();
    }
    async function importFile(file) {
        if (!file || file.size > 64 * 1024 * 1024) throw Error('Use um JSON de até 64 MB, incluindo os retratos.');
        let parsed;
        try {
            parsed = JSON.parse(await file.text());
        } catch {
            throw Error('Esse arquivo não contém JSON válido.');
        }
        if (!session.alive) return;
        if (!parsed || typeof parsed !== 'object') throw Error('Arquivo de arena inválido.');
        if (![1, 2, 3, ArenaEngine.version].includes(parsed.version))
            throw Error('Versão de arquivo incompatível.');
        if (parsed.format === 'orbita-arena-library') {
            await ArenaAccess.importLibrary(parsed, data);
            renderLibrary(); presetsRefresh(); switchPrep('library');
            status('Biblioteca e retratos importados neste dispositivo. Os originais foram preservados.');
            return;
        }
        if (parsed.format === 'orbita-arena-save') {
            if (![1, 2, 3, ArenaEngine.version].includes(parsed.world?.version))
                throw Error('Versão de competição incompatível.');
            if (parsed.world?.version < ArenaEngine.version) {
                draft = validateRosterDraft(
                    { ...parsed.world.config, characters: hydrate(parsed.world.config.characters) },
                    data
                );
                await ArenaAccess.importPortraits(parsed.portraits);
                stopAuto();
                engine = null;
                ArenaAccess.write(`legacy-save-v${parsed.world.version}`, parsed.world);
                if (!ArenaAccess.read('legacy-save'))
                    ArenaAccess.write('legacy-save', parsed.world);
                $('#sa-play').classList.add('hidden');
                $('#sa-setup').classList.remove('hidden');
                fillSetup();
                renderRoster();
                switchPrep('roster');
                status(
                    'Elenco do save anterior recuperado. Inicie uma competição com as regras novas; o histórico original foi preservado.'
                );
                return;
            }
            const restored = ArenaEngine.restore(parsed.world, data);
            await ArenaAccess.importPortraits(parsed.portraits);
            engine = restored;
            draft = engine.current().config;
            stopAuto();
            showPlay();
            save();
            status('Partida restaurada.');
        } else if (parsed.format === 'orbita-arena-config' || parsed.format === 'orbita-roster') {
            const imported = validateRosterDraft(
                parsed.format === 'orbita-roster'
                    ? {
                          ...draft,
                          ...rosterSettings(parsed.settings),
                          characters: hydrate(parsed.characters)
                      }
                    : { ...parsed.config, characters: hydrate(parsed.config.characters) },
                data
            );
            await ArenaAccess.importPortraits(parsed.portraits);
            draft = imported;
            fillSetup();
            renderRoster();
            status('Configuração importada e validada.');
        } else
            throw Error(
                'Formato não reconhecido. Use um elenco, configuração ou save da Arena Improvável.'
            );
    }
    function openDetail() {
        if ($('#sa-detail').classList.contains('hidden')) returnFocus = document.activeElement;
        $('#sa-detail').classList.remove('hidden');
        $('#sa-setup').inert = true;
        $('#sa-play').inert = true;
        $('#sa-detail-close').focus();
    }
    function closeDetail() {
        $('#sa-detail').classList.add('hidden');
        $('#sa-setup').inert = false;
        $('#sa-play').inert = false;
        if (returnFocus?.isConnected) returnFocus.focus();
    }
    function fillSetup() {
        for (const [id, key] of [
            ['sa-seed', 'seed'],
            ['sa-arena', 'arena'],
            ['sa-pace', 'pace'],
            ['sa-hostility', 'hostility'],
            ['sa-topology', 'topology'],
            ['sa-behavior', 'behavior'],
            ['sa-abundance', 'abundance'],
            ['sa-incidents', 'incidents'],
            ['sa-hazards', 'hazards'],
            ['sa-kit', 'startingKit']
        ])
            $('#' + id).value = draft[key];
        $('#sa-count').value = draft.characters.length;
        $('#sa-budget').value = draft.pointBudget;
        $('#sa-balance').checked = draft.balance;
        renderWeapons();
        renderMapPreview();
        $('#sa-alliances').checked = draft.alliances;
        $('#sa-humor').checked = draft.humor;
    }
    async function downloadPortable(name, value) {
        ArenaAccess.download(name, await ArenaAccess.portable(value));
    }
    function rosterList() {
        return ArenaAccess.read('rosters', []).filter(
            (r) => r && typeof r.name === 'string' && Array.isArray(r.characters)
        );
    }
    async function init(config) {
        data = await GameData.load('arena');
        if (!session.alive) return;
        setupRandom = SeededRandom.create(config.seed).fork('setup');
        catalogue = [
            ...data.characters,
            ...ArenaAccess.read('catalog', []).filter(
                (c) =>
                    c &&
                    typeof c.id === 'string' &&
                    typeof c.name === 'string' &&
                    !data.characters.some((p) => p.id === c.id)
            )
        ];
        draft = {
            pointBudget: 36,
            balance: true,
            behavior: 'random',
            topology: 'biome',
            abundance: 'normal',
            incidents: 'normal',
            hazards: 'low',
            startingKit: 'none',
            customWeapons: [],
            weapons: Object.keys(data.items).filter((k) => data.items[k].type === 'weapon'),
            seed: config.seed,
            arena: config.options.arena || 'forest',
            pace: 'normal',
            hostility: 'balanced',
            alliances: true,
            humor: true,
            characters: []
        };
        $ = GameUI.shell(
            session,
            'Arena Improvável',
            'Escolha personagens no catálogo ou na sua biblioteca, revise os distritos e inicie a competição. Todos entram de mãos vazias: água, comida e equipamento precisam ser encontrados nos campos. Você acompanha a história com Próximo acontecimento ou Reproduzir. O mapa mostra recursos, aliados e perigos; toque num personagem para abrir sua ficha. Consequências e rolagens ficam nos detalhes. Abrir esta ajuda pausa a reprodução e fechá-la retoma o ritmo anterior. A mesma seed, elenco e versão de regras reproduzem os acontecimentos.',
            `
        <div class="simulator"><p id="sa-status" role="status"></p><section id="sa-setup" class="sa-setup"><div class="sa-prep-scroll"><div class="sa-setup-head"><div><span>ARENA IMPROVÁVEL · RPG NARRATIVO</span><h2>Prepare seu elenco.</h2></div><button id="sa-resume" class="${ArenaAccess.read('save') ? '' : 'hidden'}">${ArenaAccess.read('save')?.version < ArenaEngine.version ? 'Recuperar elenco anterior' : 'Reabrir última arena'}</button></div>
        <nav class="sa-prep-tabs" aria-label="Preparação da competição"><button data-preptab="roster" aria-pressed="true">Meu elenco</button><button data-preptab="catalog" aria-pressed="false">Catálogo com fotos</button><button data-preptab="library" aria-pressed="false">Minha biblioteca</button><button data-preptab="arena" aria-pressed="false">Arena e regras</button></nav>
        <section data-prep-panel="roster"><div class="sa-cast-toolbar"><strong id="sa-roster-count"></strong><button id="sa-add">Criar personagem</button><button id="sa-districts">Distribuir distritos</button><details class="sa-roster-tools"><summary>Ajustar elenco</summary><button id="sa-random-all">Sortear atributos de todos</button><button id="sa-balance-all">Equilibrar pontos</button><button id="sa-clear-roster">Limpar elenco</button></details></div><details class="sa-rules sa-draw-disclosure"><summary>Sortear outro elenco</summary><div class="sa-draw-controls"><label>Participantes no sorteio<input id="sa-count" type="number" min="2" max="48" value="${config.options.count || 12}"></label><button id="sa-draw">Sortear elenco</button><button data-preptab="catalog">Escolher personagens →</button></div></details><p class="sa-prep-note">Distritos independem das obras. Edite os cartões para escolher distrito e personalidade.</p><div id="sa-roster" class="sa-roster"></div><details class="sa-rules"><summary>Meus elencos e arquivos</summary><div class="sa-buttons"><input id="sa-roster-name" placeholder="Nome do elenco" maxlength="60" aria-label="Nome do elenco favorito"><button id="sa-save-roster">Salvar elenco favorito</button><select id="sa-roster-presets" aria-label="Elencos favoritos"><option value="">Escolher elenco salvo</option></select><button id="sa-export-roster">Exportar elenco JSON</button><button id="sa-export-config">Compartilhar configuração JSON</button><button id="sa-export-legacy">Exportar save anterior</button></div><label>Importar elenco, configuração ou save JSON<input id="sa-import" type="file" accept="application/json,.json"></label></details></section>
        <section data-prep-panel="catalog" class="hidden"><div class="sa-catalog-filters"><label>Tipo<select id="sa-theme"><option value="mix">Todos os tipos</option>${data.types.map((t) => `<option value="${t.id}">${esc(t.label)}</option>`).join('')}</select></label><label>Tema / obra<select id="sa-universe"><option value="">Todas as obras</option></select></label><label>Buscar no tema<input id="sa-catalog-search" type="search" placeholder="Nome do personagem"></label></div><details class="sa-rules"><summary>Buscar jogos, filmes e séries na internet</summary><form id="sa-api-form" class="sa-api-search"><label>Buscar em<select id="sa-api-kind"><option value="tv">Séries / TV Show</option><option value="movies">Filmes</option><option value="games">Videogames</option></select></label><label>Nome da obra<input id="sa-api-query" placeholder="The Last of Us, iCarly, Star Wars…" maxlength="80"></label><button>Buscar</button></form><p>Escolha a obra e o ano; depois selecione os personagens. Algumas fontes oferecem a foto do intérprete, identificada no cartão. Jogos e filmes mostram personagens vinculados à edição escolhida na fonte; as listas podem estar incompletas. Videogames nunca usam fotos de dubladores ou desenvolvedores como personagens.</p><div id="sa-api-results"></div><small>Jogos e filmes: <a href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer">Wikidata</a> · Séries: <a href="https://www.tvmaze.com" target="_blank" rel="noopener noreferrer">TVmaze</a>. Fotos locais: Wikimedia, TVmaze e AniList, com fonte na ficha.</small></details><div class="sa-buttons"><strong id="sa-catalog-count"></strong><button id="sa-add-theme">Adicionar tema ao elenco</button><button id="sa-replace-theme">Usar somente este tema</button></div><div id="sa-catalog-grid" class="sa-catalog-grid"></div></section>
        <section data-prep-panel="library" class="hidden"><div class="sa-library-head"><h3>Seu acervo de personagens</h3><span class="sa-storage-state">Salvo neste dispositivo · nuvem não configurada</span><p>Guarde personagens sem incluí-los na arena. Cada inclusão no elenco cria uma cópia independente.</p></div><div class="sa-catalog-filters"><label>Pasta<select id="sa-library-folder"></select></label><label>Buscar na pasta<input id="sa-library-search" type="search" placeholder="Nome ou obra"></label><button id="sa-library-create">Criar personagem na biblioteca</button></div><details class="sa-rules"><summary>Organizar pastas e backups</summary><div class="sa-buttons"><input id="sa-folder-name" maxlength="60" placeholder="Nome da pasta" aria-label="Nome da pasta"><button id="sa-folder-create">Criar pasta</button><button id="sa-folder-rename">Renomear pasta atual</button><button id="sa-folder-delete">Excluir pasta atual</button><button id="sa-library-export">Exportar biblioteca e retratos</button></div><p>Ao excluir uma pasta, seus personagens voltam para a pasta principal. Para transportar o acervo, exporte um backup e importe-o no outro dispositivo.</p><label>Importar backup da biblioteca<input id="sa-library-import" type="file" accept="application/json,.json"></label><a href="./docs/ARENA_EVOLUCAO.md" target="_blank" rel="noopener">Sobre a sincronização em nuvem</a></details><div id="sa-library-grid" class="sa-catalog-grid"></div></section><section data-prep-panel="arena" class="hidden"><div class="sa-prep-controls"><label>Arena<select id="sa-arena">${data.arenas.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join('')}</select></label><label>Forma do mapa<select id="sa-topology"><option value="biome">Desenho do bioma</option><option value="ring">Anel com passagens</option><option value="grid">Grade urbana</option><option value="branch">Ramificações</option></select></label><label>Recursos<select id="sa-abundance"><option value="scarce">Escassos</option><option value="normal" selected>Normais</option><option value="rich">Abundantes</option></select></label><label>Início da competição<select id="sa-kit" disabled><option value="none">De mãos vazias</option></select></label></div><p id="sa-arena-description"></p><div id="sa-map-preview" class="sa-map-preview"></div>
        <div class="sa-prep-controls"><label>Perfil geral dos NPCs<select id="sa-behavior">${Object.entries(
            behaviorNames
        )
            .filter(([k]) => k !== 'inherit')
            .map(([k, v]) => `<option value="${k}">${v}</option>`)
            .join(
                ''
            )}</select></label><label>Confrontos<select id="sa-hostility"><option value="calm">Menos frequentes</option><option value="balanced" selected>Equilibrados</option><option value="chaos">Frequentes</option></select></label><label>Imprevistos<select id="sa-incidents"><option value="low">Poucos</option><option value="normal" selected>Normais</option><option value="high">Muitos</option></select></label><label>Dano ambiental<select id="sa-hazards"><option value="low" selected>Baixo</option><option value="normal">Normal</option><option value="high">Alto</option></select></label></div><div class="sa-prep-controls"><label>Orçamento por personagem<input id="sa-budget" type="number" min="6" max="60" value="36"></label><label>Seed<input id="sa-seed" value="${esc(config.seed)}" maxlength="32"></label><label>Ritmo do cerco<select id="sa-pace"><option value="short" selected>Começa no dia 3 · limite de 16 dias</option><option value="normal">Começa no dia 5 · limite de 20 dias</option><option value="slow">Começa no dia 8 · limite de 26 dias</option></select></label><label>Excluir obras do sorteio<input id="sa-exclude" placeholder="Dragon Ball, Marvel"></label></div><div class="sa-checkboxes"><label><input id="sa-balance" type="checkbox" checked>Mesmo total de pontos para todos</label><label><input id="sa-mixed" type="checkbox" checked>Misturar obras</label><label><input id="sa-duplicates" type="checkbox">Permitir cópias do mesmo personagem</label><label><input id="sa-alliances" type="checkbox" checked>Alianças e persuasão</label><label><input id="sa-humor" type="checkbox" checked>Humor</label><label><input id="sa-quotas" type="checkbox">Cotas de gênero no sorteio</label></div><div class="sa-quota-grid">${['male', 'female', 'other', 'unknown'].map((g) => `<label>${genderNames[g]}<input id="sa-${g}" type="number" min="0" max="48" value="0"></label>`).join('')}</div><p>Cotas somam o total do sorteio. Atributos vão de 1 a 10; o orçamento padrão soma 36, média 6. O cerco fecha setores sem isolar rotas de fuga. Cada NPC tem um turno de dia e um de noite, além da abertura. Aliados podem explorar separadamente e se reencontrar. Ao lutar juntos, cada apoiador precisa estar presente e disponível. Perigos locais podem separar grupos; explosivos atingem também aliados. Fontes naturais se esgotam e se recuperam lentamente. O limite varia com o ritmo escolhido.</p>
        <details class="sa-rules"><summary>Armas disponíveis e armas próprias</summary><div id="sa-weapons" class="sa-weapon-list"></div><form id="sa-weapon-form" class="sa-prep-controls"><label>Nome<input name="weaponName" required maxlength="40" placeholder="Ex.: bastão elétrico"></label><label>Potência 3–18<input name="weaponPower" type="number" min="3" max="18" value="10" required></label><label>Atributo principal<select name="weaponAttribute">${['strength', 'agility', 'cunning', 'perception'].map((k) => `<option value="${k}">${data.attributes[k]}</option>`).join('')}</select></label><label>Munição<select name="weaponAmmo"><option value="">Não precisa</option><option value="arrows">Flechas</option><option value="stones">Pedras</option></select></label><button>Adicionar arma</button></form></details></section>
        </div><div class="sa-startbar"><small id="sa-ready" role="status">Escolha pelo menos 2 participantes.</small><button id="sa-start" class="button button-primary">Iniciar competição →</button></div></section>
        <section id="sa-play" class="sa-play hidden"><div class="sa-play-head"><strong id="sa-phase"></strong><span id="sa-alive-count"></span><button id="sa-save">Guardar agora</button><button id="sa-export-save">Exportar save</button><button id="sa-prep">Editar próxima arena</button></div><p id="sa-view-message" class="hidden"></p><nav id="sa-tabs" class="sa-tabs" role="tablist">${[
            ['story', 'História'],
            ['map', 'Mapa'],
            ['players', 'Elenco'],
            ['history', 'Histórico'],
            ['result', 'Resultado']
        ]
            .map(
                ([id, label]) =>
                    `<button id="sa-tab-${id}" data-tab="${id}" role="tab" aria-controls="sa-panel" aria-selected="false">${label}</button>`
            )
            .join(
                ''
            )}</nav><div id="sa-panel" class="sa-panel" role="tabpanel"></div><footer class="sa-play-controls"><button id="sa-next">Próximo evento</button><button id="sa-period">Avançar período</button><button id="sa-day">Avançar dia</button><button id="sa-auto">▶ Reproduzir</button><label>Ritmo<select id="sa-speed" aria-label="Velocidade da reprodução"><option value="1600">Calmo</option><option value="800" selected>Normal</option><option value="250">Rápido</option></select></label><button id="sa-present" class="hidden">Voltar ao presente</button></footer></section>
        <section id="sa-detail" class="sa-detail hidden" role="dialog" aria-modal="true" aria-label="Ficha da arena"><button id="sa-detail-close" aria-label="Fechar ficha">Fechar ×</button><div id="sa-detail-body"></div></section></div>`
        );
        $('#sa-arena').value = draft.arena;
        renderThemes();
        renderWeapons();
        drawCast();
        renderMapPreview();
        const describe = () => {
            $('#sa-arena-description').textContent = data.arenas.find(
                (a) => a.id === $('#sa-arena').value
            ).description;
        };
        describe();
        session.listen($('#sa-arena'), 'change', () => {
            describe();
            renderMapPreview();
        });
        session.listen($('#sa-topology'), 'change', renderMapPreview);
        session.listen($('#sa-theme'), 'change', renderThemes);
        session.listen($('#sa-universe'), 'change', renderCatalog);
        session.listen($('#sa-catalog-search'), 'input', renderCatalog);
        function safe(action) {
            return (...args) => {
                try {
                    const value = action(...args);
                    if (value?.catch)
                        value.catch((error) => {
                            if (session.alive) status(error.message);
                        });
                } catch (error) {
                    status(error.message);
                }
            };
        }
        for (const [id, fn] of [
            ['sa-draw', drawCast],
            ['sa-start', startDraft],
            [
                'sa-add',
                () => {
                    if (draft.characters.length >= 48) throw Error('O limite é 48 participantes.');
                    const p = makeCharacter(
                        {
                            id: 'custom',
                            name: 'Novo participante',
                            universe: 'Criação própria',
                            gender: 'unknown',
                            theme: 'custom',
                            source: 'Criação manual',
                            type: 'custom',
                            image: null
                        },
                        ++replacing + 100
                    );
                    draft.characters.push(p);
                    renderRoster();
                    editPerson(p.id);
                }
            ],
            [
                'sa-random-all',
                () => {
                    for (const p of draft.characters) p.attributes = randomStats(p.behavior);
                    renderRoster();
                    status('Atributos sorteados.');
                }
            ],
            ['sa-next', () => advance()],
            ['sa-period', () => advance('period')],
            ['sa-day', () => advance('day')],
            [
                'sa-save',
                () => {
                    save();
                    if (savingOK) status('Partida guardada neste navegador.');
                }
            ],
            [
                'sa-export-save',
                () =>
                    downloadPortable('arena-save.json', {
                        format: 'orbita-arena-save',
                        version: ArenaEngine.version,
                        world: engine.state
                    })
            ],
            [
                'sa-export-roster',
                () =>
                    downloadPortable('elenco-arena.json', {
                        format: 'orbita-roster',
                        version: ArenaEngine.version,
                        characters: draft.characters,
                        settings: rosterSettings(draft)
                    })
            ],
            [
                'sa-export-config',
                () =>
                    downloadPortable('configuracao-arena.json', {
                        format: 'orbita-arena-config',
                        version: ArenaEngine.version,
                        config: updateDraft()
                    })
            ],
            [
                'sa-resume',
                () => {
                    if (engine) {
                        draft = engine.current().config;
                        showPlay();
                        status('Competição retomada no mesmo acontecimento.');
                        return;
                    }
                    const previous = ArenaAccess.read('save');
                    if (previous?.version < ArenaEngine.version) {
                        draft = ArenaEngine.validateConfig(
                            { ...previous.config, characters: hydrate(previous.config.characters) },
                            data
                        );
                        fillSetup();
                        renderRoster();
                        switchPrep('roster');
                        status(
                            'Elenco anterior recuperado. As regras mudaram; inicie uma nova competição. O save original será preservado.'
                        );
                        return;
                    }
                    engine = ArenaEngine.restore(previous, data);
                    draft = engine.current().config;
                    showPlay();
                    status('Última arena reaberta. A sequência aleatória foi preservada.');
                }
            ],
            [
                'sa-prep',
                () => {
                    stopAuto();
                    draft = engine.current().config;
                    $('#sa-play').classList.add('hidden');
                    $('#sa-setup').classList.remove('hidden');
                    $('#sa-resume').classList.remove('hidden');
                    $('#sa-resume').textContent = 'Voltar à competição';
                    fillSetup();
                    renderRoster();
                }
            ],
            [
                'sa-present',
                () => {
                    viewed = null;
                    renderPlay();
                }
            ]
        ])
            session.listen($('#' + id), 'click', safe(fn));
        for (const [id, fn] of [
            [
                'sa-clear-roster',
                () => {
                    draft.characters = [];
                    renderRoster();
                    status('Elenco vazio. Adicione personagens pelo catálogo ou crie o primeiro.');
                }
            ],
            [
                'sa-balance-all',
                () => {
                    draft.pointBudget = Number($('#sa-budget').value);
                    for (const c of draft.characters)
                        c.attributes = ArenaEngine.balanceAttributes(
                            c.attributes,
                            draft.pointBudget
                        );
                    renderRoster();
                    status(
                        `Todos têm ${draft.pointBudget} pontos, média ${(draft.pointBudget / 6).toFixed(1)}.`
                    );
                }
            ],
            [
                'sa-add-theme',
                () => {
                    let count = 0;
                    for (const c of catalogPool()) {
                        if (draft.characters.length >= ArenaEngine.maxPlayers) break;
                        if (addCatalogCharacter(c)) count++;
                    }
                    renderRoster();
                    renderCatalog();
                    status(`${count} personagens adicionados ao elenco.`);
                }
            ],
            [
                'sa-replace-theme',
                () => {
                    const pool = catalogPool();
                    if (!pool.length) throw Error('Este tema não tem personagens.');
                    draft.characters = [];
                    for (const c of pool.slice(0, ArenaEngine.maxPlayers)) addCatalogCharacter(c);
                    $('#sa-count').value = draft.characters.length;
                    renderRoster();
                    renderCatalog();
                    switchPrep('roster');
                    status('Elenco substituído pelo tema escolhido.');
                }
            ],
            [
                'sa-export-legacy',
                () => {
                    const current = ArenaAccess.read('save');
                    const old =
                        current?.version < ArenaEngine.version
                            ? current
                            : ArenaAccess.read('legacy-save-v2') ||
                              ArenaAccess.read('legacy-save-v1') ||
                              ArenaAccess.read('legacy-save');
                    if (!old) throw Error('Não há save antigo para exportar.');
                    ArenaAccess.download('arena-save-anterior.json', {
                        format: 'orbita-arena-save',
                        version: old.version,
                        world: old
                    });
                }
            ]
        ])
            session.listen($('#' + id), 'click', safe(fn));
        for (const id of ['sa-budget', 'sa-balance'])
            session.listen(
                $('#' + id),
                'change',
                safe(() => {
                    const budget = Number($('#sa-budget').value);
                    ArenaEngine.balanceAttributes({}, budget);
                    draft.pointBudget = budget;
                    draft.balance = $('#sa-balance').checked;
                    if (draft.balance) {
                        for (const c of draft.characters)
                            c.attributes = ArenaEngine.balanceAttributes(c.attributes, budget);
                        renderRoster();
                    }
                })
            );
        session.listen($('#sa-weapons'), 'change', () => {
            draft.weapons = [...$('#sa-weapons').querySelectorAll('[data-weapon]:checked')].map(
                (e) => e.dataset.weapon
            );
        });
        session.listen(
            $('#sa-weapon-form'),
            'submit',
            safe((event) => {
                event.preventDefault();
                const values = new FormData(event.target);
                const item = {
                    id: `custom-${draft.customWeapons.length + 1}`,
                    name: values.get('weaponName'),
                    power: Number(values.get('weaponPower')),
                    attribute: values.get('weaponAttribute'),
                    ammo: values.get('weaponAmmo') || null
                };
                const normalized = validateRosterDraft(
                    {
                        ...draft,
                        customWeapons: [...draft.customWeapons, item],
                        weapons: [...draft.weapons, item.id]
                    },
                    data
                );
                draft = normalized;
                renderWeapons();
                status(`${item.name} entrou no arsenal disponível.`);
            })
        );
        session.listen($('#sa-api-kind'), 'change', () => {
            controller?.abort();
            controller = null;
            $('#sa-theme').value = $('#sa-api-kind').value;
            $('#sa-api-results').innerHTML = '';
            renderThemes();
        });
        session.listen(
            $('#sa-api-results'),
            'click',
            safe(async (event) => {
                const b = event.target.closest('[data-showid],[data-filmid],[data-gameid]');
                if (!b) return;
                controller?.abort();
                controller = new AbortController();
                const active = controller,
                    timeout = session.timeout(() => active.abort(), 30000);
                b.disabled = true;
                status('Carregando personagens e fotos da obra…');
                try {
                    const movies = Boolean(b.dataset.filmid), games = Boolean(b.dataset.gameid);
                    const cast = games ? await ArenaAccess.gameCast(b.dataset.gameid, active.signal) : movies
                        ? await ArenaAccess.movieCast(b.dataset.filmid, active.signal)
                        : await ArenaAccess.showCast(Number(b.dataset.showid), active.signal);
                    if (!session.alive || active !== controller) return;
                    const known = catalogue.find((p) => p.id === cast.characters[0]?.id);
                    const themeName =
                        known?.universe ||
                        `${cast.name}${cast.year ? ` (${cast.year})` : ''}`.slice(0, 80);
                    for (const c of cast.characters) {
                        const matches = movies
                            ? data.characters.filter((p) => {
                                  const old = GameArt.normalize(p.name),
                                      next = GameArt.normalize(c.name);
                                  return (
                                      old === next ||
                                      (old.length >= 5 && next.startsWith(old + ' '))
                                  );
                              })
                            : [];
                        const portrait = matches.length === 1 ? matches[0] : null;
                        const entry = {
                            ...c,
                            ...(portrait
                                ? {
                                      image: portrait.image,
                                      imageSource: portrait.imageSource,
                                      imageKind: portrait.imageKind
                                  }
                                : {}),
                            universe: themeName
                        };
                        const existing = catalogue.findIndex((p) => p.id === c.id);
                        if (existing < 0) catalogue.push(entry);
                        else catalogue[existing] = entry;
                    }
                    ArenaAccess.write(
                        'catalog',
                        catalogue
                            .filter((c) => !data.characters.some((p) => p.id === c.id))
                            .slice(-500)
                    );
                    $('#sa-theme').value = games ? 'games' : movies ? 'movies' : 'tv';
                    renderThemes();
                    $('#sa-universe').value = themeName;
                    renderCatalog();
                    $('#sa-api-form').closest('details').open = false;
                    $('.sa-prep-scroll').scrollTop = 0;
                    status(
                        `${cast.characters.length} personagens de ${cast.name}. ${movies || games ? 'Papéis confirmados na fonte; o elenco pode ser parcial. ' : ''}Escolha quem entra no elenco.`
                    );
                } catch (error) {
                    if (session.alive && active === controller)
                        status(
                            error.name === 'AbortError'
                                ? 'A busca demorou demais. O catálogo local continua disponível.'
                                : error.message
                        );
                } finally {
                    session.clear(timeout);
                    if (b.isConnected) b.disabled = false;
                }
            })
        );
        const presets = () => {
            const all = rosterList();
            $('#sa-roster-presets').innerHTML =
                '<option value="">Escolher elenco salvo</option>' +
                all.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join('');
        };
        presetsRefresh = presets;
        presets();
        renderLibrary();
        session.listen($('#sa-library-folder'), 'change', () => {
            libraryFolder = $('#sa-library-folder').value;
            $('#sa-folder-name').value = ArenaAccess.library().folders.find(f => f.id === libraryFolder).name;
            renderLibrary();
        });
        session.listen($('#sa-library-search'), 'input', renderLibrary);
        session.listen($('#sa-library-grid'), 'change', safe(event => {
            if (event.target.dataset.librarymove) {
                ArenaAccess.moveCharacter(event.target.dataset.librarymove, event.target.value);
                renderLibrary(); status('Personagem movido. Salvo neste dispositivo.');
            }
        }));
        for (const [id, fn] of [
            ['sa-districts', () => { draft.characters = ArenaEngine.distributeDistricts(draft.characters, false); renderRoster(); status('Distritos distribuídos em grupos equilibrados.'); }],
            ['sa-folder-create', () => { libraryFolder = ArenaAccess.createFolder($('#sa-folder-name').value).id; renderLibrary(); status('Pasta criada neste dispositivo.'); }],
            ['sa-folder-rename', () => { ArenaAccess.renameFolder(libraryFolder, $('#sa-folder-name').value); renderLibrary(); status('Pasta renomeada.'); }],
            ['sa-folder-delete', () => { ArenaAccess.deleteFolder(libraryFolder); libraryFolder = 'folder-default'; renderLibrary(); status('Pasta removida; os personagens voltaram para a pasta principal.'); }],
            ['sa-library-export', async () => ArenaAccess.download('biblioteca-arena.json', await ArenaAccess.exportLibrary())],
            ['sa-library-create', () => {
                libraryCandidate = makeCharacter({ id: 'custom-library', name: 'Novo personagem', universe: 'Criação própria', source: 'Criação manual', type: 'custom', gender: 'unknown' }, ++replacing);
                editPerson(libraryCandidate.id, 'new');
            }]
        ]) session.listen($('#' + id), 'click', safe(fn));
        session.listen($('#sa-library-import'), 'change', safe(() => importFile($('#sa-library-import').files[0])));
        session.listen(
            $('#sa-save-roster'),
            'click',
            safe(() => {
                const name = $('#sa-roster-name').value.trim();
                if (!name) throw Error('Dê um nome ao elenco.');
                const all = rosterList();
                if (all.some(p => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw Error('Já existe um elenco com esse nome. Use outro nome para preservar o original.');
                all.unshift({
                    name,
                    characters: structuredClone(draft.characters),
                    settings: rosterSettings(draft)
                });
                if (!ArenaAccess.write('rosters', all))
                    throw Error('Não foi possível guardar esse elenco.');
                presets();
                status('Elenco favorito salvo.');
            })
        );
        session.listen(
            $('#sa-roster-presets'),
            'change',
            safe(() => {
                if ($('#sa-roster-presets').value === '') return;
                const p = rosterList()[Number($('#sa-roster-presets').value)];
                if (p) {
                    draft = validateRosterDraft(
                        {
                            ...draft,
                            ...rosterSettings(p.settings),
                            characters: hydrate(p.characters)
                        },
                        data
                    );
                    fillSetup();
                    renderRoster();
                }
            })
        );
        session.listen(
            $('#sa-import'),
            'change',
            safe(() => importFile($('#sa-import').files[0]))
        );
        session.listen($('#sa-auto'), 'click', () => {
            if (playing) {
                stopAuto();
                save();
                renderPlay();
            } else {
                playing = true;
                timer = session.interval(
                    () => {
                        if (
                            !session.ui.phaseDisplay
                                .querySelector('#sa-detail')
                                .classList.contains('hidden')
                        )
                            return;
                        advance();
                    },
                    Number($('#sa-speed').value)
                );
                renderPlay();
            }
        });
        session.listen($('#sa-speed'), 'change', () => {
            if (playing) {
                stopAuto();
                $('#sa-auto').click();
            }
        });
        session.listen($('#sa-tabs'), 'click', (event) => {
            const next = event.target.closest('[data-tab]');
            if (next) {
                tab = next.dataset.tab;
                if (!['story', 'map'].includes(tab)) stopAuto();
                renderPlay();
            }
        });
        session.listen($('#sa-detail-close'), 'click', closeDetail);
        session.listen($('#sa-tabs'), 'keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            const buttons = [...$('#sa-tabs').querySelectorAll('button')];
            const index = buttons.indexOf(event.target);
            if (index < 0) return;
            event.preventDefault();
            const next =
                event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? buttons.length - 1
                      : (index + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) %
                        buttons.length;
            buttons[next].click();
            buttons[next].focus();
        });
        session.listen(session.ui.phaseDisplay, 'keydown', (event) => {
            const target = event.target.closest('[data-region]');
            if (target && !event.defaultPrevented && ['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                inspectRegion(target.dataset.region);
            }
            if (event.key === 'Escape' && !$('#sa-detail').classList.contains('hidden')) {
                event.stopPropagation();
                closeDetail();
            }
            if (event.key === 'Tab' && !$('#sa-detail').classList.contains('hidden')) {
                const controls = [
                    ...$('#sa-detail').querySelectorAll('button,input,select,a[href]')
                ].filter((node) => !node.disabled);
                const first = controls[0],
                    last = controls.at(-1);
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
        session.listen(
            session.ui.phaseDisplay,
            'click',
            safe((event) => {
                const button = event.target.closest('button,[data-region]');
                if (!button) return;
                if (button.dataset.preptab) switchPrep(button.dataset.preptab);
                if (button.dataset.catalogadd) {
                    const c = catalogue.find((c) => c.id === button.dataset.catalogadd);
                    if (addCatalogCharacter(c)) {
                        renderRoster();
                        renderCatalog();
                        status(`${c.name} entrou no elenco.`);
                    } else
                        status('Este personagem já está no elenco. Ative cópias para repeti-lo.');
                }
                if (button.dataset.edit) editPerson(button.dataset.edit);
                if (button.dataset.store || button.dataset.catalogstore) {
                    const c = button.dataset.store ? draft.characters.find(c => c.id === button.dataset.store) : catalogue.find(c => c.id === button.dataset.catalogstore);
                    const result = ArenaAccess.saveCharacter(c, libraryFolder, data);
                    renderLibrary();
                    const folderName = ArenaAccess.library().folders.find(f => f.id === libraryFolder)?.name;
                    status(result.duplicate ? 'Este personagem já está na biblioteca; o original foi preservado.' : `Personagem guardado em “${folderName}”, neste dispositivo.`);
                }
                if (button.dataset.libraryadd) {
                    const c = ArenaAccess.library().characters.find(c => c.id === button.dataset.libraryadd)?.character;
                    if (addCatalogCharacter(c)) { renderRoster(); status(`${c.name} entrou no elenco como uma cópia independente.`); }
                    else status('Este personagem já está no elenco. Ative cópias para incluí-lo novamente.');
                }
                if (button.dataset.libraryedit) editPerson(null, button.dataset.libraryedit);
                if (button.dataset.librarydelete) {
                    const id = button.dataset.librarydelete;
                    const existing = ArenaAccess.library().characters.find(c => c.id === id);
                    libraryCandidate = existing;
                    ArenaAccess.deleteCharacter(id); renderLibrary();
                    status('Personagem removido da biblioteca.');
                    const undo = document.createElement('button');
                    undo.textContent = 'Desfazer exclusão';
                    $('#sa-status').append(' ', undo);
                    session.listen(undo, 'click', safe(() => {
                        ArenaAccess.saveCharacter(existing.character, existing.folder, data);
                        renderLibrary(); status('Personagem recuperado.');
                    }));
                }
                if (button.dataset.remove) {
                    draft.characters = draft.characters.filter(
                        (p) => p.id !== button.dataset.remove
                    );
                    renderRoster();
                }
                if (button.dataset.replace) {
                    const p = draft.characters.find((p) => p.id === button.dataset.replace);
                    let pool = catalogPool().filter(
                        (c) =>
                            $('#sa-duplicates').checked ||
                            !draft.characters.some((x) => x.name === c.name)
                    );
                    if ($('#sa-quotas').checked) pool = pool.filter((c) => c.gender === p.gender);
                    if (!pool.length)
                        pool = catalogue.filter(
                            (c) =>
                                c.name !== p.name &&
                                ($('#sa-theme').value === 'mix' || c.type === p.type)
                        );
                    if (!$('#sa-mixed').checked)
                        pool = pool.filter((c) => c.universe === p.universe);
                    if (!pool.length) throw Error('Não há substitutos compatíveis com os filtros.');
                    const replacement = makeCharacter(setupRandom.pick(pool), ++replacing + 200);
                    draft.characters[draft.characters.indexOf(p)] = replacement;
                    renderRoster();
                }
                if (button.dataset.randomstats) {
                    const form = $('#sa-edit-form'),
                        stats = randomStats(form.elements.behavior.value);
                    for (const [key, value] of Object.entries(stats))
                        form.elements[key].value = value;
                }
                if (button.dataset.person) inspectPerson(button.dataset.person);
                if (button.dataset.region && !$('#sa-play').classList.contains('hidden'))
                    inspectRegion(button.dataset.region);
                if (button.dataset.event !== undefined) {
                    stopAuto();
                    viewed = Number(button.dataset.event);
                    tab = 'story';
                    closeDetail();
                    renderPlay();
                }
                if (button.dataset.command === 'repeat' || button.dataset.command === 'newseed') {
                    stopAuto();
                    draft = engine.current().config;
                    if (button.dataset.command === 'newseed') draft.seed = SeededRandom.fresh();
                    engine = ArenaEngine.create(draft, data);
                    save();
                    showPlay();
                }
                if (button.dataset.command === 'morehistory') {
                    historyLimit += 150;
                    $('#sa-history-list').innerHTML = historyRows(filteredHistory, true);
                }
                if (button.dataset.command === 'exportresult')
                    ArenaAccess.download('resultado-arena.json', {
                        format: 'orbita-arena-result',
                        version: ArenaEngine.version,
                        config: engine.current().config,
                        summary: engine.summary(),
                        history: engine.state.history
                    });
                if (button.dataset.apiadd !== undefined) {
                    const c = JSON.parse(button.dataset.apiadd);
                    if (draft.characters.length >= 48) throw Error('Limite de 48 participantes.');
                    draft.characters.push(makeCharacter(c, ++replacing + 300));
                    renderRoster();
                    status(`${c.name} entrou no elenco.`);
                }
            })
        );
        session.listen(
            session.ui.phaseDisplay,
            'submit',
            safe(async (event) => {
                if (event.target.id === 'sa-edit-form') {
                    event.preventDefault();
                    const form = event.target,
                        p = libraryEditing === 'new' ? libraryCandidate : libraryEditing ? ArenaAccess.library().characters.find(c => c.id === libraryEditing)?.character : draft.characters.find((p) => p.id === inspected),
                        values = new FormData(form),
                        edited = {
                            ...p,
                            name: values.get('name'),
                            universe: values.get('universe'),
                            gender: values.get('gender'),
                            behavior: values.get('behavior'),
                            district: values.get('district') ? Number(values.get('district')) : null,
                            image: values.get('image')
                                ? ArenaAccess.imageUrl(values.get('image'))
                                : p.image,
                            imageSource: values.get('image') ? values.get('image') : p.imageSource,
                            imageKind: values.get('image') ? 'custom' : p.imageKind,
                            attributes: Object.fromEntries(
                                Object.keys(data.attributes).map((k) => [k, Number(values.get(k))])
                            ),
                            starting: p.starting || []
                        };
                    if (values.get('resetPhoto')) {
                        const original = catalogue.find((c) => c.id === p.catalogId);
                        edited.image = original?.image || null;
                        edited.portrait = null;
                        edited.imageSource = original?.imageSource || '';
                        edited.imageKind = original?.imageKind || 'custom';
                    } else if (values.get('image')) edited.portrait = null;
                    if (!values.get('resetPhoto') && values.get('image') && !edited.image)
                        throw Error('Use uma URL de imagem HTTPS válida.');
                    const validated = validateRosterDraft(
                        {
                            ...draft,
                            characters: libraryEditing ? [edited] : draft.characters.map((c) => (c.id === p.id ? edited : c))
                        },
                        data
                    );
                    const file = $('#sa-portrait-file').files[0];
                    if (file) {
                        const c = validated.characters.find((c) => c.id === p.id);
                        c.portrait = await ArenaAccess.putPortrait(file);
                        c.imageKind = 'custom';
                        c.imageSource = '';
                    }
                    if (!session.alive) return;
                    if (libraryEditing) {
                        const entry = ArenaAccess.library().characters.find(c => c.id === libraryEditing);
                        const updated = validated.characters[0];
                        updated.district = edited.district;
                        const result = ArenaAccess.saveCharacter(updated, entry?.folder || libraryFolder, data, libraryEditing === 'new' ? null : libraryEditing);
                        if (result.duplicate) throw Error('Já existe um personagem idêntico na biblioteca. A edição original foi preservada.');
                        libraryEditing = null;
                        renderLibrary();
                    } else {
                        draft = validated;
                        // Keep automatic district preference in the preparation rather than freezing validation's assignment.
                        draft.characters.find(c => c.id === p.id).district = edited.district;
                    }
                    closeDetail();
                    renderRoster();
                    status('Participante atualizado.');
                }
                if (event.target.id === 'sa-api-form') {
                    event.preventDefault();
                    controller?.abort();
                    controller = new AbortController();
                    const activeRequest = controller;
                    const timeout = session.timeout(() => activeRequest.abort(), 30000);
                    status('Buscando metadados na fonte externa…');
                    try {
                        const movies = $('#sa-api-kind').value === 'movies', games = $('#sa-api-kind').value === 'games';
                        $('#sa-api-results').innerHTML = '<p role="status">Buscando obras…</p>';
                        const results = await (
                            games ? ArenaAccess.searchGames : movies ? ArenaAccess.searchMovies : ArenaAccess.searchShows
                        )($('#sa-api-query').value, activeRequest.signal);
                        if (!session.alive || activeRequest !== controller) return;
                        $('#sa-api-results').innerHTML =
                            '<div class="sa-show-results">' +
                            results
                                .map(
                                    (show) =>
                                        `<button ${games ? 'data-gameid' : movies ? 'data-filmid' : 'data-showid'}="${esc(show.id)}">${avatar({ id: 'show-' + show.id, name: show.name, image: show.image })}<strong>${esc(show.name)}</strong><small>${esc(show.year)}</small><span>Ver personagens</span></button>`
                                )
                                .join('') +
                            '</div>';
                        loadPortraits();
                        status(
                            results.length
                                ? `${results.length} obras encontradas. Escolha o ano e carregue o elenco.`
                                : 'Nenhuma obra encontrada. Tente o título original ou crie os personagens manualmente.'
                        );
                    } catch (error) {
                        if (session.alive && activeRequest === controller)
                            status(
                                error.name === 'AbortError'
                                    ? 'A busca demorou demais. Tente novamente; o catálogo local continua disponível.'
                                    : error.message
                            );
                    } finally {
                        session.clear(timeout);
                    }
                }
            })
        );
        session.listen(session.ui.phaseDisplay, 'input', (event) => {
            if (event.target.id === 'sa-player-search') {
                const w = stateView(),
                    q = GameArt.normalize(event.target.value);
                $('#sa-player-list').innerHTML = participantCards(
                    w.players.filter(
                        (p) =>
                            GameArt.normalize(p.name + ' ' + p.universe).includes(q) &&
                            ($('#sa-player-filter').value === 'all' ||
                                p.status === $('#sa-player-filter').value)
                    )
                );
                loadPortraits();
            }
        });
        session.listen(session.ui.phaseDisplay, 'change', (event) => {
            if (event.target.id === 'sa-player-filter')
                $('#sa-player-search').dispatchEvent(new Event('input', { bubbles: true }));
            if (event.target.id.startsWith('sa-history-')) {
                historyLimit = 150;
                const person = $('#sa-history-person').value,
                    day = $('#sa-history-day').value,
                    type = $('#sa-history-type').value;
                $('#sa-history-list').innerHTML = historyRows(
                    engine.state.history.filter(
                        (e) =>
                            (!person ||
                                e.participants.includes(person) ||
                                e.changes.players.some((c) => c.id === person)) &&
                            (!day || e.day === Number(day)) &&
                            (!type || e.type === type)
                    ),
                    true
                );
            }
        });
        session.cleanup(() => {
            controller?.abort();
            if (engine) ArenaAccess.write('save', engine.state);
        });
    }
    return { init, destroy: session.destroy };
});
