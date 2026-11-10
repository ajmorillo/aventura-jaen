// Los dos jugadores. El avatar y el nombre se personalizan en el modo padres y se guardan por perfil.
import { AVATAR_BASE } from './avatar.js';
import { datosPerfil } from './progreso.js';

export const PERFILES = [
  {
    id: 'peque',
    edad: 5,
    modo: 'peque',
    color: '#3d8bd9',
    avatar: { piel: '#f2c29b', peinado: 'flequillo', pelo: '#a0682f', camiseta: '#3d8bd9', estampado: 'dino', mella: true },
  },
  {
    id: 'mayor',
    edad: 8,
    modo: 'mayor',
    color: '#e4572e',
    avatar: { piel: '#eab38a', peinado: 'corto', pelo: '#3b2615', camiseta: '#e4572e', estampado: 'numero', numero: 8 },
  },
];

// Perfil con lo guardado por los padres encima de los valores por defecto.
export function perfilCompleto(p) {
  const guardado = datosPerfil(p.id);
  return { ...p, nombre: guardado.nombre || '', avatar: { ...AVATAR_BASE, ...p.avatar, ...guardado.avatar } };
}
