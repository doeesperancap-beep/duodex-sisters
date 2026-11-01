'use strict';
const CHAVE = 'cartinhas_v1';
const PISO = 30, MAXLV = 50, CD = 20000;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));

// ============ ESTADO ============
function novoEstado() {
  const j = (n, cor) => ({ id: n, nome: 'Treinador ' + (n + 1), pin: '', cor, parceiro: null, cartas: {}, itens: {}, v: 0, d: 0 });
  return { j: [j(0, 'rosa'), j(1, 'azul')], reg: {}, config: { virar: false }, setup: false };
}
function carregar() {
  try { const r = localStorage.getItem(CHAVE); if (r) { const o = JSON.parse(r); o.reg = o.reg || {}; o.config = o.config || { virar: false }; return o; } } catch (e) {}
  return novoEstado();
}
let S = carregar();
let tela = { nome: 'home' };
let B = null;           // batalha
let T = { a: null, b: null }; // troca
let saveT;
function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {}
  clearTimeout(saveT); saveT = setTimeout(() => Nuvem.enviar(true), 2500);
}

// ============ NUVEM (opcional) ============
const Nuvem = {
  ativa() { return typeof firebase !== 'undefined' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey; },
  sala() { return localStorage.getItem('cartinhas_sala') || ''; },
  db() { if (!this._db) { firebase.initializeApp(window.FIREBASE_CONFIG); this._db = firebase.firestore(); } return this._db; },
  async enviar(quieto) {
    if (!this.ativa() || !this.sala()) return;
    try { await this.db().collection('jogos').doc(this.sala()).set({ estado: JSON.stringify(S), em: Date.now() }); if (!quieto) toast('Enviado para a nuvem!'); }
    catch (e) { if (!quieto) toast('Erro na nuvem: ' + e.message); }
  },
  async baixar() {
    if (!this.ativa() || !this.sala()) return toast('Defina o nome da sala.');
    try {
      const d = await this.db().collection('jogos').doc(this.sala()).get();
      if (!d.exists) return toast('Sala não encontrada.');
      S = JSON.parse(d.data().estado); S.reg = S.reg || {};
      try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {}
      toast('Dados baixados!'); go('home');
    } catch (e) { toast('Erro na nuvem: ' + e.message); }
  }
};
function salaSalvar() { const v = ($('#sala').value || '').replace(/[^\w-]/g, ''); localStorage.setItem('cartinhas_sala', v); $('#sala').value = v; }

// ============ AUXILIARES ============
const esp = p => ESPECIES[p.especie];
const maxHp = p => Math.floor(esp(p).base.hp * 0.8 + p.nivel * 2 + 10);
const stat = (p, k) => Math.floor(esp(p).base[k] + p.nivel * 2);
const xpNeed = n => n * 20;
function achar(code) { for (const j of S.j) if (j.cartas[code]) return { j, p: j.cartas[code] }; return null; }
function golpesDe(p) { return esp(p).golpes.filter(g => g[1] <= p.nivel).map(g => g[0]).slice(-4); }
function addHist(p, txt) { p.hist.push({ t: Date.now(), txt }); if (p.hist.length > 30) p.hist.shift(); }
function novoPoke(code, c) {
  return { code, especie: c.especie, nivel: c.nivel || 5, xp: 0, fome: 70, feliz: 60, energia: 100, amizade: 20, t: Date.now(), cd: {}, hist: [{ t: Date.now(), txt: 'Registrado' }] };
}
function tick(p) {
  const h = (Date.now() - p.t) / 3600000; if (h <= 0) return;
  p.fome = Math.max(Math.min(p.fome, PISO), p.fome - 3 * h);
  p.feliz = Math.max(Math.min(p.feliz, PISO), p.feliz - 2 * h);
  p.energia = clamp(p.energia + 6 * h);
  p.t = Date.now();
}
function tickAll() { S.j.forEach(j => Object.values(j.cartas).forEach(tick)); }
function ganharXp(p, n) {
  let up = 0; p.xp += n;
  while (p.nivel < MAXLV && p.xp >= xpNeed(p.nivel)) { p.xp -= xpNeed(p.nivel); p.nivel++; up++; }
  if (p.nivel >= MAXLV) p.xp = 0;
  if (up) addHist(p, 'Subiu para o nível ' + p.nivel);
  return up;
}
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2600); }
function modal(h) { $('#modal').innerHTML = `<div class="box mbox">${h}</div>`; $('#modal').classList.add('on'); }
function fechar() { $('#modal').classList.remove('on'); $('#modal').innerHTML = ''; }
const sprite = (e, t = 'g') => `<div class="spr ${t}"><img src="img/pokemon/${e}.png" alt="" onerror="semImg(this,'${e}')"></div>`;
function semImg(img, e) { const d = document.createElement('div'); d.className = 'ph'; d.textContent = (ESPECIES[e] ? ESPECIES[e].nome : '?').slice(0, 3).toUpperCase(); img.replaceWith(d); }
const topo = t => `<div class="topo"><button class="btn peq" onclick="go('home')">&lt; Início</button><h2>${t}</h2></div>`;
const bar = (l, v, c) => `<div class="bl"><span>${l}</span><div class="bar ${c}"><i style="width:${clamp(v)}%"></i></div><b>${Math.round(v)}</b></div>`;

