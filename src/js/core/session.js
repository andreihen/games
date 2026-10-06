const GameSession = (() => {
    function create(
        ui,
        onComplete,
        onError,
        challenge = { seed: 'LOCAL', difficulty: 'easy', game: '', options: {} }
    ) {
        let active = true,
            paused = false,
            hiddenAt = 0,
            pausedTime = 0;
        const started = performance.now();
        const jobs = new Map(),
            listeners = [],
            cleanups = [];
        let counter = 0;
        const now = () =>
            performance.now() - started - pausedTime - (paused ? performance.now() - hiddenAt : 0);
        function fail(error) {
            if (active) {
                destroy();
                onError(error);
            }
        }
        function invoke(fn, ...args) {
            if (!active || paused) return;
            try {
                const result = fn(...args);
                if (result?.catch) result.catch(fail);
                return result;
            } catch (error) {
                fail(error);
            }
        }
        function arm(id, job) {
            if (!active || paused) return;
            job.due = now() + job.remaining;
            if (job.kind === 'frame') {
                job.native = requestAnimationFrame(() => {
                    jobs.delete(id);
                    invoke(job.fn, now());
                });
            } else {
                job.native = window.setTimeout(() => {
                    jobs.delete(id);
                    invoke(job.fn);
                    if (job.kind === 'interval' && active && !paused && !job.cancelled) {
                        job.remaining = job.delay;
                        jobs.set(id, job);
                        arm(id, job);
                    }
                }, job.remaining);
            }
        }
        function schedule(kind, fn, delay = 0) {
            if (!active) return null;
            const id = ++counter;
            const job = {
                kind,
                fn,
                delay: Math.max(kind === 'interval' ? 1 : 0, delay),
                remaining: Math.max(0, delay),
                native: null,
                cancelled: false
            };
            jobs.set(id, job);
            arm(id, job);
            return id;
        }
        // Intervalos são retirados do mapa durante o callback, mas ainda podem ser cancelados nele.
        const allJobs = new Map();
        function tracked(kind, fn, delay) {
            const id = schedule(
                kind,
                () => {
                    if (kind !== 'interval') allJobs.delete(id);
                    return fn(kind === 'frame' ? now() : undefined);
                },
                delay
            );
            if (id !== null) allJobs.set(id, jobs.get(id));
            return id;
        }
        function clear(id) {
            const job = jobs.get(id) || allJobs.get(id);
            if (!job) return;
            job.cancelled = true;
            if (job.kind === 'frame') cancelAnimationFrame(job.native);
            else window.clearTimeout(job.native);
            jobs.delete(id);
            allJobs.delete(id);
        }
        function listen(target, event, handler, options) {
            const wrapped = (e) => {
                if ((event === 'keydown' || event === 'keypress') && target === document) {
                    if (
                        e.defaultPrevented ||
                        e.repeat ||
                        e.target.closest?.('input, textarea, select, [contenteditable="true"]')
                    )
                        return;
                    if (
                        ['Enter', ' '].includes(e.key) &&
                        e.target.closest?.('button, [role="button"]')
                    )
                        return;
                }
                return invoke(handler, e);
            };
            target.addEventListener(event, wrapped, options);
            // Referências fracas permitem coletar células removidas em um novo render.
            const record = {
                target: new WeakRef(target),
                handler: new WeakRef(wrapped),
                event,
                options
            };
            listeners.push(record);
            return () => target.removeEventListener(event, wrapped, options);
        }
        function destroy() {
            if (!active) return;
            active = false;
            for (const id of allJobs.keys()) clear(id);
            jobs.clear();
            for (const record of listeners) {
                const target = record.target.deref(),
                    handler = record.handler.deref();
                if (target && handler)
                    target.removeEventListener(record.event, handler, record.options);
            }
            listeners.length = 0;
            for (const cleanup of cleanups.splice(0).reverse()) {
                try {
                    cleanup();
                } catch (error) {
                    console.error(error);
                }
            }
        }
        function pause() {
            if (!active || paused) return;
            const time = now();
            hiddenAt = performance.now();
            paused = true;
            for (const job of jobs.values()) {
                job.remaining = Math.max(0, job.due - time);
                if (job.kind === 'frame') cancelAnimationFrame(job.native);
                else window.clearTimeout(job.native);
            }
        }
        function resume() {
            if (!active || !paused) return;
            pausedTime += performance.now() - hiddenAt;
            paused = false;
            for (const [id, job] of jobs) arm(id, job);
        }
        const random = SeededRandom.create(challenge.seed);
        const score = ScoreEngine.create(now, (stats) => ui.updateStats?.(stats));
        const session = {
            ui,
            random,
            score,
            challenge,
            get active() {
                return active && !paused;
            },
            get paused() {
                return paused;
            },
            get alive() {
                return active;
            },
            timeout: (fn, ms) => tracked('timeout', fn, ms),
            interval: (fn, ms) => tracked('interval', fn, ms),
            frame: (fn) => tracked('frame', fn, 0),
            clear,
            listen,
            now,
            pause,
            resume,
            destroy,
            run: invoke,
            resetClock() {
                const elapsed = now();
                pausedTime += elapsed;
                for (const job of jobs.values()) job.due -= elapsed;
                ui.updateStats?.(score.snapshot());
            },
            sleep(ms) {
                return new Promise((resolve) => {
                    const id = session.timeout(() => resolve(true), ms);
                    cleanups.push(() => {
                        clear(id);
                        resolve(false);
                    });
                });
            },
            cleanup(fn) {
                cleanups.push(fn);
            },
            notify(message, details) {
                ui.noticeDisplay.textContent = [message, details?.text].filter(Boolean).join(' ');
            },
            complete(success, details = {}) {
                if (!active) return;
                const attempts = score.snapshot();
                if (!attempts.correct && !attempts.mistakes) score.answer(Boolean(success), 0);
                if (success) score.add(250);
                const duration = now();
                const metrics = score.snapshot();
                destroy();
                onComplete(Boolean(success), { ...details, metrics }, duration);
            },
            resources() {
                return {
                    timers: allJobs.size,
                    listeners: listeners.length,
                    cleanups: cleanups.length,
                    active
                };
            }
        };
        const interactive =
            '.color-peg-mastermind,.guess-slot-mastermind[data-index],.nonogram-cell,.sliding-puzzle-tile:not(.sliding-puzzle-empty),.hanoi-peg,.restaum-cell:not(.invalid),.mg-card,.mp-cell,.sh-char-cell,.fs-option-btn,.scale-item,.blockfit-piece-preview,.blockfit-cell,#tttm-board>div';
        function decorate() {
            for (const el of ui.phaseDisplay.querySelectorAll(interactive)) {
                el.setAttribute('role', 'button');
                el.tabIndex = 0;
                const position =
                    el.dataset.r !== undefined
                        ? `Linha ${Number(el.dataset.r) + 1}, coluna ${Number(el.dataset.c) + 1}`
                        : '';
                const label =
                    el.dataset.label ||
                    el.textContent.trim() ||
                    position ||
                    `Posição ${Number(el.dataset.index ?? el.dataset.pegIndex ?? 0) + 1}`;
                if (el.getAttribute('aria-label') !== label) el.setAttribute('aria-label', label);
            }
            for (const el of ui.phaseDisplay.querySelectorAll(
                'input:not([aria-label]),select:not([aria-label])'
            ))
                el.setAttribute(
                    'aria-label',
                    el.placeholder ||
                        (el.dataset.row !== undefined
                            ? `Linha ${+el.dataset.row + 1}, coluna ${+el.dataset.col + 1}`
                            : 'Resposta')
                );
        }
        const observer = new MutationObserver(decorate);
        observer.observe(ui.phaseDisplay, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-label']
        });
        cleanups.push(() => observer.disconnect());
        listen(ui.phaseDisplay, 'keydown', (event) => {
            const target = event.target.closest('[role="button"]');
            if (!event.defaultPrevented && target && ['Enter', ' '].includes(event.key)) {
                event.preventDefault();
                event.stopPropagation();
                if (target.click) target.click();
                else target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        });
        session.interval(() => ui.updateStats?.(score.snapshot()), 1000);
        return session;
    }
    return Object.freeze({ create });
})();

const GameAudio = (() => {
    let context = null;
    function note(frequency = 440) {
        try {
            const Audio = window.AudioContext || window.webkitAudioContext;
            if (!Audio) return;
            context ||= new Audio();
            if (context.state !== 'running') {
                context.resume().catch(() => {});
                return;
            }
            const oscillator = context.createOscillator(),
                gain = context.createGain();
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0.08, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.onended = () => {
                oscillator.disconnect();
                gain.disconnect();
            };
            oscillator.start();
            oscillator.stop(context.currentTime + 0.2);
        } catch {
            /* A informação visual sempre permite jogar sem áudio. */
        }
    }
    return Object.freeze({ note });
})();
