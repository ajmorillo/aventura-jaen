// Prepara el juego para publicarlo:
//   1. valida todos los niveles,
//   2. escribe en sw.js la lista de archivos a guardar sin conexión y una VERSION nueva
//      (calculada con el contenido: si algo cambia, los dispositivos se actualizan solos).
// Ejecutar SIEMPRE antes de subir una versión nueva: node tools/preparar-publicacion.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

execFileSync(process.execPath, [join(raiz, 'tools', 'validar-niveles.mjs')], { stdio: ['ignore', 'ignore', 'inherit'] });

const CARPETAS = ['css', 'js', 'niveles', 'iconos'];
const SUELTOS = ['index.html', 'manifest.webmanifest'];
const archivos = [...SUELTOS];
const recorrer = dir => {
  for (const f of readdirSync(join(raiz, dir)).sort()) {
    const ruta = join(dir, f);
    if (statSync(join(raiz, ruta)).isDirectory()) recorrer(ruta);
    else if (!f.startsWith('.')) archivos.push(relative(raiz, join(raiz, ruta)));
  }
};
CARPETAS.forEach(recorrer);

const hash = createHash('sha1');
for (const f of archivos) hash.update(f).update(readFileSync(join(raiz, f)));
const version = 'aventura-' + hash.digest('hex').slice(0, 10);

const sw = join(raiz, 'sw.js');
const texto = readFileSync(sw, 'utf8')
  .replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`)
  .replace(/const ARCHIVOS = \[[^\]]*\];/s, `const ARCHIVOS = [\n  './',\n${archivos.map(f => `  '${f}',`).join('\n')}\n];`);
writeFileSync(sw, texto);
console.log(`Niveles válidos. sw.js actualizado: ${version}, ${archivos.length} archivos.`);
