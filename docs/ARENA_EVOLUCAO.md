# Arena Improvável: sobrevivência e biblioteca pessoal

As regras `arena-4` começam com inventários vazios, inclusive em elencos antigos que guardam equipamentos no campo `starting`. Esse campo é preservado para compatibilidade. As versões 1, 2 e 3 de partidas não são reproduzidas sob as novas regras: a interface recupera o elenco para uma nova competição e mantém o save original em `orbita:arena:legacy-save-vN`, com exportação independente.

## O que acontece na arena

- O centro guarda no máximo quatro objetos. Depósitos, fontes, alimento, materiais e abrigos se distribuem pelos biomas. Reposições e drones deixam itens em regiões; é preciso ir buscá-los.
- Cada objeto registra região e método de origem. Fabricação registra os materiais consumidos. Partilha, troca, furto e saque transferem objetos existentes, preservando sua origem e suas quantidades.
- Exploração escolhe um objetivo alcançável por várias conexões, segue uma conexão por ação e reconsidera recursos, perigos, aglomeração, companheiros e regiões visitadas. Rotas de fuga do cerco permanecem conectadas.
- O perfil aleatório sorteia uma personalidade por participante no início. Coragem, lealdade, oportunismo e vontade de explorar variam individualmente. Perfis manuais são respeitados. Distritos são independentes de franquias; distribuição automática usa os 12 distritos e respeita escolhas manuais.
- Alianças persistem entre regiões, podem receber membros e unir grupos. A confiança de recém-chegados começa baixa. Aliados procuram recursos separadamente; ajuda física, resgate, partilha, distração na fuga e apoio em ataques/defesas exigem proximidade, condições físicas e disponibilidade. A escassez e o cerco podem provocar rupturas e traições.
- Terremotos, deslizamentos, inundações, relâmpagos, incêndios, hordas e outros perigos duram de um a três períodos. Danificam estoques e abrigos; caminhos atingidos ficam mais custosos. Incêndios podem se espalhar para uma região ligada. Cobertura e fuga diminuem exposição. Fontes atingidas param de se renovar durante o perigo.
- Pesca exige margem com alimento e instrumento; coleta depende das fontes; aproveitamento de materiais esgota o estoque; fabricação consome material encontrado. Abrigos permitem descanso. Esconderijos recuperam objetos já presentes, sem inventar equipamentos.
- A narrativa funciona localmente em português, conserva a memória de variantes no save e na reconstrução do passado. Valores, consumo de ações e rolagens ficam em detalhes opcionais.

## Busca externa

Séries usam TVmaze. Filmes e videogames usam Wikidata, sem credenciais. Para jogos, a busca confirma `P31/P279 → Q7889` (videogame), e o elenco usa somente `P674` (personagens da obra). Não usa `P725` (dubladores) nem `P178` (desenvolvedores). Ano e título distinguem edições. Imagens só vêm do próprio personagem, pela propriedade `P18`, com referência a Wikimedia Commons. Sem imagem, o cartão usa iniciais. As listas são parciais; um jogo sem vínculos de personagens oferece criação manual e catálogo salvo.

