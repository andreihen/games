# Órbita

Coleção estática com **61 jogos**: 60 na biblioteca principal e Resta Um em Extras. A coleção inclui Xadrez, Damas, Campo Minado e Ludo, além da reformulação dos jogos anteriores, dos 21 jogos das fases 3 e 4 e de Linha do Tempo, Quem Sou Eu?, Conexões, Ateliê de Cores e Cor de Memória. A biblioteca recebeu uma interface de arcade, capas, busca, favoritos e histórico de jogos iniciados. Sequência Rápida e Labirinto foram retirados do catálogo; suas implementações anteriores estão em `archive/`.

Xadrez e Damas oferecem duas pessoas no mesmo aparelho ou bots nos níveis fácil, médio, difícil e especialista. Ludo permite de 2 a 4 participantes, misturando pessoas e bots. Campo Minado tem quatro dificuldades e primeiro clique seguro. Veja os [controles, regras e níveis dos jogos clássicos](docs/JOGOS_CLASSICOS.md).

## Jogar

Abra `index.html` em um navegador moderno. O aplicativo usa HTML, CSS, JavaScript e arquivos locais, sem CDN, build, backend ou telemetria. Para uma prévia por HTTP, execute na pasta do projeto:

```sh
python -m http.server 8765
```

Abra `http://localhost:8765`. Python serve apenas a prévia. Para hospedagem estática, publique `index.html` e `src/` na mesma pasta; os caminhos relativos também permitem subdiretórios.

## Publicar no GitHub Pages

Para upload pelo navegador, gere a distribuição que incorpora os estilos, os 61 jogos, os oito bancos de dados e as 250 bandeiras ao HTML:

```sh
python tools/build_site.py --zip Games-GitHub-Pages.zip
```

Extraia o ZIP e envie **o conteúdo extraído** para a raiz do repositório. O `index.html` precisa ficar diretamente na raiz, junto de `.nojekyll`, `THIRD_PARTY.md` e `src/data-licenses/`. Em Settings → Pages, escolha Deploy from a branch → main → / (root). Essa distribuição permite jogar sem uploads separados de imagens e sem depender da estrutura de CSS/JavaScript do repositório. A pasta `dist/` contém os mesmos arquivos do ZIP; não envie a pasta `dist` como uma pasta adicional ao usar a raiz como fonte do Pages.

O `index.html` gerado tem cerca de 7 MB e concentra o download inicial. O HTML e os arquivos dentro de `src/` continuam sendo as fontes editáveis do projeto: após uma mudança, gere novamente o ZIP. Para publicar as fontes diretamente com Git/GitHub Desktop, mantenha toda a hierarquia de `src/` e envie todos os arquivos; essa alternativa mantém o carregamento dos jogos e dados sob demanda.

Veja o [diagnóstico e o passo a passo de publicação](docs/PUBLICAR_GITHUB.md). Para verificar o pacote real na raiz e em `/games/`, com Node.js, as dependências de testes e Python disponíveis:

```sh
npm run test:deploy --prefix tests
```

Essa verificação inicializa os 61 jogos em cada caminho, compara os oito bancos e as 250 bandeiras com as fontes e rejeita requests externos. Ela complementa as suítes de jogabilidade, incluindo os jogos clássicos.

## Partidas e progresso

- **Fácil, Médio, Difícil e Especialista:** parâmetros próprios por jogo, sem uma progressão de níveis numerados. Simon mantém sua progressão contínua de sequência, sem seletor de dificuldade.
- **Seed:** cada configuração identifica um desafio reproduzível na mesma versão do aplicativo. “Mesmo desafio” repete a geração; “Nova partida” usa outra seed. O link compartilhado inclui jogo, dificuldade, seed e opções.
- **Desafio diário:** seed baseada na data UTC, na dificuldade Médio. A Jornada mantém a dificuldade escolhida e evita os três jogos recentes e a categoria anterior quando existem alternativas. Extras e Simuladores ficam fora da Jornada; simuladores também ficam fora do desafio diário.
- **Controles:** botões, teclado e toque, conforme a mecânica. Bloco Fit, Flow e jogos de ordenar oferecem arraste e alternativas por seleção/botões. Os controles disponíveis aparecem na configuração.
- **Métricas:** pontuação, sequência, tempo ativo, erros e precisão. A unidade de acerto varia: resposta, palpite, caractere ou conclusão de puzzle. As pontuações devem ser comparadas dentro do mesmo jogo e configuração.
- **Pausa:** Escape, o botão e a ocultação da aba suspendem os recursos da sessão. Reinício e saída encerram temporizadores, animações, eventos e recursos próprios. A preparação do Sudoku não conta no tempo de resolução.

