// Genera los niveles de los mundos 1–3 a partir de especificaciones de dificultad.
// Es determinista (semillas fijas): volver a ejecutarlo produce los mismos niveles.
// Las entradas { manual: {...} } son niveles hechos a mano y se copian tal cual.
// Uso: node tools/generar-niveles.mjs   (después: node tools/validar-niveles.mjs)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { resolver, mueve, simular, desplegar, paso, estadoInicial, contarBloques } from '../js/motor.js';

const carpeta = join(dirname(fileURLToPath(import.meta.url)), '..', 'niveles');
const DIRS = ['arriba', 'derecha', 'abajo', 'izquierda'];

function aleatorio(semilla) { // mulberry32
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const entre = (r, [a, b]) => a + Math.floor(r() * (b - a + 1));

function giros(sol, modo) {
  if (modo === 'mayor') return sol.filter(b => b === 'izq' || b === 'der').length;
  const movs = sol.filter(mueve);
  return movs.slice(1).filter((b, i) => b !== movs[i]).length;
}

function generar(spec, modo, semillaBase) {
  const [cols, filas] = spec.tam;
  for (let intento = 0; intento < 200000; intento++) {
    const r = aleatorio(semillaBase * 7919 + intento);
    const celdas = [];
    for (let y = 0; y < filas; y++) for (let x = 0; x < cols; x++) celdas.push([x, y]);
    for (let i = celdas.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [celdas[i], celdas[j]] = [celdas[j], celdas[i]]; }
    const inicio = celdas.pop();
    const meta = celdas.pop();
    const nAce = entre(r, spec.aceitunas || [0, 0]);
    const ace = celdas.splice(0, nAce);
    const obstaculos = celdas.splice(0, entre(r, spec.obst));
    const nv = { tam: spec.tam, inicio, meta, obstaculos, ...(nAce ? { aceitunas: ace } : {}) };
    if (modo === 'mayor') nv.dir = DIRS[Math.floor(r() * 4)];

    const sol = resolver(nv, modo);
    if (!sol || sol.length < spec.opt[0] || sol.length > spec.opt[1]) continue;
    if (giros(sol, modo) < (spec.giros || 0)) continue;
    if (spec.desvio) {
      const sinObst = resolver({ ...nv, obstaculos: [] }, modo);
      if (sinObst.length >= sol.length) continue;
    }
    return { nv, sol };
  }
  throw new Error(`No se pudo generar un nivel con ${JSON.stringify(spec)}`);
}

// Niveles con muros que cruzan el tablero: cada muro tiene un hueco con puerta,
// y su llave está antes del muro. spec.muros = 1 o 2.
function generarMuros(spec, modo, semillaBase) {
  const [W, H] = spec.tam; // se asume tablero cuadrado (se puede trasponer)
  for (let intento = 0; intento < 200000; intento++) {
    const r = aleatorio(semillaBase * 7919 + intento);
    const nm = spec.muros;
    const cols = nm === 1 ? [entre(r, [2, W - 3])] : [entre(r, [1, Math.floor(W / 2) - 1]), 0];
    if (nm === 2) cols[1] = entre(r, [cols[0] + 2, W - 2]);
    const huecos = cols.map(() => Math.floor(r() * H));
    const muro = [];
    cols.forEach((c, i) => { for (let y = 0; y < H; y++) if (y !== huecos[i]) muro.push([c, y]); });
    const puertas = cols.map((c, i) => [c, huecos[i]]);
    const region = x => cols.filter(c => x > c).length; // 0 antes del primer muro, etc.
    const libres = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!cols.includes(x)) libres.push([x, y]);
    for (let i = libres.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [libres[i], libres[j]] = [libres[j], libres[i]]; }
    const toma = f => { const i = libres.findIndex(f); return i < 0 ? null : libres.splice(i, 1)[0]; };
    const inicio = toma(([x]) => region(x) === 0);
    const meta = toma(([x]) => region(x) === nm);
    const llaves = cols.map((_, i) => toma(([x]) => region(x) <= i && (i === 0 || r() < 0.5 || region(x) === i)));
    if (!inicio || !meta || llaves.includes(null)) continue;
    const nAce = entre(r, spec.aceitunas || [0, 0]);
    const ace = libres.splice(0, nAce);
    const extra = libres.splice(0, entre(r, spec.obst));
    let nv = { tam: spec.tam, inicio, meta, obstaculos: [...muro, ...extra], llaves, puertas, ...(nAce ? { aceitunas: ace } : {}) };
    if (r() < 0.5) { // trasponer: muros horizontales
      const t = ([x, y]) => [y, x];
      nv = { ...nv, inicio: t(nv.inicio), meta: t(nv.meta), obstaculos: nv.obstaculos.map(t), llaves: nv.llaves.map(t), puertas: nv.puertas.map(t),
        ...(nv.aceitunas ? { aceitunas: nv.aceitunas.map(t) } : {}) };
    }
    if (modo === 'mayor') nv.dir = DIRS[Math.floor(r() * 4)];
    const sol = resolver(nv, modo);
    if (!sol || sol.length < spec.opt[0] || sol.length > spec.opt[1]) continue;
    if (giros(sol, modo) < (spec.giros || 0)) continue;
    return { nv, sol };
  }
  throw new Error(`No se pudo generar un nivel con muros ${JSON.stringify(spec)}`);
}

