# Arena Improvável

Este documento registra a primeira entrega (motor 1), mantida como histórico. A versão atual está em [Evolução da Arena](ARENA_EVOLUCAO.md).

Primeira versão integrada à Órbita em 12 de outubro de 2026. Categoria: **Simuladores**. O jogador organiza o elenco e acompanha uma competição fictícia até restar um participante. O resultado não mede conhecimento ou habilidade e não representa uma previsão sobre personagens ou pessoas reais.

## Como jogar

1. Abra Simuladores → Arena Improvável → Montar arena.
2. Escolha arena, quantidade e tema. Sorteie o elenco; edite, remova ou substitua participantes. A preparação permite entre 2 e 32 personagens.
3. Se quiser, ajuste franquias excluídas, duplicatas, cotas de gênero informado, atributos, equipamentos, alianças, humor e ritmo do cerco.
4. Inicie a competição. Avance um evento, período ou dia, ou use a reprodução automática com três velocidades.
5. Consulte Mapa, Elenco e Histórico. As fichas mostram atributos, saúde, necessidades, equipamento, munição, aliados e acontecimentos. Selecionar um registro histórico recupera o mundo daquele momento; “Voltar ao presente” retoma a visualização atual.
6. Ao terminar, consulte vencedor, classificação e estatísticas. Repita exatamente a configuração ou use o mesmo elenco com outra seed.

## Conteúdo inicial

64 personagens fictícios editoriais: cultura brasileira, anime/mangá, videogames, filmes/séries e quadrinhos/desenhos. Exemplos: Mônica, João Grilo, Cuca, Nazaré Tedesco, Goku, Nami, Link, Samus, Shrek e Wandinha. Há criação manual e busca externa opcional. Atributos de 1 a 10 são sorteados e editáveis; não pretendem reproduzir poderes canônicos. Gênero não informado permanece desconhecido; cotas impossíveis geram uma explicação, sem preencher silenciosamente com outro grupo. A narração usa nomes e “participante”, sem inferir pronomes pela aparência.

| Arena | Diferença mecânica |
| --- | --- |
| Floresta dos Ecos | Água mais frequente, deslocamento barato e menor peso de perigos. |
| Deserto de Vidro | Água escassa, sede cresce mais rápido, deslocamento e perigos mais custosos. |
| Ártico Silencioso | Comida escassa; exposição ao frio causa dano sem equipamento de exploração. |
| Cidade sem Nome | Comida mais frequente, destroços como perigo e deslocamento barato. |
| Ilhas da Maré | Travessias gastam mais energia; marés perigosas e oferta intermediária de recursos. |
| Caldeira Rubra | Perigos ambientais mais frequentes e danosos; deslocamento custoso. |

Cada mapa tem sete regiões: centro, anel externo e conexões entre vizinhos. O desenho representa esse grafo real. Regiões fechadas ficam identificadas, e tocar nelas abre ocupantes, recursos e conexões. A arte dos mapas, capas e avatares é própria.

## Regras reais da simulação

Cada participante vivo recebe um turno por período. O motor escolhe entre eventos cujas condições são válidas, com pesos declarados no banco. A abertura privilegia buscas; a noite privilegia descanso; fome, sede e ferimentos elevam a prioridade de consumir recursos ou tratar lesões quando há itens disponíveis. Hostilidade modifica os pesos de confrontos; humor e alianças podem ser desativados.

São 14 famílias iniciais: busca, movimento, descanso, bebida, alimentação, tratamento, aliança, compartilhamento, rompimento, combate armado, disputa sem armas, traição, perigo ambiental e imprevisto humorístico. Fuga, desarme, roubo, ferimento e eliminação são consequências condicionais de confrontos. Eventos registram alterações de estado antes e depois, além do texto.

- Só participantes vivos agem. Eliminações acontecem uma vez; seus itens caem no local e alianças são desfeitas nos dois lados.
- Encontros exigem a mesma região. Movimentos seguem as conexões do mapa e não entram em regiões fechadas.
- Todo item possui ID e proprietário único. Transferir e consumir atualiza inventários. Arco sem flechas não dispara; cada disparo consome uma flecha, mesmo numa fuga. Outra arma utilizável pode ser equipada.
- Combates consideram atributos, energia, equipamento, aliados presentes e sorte. Saúde não aumenta sem tratamento consumido. Descanso recupera energia.
- Ferimentos podem sangrar por quatro turnos. Um abate decorrente de ferimento anterior pode ser creditado ao agressor depois da morte dele; isso atualiza a estatística, sem permitir uma nova ação do eliminado.
- Fome, sede, frio, regiões fechadas e cerco final causam dano calculado. O motor para imediatamente com um sobrevivente.