O progresso fica em `localStorage`, na chave `desafio-logico-total:progress`, formato **versão 2**. O formato anterior é migrado mantendo os registros e uma cópia na chave com sufixo `:v1-backup`. Saves inválidos ou de versão desconhecida não são sobrescritos. Cada jogo mantém até 30 partidas recentes, recordes e médias. A biblioteca guarda favoritos, os 12 jogos iniciados mais recentes e a última dificuldade e opções por jogo; seeds não ficam presas a esse preset. Capitais utiliza revisão espaçada; Chuva de Palavras usa o WPM recente para uma adaptação limitada, registrada nas opções do desafio para permitir repetição.

O armazenamento depende do navegador e da origem. Não há sincronização entre dispositivos. Todos os dados geográficos, bandeiras e palavras necessários estão incluídos; veja `THIRD_PARTY.md` para as fontes e licenças.

## Arcade e conhecimento

- **Linha do Tempo:** 45 marcos da exploração espacial, cinco rodadas, datas sem empate e referências reveladas após responder.
- **Quem Sou Eu?:** 36 identidades de três temas, pistas progressivas e resposta digitada. Especialista limita a dois erros distintos por identidade.
- **Conexões:** 32 categorias editoriais; sorteia quatro grupos e dezesseis termos, rejeitando colisões e relações concorrentes conhecidas no banco.
- **Biblioteca:** busca sem acentos, categorias, favoritos, novidades, últimos jogados e ordenação por nome ou recência. A preparação explica os parâmetros reais de cada dificuldade.
- **Geradores corrigidos:** nove posições iniciais no deslizante Fácil, Nonograma com solução única e comparações com relações balanceadas em ordem aleatória.

Veja a [análise dos geradores e a entrega de arcade](docs/ARCADE_E_GERACAO.md).

## Jogos da primeira expansão

| Categoria            | Jogos adicionados                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Memória              | N-Back, Memória de Trabalho, Ordem Temporal, Memória Espacial                                |
| Lógica               | Rotação Mental                                                                               |
| Atenção              | Cores: Stroop, Ordenar Cores, Cor Diferente, Regra Mutante, Checklist, Par ou Ímpar Dinâmico |
| Matemática           | Matriz Rápida, Operador Mutante, Subitização, Maior ou Menor, Estimativa                     |
| Conhecimento         | Capitais, Bandeiras, Mapa Mundi, Dia da Semana                                               |
| Digitação e Palavras | Termo                                                                                        |

Termo inclui solo, dueto, quarteto e escada, com palavras de 4 a 7 letras. O banco Cotidiano contém 780 respostas validadas pelo dicionário VERO; o banco Amplo permite 166.143 entradas, incluindo flexões, como alvos. Chuva de Palavras possui 865 palavras em português, 729 em inglês e 135 tokens de código, filtrados por comprimento conforme a dificuldade.

Capitais, Bandeiras e Mapa Mundi oferecem resposta digitada e usam o banco completo em todas as dificuldades. As alternativas priorizam a mesma área geográfica. Os cinco jogos de palavras/geografia priorizam itens ainda não vistos e guardam até 80 itens recentes por jogo. As perguntas compartilham feedback com texto, símbolos, cores e barra de progresso.

Veja a [lista dos 61 jogos e as ideias de expansão](docs/CATALOGO_E_IDEIAS.md), os [detalhes de UX e rejogabilidade](docs/UX_UI.md) e o relatório da primeira reformulação em `REFATORACAO.md`.

## Organização e manutenção

