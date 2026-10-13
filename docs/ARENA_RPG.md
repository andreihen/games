# Arena Improvável — expansão RPG

Implementação de 12 de outubro de 2026. Motor **3**, dados **arena-3**. A extensão desta entrega está descrita em [Arena viva e filmes](ARENA_VIVA.md). O [prompt de implementação](PROMPT_ARENA_RPG.md) registra os requisitos desta entrega.

## Preparação

O painel possui **Meu elenco**, **Catálogo com fotos** e **Arena e regras**. Em Catálogo, escolha Tipo → Tema/obra → Personagem. Exemplo: TV Show → iCarly → Carly Shay, Freddie Benson, Spencer Shay, Sam Puckett e Gibby Gibson. Esse tema local corresponde ao elenco principal da versão de 2007.

Você pode adicionar pessoas individualmente, adicionar um tema ao elenco, substituir todo o elenco pelo tema, trocar/remover/editar personagens e criar participantes. Elencos favoritos e arquivos JSON continuam disponíveis, incluindo orçamento, perfis e armas próprias necessários aos inventários. A busca externa consulta obras por nome e permite escolher o ano antes de carregar personagens; versões novas de uma obra recebem temas distintos quando necessário.

São **131 personagens com 131 imagens locais**, incluindo os 64 anteriores e elencos de iCarly, Friends, The Office, Stranger Things e Breaking Bad. Fotos aparecem no catálogo, elenco, acontecimentos, fichas, histórico, classificação e miniaturas no mapa. Participantes eliminados ficam em tons de cinza. Consultar um registro antigo recupera a condição de vida daquele momento, portanto um personagem ainda vivo nesse registro aparece em cores.

Quando a fonte não fornece a imagem do personagem, o retrato do intérprete é identificado. Algumas figuras de folclore usam ilustrações ou representações históricas. A ficha contém a fonte. É possível substituir o retrato por URL HTTPS ou upload PNG/JPEG/WebP de até 250 KB e voltar à imagem original do catálogo. Uploads permanecem no IndexedDB do navegador; não são copiados a cada evento nem viajam no JSON. URLs externas dependem de disponibilidade; falhas usam o avatar de iniciais.

## Atributos e decisões

Todos os seis atributos ficam entre **1 e 10**. O orçamento comum padrão é **36 pontos**, média 6; pode variar de 6 a 60. A redistribuição preserva as prioridades dos valores editados, limita cada atributo e fecha a soma exatamente. Balanceamento pode ser desativado para edição livre. O sorteio considera o perfil escolhido quando feito pela interface, e as fichas mostram os pontos totais.

| Atributo | Consequências usadas pelo motor |
| --- | --- |
| Força | Ataques físicos, dano e intimidação. |
| Agilidade | Ataque, defesa, deslocamento e furto. |
| Resistência | Defesa, redução de dano, frio, veneno e recuperação de energia. |
| Percepção | Defesa, perigos, busca, detectar armadilhas, armas de mira e críticos. |
| Astúcia | Busca, emboscadas, armadilhas, furtos, sabotagem, veneno e negociação. |
| Sociabilidade | Alianças, persuasão, intimidação, partilha e resgate. |

Perfis gerais e individuais: **Equilibrado**, **Agressivo**, **Estrategista**, **Diplomata** e **Cauteloso**. Eles alteram pesos de decisões; atributos alteram pesos e testes. Energia baixa aumenta descanso, necessidades elevadas priorizam água/comida disponíveis e moral baixa favorece fuga. NPCs procuram regiões adjacentes considerando pessoas e recursos, enquanto o cauteloso tende a evitar aglomerações.

Confrontos comparam atributo principal da arma, força, agilidade, potência, energia, moral e aliados presentes com resistência, agilidade, percepção, proteção e energia do alvo. A chance fica entre 8% e 92%; um d100 decide o teste. O acontecimento permite inspecionar chance, rolagem e resultado. Defesa pode gerar contra-ataque; críticos dependem de percepção. Arcos, bestas e estilingues consomem munição, inclusive em tentativas frustradas.

## Eventos e mortes

Há **30 famílias de ações**, incluindo expedição, ataque em área, adrenalina e antídoto. As 26 anteriores: as 14 originais e emboscada, ocultação, armadilha, furto, persuasão, intimidação, envenenamento, sabotagem, coleta natural, resgate, duelo e incidente inesperado. Incidentes têm consequências variadas, como equipamento enviado por drone, material de armadilhas, toxina, moral e perda de energia.

- Ocultação dura poucos turnos e favorece emboscadas.
- Armadilhas consomem material, ficam numa região e disparam quando outro participante entra. Percepção/agilidade competem com a capacidade de quem as armou. Aliados identificados não as acionam. Armadilhas antigas podem continuar existindo depois da morte do criador; isso não permite ações novas ao eliminado.
- Persuasão contrapõe sociabilidade/astúcia a percepção/astúcia do alvo. Intimidação afeta moral. Furtos e sabotagem podem falhar.
- Veneno exige toxina e suprimentos de um alvo presente, causa dano ao longo de três turnos e pode ser tratado. Resgate exige aliado ferido e curativo realmente consumido.
- Fome/sede crescem mais lentamente, causam dano somente perto do extremo e podem ser reduzidas por fontes naturais. Medicação, recursos e equipamentos continuam tendo ownership e quantidade real.

