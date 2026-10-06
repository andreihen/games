// Seleção editorial para variedade e leitura; sem nomes próprios no banco de respostas.
GameData.register('vocabulary', {
    pt: [...new Set(`
        ar as ao oi eu tu ele ela nós vós sim não bem mal bom boa ali aqui lá cá já até após antes
        sol mar lua céu luz paz voz vez mês ano dia rio rua rei lei pai mãe avó avô tio tia pão mão pé
        mel sal chá gás dor cor som tom dom fim uso asa ave ovo uva noz por com sem sob foi sou são seu sua
        casa mesa cama sala copa sofá teto chão muro vila vida voto vela tela fila fita fato dado lado lago
        fogo foco foca faca face fome sede medo amor olho óleo ouro oito onze dedo doce duro dura data dano
        dono dona dote duna eco eixo erva erro fado fase fava feno fera feto fino flor fofo fruta gelo gema
        giro gota grau grão guia halo hora hino ímã ilha jogo joia júri lado laço lama lata leão lema lente
        lido liso lixo lobo lona lote lousa luva lupa luxo mala mato meia meio meta mito moda modo mola
        mono moto muda muro nave neto nota novo nova nulo onda onça osso oval pala pano para pato pele
        pena peso pico pila piso poço polo poma ponte povo pote puro pura quem queijo quilo raro raso
        rede remo renda reto rima rio risco riso rito roça roda rolo rosa rota roxo rumo saca saco sapo
        selo sena sino soma sono sopa soro sul taco taxa teia tema tese tipo tira todo toda touro trono
        tubo tudo unha urso vago vaga vale vara vaso veia vento verde vida vila vivo viva vulto zero zona
        azul bola bolo cabo café copo coco mapa ninho prata pedra papel palco piano pluma praia porta porto
        amigo amiga amoroso alegria altura abrigo aberto aborto acesso acento acerto acordo adulto alface
        almoço aluno aluna açúcar agenda agulha aldeia alerta algas algodão alicerce alívio almoçar alto
        amargo amante ameaça amendoim análise âncora andar anel animal anúncio aperto apoio aptidão árvore
        areia arena aroma arroz artigo artista asa atraso aurora assunto aviso atleta autor autora auxílio
        abacate abacaxi abelha abelhas abraço acabar acalmar aceitar acordar adorado adotar avançar ajudar
        baixa baixo bala balde balão baleia bambu banana banco banda banho barco barra barro batata bateria
        bebida beleza belo bela beco bengala bicho bíblia bilhete bioma boca boia bolsa bolso bomba borda
        bosque botão braço bravo briga brilho brinco broto bruxa buscar buzina cabeça cabelo cabide cabra
        cacau cadeia cadeira caderno café cafeína caixa caixote calça caldo calor câmera camisa caminho
        caneta canoa canção canções canto cantar capa capital capuz caráter cardápio carinho carne carro
        carta cartão casal castelo cavalo cebola cedro célula cena centro central certeza cesto chuva cidade
        ciência cigarra cinema círculo citar claro clara classe clima clube cobra cobrir código coelho coisa
        colar colega colégio coluna comida compra concha contar conto convite coração corda correr correio
        coragem corpo costas cozinha credo criado criança crise cristal culpa cultura curso cuidado curiosidade
        dança dançar dano debate década defesa degrau deixar delito desenho desejo destino detalhe dever
        diário dica dieta direto direção disco dividir doente doença domingo doce dúvida dueto dormir dúzia
        efeito elogio empresa emprego energia entrar entrada enviar equipe escada escola escova escrita escudo
        espaço esfera espera estudo evento exato exatos exemplo existir expandir fábrica faca faixa fala família
        farinha farofa fechar fechar feira feijão festa figura filho filha filtro final firme fisgar flecha flores
        folha fonte força forno forte frase freio frente frio fritar fruta fugaz fugir futuro ganhar galho galinha
        garfo garrafa gato gesto gelo ginásio girafa gola gordura gorro gota graça grade grama grande grave
        grilo grupo guarda guerra guia hábito horta hotel humor higiene ideia idade igual imagem irmão irmã
        imenso ímpar início inseto instante inteiro inverno inventar janela jardim jarra jogar jornal jovem junto
        justiça lado lareira laranja largo lata leite leitão leitura lembrar lento letra leve livro limite limão
        língua linha lixo local lógica longe louça lugar luz macaco madeira mágico maior mala malha manter
        maneira manhã mapa máquina marido martelo matéria matiz medida médico melhor menina menino mercado
        mérito método metro milho mínimo minuto mistura modelo momento morada morango moeda mole moinho
        música músculo mundo mural nação nadar narina natal nariz navegar navio negócio neta noite norma nuvem
        número objeto obra oficina oferta ônibus onda operar opinião ordem origem oração orelha osso ótimo
        pacote padrão palavra panela parede parque parte partida passado passeio pássaro pasta peito peixe pena
        pensar pequeno pera perder pessoa pessoas piano pimenta pincel pintar pintura planeta plano planta
        plástico plateia polícia ponte porta posto pote prato prazo preço prédio presente preparo primo prisma
        problema produto prova pulso quadro quarta quase queda queijo quinta rápido rato razão real receita
        recreio rede regra relógio remar remédio renda repetir resposta resumo retrato revista ritmo ritual
        rio rocha rosto roupa saber sábado saída salada sapato saúde seco segredo segunda semana sentido
        sereno serviço sinal sílaba simples sino sistema sujeito sonho sopro sorriso sorrir sorte sombra somar
        supino suave suco talher tamanho tarde tarefa tecido teclado telhado tempo teoria tesouro texto tigre
        tijolo tinta título tomate tomar torre tosse trabalho treino trevo trilha trigo triste trocar turma último
        união usar útil valor vapor veículo vencer venda vento versão vestido viagem violão vila viola vista
        vitória viver vizinho voar volta vozes xícara xadrez zebra zíper zumbi zoológico conhecer aprender
        observar descobrir comparar recordar planejar organizar resolver escolher explicar biblioteca linguagem
        atenção memória pesquisa pergunta resposta raciocínio associação sequência intervalo comportamento
    `.split(/\s+/).filter(Boolean))],
    en: [...new Set(`
        a an as at be by do go he hi if in is it me my no of on or so to up us we yes not all any are art
        air arm ask bad bag bat bed bee big bit box boy bus buy can cap car cat cow cup cut day dog dry
        ear eat egg end eye far fat few fit fix fly fog for fox fun gas get got gum guy had has hat hay
        her him his hit hot how ice ink job key kid law lay leg let lie lip log low mad man map may mix
        mom net new nod nor now nut odd off old one our out owl own pay pen pet pie pig pin pot put red
        row run sad say sea see set sew she shy sir sit six sky son spy sun tea ten the tie tin tip toe
        top toy try two use van war was way web wet who why win won yet you zoo able acid acre acts age
        also area baby back ball band bank base bath bear beat been bell belt bend best bird blue boat
        body bone book both bowl burn busy cake calm came camp card care case cash cave chef city clay
        club coat code cold come cook cool copy corn cost cozy crew dark data dawn days dead dear deep
        desk dial dice diet dish door down draw dress drop duck each earn east easy edge else even ever
        face fact fair fall farm fast fear feel feet felt file fill film find fine fire fish five flag flat
        flow food fool foot fork four free frog from full game gate gave gift girl give glad glow goal gold
        golf gone good gray grew grow hair half hall hand hang hard hate have head hear heat help here hero
        high hill hold hole home hope hour huge idea iron item join jump just keep kind king knew know lake
        land last late lead leaf lean left less life lift like lime line lion list live load lock long look
        lost loud love luck made main make male many mark mask meal mean meat meet milk mind mine miss mode
        moon more most move much must name navy near neat neck need nest next nice nine node none nose note
        once only open oven over pace pack page paid pair park part pass past path peak pear pick pink plan
        play plot plus poem pond pool poor port pose post pull pure push quiz race rain read real rest rice
        rich ride ring rise road rock role room root rose rule rush safe said sail salt same sand save seat
        seed seem self send ship shoe shop show shut sick side sign sing sink size skin slow snow soap soft
        soil some song soon sort soul soup spin star stay step stop such sure swim tail take tale talk tall
        tank task team tell tent term test text than that them then they thin this tide time tiny told tone
        took tool town tree true turn type unit upon user very view vote wait walk wall want warm wash wave
        weak wear week well went were west what when wide wife wild will wind wine wing wise wish with wolf
        wood word work yard year your zero apple beach bread brain branch bridge bright brown chair chance
        change child choice circle clean clear clock cloud color count dance dream drink drive early earth
        empty energy enjoy equal event every field first floor flower focus forest frame fresh friend fruit
        garden glass grain grass great green group guide habit happy heart house human image input learn
        light lunch magic match memory metal model money month morning music nature night north number
        ocean office order paint paper party peace people phone place plant point power price print quiet
        quick radio raise range reason record right river round school score shape share short sleep small
        smile sound south space speak speed spell sport spring stage stand start state stone story study
        style sugar table teach theme thing think three timer today touch train travel trust truth under
        union value visit voice watch water white whole window winter woman world write yellow young
        answer better summer answer typing learn careful discover language knowledge attention practice
        keyboard computer science history culture question response geography difference challenge
    `.split(/\s+/).filter(Boolean))],
    code: [...new Set(`
        if for let var new in of do as is try get set key map log sum int bit box row col run add pop put
        && || == != <= >= ++ -- += -= => ?? ?. [] {} () true false null else this case enum void with
        async await const class super while break catch throw yield import export return switch default
        typeof delete public static length filter reduce every some find slice splice concat includes
        reverse sort split join trim replace push shift unshift return module require Promise Number
        String Boolean Object Array Map Set Date JSON Math Error Symbol BigInt undefined constructor
        console.log Math.floor Math.round Math.max Math.min JSON.parse JSON.stringify Object.keys
        Object.values Object.entries Array.from Array.isArray Promise.all Promise.resolve setTimeout
        setInterval clearTimeout parseInt parseFloat addEventListener querySelector preventDefault
        requestAnimationFrame removeEventListener getElementById textContent classList localStorage
    `.split(/\s+/).filter(Boolean))]
});
