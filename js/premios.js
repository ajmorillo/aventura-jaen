// Premios del armario: se desbloquean al reunir estrellas (total del perfil, todos los mundos).
// Cada premio cambia una pieza del avatar.

export const PREMIOS = [
  { id: 'gorra', estrellas: 3, clave: 'sombrero', valor: 'gorra', nombre: 'una gorra' },
  { id: 'capa', estrellas: 8, clave: 'capa', valor: 'roja', nombre: 'una capa de superhéroe' },
  { id: 'lagartija', estrellas: 12, clave: 'mascota', valor: 'lagartija', nombre: 'una lagartija mascota' },
  { id: 'pastor', estrellas: 18, clave: 'sombrero', valor: 'pastor', nombre: 'un sombrero de pastor' },
  { id: 'sol', estrellas: 24, clave: 'gafas', valor: 'sol', nombre: 'unas gafas de sol' },
  { id: 'pirata', estrellas: 32, clave: 'sombrero', valor: 'pirata', nombre: 'un sombrero de pirata' },
  { id: 'paloma', estrellas: 42, clave: 'mascota', valor: 'paloma', nombre: 'una paloma mascota' },
  { id: 'casco', estrellas: 55, clave: 'sombrero', valor: 'casco', nombre: 'un casco de caballero' },
  { id: 'dorada', estrellas: 70, clave: 'capa', valor: 'dorada', nombre: 'una capa dorada' },
  { id: 'corona', estrellas: 90, clave: 'sombrero', valor: 'corona', nombre: 'una corona' },
];

// Qué hay que poner para quitarse una pieza.
export const SIN = { sombrero: 'ninguno', capa: false, mascota: false, gafas: 'ninguna' };

export const desbloqueados = total => PREMIOS.filter(p => total >= p.estrellas);

// Premios que se acaban de conseguir al pasar de `antes` a `despues` estrellas.
export const nuevos = (antes, despues) => PREMIOS.filter(p => antes < p.estrellas && despues >= p.estrellas);