// ============ NAVEGAÇÃO ============
function go(nome, extra) { tela = Object.assign({ nome }, extra || {}); render(); window.scrollTo(0, 0); }
function render() {
  const f = { home: rHome, perfil: rPerfil, colecao: rColecao, cuidar: rCuidar, registrar: rRegistrar, troca: rTroca, batalha: rBatalha, ajustes: rAjustes }[tela.nome];
  $('#app').innerHTML = f();
}

// ============ HOME ============
function painel(j) {
  const par = j.cartas[j.parceiro]; const n = Object.keys(j.cartas).length;
  return `<div class="box ${j.cor} centro"><h2>${esc(j.nome)}</h2><small>Vitórias ${j.v} · Derrotas ${j.d}</small>
  ${par ? sprite(par.especie, 'g') + `<div><b>${esp(par).nome}</b> Nv.${par.nivel}</div>` : '<div class="vazio">Sem parceiro ainda.<br>Registre uma carta!</div>'}
  <div class="row centro">
    <button class="btn" ${par ? '' : 'disabled'} onclick="go('cuidar',{c:'${j.parceiro}'})">Cuidar</button>
    <button class="btn" onclick="go('colecao',{j:${j.id}})">Coleção (${n})</button>
    <button class="btn peq" onclick="go('perfil',{j:${j.id}})">Perfil</button>
  </div></div>`;
}
function rHome() {
  return `<h1 class="titulo">${NOME_JOGO}</h1><div class="duo">${S.j.map(painel).join('')}</div>
  <div class="row centro">
    <button class="btn verde grande" onclick="batalhaIniciar()">Batalha</button>
    <button class="btn grande" onclick="go('registrar')">Registrar carta</button>
    <button class="btn grande" onclick="T={a:null,b:null};go('troca')">Troca</button>
    <button class="btn grande" onclick="go('ajustes')">Ajustes</button>
  </div>`;
}

// ============ PERFIL ============
function rPerfil() {
  const j = S.j[tela.j];
  return `${tela.primeiro ? '' : topo('Perfil')}<div class="box ${j.cor}"><h2>${tela.primeiro ? 'Bem-vindo! Jogador ' + (j.id + 1) : 'Perfil'}</h2>
  <label>Nome de treinador</label><input id="pn" maxlength="14" value="${esc(j.nome)}">
  <label>Senha de troca (4 números)</label><input id="pp" type="password" inputmode="numeric" maxlength="4" value="${esc(j.pin)}">
  <p><small>A senha é pedida para confirmar trocas de Pokémon.</small></p>
  <button class="btn verde" onclick="salvarPerfil(${j.id})">Salvar</button></div>`;
}
function salvarPerfil(i) {
  const n = $('#pn').value.trim(), p = $('#pp').value.trim();
  if (!n) return toast('Digite um nome.');
  if (p && !/^\d{4}$/.test(p)) return toast('A senha precisa ter 4 números.');
  S.j[i].nome = n; S.j[i].pin = p;
  if (tela.primeiro && i === 0) { salvar(); return go('perfil', { j: 1, primeiro: true }); }
  S.setup = true; salvar(); go('home');
}

