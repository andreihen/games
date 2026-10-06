const GameUI = Object.freeze({
    shell(session, title, instructions, body) {
        session.ui.phaseDisplay.innerHTML = `<div class="play-panel"><h2 class="phase-title">${title}</h2><p class="game-instructions">${instructions}</p>${body}</div>`;
        return (selector) => session.ui.phaseDisplay.querySelector(selector);
    },
    button(label, id = '', kind = 'secondary') {
        return `<button ${id ? `id="${id}"` : ''} class="button button-${kind} px-3 py-2">${label}</button>`;
    },
    drag(session, root, { selector, start, move, drop, cancel = () => {} }) {
        let drag = null,
            suppressUntil = 0;
        const clear = () => {
            drag?.ghost?.remove();
            drag = null;
        };
        session.cleanup(clear);
        session.listen(root, 'pointerdown', (event) => {
            const source = event.target.closest(selector);
            if (!source || event.button > 0) return;
            const data = start(source, event);
            if (data === null || data === undefined) return;
            drag = {
                source,
                data,
                x: event.clientX,
                y: event.clientY,
                id: event.pointerId,
                moved: false
            };
        });
        session.listen(
            document,
            'pointermove',
            (event) => {
                if (!drag || event.pointerId !== drag.id) return;
                if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6)
                    return;
                event.preventDefault();
                if (!drag.moved) {
                    drag.moved = true;
                    // Um clique comum mantém seu alvo; só capturamos após iniciar o arraste.
                    root.setPointerCapture?.(event.pointerId);
                    drag.ghost = drag.source.cloneNode(true);
                    drag.ghost.removeAttribute('id');
                    drag.ghost.classList.add('drag-ghost');
                    drag.ghost.style.width = `${drag.source.getBoundingClientRect().width}px`;
                    document.body.append(drag.ghost);
                }
                drag.ghost.style.left = `${event.clientX + 12}px`;
                drag.ghost.style.top = `${event.clientY + 12}px`;
                move?.(drag.data, document.elementFromPoint(event.clientX, event.clientY), event);
            },
            { passive: false }
        );
        session.listen(document, 'pointerup', (event) => {
            if (!drag || event.pointerId !== drag.id) return;
            if (drag.moved) {
                suppressUntil = performance.now() + 100;
                drop(drag.data, document.elementFromPoint(event.clientX, event.clientY), event);
                event.preventDefault();
            }
            clear();
        });
        session.listen(document, 'pointercancel', () => {
            cancel();
            clear();
        });
        session.listen(
            root,
            'click',
            (event) => {
                if (event.detail > 0 && performance.now() < suppressUntil) {
                    suppressUntil = 0;
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            },
            true
        );
    }
});
