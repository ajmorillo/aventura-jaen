// Modo padres: puerta con una multiplicación y editor de avatar por capas.
import { avatarSVG, PIELES, PELOS, OJOS, ROPA, GAFAS } from './avatar.js';
import { PERFILES, perfilCompleto } from './perfiles.js';
import { guardarPerfil, borrarProgreso } from './progreso.js';

const $ = s => document.querySelector(s);

const VISTA = {
  cara: '12 4 76 76',
  pelo: '6 -6 88 76',
  detalle: '24 30 52 38',
  ropa: '8 62 84 50',
  gorro: '2 -6 96 64',
  entero: '0 -6 100 116',
};

const ETIQUETAS = {
  true: 'Sí', false: 'No', ninguno: 'Nada', ninguna: 'Nada', numero: 'Número', corazon: 'Corazón',
  balon: 'Balón', moño: 'Moño', pincho: 'De punta', aceituna: 'Aceituna', sol: 'De sol',
  lado: 'De lado', picara: 'Pícara', lateral: 'Lados', banda: 'Banda',
};
const etiqueta = v => ETIQUETAS[v] ?? String(v).charAt(0).toUpperCase() + String(v).slice(1);

const SECCIONES = [
  { id: 'cara', titulo: 'Cara', grupos: [
    { titulo: 'Forma', clave: 'cara', valores: ['redonda', 'ovalada', 'cuadrada'], vista: VISTA.cara },
    { titulo: 'Tono de piel', clave: 'piel', colores: PIELES },
  ] },
  { id: 'pelo', titulo: 'Pelo', grupos: [
    { titulo: 'Peinado', clave: 'peinado', valores: ['corto', 'flequillo', 'lado', 'despeinado', 'rizos', 'coletas', 'largo', 'moño', 'pincho', 'rapado'], vista: VISTA.pelo },
    { titulo: 'Color', clave: 'pelo', colores: PELOS },
    { titulo: 'Reflejos', clave: 'reflejos', valores: [false, true], vista: VISTA.pelo, si: a => ['corto', 'flequillo', 'lado', 'despeinado'].includes(a.peinado) },
  ] },
  { id: 'ojos', titulo: 'Ojos', grupos: [
    { titulo: 'Color de ojos', clave: 'ojos', colores: OJOS },
    { titulo: 'Cejas', clave: 'cejas', valores: ['finas', 'normales', 'gruesas', 'ninguna'], vista: VISTA.detalle },
    { titulo: 'Gafas', clave: 'gafas', valores: ['ninguna', 'redondas', 'cuadradas', 'sol'], vista: VISTA.detalle },
    { titulo: 'Color de las gafas', clave: 'gafasColor', colores: GAFAS, si: a => a.gafas !== 'ninguna' },
  ] },
  { id: 'detalles', titulo: 'Detalles', grupos: [
    { titulo: 'Sonrisa', clave: 'boca', valores: ['suave', 'abierta', 'picara'], vista: VISTA.detalle },
    { titulo: 'Mella (se ve al sonreír)', clave: 'mella', valores: [false, true], vista: VISTA.detalle, expresion: 'feliz' },
    { titulo: 'Pecas', clave: 'pecas', valores: [false, true], vista: VISTA.detalle },
    { titulo: 'Lunar', clave: 'lunar', valores: [false, true], vista: VISTA.detalle },
  ] },
  { id: 'ropa', titulo: 'Ropa', grupos: [
    { titulo: 'Camiseta', clave: 'camiseta', colores: ROPA },
    { titulo: 'Dibujo', clave: 'estampado', valores: ['ninguno', 'banda', 'lateral', 'numero', 'estrella', 'corazon', 'rayo', 'balon', 'dino', 'aceituna'], vista: VISTA.ropa },
    { titulo: 'Color de la banda', clave: 'detalle', colores: ROPA, si: a => ['banda', 'lateral'].includes(a.estampado) },
    { titulo: 'Cuello', clave: 'cuello', colores: ['igual', ...ROPA] },
    { titulo: 'Número', clave: 'numero', tipo: 'numero', si: a => a.estampado === 'numero' },
    { titulo: 'Mochila', clave: 'mochila', valores: [false, true], vista: VISTA.entero },
    { titulo: 'Color de la mochila', clave: 'mochilaColor', colores: ROPA, si: a => a.mochila },
  ] },
  { id: 'extras', titulo: 'Extras', grupos: [
    { titulo: 'En la cabeza', clave: 'sombrero', valores: ['ninguno', 'gorra', 'pastor', 'pirata', 'corona', 'casco'], vista: VISTA.gorro },
    { titulo: 'Color de la gorra', clave: 'gorraColor', colores: ROPA, si: a => a.sombrero === 'gorra' },
    { titulo: 'Capa', clave: 'capa', valores: [false, 'roja', 'dorada'], vista: VISTA.entero },
    { titulo: 'Mascota', clave: 'mascota', valores: [false, 'lagartija', 'paloma'], vista: VISTA.entero },
  ] },
];

