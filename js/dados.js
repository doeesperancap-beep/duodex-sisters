// ============ CONFIGURAÇÃO ============
const NOME_JOGO = 'Cartinhas Pixel';
// Endereço do seu site no GitHub Pages (termina com /). Usado no QR das cartas.
const SITE_URL = 'https://doeesperancap-beep.github.io/duodex-sisters/';

// ============ TIPOS ============
const TIPOS = {
  normal:  { nome: 'Normal',   cor: '#d8c7aa' },
  fogo:    { nome: 'Fogo',     cor: '#f4a27a' },
  agua:    { nome: 'Água',     cor: '#8cc4ea' },
  planta:  { nome: 'Planta',   cor: '#a3d584' },
  eletrico:{ nome: 'Elétrico', cor: '#f7e07a' }
};
// EFETIVIDADE[tipo do golpe][tipo do alvo] = multiplicador (se não existir, vale 1)
const EFETIVIDADE = {
  fogo:    { planta: 2, agua: 0.5, fogo: 0.5 },
  agua:    { fogo: 2, planta: 0.5, agua: 0.5 },
  planta:  { agua: 2, fogo: 0.5, planta: 0.5 },
  eletrico:{ agua: 2, planta: 0.5, eletrico: 0.5 }
};

// ============ STATUS ============
const ESTATUS = {
  queimado:  { nome: 'Queimado',  sigla: 'QUE' },
  paralisado:{ nome: 'Paralisado',sigla: 'PAR' }
};

// ============ GOLPES ============
const GOLPES = {
  investida:    { nome: 'Investida',     tipo: 'normal', poder: 40, prec: 100 },
  arranhao:     { nome: 'Arranhão',      tipo: 'normal', poder: 40, prec: 100 },
  brasa:        { nome: 'Brasa',         tipo: 'fogo',   poder: 40, prec: 100, status: { id: 'queimado', chance: 0.2 } },
  lanca_chamas: { nome: 'Lança-chamas',  tipo: 'fogo',   poder: 70, prec: 95,  status: { id: 'queimado', chance: 0.3 } },
  jato_agua:    { nome: 'Jato d\'água',  tipo: 'agua',   poder: 40, prec: 100 },
  hidro_jato:   { nome: 'Hidro jato',    tipo: 'agua',   poder: 70, prec: 95 },
  chicote_cipo: { nome: 'Chicote de cipó',tipo:'planta', poder: 45, prec: 100 },
  folha_lamina: { nome: 'Folha lâmina',  tipo: 'planta', poder: 45, prec: 100 },
  folhada:      { nome: 'Folhada',       tipo: 'planta', poder: 70, prec: 95 },
  choque:       { nome: 'Choque',        tipo: 'eletrico',poder: 40, prec: 100, status: { id: 'paralisado', chance: 0.2 } },
  trovao:       { nome: 'Trovão',        tipo: 'eletrico',poder: 70, prec: 90,  status: { id: 'paralisado', chance: 0.3 } }
};

// ============ ESPÉCIES ============
// A CHAVE (ex.: brasinha) é o nome do arquivo do sprite: img/pokemon/brasinha.png
// golpes: [id do golpe, nível em que aprende]   (usa os 4 últimos aprendidos)
// evolui: { para: chave da espécie, nivel, amizade, item: chave do item ou null }
// TROQUE estes exemplos pelos seus Pokémon.
const ESPECIES = {
  brasinha: { nome: 'Brasinha', tipo: 'fogo', base: { hp: 40, atk: 52, def: 43, vel: 65 },
    golpes: [['investida',1],['brasa',3],['arranhao',6],['lanca_chamas',12]],
    evolui: { para: 'chamador', nivel: 10, amizade: 50, item: null } },
  chamador: { nome: 'Chamador', tipo: 'fogo', base: { hp: 62, atk: 75, def: 62, vel: 78 },
    golpes: [['investida',1],['brasa',1],['arranhao',1],['lanca_chamas',1]], evolui: null },

  gotinha: { nome: 'Gotinha', tipo: 'agua', base: { hp: 44, atk: 48, def: 65, vel: 43 },
    golpes: [['investida',1],['jato_agua',3],['arranhao',6],['hidro_jato',12]],
    evolui: { para: 'ondaral', nivel: 10, amizade: 50, item: null } },
  ondaral: { nome: 'Ondaral', tipo: 'agua', base: { hp: 64, atk: 70, def: 80, vel: 60 },
    golpes: [['investida',1],['jato_agua',1],['arranhao',1],['hidro_jato',1]], evolui: null },

  folhinha: { nome: 'Folhinha', tipo: 'planta', base: { hp: 45, atk: 49, def: 49, vel: 45 },
    golpes: [['investida',1],['chicote_cipo',3],['folha_lamina',6],['folhada',12]],
    evolui: { para: 'florao', nivel: 12, amizade: 40, item: 'pedra_sol' } },
  florao: { nome: 'Florão', tipo: 'planta', base: { hp: 70, atk: 80, def: 80, vel: 60 },
    golpes: [['investida',1],['chicote_cipo',1],['folha_lamina',1],['folhada',1]], evolui: null },

  fagulha: { nome: 'Fagulha', tipo: 'eletrico', base: { hp: 35, atk: 55, def: 40, vel: 90 },
    golpes: [['investida',1],['choque',3],['arranhao',6],['trovao',14]], evolui: null }
};

// ============ ITENS ============
// efeito: 'nivel' = sobe 1 nível ao usar. Itens de evolução não têm efeito direto.
const ITENS = {
  pedra_sol: { nome: 'Pedra do Sol', efeito: null },
  superdoce: { nome: 'Superdoce',    efeito: 'nivel' }
};

// ============ CARTAS IMPRESSAS ============
// A admin gera estas linhas em admin.html. Cole aqui as novas.
// Quando evoluir e você reimprimir a frente, troque a espécie aqui também
// (assim o aviso de "carta desatualizada" some).
const CARTAS = {
  'P1-0001': { tipo: 'pokemon', especie: 'brasinha' },
  'P1-0002': { tipo: 'pokemon', especie: 'gotinha' },
  'P2-0001': { tipo: 'pokemon', especie: 'folhinha' },
  'P2-0002': { tipo: 'pokemon', especie: 'fagulha' },
  'I-0001':  { tipo: 'item', item: 'pedra_sol' },
  'I-0002':  { tipo: 'item', item: 'superdoce' }
};