// ============ COLEÇÃO ============
function rColecao() {
  const i = tela.j ?? 0, j = S.j[i];
  const abas = S.j.map(x => `<button class="btn ${x.cor} ${x.id === i ? 'on' : ''}" onclick="go('colecao',{j:${x.id}})">${esc(x.nome)}</button>`).join('');
  const cs = Object.values(j.cartas).map(p => `<div class="mini" onclick="go('cuidar',{c:'${p.code}'})">${sprite(p.especie, 'p')}<b>${esp(p).nome}</b><small>Nv.${p.nivel}${j.parceiro === p.code ? ' *' : ''}</small><small>${p.code}</small></div>`).join('') || '<p>Nenhum Pokémon ainda.</p>';
  const it = Object.entries(j.itens).filter(([, n]) => n > 0).map(([k, n]) => `<span class="tag">${ITENS[k].nome} x${n}</span>`).join(' ') || '<small>nenhum item</small>';
  return `${topo('Coleção')}<div class="row">${abas}</div><div class="grid">${cs}</div><div class="box"><h3>Itens</h3>${it}</div><small>* = parceiro</small>`;
}

// ============ CUIDADO ============
const ACOES = {
  alimentar: { nome: 'Alimentar', msg: 'Nham nham!', ok: p => p.fome < 95, motivo: 'Já está cheio!',
    fx: p => { p.fome = clamp(p.fome + 25); p.feliz = clamp(p.feliz + 3); p.amizade = clamp(p.amizade + 1); return 2; } },
  brincar: { nome: 'Brincar', msg: 'Que divertido!', ok: p => p.energia >= 15, motivo: 'Sem energia para brincar...',
    fx: p => { p.feliz = clamp(p.feliz + 20); p.energia = clamp(p.energia - 15); p.fome = clamp(p.fome - 5); p.amizade = clamp(p.amizade + 2); return 3; } },
  treinar: { nome: 'Treinar', msg: 'Treino concluído!', ok: p => p.energia >= 25 && p.fome >= 15, motivo: 'Muito cansado ou com fome para treinar.',
    fx: p => { p.energia = clamp(p.energia - 25); p.fome = clamp(p.fome - 8); p.feliz = clamp(p.feliz - 3); p.amizade = clamp(p.amizade + 1); return 15; } },
  descansar: { nome: 'Descansar', msg: 'Zzz... renovado!', ok: p => p.energia < 100, motivo: 'Já está com a energia cheia!',
    fx: p => { p.energia = clamp(p.energia + 35); p.fome = clamp(p.fome - 3); p.amizade = clamp(p.amizade + 1); return 1; } }
};
function falta(p, k) { return Math.ceil(((p.cd[k] || 0) + CD - Date.now()) / 1000); }
function btnAcao(p, k) { const f = falta(p, k); return `<button id="ac-${k}" class="btn" ${f > 0 ? 'disabled' : ''} onclick="agir('${p.code}','${k}')">${ACOES[k].nome}${f > 0 ? ` (${f})` : ''}</button>`; }
function agir(code, k) {
  const r = achar(code); if (!r) return; const p = r.p; tick(p);
  if (falta(p, k) > 0) return;
  const a = ACOES[k]; if (!a.ok(p)) return toast(a.motivo);
  const xp = a.fx(p); p.cd[k] = Date.now(); const up = ganharXp(p, xp);
  salvar(); toast(a.msg + (up ? ` Subiu para o nível ${p.nivel}!` : '')); render();
}
function podeEvoluir(j, p) {
  const e = esp(p).evolui; if (!e) return null;
  return { e, nivelOk: p.nivel >= e.nivel, amizadeOk: p.amizade >= e.amizade, itemOk: !e.item || (j.itens[e.item] || 0) > 0 };
}
function evoluir(code) {
  const r = achar(code); if (!r) return; const c = podeEvoluir(r.j, r.p);
  if (!c || !(c.nivelOk && c.amizadeOk && c.itemOk)) return;
  const antes = r.p.especie;
  if (c.e.item) r.j.itens[c.e.item]--;
  r.p.especie = c.e.para; addHist(r.p, `Evoluiu: ${ESPECIES[antes].nome} -> ${ESPECIES[c.e.para].nome}`);
  salvar(); render();
  modal(`<h2>Evolução!</h2>${sprite(r.p.especie, 'g')}<p>${ESPECIES[antes].nome} evoluiu para <b>${esp(r.p).nome}</b>!</p><p><small>O código <b>${code}</b> continua o mesmo. Peça para a admin imprimir a nova frente da carta.</small></p><button class="btn verde" onclick="fechar()">Uau!</button>`);
}
function usarItem(code, k) {
  const r = achar(code); if (!r || !(r.j.itens[k] > 0)) return;
  if (ITENS[k].efeito === 'nivel') { r.j.itens[k]--; ganharXp(r.p, xpNeed(r.p.nivel)); salvar(); toast('Subiu de nível!'); render(); }
}
function tornarParceiro(code) { const r = achar(code); r.j.parceiro = code; salvar(); toast('Agora é o parceiro!'); render(); }
function rCuidar() {
  const r = achar(tela.c); if (!r) return rHome();
  const { j, p } = r; tick(p); const e = esp(p); const c = CARTAS[p.code];
  const ev = podeEvoluir(j, p); let evh = '';
  if (ev) {
    const x = ev.e, pronto = ev.nivelOk && ev.amizadeOk && ev.itemOk;
    evh = `<div class="box"><h3>Evolução: ${ESPECIES[x.para].nome}</h3><p>${ev.nivelOk ? '[x]' : '[ ]'} Nível ${x.nivel} · ${ev.amizadeOk ? '[x]' : '[ ]'} Amizade ${x.amizade}${x.item ? ` · ${ev.itemOk ? '[x]' : '[ ]'} ${ITENS[x.item].nome}` : ''}</p>
    <button class="btn verde" ${pronto ? '' : 'disabled'} onclick="evoluir('${p.code}')">Evoluir!</button></div>`;
  }
  const itens = Object.entries(j.itens).filter(([k, n]) => n > 0 && ITENS[k].efeito).map(([k, n]) => `<button class="btn azul" onclick="usarItem('${p.code}','${k}')">Usar ${ITENS[k].nome} (${n})</button>`).join('');
  const velha = c && c.especie && c.especie !== p.especie ? `<div class="aviso">A carta física está desatualizada. Peça a nova frente (código ${p.code}).</div>` : '';
  const hist = p.hist.slice(-5).reverse().map(h => `<small>${new Date(h.t).toLocaleDateString('pt-BR')} - ${esc(h.txt)}</small>`).join('<br>');
  return `${topo('Cuidar')}${velha}
  <div class="duo"><div class="box centro">${sprite(p.especie, 'g')}<h2>${e.nome}</h2>
    <span class="tag" style="background:${TIPOS[e.tipo].cor}">${TIPOS[e.tipo].nome}</span> <span class="tag">Nv.${p.nivel}</span>
    <p><small>Dono: ${esc(j.nome)} · ${p.code}</small></p>
    <p>HP máx: <b>${maxHp(p)}</b> · ATK ${stat(p, 'atk')} · DEF ${stat(p, 'def')} · VEL ${stat(p, 'vel')}</p>
    ${j.parceiro === p.code ? '<span class="tag">Parceiro</span>' : `<button class="btn peq" onclick="tornarParceiro('${p.code}')">Tornar parceiro</button>`}</div>
  <div class="box">
    ${bar('XP', p.nivel >= MAXLV ? 100 : p.xp / xpNeed(p.nivel) * 100, 'xp')}
    ${bar('Barriga', p.fome, 'fome')}${bar('Felicidade', p.feliz, 'feliz')}${bar('Energia', p.energia, 'energia')}${bar('Amizade', p.amizade, 'amizade')}
    <div class="row">${Object.keys(ACOES).map(k => btnAcao(p, k)).join('')}</div>
    <div class="row">${itens}</div></div></div>
  ${evh}<div class="box"><h3>Histórico</h3>${hist}</div>`;
}
setInterval(() => {
  if (tela.nome !== 'cuidar') return; const r = achar(tela.c); if (!r) return;
  Object.keys(ACOES).forEach(k => { const b = document.getElementById('ac-' + k); if (!b) return; const f = falta(r.p, k); b.disabled = f > 0; b.textContent = ACOES[k].nome + (f > 0 ? ` (${f})` : ''); });
}, 500);

