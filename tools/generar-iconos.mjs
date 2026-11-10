// Genera los iconos del juego (SVG y PNG) a partir del arte del propio juego.
// Los PNG se rasterizan con qlmanage y sips, que vienen con macOS.
// Uso: node tools/generar-iconos.mjs
import { writeFileSync, mkdirSync, renameSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { lagartoSVG, flechaSVG } from '../js/art.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = join(raiz, 'iconos');
mkdirSync(carpeta, { recursive: true });

const en = (svg, x, y, w, h = w) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);

// `margen` deja sitio para los iconos «maskable» (Android recorta un círculo del centro).
function icono({ redondeado, margen = 0 }) {
  const m = margen;
  const s = 512 - 2 * m;
  const k = s / 512;
  const bloque = `<svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="22" fill="#43a047"/>
    <rect x="4" y="4" width="92" height="84" rx="22" fill="#55b85a"/>${flechaSVG('derecha').replace(/<\/?svg[^>]*>/g, '')}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8fd3f4"/><stop offset="1" stop-color="#e8f6fc"/></linearGradient></defs>
  <rect width="512" height="512" ${redondeado ? 'rx="112"' : ''} fill="url(#cielo)"/>
  <path d="M0 ${m + 330 * k} Q${256} ${m + 270 * k} 512 ${m + 330 * k} V512 H0 Z" fill="#93ad45"/>
  <circle cx="${m + 410 * k}" cy="${m + 96 * k}" r="${44 * k}" fill="#ffd54f"/>
  ${en(lagartoSVG, m + 40 * k, m + 120 * k, 330 * k, 260 * k)}
  ${en(bloque, m + 330 * k, m + 300 * k, 140 * k)}
</svg>`;
}

const svgs = {
  'icono.svg': icono({ redondeado: true }),
  'icono-cuadrado.svg': icono({ redondeado: false }),
  'icono-maskable.svg': icono({ redondeado: false, margen: 56 }),
};
for (const [nombre, svg] of Object.entries(svgs)) writeFileSync(join(carpeta, nombre), svg);

// PNG: qlmanage renderiza a 512 px y sips reduce a los demás tamaños.
const tmp = join(tmpdir(), 'aventura-iconos');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp);
function png(svg, salida, tam) {
  execFileSync('qlmanage', ['-t', '-s', '512', '-o', tmp, join(carpeta, svg)], { stdio: 'ignore' });
  const generado = join(tmp, readdirSync(tmp).find(f => f.startsWith(svg)));
  if (tam !== 512) execFileSync('sips', ['-z', String(tam), String(tam), generado], { stdio: 'ignore' });
  renameSync(generado, join(carpeta, salida));
}
png('icono-cuadrado.svg', 'icono-512.png', 512);
png('icono-cuadrado.svg', 'icono-192.png', 192);
png('icono-cuadrado.svg', 'apple-touch-icon.png', 180); // iOS redondea las esquinas él solo
png('icono-maskable.svg', 'icono-maskable-512.png', 512);
png('icono-cuadrado.svg', 'favicon-32.png', 32);
console.log('Iconos generados en', carpeta, readdirSync(carpeta).join(', '));
