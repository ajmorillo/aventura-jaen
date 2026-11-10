// Arte del juego en SVG: dibujos planos, colores cálidos, sin fotos ni logos.

const GIRO = { arriba: 0, derecha: 90, abajo: 180, izquierda: 270 };

export function flechaSVG(dir) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(${GIRO[dir]} 50 50)">
      <path d="M50 10 L88 50 H64 V90 H36 V50 H12 Z" fill="#fff"
        stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
    </g></svg>`;
}

// Giro sobre sí mismo: flecha curva hacia la izquierda o la derecha.
export function giroSVG(lado) {
  const espejo = lado === 'der' ? 'transform="matrix(-1 0 0 1 100 0)"' : '';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g ${espejo}>
    <path d="M72 86 V52 Q72 32 52 32 H38" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
    <path d="M42 12 L14 32 L42 52 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
  </g></svg>`;
}

export const recogerSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M30 40 Q50 6 70 40" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
  <path d="M16 40 H84 L74 86 H26 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
  <path d="M30 54 H70 M33 70 H67" stroke="#c9930f" stroke-width="5" stroke-linecap="round" opacity=".6"/></svg>`;

export function iconoBloque(b) {
  if (b === 'recoger') return recogerSVG;
  if (b === 'repetir' || /^repetir\d$/.test(b)) return repetirSVG + (b === 'repetir' ? '' : `<b class="veces">×${b.slice(7)}</b>`);
  if (b === 'fin') return '';
  if (b === 'izq' || b === 'der') return giroSVG(b);
  return flechaSVG(b === 'avanzar' ? 'arriba' : b);
}

export const triangulo = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M30 18 L84 50 L30 82 Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/></svg>`;

export const borrarSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M38 22 H84 a6 6 0 0 1 6 6 V72 a6 6 0 0 1 -6 6 H38 L12 50 Z" fill="#e8d6b4" stroke="#8a6b48" stroke-width="6" stroke-linejoin="round"/>
  <path d="M50 38 L72 62 M72 38 L50 62" stroke="#c8553d" stroke-width="8" stroke-linecap="round"/></svg>`;

export function estrellaSVG(llena = true) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 6 L62 37 L95 38 L69 58 L78 91 L50 72 L22 91 L31 58 L5 38 L38 37 Z"
      fill="${llena ? '#ffcc33' : '#e9dcc4'}" stroke="${llena ? '#e09a00' : '#cdbb9c'}"
      stroke-width="5" stroke-linejoin="round"/></svg>`;
}

// El Lagarto de la Malena: guía amable (diseño propio).
export const lagartoSVG = `<svg viewBox="0 0 140 110" aria-hidden="true">
  <path d="M30 78 Q6 80 6 60 Q6 46 18 48 Q12 56 16 64 Q22 72 36 70 Z" fill="#6aa336"/>
  <ellipse cx="62" cy="76" rx="34" ry="20" fill="#7cb342"/>
  <ellipse cx="64" cy="82" rx="24" ry="11" fill="#c5e1a5"/>
  <circle cx="48" cy="66" r="4" fill="#5d8f2c"/><circle cx="62" cy="62" r="3.5" fill="#5d8f2c"/><circle cx="76" cy="66" r="4" fill="#5d8f2c"/>
  <path d="M40 90 l-6 12 h12 Z M80 90 l6 12 h-12 Z" fill="#6aa336" stroke="#6aa336" stroke-width="4" stroke-linejoin="round"/>
  <path d="M86 70 Q96 54 106 52 L112 66 Q100 72 92 80 Z" fill="#c8553d"/>
  <circle cx="108" cy="44" r="24" fill="#7cb342"/>
  <ellipse cx="120" cy="52" rx="14" ry="10" fill="#8bc34a"/>
  <circle cx="100" cy="34" r="9" fill="#fff"/><circle cx="118" cy="32" r="9" fill="#fff"/>
  <circle cx="102" cy="35" r="4.5" fill="#2b1d12"/><circle cx="120" cy="33" r="4.5" fill="#2b1d12"/>
  <circle cx="103.5" cy="33.5" r="1.5" fill="#fff"/><circle cx="121.5" cy="31.5" r="1.5" fill="#fff"/>
  <path d="M106 54 Q118 64 130 52" fill="none" stroke="#2b1d12" stroke-width="3" stroke-linecap="round"/>
  <circle cx="126" cy="46" r="1.6" fill="#2b1d12"/><circle cx="131" cy="46" r="1.6" fill="#2b1d12"/>
  <circle cx="96" cy="50" r="4" fill="#ff8a80" opacity=".5"/>
</svg>`;

