// Avatar en SVG por capas. Todas las opciones viven en un objeto plano (ver AVATAR_BASE).
// Las expresiones (normal, feliz, sorpresa) se cambian con clases CSS en un contenedor.

export const PIELES = ['#fde0c8', '#f7d1b0', '#f2c29b', '#eab38a', '#dca374', '#c98c5f', '#b07548', '#8f5b37', '#6e4428', '#4f301c'];
export const PELOS = ['#f3d27a', '#d9a949', '#b5793a', '#a0682f', '#7a4a22', '#5a3a1e', '#3b2615', '#1e1610', '#c4512c', '#9a9a9a'];
export const OJOS = ['#5b3a1f', '#2b1d12', '#8a6a2f', '#4f8a3c', '#3f7fc4', '#7d8a96'];
export const ROPA = ['#e4572e', '#3d8bd9', '#43a047', '#ffcc33', '#8e5bc9', '#f06292', '#1f9e8f', '#fbf7ee', '#37474f', '#ff8a3d'];
export const GAFAS = ['#2b2b2b', '#c8553d', '#3d8bd9', '#8e5bc9', '#d4a017'];

export const AVATAR_BASE = {
  cara: 'redonda', piel: '#f2c29b',
  peinado: 'corto', pelo: '#5a3a1e',
  ojos: '#5b3a1f', cejas: 'normales', gafas: 'ninguna', gafasColor: '#2b2b2b',
  pecas: false, mella: false, lunar: false,
  camiseta: '#e4572e', estampado: 'ninguno', numero: 7,
  sombrero: 'ninguno', gorraColor: '#3d8bd9',
  mochila: false, mochilaColor: '#ffcc33',
  capa: false, mascota: false,
};

// ---------- Piezas ----------

function cabeza(a) {
  if (a.cara === 'ovalada') return `<ellipse cx="50" cy="47" rx="24" ry="28" fill="${a.piel}"/>`;
  if (a.cara === 'cuadrada') return `<rect x="24" y="21" width="52" height="51" rx="17" fill="${a.piel}"/>`;
  return `<circle cx="50" cy="46" r="26" fill="${a.piel}"/>`;
}

function rizos(cx, cy, radio, desde, hasta, n, r, color) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const ang = (desde + (hasta - desde) * (i / (n - 1))) * Math.PI / 180;
    s += `<circle cx="${(cx + radio * Math.cos(ang)).toFixed(1)}" cy="${(cy + radio * Math.sin(ang)).toFixed(1)}" r="${r}" fill="${color}"/>`;
  }
  return s;
}

function peloDetras(a) {
  const c = a.pelo;
  switch (a.peinado) {
    case 'largo': return `<path d="M20 46 Q16 14 50 14 Q84 14 80 46 L83 86 Q66 92 50 90 Q34 92 17 86 Z" fill="${c}"/>`;
    case 'coletas': return `<circle cx="16" cy="44" r="11" fill="${c}"/><circle cx="84" cy="44" r="11" fill="${c}"/>
      <circle cx="12" cy="56" r="8" fill="${c}"/><circle cx="88" cy="56" r="8" fill="${c}"/>
      <circle cx="23" cy="38" r="3.5" fill="#f06292"/><circle cx="77" cy="38" r="3.5" fill="#f06292"/>`;
    case 'rizos': return rizos(50, 46, 28, 150, 390, 12, 9, c);
    case 'moño': return `<circle cx="50" cy="13" r="10" fill="${c}"/>`;
    default: return '';
  }
}

function peloDelante(a) {
  const c = a.pelo;
  switch (a.peinado) {
    case 'flequillo': return `<path d="M22 50 Q19 14 50 14 Q81 14 78 50 L75 50 Q74 39 66 37 L34 37 Q26 39 25 50 Z" fill="${c}"/>`;
    case 'rizos': return `<path d="M24 44 Q22 16 50 16 Q78 16 76 44 Q70 30 50 30 Q30 30 24 44 Z" fill="${c}"/>`
      + rizos(50, 44, 24, 195, 345, 8, 7, c);
    case 'coletas': return `<path d="M23 46 Q20 16 50 16 Q80 16 77 46 Q72 28 51 27 L49 27 Q28 28 23 46 Z" fill="${c}"/>`;
    case 'rapado': return `<path d="M25 42 Q24 18 50 18 Q76 18 75 42 Q70 27 50 26 Q30 27 25 42 Z" fill="${c}" opacity=".6"/>`;
    case 'largo': return `<path d="M22 54 Q18 14 50 14 Q82 14 78 54 Q76 34 60 28 Q46 38 30 36 Q25 42 22 54 Z" fill="${c}"/>`;
    case 'pincho': return `<path d="M24 44 L21 24 L32 29 L33 13 L43 25 L50 8 L57 25 L67 13 L68 29 L79 24 L76 44 Q70 30 50 30 Q30 30 24 44 Z" fill="${c}"/>`;
    case 'moño': return `<path d="M23 46 Q20 16 50 18 Q80 16 77 46 Q74 30 50 28 Q26 30 23 46 Z" fill="${c}"/>`;
    default: return `<path d="M23 46 Q20 16 50 16 Q80 16 77 46 Q74 32 62 28 Q56 34 44 31 Q30 30 23 46 Z" fill="${c}"/>`; // corto
  }
}

