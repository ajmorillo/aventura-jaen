import { iconoBloque, flechaSVG, triangulo, borrarSVG, estrellaSVG, lagartoSVG, paisajeSVG, aceitunaSVG, llaveSVG, puertaSVG, TEMAS } from './art.js';
import { desbloquearAudio, hablar, callar, sonido, alternarSilencio, estaSilenciado } from './sonido.js';
import { estrellasDe, guardarEstrellas, totalEstrellas, guardarAvatar, premiosVistos, marcarPremiosVistos } from './progreso.js';
import { PREMIOS, SIN, desbloqueados, nuevos } from './premios.js';
import { POSTALES, postalSVG } from './album.js';
import { bloquesDe, mueve, paso, aplicar, llego, enMeta, esObstaculo, estadoInicial, simular, resolver, aceitunas, llaves, puertas,
  desplegar, normalizar, emparejar, esRepetir, veces, contarBloques } from './motor.js';
import { MUNDOS } from './mundos.js';
import { PERFILES, perfilCompleto } from './perfiles.js';
import { avatarSVG } from './avatar.js';
import { iniciarPadres, abrirPuerta } from './padres.js';

const MAX_BLOQUES = { peque: 10, mayor: 20 };
const NOMBRE_BLOQUE = {
  arriba: 'Arriba', abajo: 'Abajo', izquierda: 'Izquierda', derecha: 'Derecha',
  avanzar: 'Avanzar', izq: 'Girar a la izquierda', der: 'Girar a la derecha', recoger: 'Recoger',
  repetir: 'Repetir', fin: 'Fin del bucle',
};
const nombreBloque = b => (esRepetir(b) ? `Repetir ${veces(b)} veces` : NOMBRE_BLOQUE[b]);
const ANGULO = { arriba: 0, derecha: 90, abajo: 180, izquierda: 270 };

const $ = s => document.querySelector(s);
const esperar = ms => new Promise(r => setTimeout(r, ms));

const estado = {
  perfil: null,
  mundos: {}, // JSON de cada mundo del modo actual, por número
  mundo: null, // mundo abierto
  n: 1, // número del mundo abierto
  idx: 0,
  programa: [],
  cursor: null, // dónde se añaden los bloques al tocarlos (null = al final); sirve para meterlos en un bucle
  corriendo: false,
  pistas: 0,
  falloIdx: -1,
  rot: 0, // giro acumulado de la flechita de orientación (para que no dé la vuelta larga)
};
const nivel = () => estado.mundo.niveles[estado.idx];
const modo = () => estado.perfil.modo;
const esMayor = () => modo() === 'mayor';
const tema = () => MUNDOS.find(m => m.n === estado.n).tema;
const cache = {};

/* ---------- Pantallas ---------- */

function mostrar(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.toggle('activa', p.id === id));
  document.body.dataset.pantalla = id.replace('pantalla-', '');
}

