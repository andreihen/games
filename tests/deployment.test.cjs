// Exercita o HTML realmente distribuído, sem carregar os arquivos-fonte pelo harness.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { JSDOM, requestInterceptor, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'games-deployment-'));
const reports = [];
const attempts = [];
const blockExternalResources = requestInterceptor((request) => {
    if (request.url.startsWith('data:')) return undefined;
    attempts.push(request.url);
    return new Response('Recurso externo inesperado', { status: 404 });
});
async function main() {
    execFileSync('python', [path.join(root, 'tools/build_site.py'), '--output', output], {
        cwd: root
    });
    const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
    const server = http.createServer((req, res) => {
        if (
            ['/', '/games/', '/games/index.html'].includes(
                new URL(req.url, 'http://localhost').pathname
            )
        ) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } else {
            res.writeHead(404);
            res.end('Arquivo ausente');
        }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    let dom;
    try {
        const base = `http://127.0.0.1:${server.address().port}`;
        for (const suffix of ['/', '/games/']) {
            const response = await fetch(base + suffix);
            assert.equal(response.status, 200);
            const errors = [];
            const virtualConsole = new VirtualConsole();
            virtualConsole.on('jsdomError', (error) => errors.push(error));
            let clock = 0,
                nextId = 0;
            const jobs = new Map();
            dom = new JSDOM(await response.text(), {
                url: base + suffix,
                runScripts: 'dangerously',
                pretendToBeVisual: true,
                resources: { interceptors: [blockExternalResources] },
                virtualConsole,
                beforeParse(w) {
                    w.structuredClone = structuredClone;
                    Object.defineProperty(w.performance, 'now', { value: () => clock });
                    w.setTimeout = (fn, delay = 0) => {
                        jobs.set(++nextId, { fn, due: clock + Math.max(1, delay) });
                        return nextId;
                    };
                    w.clearTimeout = (id) => jobs.delete(id);
                    w.requestAnimationFrame = (fn) => w.setTimeout(() => fn(clock), 16);
                    w.cancelAnimationFrame = w.clearTimeout;
                    w.HTMLElement.prototype.scrollIntoView = () => {};
                    w.HTMLElement.prototype.setPointerCapture = () => {};
                }
            });
            const w = dom.window,
                context = dom.getInternalVMContext();
            await new Promise((resolve) =>
                w.document.addEventListener('DOMContentLoaded', resolve, { once: true })
            );
            const api = (expression) => vm.runInContext(expression, context);
            assert.equal(errors.length, 0, errors[0]?.stack);
            assert.equal(w.document.querySelectorAll('.game-card').length, 43);
            assert.equal(
                w.document.querySelectorAll('script[src], link[rel="stylesheet"]').length,
                0
            );
            assert.equal(w.document.querySelector('#featured-art svg') !== null, true);
            assert.equal(w.document.querySelectorAll('style').length, 4);
            reports.push({
                name: `Biblioteca e estilos carregam em ${suffix} sem arquivos externos`,
                status: 'PASS'
            });

            const flags = api('BundledFlags');
            assert.equal(Object.keys(flags).length, 250);
            for (const [code, data] of Object.entries(flags)) {
                assert.equal(data.startsWith('data:image/svg+xml;base64,'), true);
                assert.deepEqual(
                    Buffer.from(data.split(',')[1], 'base64'),
                    fs.readFileSync(path.join(root, 'src/assets/flags', code + '.svg'))
                );
            }
            for (const key of ['geography', 'learning', 'vocabulary', 'words']) {
                const bundleData = await api(`GameData.load('${key}')`);
                const sourceContext = vm.createContext({
                    GameData: {
                        register(name, data) {
                            this.value = data;
                        }
                    }
                });
                vm.runInContext(
                    fs.readFileSync(path.join(root, 'src/js/data', key + '.js'), 'utf8'),
                    sourceContext
                );
                assert.equal(
                    JSON.stringify(bundleData),
                    JSON.stringify(sourceContext.GameData.value)
                );
            }
            reports.push({
                name: `250 SVGs e quatro bancos de dados preservados em ${suffix}`,
                status: 'PASS'
            });

            async function flush() {
                for (let i = 0; i < 10; i++) await Promise.resolve();
            }
            async function advance(ms) {
                const target = clock + ms;
                await flush();
                for (let runs = 0; ; runs++) {
                    const next = [...jobs].sort((a, b) => a[1].due - b[1].due)[0];
                    if (!next || next[1].due > target) break;
                    assert(runs < 100000, 'Temporizador sem limite');
                    clock = next[1].due;
                    jobs.delete(next[0]);
                    next[1].fn();
                    await flush();
                }
                clock = target;
                await flush();
            }
            const config = api('GAMES_CONFIG');
            assert.equal(config.length, 44);
            for (const game of config) {
                const phase = w.document.querySelector('#phase-display');
                phase.replaceChildren();
                const options = Object.fromEntries(
                    game.options.map((option) => [option.key, option.values[0].value])
                );
                const challenge = {
                    game: game.id,
                    difficulty: 'easy',
                    seed: 'PAGES-VALIDATION',
                    options
                };
                const session = api('GameSession').create(
                    {
                        phaseDisplay: phase,
                        limitDisplay: w.document.querySelector('#phase-limit-display'),
                        noticeDisplay: w.document.querySelector('#game-notice')
                    },
                    () => {},
                    (error) => errors.push(error),
                    challenge
                );
                try {
                    const factory = await api('GameRegistry').load(game);
                    let settled = false,
                        failure;
                    Promise.resolve(
                        factory(session).init({
                            ...api('DifficultyEngine').resolve(game.id, 'easy', options),
                            seed: challenge.seed
                        })
                    ).then(
                        () => {
                            settled = true;
                        },
                        (error) => {
                            failure = error;
                            settled = true;
                        }
                    );
                    await flush();
                    for (let i = 0; !settled && i < 500; i++) await advance(50);
                    if (failure) throw failure;
                    assert(settled, game.id + ': inicialização pendente');
                    assert(phase.children.length > 0, game.id + ': partida vazia');
                    for (const image of phase.querySelectorAll('img')) {
                        assert(
                            image.src.startsWith('data:image/svg+xml;base64,'),
                            game.id + ': bandeira externa'
                        );
                    }
                    assert.equal(errors.length, 0, errors[0]?.stack);
                } finally {
                    session.destroy();
                }
                assert.equal(jobs.size, 0, game.id + ': recursos pendentes');
            }
            assert.deepEqual(attempts, []);
            reports.push({
                name: `44 jogos inicializam em ${suffix} sem requests adicionais ou erros`,
                status: 'PASS'
            });
            dom.window.close();
            dom = null;
        }
    } finally {
        dom?.window.close();
        await new Promise((resolve) => server.close(resolve));
        const temporaryRoot = path.resolve(os.tmpdir()) + path.sep;
        assert(
            path.resolve(output).startsWith(temporaryRoot) &&
                path.basename(output).startsWith('games-deployment-')
        );
        fs.rmSync(output, { recursive: true });
    }
    fs.mkdirSync(path.join(root, 'tests/results'), { recursive: true });
    fs.writeFileSync(
        path.join(root, 'tests/results/deployment.json'),
        JSON.stringify({ reports, externalRequests: attempts }, null, 2)
    );
    reports.forEach((report) => console.log(report.status + ' ' + report.name));
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
