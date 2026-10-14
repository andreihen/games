const ArenaAccess = (() => {
    const prefix = 'orbita:arena:';
    function imageUrl(value) {
        if (typeof value !== 'string' || value.length > 2048) return null;
        if (/^\.\/src\/assets\/characters\/[a-zA-Z0-9_-]+\.(png|jpg|webp)$/.test(value))
            return value;
        try {
            const u = new URL(value);
            return u.protocol === 'https:' && !u.username && !u.password ? u.href : null;
        } catch {
            return null;
        }
    }
    function resolveImage(value) {
        const safe = imageUrl(value);
        return typeof BundledPortraits !== 'undefined' && BundledPortraits[safe]
            ? BundledPortraits[safe]
            : safe;
    }
    async function searchShows(query, signal) {
        if (!query.trim()) return [];
        const response = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim().slice(0, 80))}`,
            { signal, credentials: 'omit' }
        );
        if (!response.ok)
            throw Error(
                'A busca de séries está indisponível. Os temas salvos continuam funcionando.'
            );
        const rows = await response.json();
        if (!Array.isArray(rows)) throw Error('Resposta inesperada do catálogo de séries.');
        return rows.slice(0, 12).map(({ show: s }) => ({
            id: s.id,
            name: s.name,
            year: s.premiered?.slice(0, 4) || '',
            image: imageUrl(s.image?.medium),
            url: s.url
        }));
    }
    async function showCast(id, signal) {
        if (!Number.isInteger(id) || id < 1) throw Error('Série inválida.');
        const response = await fetch(`https://api.tvmaze.com/shows/${id}?embed=cast`, {
            signal,
            credentials: 'omit'
        });
        if (!response.ok)
            throw Error('Não foi possível carregar este elenco. Você pode usar os temas locais.');
        const show = await response.json();
        const rows = show._embedded?.cast;
        if (!Array.isArray(rows)) throw Error('Esta série não forneceu um elenco.');
        return {
            name: show.name,
            year: show.premiered?.slice(0, 4) || '',
            characters: rows
                .filter((r) => r.character?.name)
                .map((r) => ({
                    id: `tv-${id}-${r.character.id}`,
                    name: r.character.name.slice(0, 60),
                    universe: show.name,
                    theme: 'screen',
                    type: 'tv',
                    gender: 'unknown',
                    source: `TVmaze — ${show.name}`,
                    image: imageUrl(r.character.image?.medium || r.person?.image?.medium),
                    imageSource: r.character.image ? r.character.url : r.person?.url,
                    imageKind: r.character.image ? 'character' : 'actor',
                    portrait: null
                }))
        };
    }
    const entityId = (value) => /^Q[1-9][0-9]*$/.test(String(value));
    const claimValues = (e, key) =>
        (e?.claims?.[key] || [])
            .filter((c) => c.rank !== 'deprecated')
            .map((c) => c.mainsnak?.datavalue?.value)
            .filter(Boolean);
    const label = (e) => e?.labels?.pt?.value || e?.labels?.en?.value || '';
    async function wikidata(params, signal) {
        const url = new URL('https://www.wikidata.org/w/api.php');
        url.search = new URLSearchParams({ format: 'json', origin: '*', ...params });
        const response = await fetch(url.href, { signal, credentials: 'omit' });
        if (!response.ok)
            throw Error(
                'O catálogo de obras está indisponível. Tente novamente ou use os temas salvos.'
            );
        const json = await response.json();
        if (json.error) throw Error('Não foi possível consultar o catálogo de filmes.');
        return json;
    }
    async function entities(ids, signal) {
        const unique = [...new Set(ids.filter(entityId))];
        if (!unique.length) return {};
        const result = {};
        for (let i = 0; i < unique.length; i += 50) {
            const json = await wikidata(
                {
                    action: 'wbgetentities',
                    ids: unique.slice(i, i + 50).join('|'),
                    props: 'labels|claims',
                    languages: 'pt|en'
                },
                signal
            );
            Object.assign(result, json.entities || {});
        }
        return result;
    }
    async function isFilmList(rows, signal, root = 'Q11424') {
        const ancestors = {},
            seen = new Set([root]);
        let pending = [
            ...new Set(rows.flatMap((e) => claimValues(e, 'P31').map((v) => v.id)).filter(entityId))
        ];
        for (let depth = 0; pending.length && depth < 5; depth++) {
            pending = pending.filter((id) => !seen.has(id)).slice(0, 50);
            const found = await entities(pending, signal);
            const next = [];
            for (const id of pending) {
                seen.add(id);
                ancestors[id] = claimValues(found[id], 'P279')
                    .map((v) => v.id)
                    .filter(entityId);
                next.push(...ancestors[id]);
            }
            pending = [...new Set(next)];
        }
        const film = (id, visited = new Set()) => {
            if (id === root) return true;
            if (visited.has(id)) return false;
            visited.add(id);
            return (ancestors[id] || []).some((p) => film(p, new Set(visited)));
        };
        return rows.filter((e) => claimValues(e, 'P31').some((v) => film(v.id)));
    }
    function movieInfo(e) {
        return {
            id: e.id,
            name: label(e),
            year: String(claimValues(e, 'P577')[0]?.time || '').slice(1, 5),
            image: null,
            url: `https://www.wikidata.org/wiki/${e.id}`
        };
    }
    async function searchMovies(query, signal, root = 'Q11424') {
        const q = query.trim().slice(0, 80);
        if (!q) return [];
        const searches = await Promise.all(
            ['pt', 'en'].map((language) =>
                wikidata(
                    {
                        action: 'wbsearchentities',
                        search: q,
                        language,
                        uselang: 'pt',
                        limit: '20',
                        type: 'item'
                    },
                    signal
                )
            )
        );
        const found = await entities(
            searches.flatMap((s) => (s.search || []).map((e) => e.id)).slice(0, 40),
            signal
        );
        return (await isFilmList(Object.values(found), signal, root))
            .filter((e) => label(e))
            .slice(0, 12)
            .map(movieInfo);
    }
    const searchGames = (query, signal) => searchMovies(query, signal, 'Q7889');
    async function gameCast(id, signal) {
        if (!entityId(id)) throw Error('Jogo inválido.');
        const game = (await entities([id], signal))[id];
        if (!game || !(await isFilmList([game], signal, 'Q7889')).length)
            throw Error('Esta obra não é um videogame confirmado na fonte.');
        // P674 links the work to its characters. Never use developers (P178) or voice cast (P725).
        const ids = claimValues(game, 'P674').map(v => v.id).filter(entityId).slice(0, 100);
        const found = await entities(ids, signal);
        const characters = Object.values(found).filter(c => label(c) &&
            !claimValues(c, 'P31').some(v => ['Q5', 'Q43229', 'Q4830453'].includes(v.id)))
            .map(c => {
                const file = claimValues(c, 'P18')[0];
                return { id: `game-${id}-${c.id}`, catalogId: `game-${id}-${c.id}`,
                    name: label(c).slice(0, 60), universe: label(game).slice(0, 80), type: 'games', theme: 'games',
                    gender: 'unknown', source: `Wikidata — ${label(game)}`.slice(0, 150), portrait: null,
                    image: typeof file === 'string' ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=320` : null,
                    imageSource: typeof file === 'string' ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}` : `https://www.wikidata.org/wiki/${c.id}`,
                    imageKind: 'character' };
            });
        if (!characters.length) throw Error('Este jogo ainda não tem personagens vinculados na fonte. Tente outra edição ou use a criação manual.');
        return { ...movieInfo(game), characters, incomplete: true };
    }
    async function movieCast(id, signal) {
        if (!entityId(id)) throw Error('Filme inválido.');
        const film = (await entities([id], signal))[id];
        if (!film || !(await isFilmList([film], signal)).length)
            throw Error('Esta obra não é um filme confirmado no catálogo.');
        const roles = [];
        for (const claim of [...(film.claims?.P161 || []), ...(film.claims?.P725 || [])]) {
            if (claim.rank === 'deprecated') continue;
            const actor = claim.mainsnak?.datavalue?.value?.id;
            if (!entityId(actor)) continue;
            const ids = (claim.qualifiers?.P453 || [])
                .map((s) => s.datavalue?.value?.id)
                .filter(entityId);
            const names = (claim.qualifiers?.P4633 || [])
                .map((s) => s.datavalue?.value)
                .filter((v) => typeof v === 'string');
            if (ids.length) ids.forEach((character) => roles.push({ actor, character }));
            else names.forEach((name) => roles.push({ actor, name }));
        }
        const people = await entities(
            roles.flatMap((r) => [r.actor, r.character]),
            signal
        );
        const characters = [],
            seen = new Set();
        for (const [index, role] of roles.entries()) {
            const name = role.name || label(people[role.character]);
            if (!name || seen.has(name.toLowerCase())) continue;
            seen.add(name.toLowerCase());
            const subject = claimValues(people[role.actor], 'P18').length
                ? people[role.actor]
                : people[role.character];
            const file = claimValues(subject, 'P18')[0];
            characters.push({
                id: `film-${id}-${role.character || index}`,
                name: name.slice(0, 60),
                universe: label(film).slice(0, 80),
                theme: 'screen',
                type: 'movies',
                gender: 'unknown',
                source: `Wikidata — ${label(film)}`.slice(0, 150),
                portrait: null,
                image:
                    typeof file === 'string'
                        ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=320`
                        : null,
                imageSource:
                    typeof file === 'string'
                        ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`
                        : `https://www.wikidata.org/wiki/${id}`,
                imageKind: subject?.id === role.character ? 'character' : 'actor'
            });
        }
        if (!characters.length)
            throw Error(
                'Este filme ainda não possui papéis identificados na fonte. Busque outro filme ou crie o elenco manualmente.'
            );
        return { ...movieInfo(film), characters, incomplete: true };
    }
    function read(key, fallback = null) {
        try {
            if (key === 'rosters') {
                const lib = JSON.parse(localStorage.getItem(prefix + 'library') || 'null');
                if (Array.isArray(lib?.rosters)) return lib.rosters;
            }
            const value = JSON.parse(localStorage.getItem(prefix + key) || 'null');
            if (Array.isArray(fallback) && !Array.isArray(value)) return fallback;
            return value || fallback;
        } catch {
            return fallback;
        }
    }
    function write(key, value) {
        try {
            if (key === 'rosters') {
                const lib = read('library');
                if (lib?.version === 1) {
                    localStorage.setItem(prefix + 'library', JSON.stringify({ ...lib, rosters: value }));
                    return true;
                }
            }
            if (key === 'save' && value?.version === ArenaEngine.version) {
                const old = read('save');
                if (old?.version < value.version) {
                    localStorage.setItem(
                        prefix + `legacy-save-v${old.version}`,
                        JSON.stringify(old)
                    );
                    if (!read('legacy-save'))
                        localStorage.setItem(prefix + 'legacy-save', JSON.stringify(old));
                }
            }
            localStorage.setItem(prefix + key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }
    function download(name, value) {
        const blob = new Blob(
                [typeof value === 'string' ? value : JSON.stringify(value, null, 2)],
                { type: 'application/json' }
            ),
            url = URL.createObjectURL(blob),
            link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    async function searchRick(query, signal) {
        if (!query.trim()) return [];
        let response;
        try {
            response = await fetch(
                `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(query.trim().slice(0, 60))}`,
                { signal, credentials: 'omit' }
            );
        } catch (error) {
            if (error.name === 'AbortError') throw error;
            throw Error(
                'A busca externa está indisponível. O catálogo local continua funcionando.'
            );
        }
        if (response.status === 404) return [];
        if (!response.ok)
            throw Error(
                'A busca externa está indisponível. O catálogo local continua funcionando.'
            );
        const json = await response.json();
        if (!Array.isArray(json.results)) throw Error('Resposta inesperada da fonte externa.');
        return json.results
            .slice(0, 12)
            .filter((c) => Number.isInteger(c.id) && typeof c.name === 'string')
            .map((c) => ({
                id: `rm-${c.id}`,
                name: c.name.slice(0, 60),
                universe: 'Rick and Morty',
                theme: 'screen',
                gender: ArenaEngine.normalizeGender(c.gender),
                source: 'Rick and Morty API',
                portrait: null
            }));
    }
    function database() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(Error('Armazenamento de retratos indisponível.'));
            const request = indexedDB.open('orbita-arena-images', 1);
            request.onupgradeneeded = () => request.result.createObjectStore('portraits');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async function putPortrait(file) {
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 250000)
            throw Error('Use uma imagem PNG, JPEG ou WebP de até 250 KB.');
        const bytes = await file.arrayBuffer(),
            digest = await crypto.subtle.digest('SHA-256', bytes),
            id =
                'pic-' +
                [...new Uint8Array(digest)]
                    .map((n) => n.toString(16).padStart(2, '0'))
                    .join('')
                    .slice(0, 48);
        const value = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
        const db = await database();
        await new Promise((resolve, reject) => {
            const tx = db.transaction('portraits', 'readwrite');
            tx.objectStore('portraits').put(value, id);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        db.close();
        return id;
    }
    async function portrait(id) {
        if (!id) return null;
        try {
            const db = await database();
            const value = await new Promise((resolve, reject) => {
                const req = db.transaction('portraits').objectStore('portraits').get(id);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error);
            });
            db.close();
            return typeof value === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(value)
                ? value
                : null;
        } catch {
            return null;
        }
    }
    const copy = value => structuredClone(value);
    const defaultFolder = { id: 'folder-default', name: 'Meus personagens' };
    function library() {
        const saved = read('library');
        if (!saved) return { version: 1, counter: 0, folders: [copy(defaultFolder)], characters: [] };
        if (saved.version !== 1 || !Array.isArray(saved.folders) || !Array.isArray(saved.characters))
            throw Error('Biblioteca incompatível. Exporte os dados antes de substituir este armazenamento.');
        return copy(saved);
    }
    function storeLibrary(value) {
        if (!write('library', value)) throw Error('Sem espaço para guardar a biblioteca. Exporte um backup antes de continuar.');
        return copy(value);
    }
    function folderName(name) {
        const clean = String(name || '').trim();
        if (!clean || clean.length > 60) throw Error('Use um nome de pasta de 1 a 60 caracteres.');
        return clean;
    }
    function createFolder(name) {
        const lib = library(), clean = folderName(name);
        if (lib.folders.some(f => f.name.toLocaleLowerCase() === clean.toLocaleLowerCase())) throw Error('Já existe uma pasta com este nome.');
        const folder = { id: `folder-${++lib.counter}`, name: clean };
        lib.folders.push(folder); storeLibrary(lib);
        return copy(folder);
    }
    function renameFolder(id, name) {
        const lib = library(), folder = lib.folders.find(f => f.id === id), clean = folderName(name);
        if (!folder) throw Error('Pasta não encontrada.');
        if (lib.folders.some(f => f.id !== id && f.name.toLocaleLowerCase() === clean.toLocaleLowerCase())) throw Error('Já existe uma pasta com este nome.');
        folder.name = clean; return storeLibrary(lib);
    }
    function deleteFolder(id) {
        if (id === defaultFolder.id) throw Error('A pasta principal guarda os personagens das pastas removidas.');
        const lib = library();
        lib.folders = lib.folders.filter(f => f.id !== id);
        lib.characters.forEach(c => { if (c.folder === id) c.folder = defaultFolder.id; });
        return storeLibrary(lib);
    }
    function normalizedCharacter(c, data) {
        if (!c || typeof c !== 'object') throw Error('Personagem inválido.');
        const district = c.district;
        const normalized = ArenaEngine.validateConfig({ seed: 'LIBRARY', arena: 'forest', balance: false,
            characters: [{ ...c, id: 'library-validation', starting: [] }, { id: 'library-validation-2', name: 'Validação' }] }, data).characters[0];
        normalized.id = typeof c.id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(c.id) ? c.id : 'original';
        normalized.district = Number.isInteger(district) && district >= 1 && district <= 12 ? district : null;
        normalized.starting = Array.isArray(c.starting) ? c.starting.filter(k => typeof k === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(k)).slice(0, 4) : [];
        return normalized;
    }
    const fingerprint = c => JSON.stringify([c.name, c.universe, c.gender, c.source, c.theme, c.type, c.portrait, c.image, c.imageSource, c.imageKind,
        c.attributes, c.behavior, c.district, c.starting]);
    function saveCharacter(character, folder, data, updateId = null) {
        const lib = library(), normalized = normalizedCharacter(character, data);
        if (!lib.folders.some(f => f.id === folder)) throw Error('Escolha uma pasta existente.');
        const duplicate = lib.characters.find(c => c.id !== updateId && fingerprint(c.character) === fingerprint(normalized));
        if (duplicate) return { id: duplicate.id, duplicate: true };
        if (updateId) {
            const entry = lib.characters.find(c => c.id === updateId);
            if (!entry) throw Error('Personagem salvo não encontrado.');
            entry.character = normalized; entry.folder = folder;
        } else lib.characters.push({ id: `character-${++lib.counter}`, folder, character: normalized });
        storeLibrary(lib);
        return { id: updateId || lib.characters.at(-1).id, duplicate: false };
    }
    function moveCharacter(id, folder) {
        const lib = library(), entry = lib.characters.find(c => c.id === id);
        if (!entry || !lib.folders.some(f => f.id === folder)) throw Error('Personagem ou pasta inexistente.');
        entry.folder = folder; return storeLibrary(lib);
    }
    function deleteCharacter(id) {
        const lib = library(); lib.characters = lib.characters.filter(c => c.id !== id);
        return storeLibrary(lib);
    }
    async function portable(value) {
        const portraits = {}, ids = new Set();
        function visit(v) {
            if (!v || typeof v !== 'object') return;
            if (typeof v.portrait === 'string') ids.add(v.portrait);
            Object.values(v).forEach(visit);
        }
        visit(value);
        for (const id of ids) {
            const image = await portrait(id);
            if (!image) throw Error('Um retrato não está disponível neste navegador. Reenvie a imagem antes de exportar o backup.');
            portraits[id] = image;
        }
        return { ...copy(value), portraits };
    }
    async function importPortraits(portraits) {
        const entries = Object.entries(portraits || {});
        if (!entries.length) return;
        if (entries.length > 1000 || entries.some(([id, v]) => !/^pic-[a-f0-9]{48}$/.test(id) || typeof v !== 'string' || v.length > 350000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(v)))
            throw Error('Retratos inválidos no backup.');
        const db = await database();
        try {
            for (const [id, value] of entries) {
                const old = await portrait(id);
                if (old && old !== value) throw Error('O backup contém um retrato com ID conflitante. O original foi preservado.');
            }
            await new Promise((resolve, reject) => {
                const tx = db.transaction('portraits', 'readwrite');
                entries.forEach(([id, value]) => tx.objectStore('portraits').put(value, id));
                tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
            });
        } finally { db.close(); }
    }
    async function exportLibrary() {
        return portable({ format: 'orbita-arena-library', version: 1, library: library(), rosters: read('rosters', []) });
    }
    async function importLibrary(raw, data) {
        if (raw?.format !== 'orbita-arena-library' || raw.version !== 1 || raw.library?.version !== 1 ||
            !Array.isArray(raw.library.folders) || !Array.isArray(raw.library.characters) || raw.library.characters.length > 1000 || raw.library.folders.length > 100)
            throw Error('Backup de biblioteca inválido.');
        const lib = library(), map = new Map();
        for (const folder of raw.library.folders) {
            if (typeof folder.id !== 'string' || map.has(folder.id)) throw Error('Pastas repetidas no backup.');
            const name = folderName(folder.name);
            let target = lib.folders.find(f => f.name.toLocaleLowerCase() === name.toLocaleLowerCase());
            if (!target) { target = { id: `folder-${++lib.counter}`, name }; lib.folders.push(target); }
            map.set(folder.id, target.id);
        }
        for (const entry of raw.library.characters) {
            const character = normalizedCharacter(entry.character, data);
            if (!map.has(entry.folder)) throw Error('Pasta inexistente no backup.');
            if (!lib.characters.some(c => fingerprint(c.character) === fingerprint(character)))
                lib.characters.push({ id: `character-${++lib.counter}`, folder: map.get(entry.folder), character });
        }
        const rosters = copy(read('rosters', []));
        if (raw.rosters && (!Array.isArray(raw.rosters) || raw.rosters.length > 100)) throw Error('Elencos inválidos.');
        for (const roster of raw.rosters || []) {
            if (!Array.isArray(roster.characters) || roster.characters.length > 48) throw Error('Elenco inválido no backup.');
            const characters = roster.characters.map(c => normalizedCharacter(c, data));
            let name = folderName(roster.name), suffix = 2;
            if (rosters.some(r => r.name === name && JSON.stringify(r.characters) === JSON.stringify(characters))) continue;
            const original = name;
            while (rosters.some(r => r.name === name)) name = `${original.slice(0, 45)} (${suffix++})`;
            rosters.push({ name, characters, settings: roster.settings || {} });
        }
        await importPortraits(raw.portraits);
        // The library record becomes authoritative; the original legacy list remains recoverable.
        lib.rosters = rosters;
        storeLibrary(lib);
        return copy(lib);
    }
    return Object.freeze({
        read,
        write,
        download,
        searchRick,
        searchShows,
        showCast,
        searchMovies,
        movieCast,
        searchGames,
        gameCast,
        imageUrl,
        resolveImage,
        putPortrait,
        portrait,
        library, createFolder, renameFolder, deleteFolder, saveCharacter, moveCharacter, deleteCharacter,
        portable, importPortraits, exportLibrary, importLibrary
    });
})();
