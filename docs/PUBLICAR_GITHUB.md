# Publicação no GitHub Pages

## Causa do problema encontrado em 5 de outubro de 2026

Na publicação em https://andreihen.github.io/games/, o HTML novo apontava para `src/css/` e `src/js/core/`, mas os arquivos novos estavam em `css/` e `js/core/`, na raiz do repositório. As bandeiras estavam espalhadas entre a raiz e `src/`, em vez de `src/assets/flags/`. Outros SVGs e alguns jogos não haviam sido enviados.

As três folhas `utilities.css`, `platform.css` e `arcade.css`, além dos dezesseis scripts de `src/js/core/`, retornavam HTTP 404. Os caminhos de `src/css/style.css`, `src/js/main.js` e `src/js/games.config.js` ainda serviam versões antigas, incompatíveis com o HTML atual. Dos 320 arquivos usados em tempo de execução, 297 não estavam no caminho esperado. Isso explica o alerta, o layout sem estilos e a biblioteca vazia; não era uma diferença normal de aparência entre navegadores.

As capas dos jogos são SVGs desenhados pelo próprio JavaScript. Os PNGs/JPGs de demonstração em `tests/results/` não são necessários para montar a interface.

## Pacote pronto para envio pelo navegador

A distribuição `Games-GitHub-Pages.zip` reúne o aplicativo em um `index.html` autossuficiente. CSS, JavaScript, dados e bandeiras acompanham o HTML. As fontes e os avisos de licença de terceiros acompanham o pacote, sem dependências de rede para jogar.

1. Extraia `Games-GitHub-Pages.zip` em uma pasta vazia.
2. Abra o [repositório games](https://github.com/andreihen/games), na branch `main`.
3. Use **Add file → Upload files** na raiz. Envie os arquivos e a pasta `src` extraídos, preservando `src/data-licenses/`. Inclua `.nojekyll` se o explorador ocultá-lo.
4. Confirme que o `index.html` enviado substituirá o que está na raiz. Não envie o ZIP fechado: o Pages não extrai arquivos ZIP. Não crie uma pasta `Games-GitHub-Pages` ou `dist` acima do HTML.
5. Faça o commit dos arquivos enviados.
6. Em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** e salve, se essa ainda não for a configuração atual.
7. Aguarde a conclusão da publicação e abra https://andreihen.github.io/games/. Use **Ctrl+Shift+R** se o navegador ainda mostrar a versão anterior.

O ZIP contém treze arquivos, incluindo este passo a passo e o manifesto. O HTML ocupa aproximadamente 7 MB; os limites documentados para upload pelo navegador são 25 MiB por arquivo e 100 arquivos por envio. Os arquivos antigos espalhados pelo repositório não são referenciados pelo novo HTML; a limpeza deles pode ser feita depois, mantendo o histórico Git.

## Próximas atualizações

No projeto local, edite o `index.html` original e os arquivos em `src/`. Gere novamente a distribuição com Python 3, sem instalar bibliotecas:

```sh
python tools/build_site.py --zip Games-GitHub-Pages.zip
```

O resultado também fica em `dist/`. Não edite o HTML gerado manualmente. O empacotador interrompe a geração se faltar um recurso ou se o catálogo/uso das bandeiras mudar sem a correspondente revisão. `manifest.json` registra os arquivos, as contagens e os hashes da versão entregue.

O pacote concentra o download inicial em um HTML maior. Para manter o carregamento sob demanda, uma alternativa é publicar diretamente o projeto usando Git ou GitHub Desktop: envie `index.html`, `.nojekyll`, `THIRD_PARTY.md` e **a pasta `src` inteira, sem rearranjar seus arquivos**. Não envie `tests/node_modules/`, `work/` ou imagens de demonstração.

## Conferência

Com as dependências de testes instaladas e Python no PATH:

```sh
npm run test:deploy --prefix tests
```

O teste gera um pacote temporário e serve o HTML na raiz e em `/games/`. Em ambos os caminhos, verifica o catálogo e os estilos, compara os quatro bancos de dados e as 250 bandeiras e inicializa os 44 jogos. Requisições a scripts, folhas de estilo ou imagens externas fazem o teste falhar. O relatório fica em `tests/results/deployment.json`.

A verificação de navegador complementa o DOM simulado: conferiu o layout do arcade, a renderização real de bandeiras incorporadas e o feedback de uma rodada. A correção local só aparecerá no site público depois do upload e da nova publicação; esta documentação não afirma que o repositório remoto já foi alterado.

## Documentação do GitHub

- [Enviar arquivos: limites e procedimento](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
- [Configurar a branch e a pasta de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
- [Criar um site e desativar Jekyll com `.nojekyll`](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