A competição termina imediatamente com no máximo um sobrevivente; um desastre simultâneo pode terminar sem vencedor. O cerco continua explícito: começa no dia 3, 5 ou 8, fecha um setor externo diariamente nos ritmos curto/normal e a cada dois dias no lento e evita remover setores que isolariam as rotas abertas. Suprimentos chegam ao centro a cada dois dias. A pressão final cresce depois de fechar os setores externos; a tempestade final chega no dia 16, 20 ou 26, conforme o ritmo. O padrão é curto. Ninguém é escolhido previamente como vencedor.

## Mapas e arsenal

Cada bioma tem grafo e disposição próprios, com 8 ou 9 regiões. Floresta usa trilhas e ramificações; deserto tem travessias entre oásis e dunas; ártico tem corredores entre abrigos; cidade tem grade e atalho; ilhas têm passagens entre blocos de terra; vulcão tem gargalos. Conexões e ocupantes mostrados correspondem ao estado. Água com estoque e reposição lenta aparece como **≈**, alimento como **♧**; a ficha da região mostra fontes, itens, conexões e armadilhas.

Também é possível escolher **Anel**, **Grade** ou **Ramificações** para qualquer bioma. As formas são conectadas e respeitam as mesmas regras de movimento e fechamento. Estoques de loot são distintos por arena: floresta favorece arco/lança/corda, deserto inclui estilingue, ártico inclui besta/machado, cidade inclui martelo/toxina/armadilhas, ilhas favorecem arpão e vulcão favorece ferramentas pesadas.

O painel configura abundância, dano ambiental, confrontos, imprevistos, equipamento inicial e armas sorteadas. Inventários individuais são definidos nas fichas. Até 12 armas próprias podem ser acrescentadas, com potência de 3 a 18, atributo principal e munição opcional (flechas ou pedras). A quantidade de participantes vai de **2 a 48**.

## Saves e pacote estático

Novas competições usam o motor 3 e arquivos versão 3. O estado registra posição, inventário, vida, energia, necessidades, moral, ocultação, veneno, alianças, armadilhas, sorteios e histórico. A importação refaz a competição e compara registros e estado. Elencos/configurações das versões 1 e 2 podem ser reaproveitados; saves de competições das versões 1 e 2 recuperam o elenco pela opção indicada na preparação, iniciando uma nova competição. O original fica preservado em `orbita:arena:legacy-save` quando um novo save substitui o anterior, e pode ser exportado; backups por versão usam `orbita:arena:legacy-save-v1` e `orbita:arena:legacy-save-v2`.

As imagens locais entram como `BundledPortraits` no HTML de distribuição, junto com CSS, scripts e dados. O pacote atual tem aproximadamente 12,6 MB de HTML, abaixo do limite de 25 MB adotado pelo empacotador. Os retratos não precisam ser enviados separadamente ao usar esse pacote. Imagens de novos elencos buscados pela API e URLs digitadas continuam sendo externas; os 131 retratos locais são independentes da rede.

## Fontes

- [Wikidata API](https://www.wikidata.org/wiki/Help:Data_access): pesquisa de filmes, subclasses de filme e papéis P453/P4633 associados a atores P161/vozes P725. Dados estruturados CC0; imagens do Wikimedia Commons têm licença própria. Só papéis identificados são importados, e a cobertura pode ser parcial.
- [TVmaze API](https://www.tvmaze.com/api): busca de obras, ano e elenco com personagem/intérprete separados. Snapshot editorial de cinco séries. Metadados derivados mantêm a [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/) e atribuição à TVmaze. Gênero dos novos personagens permanece desconhecido quando o serviço só informa gênero do intérprete.
- [MediaWiki PageImages](https://www.mediawiki.org/wiki/Extension:PageImages): consulta às páginas de personagens na Wikipédia; imagens relevantes foram selecionadas, incluindo ilustrações e representações históricas. Logos que não retratavam personagens foram substituídos.
- [AniList API](https://docs.anilist.co/guide/introduction): metadados e retrato de Totoro. Não há busca geral de anime integrada nesta entrega.

`src/assets/characters/sources.json` registra URL, origem, tipo de imagem, página do arquivo quando aplicável, data de consulta, tamanho e SHA-256. Os bytes das imagens não foram alterados. Obras, fotografias e ilustrações conservam os direitos e condições indicados por suas fontes; a licença de um banco não licencia automaticamente qualquer imagem de outra fonte. Esta expansão é independente das franquias representadas.

## Verificação e limites

`tests/arena.test.cjs`: 144 competições completas, seis biomas, 2–48 participantes, três ritmos e dezenas de milhares de acontecimentos na matriz atual. Confere consistência, ownership, vida/morte, alianças, adjacência, saúde, replay, saves, pausa, elencos e integração.

`tests/arena-rpg.test.cjs`: orçamentos de 6–60, idempotência, topologias conectadas, fechamento sem isolamento, retratos/bytes/proveniência, chances por atributos, armadilhas, armas próprias, perfis e imprevistos, configuração, foto editada, recuperação de elenco antigo e grayscale. Resultados da amostra atual estão em `tests/results/arena-balance.json` e `tests/results/arena-world-balance.json`. As proporções dependem das seeds e configurações, não são garantias por partida.

O jogo continua usando eventos condicionais simples, sem IA generativa ou planejamento estratégico profundo. Relações são alianças simétricas e moral, sem uma matriz completa de confiança. Perigos temporários regionais incluem nuvens de veneno e eventos próprios do bioma; as formas de mapa são presets conectados, sem editor de geometria livre. Personagens e armas são adaptados às regras, sem poderes canônicos. O próximo balanceamento deve considerar feedback de jogadores, especialmente para perfis diplomáticos, recursos escassos e armas próprias.