// Niveles construidos a partir de un programa con bucles: el camino que recorre queda libre,
// el resto se llena de obstáculos con probabilidad `relleno`, y las aceitunas van donde el programa recoge.
function desdePrograma(spec, semillaBase) {
  const prog = spec.programa.split(' ');
  const r = aleatorio(semillaBase);
  const [W, H] = spec.tam;
  let s = estadoInicial({ inicio: spec.inicio, dir: spec.dir });
  const camino = new Set([s.x + ',' + s.y]);
  const ace = [];
  for (const p of desplegar(prog)) {
    if (p.b === 'bucle') continue;
    if (p.b === 'recoger') { ace.push([s.x, s.y]); continue; }
    s = paso(s, p.b);
    if (s.x < 0 || s.y < 0 || s.x >= W || s.y >= H) throw new Error(`El programa se sale del tablero: ${spec.programa}`);
    camino.add(s.x + ',' + s.y);
  }
  const meta = [s.x, s.y];
  const obstaculos = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!camino.has(x + ',' + y) && r() < spec.relleno) obstaculos.push([x, y]);
  const nv = { tam: spec.tam, inicio: spec.inicio, dir: spec.dir, meta, obstaculos, ...(ace.length ? { aceitunas: ace } : {}), bucles: true, solucion: prog };
  if (simular(nv, 'mayor', prog).resultado !== 'meta') throw new Error(`La solución no llega: ${spec.programa}`);
  return { nv, sol: prog, reto: contarBloques(prog) };
}

// ---------- Especificaciones ----------
// tam, obst (mín/máx), aceitunas, opt (bloques de la solución más corta), giros mínimos, desvio (los obstáculos obligan a rodear).

