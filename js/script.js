const K = 'nutrielo.v1', app = document.getElementById('app');
const hoje = () => new Date().toISOString().slice(0, 10);
const dias = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const e = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = d => d.split('-').reverse().join('/');
function seed() {
  return {
    n: 10, users: [
      { id: 1, perfil: 'admin', nome: 'Administrador', email: 'admin@nutrielo.com', senha: 'admin123', status: 'aprovado' },
      { id: 2, perfil: 'doador', nome: 'Padaria Pão Nosso', doc: '12345678000190', resp: 'Maria', bairro: 'Centro', end: 'Rua das Flores, 100', email: 'doador@demo.com', senha: '123456', status: 'aprovado' },
      { id: 3, perfil: 'ong', nome: 'ONG Mãos Amigas', doc: '98765432000110', resp: 'João', bairro: 'Vila Nova', end: 'Av. Brasil, 500', email: 'ong@demo.com', senha: '123456', status: 'aprovado' },
      { id: 4, perfil: 'familia', nome: 'Família Souza', doc: '12345678901', resp: 'Ana Souza', bairro: 'Centro', end: 'Rua A, 10', email: 'familia@demo.com', senha: '123456', status: 'aprovado' }],
    ofertas: [{ id: 5, doadorId: 2, nome: 'Pães franceses', desc: 'Sobra do dia', cat: 'Panificação', qtd: 30, disp: 30, un: 'kg', val: dias(2), cons: 'Ambiente', end: 'Rua das Flores, 100', bairro: 'Centro', ini: '17:00', fim: '19:00', status: 'Disponível' }],
    reservas: [], notifs: []
  }
}
let D = JSON.parse(localStorage.getItem(K) || 'null') || seed(), S = { u: null, v: null, aba: 'login', fs: '', q: '', cat: '', bai: '', ord: 'val', err: '' };
const save = () => localStorage.setItem(K, JSON.stringify(D)), nid = () => D.n++;
const U = id => D.users.find(u => u.id == id), O = id => D.ofertas.find(o => o.id == id);
const notif = (uid, msg) => D.notifs.push({ uid, msg, t: new Date().toLocaleString('pt-BR') });
function media(uid) { const n = D.reservas.flatMap(r => { const o = O(r.ofertaId); return o.doadorId == uid && r.avR ? [r.avR] : r.recId == uid && r.avD ? [r.avD] : [] }); return n.length ? '★ ' + (n.reduce((a, b) => a + b) / n.length).toFixed(1) : 'sem avaliações' }
function expirar() { D.ofertas.forEach(o => { if (o.val < hoje() && ['Disponível', 'Reservada'].includes(o.status)) { o.status = 'Expirada'; D.reservas.filter(r => r.ofertaId == o.id && r.status == 'ativa').forEach(r => { r.status = 'cancelada'; notif(r.recId, `A oferta "${o.nome}" expirou e sua reserva foi cancelada.`) }) } }) }
const isRec = u => u.perfil == 'familia' || u.perfil == 'ong';
const NAV = { doador: [['oferta', 'Nova oferta'], ['minhas', 'Minhas ofertas'], ['hist', 'Histórico']], rec: [['busca', 'Buscar alimentos'], ['res', 'Minhas reservas'], ['hist', 'Histórico']], admin: [['fila', 'Cadastros'], ['ind', 'Indicadores']] };
const C = (t, b) => `<section class="card"><h2>${t}</h2>${b}</section>`;
const F = (l, n, x = '') => `<label>${l}<input name="${n}" ${x}></label>`;
function sel(n, ops, v = '') { return `<select name="${n}">${ops.map(o => `<option ${o == v ? 'selected' : ''}>${o}</option>`).join('')}</select>` }