const EXPRESIONES = ['normal', 'feliz', 'sorpresa'];

let mostrar = () => {};
let alSalir = () => {};
let respuesta = 0;
let entrada = '';
let borradores = {};
let guardadoInicial = '';
let actual = PERFILES[0].id;
let seccion = SECCIONES[0].id;
let expresion = 0;

/* ---------- Puerta ---------- */

function nuevaPregunta() {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4); // 6×6 a 9×9: difícil para un niño de 8 años
  respuesta = a * b;
  entrada = '';
  $('#puerta-pregunta').textContent = `¿Cuánto es ${a} × ${b}?`;
  pintarEntrada();
}

function pintarEntrada() {
  $('#puerta-entrada').textContent = entrada || '·';
}

function pulsarTecla(t) {
  if (t === '⌫') entrada = entrada.slice(0, -1);
  else if (t === '✔') return comprobar();
  else if (entrada.length < 3) entrada += t;
  pintarEntrada();
}

function comprobar() {
  if (entrada && Number(entrada) === respuesta) {
    $('#puerta').classList.remove('activa');
    abrirEditor();
    return;
  }
  const tarjeta = $('#puerta .tarjeta');
  tarjeta.classList.remove('mal');
  void tarjeta.offsetWidth;
  tarjeta.classList.add('mal');
  nuevaPregunta();
}

export function abrirPuerta() {
  nuevaPregunta();
  $('#puerta').classList.add('activa');
}

/* ---------- Editor ---------- */

function abrirEditor() {
  borradores = Object.fromEntries(PERFILES.map(p => {
    const c = perfilCompleto(p);
    return [p.id, { avatar: { ...c.avatar }, nombre: c.nombre }];
  }));
  guardadoInicial = JSON.stringify(borradores);
  actual = PERFILES[0].id;
  seccion = SECCIONES[0].id;
  expresion = 0;
  pintarEditor();
  mostrar('pantalla-padres');
}

const borrador = () => borradores[actual];

function pintarEditor() {
  pintarPerfiles();
  pintarVista();
  pintarSecciones();
  pintarGrupos();
  $('#padres-nombre').value = borrador().nombre;
}

function pintarPerfiles() {
  const cont = $('#padres-perfiles');
  cont.innerHTML = '';
  for (const p of PERFILES) {
    const b = document.createElement('button');
    b.className = 'padres-perfil' + (p.id === actual ? ' elegido' : '');
    b.style.setProperty('--color', p.color);
    b.innerHTML = `${avatarSVG(borradores[p.id].avatar, { viewBox: VISTA.cara })}<span>${p.edad}</span>`;
    b.setAttribute('aria-label', `Editar jugador de ${p.edad} años`);
    b.addEventListener('click', () => { actual = p.id; pintarEditor(); });
    cont.append(b);
  }
}

function pintarVista() {
  const v = $('#padres-avatar');
  v.className = 'padres-avatar ' + EXPRESIONES[expresion];
  v.innerHTML = avatarSVG(borrador().avatar);
}