// La fuente del Raudal (simplificada).
export const fuenteSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="88" rx="40" ry="7" fill="rgba(0,0,0,.12)"/>
  <rect x="12" y="58" width="76" height="28" rx="8" fill="#d9b382" stroke="#a07845" stroke-width="3"/>
  <ellipse cx="50" cy="60" rx="36" ry="7" fill="#6cc4ee" stroke="#a07845" stroke-width="3"/>
  <rect x="44" y="30" width="12" height="30" rx="3" fill="#cfa36c" stroke="#a07845" stroke-width="3"/>
  <ellipse cx="50" cy="30" rx="18" ry="5" fill="#d9b382" stroke="#a07845" stroke-width="3"/>
  <g class="agua" fill="none" stroke="#4fb3e8" stroke-width="3.5" stroke-linecap="round">
    <path d="M50 24 Q50 8 36 12 Q30 16 30 30"/><path d="M50 24 Q50 8 64 12 Q70 16 70 30"/>
    <path d="M32 40 Q30 50 28 56"/><path d="M68 40 Q70 50 72 56"/>
  </g>
</svg>`;

// Casas encaladas de la Magdalena (obstáculos).
const CONTRAVENTANAS = ['#3d8bd9', '#43a047', '#8e5bc9'];
export function casaSVG(v = 0) {
  const c = CONTRAVENTANAS[v % CONTRAVENTANAS.length];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <rect x="14" y="36" width="72" height="56" rx="3" fill="#fbf7ee" stroke="#d8cbb0" stroke-width="3"/>
    <path d="M6 40 L50 10 L94 40 Z" fill="#c8553d" stroke="#a5402c" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 34 H82" stroke="#a5402c" stroke-width="3"/>
    <rect x="58" y="62" width="18" height="30" rx="8" fill="#8a5a32"/>
    <rect x="24" y="50" width="22" height="20" rx="2" fill="#a8d8f0" stroke="${c}" stroke-width="4"/>
    <path d="M35 50 V70" stroke="${c}" stroke-width="3"/>
    <rect x="22" y="72" width="26" height="7" rx="2" fill="#b9823f"/>
    <circle cx="28" cy="70" r="4" fill="#e53935"/><circle cx="36" cy="69" r="4" fill="#ff7043"/><circle cx="43" cy="70" r="4" fill="#e53935"/>
  </svg>`;
}

