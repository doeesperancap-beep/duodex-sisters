// ============ CONFIGURAÇÃO ============
const NOME_JOGO = 'Duodex Sisters';
const SITE_URL = 'https://doeesperancap-beep.github.io/duodex-sisters/';

// ============ TIPOS ============
const TIPOS = {
  normal:   { nome: 'Normal', cor: '#d8c7aa' },
  fogo:     { nome: 'Fogo', cor: '#f4a27a' },
  agua:     { nome: 'Água', cor: '#8cc4ea' },
  planta:   { nome: 'Planta', cor: '#a3d584' },
  eletrico: { nome: 'Elétrico', cor: '#f7e07a' },
  pedra:    { nome: 'Pedra', cor: '#c4ad83' },
  gelo:     { nome: 'Gelo', cor: '#a9e5ed' },
  sombrio:  { nome: 'Sombrio', cor: '#9480ad' },
  terra:    { nome: 'Terra', cor: '#d3b17b' },
  voador:   { nome: 'Voador', cor: '#b7c7ee' },
  psiquico: { nome: 'Psíquico', cor: '#e5a4cb' },
  lutador:  { nome: 'Lutador', cor: '#d58a79' },
  metal:    { nome: 'Aço', cor: '#b8c3cc' },
  fada:     { nome: 'Fada', cor: '#edb5dc' },
  inseto:   { nome: 'Inseto', cor: '#b4c66e' },
  dragao:   { nome: 'Dragão', cor: '#9a8bd6' },
  fantasma: { nome: 'Fantasma', cor: '#a18bc4' },
  venenoso: { nome: 'Veneno', cor: '#bd91c8' }
};

// ============ VANTAGENS E FRAQUEZAS ============
// EFETIVIDADE[ataque][defensor] = multiplicador.
const EFETIVIDADE = {
  fogo: {
    planta: 2, gelo: 2, inseto: 2, metal: 2,
    agua: 0.5, fogo: 0.5, pedra: 0.5, dragao: 0.5
  },

  agua: {
    fogo: 2, terra: 2, pedra: 2,
    agua: 0.5, planta: 0.5, dragao: 0.5
  },

  planta: {
    agua: 2, terra: 2, pedra: 2,
    fogo: 0.5, planta: 0.5, venenoso: 0.5,
    voador: 0.5, inseto: 0.5, dragao: 0.5, metal: 0.5
  },

  eletrico: {
    agua: 2, voador: 2,
    eletrico: 0.5, planta: 0.5, dragao: 0.5, terra: 0
  },

  pedra: {
    fogo: 2, gelo: 2, voador: 2, inseto: 2,
    lutador: 0.5, terra: 0.5, metal: 0.5
  },

  gelo: {
    planta: 2, terra: 2, voador: 2, dragao: 2,
    fogo: 0.5, agua: 0.5, gelo: 0.5, metal: 0.5
  },

  sombrio: {
    psiquico: 2, fantasma: 2,
    lutador: 0.5, sombrio: 0.5, fada: 0.5
  },

  terra: {
    fogo: 2, eletrico: 2, venenoso: 2,
    pedra: 2, metal: 2,
    planta: 0.5, inseto: 0.5, voador: 0
  },

  voador: {
    planta: 2, lutador: 2, inseto: 2,
    eletrico: 0.5, pedra: 0.5, metal: 0.5
  },

  psiquico: {
    lutador: 2, venenoso: 2,
    psiquico: 0.5, metal: 0.5, sombrio: 0
  },

  normal: {
    pedra: 0.5, metal: 0.5, fantasma: 0
  }
};

// ============ STATUS ============
const ESTATUS = {
  queimado: {
    nome: 'Queimado',
    sigla: 'QUE'
  },

  paralisado: {
    nome: 'Paralisado',
    sigla: 'PAR'
  }
};