function pintarSecciones() {
  const cont = $('#padres-secciones');
  cont.innerHTML = '';
  for (const s of SECCIONES) {
    const b = document.createElement('button');
    b.className = 'pestana' + (s.id === seccion ? ' elegida' : '');
    b.textContent = s.titulo;
    b.addEventListener('click', () => { seccion = s.id; pintarSecciones(); pintarGrupos(); });
    cont.append(b);
  }
}

function cambiar(clave, valor) {
  borrador().avatar[clave] = valor;
  pintarVista();
  pintarPerfiles();
  pintarGrupos();
}

function pintarGrupos() {
  const a = borrador().avatar;
  const cont = $('#padres-grupos');
  const scroll = cont.scrollTop;
  cont.innerHTML = '';
  for (const g of SECCIONES.find(s => s.id === seccion).grupos) {
    if (g.si && !g.si(a)) continue;
    const grupo = document.createElement('div');
    grupo.className = 'grupo';
    grupo.innerHTML = `<h3>${g.titulo}</h3>`;
    const ops = document.createElement('div');
    ops.className = 'opciones';

    if (g.tipo === 'numero') {
      ops.innerHTML = `<button class="boton-redondo" data-d="-1">−</button><span class="numero-valor">${a.numero}</span><button class="boton-redondo" data-d="1">+</button>`;
      ops.querySelectorAll('button').forEach(b => b.addEventListener('click', () =>
        cambiar('numero', (a.numero + Number(b.dataset.d) + 100) % 100)));
    } else if (g.colores) {
      for (const c of g.colores) {
        const b = document.createElement('button');
        b.className = 'opcion color' + (a[g.clave] === c ? ' elegida' : '');
        b.style.background = c === 'igual' ? 'repeating-linear-gradient(45deg, #d8d2c4 0 4px, #fff 4px 8px)' : c;
        b.setAttribute('aria-label', c === 'igual' ? 'Sin color' : c);
        b.addEventListener('click', () => cambiar(g.clave, c));
        ops.append(b);
      }
    } else {
      for (const v of g.valores) {
        const b = document.createElement('button');
        b.className = 'opcion mini' + (a[g.clave] === v ? ' elegida' : '') + (g.expresion ? ' ' + g.expresion : '');
        b.innerHTML = `${avatarSVG({ ...a, [g.clave]: v }, { viewBox: g.vista })}<span>${etiqueta(v)}</span>`;
        b.addEventListener('click', () => cambiar(g.clave, v));
        ops.append(b);
      }
    }
    grupo.append(ops);
    cont.append(grupo);
  }
  cont.scrollTop = scroll;
}

function salir() {
  if (JSON.stringify(borradores) !== guardadoInicial && !confirm('¿Salir sin guardar los cambios?')) return;
  alSalir();
}

function guardar() {
  for (const p of PERFILES) guardarPerfil(p.id, borradores[p.id]);
  alSalir();
}

/* ---------- Arranque ---------- */

export function iniciarPadres(opciones) {
  ({ mostrar, alSalir } = opciones);
  const teclado = $('#puerta-teclado');
  for (const t of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✔']) {
    const b = document.createElement('button');
    b.className = 'tecla' + (t === '✔' ? ' ok' : '');
    b.textContent = t;
    b.addEventListener('click', () => pulsarTecla(t));
    teclado.append(b);
  }
  $('#puerta-cerrar').addEventListener('click', () => $('#puerta').classList.remove('activa'));
  $('#padres-cerrar').addEventListener('click', salir);
  $('#padres-guardar').addEventListener('click', guardar);
  $('#padres-avatar').addEventListener('click', () => { expresion = (expresion + 1) % EXPRESIONES.length; pintarVista(); });
  $('#padres-nombre').addEventListener('input', e => { borrador().nombre = e.target.value.trim(); });
  $('#padres-borrar').addEventListener('click', () => {
    const p = PERFILES.find(x => x.id === actual);
    const quien = borrador().nombre || `el jugador de ${p.edad} años`;
    if (confirm(`¿Borrar todas las estrellas de ${quien}? No se puede deshacer.`)) borrarProgreso(actual);
  });
}