// Paisaje de portada: cerro con castillo y cruz, catedral, casas y olivar.
export function paisajeSVG() {
  let olivos = '';
  for (let fila = 0; fila < 3; fila++) {
    for (let i = 0; i < 26; i++) {
      const x = i * 48 + (fila % 2) * 24 - 10;
      const y = 232 + fila * 22;
      olivos += `<g><rect x="${x - 2}" y="${y}" width="4" height="9" fill="#6d4c2f"/>
        <ellipse cx="${x}" cy="${y - 2}" rx="12" ry="8" fill="${fila % 2 ? '#6b8e23' : '#7fa035'}"/></g>`;
    }
  }
  let casas = '';
  const tejas = ['#c8553d', '#b9482f', '#d4683f'];
  for (let i = 0; i < 30; i++) {
    const x = i * 42 - 10, h = 22 + ((i * 37) % 18), y = 214 - h;
    if (x > 380 && x < 600) continue; // hueco para la catedral
    casas += `<rect x="${x}" y="${y}" width="38" height="${h + 8}" fill="#fbf7ee" stroke="#e0d3b8"/>
      <path d="M${x - 3} ${y + 2} L${x + 19} ${y - 10} L${x + 41} ${y + 2} Z" fill="${tejas[i % 3]}"/>
      <rect x="${x + 14}" y="${y + 10}" width="9" height="9" fill="#8fbfd9"/>`;
  }
  return `<svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
    <path d="M0 300 V200 Q180 160 360 130 Q500 50 640 56 Q760 64 900 150 Q1050 196 1200 186 V300 Z" fill="#b5c27a"/>
    <g fill="#dcbf8f" stroke="#b9975f" stroke-width="2">
      <rect x="560" y="34" width="110" height="28"/>
      <rect x="600" y="8" width="30" height="54"/>
      <path d="M560 34 v-8 h12 v8 h10 v-8 h12 v8 h10 v-8 h12 v8 M640 34 v-8 h12 v8 h10 v-8 h8 v8"/>
      <path d="M600 8 v-8 h8 v8 h7 v-8 h8 v8 h7 v-8"/>
    </g>
    <path d="M722 66 V30 M710 42 H734" stroke="#fbf7ee" stroke-width="6" stroke-linecap="round"/>
    <g fill="#e6c995" stroke="#b9975f" stroke-width="2">
      <rect x="420" y="120" width="160" height="96"/>
      <rect x="404" y="80" width="34" height="136"/><rect x="562" y="80" width="34" height="136"/>
      <path d="M404 80 L421 62 L438 80 Z M562 80 L579 62 L596 80 Z"/>
      <path d="M460 120 Q500 70 540 120 Z"/>
      <rect x="486" y="160" width="28" height="56" rx="14" fill="#a07845"/>
    </g>
    ${casas}
    <rect x="0" y="216" width="1200" height="84" fill="#93ad45"/>
    ${olivos}
  </svg>`;
}

// ---------- Mundo 2: Mar de olivos ----------