// ============ REGISTRO ============
function rRegistrar() {
  return `${topo('Registrar carta')}<div class="box"><label>Código da carta</label>
  <input id="cod" maxlength="40" placeholder="P1-0007" value="${esc(tela.c || '')}" style="text-transform:uppercase">
  <div class="row"><button class="btn azul" onclick="escanear()">Escanear QR</button></div>
  <p>Quem está registrando esta carta?</p>
  <div class="row">${S.j.map(j => `<button class="btn ${j.cor}" onclick="registrar(${j.id})">${esc(j.nome)}</button>`).join('')}</div></div>`;
}
function registrar(i) {
  let code = ($('#cod').value || '').toUpperCase().trim(); const m = code.match(/[A-Z0-9]+-\d{4}/); if (m) code = m[0];
  const c = CARTAS[code]; if (!c) return toast('Código não encontrado. Confira os caracteres.');
  const dono = S.reg[code];
  if (dono !== undefined) {
    if (c.tipo === 'item') return toast('Este item já foi usado.');
    if (dono === i) return toast('Você já registrou esta carta.');
    return modal(`<h2>Carta já registrada</h2><p>Esta carta pertence a <b>${esc(S.j[dono].nome)}</b>. Para ficar com ela, façam uma troca.</p>
    <div class="row centro"><button class="btn verde" onclick="fechar();T={a:null,b:null};T['${dono === 0 ? 'a' : 'b'}']='${code}';go('troca')">Ir para troca</button><button class="btn" onclick="fechar()">Fechar</button></div>`);
  }
  const j = S.j[i]; S.reg[code] = i;
  if (c.tipo === 'item') {
    j.itens[c.item] = (j.itens[c.item] || 0) + 1; salvar();
    modal(`<h2>Item encontrado!</h2><p>${esc(j.nome)} ganhou <b>${ITENS[c.item].nome}</b>.</p><button class="btn verde" onclick="fechar()">Ok</button>`);
    return go('home');
  }
  const p = novoPoke(code, c); j.cartas[code] = p; if (!j.parceiro) j.parceiro = code; salvar();
  modal(`<h2>Novo amigo!</h2>${sprite(p.especie, 'g')}<p>${esp(p).nome} entrou para o time de ${esc(j.nome)}!</p><button class="btn verde" onclick="fechar()">Legal!</button>`);
  go('cuidar', { c: code });
}
let _stream = null, _scan = false;
async function escanear() {
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices) return toast('Este navegador não lê QR aqui. Digite o código ou use a câmera do celular.');
  try { _stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); } catch (e) { return toast('Sem acesso à câmera.'); }
  modal(`<h3>Aponte para o QR</h3><video id="sv" playsinline muted autoplay style="width:100%"></video><button class="btn" onclick="pararScan()">Fechar</button>`);
  const v = $('#sv'); v.srcObject = _stream; _scan = true;
  const det = new BarcodeDetector({ formats: ['qr_code'] });
  const loop = async () => {
    if (!_scan) return;
    try { const r = await det.detect(v); if (r.length) { const m = r[0].rawValue.match(/[A-Z0-9]+-\d{4}/i); if (m) { pararScan(); $('#cod').value = m[0].toUpperCase(); toast('Lido: ' + m[0].toUpperCase()); return; } } } catch (e) {}
    requestAnimationFrame(loop);
  };
  loop();
}
function pararScan() { _scan = false; if (_stream) _stream.getTracks().forEach(t => t.stop()); _stream = null; fechar(); }