| Arquivo ou pasta                                           | Responsabilidade                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `index.html`, `src/css/`                                   | Dashboard, configuração, partida, resultado e estilos locais                      |
| `src/js/main.js`                                           | Navegação, desafio diário, Jornada, carregamento e compartilhamento               |
| `src/js/games.config.js`                                   | Catálogo, categorias, regras, opções e controles                                  |
| `src/js/core/random.js`, `difficulty.js`                   | Aleatoriedade com seed e políticas das quatro dificuldades                        |
| `src/js/core/session.js`, `score.js`, `progress.js`        | Ciclo de vida, métricas e persistência                                            |
| `src/js/core/algorithms.js`, `puzzles.js`, `sudoku.js`     | Geradores, matemática, cores, formas e técnicas de Sudoku                         |
| `src/js/core/rules.js`, `interactions.js`, `challenges.js` | Regras formais, arraste e estrutura de perguntas                                  |
| `src/js/core/library.js`, `learning.js`, `nonogram.js`     | Filtros e capas, geração de conhecimento e unicidade de Nonograma                 |
| `src/js/core/knowledge.js`                                 | Baralho sem repetição, alternativas geográficas, aliases e seleção de vocabulário |
| `src/js/core/registry.js`, `src/js/games/`                 | Carregamento sob demanda e fábricas de cada jogo                                  |
| `src/js/data/`, `src/assets/flags/`, `src/data-licenses/`  | Dados locais, créditos e fontes do dicionário                                     |
| `tests/`                                                   | Verificações opcionais e resultados registrados                                   |

Para adicionar um jogo, crie seu arquivo, inclua metadados em `GAMES_CONFIG` e registre o mesmo identificador:

```js
GameRegistry.register('meu_jogo', (session) => {
    function init(config) {
        const button = document.createElement('button');
        button.textContent = `Concluir exemplo: ${config.difficultyName}`;
        session.ui.phaseDisplay.append(button);
        session.listen(button, 'click', () => {
            session.score.answer(true);
            session.complete(true, { text: 'Objetivo concluído.' });
        });
    }
    return { init, destroy: session.destroy };
});
```

Use `session.random`, `session.timeout`, `session.interval`, `session.frame`, `session.clear` e `session.listen`. `session.now()` mede tempo ativo; `session.sleep()` resolve `false` ao encerrar a partida. Retorne a promessa da inicialização assíncrona, ou use `session.run` para capturar falhas de uma apresentação independente. Registre a liberação de recursos próprios em `session.cleanup`. `session.notify` mostra feedback e `session.complete` encerra uma única vez. Configure os quatro perfis em `DifficultyEngine` ou derive-os de `config.difficulty`; não use níveis internos.

## Testes opcionais

O aplicativo não precisa de Node.js. Para desenvolver, use Node.js 24 ou superior:

```sh
npm ci --prefix tests
npm --prefix tests test
```

São **83 grupos de verificações** em nove suítes: jogos/algoritmos, plataforma, partidas completas, catálogo, UX/rejogabilidade, arcade/conhecimento, revisão de jogabilidade, cores e percepção. Os testes usam DOM simulado e relógio controlado, com geradores e soluções independentes. Os registros ficam em `tests/results/`. A primeira conferência no Chromium integrado está em `browser.json`; a atualização de UX está em `browser-ux.json`. A conferência anterior dos 44 jogos em 320 pixels está em `browser-arcade.json`; a dos dois jogos de cores está em `browser-colors.json`. Não publique `tests/node_modules/`.

Há configuração do Prettier para manter os arquivos legíveis. Dados gerados, SVGs de terceiros e o arquivo histórico são excluídos da formatação.

Ao distribuir uma atualização, altere a versão de assets em `GameRegistry.version` e os parâmetros `v` dos imports em `index.html`. O carregamento dos jogos e dados utiliza essa mesma versão para evitar reutilizar arquivos antigos no navegador.

## Limites atuais

A Arena Improvável usa agora as regras `arena-4`: participantes começam de mãos vazias, exploram fontes e depósitos, recebem personalidades individuais e pertencem a distritos. Alianças podem persistir à distância; novos perigos e oportunidades mudam os planos. A biblioteca pessoal guarda personagens e pastas neste dispositivo, com backups de retratos. A busca também inclui personagens de videogames. [Funcionamento, migração e requisitos de nuvem](docs/ARENA_EVOLUCAO.md). Verificações específicas: `npm run test:arena-evolution` em `tests/` com Node 24 ou superior.

O mapa usa cartografia simplificada e não oferece contornos de todos os microestados. O bot Especialista da Velha usa busca limitada, sem promessa de jogo perfeito. Nonogram aceita desenhos que satisfaçam as pistas e agora gera pistas com uma única solução. Dificuldade entre jogos não é uma escala universal de habilidade; fora do Sudoku, não há calibração psicométrica ou garantia de distância ótima do embaralhamento. O dicionário de Termo não representa todas as formas, nomes próprios ou palavras compostas do português. A geração de Sudoku pode levar alguns segundos. A validação não abrange aparelhos físicos, todos os navegadores, auditoria completa de leitor de tela ou publicação em produção.

## Revisão de interface e memória — 7 de outubro de 2026