export function olivoSVG(v = 0) {
  const verdes = ['#7d9a46', '#6f8d3c', '#86a352'];
  const g = verdes[v % 3];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse cx="50" cy="90" rx="30" ry="6" fill="rgba(0,0,0,.15)"/>
    <path d="M44 90 Q46 72 40 60 Q48 64 50 56 Q52 64 60 60 Q54 72 56 90 Z" fill="#7a5533"/>
    <path d="M47 88 Q49 74 45 64" fill="none" stroke="#5e3f24" stroke-width="2"/>
    <circle cx="34" cy="44" r="18" fill="${g}"/><circle cx="66" cy="44" r="18" fill="${g}"/>
    <circle cx="50" cy="30" r="20" fill="${g}"/><circle cx="50" cy="50" r="16" fill="${g}"/>
    <g fill="#a9bf86" opacity=".7"><ellipse cx="38" cy="32" rx="6" ry="3" transform="rotate(-25 38 32)"/>
      <ellipse cx="62" cy="38" rx="6" ry="3" transform="rotate(20 62 38)"/><ellipse cx="48" cy="22" rx="5" ry="2.6"/></g>
    <g fill="#3e4a1f"><circle cx="30" cy="50" r="2.5"/><circle cx="58" cy="28" r="2.5"/><circle cx="70" cy="52" r="2.5"/><circle cx="44" cy="42" r="2.5"/></g>
  </svg>`;
}

export const aceitunaSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="86" rx="18" ry="4" fill="rgba(0,0,0,.15)"/>
  <ellipse cx="46" cy="60" rx="17" ry="23" fill="#556b2f" transform="rotate(-18 46 60)"/>
  <ellipse cx="40" cy="52" rx="5" ry="8" fill="#8fa865" opacity=".7" transform="rotate(-18 40 52)"/>
  <path d="M54 38 Q60 22 72 18" fill="none" stroke="#6d4c2f" stroke-width="3" stroke-linecap="round"/>
  <path d="M62 26 Q78 14 90 22 Q78 34 62 26 Z" fill="#8bb04a"/>
</svg>`;

// Meta del mundo 2: una almazara (molino de aceite) con su piedra y una gota dorada.
export const almazaraSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="91" rx="40" ry="6" fill="rgba(0,0,0,.12)"/>
  <rect x="16" y="42" width="68" height="48" rx="3" fill="#fbf7ee" stroke="#d8cbb0" stroke-width="3"/>
  <path d="M10 46 L50 20 L90 46 Z" fill="#c8553d" stroke="#a5402c" stroke-width="3" stroke-linejoin="round"/>
  <rect x="58" y="62" width="16" height="28" rx="7" fill="#8a5a32"/>
  <circle cx="34" cy="74" r="13" fill="#b9b2a3" stroke="#8d8576" stroke-width="3"/>
  <circle cx="34" cy="74" r="3.5" fill="#8d8576"/>
  <path d="M50 4 Q58 15 58 20 A8 8 0 0 1 42 20 Q42 15 50 4 Z" fill="#e8b822" stroke="#b98a0e" stroke-width="2"/>
</svg>`;

// ---------- Mundo 3: Plaza de Santa María ----------

// Meta del mundo 3: la fachada de la Catedral, simplificada (dos torres y la puerta).
export const catedralSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="93" rx="44" ry="5" fill="rgba(0,0,0,.12)"/>
  <g fill="#ead2a3" stroke="#b9975f" stroke-width="2">
    <rect x="8" y="22" width="20" height="70"/><rect x="72" y="22" width="20" height="70"/>
    <rect x="26" y="40" width="48" height="52"/>
    <path d="M8 22 Q18 6 28 22 Z M72 22 Q82 6 92 22 Z"/>
    <path d="M26 40 L50 26 L74 40 Z"/>
  </g>
  <circle cx="18" cy="9" r="2.5" fill="#b9975f"/><circle cx="82" cy="9" r="2.5" fill="#b9975f"/>
  <g fill="#7d5a35"><rect x="14" y="32" width="8" height="12" rx="4"/><rect x="78" y="32" width="8" height="12" rx="4"/>
    <rect x="14" y="54" width="8" height="12" rx="4"/><rect x="78" y="54" width="8" height="12" rx="4"/></g>
  <g stroke="#d9bd86" stroke-width="2"><path d="M33 46 V90 M67 46 V90 M42 46 V90 M58 46 V90"/></g>
  <rect x="42" y="64" width="16" height="28" rx="8" fill="#8a5a32" stroke="#6b4423" stroke-width="2"/>
  <circle cx="50" cy="52" r="6" fill="#bfe6f7" stroke="#b9975f" stroke-width="2"/>
</svg>`;

export const fuentePlazaSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="84" rx="38" ry="8" fill="rgba(0,0,0,.12)"/>
  <ellipse cx="50" cy="72" rx="38" ry="14" fill="#cdbb9c" stroke="#a08b68" stroke-width="3"/>
  <ellipse cx="50" cy="68" rx="31" ry="9" fill="#6cc4ee"/>
  <rect x="45" y="40" width="10" height="28" rx="3" fill="#cdbb9c" stroke="#a08b68" stroke-width="2"/>
  <g class="agua" fill="none" stroke="#4fb3e8" stroke-width="3.5" stroke-linecap="round">
    <path d="M50 38 Q50 18 36 24 Q30 30 30 50"/><path d="M50 38 Q50 18 64 24 Q70 30 70 50"/><path d="M50 38 V18"/>
  </g>
</svg>`;

export const palomaSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="86" rx="26" ry="5" fill="rgba(0,0,0,.15)"/>
  <g class="paloma">
    <path d="M24 60 Q22 44 40 42 Q56 40 66 52 Q72 62 64 72 Q50 82 34 76 Q26 72 24 60 Z" fill="#9aa3ad"/>
    <path d="M24 62 L8 56 L14 68 Z" fill="#7d8792"/>
    <path d="M34 54 Q46 48 56 58 Q46 66 34 54 Z" fill="#b8c0c8"/>
    <circle cx="68" cy="40" r="12" fill="#8b95a0"/>
    <path d="M60 50 Q66 56 74 50" fill="none" stroke="#5fae8f" stroke-width="4"/>
    <circle cx="71" cy="37" r="3" fill="#fff"/><circle cx="72" cy="37" r="1.6" fill="#c0392b"/>
    <path d="M79 40 L88 43 L79 45 Z" fill="#e2a06b"/>
    <path d="M42 78 V88 M54 78 V88" stroke="#e2a06b" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;

// Arte de cada mundo: meta, obstáculo según la casilla y título.
export const TEMAS = {
  magdalena: { meta: fuenteSVG, obstaculo: (x, y) => casaSVG(x * 2 + y) },
  olivar: { meta: almazaraSVG, obstaculo: (x, y) => olivoSVG(x + y * 3) },
  plaza: { meta: catedralSVG, obstaculo: (x, y) => ((x * 7 + y * 3) % 3 === 0 ? fuentePlazaSVG : palomaSVG) },
};

// ---------- Mundo 4: Baños Árabes ----------

export const COLOR_LLAVE = ['#e8b822', '#3d8bd9'];

export function llaveSVG(i = 0) {
  const c = COLOR_LLAVE[i % 2];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <ellipse cx="50" cy="86" rx="22" ry="4" fill="rgba(0,0,0,.15)"/>
    <g transform="rotate(-35 50 50)">
      <circle cx="32" cy="50" r="15" fill="none" stroke="${c}" stroke-width="9"/>
      <rect x="44" y="45" width="40" height="10" rx="3" fill="${c}"/>
      <rect x="66" y="55" width="7" height="12" rx="2" fill="${c}"/><rect x="77" y="55" width="7" height="9" rx="2" fill="${c}"/>
      <circle cx="28" cy="45" r="3" fill="#fff" opacity=".6"/>
    </g></svg>`;
}