Fonte real verificada: [The Last of Us Part II](https://www.wikidata.org/wiki/Q27950674) contém personagens vinculados, incluindo Ellie e Abby. Sem necessidade de atribuir pessoas da equipe de produção como personagens. Referências do contrato: [P674](https://www.wikidata.org/wiki/Property:P674) e [videogame](https://www.wikidata.org/wiki/Q7889). Metadados Wikidata são CC0; imagens mantêm suas licenças individuais. Não há garantia de disponibilidade de todas as franquias.

## Biblioteca e backups

O armazenamento é **neste dispositivo**, em `localStorage` (`orbita:arena:library` e `orbita:arena:rosters`) e IndexedDB (`orbita-arena-images`, store `portraits`). Nenhum dado é enviado a uma nuvem. Pastas podem ser criadas, renomeadas e removidas; remover uma pasta devolve seus personagens à principal. Excluir um personagem oferece desfazer. Guardar no catálogo não exige incluir na arena. Incluir um personagem salvo cria uma cópia; editar essa cópia não altera o original.

Nomes repetidos de pastas e elencos não substituem dados silenciosamente. Importar bibliotecas mescla pastas e personagens; elencos com nomes em conflito recebem sufixo. O formato `orbita-arena-library`, versão 1, inclui personagens, pastas, elencos e os retratos locais como data URLs validadas. Elencos, configurações e partidas exportadas também incorporam seus retratos. Backups antigos sem bytes de retrato só conseguem recuperar imagens se o navegador ainda tiver o arquivo original; reenvie a imagem antes de transportar o arquivo. Limites de armazenamento geram mensagem e orientam exportação.

## O necessário para habilitar nuvem de verdade

Não existe backend, projeto remoto ou autenticação configurada neste repositório. A sincronização **não está implementada**. A interface mostra esse estado sem usar JSON como substituto para nuvem.

Para uma implantação futura, é preciso fornecer e implementar:

1. Um serviço remoto com login por usuário e URL de ambiente. Criar tabelas `folders`, `characters`, `rosters` e `changes`, cada uma com `id`, `user_id`, `revision`, `updated_at` e `deleted_at`; personagens referenciam pasta, e elencos armazenam cópias de seus integrantes.
2. Autorizar cada leitura e gravação exclusivamente quando a identidade autenticada corresponder a `user_id`, com políticas no servidor/banco. Testar isolamento com duas contas. Chaves administrativas ficam em variáveis privadas do servidor; o site público recebe apenas URL e identificadores públicos apropriados ao serviço.
3. Armazenar retratos em bucket privado sob `user_id/portrait_id`, verificar tipo e tamanho no servidor e oferecer URLs temporárias autenticadas. O hash deve ser calculado e validado, sem confiar apenas no nome do arquivo enviado.
4. Criar API autenticada para pull incremental e push com comparação da revisão esperada. Upload com revisão desatualizada retorna conflito e mantém ambas as versões; exclusões usam tombstones. Grupos de mudanças devem ser transacionais para não perder vínculo de pasta ou elenco.
5. Acrescentar adaptador opcional ao `ArenaAccess`, fila local durável de alterações, cursor de sincronização por conta, retentativas e modo sem conexão. Nenhum login será necessário para continuar usando o armazenamento local. Antes de mudar de conta, separar o acervo local por identidade e pedir uma escolha explícita sobre importar o acervo do dispositivo.
6. Exibir estados reais: “salvo neste dispositivo”, “pendente de conexão”, “sincronizando”, “sincronizado” ou “conflito: revisar versões”. Somente confirmar sincronização depois da resposta remota. Testar expiração de sessão, duas abas/dispositivos, perda de rede, exclusão concorrente e rejeição de acesso entre usuários.

Esses passos dependem da escolha do serviço, configuração de contas, políticas, API e implantação externa. Nenhuma credencial é exigida para a funcionalidade local entregue.

## Validação

`tests/arena-evolution.test.cjs` verifica começo vazio, compatibilidade, distritos, personalidades persistentes, proveniência, ações locais, fabricação, variedade de eventos, biblioteca e replay. A amostra de 36 partidas abrange seis biomas, 2/12/24 participantes e duas seeds; seus resultados ficam em `tests/results/arena-evolution-balance.json`. As suítes anteriores mantêm testes de orçamento, cerco, combate, importação e reprodução. Os cenários isolados de combate agora representam personagens após coleta; não concedem kits no fluxo real.

`tests/browser-arena-evolution.test.cjs` verifica preparação, seleção, biblioteca, retrato transportável e ajuda/pausa em desktop e celular, com capturas em `work/arena-evolution`. A regra compartilhada de ajuda conserva o conteúdo da tela; a pausa continua controlada pela sessão, inclusive quando uma pausa manual já estava ativa.

As amostras servem para avaliar tendências, não para garantir uma proporção de eventos em toda partida. A seed, configuração, versão de regras e catálogo são parte da reprodução.