// ============ ATAQUES ============
const GOLPES = {

  // Normais
  investida: {
    nome: 'Investida',
    tipo: 'normal',
    poder: 40,
    prec: 100,
    classe: 'comum'
  },

  arranhao: {
    nome: 'Arranhão',
    tipo: 'normal',
    poder: 35,
    prec: 100,
    classe: 'comum'
  },

  // Pedra
  arremesso_pedra: {
    nome: 'Arremesso de Pedra',
    tipo: 'pedra',
    poder: 45,
    prec: 100,
    classe: 'comum'
  },

  tumulo_pedra: {
    nome: 'Túmulo de Pedra',
    tipo: 'pedra',
    poder: 80,
    prec: 90,
    classe: 'maximo'
  },

  // Sombrio
  mordida: {
    nome: 'Mordida',
    tipo: 'sombrio',
    poder: 40,
    prec: 100,
    classe: 'comum'
  },

  triturar: {
    nome: 'Triturar',
    tipo: 'sombrio',
    poder: 75,
    prec: 95,
    classe: 'maximo'
  },

  pulso_sombrio: {
    nome: 'Pulso Sombrio',
    tipo: 'sombrio',
    poder: 75,
    prec: 95,
    classe: 'maximo'
  },

  escavacao: {
    nome: 'Escavação',
    tipo: 'terra',
    poder: 75,
    prec: 95,
    classe: 'maximo'
  },

  // Gelo
  neve_po: {
    nome: 'Pó de Neve',
    tipo: 'gelo',
    poder: 40,
    prec: 100,
    classe: 'comum'
  },

  raio_gelo: {
    nome: 'Raio de Gelo',
    tipo: 'gelo',
    poder: 80,
    prec: 95,
    classe: 'maximo'
  },

  bola_clima: {
    nome: 'Bola Climática',
    tipo: 'gelo',
    poder: 65,
    prec: 100,
    classe: 'maximo'
  },

  // Elétrico
  choque_trovao: {
    nome: 'Choque do Trovão',
    tipo: 'eletrico',
    poder: 45,
    prec: 100,
    classe: 'comum',
    status: {
      id: 'paralisado',
      chance: 0.15
    }
  },

  cauda_ferro: {
    nome: 'Cauda de Ferro',
    tipo: 'metal',
    poder: 45,
    prec: 95,
    classe: 'comum'
  },

  raio: {
    nome: 'Raio',
    tipo: 'eletrico',
    poder: 80,
    prec: 90,
    classe: 'maximo',
    status: {
      id: 'paralisado',
      chance: 0.25
    }
  },

  investida_trovao: {
    nome: 'Investida Elétrica',
    tipo: 'eletrico',
    poder: 85,
    prec: 90,
    classe: 'maximo',
    status: {
      id: 'paralisado',
      chance: 0.2
    }
  },

  // Água
  jato_agua: {
    nome: "Jato d'água",
    tipo: 'agua',
    poder: 40,
    prec: 100,
    classe: 'comum'
  },

  cauda_aqua: {
    nome: "Cauda d'Água",
    tipo: 'agua',
    poder: 70,
    prec: 95,
    classe: 'maximo'
  },

  hidro_jato: {
    nome: 'Hidro Jato',
    tipo: 'agua',
    poder: 75,
    prec: 95,
    classe: 'maximo'
  },

  // Psíquico
  confusao: {
    nome: 'Confusão',
    tipo: 'psiquico',
    poder: 45,
    prec: 100,
    classe: 'comum'
  },

  psicorrayo: {
    nome: 'Raio Psíquico',
    tipo: 'psiquico',
    poder: 75,
    prec: 95,
    classe: 'maximo'
  },

  golpe_cruzado: {
    nome: 'Golpe Cruzado',
    tipo: 'lutador',
    poder: 75,
    prec: 90,
    classe: 'maximo'
  },

  // Antigos
  brasa: {
    nome: 'Brasa',
    tipo: 'fogo',
    poder: 40,
    prec: 100,
    classe: 'comum',
    status: { id: 'queimado', chance: 0.2 }
  },

  lanca_chamas: {
    nome: 'Lança-chamas',
    tipo: 'fogo',
    poder: 70,
    prec: 95,
    classe: 'maximo',
    status: { id: 'queimado', chance: 0.3 }
  },

  chicote_cipo: {
    nome: 'Chicote de Cipó',
    tipo: 'planta',
    poder: 45,
    prec: 100,
    classe: 'comum'
  },

  folha_lamina: {
    nome: 'Folha Lâmina',
    tipo: 'planta',
    poder: 45,
    prec: 100,
    classe: 'comum'
  },

  folhada: {
    nome: 'Folhada',
    tipo: 'planta',
    poder: 70,
    prec: 95,
    classe: 'maximo'
  },

  choque: {
    nome: 'Choque',
    tipo: 'eletrico',
    poder: 40,
    prec: 100,
    classe: 'comum',
    status: { id: 'paralisado', chance: 0.2 }
  },

  trovao: {
    nome: 'Trovão',
    tipo: 'eletrico',
    poder: 70,
    prec: 90,
    classe: 'maximo',
    status: { id: 'paralisado', chance: 0.3 }
  }
};