function pintarPerfiles() {
  callar();
  const cont = $('#perfiles');
  cont.innerHTML = '';
  for (const base of PERFILES) {
    const p = perfilCompleto(base);
    const b = document.createElement('button');
    b.className = 'tarjeta-perfil';
    b.style.setProperty('--color', p.color);
    b.setAttribute('aria-label', `Jugador de ${p.edad} años`);
    b.innerHTML = `<div class="cara">${avatarSVG(p.avatar)}</div>
      <span class="edad">${p.edad}</span>
      <span class="total">${estrellaSVG()}<b>${totalEstrellas(p.id)}</b></span>
      ${p.nombre ? `<span class="nombre">${p.nombre.replace(/[<>&"]/g, '')}</span>` : ''}`;
    b.addEventListener('click', () => elegirPerfil(p));
    cont.append(b);
  }
  mostrar('pantalla-perfiles');
}

async function elegirPerfil(p) {
  desbloquearAudio();
  estado.perfil = p;
  document.body.dataset.modo = p.modo;
  try {
    if (!cache[p.modo]) {
      const jugables = MUNDOS.filter(m => !m.proximamente);
      const datos = await Promise.all(jugables.map(m => fetch(`niveles/mundo${m.n}-${p.modo}.json`).then(r => r.json())));
      cache[p.modo] = Object.fromEntries(jugables.map((m, i) => [m.n, datos[i]]));
    }
  } catch {
    hablar('Vaya, no he podido cargar los niveles.');
    return;
  }
  estado.mundos = cache[p.modo];
  pintarMundos();
  const hola = p.nombre ? `¡Hola, ${p.nombre}!` : '¡Hola!';
  hablar(`${hola} ¿A dónde vamos hoy?`);
}

/* ---------- Mapa de mundos ---------- */

const completo = n => estado.mundos[n]?.niveles.every(nv => estrellasDe(estado.perfil.id, nv.id) > 0);
const mundoAbierto = n => n === 1 || (!!estado.mundos[n] && completo(n - 1));
const estrellasMundo = n => estado.mundos[n].niveles.reduce((a, nv) => a + estrellasDe(estado.perfil.id, nv.id), 0);

function pintarMundos() {
  $('#avatar-mundos').innerHTML = avatarSVG(estado.perfil.avatar);
  const cont = $('#mundos');
  cont.innerHTML = '';
  for (const m of MUNDOS) {
    const b = document.createElement('button');
    const abierto = !m.proximamente && mundoAbierto(m.n);
    b.className = 'tarjeta-mundo' + (abierto ? '' : ' bloqueado') + (m.proximamente ? ' proximamente' : '');
    b.style.setProperty('--color', m.color);
    b.setAttribute('aria-label', m.nombre);
    const total = m.proximamente ? '' : `${estrellaSVG()}<b>${estrellasMundo(m.n)}/${estado.mundos[m.n].niveles.length * 3}</b>`;
    b.innerHTML = `<span class="mundo-num">${m.n}</span>
      <div class="mundo-arte">${m.proximamente ? '<span class="mundo-candado">⏳</span>' : TEMAS[m.tema].meta}${!abierto && !m.proximamente ? '<span class="mundo-candado">🔒</span>' : ''}</div>
      <span class="mundo-nombre">${m.nombre}</span>
      <span class="mundo-estrellas">${total}</span>`;
    b.addEventListener('click', () => {
      desbloquearAudio();
      if (m.proximamente) { sonido('no'); hablar('Este mundo llegará muy pronto.'); return; }
      if (!abierto) { sonido('no'); hablar('Primero termina el mundo anterior.'); return; }
      elegirMundo(m.n);
    });
    cont.append(b);
  }
  const total = totalEstrellas(estado.perfil.id);
  $('#aviso-armario').hidden = desbloqueados(total).length <= premiosVistos(estado.perfil.id);
  $('#cuenta-album').textContent = `${POSTALES.filter(pt => completo(pt.n)).length}/${POSTALES.length}`;
  mostrar('pantalla-mundos');
}

/* ---------- Armario ---------- */

const VISTA_PREMIO = { sombrero: '2 -6 96 64', gafas: '20 26 60 40', capa: '0 -6 100 116', mascota: '30 40 70 70' };
const llevaPuesto = (a, p) => a[p.clave] === p.valor || (a[p.clave] === true && (p.valor === 'roja' || p.valor === 'lagartija'));

function refrescarPerfil() {
  estado.perfil = perfilCompleto(PERFILES.find(p => p.id === estado.perfil.id));
}

function pintarArmario() {
  const total = totalEstrellas(estado.perfil.id);
  const vistos = premiosVistos(estado.perfil.id);
  const a = estado.perfil.avatar;
  $('#armario-avatar').innerHTML = avatarSVG(a);
  $('#armario-total').innerHTML = `${estrellaSVG()}${total}`;
  const cont = $('#armario-premios');
  cont.innerHTML = '';
  PREMIOS.forEach((p, i) => {
    const abierto = total >= p.estrellas;
    const b = document.createElement('button');
    b.className = 'premio' + (abierto ? '' : ' bloqueado') + (abierto && llevaPuesto(a, p) ? ' puesto' : '')
      + (abierto && i >= vistos && desbloqueados(total).length > vistos ? ' nuevo' : '');
    b.setAttribute('aria-label', p.nombre);
    b.innerHTML = avatarSVG({ ...a, [p.clave]: p.valor }, { viewBox: VISTA_PREMIO[p.clave] })
      + (abierto ? '' : `<span class="coste">${estrellaSVG()}${p.estrellas}</span>`);
    b.addEventListener('click', () => {
      desbloquearAudio();
      if (!abierto) {
        sonido('no');
        hablar(`Para ${p.nombre} necesitas ${p.estrellas} estrellas. ¡Tienes ${total}!`);
        return;
      }
      const quitar = llevaPuesto(a, p);
      guardarAvatar(estado.perfil.id, { ...a, [p.clave]: quitar ? SIN[p.clave] : p.valor });
      refrescarPerfil();
      sonido(quitar ? 'quitar' : 'premio');
      if (!quitar) hablar(`¡Te queda genial ${p.nombre}!`);
      pintarArmario();
    });
    cont.append(b);
  });
  marcarPremiosVistos(estado.perfil.id, desbloqueados(total).length);
  mostrar('pantalla-armario');
}

/* ---------- Álbum de Jaén ---------- */

function pintarAlbum() {
  const cont = $('#album');
  cont.innerHTML = '';
  for (const pt of POSTALES) {
    const b = document.createElement('button');
    const abierta = completo(pt.n);
    b.className = 'postal' + (abierta ? '' : ' bloqueada');
    b.setAttribute('aria-label', abierta ? pt.titulo : `Postal ${pt.n}`);
    b.innerHTML = abierta ? `${postalSVG(pt.n)}<span>${pt.titulo}</span>` : `<div class="hueco-postal">${pt.n}</div><span>?</span>`;
    b.addEventListener('click', () => {
      desbloquearAudio();
      if (!abierta) { sonido('no'); hablar('Termina este mundo para conseguir su postal.'); return; }
      abrirPostal(pt);
    });
    cont.append(b);
  }
  mostrar('pantalla-album');
}

function abrirPostal(pt) {
  $('#postal-imagen').innerHTML = postalSVG(pt.n);
  $('#postal-titulo').textContent = pt.titulo;
  $('#postal-texto').textContent = pt.texto;
  $('#postal').classList.add('activa');
  sonido('pagina');
  hablar(`${pt.titulo}. ${pt.texto}`);
}

function elegirMundo(n) {
  estado.n = n;
  estado.mundo = estado.mundos[n];
  pintarInicio();
  hablar(estado.mundo.nombre);
}

function desbloqueado(i) {
  return i === 0 || estrellasDe(estado.perfil.id, estado.mundo.niveles[i - 1].id) > 0;
}

function pintarInicio() {
  $('#avatar-portada').innerHTML = avatarSVG(estado.perfil.avatar);
  $('#lagarto-portada').innerHTML = TEMAS[tema()].meta;
  $('#titulo-mundo').textContent = estado.mundo.nombre;
  const cont = $('#niveles');
  cont.innerHTML = '';
  estado.mundo.niveles.forEach((nv, i) => {
    const b = document.createElement('button');
    const est = estrellasDe(estado.perfil.id, nv.id);
    const abierto = desbloqueado(i);
    b.className = 'tarjeta-nivel' + (abierto ? '' : ' bloqueado');
    b.setAttribute('aria-label', `Nivel ${i + 1}`);
    b.innerHTML = `<span>${abierto ? i + 1 : '🔒'}</span>
      <span class="mini-estrellas">${[1, 2, 3].map(n => estrellaSVG(n <= est)).join('')}</span>`;
    b.addEventListener('click', () => {
      desbloquearAudio();
      if (!abierto) { sonido('no'); hablar('Primero termina el nivel anterior.'); return; }
      abrirNivel(i);
    });
    cont.append(b);
  });
  mostrar('pantalla-inicio');
}

function siguientePendiente() {
  const nv = estado.mundo.niveles;
  for (let i = 0; i < nv.length; i++) {
    if (desbloqueado(i) && estrellasDe(estado.perfil.id, nv[i].id) === 0) return i;
  }
  return 0;
}

/* ---------- Tablero ---------- */

function construirTablero() {
  const t = $('#tablero');
  const nv = nivel();
  const [cols, filas] = nv.tam;
  t.innerHTML = '';
  t.className = `tablero tema-${tema()}`;
  t.style.setProperty('--cols', cols);
  t.style.setProperty('--filas', filas);
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < cols; x++) {
      const c = document.createElement('div');
      c.className = 'casilla' + ((x + y) % 2 ? ' oscura' : '');
      c.dataset.x = x; c.dataset.y = y;
      if (esObstaculo(nv, x, y)) { c.classList.add('obstaculo'); c.innerHTML = TEMAS[tema()].obstaculo(x, y); }
      if (enMeta(nv, x, y)) { c.classList.add('meta'); c.innerHTML = TEMAS[tema()].meta; }
      t.append(c);
    }
  }
  const av = document.createElement('div');
  av.id = 'avatar';
  av.innerHTML = `<div class="cuerpo">${avatarSVG(estado.perfil.avatar)}</div>`
    + (esMayor() ? `<div class="rumbo">${flechaSVG('arriba')}</div>` : '');
  t.append(av);
  ponerObjetos();
  ajustarTablero();
}

// Aceitunas, llaves y puertas en el tablero, y la cesta (se reponen antes de cada intento).
function ponerObjetos() {
  const nv = nivel();
  document.querySelectorAll('.casilla .item').forEach(e => e.remove());
  const poner = (lista, tipo, arte) => lista.forEach(([x, y], i) => {
    const it = document.createElement('div');
    it.className = `item ${tipo}`;
    it.dataset.i = i;
    it.innerHTML = arte(i);
    $(`.casilla[data-x="${x}"][data-y="${y}"]`).append(it);
  });
  poner(aceitunas(nv), 'aceituna', () => aceitunaSVG);
  poner(llaves(nv), 'llave', i => llaveSVG(i));
  puertas(nv).forEach(([x, y], i) => {
    const c = $(`.casilla[data-x="${x}"][data-y="${y}"]`);
    c.classList.add('puerta');
    c.classList.remove('abierta');
    c.innerHTML = puertaSVG(i);
  });
  $('#cesta').innerHTML = aceitunas(nv).map((_, i) => `<span class="hueco-objeto aceituna" data-i="${i}">${aceitunaSVG}</span>`).join('')
    + llaves(nv).map((_, i) => `<span class="hueco-objeto llave" data-i="${i}">${llaveSVG(i)}</span>`).join('');
}

function recogerObjeto({ tipo, i }) {
  sonido('recoger');
  $(`.casilla .item.${tipo}[data-i="${i}"]`)?.classList.add('recogida');
  $(`#cesta .hueco-objeto.${tipo}[data-i="${i}"]`)?.classList.add('llena');
}

function abrirPuertaVisual(i) {
  const [x, y] = puertas(nivel())[i];
  const c = $(`.casilla[data-x="${x}"][data-y="${y}"]`);
  if (c.classList.contains('abierta')) return;
  sonido('puerta');
  c.classList.add('abierta');
  c.innerHTML = puertaSVG(i, true);
}

function ajustarTablero() {
  if (!estado.mundo || !$('#pantalla-juego').classList.contains('activa')) return;
  const [cols, filas] = nivel().tam;
  const r = $('#marco').getBoundingClientRect();
  const celda = Math.floor(Math.min((r.width - 16) / cols, (r.height - 16) / filas, 120));
  $('#tablero').style.setProperty('--celda', `${Math.max(celda, 28)}px`);
}

const avatar = () => $('#avatar');

function colocarAvatar(s, animar = true) {
  const av = avatar();
  if (!animar) av.classList.add('sin-anim');
  av.style.setProperty('--x', s.x);
  av.style.setProperty('--y', s.y);
  if (!animar) { void av.offsetWidth; av.classList.remove('sin-anim'); }
}

// Orienta al avatar: se voltea al mirar a izquierda/derecha y la flechita señala el rumbo.
function orientar(dir, giro = 0) {
  const av = avatar();
  if (dir === 'izquierda') av.classList.add('izq');
  if (dir === 'derecha') av.classList.remove('izq');
  estado.rot = giro ? estado.rot + giro : ANGULO[dir];
  av.style.setProperty('--rot', `${estado.rot}deg`);
}

function reiniciarAvatar() {
  const s = estadoInicial(nivel());
  const av = avatar();
  av.classList.add('sin-anim');
  av.classList.remove('izq');
  orientar(s.dir);
  colocarAvatar(s, false);
  void av.offsetWidth;
  av.classList.remove('sin-anim');
}

function setCara(cara) {
  const av = avatar();
  av.classList.remove('feliz', 'sorpresa');
  if (cara !== 'normal') av.classList.add(cara);
}

function limpiarPista() {
  document.querySelectorAll('.pista').forEach(e => e.classList.remove('pista'));
}

/* ---------- Bloques y programa ---------- */

function crearBloque(b) {
  const el = document.createElement('div');
  el.className = 'bloque';
  el.dataset.b = b;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', nombreBloque(b));
  el.innerHTML = iconoBloque(b);
  return el;
}

function montarPaleta() {
  const p = $('#paleta');
  p.innerHTML = '';
  for (const b of bloquesDe(nivel(), modo())) {
    const el = crearBloque(b);
    hacerArrastrable(el, { origen: 'paleta', b });
    p.append(el);
  }
}

// Profundidad de bucle de cada bloque (la cabecera y el fin pertenecen a su propio bucle).
function profundidades(prog) {
  const pares = emparejar(prog);
  const prof = new Array(prog.length).fill(0);
  for (const [ini, fin] of pares) for (let k = ini; k <= Math.min(fin, prog.length - 1); k++) prof[k]++;
  return prof;
}

function renderPrograma() {
  const bar = $('#programa');
  const max = MAX_BLOQUES[modo()];
  const prog = estado.programa;
  const prof = profundidades(prog);
  bar.innerHTML = '';
  prog.forEach((b, i) => {
    if (i === estado.cursor) bar.append(cursorEl());
    const el = crearBloque(b);
    el.classList.add('en-programa');
    if (prof[i]) { el.classList.add('en-bucle'); el.style.setProperty('--nivel', prof[i]); }
    if (i === estado.falloIdx) el.classList.add('fallo');
    hacerArrastrable(el, { origen: 'programa', b, indice: i });
    bar.append(el);
  });
  const huecos = Math.max(1, 6 - contarBloques(prog));
  for (let i = 0; i < huecos && contarBloques(prog) + i < max; i++) {
    const h = document.createElement('div');
    h.className = 'hueco';
    bar.append(h);
  }
  $('#btn-ya').disabled = prog.length === 0;
  $('#btn-borrar').disabled = prog.length === 0;

  const reto = $('#reto');
  const n = contarBloques(prog);
  if (esMayor() && nivel().reto) {
    reto.innerHTML = `🎯 <b>${n}</b>/${nivel().reto}`;
    reto.classList.toggle('pasado', n > nivel().reto);
  } else reto.innerHTML = '';
}

function cursorEl() {
  const c = document.createElement('div');
  c.className = 'cursor';
  return c;
}

function programaCambiado() {
  estado.falloIdx = -1;
  limpiarPista();
  if (!estado.corriendo) setCara('normal');
  renderPrograma();
}

// Inserta un bloque en la posición i. 'repetir' crea un bucle vacío y deja el cursor dentro.
function insertar(i, b, desdeToque = false) {
  if (contarBloques(estado.programa) >= MAX_BLOQUES[modo()]) {
    sonido('no');
    $('#programa').classList.add('lleno');
    setTimeout(() => $('#programa').classList.remove('lleno'), 500);
    return;
  }
  if (b === 'repetir') {
    estado.programa.splice(i, 0, 'repetir2', 'fin');
    estado.cursor = i + 1;
  } else {
    estado.programa.splice(i, 0, b);
    estado.cursor = desdeToque && estado.cursor !== null ? i + 1 : null;
  }
  if (estado.cursor !== null && estado.cursor >= estado.programa.length) estado.cursor = null;
  sonido('clic');
  programaCambiado();
  const nuevo = $('#programa').querySelectorAll('.bloque')[i];
  if (nuevo) { nuevo.classList.add('entra'); nuevo.scrollIntoView({ inline: 'nearest', block: 'nearest' }); }
  if (b === 'repetir' && esMayor()) decir('Ahora pon dentro los bloques que quieres repetir. Toca el bloque repetir para cambiar las veces.');
}

// Quitar un bloque. Si es la cabecera de un bucle, se quita también su fin (el cuerpo se queda).
function quitar(i) {
  const prog = estado.programa;
  if (esRepetir(prog[i])) {
    const fin = emparejar(prog).get(i);
    if (fin < prog.length) prog.splice(fin, 1);
  }
  prog.splice(i, 1);
  estado.programa = normalizar(prog);
  estado.cursor = null;
  sonido('quitar');
  programaCambiado();
}

// Tocar un bloque del programa: cambia las veces de un bucle, sale de un bucle (fin) o quita el bloque.
function tocarEnPrograma(i) {
  const b = estado.programa[i];
  if (esRepetir(b)) {
    estado.programa[i] = `repetir${veces(b) >= 9 ? 2 : veces(b) + 1}`;
    sonido('clic');
    programaCambiado();
    hablar(`${veces(estado.programa[i])} veces`);
  } else if (b === 'fin') {
    estado.cursor = i + 1 >= estado.programa.length ? null : i + 1;
    sonido('clic');
    renderPrograma();
  } else quitar(i);
}

function borrarUltimo() {
  const pos = (estado.cursor ?? estado.programa.length) - 1;
  if (pos < 0) return;
  if (estado.programa[pos] === 'fin') { estado.cursor = pos; sonido('clic'); renderPrograma(); return; } // entrar al bucle
  const quedaCursor = estado.cursor !== null;
  quitar(pos);
  if (quedaCursor && pos < estado.programa.length) { estado.cursor = pos; renderPrograma(); }
}

function indiceInsercion(x, y, excluir) {
  const bar = $('#programa');
  const r = bar.getBoundingClientRect();
  const m = 40;
  if (x < r.left - m || x > r.right + m || y < r.top - m * 2 || y > r.bottom + m) return null;
  let i = 0;
  for (const el of bar.querySelectorAll('.bloque')) {
    if (el === excluir) continue;
    const br = el.getBoundingClientRect();
    if (x > br.left + br.width / 2) i++;
  }
  return i;
}

// Tocar = añadir (paleta) o quitar (programa). Arrastrar = colocar donde se suelte.
function hacerArrastrable(el, { origen, b, indice }) {
  el.addEventListener('pointerdown', e => {
    if (estado.corriendo || e.button > 0) return;
    e.preventDefault();
    desbloquearAudio();
    const x0 = e.clientX, y0 = e.clientY;
    let fantasma = null;
    try { el.setPointerCapture(e.pointerId); } catch { /* nada */ }
    el.classList.add('pulsado');

    const mover = ev => {
      if (!fantasma && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) {
        fantasma = crearBloque(b);
        fantasma.classList.add('fantasma');
        document.body.append(fantasma);
        if (origen === 'programa') el.classList.add('arrastrando');
      }
      if (fantasma) {
        fantasma.style.left = ev.clientX + 'px';
        fantasma.style.top = ev.clientY + 'px';
        $('#programa').classList.toggle('objetivo', indiceInsercion(ev.clientX, ev.clientY, el) !== null);
      }
    };
    const fin = ev => {
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', fin);
      el.removeEventListener('pointercancel', fin);
      el.classList.remove('pulsado', 'arrastrando');
      $('#programa').classList.remove('objetivo');
      if (!fantasma) {
        if (ev.type === 'pointercancel') return;
        if (origen === 'paleta') insertar(estado.cursor ?? estado.programa.length, b, true);
        else tocarEnPrograma(indice);
        return;
      }
      fantasma.remove();
      const i = ev.type === 'pointercancel' ? null : indiceInsercion(ev.clientX, ev.clientY, el);
      if (origen === 'paleta') {
        if (i !== null) insertar(i, b);
      } else {
        if (i === null) quitar(indice);
        else {
          estado.programa.splice(indice, 1);
          estado.programa.splice(i, 0, b);
          estado.programa = normalizar(estado.programa);
          estado.cursor = null;
          sonido('clic');
          programaCambiado();
        }
      }
    };
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerup', fin);
    el.addEventListener('pointercancel', fin);
  });
}

/* ---------- Ejecución ---------- */

async function chocar(s, n) {
  const av = avatar();
  setCara('sorpresa');
  av.style.setProperty('--x', s.x + (n.x - s.x) * 0.35);
  av.style.setProperty('--y', s.y + (n.y - s.y) * 0.35);
  await esperar(200);
  av.classList.add('choque');
  colocarAvatar(s);
  await esperar(500);
  av.classList.remove('choque');
}

async function ejecutar() {
  if (estado.corriendo || !estado.programa.length) return;
  desbloquearAudio();
  callar();
  estado.corriendo = true;
  document.body.classList.add('corriendo');
  estado.falloIdx = -1;
  limpiarPista();
  renderPrograma();
  setCara('normal');
  reiniciarAvatar();
  await esperar(250);

  const nv = nivel();
  const bloques = [...document.querySelectorAll('#programa .bloque')];
  let s = estadoInicial(nv);
  let resultado = 'corto';
  let usados = 0;
  ponerObjetos();

  for (const p of desplegar(estado.programa)) {
    const i = p.idx;
    const b = p.b;
    bloques.forEach(el => el.classList.remove('activo'));
    bloques[i].classList.add('activo');
    bloques[i].scrollIntoView({ inline: 'nearest', block: 'nearest' });
    if (b === 'bucle') { // nueva vuelta: se muestra en la cabecera del bucle
      bloques[i].dataset.vuelta = `${p.vuelta}/${p.total}`;
      sonido('vuelta');
      await esperar(260);
      continue;
    }
    const r = aplicar(nv, modo(), s, b);
    usados++;

    if (r.evento === 'girar') {
      sonido('giro');
      orientar(r.s.dir, b === 'izq' ? -90 : 90);
      s = r.s;
      await esperar(420);
      continue;
    }
    if (r.evento === 'recoger' || r.evento === 'nada') {
      const av = avatar();
      av.classList.add('agacha');
      await esperar(250);
      av.classList.remove('agacha');
      if (r.evento === 'nada') {
        sonido('no');
        setCara('sorpresa');
        estado.falloIdx = i;
        resultado = 'nada';
        break;
      }
      recogerObjeto(r.recogido);
      s = r.s;
      await esperar(300);
    } else {
      if (!esMayor()) orientar((r.intento || r.s).dir);
      await esperar(120);
      if (r.evento === 'choque' || r.evento === 'puerta') {
        sonido('choque');
        await chocar(s, r.intento);
        estado.falloIdx = i;
        resultado = r.evento;
        break;
      }
      if (r.abre >= 0) abrirPuertaVisual(r.abre);
      s = r.s;
      sonido('paso');
      colocarAvatar(s);
      await esperar(380);
      if (r.recogido) { recogerObjeto(r.recogido); await esperar(120); }
    }
    if (llego(nv, s)) { resultado = 'meta'; estado.usados = usados; break; }
  }
  bloques.forEach(el => delete el.dataset.vuelta);
  if (resultado === 'corto' && enMeta(nv, s.x, s.y)) resultado = 'faltan';
  bloques.forEach(el => el.classList.remove('activo'));

  if (resultado === 'meta') await exito(estado.usados);
  else await fallo(resultado);

  estado.corriendo = false;
  document.body.classList.remove('corriendo');
}

function decir(frase) {
  $('#bocadillo').textContent = frase;
  hablar(frase);
}

async function fallo(tipo) {
  setCara('sorpresa');
  renderPrograma(); // marca el bloque que ha fallado
  sonido('casi');
  decir({
    choque: '¡Uy, un choque! ¡Casi! ¿Lo intentamos otra vez?',
    nada: '¡Uy! Aquí no hay nada que recoger.',
    puerta: '¡La puerta está cerrada! Primero tienes que coger su llave.',
    faltan: '¡Casi! Te faltan aceitunas por recoger. ¿Lo intentamos otra vez?',
  }[tipo] || '¡Casi! Te falta un poquito. ¿Lo intentamos otra vez?');
  await esperar(1200);
  setCara('normal');
}

// Pequeño: 3 si lo hace con el mínimo y sin pistas (nunca menos de 1).
// Mayor: 1 por llegar + 1 sin pistas + 1 por cumplir el reto de bloques.
function calcularEstrellas(usados) {
  const nv = nivel();
  if (esMayor()) {
    const logros = { sinPistas: estado.pistas === 0, reto: contarBloques(estado.programa) <= nv.reto };
    return { n: 1 + logros.sinPistas + logros.reto, logros };
  }
  let n = 3;
  if (usados > nv.optimo) n--;
  if (estado.pistas > 0) n--;
  return { n: Math.max(1, n) };
}

async function exito(usados) {
  setCara('feliz');
  sonido('exito');
  $('.casilla.meta')?.classList.add('celebra');
  const est = calcularEstrellas(usados);
  const antes = totalEstrellas(estado.perfil.id);
  const mundoAntes = completo(estado.n);
  guardarEstrellas(estado.perfil.id, nivel().id, est.n);
  est.premios = nuevos(antes, totalEstrellas(estado.perfil.id));
  est.postal = !mundoAntes && completo(estado.n);
  await esperar(700);
  mostrarCelebracion(est);
}

function mostrarCelebracion({ n, logros, premios = [], postal = false }) {
  const ultimo = estado.idx === estado.mundo.niveles.length - 1;
  $('#cele-avatar').innerHTML = avatarSVG(estado.perfil.avatar);
  $('#cele-estrellas').innerHTML = [1, 2, 3].map(k =>
    `<span class="estrella ${k <= n ? 'on' : ''}" style="animation-delay:${0.25 + k * 0.3}s">${estrellaSVG(k <= n)}</span>`
  ).join('');
  $('#cele-logros').innerHTML = logros
    ? `<span class="logro ok">✔ Llegar</span>
       <span class="logro ${logros.sinPistas ? 'ok' : ''}">💡 Sin pistas</span>
       <span class="logro ${logros.reto ? 'ok' : ''}">🎯 ${nivel().reto} bloques o menos</span>`
    : '';
  const premio = premios[premios.length - 1];
  $('#cele-premio').innerHTML = (premio
    ? `<span class="mini">${avatarSVG({ ...estado.perfil.avatar, [premio.clave]: premio.valor }, { viewBox: VISTA_PREMIO[premio.clave] })}</span><b>¡Nuevo premio! 👕</b>` : '')
    + (postal ? `<span class="mini">${postalSVG(estado.n)}</span><b>¡Postal nueva! 📖</b>` : '');
  if (premio || postal) setTimeout(() => sonido('premio'), 1400);
  $('#btn-siguiente').innerHTML = ultimo ? '<span class="icono-casa">🏠</span>' : triangulo;
  $('#celebracion').classList.add('activa');
  for (let k = 1; k <= n; k++) setTimeout(() => sonido('estrella'), 250 + k * 300);
  confeti();

  const destino = { magdalena: ' ¡Has llegado a la fuente!', olivar: ' ¡Las aceitunas ya están en la almazara!', plaza: ' ¡Has llegado a la Catedral!', banos: ' ¡Has llegado a la sala caliente!', castillo: ' ¡Has llegado a la Cruz!' }[tema()];
  let frase = ['', '¡Lo conseguiste!', '¡Muy bien!', '¡Perfecto!'][n] + destino;
  if (logros && !logros.reto) frase += ` ¿Te atreves a hacerlo con ${nivel().reto} bloques o menos?`;
  else if (logros && !logros.sinPistas) frase += ' ¿Y sin pistas?';
  let extra = '';
  if (premio) extra += ` ¡Y has ganado ${premio.nombre}! Póntelo en el armario.`;
  if (postal) extra += ' ¡Tienes una postal nueva en el álbum de Jaén!';
  if (ultimo) {
    const sig = MUNDOS.find(m => m.n === estado.n + 1);
    const nuevo = sig && !sig.proximamente && mundoAbierto(sig.n) ? ` ¡Y has desbloqueado un mundo nuevo: ${sig.nombre}!` : '';
    hablar(estado.mundo.final + nuevo + extra);
  } else hablar(frase + extra);
}

function confeti() {
  const colores = ['#ffcc33', '#e4572e', '#43a047', '#3d8bd9', '#8e5bc9', '#6b8e23'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'confeti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colores[i % colores.length];
    c.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
    c.style.animationDelay = Math.random() * 0.5 + 's';
    c.style.setProperty('--giro', (Math.random() * 720 - 360) + 'deg');
    document.body.append(c);
    setTimeout(() => c.remove(), 4500);
  }
}

/* ---------- Pistas ---------- */

function pista() {
  if (estado.corriendo) return;
  desbloquearAudio();
  limpiarPista();
  const nv = nivel();
  const sim = simular(nv, modo(), estado.programa);
  if (['choque', 'nada', 'puerta'].includes(sim.resultado)) {
    estado.pistas++;
    estado.falloIdx = sim.falloIdx;
    renderPrograma();
    decir({
      choque: 'Este bloque te hace chocar. Tócalo para quitarlo.',
      nada: 'Aquí no hay nada que recoger. Quita este bloque tocándolo.',
      puerta: 'Esta puerta sigue cerrada. ¡Primero coge la llave de su color!',
    }[sim.resultado]);
    return;
  }
  if (sim.resultado === 'meta') {
    $('#btn-ya').classList.add('pista');
    decir('¡Ya llegas! Pulsa el botón verde.');
    return;
  }
  const sol = resolver(nv, modo(), sim.s);
  if (!sol || !sol.length) return;
  estado.pistas++;
  const b = sol[0];
  $(`#paleta .bloque[data-b="${b}"]`)?.classList.add('pista');
  if (b === 'recoger') {
    decir('¡Hay algo aquí mismo! Usa el bloque de recoger.');
  } else if (mueve(b)) {
    const n = paso(sim.s, b);
    $(`.casilla[data-x="${n.x}"][data-y="${n.y}"]`)?.classList.add('pista');
    decir(esMayor() ? 'Avanza hacia la casilla que brilla.' : 'Mira la casilla que brilla. ¿Qué flecha lleva hasta allí?');
  } else {
    decir(`Ahora toca girar. Prueba con el bloque que brilla: ${b === 'izq' ? 'girar a la izquierda' : 'girar a la derecha'}.`);
  }
}

/* ---------- Niveles ---------- */

function abrirNivel(i) {
  callar();
  estado.idx = i;
  estado.programa = [];
  estado.cursor = null;
  estado.pistas = 0;
  estado.falloIdx = -1;
  $('#celebracion').classList.remove('activa');
  mostrar('pantalla-juego');
  montarPaleta();
  construirTablero();
  renderPrograma();
  reiniciarAvatar();
  setCara('normal');
  $('#bocadillo').textContent = nivel().texto;
  hablar(nivel().voz);
}

function explicar() {
  desbloquearAudio();
  $('#bocadillo').textContent = nivel().texto;
  hablar(nivel().voz);
}

function pintarSilencio() {
  $('#btn-silencio').textContent = estaSilenciado() ? '🔇' : '🔈';
}

/* ---------- Arranque ---------- */

function init() {
  $('#paisaje').innerHTML = paisajeSVG();
  $('#lagarto-guia').innerHTML = lagartoSVG;
  $('#btn-jugar').innerHTML = triangulo;
  $('#btn-ya').innerHTML = `${triangulo}<span>¡Ya!</span>`;
  $('#btn-borrar').innerHTML = borrarSVG;
  pintarSilencio();

  iniciarPadres({ mostrar, alSalir: pintarPerfiles });
  $('#btn-armario').addEventListener('click', () => { desbloquearAudio(); callar(); pintarArmario(); });
  $('#btn-album').addEventListener('click', () => { desbloquearAudio(); callar(); pintarAlbum(); });
  document.querySelectorAll('.volver-mundos').forEach(b => b.addEventListener('click', () => { desbloquearAudio(); callar(); pintarMundos(); }));
  $('#postal-cerrar').addEventListener('click', () => { callar(); $('#postal').classList.remove('activa'); });
  $('#postal-voz').addEventListener('click', () => hablar(`${$('#postal-titulo').textContent}. ${$('#postal-texto').textContent}`));
  $('#btn-padres').addEventListener('click', abrirPuerta);
  $('#btn-perfiles').addEventListener('click', () => { desbloquearAudio(); pintarPerfiles(); });
  $('#btn-mundos').addEventListener('click', () => { desbloquearAudio(); callar(); pintarMundos(); });
  $('#btn-jugar').addEventListener('click', () => { desbloquearAudio(); abrirNivel(siguientePendiente()); });
  $('#btn-ya').addEventListener('click', ejecutar);
  $('#btn-borrar').addEventListener('click', () => {
    if (estado.corriendo || !estado.programa.length) return;
    desbloquearAudio();
    borrarUltimo();
  });
  $('#btn-pista').addEventListener('click', pista);
  $('#btn-voz').addEventListener('click', explicar);
  $('#lagarto-guia').addEventListener('click', explicar);
  $('#btn-casa').addEventListener('click', () => { if (!estado.corriendo) { callar(); pintarInicio(); } });
  $('#btn-silencio').addEventListener('click', () => { desbloquearAudio(); alternarSilencio(); pintarSilencio(); });
  $('#btn-repetir').addEventListener('click', () => { desbloquearAudio(); abrirNivel(estado.idx); });
  $('#btn-siguiente').addEventListener('click', () => {
    desbloquearAudio();
    if (estado.idx < estado.mundo.niveles.length - 1) abrirNivel(estado.idx + 1);
    else { $('#celebracion').classList.remove('activa'); pintarMundos(); }
  });
  window.addEventListener('resize', ajustarTablero);
  new ResizeObserver(ajustarTablero).observe($('#marco'));

  pintarPerfiles();
  prepararSinConexion();
}

// Guarda el juego en el dispositivo y pide que no se borre el progreso.
// Solo en https (la versión publicada). En local se prueba con ?sinconexion, para no ver copias viejas mientras se desarrolla.
function prepararSinConexion() {
  const seguro = location.protocol === 'https:' || new URLSearchParams(location.search).has('sinconexion');
  if (seguro && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* sin conexión no disponible */ });
  navigator.storage?.persist?.().catch(() => {});
}

init();