function auth() {
  const l = S.aba == 'login';
  return `<div class="hero"><h1>Alimento que sobra, mesa que recebe</h1><p class="m">Conectamos quem tem alimentos excedentes a famílias e ONGs que precisam.</p></div>
 <section class="card"><nav style="margin-bottom:.8rem"><button class="s ${l ? 'on' : ''}" data-a="aba" data-i="login">Entrar</button> <button class="s" data-a="aba" data-i="cad">Criar conta</button></nav>${S.err ? `<p class="erro">${S.err}</p>` : ''}
 ${l ? `<form data-f="login">${F('E-mail', 'email', 'type=email required')}${F('Senha', 'senha', 'type=password required')}<button class="p">Entrar</button><a href="#" data-a="esq" class="m">Esqueci a senha</a><p class="m">Demo: doador@demo.com, ong@demo.com, familia@demo.com (senha 123456) ou admin@nutrielo.com (admin123)</p></form>`
      : `<form data-f="cad"><label>Perfil${sel('perfil', ['doador', 'familia', 'ong'])}</label>
 <div class="g2">${F('Nome / razão social', 'nome', 'required')}${F('CPF (família) ou CNPJ (doador/ONG)', 'doc', 'required')}${F('Responsável', 'resp', 'required')}${F('Telefone', 'tel', 'required')}${F('E-mail', 'email', 'type=email required')}${F('Senha (mín. 6)', 'senha', 'type=password minlength=6 required')}${F('Endereço', 'end', 'required')}${F('Bairro / cidade', 'bairro', 'required')}</div>
 <label class="chk"><input type="checkbox" name="termos" required> Aceito os termos de uso e a política de privacidade (LGPD)</label><button class="p">Cadastrar</button></form>`}</section>`
}

function oferta() { return C('Nova oferta de alimento', `${S.err ? `<p class="erro">${S.err}</p>` : ''}<form data-f="oferta"><div class="g2">${F('Alimento', 'nome', 'required')}<label>Categoria${sel('cat', ['Hortifrúti', 'Panificação', 'Refeição preparada', 'Não perecível'])}</label>${F('Quantidade', 'qtd', 'type=number min=1 required')}<label>Unidade${sel('un', ['kg', 'porções', 'unidades'])}</label>${F('Validade / consumo até', 'val', `type=date min="${hoje()}" required`)}<label>Conservação${sel('cons', ['Ambiente', 'Refrigerado', 'Congelado'])}</label>${F('Endereço de retirada', 'end', `required value="${e(S.u.end)}"`)}${F('Bairro', 'bairro', `required value="${e(S.u.bairro)}"`)}${F('Retirada a partir de', 'ini', 'type=time required')}${F('Retirada até', 'fim', 'type=time required')}</div>${F('Descrição', 'desc')}<label class="chk"><input type="checkbox" name="ok" required> Declaro que o alimento está próprio para consumo humano (Lei 14.016/2020)</label><button class="p">Publicar oferta</button></form>`) }

function minhas() {
  const os = D.ofertas.filter(o => o.doadorId == S.u.id && (!S.fs || o.status == S.fs)).reverse();
  return C('Minhas ofertas', `<label>Filtrar por status<select data-c="fs">${['', 'Disponível', 'Reservada', 'Suspensa', 'Retirada', 'Expirada', 'Cancelada'].map(s => `<option ${s == S.fs ? 'selected' : ''} value="${s}">${s || 'Todos'}</option>`).join('')}</select></label>`) + (os.map(o => {
    const rs = D.reservas.filter(r => r.ofertaId == o.id && r.status == 'ativa'), fim = ['Cancelada', 'Expirada', 'Retirada'].includes(o.status);
    return `<section class="card"><b>${e(o.nome)}</b> <span class="tag ${fim ? 'x' : ''}">${o.status}</span><p class="m">${o.disp}/${o.qtd} ${o.un} · validade ${fmt(o.val)} · janela ${o.ini}–${o.fim}</p>
 ${rs.map(r => `<p>📦 ${e(U(r.recId).nome)}: ${r.qtd} ${o.un}, ${r.hora ? 'às ' + r.hora : 'sem horário'} <span class="acoes"><button class="s" data-a="conf" data-i="${r.id}">Confirmar retirada</button><button class="r" data-a="aus" data-i="${r.id}">Não compareceu</button></span></p>`).join('')}
 ${fim ? '' : `<div class="acoes">${['Disponível', 'Suspensa'].includes(o.status) ? `<button class="s" data-a="susp" data-i="${o.id}">${o.status == 'Suspensa' ? 'Reativar' : 'Suspender'}</button>` : ''}<button class="r" data-a="canc" data-i="${o.id}">Cancelar oferta</button></div>`}</section>`
  }).join('') || '<p class="m">Nenhuma oferta.</p>')
}

