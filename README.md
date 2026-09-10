# 🎵 React Tunes

Reproductor de música estilo streaming premium para **iPhone**, construido con React + TypeScript + Vite + Tailwind CSS. Sube tus canciones, escúchalas **sin conexión**, sigue las **letras sincronizadas estilo Karaoke** y déjalo instalado en tu pantalla de inicio como una app nativa (PWA).

![Dark theme](/public/icon-512.png)

---

## ✨ Características

### 🎧 Reproducción
- **Reproductor completo**: play / pausa, siguiente / anterior, barra de progreso con búsqueda, control de volumen (mezclador de reproducción).
- **Modo aleatorio (shuffle)** y **repetición** (una canción / todas).
- **Mini reproductor flotante** y **reproductor a pantalla completa** con portada y controles.
- **Controles del Centro de Control (iOS / Android)** vía Media Session API: portada, título, pista anterior / siguiente, play / pausa desde la pantalla de bloqueo.

### 📴 Reproducción sin conexión (offline)
- Los archivos de audio que subes se guardan de forma **persistente en IndexedDB** del navegador (`ReactTunesDB`), no como URLs temporales que desaparecen al recargar.
- Al recargar la app, las canciones se recuperan automáticamente desde IndexedDB.
- **PWA + Service Worker**: la interfaz queda cacheada para funcionar bajo la red y el despliegue incluye iconos, manifest y splash screen para instalarla en el home.

### 🎤 Letras de canciones
- **Búsqueda automática** de letras al reproducir una canción.
- **Letras sincronizadas** con resaltado de la línea activa en tiempo real (formato LRC vía LRCLib), con auto‑scroll.
- **Letras en texto plano** como respaldo (Lyrics.ovh).
- **Vista a pantalla completa**: pantalla dedicada con la letra completa y una **X** arriba a la derecha para salir.
- Panel compacto de letras dentro del reproductor; toca una línea para saltar a ese momento.

### 🎚️ Sonido y ecualización
- **Ecualizador** con Web Audio API (bajos, medios y agudos).
- **Crossfade** entre canciones.
- **Reproducción automática** de pistas siguientes.

### 📚 Organización y búsqueda
- **Biblioteca**: pestañas por género/categoría, favoritas, agregadas recientemente y estadísticas de reproducción (más escuchadas, artistas y top de canciones).
- **Búsqueda** de canciones con resultados web para descargar.
- **Playlists** personalizadas con portadas.
- **Favoritas** con un toque.
- Cambio de **idioma** Español / English.

### 📱 PWA / Instalación
- `manifest.json` con iconos (192, 512, apple‑touch, favicon 32) y splash screen.
- Service Worker con pre‑cacheo de los assets del build.
- Modo standalone, pantalla completa al estilo app nativa.
- Grabado de **borrado de datos** y control del almacenamiento.

---

## 🛠️ Tecnologías usadas

| Tecnología | Uso |
| --- | --- |
| **React 19** + **TypeScript 5** | Interfaz y lógica con tipado estricto. |
| **Vite 7** | Build, dev server y empaquetado. |
| **Tailwind CSS 4** (`@tailwindcss/vite`) | Estilos utilitarios y tema oscuro premium. |
| **IndexedDB** | Persistencia de archivos de audio para reproducción offline. |
| **Service Worker + Cache API** | PWA, carga instantánea y funcionamiento sin red. |
| **Web Audio API** | Ecualizador en tiempo real. |
| **Media Session API** | Controles del Centro de Control en móviles. |
| **Fetch + APIs externas** | Letras: [LRCLib](https://lrclib.net) y [Lyrics.ovh](https://lyricsovh.docs.apiary.io). |
| **Netlify / Apache** | Despliegue (`netlify.toml`, `_redirects`, `.htaccess`). |

---

## 📂 Estructura del proyecto

```
react-tunes-redesign-letras/
├── public/                 # Archivos estáticos (iconos, manifest, SW, redirects)
│   ├── manifest.json       # Configuración PWA
│   ├── sw.js               # Service Worker (pre-cache + estrategia offline)
│   └── *.png               # Iconos y splash screen
├── src/
│   ├── components/         # SongsTab, SearchTab, LibraryTab, PlaylistsTab,
│   │                       # SettingsTab, Player, AudioHandler, ErrorBoundary
│   ├── context/AppContext.tsx  # Estado global (player, canciones, ajustes, i18n)
│   ├── types/index.ts      # Tipos: Song, Playlist, PlayerState, AppSettings…
│   ├── utils/
│   │   ├── db.ts           # Índices de IndexedDB (audio offline)
│   │   └── cn.ts           # Utilidad de clases (clsx + tailwind-merge)
│   ├── App.tsx             # Navegación y layout general
│   └── main.tsx            # Punto de entrada (ErrorBoundary + App)
├── vite.config.ts          # Configuración de Vite
├── netlify.toml            # Configuración de Netlify (build + redirects)
├── index.html              # HTML principal con PWA y SW
└── package.json
```

---

## 🚀 Desarrollo local

Requisitos: **Node.js 20+** (el proyecto usa Vite 7).

```bash
# Instalar dependencias
npm install

# Entorno de desarrollo (hot reload)
npm run dev

# Build de producción → dist/
npm run build

# Vista previa local del build
npm run preview
```

Comprobación de tipos:

```bash
npx tsc --noEmit
```

---

## 🌐 Despliegue

### Opción 1 — Netlify (recomendado, cero comandos)
El repo ya incluye `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Redirects SPA**: `/* → /index.html`

Solo conecta el repositorio desde el panel de Netlify o arrastra la carpeta `dist/` en la zona de drop.

### Opción 2 — Cualquier hosting estático (sin comandos)
Sube el **contenido de la carpeta `dist/`** a la raíz del sitio. Todos los recursos son relativos y se incluyen `manifest.json`, `sw.js`, iconos y `.htaccess`/`_headers`/`_redirects` para que funcione al instante.

### Opción 3 — Apache / XAMPP
El `.htaccess` incluido sirve la app desde `dist/` con fallback SPA, caché de assets, compresión gzip y los MIME correctos para PWA. Funciona en la raíz o en cualquier subdirectorio.

> Notas:
> - El Service Worker requiere **HTTPS** (o `localhost`) para activarse.
> - No se necesita ningún servidor backend: toda la persistencia es local en el navegador.

---

## 🧰 Scripts de utilidad

- **`generate-icons.cjs`**: genera los iconos PNG de la PWA (`icon-192`, `icon-512`, `apple-icon-180`, `icon-32`, `splash`) sin dependencias externas.

---

## 📝 Licencia

Proyecto privado. Uso personal.

---

*Hecho con React, Vite y Tailwind CSS.*