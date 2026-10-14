// Optional visual QA: NODE_PATH points to the bundled Playwright packages.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
async function main() {
    const out = path.join(root, 'work/arena-evolution'); fs.mkdirSync(out, { recursive: true });
    const server = http.createServer((req, res) => {
        const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
        const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
        res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const errors = [], report = [];
    try {
        for (const width of [390, 1280]) {
            const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 } });
            page.on('pageerror', e => errors.push(e.message));
            await page.goto(`${base}/index.html?game=survivalarena&seed=VISUAL-EVOLVE&view=setup`);
            await page.locator('#start-practice-game-btn').click();
            await page.locator('#sa-roster .sa-cast-card').first().waitFor();
            const names = await page.locator('#sa-roster strong').allTextContents();
            await page.screenshot({ path: path.join(out, `preparation-${width}.png`), fullPage: true });
            await page.locator('.game-help summary').click();
            await page.waitForFunction(() => document.querySelector('.game-help').open);
            assert.equal(await page.locator('#sa-setup').evaluate(el => getComputedStyle(el).visibility), 'visible');
            const helpReadable = await page.locator('.game-help .game-instructions').evaluate(el => {
                const box = el.getBoundingClientRect(), parent = el.parentElement.getBoundingClientRect();
                return box.height > 60 && box.bottom <= parent.bottom + 1;
            });
            assert(helpReadable, 'Ajuda precisa estar legível dentro da área expandida');
            assert.deepEqual(await page.locator('#sa-roster strong').allTextContents(), names);
            await page.screenshot({ path: path.join(out, `help-${width}.png`), fullPage: true });
            await page.locator('.game-help summary').click();
            await page.locator('[data-preptab=catalog]').first().click();
            await page.locator('#sa-theme').selectOption('tv');
            await page.locator('#sa-universe').selectOption('iCarly');
            await page.locator('#sa-catalog-search').fill('Carly');
            await page.locator('[data-catalogstore]').first().click();
            const countBefore = await page.locator('.sa-cast-card').count();
            await page.locator('[data-preptab=library]').click();
            assert.equal(await page.locator('[data-libraryadd]').count(), 1);
            await page.locator('#sa-library-folder').selectOption('folder-default');
            await page.locator('.sa-rules summary').filter({ hasText: 'Organizar pastas' }).click();
            await page.locator('#sa-folder-name').fill('Favoritos');
            await page.locator('#sa-folder-create').click();
            await page.locator('#sa-folder-name').fill('Meus heróis');
            await page.locator('#sa-folder-rename').click();
            await page.locator('#sa-library-create').click();
            await page.locator('#sa-edit-form [name=name]').fill('Aventureira');
            await page.locator('#sa-edit-form [name=district]').selectOption('8');
            await page.locator('#sa-edit-form [name=behavior]').selectOption('strategist');
            const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6m8AAAAASUVORK5CYII=', 'base64');
            await page.locator('#sa-portrait-file').setInputFiles({ name: 'portrait.png', mimeType: 'image/png', buffer: png });
            await page.locator('#sa-edit-form button[type=submit]').click();
            await page.waitForFunction(() => document.querySelector('#sa-library-grid').textContent.includes('Aventureira'));
            const backup = await page.evaluate(() => ArenaAccess.exportLibrary());
            assert.equal(Object.keys(backup.portraits).length, 1);
            assert.equal(await page.locator('.sa-cast-card').count(), countBefore);
            await page.screenshot({ path: path.join(out, `library-${width}.png`), fullPage: true });
            // A fresh browser context proves uploaded portraits do not depend on the original IndexedDB.
            const fresh = await browser.newContext();
            const dest = await fresh.newPage();
            await dest.goto(`${base}/index.html`);
            const roundtrip = await dest.evaluate(async value => {
                const data = await GameData.load('arena'); await ArenaAccess.importLibrary(value, data);
                const saved = ArenaAccess.library().characters.find(c => c.character.name === 'Aventureira');
                return { character: saved.character, image: await ArenaAccess.portrait(saved.character.portrait) };
            }, backup);
            assert(roundtrip.image.startsWith('data:image/png;base64,'));
            assert.equal(roundtrip.character.district, 8);
            await fresh.close();
            await page.locator('[data-libraryadd]').click();
            await page.locator('[data-libraryedit]').click();
            await page.locator('#sa-edit-form [name=name]').fill('Aventureira da biblioteca');
            await page.locator('#sa-edit-form button[type=submit]').click();
            await page.waitForFunction(() => document.querySelector('#sa-library-grid').textContent.includes('Aventureira da biblioteca'));
            assert(!(await page.locator('#sa-roster').textContent()).includes('Aventureira da biblioteca'));
            await page.locator('[data-preptab=catalog]').first().click();
            assert.equal(await page.locator('#sa-catalog-search').inputValue(), 'Carly');
            assert.equal(await page.locator('#sa-universe').inputValue(), 'iCarly');
            // Exercise the games -> edition -> characters flow without relying on a live API for UI QA.
            await page.route('https://www.wikidata.org/w/api.php*', route => {
                const u = new URL(route.request().url());
                const claim = id => ({ rank: 'normal', mainsnak: { datavalue: { value: { id } } } });
                const entities = { Q10: { id: 'Q10', labels: { pt: { value: 'Jogo de teste' } }, claims: { P31: [claim('Q7889')], P674: [claim('Q20')] } },
                    Q20: { id: 'Q20', labels: { pt: { value: 'Heroína do jogo' } }, claims: {} } };
                route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(u.searchParams.get('action') === 'wbsearchentities' ? { search: [{ id: 'Q10' }] } :
                    { entities: Object.fromEntries((u.searchParams.get('ids') || '').split('|').filter(id => entities[id]).map(id => [id, entities[id]])) }) });
            });
            await page.locator('.sa-rules summary').filter({ hasText: 'Buscar jogos' }).click();
            await page.locator('#sa-api-kind').selectOption('games');
            await page.locator('#sa-api-query').fill('Jogo');
            await page.locator('#sa-api-form button').click();
            await page.locator('[data-gameid]').click();
            await page.locator('#sa-catalog-search').fill('');
            await page.waitForFunction(() => document.querySelector('#sa-catalog-grid').textContent.includes('Heroína do jogo'));
            await page.screenshot({ path: path.join(out, `catalog-${width}.png`), fullPage: true });
            await page.locator('[data-preptab=roster]').click();
            await page.locator('#sa-start').click();
            const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('orbita:arena:save')));
            assert(saved.players.every(p => !p.inventory.length));
            await page.locator('#sa-auto').click();
            await page.waitForFunction(() => JSON.parse(localStorage.getItem('orbita:arena:save')).history.length > 1);
            await page.locator('.game-help summary').click();
            await page.waitForTimeout(150);
            const pausedAt = await page.evaluate(() => JSON.parse(localStorage.getItem('orbita:arena:save')).history.length);
            await page.waitForTimeout(2200);
            assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('orbita:arena:save')).history.length), pausedAt);
            await page.locator('.game-help summary').click();
            await page.waitForFunction(n => JSON.parse(localStorage.getItem('orbita:arena:save')).history.length > n, pausedAt);
            await page.locator('#sa-auto').click();
            await page.screenshot({ path: path.join(out, `story-${width}.png`), fullPage: true });
            const layout = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewport: innerWidth, visible: getComputedStyle(document.querySelector('.simulator')).visibility }));
            assert(layout.documentWidth <= width + 1, JSON.stringify(layout));
            report.push({ width, status: 'PASS', layout, portraitRoundtrip: true, helpPausesAndResumes: true });
            await page.close();
        }
        // Shared help remains visible in another game; explicit pause survives help closure.
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`${base}/index.html?game=lightsout&seed=HELP-SHARED&view=setup`);
        await page.locator('#start-practice-game-btn').click();
        await page.locator('.game-help summary').click();
        const otherVisibility = await page.locator('.play-panel').evaluate(el => [...el.children].filter(c => !c.classList.contains('game-help')).every(c => getComputedStyle(c).visibility === 'visible'));
        assert(otherVisibility);
        await page.locator('.game-help summary').click();
        await page.locator('#pause-current-game').click();
        await page.evaluate(() => { document.querySelector('.game-help').open = true; });
        await page.waitForTimeout(100);
        await page.evaluate(() => { document.querySelector('.game-help').open = false; });
        await page.waitForTimeout(100);
        assert.equal(await page.locator('#pause-current-game').innerText(), 'Retomar');
        await page.close();
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(root, 'tests/results/browser-arena-evolution.json'), JSON.stringify({ report, errors, sharedHelp: true }, null, 2));
        console.log('Desktop, celular, biblioteca com retratos, ajuda/pausa e busca de jogos: PASS');
    } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