// ============ TROCA ============
function rTroca() {
  const col = (j, k) => `<div class="box ${j.cor}"><h3>${esc(j.nome)}</h3><div class="grid">${Object.values(j.cartas).map(p => `<div class="mini ${T[k] === p.code ? 'sel' : ''}" onclick="T.${k}='${p.code}';render()">${sprite(p.especie, 'p')}<b>${esp(p).nome}</b><small>Nv.${p.nivel}</small></div>`).join('') || '<small>vazio</small>'}</div></div>`;
  return `${topo('Troca')}<p class="centro">Escolha um Pokémon de cada lado.</p><div class="duo">${col(S.j[0], 'a')}${col(S.j[1], 'b')}</div>
  <div class="row centro"><button class="btn verde grande" ${T.a && T.b ? '' : 'disabled'} onclick="pedirSenhas()">Trocar!</button></div>`;
}
function pedirSenhas() {
  const [a, b] = S.j;
  if (!a.pin || !b.pin) return toast('Os dois jogadores precisam criar uma senha no Perfil.');
  modal(`<h2>Confirmar troca</h2>
  <label>Senha de ${esc(a.nome)}</label><input id="pa" type="password" inputmode="numeric" maxlength="4">
  <label>Senha de ${esc(b.nome)}</label><input id="pb" type="password" inputmode="numeric" maxlength="4">
  <div class="row centro"><button class="btn verde" onclick="confirmarTroca()">Confirmar</button><button class="btn" onclick="fechar()">Cancelar</button></div>`);
}
function confirmarTroca() {
  const [a, b] = S.j;
  if ($('#pa').value !== a.pin || $('#pb').value !== b.pin) return toast('Senha incorreta.');
  const pa = a.cartas[T.a], pb = b.cartas[T.b]; if (!pa || !pb) return;
  delete a.cartas[T.a]; delete b.cartas[T.b];
  b.cartas[T.a] = pa; a.cartas[T.b] = pb; S.reg[T.a] = 1; S.reg[T.b] = 0;
  addHist(pa, 'Trocado para ' + b.nome); addHist(pb, 'Trocado para ' + a.nome);
  [a, b].forEach(j => { if (!j.cartas[j.parceiro]) j.parceiro = Object.keys(j.cartas)[0] || null; });
  T = { a: null, b: null }; salvar(); fechar(); toast('Troca feita!'); go('home');
}

