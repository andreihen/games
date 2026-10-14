// Catálogo editorial e regras próprias. Fontes: src/assets/characters/sources.json.
GameData.register('arena', {
  "version": "arena-4",
  "arenas": [
    {
      "id": "forest",
      "name": "Floresta dos Ecos",
      "color": "#437b63",
      "water": 8,
      "food": 4,
      "hazard": 3,
      "moveCost": 2,
      "regions": [
        "Clareira central",
        "Rio sinuoso",
        "Bosque fechado",
        "Caverna úmida",
        "Mirante",
        "Brejo",
        "Trilha antiga",
        "Ponte de cipós",
        "Cabana abandonada"
      ],
      "description": "Uma floresta com água abundante, esconderijos e encontros entre as árvores. Conexões, fontes renováveis e equipamentos próprios deste bioma.",
      "positions": [
        [
          50,
          45
        ],
        [
          19,
          18
        ],
        [
          42,
          12
        ],
        [
          78,
          18
        ],
        [
          90,
          43
        ],
        [
          75,
          78
        ],
        [
          47,
          90
        ],
        [
          13,
          77
        ],
        [
          11,
          46
        ]
      ],
      "edges": [
        [
          0,
          1
        ],
        [
          1,
          2
        ],
        [
          0,
          3
        ],
        [
          3,
          4
        ],
        [
          0,
          5
        ],
        [
          5,
          6
        ],
        [
          6,
          7
        ],
        [
          7,
          8
        ],
        [
          8,
          0
        ],
        [
          2,
          3
        ]
      ],
      "loot": [
        "knife",
        "bow",
        "arrows",
        "spear",
        "rope",
        "trapkit",
        "firebomb",
        "adrenaline",
        "antidote"
      ],
      "springs": [
        1,
        4
      ],
      "forage": [
        1,
        3,
        4,
        5,
        7
      ],
      "risks": [
        1,
        2,
        2,
        3,
        1,
        3,
        1,
        2,
        2
      ]
    },
    {
      "id": "desert",
      "name": "Deserto de Vidro",
      "color": "#bf9562",
      "water": 3,
      "food": 3,
      "hazard": 7,
      "moveCost": 4,
      "regions": [
        "Bazar perdido",
        "Oásis",
        "Dunas altas",
        "Cânion",
        "Ruínas",
        "Planície salgada",
        "Gruta fresca",
        "Torre do vento",
        "Poço seco"
      ],
      "description": "Água escassa, calor e travessias que gastam energia. Conexões, fontes renováveis e equipamentos próprios deste bioma.",
      "positions": [
        [
          50,
          50
        ],
        [
          19,
          16
        ],
        [
          49,
          14
        ],
        [
          82,
          19
        ],
        [
          88,
          63
        ],
        [
          66,
          86
        ],
        [
          39,
          83
        ],
        [
          14,
          68
        ],
        [
          27,
          43
        ]
      ],
      "edges": [
        [
          0,
          2
        ],
        [
          0,
          4
        ],
        [
          0,
          6
        ],
        [
          0,
          8
        ],
        [
          1,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          4
        ],
        [
          4,
          5
        ],
        [
          5,
          6
        ],
        [
          6,
          7
        ],
        [
          7,
          8
        ],
        [
          8,
          1
        ]
      ],
      "loot": [
        "spear",
        "machete",
        "slingshot",
        "stones",
        "rope",
        "grenade",
        "adrenaline",
        "antidote"
      ],
      "springs": [
        1
      ],
      "forage": [
        4
      ],
      "risks": [
        1,
        2,
        3,
        2,
        1,
        3,
        2,
        2,
        1
      ]
    },
    {
      "id": "arctic",
      "name": "Ártico Silencioso",
      "color": "#83bcc8",
      "water": 6,
      "food": 2,
      "hazard": 6,
      "moveCost": 3,
      "regions": [
        "Estação polar",
        "Lago congelado",
        "Abrigo",
        "Geleira",
        "Bosque branco",
        "Fenda azul",
        "Costa gelada",
        "Campo branco"
      ],
      "description": "Frio intenso e pouca comida; descansar sem proteção custa saúde. Conexões, fontes renováveis e equipamentos próprios deste bioma.",
      "positions": [
        [
          50,
          52
        ],
        [
          18,
          17
        ],
        [
          50,
          13
        ],
        [
          80,
          22
        ],
        [
          87,
          62
        ],
        [
          68,
          87
        ],
        [
          40,
          84
        ],
        [
          13,
          64
        ]
      ],
      "edges": [
        [
          0,
          2
        ],
        [
          0,
          4
        ],
        [
          0,
          6
        ],
        [
          1,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          4
        ],
        [
          4,
          5
        ],
        [
          5,
          6
        ],
        [
          6,
          7
        ],
        [
          7,
          1
        ]
      ],
      "loot": [
        "axe",
        "spear",
        "crossbow",
        "arrows",
        "tool",
        "grenade",
        "adrenaline",
        "antidote"
      ],
      "springs": [
        2,
        5
      ],
      "forage": [
        4
      ],
      "risks": [
        1,
        2,
        3,
        2,
        1,
        2,
        3,
        2
      ]
    },
    {
      "id": "city",
      "name": "Cidade sem Nome",
      "color": "#888cad",
      "water": 5,
      "food": 7,
      "hazard": 4,
      "moveCost": 2,
      "regions": [
        "Praça das antenas",
        "Mercado",
        "Hospital vazio",
        "Metrô",
        "Telhados",
        "Oficina",
        "Parque",
        "Biblioteca",
        "Pátio ferroviário"
      ],
      "description": "Mais equipamentos nas ruínas, mas os corredores facilitam emboscadas. Conexões, fontes renováveis e equipamentos próprios deste bioma.",
      "positions": [
        [
          50,
          50
        ],
        [
          20,
          20
        ],
        [
          50,
          20
        ],
        [
          80,
          20
        ],
        [
          80,
          50
        ],
        [
          80,
          80
        ],
        [
          50,
          80
        ],
        [
          20,
          80
        ],
        [
          20,
          50
        ]
      ],
      "edges": [
        [
          0,
          2
        ],
        [
          0,
          4
        ],
        [
          0,
          6
        ],
        [
          0,
          8
        ],
        [
          1,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          4
        ],
        [
          4,
          5
        ],
        [
          5,
          6
        ],
        [
          6,
          7
        ],
        [
          7,
          8
        ],
        [
          8,
          1
        ],
        [
          0,
          1
        ]
      ],
      "loot": [
        "knife",
        "crossbow",
        "arrows",
        "hammer",
        "poison",
        "trapkit",
        "grenade",
        "adrenaline",
        "antidote"
      ],
      "springs": [
        2,
        5
      ],
      "forage": [
        1,
        6
      ],
      "risks": [
        1,
        2,
        3,
        2,
        1,
        3,
        2,
        2,
        3
      ]
    },
    {
      "id": "islands",
      "name": "Ilhas da Maré",
      "color": "#568eaf",
      "water": 6,
      "food": 6,
      "hazard": 5,
      "moveCost": 5,
      "regions": [
        "Porto central",
        "Praia",
        "Manguezal",
        "Ilha da pedra",
        "Recife",
        "Farol",
        "Ilha verde",
        "Ilha do nevoeiro"
      ],
      "description": "Travessias cansativas e tempestades; comida e água distribuídas de modo desigual. Conexões, fontes renováveis e equipamentos próprios deste bioma.",
      "positions": [
        [
          48,
          44
        ],
        [
          17,
          21
        ],
        [
          56,
          13
        ],
        [
          83,
          29
        ],
        [
          85,
          71
        ],
        [
          58,
          84
        ],
        [
          21,
          79
        ],
        [
          13,
          48
        ]
      ],
      "edges": [
        [
          0,
          1
        ],
        [
          0,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          4
        ],
        [
          4,
          5
        ],
        [
          5,
          6
        ],
        [
          6,
          7
        ],
        [
          7,
          1
        ],
        [
          0,
          5
        ]
      ],
      "loot": [
        "harpoon",
        "knife",
        "bow",
        "arrows",
        "rope",
        "firebomb",
        "adrenaline",
        "antidote"
      ],
      "springs": [
        1,
        4
      ],
      "forage": [
        1,
        3,
        4,
        5,
        7
      ],
      "risks": [
        1,
        3,
        2,
        2,
        1,
        3,
        2,
        2
      ]
    },
    {
      "id": "volcano",
      "name": "Caldeira Rubra",
      "color": "#b36658",
      "water": 4,
      "food": 4,
      "hazard": 9,
      "moveCost": 4,
      "regions": [
        "Posto de basalto",
        "Cratera",
        "Túnel frio",
        "Encosta",
        "Fonte mineral",
        "Ravina",
        "Ponte negra",
        "Galeria de lava"
      ],
      "description": "Perigos geológicos frequentes e terreno que cobra resistência. Conexões, fontes renováveis e equipamentos próprios deste bioma.",
      "positions": [
        [
          48,
          51
        ],
        [
          16,
          22
        ],
        [
          54,
          13
        ],
        [
          85,
          34
        ],
        [
          80,
          75
        ],
        [
          45,
          87
        ],
        [
          14,
          75
        ],
        [
          25,
          49
        ]
      ],
      "edges": [
        [
          0,
          2
        ],
        [
          0,
          4
        ],
        [
          0,
          7
        ],
        [
          1,
          2
        ],
        [
          2,
          3
        ],
        [
          3,
          4
        ],
        [
          4,
          5
        ],
        [
          5,
          6
        ],
        [
          6,
          7
        ],
        [
          7,
          1
        ]
      ],
      "loot": [
        "hammer",
        "axe",
        "spear",
        "machete",
        "armor",
        "grenade",
        "adrenaline",
        "antidote"
      ],
      "springs": [
        2,
        5
      ],
      "forage": [
        4
      ],
      "risks": [
        1,
        3,
        2,
        3,
        1,
        2,
        3,
        2
      ]
    }
  ],
  "characters": [
    {
      "id": "br-1",
      "name": "Mônica",
      "universe": "Turma da Mônica",
      "theme": "br",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "character",
      "image": "./src/assets/characters/br-1.png",
      "imageSource": "https://pt.wikipedia.org/wiki/M%C3%B4nica"
    },
    {
      "id": "br-2",
      "name": "Cebolinha",
      "universe": "Turma da Mônica",
      "theme": "br",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "character",
      "image": "./src/assets/characters/br-2.png",
      "imageSource": "https://pt.wikipedia.org/wiki/Cebolinha%20%28personagem%29"
    },
    {
      "id": "br-3",
      "name": "Magali",
      "universe": "Turma da Mônica",
      "theme": "br",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "character",
      "image": "./src/assets/characters/br-3.png",
      "imageSource": "https://pt.wikipedia.org/wiki/Magali"
    },
    {
      "id": "br-4",
      "name": "Cascão",
      "universe": "Turma da Mônica",
      "theme": "br",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "character",
      "image": "./src/assets/characters/br-4.png",
      "imageSource": "https://pt.wikipedia.org/wiki/Casc%C3%A3o"
    },
    {
      "id": "br-5",
      "name": "Chico Bento",
      "universe": "Turma da Mônica",
      "theme": "br",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "character",
      "image": "./src/assets/characters/br-5.jpg",
      "imageSource": "https://pt.wikipedia.org/wiki/Chico%20Bento"
    },
    {
      "id": "br-6",
      "name": "João Grilo",
      "universe": "O Auto da Compadecida",
      "theme": "br",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "actor",
      "image": "./src/assets/characters/br-6.jpg",
      "imageSource": "https://www.tvmaze.com/people/240436/matheus-nachtergaele"
    },
    {
      "id": "br-7",
      "name": "Chicó",
      "universe": "O Auto da Compadecida",
      "theme": "br",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "actor",
      "image": "./src/assets/characters/br-7.jpg",
      "imageSource": "https://www.tvmaze.com/people/126588/selton-mello"
    },
    {
      "id": "br-8",
      "name": "Saci",
      "universe": "Folclore brasileiro",
      "theme": "br",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "folklore",
      "imageKind": "illustration",
      "image": "./src/assets/characters/br-8.jpg",
      "imageSource": "https://pt.wikipedia.org/wiki/Saci"
    },
    {
      "id": "br-9",
      "name": "Cuca",
      "universe": "Folclore brasileiro",
      "theme": "br",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "folklore",
      "imageKind": "actor",
      "image": "./src/assets/characters/br-9.jpg",
      "imageSource": "https://www.tvmaze.com/people/168663/alessandra-negrini"
    },
    {
      "id": "br-10",
      "name": "Curupira",
      "universe": "Folclore brasileiro",
      "theme": "br",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "folklore",
      "imageKind": "illustration",
      "image": "./src/assets/characters/br-10.jpg",
      "imageSource": "https://pt.wikipedia.org/wiki/Curupira"
    },
    {
      "id": "br-11",
      "name": "Boitatá",
      "universe": "Folclore brasileiro",
      "theme": "br",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "folklore",
      "imageKind": "illustration",
      "image": "./src/assets/characters/br-11.jpg",
      "imageSource": "https://pt.wikipedia.org/wiki/Boitat%C3%A1"
    },
    {
      "id": "br-12",
      "name": "Menino Maluquinho",
      "universe": "Menino Maluquinho",
      "theme": "br",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "illustration",
      "image": "./src/assets/characters/br-12.png",
      "imageSource": "https://pt.wikipedia.org/wiki/O_Menino_Maluquinho"
    },
    {
      "id": "br-13",
      "name": "Emília",
      "universe": "Sítio do Picapau Amarelo",
      "theme": "br",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "character",
      "image": "./src/assets/characters/br-13.jpg",
      "imageSource": "https://pt.wikipedia.org/wiki/Em%C3%ADlia%20%28personagem%29"
    },
    {
      "id": "br-14",
      "name": "Visconde de Sabugosa",
      "universe": "Sítio do Picapau Amarelo",
      "theme": "br",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "br",
      "imageKind": "character",
      "image": "./src/assets/characters/br-14.jpg",
      "imageSource": "https://pt.wikipedia.org/wiki/Visconde%20de%20Sabugosa"
    },
    {
      "id": "br-15",
      "name": "Nazaré Tedesco",
      "universe": "Senhora do Destino",
      "theme": "br",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "tv",
      "imageKind": "actor",
      "image": "./src/assets/characters/br-15.jpg",
      "imageSource": "https://www.tvmaze.com/people/89953/renata-sorrah"
    },
    {
      "id": "br-16",
      "name": "Odete Roitman",
      "universe": "Vale Tudo",
      "theme": "br",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "tv",
      "imageKind": "actor",
      "image": "./src/assets/characters/br-16.jpg",
      "imageSource": "https://www.tvmaze.com/people/156812/beatriz-segall"
    },
    {
      "id": "anime-1",
      "name": "Goku",
      "universe": "Dragon Ball",
      "theme": "anime",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-1.png",
      "imageSource": "https://en.wikipedia.org/wiki/Goku"
    },
    {
      "id": "anime-2",
      "name": "Vegeta",
      "universe": "Dragon Ball",
      "theme": "anime",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-2.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Vegeta"
    },
    {
      "id": "anime-3",
      "name": "Bulma",
      "universe": "Dragon Ball",
      "theme": "anime",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-3.png",
      "imageSource": "https://en.wikipedia.org/wiki/Bulma"
    },
    {
      "id": "anime-4",
      "name": "Naruto",
      "universe": "Naruto",
      "theme": "anime",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-4.png",
      "imageSource": "https://en.wikipedia.org/wiki/Naruto%20Uzumaki"
    },
    {
      "id": "anime-5",
      "name": "Sakura",
      "universe": "Naruto",
      "theme": "anime",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-5.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Sakura%20Haruno"
    },
    {
      "id": "anime-6",
      "name": "Kakashi",
      "universe": "Naruto",
      "theme": "anime",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-6.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Kakashi%20Hatake"
    },
    {
      "id": "anime-7",
      "name": "Luffy",
      "universe": "One Piece",
      "theme": "anime",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-7.png",
      "imageSource": "https://en.wikipedia.org/wiki/Monkey%20D.%20Luffy"
    },
    {
      "id": "anime-8",
      "name": "Nami",
      "universe": "One Piece",
      "theme": "anime",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-8.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Nami%20%28One%20Piece%29"
    },
    {
      "id": "anime-9",
      "name": "Zoro",
      "universe": "One Piece",
      "theme": "anime",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-9.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Roronoa%20Zoro"
    },
    {
      "id": "anime-10",
      "name": "Sailor Moon",
      "universe": "Sailor Moon",
      "theme": "anime",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-10.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Sailor%20Moon%20%28character%29"
    },
    {
      "id": "anime-11",
      "name": "Saitama",
      "universe": "One Punch Man",
      "theme": "anime",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-11.png",
      "imageSource": "https://en.wikipedia.org/wiki/Saitama%20%28One-Punch%20Man%29"
    },
    {
      "id": "anime-12",
      "name": "Totoro",
      "universe": "Meu Amigo Totoro",
      "theme": "anime",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "anime",
      "imageKind": "character",
      "image": "./src/assets/characters/anime-12.jpg",
      "imageSource": "https://anilist.co/character/269"
    },
    {
      "id": "games-1",
      "name": "Mario",
      "universe": "Super Mario",
      "theme": "games",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-1.png",
      "imageSource": "https://en.wikipedia.org/wiki/Mario"
    },
    {
      "id": "games-2",
      "name": "Luigi",
      "universe": "Super Mario",
      "theme": "games",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-2.png",
      "imageSource": "https://en.wikipedia.org/wiki/Luigi_(character)"
    },
    {
      "id": "games-3",
      "name": "Peach",
      "universe": "Super Mario",
      "theme": "games",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-3.png",
      "imageSource": "https://en.wikipedia.org/wiki/Princess%20Peach"
    },
    {
      "id": "games-4",
      "name": "Bowser",
      "universe": "Super Mario",
      "theme": "games",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-4.png",
      "imageSource": "https://en.wikipedia.org/wiki/Bowser"
    },
    {
      "id": "games-5",
      "name": "Link",
      "universe": "The Legend of Zelda",
      "theme": "games",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-5.png",
      "imageSource": "https://en.wikipedia.org/wiki/Link%20%28The%20Legend%20of%20Zelda%29"
    },
    {
      "id": "games-6",
      "name": "Zelda",
      "universe": "The Legend of Zelda",
      "theme": "games",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-6.png",
      "imageSource": "https://en.wikipedia.org/wiki/Princess%20Zelda"
    },
    {
      "id": "games-7",
      "name": "Samus",
      "universe": "Metroid",
      "theme": "games",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-7.png",
      "imageSource": "https://en.wikipedia.org/wiki/Samus%20Aran"
    },
    {
      "id": "games-8",
      "name": "Sonic",
      "universe": "Sonic",
      "theme": "games",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-8.png",
      "imageSource": "https://en.wikipedia.org/wiki/Sonic%20the%20Hedgehog%20%28character%29"
    },
    {
      "id": "games-9",
      "name": "Kirby",
      "universe": "Kirby",
      "theme": "games",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-9.png",
      "imageSource": "https://en.wikipedia.org/wiki/Kirby%20%28character%29"
    },
    {
      "id": "games-10",
      "name": "Lara Croft",
      "universe": "Tomb Raider",
      "theme": "games",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-10.png",
      "imageSource": "https://en.wikipedia.org/wiki/Lara%20Croft"
    },
    {
      "id": "games-11",
      "name": "Kratos",
      "universe": "God of War",
      "theme": "games",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-11.png",
      "imageSource": "https://en.wikipedia.org/wiki/Kratos%20%28God%20of%20War%29"
    },
    {
      "id": "games-12",
      "name": "Chun-Li",
      "universe": "Street Fighter",
      "theme": "games",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "games",
      "imageKind": "character",
      "image": "./src/assets/characters/games-12.png",
      "imageSource": "https://pt.wikipedia.org/wiki/Chun-Li"
    },
    {
      "id": "screen-1",
      "name": "Darth Vader",
      "universe": "Star Wars",
      "theme": "screen",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-1.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Darth%20Vader"
    },
    {
      "id": "screen-2",
      "name": "Leia Organa",
      "universe": "Star Wars",
      "theme": "screen",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-2.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Princess%20Leia"
    },
    {
      "id": "screen-3",
      "name": "Yoda",
      "universe": "Star Wars",
      "theme": "screen",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-3.png",
      "imageSource": "https://en.wikipedia.org/wiki/Yoda"
    },
    {
      "id": "screen-4",
      "name": "Shrek",
      "universe": "Shrek",
      "theme": "screen",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-4.png",
      "imageSource": "https://en.wikipedia.org/wiki/Shrek%20%28character%29"
    },
    {
      "id": "screen-5",
      "name": "Fiona",
      "universe": "Shrek",
      "theme": "screen",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-5.png",
      "imageSource": "https://en.wikipedia.org/wiki/Princess%20Fiona"
    },
    {
      "id": "screen-6",
      "name": "Jack Sparrow",
      "universe": "Piratas do Caribe",
      "theme": "screen",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-6.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Jack%20Sparrow"
    },
    {
      "id": "screen-7",
      "name": "Hermione",
      "universe": "Harry Potter",
      "theme": "screen",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-7.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Hermione%20Granger"
    },
    {
      "id": "screen-8",
      "name": "Harry Potter",
      "universe": "Harry Potter",
      "theme": "screen",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-8.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Harry%20Potter%20%28character%29"
    },
    {
      "id": "screen-9",
      "name": "Eleven",
      "universe": "Stranger Things",
      "theme": "screen",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "tv",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-9.jpg",
      "imageSource": "https://www.tvmaze.com/characters/285572/stranger-things-jane-eleven-hopper"
    },
    {
      "id": "screen-10",
      "name": "Wandinha",
      "universe": "A Família Addams",
      "theme": "screen",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "tv",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-10.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Wednesday%20Addams"
    },
    {
      "id": "screen-11",
      "name": "Walter White",
      "universe": "Breaking Bad",
      "theme": "screen",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "tv",
      "imageKind": "character",
      "image": "./src/assets/characters/screen-11.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45529/breaking-bad-walter-white"
    },
    {
      "id": "screen-12",
      "name": "Katniss Everdeen",
      "universe": "Jogos Vorazes",
      "theme": "screen",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "movies",
      "imageKind": "illustration",
      "image": "./src/assets/characters/screen-12.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Katniss%20Everdeen"
    },
    {
      "id": "cartoon-1",
      "name": "Batman",
      "universe": "DC",
      "theme": "cartoon",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "comics",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-1.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Batman"
    },
    {
      "id": "cartoon-2",
      "name": "Mulher-Maravilha",
      "universe": "DC",
      "theme": "cartoon",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "comics",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-2.jpg",
      "imageSource": "https://en.wikipedia.org/wiki/Wonder%20Woman"
    },
    {
      "id": "cartoon-3",
      "name": "Homem-Aranha",
      "universe": "Marvel",
      "theme": "cartoon",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "comics",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-3.png",
      "imageSource": "https://en.wikipedia.org/wiki/Spider-Man"
    },
    {
      "id": "cartoon-4",
      "name": "Tempestade",
      "universe": "Marvel",
      "theme": "cartoon",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "comics",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-4.png",
      "imageSource": "https://en.wikipedia.org/wiki/Storm%20%28Marvel%20Comics%29"
    },
    {
      "id": "cartoon-5",
      "name": "Bob Esponja",
      "universe": "Bob Esponja",
      "theme": "cartoon",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-5.png",
      "imageSource": "https://en.wikipedia.org/wiki/SpongeBob%20SquarePants%20%28character%29"
    },
    {
      "id": "cartoon-6",
      "name": "Patrick",
      "universe": "Bob Esponja",
      "theme": "cartoon",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-6.png",
      "imageSource": "https://en.wikipedia.org/wiki/Patrick%20Star"
    },
    {
      "id": "cartoon-7",
      "name": "Pernalonga",
      "universe": "Looney Tunes",
      "theme": "cartoon",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-7.png",
      "imageSource": "https://en.wikipedia.org/wiki/Bugs%20Bunny"
    },
    {
      "id": "cartoon-8",
      "name": "Velma",
      "universe": "Scooby-Doo",
      "theme": "cartoon",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-8.png",
      "imageSource": "https://en.wikipedia.org/wiki/Velma%20Dinkley"
    },
    {
      "id": "cartoon-9",
      "name": "Scooby-Doo",
      "universe": "Scooby-Doo",
      "theme": "cartoon",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-9.png",
      "imageSource": "https://en.wikipedia.org/wiki/Scooby-Doo%20%28character%29"
    },
    {
      "id": "cartoon-10",
      "name": "Pica-Pau",
      "universe": "Pica-Pau",
      "theme": "cartoon",
      "gender": "unknown",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-10.png",
      "imageSource": "https://en.wikipedia.org/wiki/Woody%20Woodpecker"
    },
    {
      "id": "cartoon-11",
      "name": "Finn",
      "universe": "Hora de Aventura",
      "theme": "cartoon",
      "gender": "male",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-11.png",
      "imageSource": "https://en.wikipedia.org/wiki/Finn%20the%20Human"
    },
    {
      "id": "cartoon-12",
      "name": "Marceline",
      "universe": "Hora de Aventura",
      "theme": "cartoon",
      "gender": "female",
      "source": "Catálogo editorial local",
      "portrait": null,
      "type": "cartoon",
      "imageKind": "character",
      "image": "./src/assets/characters/cartoon-12.png",
      "imageSource": "https://en.wikipedia.org/wiki/Marceline%20the%20Vampire%20Queen"
    },
    {
      "id": "tv-808-88470",
      "name": "Carly Shay",
      "universe": "iCarly",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-808-88470.jpg",
      "imageSource": "https://www.tvmaze.com/characters/88470/icarly-carly-shay"
    },
    {
      "id": "tv-808-88472",
      "name": "Freddie Benson",
      "universe": "iCarly",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-808-88472.jpg",
      "imageSource": "https://www.tvmaze.com/characters/88472/icarly-freddie-benson"
    },
    {
      "id": "tv-808-88473",
      "name": "Spencer Shay",
      "universe": "iCarly",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-808-88473.jpg",
      "imageSource": "https://www.tvmaze.com/characters/88473/icarly-spencer-shay"
    },
    {
      "id": "tv-808-88471",
      "name": "Sam Puckett",
      "universe": "iCarly",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-808-88471.jpg",
      "imageSource": "https://www.tvmaze.com/characters/88471/icarly-sam-puckett"
    },
    {
      "id": "tv-808-88474",
      "name": "Gibby Gibson",
      "universe": "iCarly",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-808-88474.jpg",
      "imageSource": "https://www.tvmaze.com/characters/88474/icarly-gibby-gibson"
    },
    {
      "id": "tv-431-78218",
      "name": "Rachel Green",
      "universe": "Friends",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-431-78218.jpg",
      "imageSource": "https://www.tvmaze.com/characters/78218/friends-rachel-green"
    },
    {
      "id": "tv-431-78219",
      "name": "Monica Geller",
      "universe": "Friends",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-431-78219.jpg",
      "imageSource": "https://www.tvmaze.com/characters/78219/friends-monica-geller"
    },
    {
      "id": "tv-431-78220",
      "name": "Phoebe Buffay",
      "universe": "Friends",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-431-78220.jpg",
      "imageSource": "https://www.tvmaze.com/characters/78220/friends-phoebe-buffay"
    },
    {
      "id": "tv-431-78221",
      "name": "Joey Tribbiani",
      "universe": "Friends",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-431-78221.jpg",
      "imageSource": "https://www.tvmaze.com/characters/78221/friends-joey-tribbiani"
    },
    {
      "id": "tv-431-78222",
      "name": "Chandler Bing",
      "universe": "Friends",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-431-78222.jpg",
      "imageSource": "https://www.tvmaze.com/characters/78222/friends-chandler-bing"
    },
    {
      "id": "tv-431-78223",
      "name": "Ross Geller",
      "universe": "Friends",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-431-78223.jpg",
      "imageSource": "https://www.tvmaze.com/characters/78223/friends-ross-geller"
    },
    {
      "id": "tv-526-85556",
      "name": "Dwight Kurt Schrute",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85556.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85556/the-office-dwight-kurt-schrute"
    },
    {
      "id": "tv-526-85557",
      "name": "Jim Halpert",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85557.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85557/the-office-jim-halpert"
    },
    {
      "id": "tv-526-85560",
      "name": "Stanley Hudson",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85560.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85560/the-office-stanley-hudson"
    },
    {
      "id": "tv-526-85565",
      "name": "Phyllis Lapin-Vance",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85565.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85565/the-office-phyllis-lapin-vance"
    },
    {
      "id": "tv-526-85558",
      "name": "Pam Beesly",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85558.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85558/the-office-pam-beesly"
    },
    {
      "id": "tv-526-85561",
      "name": "Kevin Malone",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85561.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85561/the-office-kevin-malone"
    },
    {
      "id": "tv-526-85563",
      "name": "Angela Martin",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85563.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85563/the-office-angela-martin"
    },
    {
      "id": "tv-526-85564",
      "name": "Oscar Martinez",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85564.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85564/the-office-oscar-martinez"
    },
    {
      "id": "tv-526-85562",
      "name": "Meredith Palmer",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85562.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85562/the-office-meredith-palmer"
    },
    {
      "id": "tv-526-85570",
      "name": "Creed Bratton",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85570.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85570/the-office-creed-bratton"
    },
    {
      "id": "tv-526-85569",
      "name": "Andy Bernard",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85569.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85569/the-office-andy-bernard"
    },
    {
      "id": "tv-526-85567",
      "name": "Kelly Kapoor",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85567.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85567/the-office-kelly-kapoor"
    },
    {
      "id": "tv-526-85559",
      "name": "Ryan Howard",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85559.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85559/the-office-ryan-howard"
    },
    {
      "id": "tv-526-85555",
      "name": "Michael Scott",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85555.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85555/the-office-michael-scott"
    },
    {
      "id": "tv-526-85568",
      "name": "Toby Flenderson",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85568.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85568/the-office-toby-flenderson"
    },
    {
      "id": "tv-526-85571",
      "name": "Darryl Philbin",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85571.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85571/the-office-darryl-philbin"
    },
    {
      "id": "tv-526-138812",
      "name": "Erin Hannon",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-138812.jpg",
      "imageSource": "https://www.tvmaze.com/characters/138812/the-office-erin-hannon"
    },
    {
      "id": "tv-526-144094",
      "name": "Gabe Lewis",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-144094.jpg",
      "imageSource": "https://www.tvmaze.com/characters/144094/the-office-gabe-lewis"
    },
    {
      "id": "tv-526-85566",
      "name": "Jan Levinson",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85566.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85566/the-office-jan-levinson"
    },
    {
      "id": "tv-526-138807",
      "name": "Nellie Bertram",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-138807.jpg",
      "imageSource": "https://www.tvmaze.com/characters/138807/the-office-nellie-bertram"
    },
    {
      "id": "tv-526-85572",
      "name": "Roy Anderson",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-85572.jpg",
      "imageSource": "https://www.tvmaze.com/characters/85572/the-office-roy-anderson"
    },
    {
      "id": "tv-526-138808",
      "name": "Clark",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "actor",
      "image": "./src/assets/characters/tv-526-138808.jpg",
      "imageSource": "https://www.tvmaze.com/people/7797/clark-duke"
    },
    {
      "id": "tv-526-138815",
      "name": "Pete",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "actor",
      "image": "./src/assets/characters/tv-526-138815.jpg",
      "imageSource": "https://www.tvmaze.com/people/57372/jake-lacy"
    },
    {
      "id": "tv-526-480013",
      "name": "Robert California",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-480013.jpg",
      "imageSource": "https://www.tvmaze.com/characters/480013/the-office-robert-california"
    },
    {
      "id": "tv-526-461188",
      "name": "Holly Flax",
      "universe": "The Office",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-526-461188.jpg",
      "imageSource": "https://www.tvmaze.com/characters/461188/the-office-holly-flax"
    },
    {
      "id": "tv-2993-165111",
      "name": "Joyce Byers",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-165111.jpg",
      "imageSource": "https://www.tvmaze.com/characters/165111/stranger-things-joyce-byers"
    },
    {
      "id": "tv-2993-165113",
      "name": "Lucas Sinclair",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-165113.jpg",
      "imageSource": "https://www.tvmaze.com/characters/165113/stranger-things-lucas-sinclair"
    },
    {
      "id": "tv-2993-165115",
      "name": "Mike Wheeler",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-165115.jpg",
      "imageSource": "https://www.tvmaze.com/characters/165115/stranger-things-mike-wheeler"
    },
    {
      "id": "tv-2993-165116",
      "name": "Dustin Henderson",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-165116.jpg",
      "imageSource": "https://www.tvmaze.com/characters/165116/stranger-things-dustin-henderson"
    },
    {
      "id": "tv-2993-165117",
      "name": "Nancy Wheeler",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-165117.jpg",
      "imageSource": "https://www.tvmaze.com/characters/165117/stranger-things-nancy-wheeler"
    },
    {
      "id": "tv-2993-297371",
      "name": "Chief Jim Hopper",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-297371.jpg",
      "imageSource": "https://www.tvmaze.com/characters/297371/stranger-things-chief-jim-hopper"
    },
    {
      "id": "tv-2993-297372",
      "name": "Steve Harrington",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-297372.jpg",
      "imageSource": "https://www.tvmaze.com/characters/297372/stranger-things-steve-harrington"
    },
    {
      "id": "tv-2993-165114",
      "name": "Jonathan Byers",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-165114.jpg",
      "imageSource": "https://www.tvmaze.com/characters/165114/stranger-things-jonathan-byers"
    },
    {
      "id": "tv-2993-165118",
      "name": "Will Byers",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-165118.jpg",
      "imageSource": "https://www.tvmaze.com/characters/165118/stranger-things-will-byers"
    },
    {
      "id": "tv-2993-285573",
      "name": "Karen Wheeler",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-285573.jpg",
      "imageSource": "https://www.tvmaze.com/characters/285573/stranger-things-karen-wheeler"
    },
    {
      "id": "tv-2993-473821",
      "name": "Maxine \"Max\" Mayfield",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-473821.jpg",
      "imageSource": "https://www.tvmaze.com/characters/473821/stranger-things-maxine-max-mayfield"
    },
    {
      "id": "tv-2993-308387",
      "name": "Holly Wheeler",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-308387.jpg",
      "imageSource": "https://www.tvmaze.com/characters/308387/stranger-things-holly-wheeler"
    },
    {
      "id": "tv-2993-577195",
      "name": "Robin Buckley",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-577195.jpg",
      "imageSource": "https://www.tvmaze.com/characters/577195/stranger-things-robin-buckley"
    },
    {
      "id": "tv-2993-473854",
      "name": "Murray Bauman",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-473854.jpg",
      "imageSource": "https://www.tvmaze.com/characters/473854/stranger-things-murray-bauman"
    },
    {
      "id": "tv-2993-473900",
      "name": "Erica Sinclair",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-473900.jpg",
      "imageSource": "https://www.tvmaze.com/characters/473900/stranger-things-erica-sinclair"
    },
    {
      "id": "tv-2993-473824",
      "name": "Billy Hargrove",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-473824.jpg",
      "imageSource": "https://www.tvmaze.com/characters/473824/stranger-things-billy-hargrove"
    },
    {
      "id": "tv-2993-992415",
      "name": "Henry Creel / Vecna",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-992415.jpg",
      "imageSource": "https://www.tvmaze.com/characters/992415/stranger-things-henry-creel-vecna"
    },
    {
      "id": "tv-2993-269670",
      "name": "Dr. Martin Brenner",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-269670.jpg",
      "imageSource": "https://www.tvmaze.com/characters/269670/stranger-things-dr-martin-brenner"
    },
    {
      "id": "tv-2993-473826",
      "name": "Dr. Sam Owens",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-473826.jpg",
      "imageSource": "https://www.tvmaze.com/characters/473826/stranger-things-dr-sam-owens"
    },
    {
      "id": "tv-2993-1467435",
      "name": "Dr. Kay",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-1467435.jpg",
      "imageSource": "https://www.tvmaze.com/characters/1467435/stranger-things-dr-kay"
    },
    {
      "id": "tv-2993-473825",
      "name": "Bob Newby",
      "universe": "Stranger Things",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-2993-473825.jpg",
      "imageSource": "https://www.tvmaze.com/characters/473825/stranger-things-bob-newby"
    },
    {
      "id": "tv-169-45531",
      "name": "Jesse Pinkman",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45531.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45531/breaking-bad-jesse-pinkman"
    },
    {
      "id": "tv-169-45530",
      "name": "Skyler White",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45530.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45530/breaking-bad-skyler-white"
    },
    {
      "id": "tv-169-45534",
      "name": "Walter White Jr.",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45534.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45534/breaking-bad-walter-white-jr"
    },
    {
      "id": "tv-169-45532",
      "name": "Hank Schrader",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45532.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45532/breaking-bad-hank-schrader"
    },
    {
      "id": "tv-169-45533",
      "name": "Marie Schrader",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45533.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45533/breaking-bad-marie-schrader"
    },
    {
      "id": "tv-169-45535",
      "name": "Saul Goodman",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45535.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45535/breaking-bad-saul-goodman"
    },
    {
      "id": "tv-169-45537",
      "name": "Michael 'Mike' Ehrmantraut",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45537.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45537/breaking-bad-michael-mike-ehrmantraut"
    },
    {
      "id": "tv-169-45536",
      "name": "Gustavo 'Gus' Fring",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45536.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45536/breaking-bad-gustavo-gus-fring"
    },
    {
      "id": "tv-169-45539",
      "name": "Todd Alquist",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45539.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45539/breaking-bad-todd-alquist"
    },
    {
      "id": "tv-169-45538",
      "name": "Lydia Rodarte-Quayle",
      "universe": "Breaking Bad",
      "theme": "screen",
      "type": "tv",
      "gender": "unknown",
      "source": "TVmaze",
      "portrait": null,
      "imageKind": "character",
      "image": "./src/assets/characters/tv-169-45538.jpg",
      "imageSource": "https://www.tvmaze.com/characters/45538/breaking-bad-lydia-rodarte-quayle"
    }
  ],
  "themes": [
    {
      "id": "br",
      "label": "Cultura brasileira"
    },
    {
      "id": "anime",
      "label": "Anime e mangá"
    },
    {
      "id": "games",
      "label": "Videogames"
    },
    {
      "id": "screen",
      "label": "Filmes e séries"
    },
    {
      "id": "cartoon",
      "label": "Quadrinhos e desenhos"
    }
  ],
  "attributes": {
    "strength": "Força",
    "agility": "Agilidade",
    "endurance": "Resistência",
    "perception": "Percepção",
    "cunning": "Astúcia",
    "social": "Sociabilidade"
  },
  "items": {
    "knife": {
      "name": "Faca de campo",
      "type": "weapon",
      "power": 6,
      "attribute": "agility"
    },
    "spear": {
      "name": "Lança",
      "type": "weapon",
      "power": 9,
      "attribute": "strength"
    },
    "bow": {
      "name": "Arco",
      "type": "weapon",
      "power": 11,
      "ammo": "arrows",
      "attribute": "perception"
    },
    "arrows": {
      "name": "Flechas",
      "type": "ammo",
      "charges": 4
    },
    "armor": {
      "name": "Proteção leve",
      "type": "armor",
      "power": 5
    },
    "food": {
      "name": "Ração",
      "type": "food",
      "charges": 2
    },
    "water": {
      "name": "Cantil",
      "type": "water",
      "charges": 2
    },
    "med": {
      "name": "Kit de curativos",
      "type": "med",
      "charges": 2
    },
    "tool": {
      "name": "Kit de abrigo",
      "type": "tool",
      "power": 5
    },
    "axe": {
      "name": "Machado",
      "type": "weapon",
      "power": 12,
      "attribute": "strength"
    },
    "machete": {
      "name": "Facão",
      "type": "weapon",
      "power": 9,
      "attribute": "agility"
    },
    "crossbow": {
      "name": "Besta",
      "type": "weapon",
      "power": 13,
      "attribute": "perception",
      "ammo": "arrows"
    },
    "harpoon": {
      "name": "Arpão",
      "type": "weapon",
      "power": 11,
      "attribute": "strength"
    },
    "hammer": {
      "name": "Martelo de combate",
      "type": "weapon",
      "power": 14,
      "attribute": "strength"
    },
    "slingshot": {
      "name": "Estilingue",
      "type": "weapon",
      "power": 7,
      "attribute": "cunning",
      "ammo": "stones"
    },
    "stones": {
      "name": "Pedras",
      "type": "ammo",
      "charges": 6
    },
    "rope": {
      "name": "Corda",
      "type": "tool",
      "charges": 1
    },
    "trapkit": {
      "name": "Kit de armadilhas",
      "type": "tool",
      "charges": 2
    },
    "poison": {
      "name": "Toxina da arena",
      "type": "tool",
      "charges": 1
    },
    "grenade": {
      "name": "Granada de fragmentação",
      "type": "tool",
      "charges": 1,
      "areaDamage": 105
    },
    "firebomb": {
      "name": "Frasco incendiário",
      "type": "tool",
      "charges": 1,
      "areaDamage": 72
    },
    "charge": {
      "name": "Carga de demolição",
      "type": "tool",
      "charges": 1,
      "areaDamage": 125
    },
    "adrenaline": {
      "name": "Injetor de adrenalina",
      "type": "tool",
      "charges": 1
    },
    "antidote": {
      "name": "Antídoto",
      "type": "tool",
      "charges": 1
    },
    "material": {
      "name": "Fibras, tecido e materiais de campo",
      "type": "tool",
      "charges": 1
    }
  },
  "events": [
    {
      "id": "search",
      "category": "exploration",
      "name": "Busca por recursos",
      "weight": 7,
      "handler": "search",
      "texts": [
        "Sob o que parecia abandono, {a} encontrou {item} em {r}.",
        "Uma busca paciente por {r} rendeu {item} a {a}.",
        "{a} afastou os detritos de {r} e recuperou {item}.",
        "{a} conferiu os esconderijos de {r}; um deles guardava {item}."
      ],
      "failTexts": [
        "{a} vasculhou {r}, mas os esconderijos não entregaram nada.",
        "A busca de {a} terminou entre pistas antigas de {r}.",
        "Em {r}, {a} procurou provisões sem encontrar o que levar.",
        "As marcas no chão não conduziram {a} a nenhum recurso."
      ]
    },
    {
      "id": "move",
      "category": "movement",
      "name": "Deslocamento",
      "weight": 6,
      "handler": "move",
      "texts": [
        "{a} deixou {from} e tomou a trilha para {r}.",
        "A passagem entre {from} e {r} recebeu os passos de {a}.",
        "{a} atravessou o caminho de {from} até {r}.",
        "Depois de deixar {from} para trás, {a} alcançou {r}."
      ],
      "failTexts": []
    },
    {
      "id": "rest",
      "category": "survival",
      "name": "Descanso",
      "weight": 3,
      "handler": "rest",
      "texts": [
        "{a} parou em {r} para recuperar o fôlego.",
        "Por algum tempo, {a} descansou em {r}.",
        "Em {r}, {a} recuperou forças antes de continuar.",
        "{a} fez uma pausa em {r}; o cansaço cedeu aos poucos."
      ],
      "failTexts": []
    },
    {
      "id": "drink",
      "category": "survival",
      "name": "Água",
      "weight": 8,
      "handler": "drink",
      "texts": [
        "{a} bebeu do cantil; a sede começou a ceder.",
        "A água guardada por {a} tornou a caminhada menos penosa.",
        "{a} abriu o cantil e aliviou a garganta seca."
      ],
      "failTexts": []
    },
    {
      "id": "eat",
      "category": "survival",
      "name": "Comida",
      "weight": 8,
      "handler": "eat",
      "texts": [
        "{a} abriu as provisões e comeu para recuperar forças.",
        "A comida guardada sustentou {a} por mais um trecho.",
        "Em {r}, {a} encontrou tempo para uma refeição."
      ],
      "failTexts": []
    },
    {
      "id": "heal",
      "category": "survival",
      "name": "Curativos",
      "weight": 10,
      "handler": "heal",
      "texts": [
        "{a} limpou os ferimentos e aplicou curativos.",
        "Os curativos guardados ajudaram {a} a se recompor.",
        "Em {r}, {a} tratou as marcas deixadas pela arena."
      ],
      "failTexts": []
    },
    {
      "id": "alliance",
      "category": "relations",
      "name": "Aliança",
      "weight": 3,
      "handler": "alliance",
      "texts": [
        "{a} e {b} firmaram um acordo de sobrevivência em {r}.",
        "{a} propôs dividir os riscos com {b}; a proposta foi aceita.",
        "Em {r}, {a} e {b} decidiram cuidar um do outro."
      ],
      "failTexts": [
        "{a} ofereceu um acordo a {b}, que preferiu manter distância.",
        "Em {r}, a tentativa de aproximação de {a} não convenceu {b}.",
        "{b} ouviu a proposta de {a}, mas decidiu seguir por conta própria."
      ]
    },
    {
      "id": "share",
      "category": "relations",
      "name": "Partilha",
      "weight": 3,
      "handler": "share",
      "texts": [
        "{a} entregou {item} a {b}, que precisava mais daquela provisão.",
        "Ao perceber a dificuldade de {b}, {a} compartilhou {item}.",
        "{a} separou {item} para ajudar {b} a seguir em frente."
      ],
      "failTexts": []
    },
    {
      "id": "break",
      "category": "relations",
      "name": "Rompimento",
      "weight": 3,
      "handler": "break",
      "texts": [
        "{a} e {b} romperam a aliança. Cada um seguiu com os próprios planos."
      ],
      "failTexts": []
    },
    {
      "id": "combat",
      "category": "conflict",
      "name": "Confronto",
      "weight": 24,
      "handler": "combat",
      "texts": [
        "{a} avançou contra {b} com {weapon}.",
        "Em {r}, {a} ergueu {weapon} contra {b}.",
        "{a} tentou romper a defesa de {b}, usando {weapon}.",
        "O encontro em {r} virou confronto: {a} atacou {b} com {weapon}."
      ],
      "failTexts": []
    },
    {
      "id": "scuffle",
      "category": "conflict",
      "name": "Disputa sem armas",
      "weight": 10,
      "handler": "scuffle",
      "texts": [
        "Sem arma disponível, {a} partiu contra {b}.",
        "{a} tentou alcançar {b} com as próprias mãos.",
        "A disputa entre {a} e {b} começou sem armas em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "betray",
      "category": "conflict",
      "name": "Traição",
      "weight": 7,
      "handler": "betray",
      "texts": [
        "{a} rompeu o acordo e surpreendeu {b} em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "weather",
      "category": "environment",
      "name": "Perigo da arena",
      "weight": 1,
      "handler": "weather",
      "texts": [
        "{a} enfrentou {danger} em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "humor",
      "category": "story",
      "name": "Intervalo improvável",
      "weight": 7,
      "handler": "humor",
      "texts": [
        "{a} tentou negociar com uma pedra em {r}. A pedra permaneceu irredutível.",
        "{a} anunciou um plano brilhante, esqueceu o plano e resolveu descansar.",
        "{a} improvisou uma placa de \"não perturbe\" em {r}. A arena ignorou a solicitação.",
        "{a} discutiu com o eco e perdeu a discussão. Pelo menos ninguém testemunhou."
      ],
      "failTexts": []
    },
    {
      "id": "ambush",
      "category": "conflict",
      "name": "Emboscada",
      "weight": 10,
      "handler": "ambush",
      "texts": [
        "{a} preparou uma emboscada para {b} em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "hide",
      "category": "exploration",
      "name": "Ocultação",
      "weight": 3,
      "handler": "hide",
      "texts": [
        "{a} se ocultou em {r}, fora da vista de quem passava.",
        "Em {r}, {a} encontrou um canto para não chamar atenção.",
        "{a} desapareceu entre as sombras de {r}."
      ],
      "failTexts": []
    },
    {
      "id": "trap",
      "category": "exploration",
      "name": "Armadilha",
      "weight": 4,
      "handler": "trap",
      "texts": [
        "{a} preparou uma cilada na passagem de {r}.",
        "Os materiais guardados viraram uma armadilha nas mãos de {a}.",
        "{a} escondeu uma armadilha no caminho de {r}."
      ],
      "failTexts": []
    },
    {
      "id": "steal",
      "category": "relations",
      "name": "Furto",
      "weight": 5,
      "handler": "steal",
      "texts": [
        "{a} tentou pegar uma provisão de {b} sem ser percebido.",
        "Ao se aproximar de {b}, {a} procurou uma brecha para furtar seus recursos.",
        "Em {r}, {a} se arriscou junto aos pertences de {b}."
      ],
      "failTexts": []
    },
    {
      "id": "persuade",
      "category": "relations",
      "name": "Persuasão",
      "weight": 5,
      "handler": "persuade",
      "texts": [
        "{a} tentou convencer {b} a cooperar em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "intimidate",
      "category": "relations",
      "name": "Intimidação",
      "weight": 4,
      "handler": "intimidate",
      "texts": [
        "{a} pressionou {b} em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "poison",
      "category": "conflict",
      "name": "Envenenamento",
      "weight": 3,
      "handler": "poison",
      "texts": [
        "{a} tentou contaminar os suprimentos de {b} em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "sabotage",
      "category": "conflict",
      "name": "Sabotagem",
      "weight": 3,
      "handler": "sabotage",
      "texts": [
        "{a} tentou sabotar o equipamento de {b} em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "gather",
      "category": "survival",
      "name": "Recursos naturais",
      "weight": 8,
      "handler": "gather",
      "texts": [
        "{a} aproveitou as fontes de recursos em {r}.",
        "Em {r}, {a} encontrou uma oportunidade de se abastecer.",
        "{a} dedicou algum tempo aos recursos naturais de {r}."
      ],
      "failTexts": []
    },
    {
      "id": "rescue",
      "category": "relations",
      "name": "Resgate",
      "weight": 3,
      "handler": "rescue",
      "texts": [
        "{a} se ajoelhou ao lado de {b} para tratar seus ferimentos.",
        "Com os curativos que guardava, {a} socorreu {b}.",
        "{a} interrompeu os próprios planos para cuidar de {b}."
      ],
      "failTexts": []
    },
    {
      "id": "duel",
      "category": "conflict",
      "name": "Duelo",
      "weight": 8,
      "handler": "duel",
      "texts": [
        "{a} desafiou {b} para um duelo em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "incident",
      "category": "story",
      "name": "Acontecimento inesperado",
      "weight": 9,
      "handler": "incident",
      "texts": [
        "Algo interrompeu o caminho de {a} em {r}.",
        "A arena reservava uma surpresa para {a} em {r}.",
        "Entre uma busca e outra, {a} viveu um imprevisto em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "explore",
      "category": "survival",
      "name": "Expedição por recursos",
      "weight": 7,
      "handler": "explore",
      "texts": [
        "{a} deixou {from} em busca de provisões; a trilha levou até {r}.",
        "Seguindo outra trilha, {a} cruzou de {from} para {r}.",
        "{a} procurou novas oportunidades pelo caminho de {from} a {r}.",
        "A busca por outro canto da arena levou {a} de {from} até {r}."
      ],
      "failTexts": []
    },
    {
      "id": "areaattack",
      "category": "conflict",
      "name": "Ataque em área",
      "weight": 12,
      "handler": "areaattack",
      "texts": [
        "{a} utilizou {item} em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "boost",
      "category": "survival",
      "name": "Adrenalina",
      "weight": 4,
      "handler": "boost",
      "texts": [
        "{a} aplicou adrenalina e ganhou reflexos temporários."
      ],
      "failTexts": []
    },
    {
      "id": "antidote",
      "category": "survival",
      "name": "Neutralizar toxina",
      "weight": 6,
      "handler": "antidote",
      "texts": [
        "{a} usou um antídoto em {r}."
      ],
      "failTexts": []
    },
    {
      "id": "salvage",
      "category": "exploration",
      "weight": 4,
      "name": "salvage",
      "handler": "salvage",
      "texts": [
        "{a} recolheu materiais aproveitáveis em {r}.",
        "Em {r}, {a} separou o que ainda poderia servir."
      ],
      "failTexts": []
    },
    {
      "id": "craft",
      "category": "exploration",
      "weight": 5,
      "name": "craft",
      "handler": "craft",
      "texts": [
        "Com os materiais encontrados, {a} fabricou {item}.",
        "{a} improvisou {item} com o que havia recolhido."
      ],
      "failTexts": []
    },
    {
      "id": "fish",
      "category": "exploration",
      "weight": 4,
      "name": "fish",
      "handler": "fish",
      "texts": [
        "A paciência de {a} à margem de {r} rendeu alimento.",
        "{a} conseguiu pescar e guardou a comida para depois."
      ],
      "failTexts": [
        "{a} tentou pescar em {r}, mas não conseguiu alimento."
      ]
    },
    {
      "id": "shelter",
      "category": "survival",
      "weight": 4,
      "name": "shelter",
      "handler": "shelter",
      "texts": [
        "{a} se acomodou no abrigo de {r} e recuperou forças.",
        "Um esconderijo de {r} ofereceu a {a} descanso e proteção."
      ],
      "failTexts": []
    },
    {
      "id": "trade",
      "category": "relations",
      "weight": 3,
      "name": "trade",
      "handler": "trade",
      "texts": [
        "{a} trocou {offered} por {item} com {b}.",
        "{a} e {b} chegaram a um acordo: {offered} em troca de {item}."
      ],
      "failTexts": [
        "{b} recusou a troca proposta por {a}."
      ]
    },
    {
      "id": "flee",
      "category": "movement",
      "weight": 3,
      "name": "flee",
      "handler": "flee",
      "texts": [
        "{a} abandonou o confronto e seguiu de {from} até {r}.",
        "{a} encontrou uma saída de {from} e alcançou {r}."
      ],
      "failTexts": []
    }
  ],
  "types": [
    {
      "id": "tv",
      "label": "TV Show"
    },
    {
      "id": "movies",
      "label": "Filmes"
    },
    {
      "id": "anime",
      "label": "Anime / mangá"
    },
    {
      "id": "games",
      "label": "Videogames"
    },
    {
      "id": "cartoon",
      "label": "Desenhos"
    },
    {
      "id": "comics",
      "label": "Quadrinhos"
    },
    {
      "id": "br",
      "label": "Cultura brasileira"
    },
    {
      "id": "folklore",
      "label": "Folclore"
    }
  ]
});