function ojo(cx, a) {
  return `<circle cx="${cx}" cy="47" r="3.9" fill="${a.ojos}"/><circle cx="${cx}" cy="47" r="2" fill="#1a120b"/>
    <circle cx="${cx + 1.3}" cy="45.7" r="1.1" fill="#fff"/>`;
}

function dientes(x, y, w, h, mella) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="#fff"/>`
    + (mella ? `<rect x="${x + w / 2 - 1.8}" y="${y}" width="3.6" height="${h}" fill="#5c1f1f"/>` : '');
}

function expresiones(a) {
  const bocaNormal = a.mella
    ? `<path d="M42 56 Q50 64 58 56 Z" fill="#5c1f1f" stroke="#7a3b2a" stroke-width="1.5" stroke-linejoin="round"/>${dientes(44, 56, 12, 2.6, true)}`
    : `<path d="M43 57 Q50 63 57 57" fill="none" stroke="#7a3b2a" stroke-width="3" stroke-linecap="round"/>`;
  return `
    <g class="cara-normal">${ojo(41, a)}${ojo(59, a)}${bocaNormal}</g>
    <g class="cara-feliz">
      <path d="M36 48 Q41 42 46 48 M54 48 Q59 42 64 48" fill="none" stroke="#2b1d12" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M40 55 Q50 70 60 55 Z" fill="#5c1f1f" stroke="#7a3b2a" stroke-width="2" stroke-linejoin="round"/>
      ${dientes(42, 55.5, 16, 3.6, a.mella)}
      <path d="M45 63 Q50 66.5 55 63" fill="#ff8a80"/>
    </g>
    <g class="cara-sorpresa">
      <circle cx="41" cy="46" r="5.5" fill="#fff" stroke="#2b1d12" stroke-width="1.5"/>
      <circle cx="59" cy="46" r="5.5" fill="#fff" stroke="#2b1d12" stroke-width="1.5"/>
      <circle cx="41" cy="46" r="3" fill="${a.ojos}"/><circle cx="59" cy="46" r="3" fill="${a.ojos}"/>
      <circle cx="41" cy="46" r="1.5" fill="#1a120b"/><circle cx="59" cy="46" r="1.5" fill="#1a120b"/>
      <ellipse cx="50" cy="60" rx="4.5" ry="5.5" fill="#5c1f1f"/>
    </g>`;
}

function cejas(a) {
  if (a.cejas === 'ninguna') return '';
  const grosor = { finas: 1.6, normales: 2.4, gruesas: 3.8 }[a.cejas] || 2.4;
  return `<g class="cejas" fill="none" stroke="${a.pelo}" stroke-width="${grosor}" stroke-linecap="round">
    <path d="M35.5 39.5 Q41 36 46 39"/><path d="M54 39 Q59 36 64.5 39.5"/></g>`;
}

function gafas(a) {
  const c = a.gafasColor;
  if (a.gafas === 'redondas') return `<g fill="rgba(255,255,255,.18)" stroke="${c}" stroke-width="2.2">
    <circle cx="41" cy="47" r="7.5"/><circle cx="59" cy="47" r="7.5"/><path d="M48.5 46 Q50 44.5 51.5 46" fill="none"/>
    <path d="M33.5 46 L25 44 M66.5 46 L75 44" fill="none"/></g>`;
  if (a.gafas === 'sol') return `<g stroke="#1a1a1a" stroke-width="2.2" stroke-linejoin="round">
    <path d="M31 42 H48 V49 Q48 55 40 55 Q31 55 31 49 Z" fill="#1f2a36"/><path d="M52 42 H69 V49 Q69 55 61 55 Q52 55 52 49 Z" fill="#1f2a36"/>
    <path d="M48 44 H52 M31 43 L25 42 M69 43 L75 42" fill="none"/>
    <path d="M34 45 L38 45 M55 45 L59 45" stroke="#7fb3d9" stroke-width="2" stroke-linecap="round"/></g>`;
  if (a.gafas === 'cuadradas') return `<g fill="rgba(255,255,255,.18)" stroke="${c}" stroke-width="2.2" stroke-linejoin="round">
    <rect x="32" y="41" width="16" height="12" rx="3"/><rect x="52" y="41" width="16" height="12" rx="3"/>
    <path d="M48 46 H52 M32 45 L25 43 M68 45 L75 43" fill="none"/></g>`;
  return '';
}

function estampado(a) {
  const blanco = a.camiseta === '#fbf7ee' || a.camiseta === '#ffcc33';
  const tinta = blanco ? '#c8553d' : '#fff';
  switch (a.estampado) {
    case 'numero': return `<text class="numero" x="50" y="99" text-anchor="middle" font-size="15" font-weight="900"
      font-family="system-ui, -apple-system, sans-serif" fill="${tinta}">${a.numero}</text>`;
    case 'estrella': return `<path d="M50 83 L53 90 L60.5 90.5 L54.8 95.2 L56.8 102.5 L50 98.4 L43.2 102.5 L45.2 95.2 L39.5 90.5 L47 90 Z" fill="${tinta}"/>`;
    case 'corazon': return `<path d="M50 102 Q38 94 40 88 Q42 82 50 87 Q58 82 60 88 Q62 94 50 102 Z" fill="${tinta}"/>`;
    case 'rayo': return `<path d="M53 82 L43 95 L50 95 L46 105 L57 91 L50 91 Z" fill="${tinta}"/>`;
    case 'balon': return `<circle cx="50" cy="93" r="8" fill="#fff" stroke="#2b2b2b" stroke-width="1.5"/>
      <path d="M50 89 L53.5 91.5 L52.2 95.5 L47.8 95.5 L46.5 91.5 Z" fill="#2b2b2b"/>`;
    case 'dino': return `<path d="M40 100 Q40 90 48 89 L54 86 Q60 84 61 88 Q61 91 57 91 L56 95 Q58 100 54 101 L52 97 L46 98 L45 102 L42 102 Z" fill="${tinta}"/>
      <circle cx="58" cy="87.5" r="1" fill="${blanco ? '#fff' : a.camiseta}"/>`;
    case 'aceituna': return `<ellipse cx="50" cy="94" rx="5.5" ry="7.5" fill="#6b8e23" transform="rotate(-20 50 94)"/>
      <path d="M52 87 Q56 82 61 83 Q58 88 53 88" fill="#9bbf4a"/>`;
    default: return '';
  }
}

function sombrero(a) {
  switch (a.sombrero) {
    case 'gorra': return `<path d="M22 40 Q22 13 50 13 Q78 13 78 40 Z" fill="${a.gorraColor}"/>
      <path d="M19 41 Q50 31 81 41 Q50 49 19 41 Z" fill="${a.gorraColor}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
      <circle cx="50" cy="14" r="3" fill="rgba(0,0,0,.2)"/>`;
    case 'pastor': return `<path d="M31 29 Q31 4 50 4 Q69 4 69 29 Z" fill="#9c6b3c"/>
      <rect x="31" y="22" width="38" height="6" fill="#5d3b1e"/>
      <ellipse cx="50" cy="29" rx="34" ry="6.5" fill="#b07d48" stroke="#7a522b" stroke-width="2"/>`;
    case 'corona': return `<path d="M27 30 L25 8 L37 20 L50 4 L63 20 L75 8 L73 30 Z" fill="#ffcc33" stroke="#d49a00" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="27" y="26" width="46" height="7" rx="2" fill="#f2b705" stroke="#d49a00" stroke-width="2"/>
      <circle cx="50" cy="20" r="3.5" fill="#e53935"/><circle cx="37" cy="29.5" r="2.5" fill="#3d8bd9"/><circle cx="63" cy="29.5" r="2.5" fill="#43a047"/>`;
    case 'casco': return `<path d="M20 50 Q18 10 50 10 Q82 10 80 50 L72 50 Q72 40 66 38 L34 38 Q28 40 28 50 Z" fill="#b8c2cc" stroke="#7d8a96" stroke-width="2.5"/>
      <path d="M50 10 V38" stroke="#7d8a96" stroke-width="2"/>
      <path d="M50 10 Q56 -4 70 2 Q62 6 58 14" fill="#e53935"/>
      <circle cx="30" cy="30" r="1.8" fill="#7d8a96"/><circle cx="70" cy="30" r="1.8" fill="#7d8a96"/>`;
    case 'pirata': return `<path d="M10 32 Q22 6 50 4 Q78 6 90 32 Q50 20 10 32 Z" fill="#232323"/>
      <path d="M10 32 Q50 20 90 32" fill="none" stroke="#d4a017" stroke-width="2.5"/>
      <circle cx="50" cy="15" r="4.5" fill="#fff"/><path d="M46 21 L54 25 M54 21 L46 25" stroke="#fff" stroke-width="2"/>
      <circle cx="48.3" cy="14.5" r="1.2" fill="#232323"/><circle cx="51.7" cy="14.5" r="1.2" fill="#232323"/>`;
    default: return '';
  }
}

const capa = (dorada) => `<path d="M30 78 Q20 92 12 110 H88 Q80 92 70 78 Z" fill="${dorada ? '#e8b822' : '#c62828'}"/>
  <path d="M30 78 Q50 84 70 78" fill="none" stroke="${dorada ? '#fff3c4' : '#ffcc33'}" stroke-width="3"/>`;

const paloma = `<g class="mascota">
  <path d="M70 84 Q68 74 78 73 Q88 72 90 80 Q90 86 84 88 Q74 90 70 84 Z" fill="#9aa3ad"/>
  <path d="M70 84 L62 82 L65 88 Z" fill="#7d8792"/>
  <circle cx="88" cy="70" r="5.5" fill="#8b95a0"/>
  <path d="M84 75 Q88 78 92 75" fill="none" stroke="#5fae8f" stroke-width="2.4"/>
  <circle cx="89.5" cy="69" r="1.7" fill="#fff"/><circle cx="90" cy="69" r="1" fill="#c0392b"/>
  <path d="M93 70.5 L97.5 72 L93 73 Z" fill="#e2a06b"/></g>`;

const lagartija = `<g class="mascota">
  <path d="M70 80 Q62 86 66 92" fill="none" stroke="#6aa336" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="78" cy="79" rx="9" ry="5" fill="#7cb342"/>
  <circle cx="87" cy="75" r="5.5" fill="#7cb342"/>
  <circle cx="86" cy="73.5" r="2" fill="#fff"/><circle cx="89.5" cy="73.5" r="2" fill="#fff"/>
  <circle cx="86.4" cy="73.8" r="1" fill="#2b1d12"/><circle cx="89.9" cy="73.8" r="1" fill="#2b1d12"/>
  <path d="M85 77.5 Q88 79.5 91 77" fill="none" stroke="#2b1d12" stroke-width="1"/>
  <path d="M74 83 l-2 4 M82 83 l2 4" stroke="#6aa336" stroke-width="2.4" stroke-linecap="round"/></g>`;

// ---------- Avatar completo ----------

export function avatarSVG(opciones = {}, { viewBox = '0 -6 100 116' } = {}) {
  const a = { ...AVATAR_BASE, ...opciones };
  return `<svg viewBox="${viewBox}" aria-hidden="true">
    <ellipse cx="50" cy="107" rx="27" ry="4" fill="rgba(0,0,0,.15)"/>
    ${a.capa ? capa(a.capa === 'dorada') : ''}
    ${a.mochila ? `<rect x="19" y="80" width="62" height="26" rx="9" fill="${a.mochilaColor}" stroke="rgba(0,0,0,.2)" stroke-width="2"/>` : ''}
    ${peloDetras(a)}
    <path d="M24 107 Q24 74 50 74 Q76 74 76 107 Z" fill="${a.camiseta}"/>
    <path d="M42 74 L50 83 L58 74" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/>
    ${estampado(a)}
    ${a.mochila ? `<g stroke="${a.mochilaColor}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M34 78 Q32 92 34 106"/><path d="M66 78 Q68 92 66 106"/></g>` : ''}
    <rect x="44" y="64" width="12" height="12" rx="4" fill="${a.piel}"/>
    <circle cx="25" cy="48" r="6" fill="${a.piel}"/><circle cx="75" cy="48" r="6" fill="${a.piel}"/>
    ${cabeza(a)}
    <circle cx="35" cy="56" r="5" fill="#ff8a80" opacity=".4"/><circle cx="65" cy="56" r="5" fill="#ff8a80" opacity=".4"/>
    ${a.pecas ? `<g fill="#b9764a" opacity=".75">${[[33, 53], [37, 55], [34, 57.5], [38, 51.5], [67, 53], [63, 55], [66, 57.5], [62, 51.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1"/>`).join('')}</g>` : ''}
    ${a.lunar ? '<circle cx="63" cy="61" r="1.4" fill="#4a2c1a"/>' : ''}
    ${expresiones(a)}
    ${cejas(a)}
    ${peloDelante(a)}
    ${gafas(a)}
    ${sombrero(a)}
    ${a.mascota === 'paloma' ? paloma : a.mascota ? lagartija : ''}
  </svg>`;
}
