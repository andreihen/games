const fs = require('node:fs'),
    path = require('node:path'),
    vm = require('node:vm'),
    assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const core = [
    'random',
    'difficulty',
    'score',
    'registry',
    'algorithms',
    'session',
    'progress',
    'interactions',
    'rules',
    'sudoku',
    'challenges',
    'puzzles',
    'knowledge',
    'nonogram',
    'learning',
    'library'
];
function setup({ width = 390, url = 'http://localhost/', storage = null, app = false } = {}) {
    const html = app
        ? fs.readFileSync(path.join(root, 'index.html'), 'utf8')
        : '<div id="phase-display"></div><div id="phase-limit-display"></div><div id="game-notice"></div>';
    const dom = new JSDOM(html, { url, runScripts: 'outside-only', pretendToBeVisual: true }),
        w = dom.window,
        context = dom.getInternalVMContext();
    let time = 0,
        id = 0,
        jobs = new Map(),
        session = null;
    Object.defineProperty(w, 'innerWidth', { value: width });
    Object.defineProperty(w.performance, 'now', { value: () => time });
    w.structuredClone = structuredClone;
    w.Math.random = () => {
        throw Error('Use o gerador com seed.');
    };
    w.setTimeout = (fn, ms = 0) => {
        jobs.set(++id, { fn, due: time + Math.max(1, ms) });
        return id;
    };
    w.clearTimeout = (id) => jobs.delete(id);
    w.requestAnimationFrame = (fn) => w.setTimeout(() => fn(time), 16);
    w.cancelAnimationFrame = w.clearTimeout;
    w.HTMLElement.prototype.scrollIntoView = () => {};
    w.HTMLElement.prototype.setPointerCapture = () => {};
    if (storage !== null)
        w.localStorage.setItem(
            'desafio-logico-total:progress',
            typeof storage === 'string' ? storage : JSON.stringify(storage)
        );
    function load(file) {
        vm.runInContext(fs.readFileSync(path.join(root, 'src/js', file), 'utf8'), context, {
            filename: file
        });
    }
    for (const name of core) load(`core/${name}.js`);
    load('games.config.js');
    load('data/words.js');
    load('data/geography.js');
    load('data/vocabulary.js');
    load('data/learning.js');
    const api = (name) => vm.runInContext(name, context),
        config = api('GAMES_CONFIG'),
        registry = api('GameRegistry');
    for (const game of config) load(`games/${game.file}`);
    const $ = (s) => w.document.querySelector(s),
        $$ = (s) => [...w.document.querySelectorAll(s)],
        outcomes = [],
        errors = [],
        watchers = [];
    const click = (s) => {
        const el = typeof s === 'string' ? $(s) : s;
        assert(el, 'Elemento ausente: ' + s);
        el.click();
    };
    const input = (el, value) => {
        if (typeof el === 'string') el = $(el);
        el.value = String(value);
        el.dispatchEvent(new w.Event('input', { bubbles: true }));
    };
    const submit = (s) =>
        $(s).dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    async function flush() {
        for (let i = 0; i < 8; i++) await Promise.resolve();
    }
    async function advance(ms) {
        const target = time + ms;
        let runs = 0;
        await flush();
        while (true) {
            const next = [...jobs].sort((a, b) => a[1].due - b[1].due)[0];
            if (!next || next[1].due > target) break;
            assert(++runs < 100000, 'Timer sem limite');
            time = next[1].due;
            jobs.delete(next[0]);
            for (const watch of watchers) watch();
            next[1].fn();
            await flush();
        }
        time = target;
        await flush();
    }
    const defaults = (game) =>
        Object.fromEntries(
            config.find((g) => g.id === game).options.map((o) => [o.key, o.values[0].value])
        );
    async function mount(game, difficulty = 'easy', options = {}, seed = 'TESTE-V2') {
        session?.destroy();
        $('#phase-display').replaceChildren();
        outcomes.length = 0;
        errors.length = 0;
        const challenge = { game, difficulty, seed, options: { ...defaults(game), ...options } };
        session = api('GameSession').create(
            {
                phaseDisplay: $('#phase-display'),
                limitDisplay: $('#phase-limit-display'),
                noticeDisplay: $('#game-notice')
            },
            (...args) => outcomes.push(args),
            (e) => errors.push(e),
            challenge
        );
        let settled = false,
            error = null;
        Promise.resolve(
            registry
                .get(game)(session)
                .init({
                    ...api('DifficultyEngine').resolve(game, difficulty, challenge.options),
                    seed
                })
        ).then(
            () => (settled = true),
            (e) => {
                error = e;
                settled = true;
            }
        );
        await flush();
        for (let loops = 0; !settled && loops < 500; loops++) await advance(50);
        if (error) throw error;
        assert(settled, `${game}: preparação não terminou`);
        assert.equal(errors.length, 0, errors[0]?.stack);
        await flush();
        return session;
    }
    function startApp() {
        let init = null;
        const original = w.document.addEventListener.bind(w.document);
        w.document.addEventListener = (type, callback, ...rest) =>
            type === 'DOMContentLoaded' ? (init = callback) : original(type, callback, ...rest);
        load('main.js');
        w.document.addEventListener = original;
        assert(init);
        init();
    }
    function clean() {
        session?.destroy();
        assert.equal(jobs.size, 0, 'Recursos pendentes');
        assert.equal(errors.length, 0, errors[0]?.stack);
        w.close();
    }
    return {
        root,
        w,
        context,
        load,
        api,
        config,
        $,
        $$,
        click,
        input,
        submit,
        flush,
        advance,
        mount,
        defaults,
        startApp,
        clean,
        outcomes,
        errors,
        watch: (fn) => watchers.push(fn),
        get session() {
            return session;
        },
        get jobs() {
            return jobs;
        },
        get time() {
            return time;
        }
    };
}
module.exports = { setup, root, assert, fs, path, vm };
