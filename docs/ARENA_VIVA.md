# Arena viva e filmes

Atualização de 12/10/2026. Motor 3; dados `arena-3`.

## Catálogo de cinema

Em **Catálogo com fotos → Buscar filmes e séries na internet**, selecione **Filmes**, pesquise o título e escolha a obra/ano. O tipo Filmes também seleciona essa fonte automaticamente. A busca aparece antes dos cartões para evitar percorrer todo o catálogo.

A integração pública usa [Wikidata](https://www.wikidata.org/wiki/Help:Data_access), sem conta ou chave. Confirma que a obra é filme ou uma subclasse de filme. Atores e vozes só viram participantes quando há um papel identificado em P453 ou P4633. O nome do ator não é convertido em personagem. Os papéis recebem nomes em português quando disponíveis e, caso contrário, em inglês. Elencos podem ser parciais; obras sem papéis identificados exibem uma mensagem e permitem edição manual.

Retratos locais conhecidos são reaproveitados quando o nome corresponde sem ambiguidade. Outros retratos vêm do Wikimedia Commons, preferindo a foto do intérprete e identificando isso no cartão/ficha. Fotos podem faltar ou ficar indisponíveis; o avatar de iniciais permanece como alternativa e a edição por URL/upload continua disponível. Obras importadas e seus personagens ficam no catálogo local do navegador. A busca de séries continua usando TVmaze.

## Um turno por período

Cada participante vivo tem uma ação na abertura, uma por dia e uma por noite. O descanso noturno é mais provável; estrategistas podem preferir explorar à noite e agressivos mantêm maior tendência a confrontos. Contra-ataques são respostas defensivas ao ataque recebido, não uma segunda decisão de turno.

Movimento e expedição usam uma passagem do mapa. Expedições favorecem recursos, fontes com estoque e setores menos perigosos. Fontes naturais têm coletas limitadas: a água recebe uma reposição diária e alimento a cada dois dias, até seis coletas. Não há teletransporte nem interação física entre setores.

## Alianças

Alianças/persuasão reúnem os aliados presentes em um grupo. Membros em outra região não são automaticamente apresentados aos novos aliados. Um deslocamento em grupo exige que os aliados locais ainda tenham turno; cada integrante o consome. Em combate, integrantes presentes que ainda têm turno podem apoiar o ataque, gastando arma, munição, energia e seu próprio turno. Um aliado que já agiu não ganha outro ataque.

Perigos, armadilhas e eliminações podem separar um grupo. Ruptura ou traição fazem o personagem abandonar seus aliados. A traição precisa de alvo no mesmo local e fica mais provável entre estrategistas e no final da competição. Explosivos atingem aliados presentes; sobreviventes atingidos rompem com quem lançou o objeto.

## Perigos por região

Cada setor tem risco de 1 a 3, definido por bioma e local. A seleção de perigos favorece setores de maior risco, mas também considera ocupantes. Nuvens de veneno, incêndios, tempestades, inundações e apagão/neblina têm duração de dois períodos e aparecem no mapa, na lista de setores, nas fichas e no histórico. Intensidade depende da configuração de dano ambiental; frequência depende de imprevistos.

Durante o turno, agilidade e percepção (com auxílio de ferramentas) determinam a reação. Uma fuga bem-sucedida atravessa uma passagem até um setor seguro e consome a ação. Sem saída segura, o NPC tenta cobertura. Falhas causam dano e penalidades temporárias; nuvens reduzem resistência, outros perigos podem reduzir percepção. Fontes atingidas por fogo/veneno perdem parte do estoque. Perigos não afetam todos os personagens do mapa indiscriminadamente.

O cerco preserva a conexão entre regiões abertas. Personagens em setores fechados podem atravessar outros setores fechados por uma rota mais curta até uma área aberta, pagando os riscos por cada turno. Isso corrige o aprisionamento em folhas do grafo após fechamentos sucessivos.

## Atributos e objetos

Os seis atributos base continuam entre 1 e 10 e mantêm o orçamento escolhido. Inspiração, treinamento, exaustão, desorientação e reações alérgicas podem aplicar modificadores temporários. O cálculo de ações usa o atributo efetivo, limitado a 1–10. Fichas mostram base, valor efetivo, motivo e períodos restantes; o histórico mostra ganhos, perdas e término de efeitos.

Adrenalina: agilidade +3, percepção +2 por três períodos e recuperação de energia. Antídoto: neutraliza intoxicação e penalidade de veneno, sem tornar o setor seguro. Ambos são consumíveis reais.

Granada (105), carga de demolição (125) e frasco incendiário (72) causam dano em área. Cada ocupante, incluindo aliados, tem sua própria rolagem de percepção/agilidade. A falha pode matar imediatamente um personagem com saúde completa; a cobertura reduz o dano. O lançador prepara o ataque a partir de cobertura. O frasco deixa um incêndio temporário no setor. Cada objeto tem uma carga e é gasto; o abate tem autoria registrada.

## Duração, retomada e testes

Ataques armados têm dano base maior e os grupos podem coordenar confrontos. O ritmo padrão passa a curto: cerco desde o dia 3 e tempestade final no 16. Normal: dia 5/limite 20; lento: dia 8/limite 26. Curto/normal fecham um setor por dia; lento, a cada dois dias. O encerramento ocorre ao restar no máximo uma pessoa. Caso todos morram no mesmo acontecimento, o resultado exibe **Sem sobreviventes**, sem inventar um vencedor.

Saves novos registram grupos, turnos usados, efeitos, estoques e perigos no histórico reproduzível por seed. Competições antigas têm suas regras preservadas no arquivo original, mas devem começar novamente para usar este motor: **Recuperar elenco anterior** reaproveita personagens, fotos e configurações. Antes de substituir o save, a aplicação mantém backup por versão (`legacy-save-v1`/`legacy-save-v2`) e mantém a opção de exportação do save anterior.

`tests/arena-world.test.cjs` verifica movimentos/ataques coletivos, consumo de turnos, traição, dano em área, fuga, duração de efeitos, replay, importação de filmes, falhas de rede e preservação de saves. A matriz de 24 competições verifica interações locais e registra duração, confrontos, perigos e descanso em `tests/results/arena-world-balance.json`. As matrizes anteriores continuam cobrindo seis biomas, 2–48 participantes e três ritmos. Medidas de uma amostra não são garantias de proporção ou duração por partida.

Limites: estratégias são escolhas ponderadas por estado/perfil, não planejamento complexo. Não há confiança individual, poderes canônicos ou editor livre de geometria. Fotografias externas dependem da fonte; dados estruturados do Wikidata são CC0 e a licença de cada imagem permanece a indicada na página do arquivo.
