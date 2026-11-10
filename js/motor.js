// Reglas del juego sin dibujo: se usan en el navegador y en las herramientas de tools/.
// Estado del avatar: { x, y, dir, m, k }
//   m: máscara de bits de las aceitunas recogidas
//   k: máscara de bits de las llaves recogidas (la llave i abre la puerta i)

export const DIRS = { arriba: [0, -1], derecha: [1, 0], abajo: [0, 1], izquierda: [-1, 0] };
const A_LA_IZQ = { arriba: 'izquierda', izquierda: 'abajo', abajo: 'derecha', derecha: 'arriba' };
const A_LA_DER = { arriba: 'derecha', derecha: 'abajo', abajo: 'izquierda', izquierda: 'arriba' };

// El pequeño usa direcciones absolutas y recoge al pisar; el mayor gira y usa «recoger».
const BLOQUES = {
  peque: ['arriba', 'abajo', 'izquierda', 'derecha'],
  mayor: ['avanzar', 'izq', 'der'],
};

export const aceitunas = nv => nv.aceitunas || [];
export const llaves = nv => nv.llaves || [];
export const puertas = nv => nv.puertas || [];

export function bloquesDe(nv, modo) {
  if (modo === 'peque') return BLOQUES.peque;
  const b = [...BLOQUES.mayor];
  if (aceitunas(nv).length || llaves(nv).length) b.push('recoger');
  if (nv.bucles) b.push('repetir');
  return b;
}

/* ---------- Bucles ----------
   En el programa, un bucle es el bloque 'repetirN' (N = 2..9), su cuerpo y el bloque 'fin'. */

export const esRepetir = b => /^repetir\d$/.test(b);
export const veces = b => Number(b.slice(7));
export const mueve = b => !['izq', 'der', 'recoger', 'fin'].includes(b) && !esRepetir(b) && b !== 'bucle';

// Bloques que cuentan para el reto: el 'fin' es solo un cierre y no cuenta.
export const contarBloques = prog => prog.filter(b => b !== 'fin').length;

// Empareja cada 'repetirN' con su 'fin'. Devuelve Map(inicio → fin). Un bucle sin cerrar llega hasta el final.
export function emparejar(prog) {
  const pares = new Map();
  const pila = [];
  prog.forEach((b, i) => {
    if (esRepetir(b)) pila.push(i);
    else if (b === 'fin' && pila.length) pares.set(pila.pop(), i);
  });
  while (pila.length) pares.set(pila.pop(), prog.length);
  return pares;
}

// Deja el programa bien formado: quita los 'fin' sueltos y cierra los bucles abiertos.
export function normalizar(prog) {
  const pila = [];
  const salida = [];
  for (const b of prog) {
    if (esRepetir(b)) pila.push(b);
    if (b === 'fin') { if (!pila.length) continue; pila.pop(); }
    salida.push(b);
  }
  while (pila.length) { pila.pop(); salida.push('fin'); }
  return salida;
}

const MAX_PASOS = 400;

// Convierte el programa en la lista de pasos que se ejecutan, con el índice del bloque de origen.
// Los pasos { b: 'bucle' } marcan el comienzo de cada vuelta (solo sirven para resaltar).
export function desplegar(prog) {
  const pares = emparejar(prog);
  const pasos = [];
  const correr = (desde, hasta) => {
    for (let i = desde; i < hasta && pasos.length < MAX_PASOS; i++) {
      const b = prog[i];
      if (esRepetir(b)) {
        const fin = pares.get(i);
        for (let v = 1; v <= veces(b) && pasos.length < MAX_PASOS; v++) {
          pasos.push({ b: 'bucle', idx: i, vuelta: v, total: veces(b) });
          correr(i + 1, fin);
        }
        i = fin;
      } else if (b !== 'fin') pasos.push({ b, idx: i });
    }
  };
  correr(0, prog.length);
  return pasos;
}

/* ---------- Tablero ---------- */

export function estadoInicial(nv) {
  return { x: nv.inicio[0], y: nv.inicio[1], dir: nv.dir || 'derecha', m: 0, k: 0 };
}

// Estado al que se intenta llegar con un bloque de movimiento o giro (sin comprobar si es libre).
export function paso(s, b) {
  if (b in DIRS) return { ...s, x: s.x + DIRS[b][0], y: s.y + DIRS[b][1], dir: b };
  if (b === 'avanzar') return { ...s, x: s.x + DIRS[s.dir][0], y: s.y + DIRS[s.dir][1] };
  if (b === 'izq') return { ...s, dir: A_LA_IZQ[s.dir] };
  if (b === 'der') return { ...s, dir: A_LA_DER[s.dir] };
  return { ...s };
}