const MUNDOS = {
  1: {
    nombre: 'Barrio de la Magdalena',
    final: {
      peque: '¡Bravo! Has recorrido el Barrio de la Magdalena. Cuenta la leyenda que aquí vivía un lagarto enorme... ¡pero ahora es tu amigo!',
      mayor: '¡Bravo! Has recorrido las callejuelas de la Magdalena. Dice la leyenda que un lagarto gigante vivía junto al Raudal y asustaba a los vecinos... ¡hasta que lo vencieron con astucia!',
    },
    peque: [
      { manual: {"id": "1-1", "tam": [5, 5], "inicio": [0, 2], "meta": [3, 2], "obstaculos": [], "optimo": 3, "texto": "¡Hola! Soy el Lagarto de la Malena. Llévame a la fuente del Raudal.", "voz": "¡Hola! Soy el Lagarto de la Malena. ¿Me ayudas a llegar a la fuente del Raudal? Pon flechas abajo y pulsa el botón verde."} },
      { manual: {"id": "1-2", "tam": [5, 5], "inicio": [2, 4], "meta": [2, 1], "obstaculos": [[0, 0], [4, 0]], "optimo": 3, "texto": "Ahora la fuente está arriba. ¿Qué flechas necesitas?", "voz": "¡Muy bien! Ahora la fuente está arriba. ¿Qué flechas necesitas?"} },
      { manual: {"id": "1-3", "tam": [5, 5], "inicio": [0, 4], "meta": [3, 1], "obstaculos": [[1, 4], [2, 4], [1, 3], [2, 3], [4, 4], [4, 0]], "optimo": 6, "texto": "¡Cuidado con las casas! Busca el camino libre.", "voz": "¡Cuidado con las casas! No se pueden atravesar. Busca el camino libre hasta la fuente."} },
      { tam: [5, 5], obst: [3, 4], opt: [4, 5], giros: 1, texto: 'Sube y baja por las calles del barrio.', voz: 'Ahora tendrás que cambiar de dirección. Busca el camino hasta la fuente.' },
      { tam: [5, 5], obst: [3, 5], opt: [5, 5], giros: 1, desvio: true, texto: 'Las casas cortan el paso. ¡Rodéalas!', voz: 'Las casas cortan el paso. Tendrás que rodearlas para llegar a la fuente.' },
      { tam: [5, 5], obst: [4, 6], opt: [5, 6], giros: 2, desvio: true, texto: 'Un camino con dos curvas.', voz: 'Este camino tiene curvas. Mira bien antes de poner las flechas.' },
      { tam: [5, 5], obst: [5, 7], opt: [6, 6], giros: 2, desvio: true, texto: '¡Qué lío de calles!', voz: '¡Qué lío de calles! Sigue con el dedo el camino antes de empezar.' },
      { tam: [5, 5], obst: [6, 8], opt: [6, 7], giros: 2, desvio: true, texto: 'El último rincón de la Magdalena.', voz: 'El último rincón de la Magdalena. ¡Tú puedes!' },
    ],
    mayor: [
      { manual: {"id": "1-1", "tam": [6, 6], "inicio": [0, 3], "dir": "derecha", "meta": [4, 3], "obstaculos": [[0, 0], [5, 0], [0, 5], [5, 5]], "reto": 4, "texto": "Ahora miras hacia un lado. «Avanzar» te lleva un paso adelante.", "voz": "¡Hola! En tu modo, el avatar mira hacia un lado. El bloque avanzar le hace dar un paso hacia donde mira. Llega a la fuente."} },
      { manual: {"id": "1-2", "tam": [6, 6], "inicio": [0, 5], "dir": "derecha", "meta": [3, 2], "obstaculos": [[4, 5], [5, 5], [5, 4], [0, 0], [1, 0]], "reto": 7, "texto": "Las flechas curvas giran sin moverte de la casilla.", "voz": "Las flechas curvas hacen girar al avatar sin moverse de la casilla. Fíjate en la flechita que indica hacia dónde mira."} },
      { manual: {"id": "1-3", "tam": [6, 6], "inicio": [0, 0], "dir": "abajo", "meta": [4, 3], "obstaculos": [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [0, 5], [5, 5], [5, 0]], "reto": 8, "texto": "Ojo: si miras hacia abajo, ¿hacia dónde es tu izquierda?", "voz": "¡Ojo! Si el avatar mira hacia abajo, su izquierda no es tu izquierda. Imagina que eres tú quien camina."} },
      { tam: [6, 6], obst: [6, 9], opt: [9, 11], giros: 2, desvio: true, texto: 'Recuerda: gira según hacia dónde mira el avatar.', voz: 'Recuerda que los giros dependen de hacia dónde mira el avatar, no de hacia dónde miras tú.' },
      { tam: [6, 6], obst: [7, 10], opt: [10, 12], giros: 3, desvio: true, texto: 'Tres giros como mínimo. ¿Los encuentras?', voz: 'Aquí hacen falta al menos tres giros. ¿Los encuentras?' },
      { manual: {"id": "1-4", "tam": [6, 6], "inicio": [0, 5], "dir": "arriba", "meta": [5, 0], "obstaculos": [[1, 5], [2, 5], [1, 4], [2, 4], [4, 5], [5, 5], [4, 4], [5, 4], [0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [4, 2], [5, 2], [5, 3]], "reto": 13, "texto": "Callejuelas en zigzag. Planea los giros antes de pulsar ¡Ya!", "voz": "Las callejuelas de la Magdalena hacen zigzag. Planea bien los giros antes de pulsar el botón verde."} },
      { tam: [7, 7], obst: [10, 14], opt: [11, 13], giros: 3, desvio: true, texto: 'Un barrio más grande. Planea antes de programar.', voz: 'El barrio se hace más grande. Planea el camino antes de programar.' },
      { tam: [7, 7], obst: [12, 16], opt: [12, 15], giros: 4, desvio: true, texto: 'Calles estrechas y muchas esquinas.', voz: 'Calles estrechas y muchas esquinas. ¡Ojo con los giros!' },
      { tam: [7, 7], obst: [14, 18], opt: [14, 16], giros: 4, desvio: true, texto: 'El gran reto de la Magdalena.', voz: 'El gran reto de la Magdalena. Si lo consigues con pocos bloques, eres un experto.' },
      { manual: {"id": "1-5", "tam": [8, 8], "inicio": [0, 7], "dir": "derecha", "meta": [7, 0], "obstaculos": [[3, 7], [4, 7], [1, 6], [3, 6], [6, 6], [1, 5], [5, 5], [6, 5], [3, 4], [4, 4], [5, 4], [0, 3], [1, 3], [6, 3], [3, 2], [4, 2], [1, 1], [5, 1], [6, 1], [3, 0]], "reto": 18, "texto": "¡El laberinto del barrio! Encuentra el camino más corto.", "voz": "¡El laberinto del barrio! Encuentra el camino hasta la fuente. Si lo haces con pocos bloques, ganarás la tercera estrella."} },
    ],
  },
  2: {
    nombre: 'Mar de olivos',
    final: {
      peque: '¡Bien hecho! Has recogido las aceitunas del mar de olivos. En Jaén hay tantos olivos que, vistos desde el cerro, parecen un mar verde.',
      mayor: '¡Bien hecho! Has cruzado el mar de olivos. Jaén tiene millones de olivos y es el lugar del mundo donde más aceite de oliva se produce.',
    },
    peque: [
      { tam: [5, 5], obst: [2, 3], aceitunas: [1, 1], opt: [3, 4], texto: 'Coge la aceituna y llévala a la almazara.', voz: '¡Bienvenido al mar de olivos! Pasa por encima de la aceituna para cogerla y después llega a la almazara.' },
      { tam: [5, 5], obst: [3, 4], aceitunas: [1, 1], opt: [4, 5], giros: 1, texto: 'Primero la aceituna, después la almazara.', voz: 'Primero la aceituna, y después la almazara. Los olivos no se pueden atravesar.' },
      { tam: [5, 5], obst: [3, 5], aceitunas: [2, 2], opt: [4, 5], giros: 1, texto: '¡Dos aceitunas!', voz: 'Ahora hay dos aceitunas. Recógelas todas antes de llegar a la almazara.' },
      { tam: [5, 5], obst: [4, 5], aceitunas: [2, 2], opt: [5, 6], giros: 1, desvio: true, texto: 'Esquiva los olivos.', voz: 'Esquiva los olivos y recoge las dos aceitunas.' },
      { tam: [5, 5], obst: [4, 6], aceitunas: [2, 2], opt: [5, 6], giros: 2, desvio: true, texto: 'Un camino entre olivos.', voz: 'Busca un camino entre los olivos que pase por las dos aceitunas.' },
      { tam: [5, 5], obst: [3, 5], aceitunas: [3, 3], opt: [6, 7], giros: 2, texto: '¡Tres aceitunas!', voz: '¡Tres aceitunas! ¿Por cuál empiezas?' },
      { tam: [5, 5], obst: [4, 6], aceitunas: [3, 3], opt: [6, 7], giros: 2, desvio: true, texto: 'La cosecha está en marcha.', voz: 'La cosecha está en marcha. Recoge las tres aceitunas sin chocar con los olivos.' },
      { tam: [5, 5], obst: [5, 7], aceitunas: [3, 3], opt: [7, 8], giros: 2, desvio: true, texto: 'La última cosecha.', voz: 'La última cosecha del olivar. ¡A por todas las aceitunas!' },
    ],
    mayor: [
      { tam: [6, 6], obst: [4, 6], aceitunas: [1, 1], opt: [5, 7], giros: 1, texto: 'Nuevo bloque: «recoger». Úsalo encima de la aceituna.', voz: 'Nuevo bloque: recoger. Ponte encima de la aceituna y usa recoger. Luego llega a la almazara.' },
      { tam: [6, 6], obst: [5, 7], aceitunas: [1, 1], opt: [7, 9], giros: 2, desvio: true, texto: 'Pasar por encima no basta: hay que recoger.', voz: 'Recuerda: pasar por encima no basta, tienes que usar el bloque recoger.' },
      { tam: [6, 6], obst: [5, 8], aceitunas: [2, 2], opt: [8, 10], giros: 2, texto: 'Dos aceitunas, dos «recoger».', voz: 'Dos aceitunas significan dos bloques de recoger.' },
      { tam: [6, 6], obst: [6, 9], aceitunas: [2, 2], opt: [9, 11], giros: 2, desvio: true, texto: 'Elige bien el orden de recogida.', voz: 'Elige bien el orden. A veces conviene empezar por la aceituna más lejana.' },
      { tam: [6, 6], obst: [7, 10], aceitunas: [2, 2], opt: [10, 12], giros: 3, desvio: true, texto: 'Olivos por todas partes.', voz: 'Olivos por todas partes. Encuentra el camino más corto.' },
      { tam: [7, 7], obst: [8, 12], aceitunas: [2, 2], opt: [11, 13], giros: 3, desvio: true, texto: 'El olivar se hace más grande.', voz: 'El olivar se hace más grande. Planea antes de programar.' },
      { tam: [7, 7], obst: [8, 12], aceitunas: [3, 3], opt: [12, 14], giros: 3, texto: '¡Tres aceitunas!', voz: 'Tres aceitunas que recoger. ¿Cuál es el mejor orden?' },
      { tam: [7, 7], obst: [10, 14], aceitunas: [3, 3], opt: [13, 15], giros: 4, desvio: true, texto: 'Entre hileras de olivos.', voz: 'Camina entre las hileras de olivos y recoge las tres aceitunas.' },
      { tam: [7, 7], obst: [11, 15], aceitunas: [3, 3], opt: [14, 16], giros: 4, desvio: true, texto: 'Cosecha difícil.', voz: 'Una cosecha difícil. Si lo consigues con pocos bloques, ganarás la tercera estrella.' },
      { tam: [7, 7], obst: [10, 14], aceitunas: [4, 4], opt: [15, 17], giros: 4, desvio: true, texto: 'La gran cosecha: ¡cuatro aceitunas!', voz: 'La gran cosecha del olivar: cuatro aceitunas. ¡Ánimo!' },
    ],
  },
  3: {
    nombre: 'Plaza de Santa María',
    final: {
      peque: '¡Lo lograste! Has llegado a la Catedral de Jaén. Es tan grande y bonita que tardaron más de doscientos años en construirla.',
      mayor: '¡Lo lograste! Has llegado a la Catedral de Jaén, una joya del Renacimiento. Tardaron más de doscientos años en construirla, y sirvió de modelo para catedrales de América.',
    },
    peque: [
      { tam: [5, 5], obst: [3, 4], opt: [5, 5], giros: 1, texto: 'Cruza la plaza hasta la Catedral.', voz: '¡Bienvenido a la plaza de Santa María! Cruza la plaza hasta la puerta de la Catedral.' },
      { tam: [5, 5], obst: [4, 5], opt: [5, 6], giros: 1, desvio: true, texto: 'Cuidado con las fuentes y las palomas.', voz: 'Cuidado con las fuentes y las palomas: no se pueden atravesar.' },
      { tam: [5, 5], obst: [4, 6], opt: [6, 6], giros: 2, desvio: true, texto: 'Un paseo más largo.', voz: 'Este paseo es más largo. Ve poniendo las flechas poco a poco.' },
      { tam: [5, 5], obst: [5, 7], opt: [6, 7], giros: 2, desvio: true, texto: '¡Cuántas palomas!', voz: '¡Cuántas palomas hay hoy en la plaza! Busca un camino libre.' },
      { tam: [5, 5], obst: [5, 7], aceitunas: [1, 1], opt: [7, 7], giros: 2, desvio: true, texto: 'Alguien ha perdido una aceituna...', voz: 'Alguien ha perdido una aceituna en la plaza. Recógela de camino a la Catedral.' },
      { tam: [5, 5], obst: [6, 8], opt: [7, 8], giros: 3, desvio: true, texto: 'Rodea la plaza.', voz: 'Tendrás que rodear media plaza. ¡Fíjate bien!' },
      { tam: [5, 5], obst: [5, 7], aceitunas: [2, 2], opt: [8, 8], giros: 2, desvio: true, texto: 'Dos aceitunas perdidas.', voz: 'Hay dos aceitunas perdidas. Recógelas antes de entrar en la Catedral.' },
      { tam: [5, 5], obst: [7, 9], opt: [8, 9], giros: 3, desvio: true, texto: 'El gran paseo final.', voz: 'El gran paseo final hasta la Catedral. ¡Tú puedes!' },
    ],
    mayor: [
      { tam: [7, 7], obst: [8, 11], opt: [11, 13], giros: 2, desvio: true, texto: 'Cruza la plaza hasta la Catedral.', voz: 'Bienvenido a la plaza de Santa María. Cruza la plaza hasta la puerta de la Catedral, esquivando fuentes y palomas.' },
      { tam: [7, 7], obst: [10, 13], opt: [12, 14], giros: 3, desvio: true, texto: 'Recorridos largos: divide el camino en tramos.', voz: 'Los recorridos son largos. Un truco: divide el camino en tramos rectos.' },
      { tam: [7, 7], obst: [10, 14], aceitunas: [1, 1], opt: [12, 14], giros: 3, desvio: true, texto: 'Una aceituna perdida en la plaza.', voz: 'Alguien ha perdido una aceituna en la plaza. Recógela de camino.' },
      { tam: [7, 7], obst: [12, 16], opt: [13, 15], giros: 4, desvio: true, texto: 'Palomas por todas partes.', voz: 'Hay palomas por todas partes. Busca el camino más corto.' },
      { tam: [8, 8], obst: [14, 18], opt: [13, 15], giros: 3, desvio: true, texto: 'La plaza grande.', voz: 'Ahora la plaza es más grande. Planea antes de programar.' },
      { tam: [8, 8], obst: [16, 20], aceitunas: [2, 2], opt: [14, 16], giros: 4, desvio: true, texto: 'Dos aceitunas y muchas palomas.', voz: 'Dos aceitunas y muchas palomas. ¿Cuál es el mejor orden?' },
      { tam: [8, 8], obst: [16, 21], opt: [14, 16], giros: 5, desvio: true, texto: 'Zigzag entre fuentes.', voz: 'Un zigzag entre fuentes. Cuenta bien las casillas.' },
      { tam: [8, 8], obst: [18, 22], opt: [15, 17], giros: 5, desvio: true, texto: 'Casi en la puerta.', voz: 'Ya casi estás en la puerta de la Catedral.' },
      { tam: [8, 8], obst: [16, 20], aceitunas: [2, 2], opt: [16, 18], giros: 5, desvio: true, texto: 'Un recado antes de entrar.', voz: 'Antes de entrar en la Catedral, recoge las dos aceitunas.' },
      { tam: [8, 8], obst: [20, 24], opt: [16, 18], giros: 6, desvio: true, texto: 'El gran recorrido final.', voz: 'El gran recorrido final. Si lo consigues con pocos bloques, eres un maestro programador.' },
    ],
  },
  4: {
    nombre: 'Baños Árabes',
    final: {
      peque: '¡Genial! Has abierto todas las puertas de los Baños Árabes. Hace casi mil años, la gente venía aquí a bañarse con agua fría, templada y caliente.',
      mayor: '¡Genial! Has recorrido los Baños Árabes de Jaén, de los más grandes de Europa. Estuvieron escondidos durante siglos bajo un palacio, hasta que los redescubrieron.',
    },
    peque: [
      { tam: [5, 5], muros: 1, obst: [0, 1], opt: [4, 5], texto: 'Coge la llave para abrir la puerta.', voz: '¡Bienvenido a los Baños Árabes! La puerta está cerrada. Coge primero la llave, y luego podrás pasar.' },
      { tam: [5, 5], muros: 1, obst: [0, 2], opt: [5, 6], giros: 1, texto: 'Primero la llave, después la puerta.', voz: 'Recuerda: primero la llave, y después la puerta.' },
      { tam: [5, 5], muros: 1, obst: [1, 2], opt: [5, 7], giros: 2, texto: 'La llave está escondida.', voz: 'La llave está escondida entre las columnas. ¡Búscala!' },
      { tam: [5, 5], muros: 1, obst: [1, 3], aceitunas: [1, 1], opt: [6, 8], giros: 2, texto: 'Una llave y una aceituna.', voz: 'Hay una llave y una aceituna. Necesitas las dos.' },
      { tam: [5, 5], muros: 1, obst: [2, 3], opt: [7, 8], giros: 2, texto: 'Un camino largo hasta la llave.', voz: 'La llave está lejos. Fíjate bien en el camino.' },
      { tam: [5, 5], muros: 2, obst: [0, 1], opt: [6, 8], giros: 2, texto: '¡Dos puertas y dos llaves!', voz: '¡Dos puertas! La llave dorada abre la puerta dorada, y la azul abre la azul.' },
      { tam: [5, 5], muros: 2, obst: [0, 2], opt: [7, 9], giros: 2, texto: 'Cada llave abre su puerta.', voz: 'Cada llave abre la puerta de su color.' },
      { tam: [5, 5], muros: 2, obst: [1, 2], opt: [8, 10], giros: 3, texto: 'La sala caliente de los baños.', voz: 'Ya llegas a la sala caliente de los baños. ¡Abre todas las puertas!' },
    ],
    mayor: [
      { tam: [6, 6], muros: 1, obst: [1, 2], opt: [7, 9], giros: 1, texto: '«Recoger» también sirve para coger llaves.', voz: 'Bienvenido a los Baños Árabes. El bloque recoger también sirve para coger llaves. Sin llave, la puerta no se abre.' },
      { tam: [6, 6], muros: 1, obst: [2, 3], opt: [9, 11], giros: 2, texto: 'Primero la llave, después la puerta.', voz: 'Planea el camino: primero la llave y después la puerta.' },
      { tam: [6, 6], muros: 1, obst: [3, 4], opt: [10, 12], giros: 3, texto: 'Entre columnas.', voz: 'Camina entre las columnas hasta la llave.' },
      { tam: [6, 6], muros: 1, obst: [2, 4], aceitunas: [1, 1], opt: [11, 13], giros: 3, texto: 'Una llave y una aceituna.', voz: 'Hay una llave y una aceituna. Recoge las dos.' },
      { tam: [7, 7], muros: 1, obst: [4, 6], opt: [12, 14], giros: 3, texto: 'Una sala más grande.', voz: 'Una sala más grande. Planea antes de programar.' },
      { tam: [7, 7], muros: 2, obst: [1, 3], opt: [11, 14], giros: 3, texto: 'Dos puertas: cada llave abre la suya.', voz: 'Dos puertas. La llave dorada abre la dorada y la azul abre la azul.' },
      { tam: [7, 7], muros: 2, obst: [2, 4], opt: [13, 15], giros: 4, texto: 'El orden importa.', voz: 'El orden importa: piensa qué llave necesitas primero.' },
      { tam: [7, 7], muros: 2, obst: [2, 4], aceitunas: [1, 1], opt: [14, 16], giros: 4, texto: 'Llaves, puertas y una aceituna.', voz: 'Llaves, puertas y una aceituna. ¡Un buen reto!' },
      { tam: [7, 7], muros: 2, obst: [3, 5], opt: [15, 17], giros: 4, texto: 'Pasillos de los baños.', voz: 'Recorre los pasillos de los baños abriendo todas las puertas.' },
      { tam: [7, 7], muros: 2, obst: [3, 6], opt: [16, 18], giros: 5, texto: 'La sala caliente.', voz: 'La última sala: la sala caliente. Si lo haces con pocos bloques, ganarás la tercera estrella.' },
    ],
  },
  5: {
    nombre: 'Castillo de Santa Catalina',
    final: {
      peque: '¡Has llegado a la Cruz, en lo más alto del cerro! Desde aquí se ve todo Jaén: la Catedral, las casas y el mar de olivos. ¡Eres un gran aventurero!',
      mayor: '¡Has llegado a la Cruz del castillo de Santa Catalina! Desde aquí se ve todo Jaén y su mar de olivos. Has aprendido a programar con secuencias, giros y bucles. ¡Eres un maestro programador!',
    },
    peque: [
      { tam: [5, 5], obst: [4, 6], opt: [7, 7], giros: 2, desvio: true, texto: '¡A subir al castillo!', voz: '¡Vamos a subir al castillo de Santa Catalina! El camino es largo. Pon las flechas poco a poco.' },
      { tam: [5, 5], obst: [5, 7], opt: [7, 8], giros: 2, desvio: true, texto: 'El camino del cerro.', voz: 'El camino del cerro da muchas vueltas. ¡Fíjate bien!' },
      { tam: [5, 5], obst: [5, 7], aceitunas: [1, 1], opt: [8, 8], giros: 2, desvio: true, texto: 'Una aceituna en el camino.', voz: 'Hay una aceituna en el camino. Recógela al subir.' },
      { tam: [5, 5], obst: [6, 8], opt: [8, 9], giros: 3, desvio: true, texto: 'Entre rocas y pinos.', voz: 'Sube entre las rocas y los pinos.' },
      { tam: [6, 6], obst: [8, 11], opt: [8, 9], giros: 3, desvio: true, texto: 'Las murallas del castillo.', voz: 'Ya ves las murallas del castillo. ¡Sigue subiendo!' },
      { tam: [6, 6], obst: [9, 12], opt: [9, 10], giros: 3, desvio: true, texto: 'Dentro del castillo.', voz: 'Estás dentro del castillo. Busca el camino hasta la Cruz.' },
      { tam: [6, 6], obst: [9, 12], aceitunas: [1, 1], opt: [9, 10], giros: 3, desvio: true, texto: 'Casi en lo más alto.', voz: 'Casi estás en lo más alto. No olvides la aceituna.' },
      { tam: [6, 6], obst: [10, 13], opt: [10, 10], giros: 4, desvio: true, texto: '¡La Cruz del cerro!', voz: '¡El último camino hasta la Cruz! Desde allí verás todo Jaén.' },
    ],
    mayor: [
      { tam: [7, 7], inicio: [1, 3], dir: 'derecha', programa: 'repetir5 avanzar fin', relleno: 0.3, texto: 'Nuevo bloque: «repetir». Repite lo que hay dentro.', voz: 'Nuevo bloque: repetir. Repite varias veces los bloques que pongas dentro, hasta el final del bucle. Toca el bloque repetir para cambiar el número de veces.' },
      { tam: [7, 7], inicio: [0, 6], dir: 'derecha', programa: 'repetir4 avanzar fin izq repetir5 avanzar fin', relleno: 0.45, texto: 'Dos bucles seguidos.', voz: 'Aquí puedes usar dos bucles seguidos. Toca el final de un bucle para seguir poniendo bloques fuera de él.' },
      { tam: [7, 7], inicio: [0, 6], dir: 'derecha', programa: 'repetir5 avanzar izq avanzar der fin', relleno: 0.85, texto: '¡Escaleras! Busca lo que se repite.', voz: 'Las escaleras del cerro. ¿Qué movimientos se repiten en cada escalón? Mételos en un bucle.' },
      { tam: [7, 7], inicio: [0, 6], dir: 'derecha', programa: 'repetir4 avanzar recoger izq avanzar der fin', relleno: 0.85, texto: 'Una aceituna en cada escalón.', voz: 'Hay una aceituna en cada escalón. También puedes recoger dentro de un bucle.' },
      { tam: [7, 7], inicio: [1, 5], dir: 'derecha', programa: 'repetir3 repetir4 avanzar fin izq fin', relleno: 0.8, texto: 'Un bucle dentro de otro bucle.', voz: 'Un reto especial: un bucle dentro de otro bucle. Cada lado del camino es igual.' },
      { tam: [8, 8], inicio: [0, 7], dir: 'derecha', programa: 'repetir3 avanzar avanzar izq avanzar avanzar der fin', relleno: 0.85, texto: 'Escalones dobles.', voz: 'Ahora los escalones son dobles. ¿Qué se repite?' },
      { tam: [8, 6], inicio: [0, 5], dir: 'derecha', programa: 'repetir3 avanzar izq avanzar der fin repetir3 avanzar der avanzar izq fin', relleno: 0.85, texto: 'Subir y bajar la colina.', voz: 'Sube la colina y bájala por el otro lado. Necesitarás dos bucles.' },
      { tam: [8, 8], inicio: [0, 7], dir: 'derecha', programa: 'repetir3 repetir2 avanzar fin recoger izq repetir2 avanzar fin der fin', relleno: 0.85, texto: 'Aceitunas en los rellanos.', voz: 'Hay aceitunas en cada rellano de la escalera. Prueba con bucles dentro de bucles.' },
      { tam: [5, 9], inicio: [0, 8], dir: 'derecha', programa: 'repetir2 repetir4 avanzar fin izq repetir2 avanzar fin izq repetir4 avanzar fin der repetir2 avanzar fin der fin', relleno: 1, texto: 'El camino en zigzag de la muralla.', voz: 'El camino de la muralla va en zigzag. Sin bucles harían falta muchísimos bloques.' },
      { tam: [9, 8], inicio: [0, 7], dir: 'derecha', programa: 'repetir2 repetir3 avanzar izq avanzar der fin recoger avanzar fin', relleno: 0.85, texto: '¡La subida final a la Cruz!', voz: 'La subida final hasta la Cruz del castillo. Usa todo lo que has aprendido.' },
    ],
  },
};

// ---------- Generación ----------

for (const [n, mundo] of Object.entries(MUNDOS)) {
  for (const modo of ['peque', 'mayor']) {
    const archivo = join(carpeta, `mundo${n}-${modo}.json`);
    const niveles = mundo[modo].map((spec, i) => {
      const id = `${n}-${i + 1}`;
      if (spec.manual) return { ...spec.manual, id };
      const semilla = Number(n) * 1000 + (i + 1) * 10 + (modo === 'mayor' ? 5 : 0);
      const { nv, sol, reto } = spec.programa ? desdePrograma(spec, semilla)
        : spec.muros ? generarMuros(spec, modo, semilla) : generar(spec, modo, semilla);
      const nivel = { id, ...nv };
      if (modo === 'mayor') nivel.reto = reto ?? sol.length; else nivel.optimo = sol.length;
      nivel.texto = spec.texto;
      nivel.voz = spec.voz;
      return nivel;
    });

    const salida = { mundo: Number(n), nombre: mundo.nombre, final: mundo.final[modo], niveles };
    // JSON legible pero con las coordenadas en una sola línea
    const texto = JSON.stringify(salida, null, 2).replace(/\[\s+(-?\d+),\s+(-?\d+)\s+\]/g, '[$1, $2]')
      .replace(/\[\s+((?:\[\d+, \d+\],?\s*)+)\]/g, (_, d) => `[${d.replace(/\s+/g, ' ').trim()}]`);
    writeFileSync(archivo, texto + '\n');
    console.log(`${archivo.split('/').pop()}: ${niveles.length} niveles`);
  }
}
