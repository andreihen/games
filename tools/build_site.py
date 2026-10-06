"""Gera o site completo para upload pelo navegador, sem dependências externas.

Uso: python tools/build_site.py [--output dist] [--zip site.zip]
O código editável continua em index.html e src/. Não edite o HTML gerado.
"""

import argparse
import base64
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]


def local_file(url):
    path = (ROOT / urlsplit(url).path).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        raise ValueError(f"Recurso ausente ou fora do projeto: {url}")
    return path


def build(output):
    output = output.resolve()
    if output == ROOT or output.is_relative_to(ROOT / "src"):
        raise ValueError("A saída deve ser uma pasta separada dos arquivos-fonte.")
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    styles = re.findall(r'<link\b[^>]*rel="stylesheet"[^>]*>', html)
    scripts = re.findall(r'<script\s+src="([^"]+)"\s*></script>', html)
    if len(styles) != 4 or not scripts or urlsplit(scripts[-1]).path != "./src/js/main.js":
        raise ValueError("A ordem de carregamento mudou; revise o empacotador.")
    for tag in styles:
        path = local_file(re.search(r'href="([^"]+)"', tag)[1])
        css = path.read_text(encoding="utf-8")
        if "</style" in css.lower():
            raise ValueError(f"CSS incompatível com incorporação: {path}")
        html = html.replace(tag, f"<style>\n/* {path.relative_to(ROOT).as_posix()} */\n{css}\n</style>", 1)

    flags = {
        path.stem: "data:image/svg+xml;base64," + base64.b64encode(path.read_bytes()).decode("ascii")
        for path in sorted((ROOT / "src/assets/flags").glob("*.svg"))
    }
    config = (ROOT / "src/js/games.config.js").read_text(encoding="utf-8")
    games = re.findall(r"file:\s*'([^']+)'", config)
    if len(games) != 44 or len(set(games)) != len(games) or len(flags) != 250:
        raise ValueError("Catálogo ou bandeiras mudou; revise as verificações da publicação.")
    sources = [local_file(url) for url in scripts[:-1]]
    sources += sorted((ROOT / "src/js/data").glob("*.js"))
    sources += [local_file(f"./src/js/games/{name}") for name in games]
    sources += [local_file(scripts[-1])]
    code = ["/* Distribuição autossuficiente. Fontes e créditos: THIRD_PARTY.md. */",
            "const BundledFlags = Object.freeze(" + json.dumps(flags, separators=(",", ":")) + ");"]
    replacements = 0
    for path in sources:
        js = path.read_text(encoding="utf-8")
        js, count = re.subn(r"\./src/assets/flags/\$\{(\w+)\.code\}\.svg", r"${BundledFlags[\1.code]}", js)
        replacements += count
        # O parser HTML reconhece uma tag de fechamento mesmo dentro de strings JS.
        js = re.sub(r"</script", r"<\/script", js, flags=re.IGNORECASE)
        code.append(f"\n/* {path.relative_to(ROOT).as_posix()} */\n{js}")
    if replacements != 3:
        raise ValueError("O uso das bandeiras mudou; revise a incorporação das imagens.")
    for url in scripts:
        html = html.replace(f'<script src="{url}"></script>', "", 1)
    html = html.replace("</body>", "<script>\n" + "\n".join(code) + "\n</script>\n    </body>", 1)
    html = html.replace("<head>", '<head>\n        <meta name="distribution" content="standalone-github-pages" />', 1)
    encoded = html.encode("utf-8")
    if len(encoded) >= 25 * 1024 * 1024:
        raise ValueError("A distribuição excede o limite de upload web do GitHub.")
    output.mkdir(parents=True, exist_ok=True)
    (output / "index.html").write_bytes(encoded)
    (output / ".nojekyll").write_text("", encoding="utf-8")
    (output / "THIRD_PARTY.md").write_text(
        "# Sobre esta distribuição\n\n"
        "CSS, JavaScript, bancos de dados e as 250 bandeiras estão incorporados ao `index.html`. "
        "Os caminhos descritos abaixo identificam os arquivos-fonte do projeto. "
        "As fontes originais e licenças do dicionário permanecem em `src/data-licenses/`. "
        "Abra o HTML para jogar; não é necessário carregar imagens separadamente.\n\n"
        + (ROOT / "THIRD_PARTY.md").read_text(encoding="utf-8"), encoding="utf-8")
    (output / "PUBLICAR.md").write_bytes((ROOT / "docs/PUBLICAR_GITHUB.md").read_bytes())
    files = ["index.html", ".nojekyll", "THIRD_PARTY.md", "PUBLICAR.md"]
    for source in sorted((ROOT / "src/data-licenses").iterdir()):
        if source.is_file():
            name = source.relative_to(ROOT).as_posix()
            target = output / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(source.read_bytes())
            files.append(name)
    manifest = {
        "format": "standalone-github-pages", "games": len(games), "flags": len(flags),
        "data": [p.stem for p in sorted((ROOT / "src/js/data").glob("*.js"))],
        "htmlBytes": len(encoded), "htmlSha256": hashlib.sha256(encoded).hexdigest(),
        "files": files + ["manifest.json"],
        "sources": {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                    for p in [ROOT / "index.html", *sources, *(ROOT / "src/css").glob("*.css"),
                              *(ROOT / "src/assets/flags").glob("*.svg")]},
    }
    (output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist")
    parser.add_argument("--zip", type=Path)
    args = parser.parse_args()
    manifest = build(args.output)
    if args.zip:
        args.zip.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(args.zip, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
            for name in manifest["files"]:
                archive.write(args.output / name, name)
    print(json.dumps({k: manifest[k] for k in ["format", "games", "flags", "data", "htmlBytes", "htmlSha256"]}, indent=2))
    print(f"Site: {args.output.resolve()}")
    if args.zip:
        print(f"ZIP: {args.zip.resolve()}")


if __name__ == "__main__":
    main()
