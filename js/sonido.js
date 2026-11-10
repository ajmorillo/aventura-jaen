// Voz (speechSynthesis es-ES) y sonidos suaves generados con Web Audio.

const CLAVE_SILENCIO = 'aventura-jaen:silencio';
let silencio = false;
try { silencio = localStorage.getItem(CLAVE_SILENCIO) === '1'; } catch { /* sin almacenamiento */ }

let ctx = null;
let voz = null;
const hayVoz = 'speechSynthesis' in window;

function elegirVoz() {
  const voces = speechSynthesis.getVoices();
  const norm = v => v.lang.replace('_', '-');
  voz = voces.find(v => norm(v) === 'es-ES')
    || voces.find(v => norm(v).startsWith('es-ES'))
    || voces.find(v => norm(v).startsWith('es'))
    || null;
}
if (hayVoz) {
  elegirVoz();
  speechSynthesis.onvoiceschanged = elegirVoz;
}

// iOS solo permite audio tras un gesto del usuario: llamar dentro de un toque.
export function desbloquearAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  // Safari solo deja hablar más tarde (tras una espera o una carga) si ya se habló dentro de un toque.
  if (hayVoz && !vozDesbloqueada) {
    vozDesbloqueada = true;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}
let vozDesbloqueada = false;

export function hablar(texto) {
  if (silencio || !hayVoz || !texto) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-ES';
  if (voz) u.voice = voz;
  u.rate = 0.92;
  u.pitch = 1.1;
  speechSynthesis.speak(u);
}

export function callar() {
  if (hayVoz) speechSynthesis.cancel();
}

function tono(freq, t0, dur, tipo = 'sine', vol = 0.12) {
  const t = ctx.currentTime + t0;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
}

export function sonido(nombre) {
  if (silencio || !ctx) return;
  switch (nombre) {
    case 'clic': tono(660, 0, 0.08, 'triangle'); break;
    case 'quitar': tono(440, 0, 0.08, 'triangle'); tono(330, 0.06, 0.1, 'triangle'); break;
    case 'recoger': tono(880, 0, 0.08, 'sine', 0.1); tono(1320, 0.07, 0.14, 'sine', 0.09); break;
    case 'puerta': tono(300, 0, 0.12, 'triangle', 0.1); tono(450, 0.1, 0.12, 'triangle', 0.1); tono(600, 0.2, 0.2, 'triangle', 0.1); break;
    case 'vuelta': tono(990, 0, 0.06, 'sine', 0.06); break;
    case 'premio': [784, 988, 1175, 1568].forEach((f, i) => tono(f, i * 0.09, 0.35, 'sine', 0.09)); break;
    case 'pagina': { const o = tono(500, 0, 0.18, 'triangle', 0.05); o.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.18); break; }
    case 'giro': tono(480, 0, 0.07, 'triangle', 0.08); tono(720, 0.06, 0.09, 'triangle', 0.08); break;
    case 'paso': tono(520 + Math.random() * 60, 0, 0.1, 'sine', 0.1); break;
    case 'no': tono(200, 0, 0.15, 'square', 0.05); break;
    case 'choque': {
      const o = tono(260, 0, 0.35, 'sawtooth', 0.06);
      o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);
      break;
    }
    case 'casi': tono(392, 0, 0.18); tono(330, 0.18, 0.28); break;
    case 'exito': [523, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.11, 0.3, 'triangle', 0.12)); break;
    case 'estrella': tono(1175, 0, 0.18, 'sine', 0.1); tono(1568, 0.08, 0.25, 'sine', 0.08); break;
  }
}

export function estaSilenciado() { return silencio; }

export function alternarSilencio() {
  silencio = !silencio;
  try { localStorage.setItem(CLAVE_SILENCIO, silencio ? '1' : '0'); } catch { /* nada */ }
  if (silencio) callar();
  return silencio;
}