function busca() {
  let os = D.ofertas.filter(o => o.status == 'Disponível' && o.disp > 0 && (!S.cat || o.cat == S.cat) && (!S.bai || o.bairro.toLowerCase().includes(S.bai.toLowerCase())) && (!S.q || (o.nome + o.desc).toLowerCase().includes(S.q.toLowerCase())));
  os.sort((a, b) => a.val.localeCompare(b.val));
  return C('Buscar alimentos', `<div class="g2"><label>Palavra-chave<input data-c="q" value="${e(S.q)}"></label><label>Bairro<input data-c="bai" value="${e(S.bai)}"></label><label>Categoria<select data-c="cat">${['', 'Hortifrúti', 'Panificação', 'Refeição preparada', 'Não perecível'].map(c => `<option ${c == S.cat ? 'selected' : ''} value="${c}">${c || 'Todas'}</option>`).join('')}</select></label></div><p class="m">Ordenado pela validade mais próxima.</p>`) + (os.map(o => `<section class="card"><b>${e(o.nome)}</b> <span class="tag">${o.cat}</span><p class="m">${e(o.desc)}</p><p>${o.disp} ${o.un} · ${o.cons} · validade ${fmt(o.val)}<br>📍 ${e(o.bairro)} · retirada ${o.ini}–${o.fim}<br>Doador: ${e(U(o.doadorId).nome)} (${media(o.doadorId)})</p><button class="p" data-a="reservar" data-i="${o.id}">Reservar</button></section>`).join('') || '<p class="m">Nenhuma oferta encontrada.</p>')
}

function res() {
  const rs = D.reservas.filter(r => r.recId == S.u.id).reverse();
  return C('Minhas reservas', '<p class="m">O endereço completo aparece após a reserva. Limite: 2 reservas ativas.</p>') + (rs.map(r => {
    const o = O(r.ofertaId), a = r.status == 'ativa';
    return `<section class="card"><b>${e(o.nome)}</b> <span class="tag ${a ? 'w' : r.status == 'retirada' ? '' : 'x'}">${r.status}</span><p>${r.qtd} ${o.un} · 📍 ${e(o.end)}<br>Janela ${o.ini}–${o.fim} · horário: ${r.hora || 'não agendado'}</p>${a ? `<p>Código de retirada: <b style="font-size:1.3rem">${r.cod}</b></p><p class="m">Orientação: mantenha ${o.cons.toLowerCase()} e transporte o alimento com cuidado.</p><div class="acoes"><button class="s" data-a="agendar" data-i="${r.id}">${r.hora ? 'Reagendar' : 'Agendar'} retirada</button><button class="r" data-a="cres" data-i="${r.id}">Cancelar reserva</button></div>` : ''}</section>`
  }).join('') || '<p class="m">Você ainda não tem reservas.</p>')
}

function hist() {
  const d = S.u.perfil == 'doador', rs = D.reservas.filter(r => r.status == 'retirada' && (d ? O(r.ofertaId).doadorId == S.u.id : r.recId == S.u.id)).reverse();
  const tot = rs.reduce((a, r) => a + r.qtd, 0);
  return C('Histórico de doações', `<div class="kpi"><div><strong>${rs.length}</strong>doações concluídas</div><div><strong>${tot}</strong>total (kg/porções/un.)</div><div><strong>${media(S.u.id).replace('sem avaliações', '—')}</strong>sua nota média</div></div>`) + rs.map(r => {
    const o = O(r.ofertaId), k = d ? 'avD' : 'avR', outro = U(d ? r.recId : o.doadorId);
    return `<section class="card"><b>${e(o.nome)}</b> · ${r.qtd} ${o.un}<p class="m">${d ? 'Receptor' : 'Doador'}: ${e(outro.nome)} · retirada em ${r.quando}</p>${r[k] ? `<span class="tag">Você avaliou: ${r[k]}★</span>` : `<button class="s" data-a="aval" data-i="${r.id}">Avaliar</button>`}</section>`
  }).join('')
}

