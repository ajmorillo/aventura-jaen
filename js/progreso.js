// Progreso guardado en localStorage, ya organizado por perfil (fase 2 añadirá los dos hermanos).

const CLAVE = 'aventura-jaen:v1';

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { return {}; }
}

function escribir(datos) {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* modo privado o lleno */ }
}

export function estrellasDe(perfil, idNivel) {
  return leer().perfiles?.[perfil]?.estrellas?.[idNivel] || 0;
}

export function guardarEstrellas(perfil, idNivel, n) {
  const d = leer();
  d.perfiles ??= {};
  d.perfiles[perfil] ??= {};
  const p = d.perfiles[perfil];
  p.estrellas ??= {};
  if (n > (p.estrellas[idNivel] || 0)) p.estrellas[idNivel] = n;
  escribir(d);
}

export function totalEstrellas(perfil) {
  const est = leer().perfiles?.[perfil]?.estrellas || {};
  return Object.values(est).reduce((a, b) => a + b, 0);
}

export function datosPerfil(perfil) {
  return leer().perfiles?.[perfil] || {};
}

export function guardarPerfil(perfil, { avatar, nombre }) {
  const d = leer();
  d.perfiles ??= {};
  d.perfiles[perfil] ??= {};
  d.perfiles[perfil].avatar = avatar;
  d.perfiles[perfil].nombre = nombre;
  escribir(d);
}

export function borrarProgreso(perfil) {
  const d = leer();
  if (d.perfiles?.[perfil]) d.perfiles[perfil].estrellas = {};
  escribir(d);
}

// El armario de los niños cambia piezas del avatar guardado (sin tocar el nombre).
export function guardarAvatar(perfil, avatar) {
  const d = leer();
  d.perfiles ??= {};
  d.perfiles[perfil] ??= {};
  d.perfiles[perfil].avatar = avatar;
  escribir(d);
}

export function premiosVistos(perfil) {
  return leer().perfiles?.[perfil]?.premiosVistos || 0;
}

export function marcarPremiosVistos(perfil, n) {
  const d = leer();
  d.perfiles ??= {};
  d.perfiles[perfil] ??= {};
  d.perfiles[perfil].premiosVistos = n;
  escribir(d);
}