// ============ BATALHA ============
function batalhaIniciar() {
  if (S.j.some(j => !Object.keys(j.cartas).length)) return toast('Os dois jogadores precisam ter pelo menos um Pokémon.');
  B = { fase: 'pick0', esc: [null, null], c: [null, null], atual: 0, log: [], fim: null, up: [0, 0], drop: false };
  go('batalha');
}
function bEscolher(i, code) { B.esc[i] = code; B.fase = i === 0 ? 'passa' : 'pronto'; render(); }
function bCriar(i) {
  const p = S.j[i].cartas[B.esc[i]]; tick(p);
  return { i, p, nome: esp(p).nome, especie: p.especie, tipo: esp(p).tipo, nivel: p.nivel, max: maxHp(p), hp: maxHp(p), status: null, aguenta: false, golpes: golpesDe(p) };
}
const velB = c => stat(c.p, 'vel') * (c.p.fome < 40 ? 0.8 : 1) * (c.status === 'paralisado' ? 0.5 : 1);
function bRevelar() {
  B.c = [bCriar(0), bCriar(1)];
  const v0 = velB(B.c[0]), v1 = velB(B.c[1]);
  B.atual = Math.random() < v0 / (v0 + v1) ? 0 : 1;
  B.fase = 'revela'; render();
}
function L(t) { B.log.push(t); }
function bGolpe(gid) {
  if (B.fase !== 'fight') return;
  const a = B.c[B.atual], d = B.c[1 - B.atual]; B.log = [];
  if (a.status === 'paralisado' && Math.random() < 0.25) { L(`${a.nome} está paralisado e não consegue se mexer!`); }
  else {
    const g = GOLPES[gid]; L(`${a.nome} usou ${g.nome}!`);
    const prec = Math.min(100, g.prec + (a.p.feliz >= 70 ? 5 : 0));
    if (Math.random() * 100 >= prec) { L('Mas errou!'); }
    else {
      const ef = (EFETIVIDADE[g.tipo] && EFETIVIDADE[g.tipo][d.tipo]) ?? 1;
      const crit = Math.random() < 0.05 + a.p.amizade * 0.001;
      const atk = stat(a.p, 'atk'), def = stat(d.p, 'def');
      let dano = ((2 * a.nivel / 5 + 2) * g.poder * atk / def) / 25 + 2;
      dano *= (g.tipo === a.tipo ? 1.5 : 1) * ef * (0.85 + Math.random() * 0.15) * (crit ? 1.5 : 1) * (a.p.energia < 20 ? 0.9 : 1);
      dano = Math.max(1, Math.floor(dano));
      if (dano >= d.hp && d.p.amizade >= 70 && !d.aguenta && d.hp > 1) { d.aguenta = true; dano = d.hp - 1; L(`${d.nome} aguentou firme por causa da amizade!`); }
      d.hp = Math.max(0, d.hp - dano);
      if (ef > 1) L('Foi super efetivo!'); if (ef < 1) L('Não foi muito efetivo...'); if (crit) L('Acerto crítico!');
      L(`${d.nome} perdeu ${dano} HP.`);
      if (g.status && d.hp > 0 && !d.status && Math.random() < g.status.chance) { d.status = g.status.id; L(`${d.nome} ficou ${ESTATUS[g.status.id].nome.toLowerCase()}!`); }
    }
  }
  if (d.hp > 0 && a.status === 'queimado') { const q = Math.max(1, Math.floor(a.max / 8)); a.hp = Math.max(0, a.hp - q); L(`${a.nome} sofreu ${q} da queimadura.`); }
  if (d.hp <= 0) return bFim(B.atual);
  if (a.hp <= 0) return bFim(1 - B.atual);
  B.atual = 1 - B.atual; render();
}
function bFim(w) {
  B.fase = 'fim'; B.fim = w;
  const win = S.j[w], lose = S.j[1 - w], pw = B.c[w].p, pl = B.c[1 - w].p;
  win.v++; lose.d++;
  B.up = [ganharXp(pw, 30 + pl.nivel * 2), ganharXp(pl, 12)];
  [pw, pl].forEach(p => { p.energia = clamp(p.energia - 20); p.fome = clamp(p.fome - 10); });
  pw.feliz = clamp(pw.feliz + 8); pl.feliz = clamp(pl.feliz - 5);
  pw.amizade = clamp(pw.amizade + 2); pl.amizade = clamp(pl.amizade + 1);
  addHist(pw, 'Venceu uma batalha'); addHist(pl, 'Perdeu uma batalha');
  if (Math.random() < 0.3) { win.itens.superdoce = (win.itens.superdoce || 0) + 1; B.drop = true; }
  salvar(); render();
}
function cbPanel(c, ativo) {
  const j = S.j[c.i];
  return `<div class="box cb ${j.cor} ${ativo ? 'ativo' : ''}"><div><small>${esc(j.nome)}</small></div>${sprite(c.especie, 'm')}
  <div><b>${c.nome}</b> Nv.${c.nivel} ${c.status ? `<span class="tag st">${ESTATUS[c.status].sigla}</span>` : ''}</div>
  <div class="bar hp ${c.hp / c.max < .25 ? 'low' : ''}"><i style="width:${c.hp / c.max * 100}%"></i></div><small>${c.hp}/${c.max}</small></div>`;
}
function rBatalha() {
  if (!B) return rHome();
  const f = B.fase;
  if (f === 'pick0' || f === 'pick1') {
    const i = f === 'pick0' ? 0 : 1, j = S.j[i];
    return `<h2 class="centro">${esc(j.nome)}: escolha em segredo!</h2><p class="centro"><small>O outro jogador não deve olhar.</small></p>
    <div class="grid">${Object.values(j.cartas).map(p => `<div class="mini" onclick="bEscolher(${i},'${p.code}')">${sprite(p.especie, 'p')}<b>${esp(p).nome}</b><small>Nv.${p.nivel}</small></div>`).join('')}</div>
    <div class="row centro"><button class="btn peq" onclick="B=null;go('home')">Cancelar</button></div>`;
  }
  if (f === 'passa') return `<div class="box centro"><h2>Escolhido!</h2><p>Passe o celular para <b>${esc(S.j[1].nome)}</b>.</p><button class="btn verde grande" onclick="B.fase='pick1';render()">Sou eu!</button></div>`;
  if (f === 'pronto') return `<div class="box centro"><h2>Os dois escolheram!</h2><p>Todos prontos para a revelação?</p><button class="btn verde grande" onclick="bRevelar()">Revelar!</button></div>`;
  if (f === 'revela') return `<div class="arena">${cbPanel(B.c[0], false)}<div class="vs">VS</div>${cbPanel(B.c[1], false)}</div>
    <div class="box centro"><h2>${esc(S.j[B.atual].nome)} começa!</h2><button class="btn verde grande" onclick="B.fase='fight';render()">Lutar!</button></div>`;
  if (f === 'fight') {
    const a = B.c[B.atual];
    const gs = a.golpes.map(id => { const g = GOLPES[id]; return `<button class="btn mv" style="background-color:${TIPOS[g.tipo].cor}" onclick="bGolpe('${id}')"><b>${g.nome}</b><small>${TIPOS[g.tipo].nome} · Poder ${g.poder} · Prec ${g.prec}</small></button>`; }).join('');
    return `<div class="${S.config.virar && B.atual === 1 ? 'flip' : ''}">
    <div class="arena">${cbPanel(B.c[0], B.atual === 0)}<div class="vs">VS</div>${cbPanel(B.c[1], B.atual === 1)}</div>
    <div class="box log">${B.log.length ? B.log.map(esc).join('<br>') : 'A batalha começou!'}</div>
    <div class="box"><b>Vez de ${esc(S.j[B.atual].nome)}: escolha o ataque</b><div class="moves" style="margin-top:8px">${gs}</div>
    <div class="row"><button class="btn peq" onclick="if(confirm('Desistir da batalha?'))bFim(${1 - B.atual})">Desistir</button></div></div></div>`;
  }
  if (f === 'fim') {
    const w = S.j[B.fim], pw = B.c[B.fim].p, pl = B.c[1 - B.fim].p;
    return `<div class="box centro ${w.cor}"><h1>${esc(w.nome)} venceu!</h1>${sprite(B.c[B.fim].especie, 'g')}<p>${B.log.map(esc).join('<br>')}</p>
    <p>${esp(pw).nome} ganhou XP${B.up[0] ? ` e subiu para o nível ${pw.nivel}!` : '.'}<br>${esp(pl).nome} também treinou${B.up[1] ? ` e subiu para o nível ${pl.nivel}!` : '.'}</p>
    ${B.drop ? `<p><b>${esc(w.nome)} ganhou um Superdoce!</b></p>` : ''}
    <div class="row centro"><button class="btn verde" onclick="batalhaIniciar()">Revanche</button><button class="btn" onclick="B=null;go('home')">Início</button></div></div>`;
  }
}