Simon usa o console circular de quatro cores, mantendo o modo inverso. Jogo da Memória oferece pares e Sequência de quadrados; Trilha da Memória volta a apresentar uma posição de cada vez, sem revelar a numeração. A rotação da grade fica num modo explícito. Ordem Temporal usa o vocabulário editorial, evita itens recentes e aumenta a sequência nas seis rodadas. Checklist oferece Expedição, Missão espacial e Oficina de poções, com etapas, progresso e bônus por três decisões seguidas. Apague as Luzes recupera as peças amarelas iluminadas.

A biblioteca tem cores mais discretas e menos elementos decorativos. Modos e dificuldades ficam visíveis em grupos de escolha; parâmetros irrelevantes são ocultados e o código para repetição fica numa seção opcional. Veja [os detalhes da revisão](docs/REVISAO_JOGABILIDADE.md).

Os jogos Ateliê de Cores e Cor de Memória estão descritos em [Jogos de cores](docs/JOGOS_DE_CORES.md).

Veja a [coleção de sete mecânicas de percepção](docs/JOGOS_DE_PERCEPCAO.md), inspirada no Dialed.gg.

O filtro **Percepção** reúne Cor Relâmpago, Cor de Memória, Nota de Memória, Relógio Interno, Forma de Memória, Padrão Partido e Construtor de Ritmo. As telas de configuração e partida dos sete jogos foram conferidas em 320 pixels; o registro está em `tests/results/browser-perception.json`.

## Novos desafios e retomada

Pokédex Misteriosa, Elemento Secreto, Equação Oculta e Soma Exata ampliam a coleção. Chuva de Palavras agora cai também no modo tranquilo e oferece Texto completo, com parágrafos em português, inglês e código. Veja [a entrega e os critérios de geração](docs/EXPANSAO_CONHECIMENTO.md).

A página atual fica no URL e em `desafio-logico-total:page`: configurações, filtros e desafio podem ser reabertos sem passar pelo menu. Voltar/avançar do navegador funcionam entre telas. Ao recarregar, o desafio conserva seed e opções, mas começa uma nova tentativa. Ao sair e voltar com a página preservada pelo cache do navegador, a sessão é pausada e mantém seu estado vivo. Não é um salvamento universal das jogadas.

## Órbita: revisão da experiência

A interface agora usa uma arena que ocupa a janela, com controles de partida compactos, Como jogar recolhido e feedback por símbolos e estados visuais. A seleção inicial prioriza variedade de interação; os cartões indicam a habilidade exigida. Sair retorna à tela anterior e preserva o contexto do catálogo, inclusive ao reabrir um endereço de desafio que coincide com o contexto salvo. As chaves antigas de estatísticas foram mantidas para não perder progresso.

A [auditoria de 56 jogos](docs/AUDITORIA_ORBITA.md) registra objetivos, regras, níveis, 11 dimensões de avaliação e prioridades. Não foram adicionados ou removidos jogos nesta etapa. As notas de diversão são hipóteses de design, não resultados de testes com jogadores.

## Simuladores

**Arena Improvável**: organize de 2 a 48 participantes a partir de 131 personagens com fotos. O painel permite Tipo → Tema/obra → Personagens, incluindo TV Show → iCarly (elenco de 2007). Há edição, retrato por upload ou URL, favoritos e busca de outras séries via TVmaze.

Seis biomas têm desenhos, conexões, fontes naturais e equipamentos próprios; outras três topologias podem ser escolhidas. Cada NPC tem orçamento padrão de 36 pontos, atributos de 1 a 10 e perfil geral/individual. A competição inclui 26 famílias de eventos, rolagens verificáveis, confrontos, contra-ataques, emboscadas, armadilhas, persuasão, furto, envenenamento, sabotagem e resgate. Não usa pontuação de respostas.

O motor e os saves são versão 2. Saves antigos permanecem exportáveis e seus elencos podem ser recuperados; a competição é reiniciada com as regras novas. O catálogo local e seus 131 retratos funcionam offline e entram no HTML de distribuição. Imagens customizadas e buscas externas têm suas limitações documentadas. Veja [regras e verificação da expansão RPG](docs/ARENA_RPG.md) e o [prompt estruturado e executado](docs/PROMPT_ARENA_RPG.md).

A Arena Improvável agora inclui pesquisa de filmes, alianças com turnos coletivos, explosivos e perigos temporários por região. Consulte [Arena viva e filmes](docs/ARENA_VIVA.md).