const en = (lista, x, y) => lista.findIndex(([ax, ay]) => ax === x && ay === y);

export const esObstaculo = (nv, x, y) => en(nv.obstaculos, x, y) >= 0;
export const indiceAceituna = (nv, x, y) => en(aceitunas(nv), x, y);
export const indiceLlave = (nv, x, y) => en(llaves(nv), x, y);
export const indicePuerta = (nv, x, y) => en(puertas(nv), x, y);

// Libre sin contar puertas (bordes y obstáculos fijos).
export function libre(nv, x, y) {
  const [cols, filas] = nv.tam;
  return x >= 0 && y >= 0 && x < cols && y < filas && !esObstaculo(nv, x, y);
}

export const enMeta = (nv, x, y) => x === nv.meta[0] && y === nv.meta[1];
export const todas = (nv, m) => m === (1 << aceitunas(nv).length) - 1;
export const llego = (nv, s) => enMeta(nv, s.x, s.y) && todas(nv, s.m);

// Recoge lo que haya en la casilla del estado (aceituna o llave). Devuelve qué se ha recogido.
function recogerAqui(nv, s) {
  const a = indiceAceituna(nv, s.x, s.y);
  if (a >= 0 && !(s.m & (1 << a))) { s.m |= 1 << a; return { tipo: 'aceituna', i: a }; }
  const l = indiceLlave(nv, s.x, s.y);
  if (l >= 0 && !(s.k & (1 << l))) { s.k |= 1 << l; return { tipo: 'llave', i: l }; }
  return null;
}

// Aplica un bloque. evento: 'mover' | 'girar' | 'recoger' | 'choque' | 'puerta' | 'nada' | 'bucle'.
// `recogido` dice qué se ha recogido en este paso ({ tipo, i } o null); `abre` es la puerta que se cruza.
export function aplicar(nv, modo, s, b) {
  if (b === 'bucle' || b === 'fin' || esRepetir(b)) return { s, evento: 'bucle', recogido: null };
  if (b === 'recoger') {
    const n = { ...s };
    const recogido = recogerAqui(nv, n);
    return recogido ? { s: n, evento: 'recoger', recogido } : { s, evento: 'nada', recogido: null };
  }
  const n = paso(s, b);
  if (!mueve(b)) return { s: n, evento: 'girar', recogido: null };
  if (!libre(nv, n.x, n.y)) return { s, evento: 'choque', intento: n, recogido: null };
  const p = indicePuerta(nv, n.x, n.y);
  if (p >= 0 && !(s.k & (1 << p))) return { s, evento: 'puerta', intento: n, recogido: null };
  const recogido = modo === 'peque' ? recogerAqui(nv, n) : null;
  return { s: n, evento: 'mover', recogido, abre: p };
}

const FALLOS = ['choque', 'puerta', 'nada'];

// Ejecuta un programa (con bucles) sin animar.
// resultado: 'meta' | 'choque' | 'puerta' | 'nada' | 'faltan' (en la meta sin todo) | 'corto'.
export function simular(nv, modo, programa) {
  let s = estadoInicial(nv);
  let usados = 0;
  for (const p of desplegar(programa)) {
    const r = aplicar(nv, modo, s, p.b);
    if (FALLOS.includes(r.evento)) return { s, resultado: r.evento, falloIdx: p.idx };
    if (r.evento !== 'bucle') usados++;
    s = r.s;
    if (llego(nv, s)) return { s, resultado: 'meta', usados };
  }
  return { s, resultado: enMeta(nv, s.x, s.y) ? 'faltan' : 'corto' };
}

// Programa más corto SIN bucles desde un estado hasta la meta con todo recogido, o null.
export function resolver(nv, modo, desde = estadoInicial(nv)) {
  const bloques = bloquesDe(nv, modo).filter(b => b !== 'repetir');
  const clave = s => (modo === 'mayor' ? `${s.x},${s.y},${s.dir},${s.m},${s.k}` : `${s.x},${s.y},${s.m},${s.k}`);
  const previo = new Map([[clave(desde), null]]);
  const cola = [desde];
  for (let c = 0; c < cola.length; c++) {
    const s = cola[c];
    if (llego(nv, s)) {
      const prog = [];
      for (let p = previo.get(clave(s)); p; p = previo.get(clave(p.de))) prog.unshift(p.b);
      return prog;
    }
    for (const b of bloques) {
      const r = aplicar(nv, modo, s, b);
      if (FALLOS.includes(r.evento)) continue;
      const k = clave(r.s);
      if (!previo.has(k)) {
        previo.set(k, { de: s, b });
        cola.push(r.s);
      }
    }
  }
  return null;
}