// ============ AJUSTES ============
function rAjustes() {
  return `${topo('Ajustes')}
  <div class="box"><h3>Backup</h3><p><small>Os dados ficam só neste aparelho. Exporte de vez em quando!</small></p>
  <div class="row"><button class="btn" onclick="exportar()">Exportar backup</button><label class="btn">Importar<input type="file" accept=".json" hidden onchange="importar(this)"></label></div></div>
  <div class="box"><h3>Batalha</h3><label><input type="checkbox" ${S.config.virar ? 'checked' : ''} onchange="S.config.virar=this.checked;salvar()"> Virar a tela 180° no turno do Jogador 2</label></div>
  <div class="box"><h3>Nuvem (Firebase)</h3>${Nuvem.ativa()
    ? `<label>Nome da sala (segredo, difícil de adivinhar)</label><input id="sala" value="${esc(Nuvem.sala())}"><div class="row"><button class="btn azul" onclick="salaSalvar();Nuvem.enviar()">Enviar</button><button class="btn" onclick="salaSalvar();Nuvem.baixar()">Baixar</button></div><small>Com sala definida, o jogo envia o progresso automaticamente.</small>`
    : '<small>Não configurada. Preencha o firebase-config.js.</small>'}</div>
  <div class="box"><h3>Perigo</h3><button class="btn rosa" onclick="apagarTudo()">Apagar tudo</button></div>`;
}
function exportar() {
  const b = new Blob([JSON.stringify(S)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'cartinhas-backup.json'; a.click();
}
function importar(inp) {
  const f = inp.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { const o = JSON.parse(r.result); if (!o.j || o.j.length !== 2) throw 0; o.reg = o.reg || {}; o.config = o.config || { virar: false }; S = o; salvar(); toast('Backup restaurado!'); go('home'); } catch (e) { toast('Arquivo inválido.'); } };
  r.readAsText(f);
}
function apagarTudo() {
  if (!confirm('Apagar TODOS os dados deste aparelho? Não dá para desfazer.')) return;
  localStorage.removeItem(CHAVE); S = novoEstado(); go('perfil', { j: 0, primeiro: true });
}

// ============ INÍCIO ============
tickAll(); salvar();
const _c = new URLSearchParams(location.search).get('c');
if (!S.setup) go('perfil', { j: 0, primeiro: true });
else if (_c) go('registrar', { c: _c });
else go('home');