// Puerta con arco de herradura; abierta deja ver el paso.
export function puertaSVG(i = 0, abierta = false) {
  const c = COLOR_LLAVE[i % 2];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M14 96 V44 A36 36 0 1 1 86 44 V96 Z" fill="#d9b382" stroke="#a07845" stroke-width="3"/>
    <path d="M24 96 V46 A26 28 0 1 1 76 46 V96 Z" fill="${abierta ? 'rgba(255,240,200,.55)' : '#8a5a32'}" stroke="${c}" stroke-width="5"/>
    ${abierta ? '' : `<path d="M50 22 V96" stroke="#6b4423" stroke-width="2.5"/>
      <circle cx="50" cy="62" r="7" fill="${c}"/><rect x="47.5" y="62" width="5" height="10" rx="1.5" fill="${c}"/>
      <circle cx="50" cy="62" r="2.4" fill="#4a2c1a"/>`}
  </svg>`;
}

export const columnaSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="92" rx="26" ry="5" fill="rgba(0,0,0,.15)"/>
  <rect x="28" y="80" width="44" height="10" rx="2" fill="#efe6d4" stroke="#bfae8c" stroke-width="2"/>
  <rect x="38" y="24" width="24" height="56" fill="#f7f1e4" stroke="#bfae8c" stroke-width="2"/>
  <path d="M43 26 V78 M50 26 V78 M57 26 V78" stroke="#e2d6bd" stroke-width="2"/>
  <path d="M26 12 H74 L66 24 H34 Z" fill="#efe6d4" stroke="#bfae8c" stroke-width="2" stroke-linejoin="round"/>
  <path d="M30 12 Q50 2 70 12" fill="none" stroke="#c8553d" stroke-width="3"/>
</svg>`;

// Meta del mundo 4: la sala caliente, con su bóveda de estrellas.
export const salaSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="92" rx="42" ry="5" fill="rgba(0,0,0,.12)"/>
  <path d="M8 92 V50 Q8 10 50 10 Q92 10 92 50 V92 Z" fill="#e9d3a8" stroke="#a07845" stroke-width="3"/>
  <g fill="#fff8d6" stroke="#d4a017" stroke-width="1.5">
    <path d="M30 30 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 Z"/>
    <path d="M70 30 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 Z"/>
    <path d="M50 18 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 Z"/>
  </g>
  <path d="M26 92 V64 A24 22 0 0 1 74 64 V92 Z" fill="#6cc4ee" stroke="#a07845" stroke-width="3"/>
  <g class="agua" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8">
    <path d="M36 76 q4 -3 8 0 t8 0 t8 0"/><path d="M40 84 q4 -3 8 0 t8 0"/></g>
</svg>`;

// ---------- Mundo 5: Castillo de Santa Catalina ----------

export const rocaSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="88" rx="38" ry="6" fill="rgba(0,0,0,.15)"/>
  <path d="M14 86 L22 52 L42 34 L64 40 L82 58 L88 86 Z" fill="#b5a38a" stroke="#8a7a62" stroke-width="3" stroke-linejoin="round"/>
  <path d="M42 34 L48 60 L82 58 M48 60 L30 86" fill="none" stroke="#8a7a62" stroke-width="2"/>
  <path d="M24 54 L40 38" stroke="#d6c7ae" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export const pinoSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="90" rx="26" ry="5" fill="rgba(0,0,0,.15)"/>
  <rect x="45" y="70" width="10" height="20" fill="#7a5533"/>
  <path d="M50 6 L78 44 H62 L84 74 H16 L38 44 H22 Z" fill="#4f7d3a" stroke="#3c632b" stroke-width="2" stroke-linejoin="round"/>
  <path d="M50 16 L64 36 M44 50 L60 64" stroke="#6a9a4f" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export const murallaSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M6 96 V30 H20 V18 H34 V30 H44 V18 H56 V30 H66 V18 H80 V30 H94 V96 Z" fill="#dcbf8f" stroke="#a88855" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#c4a571" stroke-width="2"><path d="M6 50 H94 M6 72 H94 M30 30 V50 M62 30 V50 M18 50 V72 M50 50 V72 M80 50 V72 M34 72 V96 M66 72 V96"/></g>
</svg>`;

// Meta del mundo 5: la Cruz sobre la roca del cerro.
export const cruzSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="92" rx="40" ry="5" fill="rgba(0,0,0,.12)"/>
  <path d="M12 92 L24 68 L44 60 L66 62 L82 72 L90 92 Z" fill="#b5a38a" stroke="#8a7a62" stroke-width="3" stroke-linejoin="round"/>
  <rect x="44" y="6" width="12" height="58" rx="2" fill="#fbf7ee" stroke="#cfc4ad" stroke-width="2"/>
  <rect x="28" y="20" width="44" height="11" rx="2" fill="#fbf7ee" stroke="#cfc4ad" stroke-width="2"/>
</svg>`;

TEMAS.banos = { meta: salaSVG, obstaculo: () => columnaSVG };
TEMAS.castillo = { meta: cruzSVG, obstaculo: (x, y) => [rocaSVG, pinoSVG, murallaSVG][(x * 5 + y * 3) % 3] };

// ---------- Bloques de bucle ----------

export const repetirSVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M28 58 A24 24 0 1 1 50 74" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
  <path d="M14 50 L30 70 L44 52 Z" fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round"/></svg>`;
