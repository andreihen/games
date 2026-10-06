GameRegistry.register('worldmap', (session) => {
    async function init(config) {
        const data = await GameData.load('geography');
        if (!session.alive) return;
        const byId = new Map(data.countries.map((c) => [c.id, c])),
            mode = config.options.mode || 'locate',
            typing = config.options.answerMode === 'typing',
            locateOnMap = mode === 'locate' && !typing,
            tier = DifficultyEngine.index(config.difficulty),
            total = [8, 10, 12, 14][tier];
        let pool = data.countries.filter(
            (c) => c.independent && data.world.some((w) => w.id === c.id)
        );
        if (mode === 'capital')
            pool = pool.filter((c) => c.capitals.length && c.quizCapital !== false);
        if (mode === 'neighbors')
            pool = pool.filter((c) => c.mapBorders?.some((id) => byId.has(id)));
        const deck = ReplayEngine.deck(session.random, pool, config.options.recentItems);
        const regions = {
                Americas: 'Américas',
                Europe: 'Europa',
                Africa: 'África',
                Asia: 'Ásia',
                Oceania: 'Oceania',
                Antarctic: 'Antártida'
            },
            oceans = [
                { name: 'Pacífico', lon: -140, lat: 0 },
                { name: 'Atlântico', lon: -30, lat: 0 },
                { name: 'Índico', lon: 80, lat: -20 },
                { name: 'Ártico', lon: 0, lat: 80 },
                { name: 'Antártico', lon: 0, lat: -65 }
            ];
        let index = 0,
            target = null,
            correct = null,
            accepted = [],
            locked = false,
            zoom = 1,
            cx = 360,
            cy = 180,
            drag = null,
            suppressUntil = 0;
        const $ = GameUI.shell(
            session,
            'Mapa Mundi',
            'Use zoom e arraste o mapa para explorar. Os contornos mostram uma cartografia simplificada; você pode navegar pelos países com o teclado.',
            `<p id="map-progress" class="status-line"></p><progress id="map-meter" class="challenge-meter" value="0" max="${total}" aria-label="Explorações respondidas"></progress><p id="map-question" class="notice"></p><div class="controls">${GameUI.button('Zoom +', 'map-in')}${GameUI.button('Zoom −', 'map-out')}${GameUI.button('Centralizar', 'map-reset')}</div><div class="map-frame"><svg id="world-svg" viewBox="0 0 720 360" role="group" aria-label="Mapa interativo do mundo"><g id="map-land"></g><g id="map-marker"></g></svg></div><div id="map-choices" class="option-grid"></div><form id="map-form" class="controls hidden"><input id="map-input" class="compact-field" autocomplete="off" aria-label="Resposta no mapa"><button class="button button-primary">Responder</button></form><p id="map-feedback" class="notice hidden" role="status"></p>${GameUI.button('Próxima rodada', 'map-next', 'primary')}`
        );
        const svg = $('#world-svg'),
            land = $('#map-land'),
            ns = 'http://www.w3.org/2000/svg',
            project = ([lon, lat]) => [2 * (lon + 180), 2 * (90 - lat)];
        function path(coordinates, type) {
            const polygons = type === 'Polygon' ? [coordinates] : coordinates;
            return polygons
                .map((polygon) =>
                    polygon
                        .map(
                            (ring) =>
                                ring
                                    .map((point, i) => {
                                        const [x, y] = project(point);
                                        return `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
                                    })
                                    .join(' ') + 'Z'
                        )
                        .join(' ')
                )
                .join(' ');
        }
        for (const outline of data.world) {
            const country = byId.get(outline.id),
                shape = document.createElementNS(ns, 'path');
            shape.setAttribute('d', path(outline.coordinates, outline.type));
            shape.setAttribute('class', 'map-country');
            if (country) {
                shape.dataset.country = country.id;
                shape.tabIndex = 0;
                shape.setAttribute('role', 'button');
                shape.setAttribute('aria-label', country.name);
            }
            land.append(shape);
        }
        function viewport() {
            const width = 720 / zoom,
                height = 360 / zoom;
            cx = Math.max(width / 2, Math.min(720 - width / 2, cx));
            cy = Math.max(height / 2, Math.min(360 - height / 2, cy));
            svg.setAttribute('viewBox', `${cx - width / 2} ${cy - height / 2} ${width} ${height}`);
        }
        function mark(country) {
            for (const shape of land.querySelectorAll('[data-country]'))
                shape.classList.toggle('highlighted', shape.dataset.country === country?.id);
        }
        function answer(value) {
            if (locked) return;
            locked = true;
            const success = KnowledgeEngine.matches(value, accepted);
            const displayedAnswer =
                typing && mode === 'neighbors'
                    ? target.mapBorders
                          .map((id) => byId.get(id))
                          .find(
                              (country) =>
                                  country &&
                                  KnowledgeEngine.matches(value, KnowledgeEngine.aliases(country))
                          )?.name || correct
                    : typing && mode === 'capital'
                      ? target.capitals.find((capital) =>
                            KnowledgeEngine.matches(value, [capital])
                        ) || correct
                      : mode === 'locate' || mode === 'identify'
                        ? target.name
                        : correct;
            session.score.answer(success);
            $('#map-meter').value = index;
            $('#map-feedback').classList.remove('hidden');
            $('#map-feedback').classList.add(success ? 'feedback-correct' : 'feedback-wrong');
            $('#map-feedback').textContent = success
                ? `✓ Correto: ${displayedAnswer}.`
                : `✕ Resposta: ${mode === 'locate' || mode === 'identify' ? target.name : correct}.`;
            if (mode === 'locate' || mode === 'identify') mark(target);
            for (const shape of land.querySelectorAll('[data-country]'))
                shape.setAttribute('aria-label', byId.get(shape.dataset.country).name);
            $('#map-next').classList.remove('hidden');
            $('#map-form').querySelector('button').disabled = true;
            $('#map-choices')
                .querySelectorAll('button')
                .forEach((button) => {
                    button.disabled = true;
                    const right = KnowledgeEngine.matches(button.dataset.answer, accepted);
                    const selected = String(button.dataset.answer) === String(value);
                    button.classList.toggle('answer-correct', right);
                    button.classList.toggle('answer-wrong', selected && !right);
                    if (right || selected) {
                        const badge = document.createElement('span');
                        badge.className = 'answer-caption';
                        badge.textContent = right ? '✓ Correta' : '✕ Sua resposta';
                        button.append(badge);
                    }
                });
            $('#map-next').focus({ preventScroll: true });
        }
        function choices(values) {
            $('#map-choices').replaceChildren();
            for (const value of values) {
                const button = document.createElement('button');
                button.textContent = typeof value === 'object' ? value.label : value;
                button.dataset.answer = typeof value === 'object' ? value.value : value;
                session.listen(button, 'click', () =>
                    answer(typeof value === 'object' ? value.value : value)
                );
                $('#map-choices').append(button);
            }
        }
        function round() {
            if (index === total)
                return session.complete((session.score.snapshot().accuracy ?? 0) >= 60, {
                    text: `${session.score.snapshot().correct} acertos em ${total} explorações.`
                });
            index++;
            target = deck.next();
            if (mode !== 'oceans') Progress.remember('worldmap', [target.id]);
            zoom = 1;
            cx = 360;
            cy = 180;
            viewport();
            locked = false;
            mark(null);
            $('#map-marker').replaceChildren();
            $('#map-next').classList.add('hidden');
            $('#map-feedback').classList.add('hidden');
            $('#map-feedback').classList.remove('feedback-correct', 'feedback-wrong');
            $('#map-choices').replaceChildren();
            $('#map-progress').textContent = `Exploração ${index}/${total}`;
            $('#map-meter').value = index - 1;
            $('#map-form').classList.toggle('hidden', !typing);
            $('#map-form').querySelector('button').disabled = false;
            $('#map-input').value = '';
            if (locateOnMap) {
                correct = target.id;
                accepted = [correct];
                $('#map-question').textContent = `Clique em ${target.name}.`;
            } else if (mode === 'identify' || mode === 'locate') {
                mark(target);
                correct = typing ? target.name : target.id;
                accepted = typing ? KnowledgeEngine.aliases(target) : [correct];
                $('#map-question').textContent = 'Qual país está destacado?';
                choices(
                    KnowledgeEngine.alternatives(
                        session.random,
                        target,
                        pool,
                        tier >= 2 ? 6 : 4
                    ).map((c) => ({ value: c.id, label: c.name }))
                );
            } else if (mode === 'capital') {
                mark(target);
                correct = target.capitals[0];
                accepted = [...target.capitals, ...(target.capitalAliases || [])];
                $('#map-question').textContent = `Qual é uma capital de ${target.name}?`;
                choices(
                    KnowledgeEngine.alternatives(
                        session.random,
                        target,
                        pool.filter(
                            (c) =>
                                !c.capitals.some((capital) =>
                                    KnowledgeEngine.matches(capital, accepted)
                                )
                        ),
                        tier >= 2 ? 6 : 4,
                        'capital'
                    ).map((c) => c.capitals[0])
                );
            } else if (mode === 'continent') {
                mark(target);
                correct = regions[target.region] || target.region;
                accepted = [
                    correct,
                    target.region,
                    ...(target.region === 'Americas' ? ['América'] : [])
                ];
                $('#map-question').textContent = `Em qual região continental fica ${target.name}?`;
                choices(session.random.shuffle([...new Set(Object.values(regions))]));
            } else if (mode === 'neighbors') {
                mark(target);
                const neighbors = target.mapBorders.map((id) => byId.get(id)).filter(Boolean),
                    neighbor = session.random.pick(neighbors);
                correct = neighbor.name;
                accepted = neighbors.flatMap(KnowledgeEngine.aliases);
                $('#map-question').textContent =
                    `Qual país compartilha uma fronteira terrestre com ${target.name} neste mapa?`;
                choices(
                    KnowledgeEngine.alternatives(
                        session.random,
                        neighbor,
                        pool.filter((c) => c.id !== target.id && !target.mapBorders.includes(c.id)),
                        tier >= 2 ? 6 : 4
                    ).map((c) => c.name)
                );
            } else {
                const ocean = oceanDeck.next(),
                    [x, y] = project([ocean.lon, ocean.lat]);
                const marker = document.createElementNS(ns, 'circle');
                marker.setAttribute('cx', x);
                marker.setAttribute('cy', y);
                marker.setAttribute('r', 8);
                marker.setAttribute('fill', '#ffc977');
                $('#map-marker').append(marker);
                correct = ocean.name;
                accepted = [
                    correct,
                    `Oceano ${correct}`,
                    ...(correct === 'Antártico' ? ['Austral', 'Oceano Austral'] : [])
                ];
                Progress.remember('worldmap', [correct]);
                $('#map-question').textContent = 'Qual oceano está marcado?';
                choices(session.random.shuffle(oceans.map((o) => o.name)));
            }
            for (const [i, shape] of [...land.querySelectorAll('[data-country]')].entries())
                shape.setAttribute(
                    'aria-label',
                    locateOnMap || !['identify', 'locate'].includes(mode)
                        ? byId.get(shape.dataset.country).name
                        : `Área ${i + 1}`
                );
            if (typing) {
                $('#map-choices').replaceChildren();
                $('#map-input').focus({ preventScroll: true });
            }
            if (target.area < 100000 && mode !== 'oceans') {
                zoom = 3;
                [cx, cy] = project([target.latlng[1], target.latlng[0]]);
                viewport();
            }
        }
        const oceanDeck = ReplayEngine.deck(
            session.random,
            oceans,
            config.options.recentItems,
            (ocean) => ocean.name
        );
        session.listen($('#map-form'), 'submit', (event) => {
            event.preventDefault();
            if ($('#map-input').value.trim()) answer($('#map-input').value);
        });
        session.listen(svg, 'click', (event) => {
            if (event.detail > 0 && session.now() < suppressUntil) {
                suppressUntil = 0;
                return;
            }
            if (!locateOnMap) return;
            const country = event.target.closest('[data-country]');
            if (country) answer(country.dataset.country);
        });
        session.listen(svg, 'keydown', (event) => {
            if (['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
                const country = event.target.closest('[data-country]');
                if (country && locateOnMap) answer(country.dataset.country);
            }
        });
        session.listen(svg, 'pointerdown', (event) => {
            if (event.button > 0) return;
            drag = {
                x: event.clientX,
                y: event.clientY,
                cx,
                cy,
                moved: false,
                id: event.pointerId
            };
        });
        session.listen(
            document,
            'pointermove',
            (event) => {
                if (!drag || event.pointerId !== drag.id) return;
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) {
                    drag.moved = true;
                    svg.setPointerCapture?.(event.pointerId);
                }
                if (drag.moved) {
                    event.preventDefault();
                    const rect = svg.getBoundingClientRect();
                    cx = drag.cx - ((event.clientX - drag.x) * 720) / zoom / rect.width;
                    cy = drag.cy - ((event.clientY - drag.y) * 360) / zoom / rect.height;
                    viewport();
                }
            },
            { passive: false }
        );
        session.listen(document, 'pointerup', (event) => {
            if (drag && event.pointerId !== drag.id) return;
            suppressUntil = drag?.moved ? session.now() + 100 : 0;
            drag = null;
        });
        session.listen(document, 'pointercancel', () => {
            drag = null;
            suppressUntil = 0;
        });
        session.listen($('#map-in'), 'click', () => {
            zoom = Math.min(8, zoom * 1.5);
            viewport();
        });
        session.listen($('#map-out'), 'click', () => {
            zoom = Math.max(1, zoom / 1.5);
            viewport();
        });
        session.listen($('#map-reset'), 'click', () => {
            zoom = 1;
            cx = 360;
            cy = 180;
            viewport();
        });
        session.listen($('#map-next'), 'click', round);
        round();
    }
    return { init, destroy: session.destroy };
});
