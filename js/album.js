// Álbum de Jaén: una postal por mundo terminado, con una curiosidad que lee la voz.
import { casaSVG, fuenteSVG, lagartoSVG, olivoSVG, aceitunaSVG, almazaraSVG, catedralSVG, palomaSVG, fuentePlazaSVG,
  columnaSVG, salaSVG, murallaSVG, cruzSVG, pinoSVG, rocaSVG } from './art.js';

// Coloca un dibujo (un <svg> con viewBox) dentro de la escena, en la caja indicada.
const en = (svg, x, y, w, h = w) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

const cielo = (a, b) => `<defs><linearGradient id="c${a.slice(1)}${b.slice(1)}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="300" height="200" fill="url(#c${a.slice(1)}${b.slice(1)})"/>`;

const sol = '<circle cx="262" cy="34" r="16" fill="#ffd54f"/><circle cx="262" cy="34" r="22" fill="#ffd54f" opacity=".25"/>';
const nube = (x, y) => `<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="18" ry="8"/><ellipse cx="${x + 12}" cy="${y - 5}" rx="12" ry="8"/></g>`;

const ESCENAS = {
  1: () => `${cielo('#8fd3f4', '#e6f5fb')}${sol}${nube(60, 34)}
    <rect y="140" width="300" height="60" fill="#e2c28b"/>
    ${[0, 1, 2, 3, 4, 5].map(i => en(casaSVG(i), i * 52 - 8, 70, 62)).join('')}
    ${en(fuenteSVG, 150, 110, 80)}
    ${en(lagartoSVG, 14, 108, 120, 94)}`,
  2: () => `${cielo('#9fd8f2', '#f3ecd0')}${sol}${nube(90, 30)}
    <path d="M0 110 Q80 80 160 100 Q230 115 300 95 V200 H0 Z" fill="#b5c27a"/>
    <path d="M0 140 Q100 120 200 138 Q260 148 300 140 V200 H0 Z" fill="#93ad45"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => en(olivoSVG(i), i * 44 - 6, 92 + (i % 2) * 6, 40)).join('')}
    ${[0, 1, 2, 3, 4].map(i => en(olivoSVG(i + 1), i * 64 + 4, 128, 56)).join('')}
    ${en(almazaraSVG, 196, 110, 90)}
    ${en(aceitunaSVG, 40, 168, 26)}${en(aceitunaSVG, 120, 172, 22)}`,
  3: () => `${cielo('#8fd3f4', '#eef7fb')}${nube(40, 30)}${nube(230, 24)}
    <rect y="150" width="300" height="50" fill="#e1d6be"/>
    <path d="M0 150 H300" stroke="#c9bb9c" stroke-width="2"/>
    ${en(catedralSVG, 70, 18, 160, 150)}
    ${en(palomaSVG, 20, 154, 40)}${en(palomaSVG, 238, 150, 44)}${en(fuentePlazaSVG, 250, 112, 46)}`,
  4: () => `<rect width="300" height="200" fill="#d8b688"/>
    <path d="M0 0 H300 V40 Q150 70 0 40 Z" fill="#c9a06e"/>
    ${[[40, 18], [100, 30], [150, 34], [200, 30], [260, 18]].map(([x, y]) =>
      `<path d="M${x} ${y - 7} l2.2 4.5 5 .7 -3.6 3.4 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.4 5 -.7 Z" fill="#fff6c8"/>`).join('')}
    <rect y="160" width="300" height="40" fill="#b47a4f"/>
    ${[0, 1, 2, 3, 4, 5].map(i => en(columnaSVG, i * 56 - 4, 70, 48, 96)).join('')}
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${i * 56 + 20} 74 Q${i * 56 + 48} 40 ${i * 56 + 76} 74" fill="none" stroke="#f4ead6" stroke-width="7"/>`).join('')}
    ${en(salaSVG, 110, 96, 80)}`,
  5: () => `${cielo('#7fc7ec', '#fdf1d8')}${sol}${nube(70, 28)}
    <path d="M0 200 V150 Q60 120 120 92 Q160 60 200 66 Q250 80 300 128 V200 Z" fill="#a9b86a"/>
    ${en(murallaSVG, 120, 48, 40)}${en(murallaSVG, 156, 40, 46)}${en(murallaSVG, 198, 50, 40)}
    ${en(cruzSVG, 236, 52, 50)}
    ${en(pinoSVG, 70, 120, 34)}${en(pinoSVG, 96, 110, 30)}${en(rocaSVG, 180, 104, 30)}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => en(casaSVG(i), i * 38 - 6, 166, 34)).join('')}`,
};

export const POSTALES = [
  { n: 1, titulo: 'El Lagarto de la Malena',
    texto: 'Cuenta la leyenda que, junto a la fuente de la Magdalena, vivía un lagarto enorme que asustaba a todo el barrio. Un vecino muy listo lo engañó y el lagarto desapareció para siempre. Hoy es el símbolo más famoso de Jaén.' },
  { n: 2, titulo: 'El mar de olivos',
    texto: 'En la provincia de Jaén hay más de sesenta millones de olivos: ¡más que personas en toda España! Vistos desde lo alto parecen un mar verde. Con sus aceitunas se hace el aceite de oliva.' },
  { n: 3, titulo: 'La Catedral',
    texto: 'La Catedral de Jaén tardó más de doscientos años en construirse. Es tan bonita que sirvió de modelo para catedrales de América, al otro lado del océano.' },
  { n: 4, titulo: 'Los Baños Árabes',
    texto: 'Los Baños Árabes tienen casi mil años y son de los más grandes de Europa. Estuvieron escondidos debajo de un palacio, ¡y nadie lo sabía! Los redescubrieron hace más de cien años.' },
  { n: 5, titulo: 'El castillo y la Cruz',
    texto: 'En lo alto del cerro de Santa Catalina está el castillo, y a su lado una gran cruz blanca. Cuentan que el rey Fernando III puso una cruz allí cuando llegó a Jaén, hace casi ochocientos años.' },
];

export function postalSVG(n) {
  return `<svg viewBox="0 0 300 200" aria-hidden="true">${ESCENAS[n]()}</svg>`;
}
