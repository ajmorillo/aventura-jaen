# Aventura en Jaén

Juego educativo para iPad/iPhone: cada niño programa a su avatar con flechas para recorrer Jaén.
Web app sin dependencias (HTML + CSS + JavaScript), instalable en la pantalla de inicio y jugable sin conexión.
No tiene anuncios, enlaces externos, compras ni analíticas, y no envía datos a ningún sitio: el progreso se guarda solo en el dispositivo.

## Probarlo en local

```bash
python3 -m http.server 8765
```

Abrir `http://localhost:8765`. Desde el iPad, en la misma wifi: `http://<IP-del-Mac>:8765`.

En local el modo sin conexión está desactivado (para no ver copias viejas mientras se desarrolla).
Para probarlo: `http://localhost:8765/?sinconexion`.

## Estructura

| Ruta | Qué hay |
|---|---|
| `index.html`, `css/style.css` | Pantallas y estilos |
| `js/main.js` | Flujo del juego: perfiles, mapa, niveles, ejecución, pistas, estrellas, armario, álbum |
| `js/motor.js` | Reglas sin dibujo: movimientos, llaves, aceitunas, bucles, simulador y solucionador |
| `js/art.js`, `js/avatar.js`, `js/album.js` | Todo el arte en SVG |
| `js/padres.js` | Modo padres (puerta con multiplicación y editor de avatar) |
| `js/mundos.js`, `js/premios.js`, `js/perfiles.js` | Datos: mundos, premios del armario y los dos jugadores |
| `niveles/mundoN-{peque,mayor}.json` | Niveles (generados, ver abajo) |
| `sw.js`, `manifest.webmanifest`, `iconos/` | Instalación y modo sin conexión |
| `tools/` | Herramientas (Node 20 o superior) |

## Herramientas

```bash
npm run niveles   # regenera los niveles desde tools/generar-niveles.mjs y los valida
npm run validar   # solo valida que todos los niveles tienen solución
npm run iconos    # regenera los iconos (necesita macOS: usa qlmanage y sips)
npm run publicar  # valida y prepara sw.js; ejecutar SIEMPRE antes de subir una versión
```

Para cambiar niveles, textos o la voz de un nivel: editar las especificaciones en `tools/generar-niveles.mjs`
y ejecutar `npm run niveles`. Los niveles son siempre los mismos (semillas fijas).
Las entradas `{ manual: {...} }` son niveles hechos a mano y las que tienen `programa` se construyen a partir de una solución con bucles.

## Publicar

El juego son archivos estáticos: sirve cualquier alojamiento gratuito con **https** (sin https no funciona el modo sin conexión).

1. `npm run publicar`
2. Subir la carpeta (sin `tools/`, `.claude/` ni `package.json`, aunque no molestan) a GitHub Pages, Netlify o Cloudflare Pages.
3. En el iPad: abrir la dirección en **Safari** → botón Compartir → **Añadir a pantalla de inicio**.
4. Abrir el juego una vez con conexión. A partir de ahí funciona sin internet.

Cada vez que se publique una versión nueva (con `npm run publicar` antes), el iPad la descarga sola la próxima vez que abra el juego con conexión.

### Ojo con el progreso

- El progreso del juego instalado en la pantalla de inicio es **distinto** del de Safari: conviene jugar siempre desde el icono.
- Safari puede borrar los datos de webs que no se visitan en semanas; las apps añadidas a la pantalla de inicio no tienen ese problema.
- Borrar el icono de la pantalla de inicio borra el progreso y los avatares.
