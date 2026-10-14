// Teste opcional em Chromium: NODE_PATH deve apontar para os pacotes Playwright disponíveis.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
async function main() {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const errors = [], report = [];
    const out = path.join(root, 'work/classics-preview'); fs.mkdirSync(out, { recursive: true });
    try {
        for (const width of [390, 1280]) {
            const page = await browser.newPage({ viewport: { width, height: 1000 } });
            page.on('pageerror', (e) => errors.push(e.message));
            for (const [game, options] of [['chess', { mode: 'friend' }], ['draughts', { mode: 'friend' }], ['minesweeper', {}], ['ludo', { players: '4', humans: '4' }]]) {
                const url = new URL(pathToFileURL(path.join(root, 'index.html')));
                url.search = new URLSearchParams({ game, seed: 'BROWSERCLASSICS', view: 'setup', difficulty: game === 'minesweeper' ? 'expert' : 'hard', options: JSON.stringify(options) });
                await page.goto(url.href);
                await page.locator('#start-practice-game-btn').click();
                await page.locator(`#${game === 'minesweeper' ? 'mines-board' : game === 'ludo' ? 'ludo-board' : 'classic-board'}`).waitFor();
                if (game === 'chess') {
                    await page.locator('[data-coordinate="e2"]').click();
                    await page.locator('[data-coordinate="e4"]').click();
                    await page.locator('[data-coordinate="e7"]').click();
                    await page.locator('[data-coordinate="e5"]').click();
                    assert.equal(await page.locator('#classic-history li').count(), 2);
                }
                if (game === 'draughts') {
                    await page.locator('[data-coordinate="a3"]').click();
                    await page.locator('[data-coordinate="b4"]').click();
                    assert((await page.locator('#classic-status').innerText()).includes('pretas'));
                }
                if (game === 'minesweeper') {
                    await page.locator('#mines-flag').click();
                    await page.locator('[data-cell="0"]').click();
                    assert.equal(await page.locator('[data-cell="0"]').innerText(), '⚑');
                    await page.locator('[data-cell="0"]').click();
                    await page.locator('#mines-flag').click();
                    await page.locator('[data-cell="0"]').click();
                    assert(await page.locator('.revealed').count() > 1);
                }
                const layout = await page.evaluate(() => {
                    const b = document.querySelector('#classic-board,#ludo-board,#mines-board');
                    const box = b.getBoundingClientRect();
                    return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
                        boardWidth: box.width, boardHeight: box.height,
                        innerScroll: document.querySelector('.mines-scroll')?.scrollWidth || 0 };
                });
                await page.screenshot({ path: path.join(out, `${game}-${width}.png`), fullPage: true });
                assert(layout.documentWidth <= width + 1, `${game}: página com overflow (${layout.documentWidth})`);
                if (game !== 'minesweeper') assert(Math.abs(layout.boardWidth - layout.boardHeight) <= 2, `${game}: tabuleiro não quadrado: ${JSON.stringify(layout)}`);
                report.push({ game, width, status: 'PASS', layout });
            }
            await page.close();
        }
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(root, 'tests/results/browser-classics.json'), JSON.stringify({ report, errors }, null, 2));
        console.log(`${report.length} verificações de navegador aprovadas, sem erros de JavaScript.`);
        console.log(`Capturas: ${out}`);
    } finally { await browser.close(); }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