function fila() {
  const p = D.users.filter(u => u.status == 'pendente');
  return C('Cadastros pendentes', p.length ? '' : '<p class="m">Nenhum cadastro aguardando análise.</p>') + p.map(u => `<section class="card"><b>${e(u.nome)}</b> <span class="tag w">${u.perfil}</span><p class="m">Doc.: ${e(u.doc)} · Resp.: ${e(u.resp)} · ${e(u.end)}, ${e(u.bairro)} · ${e(u.email)}</p><div class="acoes"><button class="s" data-a="apr" data-i="${u.id}">Aprovar</button><button class="r" data-a="rej" data-i="${u.id}">Rejeitar</button></div></section>`).join('')
}
function ind() {
  const rt = D.reservas.filter(r => r.status == 'retirada');
  return C('Indicadores gerais (dados agregados)', `<div class="kpi"><div><strong>${rt.length}</strong>doações</div><div><strong>${rt.reduce((a, r) => a + r.qtd, 0)}</strong>alimento redistribuído</div><div><strong>${D.users.filter(u => u.status == 'aprovado' && u.perfil != 'admin').length}</strong>usuários ativos</div><div><strong>${D.ofertas.filter(o => o.status == 'Expirada').length}</strong>ofertas expiradas</div></div>`)
}
function notifs() { const n = D.notifs.filter(x => x.uid == S.u.id).reverse(); return C('Avisos', n.map(x => `<p>🔔 ${e(x.msg)} <span class="m">${x.t}</span></p>`).join('') || '<p class="m">Sem avisos.</p>') }

const VIEWS = { oferta, minhas, busca, res, hist, fila, ind, notif: notifs };
function render() {
  expirar(); save(); const u = S.u; let h = '', b;
  if (!u) b = auth();
  else {
    const nav = NAV[u.perfil == 'admin' ? 'admin' : u.perfil == 'doador' ? 'doador' : 'rec'], nn = D.notifs.filter(x => x.uid == u.id).length;
    if (!S.v || !VIEWS[S.v]) S.v = nav[0][0];
    h = `<nav>${nav.concat([['notif', `Avisos (${nn})`]]).map(([k, t]) => `<button class="${S.v == k ? 'on' : ''}" data-a="nav" data-i="${k}">${t}</button>`).join('')}<button class="sair" data-a="sair">Sair</button></nav>`;
    b = u.status != 'aprovado' ? C('Cadastro ' + (u.status == 'pendente' ? 'em análise' : 'rejeitado'), u.status == 'pendente' ? '<p>Você poderá usar a plataforma após a aprovação do administrador.</p>' : `<p>Motivo: ${e(u.motivo)}</p>`) : VIEWS[S.v]()
  }
  app.innerHTML = `<header><img class="logo" src="img/logo.svg" alt="Nutrielo">${h}</header><main>${b}</main>`
}

document.addEventListener('submit', ev => {
  ev.preventDefault(); const f = ev.target, d = Object.fromEntries(new FormData(f)), t = f.dataset.f; S.err = '';
  if (t == 'login') { const u = D.users.find(x => x.email == d.email.trim().toLowerCase() && x.senha == d.senha); if (u) { S.u = u; S.v = null } else S.err = 'E-mail ou senha inválidos.' }
  if (t == 'cad') {
    const n = d.doc.replace(/\D/g, ''), em = d.email.trim().toLowerCase();
    if (n.length != (d.perfil == 'familia' ? 11 : 14)) S.err = d.perfil == 'familia' ? 'CPF deve ter 11 dígitos.' : 'CNPJ deve ter 14 dígitos.';
    else if (D.users.some(x => x.email == em || x.doc == n)) S.err = 'Já existe cadastro com este e-mail ou documento.';
    else { const u = { id: nid(), ...d, doc: n, email: em, status: d.perfil == 'familia' ? 'aprovado' : 'pendente' }; delete u.termos; D.users.push(u); S.aba = 'login'; S.err = u.status == 'pendente' ? 'Cadastro enviado! Aguarde a aprovação para publicar ou reservar. Entre com seus dados.' : 'Cadastro concluído! Faça login.' }
  }
  if (t == 'oferta') { if (d.fim <= d.ini) S.err = 'O horário final deve ser depois do inicial.'; else { D.ofertas.push({ id: nid(), doadorId: S.u.id, ...d, qtd: +d.qtd, disp: +d.qtd, status: 'Disponível' }); delete D.ofertas.at(-1).ok; S.v = 'minhas' } }
  render()
});