// ============ ESPÉCIES ============
const ESPECIES = {

  rockruff: {
    nome: 'Rockruff',
    tipo: 'pedra',

    descricao: 'Um Pokémon filhote atento e corajoso. Gosta de explorar e cria laços fortes com quem cuida dele.',

    base: {
      hp: 50,
      atk: 65,
      def: 40,
      vel: 60
    },

    altura: [0.4, 0.6],
    peso: [7.5, 10.8],
    generoFemea: 0.5,

    ataques: {
      comum: [
        'investida',
        'arremesso_pedra',
        'mordida'
      ],

      maximo: [
        'tumulo_pedra',
        'triturar',
        'escavacao'
      ]
    },

    golpes: [
      ['investida', 1],
      ['arremesso_pedra', 3],
      ['mordida', 6],
      ['tumulo_pedra', 12]
    ],

    evolui: null
  },

  vulpix_alola: {
    nome: 'Vulpix de Alola',
    tipo: 'gelo',

    descricao: 'Um Pokémon elegante que vive em regiões geladas. Seu pelo claro ajuda a se camuflar na neve.',

    base: {
      hp: 45,
      atk: 50,
      def: 65,
      vel: 65
    },

    altura: [0.5, 0.7],
    peso: [8.0, 11.5],
    generoFemea: 0.75,

    ataques: {
      comum: [
        'neve_po',
        'investida',
        'confusao'
      ],

      maximo: [
        'raio_gelo',
        'bola_clima',
        'pulso_sombrio'
      ]
    },

    golpes: [
      ['investida', 1],
      ['neve_po', 3],
      ['confusao', 6],
      ['raio_gelo', 12]
    ],

    evolui: null
  },

  pikachu: {
    nome: 'Pikachu',
    tipo: 'eletrico',

    descricao: 'Um Pokémon energético que armazena eletricidade nas bochechas e libera descargas quando necessário.',

    base: {
      hp: 45,
      atk: 55,
      def: 40,
      vel: 90
    },

    altura: [0.3, 0.5],
    peso: [4.5, 7.5],
    generoFemea: 0.5,

    spriteFemea: 'pikachu-femea',
    diferencaGenero: 'A fêmea possui a ponta da cauda em formato de coração.',

    ataques: {
      comum: [
        'choque_trovao',
        'investida',
        'cauda_ferro'
      ],

      maximo: [
        'raio',
        'investida_trovao',
        'pulso_sombrio'
      ]
    },

    golpes: [
      ['investida', 1],
      ['choque_trovao', 3],
      ['cauda_ferro', 6],
      ['raio', 12]
    ],

    evolui: null
  },

  psyduck: {
    nome: 'Psyduck',
    tipo: 'agua',

    descricao: 'Um Pokémon tranquilo e distraído. Quando se concentra, consegue liberar poderes psíquicos inesperados.',

    base: {
      hp: 60,
      atk: 52,
      def: 48,
      vel: 55
    },

    altura: [0.7, 0.9],
    peso: [16.0, 23.0],
    generoFemea: 0.5,

    ataques: {
      comum: [
        'jato_agua',
        'confusao',
        'arranhao'
      ],

      maximo: [
        'cauda_aqua',
        'psicorrayo',
        'golpe_cruzado'
      ]
    },

    golpes: [
      ['arranhao', 1],
      ['jato_agua', 3],
      ['confusao', 6],
      ['cauda_aqua', 12]
    ],

    evolui: null
  },

  // ============ ESPÉCIES ANTIGAS ============
  // Mantidas para não quebrar coleções anteriores.

  brasinha: {
    nome: 'Brasinha',
    tipo: 'fogo',
    base: { hp: 40, atk: 52, def: 43, vel: 65 },
    golpes: [
      ['investida', 1],
      ['brasa', 3],
      ['arranhao', 6],
      ['lanca_chamas', 12]
    ],
    evolui: {
      para: 'chamador',
      nivel: 10,
      amizade: 50,
      item: null
    }
  },

  chamador: {
    nome: 'Chamador',
    tipo: 'fogo',
    base: { hp: 62, atk: 75, def: 62, vel: 78 },
    golpes: [
      ['investida', 1],
      ['brasa', 1],
      ['arranhao', 1],
      ['lanca_chamas', 1]
    ],
    evolui: null
  },

  gotinha: {
    nome: 'Gotinha',
    tipo: 'agua',
    base: { hp: 44, atk: 48, def: 65, vel: 43 },
    golpes: [
      ['investida', 1],
      ['jato_agua', 3],
      ['arranhao', 6],
      ['hidro_jato', 12]
    ],
    evolui: {
      para: 'ondaral',
      nivel: 10,
      amizade: 50,
      item: null
    }
  },

  ondaral: {
    nome: 'Ondaral',
    tipo: 'agua',
    base: { hp: 64, atk: 70, def: 80, vel: 60 },
    golpes: [
      ['investida', 1],
      ['jato_agua', 1],
      ['arranhao', 1],
      ['hidro_jato', 1]
    ],
    evolui: null
  },

  folhinha: {
    nome: 'Folhinha',
    tipo: 'planta',
    base: { hp: 45, atk: 49, def: 49, vel: 45 },
    golpes: [
      ['investida', 1],
      ['chicote_cipo', 3],
      ['folha_lamina', 6],
      ['folhada', 12]
    ],
    evolui: {
      para: 'florao',
      nivel: 12,
      amizade: 40,
      item: 'pedra_sol'
    }
  },

  florao: {
    nome: 'Florão',
    tipo: 'planta',
    base: { hp: 70, atk: 80, def: 80, vel: 60 },
    golpes: [
      ['investida', 1],
      ['chicote_cipo', 1],
      ['folha_lamina', 1],
      ['folhada', 1]
    ],
    evolui: null
  },

  fagulha: {
    nome: 'Fagulha',
    tipo: 'eletrico',
    base: { hp: 35, atk: 55, def: 40, vel: 90 },
    golpes: [
      ['investida', 1],
      ['choque', 3],
      ['arranhao', 6],
      ['trovao', 14]
    ],
    evolui: null
  }
};

// ============ ITENS ============
const ITENS = {
  pedra_sol: {
    nome: 'Pedra do Sol',
    efeito: null
  },

  superdoce: {
    nome: 'Superdoce',
    efeito: 'nivel'
  }
};

// ============ CARTAS IMPRESSAS ============
const CARTAS = {
  'P1-0001': { tipo: 'pokemon', especie: 'brasinha' },
  'P1-0002': { tipo: 'pokemon', especie: 'gotinha' },
  'P2-0001': { tipo: 'pokemon', especie: 'folhinha' },
  'P2-0002': { tipo: 'pokemon', especie: 'fagulha' },
  'P1-0003': { tipo: 'pokemon', especie: 'rockruff' },
  'P1-0004': { tipo: 'pokemon', especie: 'vulpix_alola' },
  'P2-0003': { tipo: 'pokemon', especie: 'pikachu' },
  'P2-0004': { tipo: 'pokemon', especie: 'psyduck' },

  'I-0001': { tipo: 'item', item: 'pedra_sol' },
  'I-0002': { tipo: 'item', item: 'superdoce' }
};
