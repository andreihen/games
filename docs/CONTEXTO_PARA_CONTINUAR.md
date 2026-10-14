# Contexto de continuidade — Órbita

Consolidado em **13 de outubro de 2026**, para continuar o desenvolvimento em outro computador usando os mesmos arquivos. Este documento descreve o estado da entrega anterior e as preferências apresentadas pelo usuário; não representa uma nova solicitação de implementação.

## 1. O que é o aplicativo

**Órbita** é uma coleção de minijogos para navegador, em português, com biblioteca, categorias, busca, favoritos, últimos jogados, configuração, partidas, resultados, Jornada e desafio diário. O nome anterior era **Desafio Lógica Total**. Algumas chaves internas ainda usam esse nome para preservar dados antigos; isso é intencional.

Existem **57 jogos: 56 na biblioteca principal e Resta Um em Extras**. A maioria estimula memória, atenção, percepção, raciocínio lógico, matemática, conhecimento ou digitação. A categoria **Simuladores** contém a **Arena Improvável**, voltada à diversão e à narrativa aleatória, sem respostas corretas ou pontuação de conhecimento.

O usuário quer continuar este aplicativo, refinando os mesmos arquivos. Não pediu para começar outro projeto nem para migrar a tecnologia.

## 2. Preferências do usuário que devem orientar a continuidade

- Cada jogo deve ter **identidade própria**, ser visual, divertido e ter boa rejogabilidade. Aumentar a quantidade de jogos sem uma mecânica interessante não atende ao objetivo.
- A interface deve parecer uma coleção de games, mas ser **limpa, discreta e intuitiva**. O usuário rejeitou interfaces chamativas, decoração excessiva e uma aparência que descreveu como “muita cara de IA”.
- A ação deve acontecer na área de jogo, aproveitando a janela. Entrada de resposta e controles essenciais devem continuar acessíveis, inclusive no celular. O campo digitado de Bandeiras ficar quase fora da página foi um exemplo de problema a evitar.
- Acertos, erros, dano, mudanças de estado e progresso precisam de feedback visual claro, com texto/símbolos além de cor.
- Dificuldades e modos devem comunicar o que muda na mecânica. Evitar seletores genéricos ou parâmetros que não façam sentido para aquele jogo.
- Rejogabilidade exige bancos variados, sorteio sem repetição imediata e geração coerente. O nível Fácil não pode apresentar sempre as mesmas perguntas.
- Em geografia, as alternativas devem ser plausíveis. Um país sul-americano não deve ser a única opção desse continente numa pergunta que torna a resposta óbvia. Manter modos digitados.
- O usuário prefere voltar à **página anterior**, preservando o contexto, em vez de sempre retornar ao menu. Também quer poder reabrir a página/desafio onde estava.
- Novos jogos devem ser avaliados pela mecânica, habilidade estimulada, clareza, variedade e diversão, não apenas por uma descrição temática.
- Simuladores podem ser apenas entretenimento: não precisam avaliar uma resposta real. O usuário gosta de personagens de cultura brasileira, cultura pop, filmes, séries, anime, videogames e outras obras.
- Mudanças específicas em outros jogos serão discutidas separadamente. Não transformar todas as ideias antigas em uma lista automática de tarefas ainda pendentes.

## 3. Caminho percorrido e decisões já implementadas

O projeto começou com jogos existentes que precisavam de refatoração e correções. O usuário autorizou também as expansões das fases 3 e 4, depois pediu melhorias de UX, variedade de palavras/perguntas, jogos de conhecimento, jogos inspirados em referências de cores/percepção e desafios de Pokémon.

Foram reformulados geradores, controles, configuração, feedback, navegação e catálogo. A coleção foi renomeada para Órbita e passou por uma auditoria de objetivos e mecânicas.

Decisões importantes já adotadas:

- **Simon Diz:** console circular clássico de quatro cores; manter o modo inverso. Sua sequência cresce continuamente, sem seletor de dificuldade genérico.
- **Jogo da Memória:** pares e um modo de sequência de quadrados que acendem/apagam. **Trilha da Memória** apresenta posições uma por vez; rotação é um modo explícito.
- **Ordem Temporal:** mais vocabulário, prevenção de repetição e sequências crescentes ao longo das rodadas.
- **Apague as Luzes:** peças amarelas iluminadas, recuperando a aparência que o usuário preferiu.
- **Checklist:** virou missões de Expedição, Missão espacial e Oficina de poções. O exemplo do serviço do usuário não deve definir a identidade do jogo.
- **Termo:** solo, dueto, quarteto e escada, com palavras de 4 a 7 letras e validação de vocabulário.
- **Chuva de Palavras:** palavras realmente caem; há modo de texto completo, com português, inglês e código, correção e feedback de digitação.
- **Capitais, Bandeiras e Mapa Mundi:** resposta digitada, alternativas regionais mais criteriosas e seleção mais variada em todos os níveis.
- **Linha do Tempo, Quem Sou Eu? e Conexões:** ampliação do conhecimento com bancos editoriais e regras de geração verificadas.
- **Ateliê de Cores e Cor de Memória:** inspirados nas referências [Trycolors](https://trycolors.com/) e [Dialed Color2](https://dialed.gg/color2), com implementação própria.
- A expansão inspirada no [Dialed.gg](https://dialed.gg/) inclui Cor Relâmpago, Nota de Memória, Relógio Interno, Forma de Memória, Padrão Partido e Construtor de Ritmo. O filtro Percepção também reúne Cor de Memória. Isso não deve ser descrito como uma cópia integral de todos os jogos que o site externo possa oferecer hoje.
- **Pokédex Misteriosa, Elemento Secreto, Equação Oculta e Soma Exata:** jogos adicionados na expansão seguinte.
- Sequência Rápida e Labirinto foram retirados do catálogo; versões anteriores ficaram em `archive/`.
- A Jornada e o desafio diário não devem incluir a Arena Improvável. Simuladores não recebem métricas fictícias de acerto/vitória de quiz.

## 4. Catálogo atual

A tabela abaixo foi extraída do `GAMES_CONFIG` atual. Os identificadores são os usados nos arquivos, no registro das fábricas e nos URLs. A categoria efetiva do catálogo pode ser diferente de um filtro transversal, como Percepção.

| Categoria | Jogo / identificador | Mecânica |
| --- | --- | --- |
| Memória | **Cor Relâmpago** · `colorrecall` | Observe uma cor e reconstrua o tom depois que ela desaparecer. |
| Memória | **Nota de Memória** · `soundrecall` | Ouça uma nota e reencontre sua altura pelo ouvido. |
| Atenção | **Relógio Interno** · `timerecall` | Sinta a duração de um intervalo e reproduza sem cronômetro. |
| Memória | **Forma de Memória** · `shaperecall` | Reconstrua o tamanho e a rotação de uma forma. |
| Atenção | **Padrão Partido** · `patternrepair` | Memorize uma grade e desfaça as trocas que quebraram seu padrão. |
| Atenção | **Construtor de Ritmo** · `temporebuild` | Reconstrua uma batida musical, uma faixa por vez. |
| Atenção | **Ateliê de Cores** · `colormix` | Misture gotas de cor para alcançar um tom alvo. |
| Memória | **Cor de Memória** · `colormemory` | Recrie as cores de personagens e símbolos de memória. |
| Lógica | **Decifrando Cores** · `decode_colors` | Dedução com pistas que não revelam posições. |
| Lógica | **Apague as Luzes** · `lightsout` | Planeje os movimentos para apagar o tabuleiro. |
| Lógica | **Balança Lógica** · `mystery_scale` | Investigue um objeto de peso diferente. |
| Lógica | **Sudoku** · `mini_sudoku` | Resolva pelas técnicas e entenda cada dica. |
| Lógica | **Bloco Fit** · `blockfit` | Gire e arraste peças para preencher a área. |
| Lógica | **Conecte os Pontos** · `flow` | Desenhe caminhos sem cruzamentos. |
| Lógica | **Nonogram** · `nonogram` | Pistas numéricas revelam um desenho. |
| Lógica | **Quebra-Cabeça Deslizante** · `sliding_puzzle` | Organize uma configuração nova a cada partida. |
| Lógica | **Torre de Hanói** · `hanoi_tower` | Reorganize discos a partir de posições variadas. |
| Lógica | **Velha: Peças Móveis** · `tictactoe` | Três peças e decisões que mudam a cada turno. |
| Memória | **Jogo da Memória** · `memory_game` | Combine imagens, conceitos e associações. |
| Memória | **Simon Diz** · `simonsays` | Uma sequência que cresce a cada acerto. |
| Memória | **Trilha da Memória** · `memorypath` | Observe os quadrados e repita a sequência. |
| Memória | **Prateleira da Memória** · `memoryshelf` | Descubra alterações ou restaure a organização. |
| Atenção | **Inspetor** · `symbol_inspector` | Analise casos seguindo regras que mudam. |
| Atenção | **Qual a Diferença?** · `subtledifference` | Compare dois painéis e encontre as alterações. |
| Atenção | **Impulso Certo** · `rightimpulse` | Responda ao alvo e ignore os distratores. |
| Matemática | **Arena de Cálculo** · `mental_math` | Expressões mentais, combos e modos variados. |
| Digitação e Palavras | **Chuva de Palavras** · `wordrain` | Treine digitação com ritmo adaptativo. |
| Extras | **Resta Um** · `resta_um` | Tabuleiros procedurais com solução válida. |
| Digitação e Palavras | **Termo** · `termo` | Dedução de palavras em desafios variados. |
| Conhecimento | **Capitais** · `capitals` | Associe países e capitais e reveja seus erros. |
| Conhecimento | **Bandeiras** · `flags` | Reconheça países e territórios por suas bandeiras. |
| Conhecimento | **Mapa Mundi** · `worldmap` | Explore países, continentes, vizinhos e oceanos. |
| Conhecimento | **Dia da Semana** · `weekday` | Descubra o dia e confira a explicação do cálculo. |
| Atenção | **Cores: Stroop** · `stroop` | Responda pela cor ou pela palavra conforme a regra. |
| Atenção | **Ordenar Cores** · `colororder` | Organize tonalidades com diferenças mensuráveis. |
| Atenção | **Cor Diferente** · `oddcolor` | Encontre a célula diferente com contraste progressivo. |
| Matemática | **Matriz Rápida** · `matrix` | Pequenos desafios de operações e transformações. |
| Atenção | **Regra Mutante** · `mutantrule` | Acompanhe regras que mudam durante a partida. |
| Memória | **N-Back** · `nback` | Compare o estímulo atual com alguns passos atrás. |
| Memória | **Memória de Trabalho** · `workingmemory` | Guarde e transforme uma sequência de números. |
| Matemática | **Operador Mutante** · `mutantoperator` | Calcule com símbolos cujo significado muda. |
| Atenção | **Checklist** · `checklist` | Prepare equipes para missões com regras que mudam. |
| Memória | **Ordem Temporal** · `temporalorder` | Restaure a ordem de eventos após observá-los. |
| Matemática | **Subitização** · `subitizing` | Perceba quantidades em uma apresentação breve. |
| Matemática | **Maior ou Menor** · `compare` | Compare expressões sem uma caixa de cálculo. |
| Matemática | **Estimativa** · `estimate` | Encontre a aproximação numérica mais adequada. |
| Memória | **Memória Espacial** · `spatialmemory` | Reproduza células, cores e sequências de uma grade. |
| Lógica | **Rotação Mental** · `mentalrotation` | Distinga uma rotação de uma figura espelhada. |
| Atenção | **Par ou Ímpar Dinâmico** · `dynamicnumbers` | Classifique números quando a regra muda. |
| Conhecimento | **Linha do Tempo** · `timeline` | Ordene os marcos da exploração espacial. |
| Conhecimento | **Quem Sou Eu?** · `identity` | Descubra identidades secretas por pistas progressivas. |
| Conhecimento | **Conexões** · `connections` | Encontre quatro relações entre dezesseis termos. |
| Conhecimento | **Pokédex Misteriosa** · `pokemon` | Encontre o Pokémon pelas comparações de tipos, geração e medidas. |
| Conhecimento | **Elemento Secreto** · `element` | Investigue o elemento por número atômico, período e família. |
| Matemática | **Equação Oculta** · `equation` | Descubra uma igualdade usando pistas para cada caractere. |
| Lógica | **Soma Exata** · `sumexact` | Retire números até todas as somas coincidirem. |
| Simuladores | **Arena Improvável** · `survivalarena` | Organiza um elenco de 2–48 participantes e observa uma competição de sobrevivência, com RPG, alianças, mapa, perigos e eventos aleatórios. |

## 5. Tecnologia e organização

O aplicativo é **estático**, feito com HTML, CSS e JavaScript clássico, sem framework, backend ou banco de dados de servidor. O aplicativo não precisa de Node.js para jogar. Python é usado para servir a prévia e gerar a distribuição; Node.js é usado nas verificações de desenvolvimento.

As fontes editáveis são o `index.html` da raiz e os arquivos em `src/`. O `dist/index.html` é gerado e não deve ser editado como fonte principal.

| Local | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da plataforma e carregamento dos scripts/estilos. |
| `src/css/` | Estilos da plataforma, arcade e jogos; `simulator.css` cuida da Arena. |
| `src/js/main.js` | Navegação, URLs, Jornada, diário, configuração, compartilhamento e retomada da página. |
| `src/js/games.config.js` | Catálogo, nomes, categorias, regras, modos e controles. |
| `src/js/games/` | Uma fábrica por jogo, registrada em `GameRegistry`. |
| `src/js/core/registry.js` | Carregamento dos jogos e dados sob demanda, com versão de assets. |
| `src/js/core/random.js` | Aleatoriedade reproduzível por seed. |
| `src/js/core/session.js` | Ciclo de vida, pausa, tempo ativo, eventos, timers e limpeza. |
| `src/js/core/score.js`, `progress.js` | Pontuação e persistência do progresso dos jogos. |
| `src/js/core/knowledge.js`, `learning.js`, `challenges.js` | Seleção de conteúdo, respostas, aprendizagem e estrutura de desafios. |
| Outros arquivos em `src/js/core/` | Geradores, puzzles, regras, matemática, Sudoku, Nonograma, interação e percepção. |
| `src/js/data/` | Oito bancos locais: arena, elements, geography, learning, passages, pokemon, vocabulary e words. |
| `src/assets/flags/` | 250 bandeiras SVG locais. |
| `src/assets/characters/` | 131 retratos locais e `sources.json` com proveniência. |
| `src/data-licenses/`, `THIRD_PARTY.md` | Créditos e licenças dos dados e imagens. |
| `tools/build_site.py` | Geração do pacote estático completo. |
| `tests/`, `tests/results/` | Testes automatizados e registros de verificações. |

Para um jogo novo, manter a arquitetura de fábrica `GameRegistry.register(id, factory)` e metadados correspondentes em `GAMES_CONFIG`. Usar as APIs da sessão para tempo, aleatoriedade, eventos, feedback e limpeza. Não adicionar `Math.random()` à geração de desafios reproduzíveis; os testes deliberadamente bloqueiam isso.

Respeitar `session.random`, `timeout`, `interval`, `frame`, `listen`, `clear`, `cleanup` e a conclusão única de partidas normais. Inicializações assíncronas e apresentações precisam tolerar saída, pausa e destruição. Áudio depende de gesto do usuário e tem alternativas visuais onde aplicável.

### Versões nesta cópia

- Progresso geral: **versão 2**.
- Motor e saves da Arena: **versão 3**.
- Dados da Arena: **`arena-3`**.
- Versão de assets em `GameRegistry` e imports do HTML: **`2026-10-12.10`**.

Não confundir essas versões entre si. Alguns trechos do README e documentos históricos ainda citam contagens/versões anteriores. Para o estado desta entrega, o código, `tests/package.json`, `docs/ARENA_VIVA.md` e este contexto são as referências mais atuais. O prompt da expansão RPG documenta uma etapa anterior, não substitui as regras posteriores.

## 6. Navegação, progresso e o que realmente é salvo

Os links usam parâmetros como `view`, `game`, `difficulty`, `seed` e `options`. A plataforma preserva a página/configuração e o contexto da biblioteca. Sair de um jogo retorna à tela anterior; voltar/avançar do navegador também funciona entre telas.

**Nos minijogos em geral, reabrir o mesmo desafio mantém seed/opções, mas pode iniciar uma nova tentativa.** Uma página preservada pelo cache do navegador pode manter a sessão viva e pausada. Não existe um save universal de todas as jogadas de todos os jogos.

**A Arena tem um save próprio**, com estado e histórico, permitindo continuar o mesmo acontecimento depois de recarregar. Essa diferença deve ser preservada e comunicada corretamente.

Chaves principais:

- `desafio-logico-total:progress`: estatísticas, histórico e preferências da biblioteca, formato 2; há migração com backup do formato 1.
- `desafio-logico-total:page`: contexto da página e navegação.
- Prefixo `orbita:arena:`: `save`, `rosters`, `catalog`, `legacy-save`, `legacy-save-v1` e `legacy-save-v2`.
- IndexedDB **`orbita-arena-images`**: retratos enviados pelo usuário.

Tudo isso é local ao **navegador e à origem**. `localhost`, `127.0.0.1`, portas diferentes e a hospedagem publicada podem ter armazenamentos distintos. Não há conta, sincronização entre dispositivos ou backend.

## 7. Arena Improvável — estado mais recente

É um simulador narrativo de sobrevivência inspirado no clima de Hunger Games, com elenco misturado ou por obra. O usuário é observador. Personagens e poderes são adaptados às regras, sem promessa de fidelidade canônica; não existe vencedor escolhido previamente.

### Arquivos centrais

- `src/js/core/arena.js`: regras, RNG, validação, mapa, inventário, turnos, relações, combate, perigos, histórico, replay e restauração.
- `src/js/core/arena-access.js`: persistência, exportação, fotos, IndexedDB e buscas externas.
- `src/js/data/arena.js`: personagens, atributos, itens, seis biomas e 30 famílias de ações.
- `src/js/games/survivalarena.js`: preparação, catálogo, elencos, edição, mapa, história, fichas, controles e resultados.
- `src/css/simulator.css`: apresentação e responsividade.

### Preparação e elenco

Há três painéis: **Meu elenco**, **Catálogo com fotos** e **Arena e regras**. É possível sortear, adicionar, remover, trocar, editar, criar personagens, salvar elencos favoritos e importar/exportar arquivos JSON.

Tipos/temas incluem TV Show, Filmes, Anime/mangá, Videogames, Desenhos, Quadrinhos, Cultura brasileira e Folclore. O catálogo editorial possui 131 personagens e 131 imagens locais. Exemplo: TV Show → iCarly → Carly, Freddie, Spencer, Sam e Gibby, correspondente ao elenco de 2007.

O elenco aceita **2 a 48 participantes**. Há atributos, equipamentos iniciais e perfil individual. Retratos podem ser alterados por URL HTTPS ou upload PNG/JPEG/WebP de até 250 KB. Mortos aparecem em tons de cinza; consultar um evento antigo mostra a condição de vida daquele momento.

O usuário rejeitou Rick and Morty como principal fonte para criar o elenco. Um adaptador antigo permanece no código por compatibilidade, mas a interface atual usa **TVmaze para séries** e **Wikidata para filmes**.

### Busca de séries e filmes

Séries: pesquisa por nome/ano e elenco via TVmaze, separando personagem de intérprete. Remakes podem formar temas diferentes.

Filmes: pesquisa pública no Wikidata, sem chave. A implementação confirma filme/subclasse de filme e extrai papéis identificados por P453/P4633 associados ao elenco P161 ou vozes P725. Não transforma o nome do ator em personagem inventado. Usa português quando disponível e inglês como alternativa.

Elencos podem ser parciais; obras sem papéis identificados mostram mensagem. Fotos podem representar o intérprete, com identificação no cartão/ficha. Retratos locais conhecidos são reaproveitados quando o nome corresponde sem ambiguidade. Retratos externos usam Wikimedia Commons; falhas ou ausência de imagem deixam iniciais. O usuário pode substituir a foto.

A busca fica antes dos cartões, tem cancelamento/timeout e os temas importados persistem no catálogo do navegador. Na conferência da entrega, Harry Potter retornou oito filmes, com 46 papéis em A Pedra Filosofal; Shrek retornou seis obras, com 12 papéis no filme de 2001. São resultados daquela consulta, não garantia de cobertura permanente da fonte.

### Atributos e decisões

Seis atributos: **força, agilidade, resistência, percepção, astúcia e sociabilidade**, de 1 a 10. O orçamento padrão é **36 pontos**, média 6, configurável entre 6 e 60. O balanceador respeita limites e soma exata; pode ser desativado para edição livre.

Perfis: Equilibrado, Agressivo, Estrategista, Diplomata e Cauteloso. O perfil individual pode herdar o geral. Estado físico, moral, inventário, posição, aliados, perfil e atributos influenciam escolhas/testes. São decisões ponderadas por regras, não IA generativa nem planejamento estratégico profundo.

Ataques, defesa, contra-ataques, persuasão, intimidação, furtos, armadilhas, veneno, sabotagem e resgate usam condições reais. Testes mostram chance, d100 e resultado; chances de testes ficam entre 8% e 92%.

Inspiração, treinamento, exaustão, desorientação e reações alérgicas podem modificar atributos temporariamente. O atributo efetivo continua de 1 a 10; base e orçamento permanecem preservados. Fichas e histórico mostram motivo, modificador e duração.

### Mapa, turnos e grupos

Seis biomas: floresta, deserto, ártico, cidade, ilhas e vulcão, com desenhos, conexões, fontes e equipamentos distintos. Além do desenho próprio do bioma, há Anel, Grade e Ramificações. Cada mapa tem 8 ou 9 regiões.

Cada participante tem **um turno na abertura, um de dia e um de noite**. Descanso é mais provável à noite; estratégia/perfil pode favorecer exploração ou confronto. Contra-ataques são respostas defensivas, não outra decisão normal de turno.

Interações físicas acontecem somente entre participantes vivos na mesma região. Deslocamentos atravessam uma passagem; não há teletransporte. Expedições priorizam recursos e caminhos menos perigosos.

Alianças reúnem aliados presentes. Grupos podem se deslocar e atacar juntos, gastando os turnos dos integrantes mobilizados. Quem já agiu não recebe ataque extra. Perigos podem separar grupos; ruptura/traição faz o personagem abandonar seus aliados. Traição exige alvo presente e pode ficar mais provável no final da competição.

O cerco mantém a conexão das regiões abertas. Foi corrigido um caso que prendia personagens em setores fechados com vizinhos também fechados: agora podem atravessar setores fechados, uma passagem por turno, por uma rota até a área aberta, pagando os riscos.

### Recursos, eventos e letalidade

Inventários têm propriedade e quantidade reais. Munição e consumíveis são gastos; mortes deixam itens no local e limpam alianças. Armadilhas persistem no setor e podem ter autoria mesmo após a morte do criador, sem permitir uma nova ação do morto.

Fontes naturais têm estoque: água recebe reposição diária e alimento a cada dois dias, até seis coletas. Há abundância configurável, busca, coleta, exploração, cura, partilha e resgate.

Perigos temporários: **nuvem de veneno, incêndio, tempestade de destroços, inundação e apagão/neblina**. Cada setor tem risco de 1 a 3; seleção também considera ocupação. Perigos duram dois períodos e aparecem no mapa/histórico/fichas. Intensidade depende de dano ambiental; frequência depende de imprevistos.

Agilidade, percepção e ferramentas influenciam fuga/cobertura. Fuga por uma passagem gasta o turno. Falhas causam dano/penalidades; fontes atingidas por fogo/veneno perdem parte do estoque. Não aplicar um evento local indiscriminadamente a todo o mapa.

Itens novos: granada (105 de dano sem evasão), carga de demolição (125), frasco incendiário (72 e incêndio), adrenalina e antídoto. Cada ocupante reage individualmente a explosivos, incluindo aliados. Falhas podem matar com saúde completa; cobertura reduz dano. O lançador usa cobertura; fogo amigo pode romper alianças. Objetos têm carga e autoria do abate.

Adrenalina melhora agilidade/percepção por três períodos e recupera energia. Antídoto neutraliza intoxicação/penalidade de veneno, mas não torna o ambiente seguro. Armas próprias continuam configuráveis: até 12, potência 3–18, atributo principal e munição opcional.

### Duração, resultados e salvamento

- Curto, padrão: cerco no dia 3, tempestade final no 16.
- Normal: cerco no dia 5, limite 20.
- Lento: cerco no dia 8, limite 26.
- Curto/normal fecham um setor por dia; lento, a cada dois dias.
- A competição termina com no máximo um sobrevivente. Se todos morrerem no mesmo acontecimento, mostrar **Sem sobreviventes**, sem inventar vencedor.

História, mapa, elenco/fichas, histórico filtrável e resultado são telas próprias. Há avanço por evento/período/dia, reprodução automática e velocidade ajustável. Consultar o passado impede avançar até voltar ao presente. Fichas e outros painéis respeitam pausa/controle da reprodução.

Não chamar `session.complete` como se a simulação fosse um quiz: o resultado permanece consultável e não gera acertos/vitórias fictícios.

Saves atuais são versão 3, com estado, histórico, RNG, itens, perigos, efeitos e turnos. A restauração refaz eventos e compara o resultado; adulterações são rejeitadas. **Mudar regras, dados, sorteios ou até texto registrado de eventos pode invalidar o replay.** Considerar versionamento/migração quando fizer mudanças futuras; não sobrescrever silenciosamente saves incompatíveis.

Saves das versões 1/2 recuperam elenco/configuração, mas a competição precisa reiniciar para usar regras novas. Backups ficam preservados por versão. A exportação escolhe o save antigo atual ou o backup mais recente, mesmo quando também existe um backup v1.

## 8. O que foi verificado na última entrega

As **14 suítes** indicadas em `tests/package.json` passaram na entrega anterior, cobrindo jogos, plataforma, partidas, catálogo, UX, arcade, revisão, cores, percepção, expansão, Órbita e as três suítes da Arena. Após o ajuste final de exportação de backups, a suíte do mundo/Arena foi verificada novamente.

As matrizes da Arena incluem **144 + 48 + 24 = 216 competições completas**, além de verificações dirigidas de orçamento, topologia, retratos, interação, inventário, turnos, perigos, replay e compatibilidade.

Na amostra de 48 competições de 12 participantes, 323/528 eliminações (61,2%) foram por confronto/ferimento/armadilha/veneno/explosão. Na amostra de 24 competições, a média foi 10,04 dias e 163,875 acontecimentos; 141 eliminações foram por participantes e 123 ambientais/sobrevivência. Esses números são medidas das seeds/configurações testadas, não metas garantidas para cada partida.

O pacote foi verificado tanto em `/` quanto em `/games/`: 57 jogos inicializando, oito bancos locais, 250 bandeiras e retratos incorporados, sem requests adicionais na inicialização dos jogos nesse teste.

Conferências no Chromium integrado incluíram busca real de filmes, fotos visíveis, perigos no mapa, reação à nuvem, dano com rolagem, saída/retorno e restauração no mesmo evento. Em 320×740 e 390×844, não houve rolagem horizontal e os controles ficaram dentro da tela. Isso não equivale a testar todos os navegadores/aparelhos físicos.

Resultados em `tests/results/`. Arquivos úteis: `arena.json`, `arena-rpg.json`, `arena-world.json`, `arena-balance.json`, `arena-world-balance.json`, `browser-arena-world.json` e `deployment.json`. Os relatórios são históricos; testar novamente depois de alterar código, dados ou ambiente.

## 9. Levar o projeto para outro computador

### Arquivos do projeto

Transferir a **pasta local de desenvolvimento**, com os arquivos atuais, incluindo os ainda não rastreados pelo Git. No momento desta consolidação há muitas alterações sem commit e arquivos novos. **Não assumir que clonar o GitHub recupera esta mesma versão.**

Origem anterior: `C:\Users\andre\OneDrive\Documentos\Workspace\games-main`. Branch local: `main`. Remote configurado: `https://github.com/andreihen/games.git`. Nenhum commit/push foi feito nesta solicitação de contexto.

Levar `index.html`, `src/` completo, `docs/`, `tools/`, `tests/` com `package.json`/`package-lock.json`, `archive/`, arquivos de configuração da raiz, README, créditos/licenças e este contexto. Manter arquivos ocultos/configuração. Levar `.git/` caso também queira preservar o histórico local e as alterações como estão.

Não é necessário copiar `tests/node_modules/`: instalar novamente no destino. `dist/` pode ser regenerado. `work/` contém material temporário e não é dependência dos testes atuais. Não depender dos caminhos absolutos do computador antigo que aparecem em relatórios de screenshots.

O ZIP **Orbita-Arena-Viva.zip** da entrega anterior é a **distribuição para publicar/jogar**, não um backup completo das fontes para desenvolver. Foi gerado com 57 jogos, 131 retratos, oito bancos e 250 bandeiras; HTML com 12.656.220 bytes. Continuar editando o HTML empacotado em lugar das fontes prejudicaria a manutenção.

### Dados pessoais salvos no navegador

Copiar a pasta do projeto **não transfere automaticamente** favoritos, catálogo importado, progresso, saves e retratos enviados pelo usuário.

Para a Arena, antes de sair do computador antigo, usar **Exportar save**, exportação de elenco/configuração e exportação do save anterior quando quiser preservá-los. No destino, importar os JSONs pela preparação. Eles não incluem automaticamente os bytes de fotos enviadas ao IndexedDB: essas imagens precisam ser levadas separadamente e reenviadas, ou migradas com o perfil do navegador.

Os elencos exportados permitem levar os personagens escolhidos, mas não equivalem a exportar todo o catálogo externo do navegador. Não há botão de sincronização universal do progresso da coleção. Se esse histórico for importante, planejar uma migração explícita do armazenamento/perfil ou implementar exportação/importação específica mediante solicitação.

Os prompts originais citados na conversa, incluindo os documentos de Obsidian “MESTRE EM ENGENHARIA DE SOFTWARE E GAME DESIGN WEB.md” e “CRIAR JOGO - SIMULADOR DE ARENA DE SOBREVIVÊNCIA.md”, não são arquivos automaticamente incluídos no repositório. Este contexto consolida as decisões discutidas; os arquivos originais podem ser levados separadamente se forem necessários. Há um prompt de expansão já salvo em `docs/PROMPT_ARENA_RPG.md`.

## 10. Rodar, testar e publicar no computador novo

Executar na raiz da pasta transferida. Usar um navegador moderno e Python; no Windows, `py` pode substituir `python`, e em outros sistemas pode ser `python3`.

```sh
python -m http.server 8766 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8766/`. A porta não é especial; se estiver ocupada, usar outra, lembrando que isso muda a origem do armazenamento. Os endereços antigos em 8766, 8771 e 8772 eram prévias locais, não serviços publicados que continuarão acessíveis no novo computador.

Para desenvolvimento/testes, instalar **Node.js 24 ou superior** e usar as dependências locais do projeto:

```sh
npm ci --prefix tests
npm --prefix tests test
```

Não copiar configurações `NODE_PATH` apontando para `C:/Users/andre/Documents/Codex/.../test-tools/node_modules`: esse foi um recurso do ambiente anterior, não uma dependência portátil do projeto. A instalação acima fornece `jsdom` localmente.

Para gerar e verificar a distribuição:

```sh
python tools/build_site.py --zip Orbita-GitHub-Pages.zip
npm --prefix tests run test:deploy
```

O builder gera `dist/` e o ZIP. A distribuição incorpora CSS, JavaScript, bancos, bandeiras e os 131 retratos locais; pesquisas e retratos externos continuam dependendo da internet. Usa `BundledPortraits` para as fotos incorporadas.

Ao publicar por upload, extrair o ZIP e colocar seu **conteúdo** na raiz da fonte escolhida para o GitHub Pages, incluindo `.nojekyll`, créditos e licenças. Não criar uma pasta `dist` adicional quando a fonte de publicação é a raiz. Para publicar as fontes diretamente, preservar toda a hierarquia de `src/`, imagens e arquivos necessários.

Problemas anteriores no GitHub Pages foram de carregamento de recursos, imagens e aparência incompleta. Não pressupor que o site público está na versão mais recente: confirmar qual conjunto de arquivos foi realmente publicado. O pacote foi criado para facilitar essa publicação.

## 11. Documentos para consultar

Os caminhos abaixo são relativos à raiz do projeto e devem continuar funcionando na pasta transferida:

- `docs/ARENA_VIVA.md`: regras mais recentes da Arena e filmes.
- `docs/ARENA_RPG.md`: estrutura RPG, catálogo com retratos, perfis e fontes; já referencia a atualização seguinte.
- `docs/PROMPT_ARENA_RPG.md`: prompt estruturado da expansão anterior.
- `docs/ARENA_IMPROVAVEL.md`: primeira implementação, documento histórico.
- `docs/AUDITORIA_ORBITA.md`: auditoria dos jogos, identidade, objetivos, UX e prioridades; notas de diversão são hipóteses de design.
- `docs/CATALOGO_E_IDEIAS.md`: catálogo e sugestões; algumas partes são históricas, conferir também `games.config.js` e a tabela deste contexto.
- `docs/UX_UI.md`, `docs/REVISAO_JOGABILIDADE.md`: decisões de interface, memória, Simon e Checklist.
- `docs/ARCADE_E_GERACAO.md`: biblioteca e análise de geradores.
- `docs/JOGOS_DE_CORES.md`, `docs/JOGOS_DE_PERCEPCAO.md`: mecânicas de cores e percepção.
- `docs/EXPANSAO_CONHECIMENTO.md`: Pokémon, elementos, equações, soma e digitação.
- `docs/PUBLICAR_GITHUB.md`: diagnóstico e publicação.
- `THIRD_PARTY.md`, `src/assets/characters/sources.json` e `src/data-licenses/`: atribuição/proveniência. Não remover ao distribuir.

## 12. Como iniciar a próxima sessão de desenvolvimento

1. Ler este contexto, `games.config.js`, `docs/ARENA_VIVA.md` e os arquivos da área que será modificada.
2. Inspecionar o estado do Git e preservar as alterações locais. Não descartar arquivos ou substituí-los por uma cópia remota mais antiga.
3. Confirmar 57 jogos, Arena/motor 3, dados `arena-3`, fotos e estrutura das fontes. Instalar dependências de testes no próprio projeto, se necessário.
4. Rodar a aplicação local e entender os fluxos existentes antes de alterar. Pedir apenas informações realmente faltantes para o próximo pedido do usuário.
5. Dar continuidade incremental, mantendo identidade, clareza, visual, rejogabilidade, responsividade, navegação e dados salvos.
6. Para mudanças em geradores/simulação, verificar consistência, variedade, condições reais, turnos, inventário, morte, replay e duração. Distinguir mudanças de código de hipóteses sobre diversão que ainda precisam de feedback do usuário.
7. Rodar verificações apropriadas à mudança. Ao mudar assets, atualizar a versão em `registry.js` e imports do `index.html`. Ao mudar regras que afetem replay/saves, tratar compatibilidade explicitamente.
8. Regenerar e verificar o pacote quando houver uma nova entrega para publicação. Explicar o que mudou, o que foi testado e limites relevantes, sem afirmar publicação/commit que não ocorreu.

**Situação ao final:** as melhorias anteriores foram implementadas e verificadas. A solicitação atual é preparar a continuidade no outro computador. Não existe, neste documento, autorização para criar automaticamente novos jogos, reescrever a aplicação ou publicar mudanças adicionais.