document.addEventListener('change', ev => { const c = ev.target.dataset.c; if (c) { S[c] = ev.target.value; render() } });

document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-a]'); if (!b) return; ev.preventDefault(); const a = b.dataset.a, i = +b.dataset.i || b.dataset.i; S.err = '';
  const rv = D.reservas.find(r => r.id == i), of = O(rv?.ofertaId ?? i), us = U(i);
  if (a == 'aba') S.aba = i;
  if (a == 'esq') alert('Protótipo: o link de recuperação seria enviado por e-mail (válido por 30 min).');
  if (a == 'nav') S.v = i;
  if (a == 'sair') { S.u = null; S.aba = 'login' }
  if (a == 'apr') { us.status = 'aprovado'; notif(us.id, 'Seu cadastro foi aprovado!') }
  if (a == 'rej') { const m = prompt('Motivo da rejeição:'); if (!m) return; us.status = 'rejeitado'; us.motivo = m }
  if (a == 'susp') of.status = of.status == 'Suspensa' ? 'Disponível' : 'Suspensa';
  if (a == 'canc' && confirm('Cancelar esta oferta?')) { of.status = 'Cancelada'; D.reservas.filter(r => r.ofertaId == of.id && r.status == 'ativa').forEach(r => { r.status = 'cancelada'; notif(r.recId, `A oferta "${of.nome}" foi cancelada pelo doador.`) }) }
  if (a == 'reservar') {
    if (D.reservas.filter(r => r.recId == S.u.id && r.status == 'ativa').length >= 2) return alert('Limite de 2 reservas ativas.');
    const q = +prompt(`Quantidade desejada (máx. ${of.disp} ${of.un}):`); if (!q || q < 1 || q > of.disp) return alert('Quantidade inválida.');
    if (!confirm(`Reservar ${q} ${of.un} de ${of.nome}?`)) return;
    D.reservas.push({ id: nid(), ofertaId: of.id, recId: S.u.id, qtd: q, status: 'ativa', cod: String(Math.random() * 1e6 | 0).padStart(6, '0') });
    of.disp -= q; if (!of.disp) of.status = 'Reservada'; notif(of.doadorId, `${S.u.nome} reservou ${q} ${of.un} de ${of.nome}.`); S.v = 'res'
  }
  if (a == 'agendar') { const h = prompt(`Horário de retirada (HH:MM) entre ${of.ini} e ${of.fim}:`); if (!h) return; if (!/^\d\d:\d\d$/.test(h) || h < of.ini || h > of.fim) return alert('Horário fora da janela.'); rv.hora = h; notif(of.doadorId, `${S.u.nome} agendou retirada às ${h}.`) }
  if (a == 'cres' && confirm('Cancelar reserva?')) { rv.status = 'cancelada'; of.disp += rv.qtd; if (of.status == 'Reservada') of.status = 'Disponível'; notif(of.doadorId, `${S.u.nome} cancelou a reserva de ${of.nome}.`) }
  if (a == 'conf') { if (prompt('Código de retirada informado pelo receptor:') != rv.cod) return alert('Código incorreto.'); rv.status = 'retirada'; rv.quando = new Date().toLocaleString('pt-BR'); if (!of.disp && !D.reservas.some(r => r.ofertaId == of.id && r.status == 'ativa')) of.status = 'Retirada'; notif(rv.recId, 'Retirada confirmada. Avalie o doador no histórico!') }
  if (a == 'aus') { rv.status = 'ausente'; of.disp += rv.qtd; if (of.status == 'Reservada') of.status = 'Disponível'; notif(rv.recId, 'Sua retirada foi registrada como não comparecimento.') }
  if (a == 'aval') { const n = +prompt('Nota de 1 a 5:'); if (n < 1 || n > 5 || !n) return; rv[S.u.perfil == 'doador' ? 'avD' : 'avR'] = n }
  render()
});
render();