O cerco é explícito: começa no dia 3, 5 ou 8, conforme a regra escolhida; fecha uma região externa a cada dois dias. Todas fechadas, o centro também sofre pressão crescente. A cada três dias chega um pacote de suprimentos ao centro. No dia 30, uma tempestade final causa 100 de dano por turno até haver um vencedor. Não se escolhe secretamente um vencedor nem se altera a sorte para favorecer alguém.

## Persistência e compartilhamento

O avanço salva automaticamente no navegador; “Guardar agora” também grava. Ao abrir o simulador, “Reabrir última arena” restaura a competição. A saída encerra a reprodução e conserva o save. Elencos favoritos, configurações, saves e resultados podem ser exportados em JSON. Elencos, configurações e saves da versão 1 podem ser importados; o limite é 8 MB. Resultado é um relatório exportável, não um save importável.

Seed, elenco completo, atributos, regras e versão dos dados determinam a história. **Só compartilhar a seed ou o link comum da Órbita não transporta um elenco editado**: use a configuração JSON. O save registra os sorteios consumidos e o histórico. A importação refaz os eventos e compara o estado para rejeitar saves inconsistentes ou alterados. Objetos retornados pelo motor são cópias, preservando os registros internos.

Armazenamento: `orbita:arena:save` e `orbita:arena:rosters` em localStorage. Retratos enviados pelo usuário ficam em IndexedDB (`orbita-arena-images`), com IDs referenciados nos participantes. Aceita PNG/JPEG/WebP de até 250 KB; não incorpora a imagem repetidamente no histórico. **As imagens locais não viajam no JSON**: em outro navegador aparecem os avatares até reenviar os retratos. Falta de espaço ou indisponibilidade de armazenamento produz aviso ou fallback, sem impedir a consulta à arena em memória.

## Fontes e limites desta versão

- [Rick and Morty API](https://rickandmortyapi.com/documentation): adaptador implementado para busca de nomes e gênero informado, somente após solicitação do usuário. Até 12 resultados por busca, sem retratos oficiais, sem chave e sem credenciais enviadas. A falha mantém o catálogo local disponível; sair cancela a busca.
- [AniList](https://docs.anilist.co/guide/introduction), [autenticação](https://docs.anilist.co/guide/auth/) e [termos](https://docs.anilist.co/guide/terms-of-use): fonte avaliada para uma futura expansão de anime/mangá. Não integrada nesta versão.
- [TMDB](https://developer.themoviedb.org/docs/getting-started): fonte avaliada; depende de conta/chave e não equivale a um catálogo uniforme de personagens. Não integrada ao site estático nesta versão.

O catálogo local contém nomes e universos editoriais; não redistribui retratos, diálogos ou roteiros oficiais. API e direitos de imagens são questões distintas. Não há scraping de wikis, telemetria, servidor de geração narrativa ou dependência de IA durante as partidas.

Esta versão tem alianças simétricas simples, mapa fixo por bioma e efeitos ambientais básicos. Armadilhas persistentes, relações de confiança graduais, habilidades individuais, distritos, patrocínios, variações topológicas e mais acontecimentos ficam para refinamentos. Atributos e pesos atuais são um ponto inicial de balanceamento, não uma validação de diversão com jogadores.

## Implementação e verificação

- `src/js/core/arena.js`: validação, estados, eventos transacionais, invariantes, replay e resultados.
- `src/js/data/arena.js`: personagens, arenas, itens, pesos e textos originais; versão `arena-1`.
- `src/js/core/arena-access.js`: persistência, JSON, retratos locais e adaptador externo.
- `src/js/games/survivalarena.js` e `src/css/simulator.css`: preparação, mapa, fichas, histórico, resultado e reprodução com os recursos da sessão.
- Catálogo, carregamento preguiçoso e distribuição estática seguem a arquitetura existente. Simuladores ficam fora da Jornada/desafio diário, sem dificuldade ou pontuação de acertos.

`tests/arena.test.cjs` verifica 144 competições completas, seis biomas, 2–32 participantes, três ritmos e **45.072 eventos** na configuração inicial de testes. Valida ownership, vida/morte, adjacência, alianças, saúde, encerramento, reprodução exata, save adulterado, munição, histórico passado, falhas externas, retratos ausentes, cotas, edição, pausa e integração. As demais suítes verificam regressões da coleção; a distribuição é conferida na raiz e em `/games/`.
