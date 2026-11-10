// Los dos jugadores. El avatar y el nombre se personalizan en el modo padres y se guardan por perfil.
import { AVATAR_BASE } from './avatar.js';
import { datosPerfil } from './progreso.js';

export const PERFILES = [
  {
    id: 'peque',
    edad: 5,
    modo: 'peque',
    color: '#3d8bd9',
    avatar: { piel: '#f7d1b0', peinado: 'despeinado', pelo: '#7a4a22', reflejos: true, boca: 'abierta',
      camiseta: '#fbf7ee', estampado: 'banda', detalle: '#3d8bd9', cuello: '#1f2f5a', mochila: true, mochilaColor: '#2b2b2b' },
  },
  {
    id: 'mayor',
    edad: 8,
    modo: 'mayor',
    color: '#e4572e',
    avatar: { cara: 'ovalada', piel: '#f7d1b0', peinado: 'lado', pelo: '#5a3a1e', boca: 'picara',
      camiseta: '#fbf7ee', estampado: 'lateral', detalle: '#1f2f5a', cuello: '#1f2f5a', mochila: true, mochilaColor: '#1f2f5a' },
  },
];

// Perfil con lo guardado por los padres encima de los valores por defecto.
export function perfilCompleto(p) {
  const guardado = datosPerfil(p.id);
  return { ...p, nombre: guardado.nombre || '', avatar: { ...AVATAR_BASE, ...p.avatar, ...guardado.avatar } };
}
