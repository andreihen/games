// Arrange mid-match equipment for isolated mechanics tests. Production creation always starts empty.
// The fixture-only attach entry point is compiled in the test window, never shipped in src/.
const fs = require('node:fs');
const path = require('node:path');
function equippedScenario(t, engine, data) {
    if (!t.w.ArenaFixture) {
        const source = fs.readFileSync(path.join(t.root, 'src/js/core/arena.js'), 'utf8')
            .replace('const ArenaEngine =', 'globalThis.ArenaFixture =')
            .replace('effectiveAttributes: attributes', 'fixtureAttach: attach, effectiveAttributes: attributes');
        t.w.eval(source);
    }
    const world = engine.state, defs = t.api('ArenaEngine').definitions(world.config, data);
    for (const p of world.players) {
        for (const kind of p.starting) {
            const id = `item-${++world.itemCounter}`, def = defs.items[kind];
            world.items[id] = { id, kind, owner: p.id, origin: { region: p.location, method: 'cenário de teste após coleta', day: 0 },
                ...(def.charges ? { charges: def.charges } : {}) };
            p.inventory.push(id);
        }
        p.equipped = p.inventory.find(id => defs.items[world.items[id].kind].type === 'weapon') || null;
        p.traits.loyalty = 8;
    }
    t.api('ArenaEngine').invariant(world, data);
    return t.w.ArenaFixture.fixtureAttach(world, defs);
}
module.exports = { equippedScenario };
