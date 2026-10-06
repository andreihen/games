GameRegistry.register('memoryshelf', (session) => {
    function init(config) {
        const pool = [
                ['📕', 'Livro'],
                ['🪴', 'Planta'],
                ['☕', 'Xícara'],
                ['📷', 'Câmera'],
                ['🕯️', 'Vela'],
                ['🧸', 'Urso'],
                ['🔑', 'Chave'],
                ['⚽', 'Bola'],
                ['🎵', 'Música'],
                ['🍎', 'Maçã'],
                ['⏰', 'Relógio'],
                ['✉️', 'Carta']
            ],
            colors = ['#bf6b7d', '#528eae', '#6fa075', '#b49c63'];
        const original = session.random
            .shuffle(pool)
            .slice(0, config.objects)
            .map(([icon, name]) => ({
                icon,
                name,
                color: session.random.int(0, 3),
                quantity: session.random.int(1, 3)
            }))
            .concat([null, null]);
        const mode = config.options.mode || 'changes';
        let scene = structuredClone(original),
            ready = false,
            selected = null,
            changed = new Set(),
            found = new Set();
        const $ = GameUI.shell(
            session,
            'Prateleira da Memória',
            mode === 'restore'
                ? 'Observe por cinco segundos. Depois arraste ou selecione dois espaços para restaurar exatamente a ordem.'
                : 'Observe por cinco segundos. Depois marque os espaços que mudaram, incluindo onde um objeto sumiu.',
            `<p id="ms-status" class="notice" role="status">Observe a prateleira…</p><div id="ms-shelf" class="shelf touch-drag"></div>${GameUI.button('Verificar organização', 'ms-check', 'primary')}`
        );
        const buttons = original.map((_, i) => {
            const b = document.createElement('button');
            b.dataset.slot = i;
            $('#ms-shelf').append(b);
            return b;
        });
        const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        function render() {
            buttons.forEach((b, i) => {
                const object = scene[i];
                b.innerHTML = object
                    ? `<span class="shelf-icon">${object.icon}</span><small>${object.name} ×${object.quantity}</small>`
                    : '<span class="shelf-icon">—</span><small>Vazio</small>';
                b.style.background = object ? colors[object.color] : '';
                b.classList.toggle('selected', selected === i || found.has(i));
                b.setAttribute(
                    'aria-label',
                    `Espaço ${i + 1}${object ? `, ${object.name}, quantidade ${object.quantity}, cor ${object.color + 1}` : ', vazio'}`
                );
                b.disabled = !ready || found.has(i);
            });
            $('#ms-check').classList.toggle('hidden', mode !== 'restore' || !ready);
        }
        function swap(a, b) {
            [scene[a], scene[b]] = [scene[b], scene[a]];
            selected = null;
            render();
        }
        session.listen($('#ms-shelf'), 'click', (event) => {
            const b = event.target.closest('[data-slot]');
            if (!ready || !b) return;
            const i = +b.dataset.slot;
            if (mode === 'restore') {
                if (selected === null) {
                    selected = i;
                    render();
                } else swap(selected, i);
            } else {
                if (found.has(i)) return;
                const correct = changed.has(i);
                session.score.answer(correct);
                if (correct) {
                    found.add(i);
                    $('#ms-status').textContent = `Alterações: ${found.size}/${changed.size}`;
                    render();
                    if (found.size === changed.size)
                        session.complete(true, { text: 'Todas as mudanças encontradas.' });
                } else
                    session.notify(
                        'Esse espaço permaneceu igual. Compare com a lembrança da primeira cena.'
                    );
            }
        });
        GameUI.drag(session, $('#ms-shelf'), {
            selector: '[data-slot]',
            start: (el) => (ready && mode === 'restore' ? +el.dataset.slot : null),
            drop: (i, target) => {
                const slot = target?.closest('[data-slot]');
                if (slot) swap(i, +slot.dataset.slot);
            }
        });
        session.listen($('#ms-check'), 'click', () => {
            const correct = scene.every((object, i) => same(object, original[i]));
            session.score.answer(correct, 700);
            if (correct) session.complete(true, { text: 'Prateleira restaurada exatamente.' });
            else session.notify('Ainda há objetos fora do lugar. Continue ajustando.');
        });
        async function presentation() {
            render();
            if (!(await session.sleep(5000))) return;
            $('#ms-shelf').style.visibility = 'hidden';
            $('#ms-status').textContent = 'Cortina fechada…';
            if (!(await session.sleep(700))) return;
            if (mode === 'restore') {
                do {
                    scene = session.random.shuffle(original);
                } while (scene.every((object, i) => same(object, original[i])));
            } else {
                const slots = session.random.shuffle(
                    Array.from({ length: scene.length }, (_, i) => i)
                );
                let remaining = config.changes;
                for (const i of slots) {
                    if (!remaining) break;
                    if (changed.has(i)) continue;
                    if (!scene[i]) {
                        const [icon, name] = session.random.pick(
                            pool.filter(([icon]) => !original.some((o) => o?.icon === icon))
                        );
                        scene[i] = { icon, name, color: session.random.int(0, 3), quantity: 1 };
                    } else {
                        const type = session.random.int(0, remaining >= 2 ? 3 : 2);
                        if (type === 0) scene[i] = null;
                        else if (type === 1)
                            scene[i].color = (scene[i].color + session.random.int(1, 3)) % 4;
                        else if (type === 2)
                            scene[i].quantity = scene[i].quantity === 3 ? 2 : scene[i].quantity + 1;
                        else {
                            const j = slots.find(
                                (j) =>
                                    j !== i &&
                                    !changed.has(j) &&
                                    scene[j] &&
                                    !same(scene[i], scene[j])
                            );
                            if (j !== undefined) {
                                swap(i, j);
                                changed.add(j);
                                remaining--;
                            } else scene[i] = null;
                        }
                    }
                    changed.add(i);
                    remaining--;
                }
            }
            ready = true;
            $('#ms-shelf').style.visibility = 'visible';
            $('#ms-status').textContent =
                mode === 'restore'
                    ? 'Restaure a ordem original.'
                    : `Encontre ${changed.size} espaços alterados.`;
            render();
        }
        session.run(presentation);
    }
    return { init, destroy: session.destroy };
});
