# Prompt de implementação — Arena Improvável: elencos, retratos e RPG

Reformular apenas o simulador Arena Improvável dentro da Órbita. Manter a identidade visual limpa, o papel do usuário como organizador/observador, navegação, histórico e reprodutibilidade. Executar a implementação e validar a entrega, sem limitar o trabalho a uma proposta.

## Elencos e imagens

Criar um painel de elencos antes da competição. Organizar o catálogo em **Tipo → Tema/obra → Personagens**; exemplo: TV Show → iCarly → Carly, Sam, Freddie, Spencer e demais integrantes, com fotos. Permitir misturar obras, adicionar personagens individualmente ou em grupo, trocar/remover/editar, criar personagens, guardar favoritos e importar/exportar elencos. Buscar novas séries e seus personagens em uma fonte apropriada, em vez de depender exclusivamente de Rick and Morty.

Pesquisar e incluir imagens reais dos personagens do catálogo, com origem registrada. Usar imagens de personagens quando disponíveis; identificar explicitamente quando uma fonte fornece apenas o retrato do intérprete. Imagens locais devem ser leves e funcionar no pacote estático. Permitir trocar a foto por upload ou URL. Todo evento deve mostrar os participantes com foto; mortos aparecem em tons de cinza. Se uma imagem externa falhar, manter o card utilizável com fallback e opção de substituição.

## Atributos e comportamento

Manter seis atributos entre 1 e 10: força, agilidade, resistência, percepção, astúcia e sociabilidade. Oferecer orçamento comum de pontos, distribuição automática exata e redistribuição proporcional de atributos editados. Exibir soma e média para tornar o balanceamento compreensível. Permitir liberdade de edição quando o balanceamento obrigatório estiver desativado.

Configurar quantidade de participantes, comportamento geral e individual: equilibrado, agressivo, estrategista, diplomata e cauteloso. As decisões devem considerar o perfil, atributos e necessidades reais. Força influencia golpes; agilidade influencia precisão/fuga; resistência reduz dano; percepção detecta emboscadas/armadilhas; astúcia melhora planos/roubos/armadilhas; sociabilidade permite persuadir, negociar e recrutar aliados. Defesa usa atributos do alvo, equipamento e aliados presentes. Registrar testes, chances e resultados para inspeção, sem prometer resultados canônicos.

## Eventos e balanceamento

Ampliar e variar eventos: ataques, contra-ataques, emboscadas, armadilhas, sabotagem, roubo, intimidação, persuasão, fuga, resgate, traição, disputa por recursos, encontros e imprevistos. Condições e consequências devem concordar com localização, inventário e estado atual. Aumentar confrontos e acontecimentos emergentes. Reduzir a dominância de mortes por fome/sede/arena usando crescimento menos punitivo das necessidades, recursos renováveis e decisões de autopreservação. Medir a distribuição de causas de morte em muitas seeds; não falsificar estatísticas nem sortear vencedores antecipadamente.

## Arenas e equipamentos

Cada bioma deve ter desenho, regiões, conexões e distribuição de equipamentos próprios. Oferecer diferentes formas/topologias, sempre conectadas, sem caminhos inválidos. Configurar disponibilidade de armas, abundância, dano ambiental, frequência de imprevistos e abertura do cerco. Permitir acrescentar armas com nome, potência limitada e atributo principal, preservando ownership, munição e validade dos itens.

## Entrega e validação

Integrar a nova preparação e gameplay ao catálogo e ao pacote para GitHub Pages. Versionar o motor e os saves; preservar saves antigos para exportação, explicar incompatibilidades e reaproveitar elencos válidos. Validar imagens/fontes, balanceamento exato, topologias conectadas e variadas, decisões por atributos, estado dos mortos, inventários/alianças/armadilhas, replay determinístico, saves, causas de morte, celular, desempenho e regressões dos demais jogos. Documentar fontes, decisões e limitações efetivas.
