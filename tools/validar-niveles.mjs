// Comprueba que todos los niveles se pueden resolver y que optimo/reto encajan.
// Uso: node tools/validar-niveles.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { libre, resolver, aceitunas, llaves, puertas, simular, contarBloques } from '../js/motor.js';

const carpeta = join(dirname(fileURLToPath(import.meta.url)), '..', 'niveles');
let errores = 0;

for (const archivo of readdirSync(carpeta).filter(f => f.endsWith('.json')).sort()) {
  const modo = archivo.includes('mayor') ? 'mayor' : 'peque';
  const mundo = JSON.parse(readFileSync(join(carpeta, archivo), 'utf8'));
  console.log(`\n${archivo} (${modo})`);
  for (const nv of mundo.niveles) {
    const fallos = [];
    if (!libre(nv, ...nv.inicio)) fallos.push('el inicio no está libre');
    if (!libre(nv, ...nv.meta)) fallos.push('la meta no está libre');
    for (const [x, y] of aceitunas(nv)) {
      if (!libre(nv, x, y)) fallos.push(`aceituna en [${x}, ${y}] no libre`);
      if ((x === nv.meta[0] && y === nv.meta[1]) || (x === nv.inicio[0] && y === nv.inicio[1])) fallos.push(`aceituna en [${x}, ${y}] encima del inicio o la meta`);
    }
    for (const [x, y] of [...llaves(nv), ...puertas(nv)]) if (!libre(nv, x, y)) fallos.push(`llave o puerta en [${x}, ${y}] no libre`);
    if (llaves(nv).length !== puertas(nv).length) fallos.push('distinto número de llaves y puertas');
    if (nv.solucion) {
      const r = simular(nv, modo, nv.solucion);
      if (r.resultado !== 'meta') fallos.push(`la solución guardada no llega (${r.resultado})`);
      if (nv.reto < contarBloques(nv.solucion)) fallos.push(`reto=${nv.reto} menor que la solución guardada`);
    }
    const sol = fallos.length ? null : resolver(nv, modo);
    if (!sol && !fallos.length) fallos.push('no tiene solución');
    const objetivo = modo === 'mayor' ? nv.reto : nv.optimo;
    if (sol && !nv.solucion && objetivo < sol.length) fallos.push(`${modo === 'mayor' ? 'reto' : 'optimo'}=${objetivo} es imposible (mínimo ${sol.length})`);
    if (sol && !nv.solucion && objetivo > sol.length) fallos.push(`aviso: ${modo === 'mayor' ? 'reto' : 'optimo'}=${objetivo} pero se puede con ${sol.length}`);
    const graves = fallos.filter(f => !f.startsWith('aviso'));
    errores += graves.length;
    console.log(`  ${graves.length ? '✗' : '✓'} ${nv.id}: mínimo ${sol ? sol.length : '-'} bloques${fallos.length ? ' — ' + fallos.join('; ') : ''}`);
    if (nv.solucion) console.log(`      con bucles (${contarBloques(nv.solucion)} bloques): ${nv.solucion.join(' ')}`);
    else if (sol) console.log(`      ${sol.join(' ')}`);
  }
}
process.exit(errores ? 1 : 0);
