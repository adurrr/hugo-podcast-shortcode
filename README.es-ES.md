

# Wavecast

[![Release](https://img.shields.io/github/v/release/adurrr/wavecast?style=flat&label=release&color=6366f1)](https://github.com/adurrr/wavecast/releases)
[![License](https://img.shields.io/github/license/adurrr/wavecast?style=flat&color=a78bfa)](https://github.com/adurrr/wavecast/blob/main/LICENSE)
[![Tests](https://img.shields.io/github/actions/workflow/status/adurrr/wavecast/ci.yml?style=flat&label=tests&color=4f46e5)](https://github.com/adurrr/wavecast/actions)
[![GitHub stars](https://img.shields.io/github/stars/adurrr/wavecast?style=flat&color=6366f1)](https://github.com/adurrr/wavecast/stargazers)

<p align="center">
  <img src="images/demo.gif" alt="Demo de Wavecast: el reproductor de audio persistente sobrevive a la navegación por páginas. Reproduce un episodio, navega por la documentación y el reproductor del pie de página te sigue. 5 programas, bloques de código con resaltado de sintaxis, modo claro/oscuro." width="800">
</p>

Un reproductor de audio persistente para podcasts/radio en Hugo: inserta `<podcast-player>` en cualquier página con un solo shortcode. Soporta **archivos locales**, transmisiones de radio **AzuraCast** y episodios de **iVoox**. Funciona como **módulo de Hugo** y como **tema de Hugo**.

**[Demo en vivo](https://adurrr.github.io/wavecast/)** | **[Documentación](https://adurrr.github.io/wavecast/docs/)**

---

## Cómo funciona

Wavecast proporciona dos Web Component personalizados que funcionan juntos:

| Componente | Ubicación | Qué hace |
|-----------|-------|-------------|
| `<podcast-player>` | En línea (en tu contenido) | Reproducir/pausar, saltar, buscar, volumen, capítulos, póster |
| `<podcast-footer>` | Pie de página fijo | Barra de reproductor persistente que te sigue en cada página |

Ambos componentes están sincronizados bidireccionalmente: pausar el pie de página pausa todos los reproductores en línea, y viceversa. Solo una fuente de audio se reproduce a la vez. La posición, el volumen, el silencio y la velocidad sobreviven a la navegación entre páginas.

## Características

- **Web Component** con Shadow DOM: independiente del framework, funciona en cualquier lugar
- **Reproductor en línea**: reproducir/pausar, salto de ±15s, barra de progreso con búsqueda, control deslizante de volumen, silencio, velocidad de reproducción (0.5x-2x)
- **Reproductor en pie de página fijo**: portada, nombre de la pista, salto, reproducir/pausar, barra de progreso, volumen, silencio, velocidad, cerrar
- **Sincronización bidireccional** entre reproductores en línea y de pie de página
- **Reproducción única**: reproducir una nueva fuente detiene automáticamente la anterior
- **Capítulos**: chips de navegación con etiquetas de marca de tiempo
- **Póster y descripción**: imagen de portada con tamaño responsivo, notas del programa renderizadas con Markdown
- **Adaptadores de fuente**: archivos locales, AzuraCast, iVoox (con detección automática)
- **Persistencia de navegación**: sobrevive a Turbolinks, Turbo, htmx y cargas de páginas nativas
- **Propiedades CSS personalizadas** para temas claro/oscuro, responsivo en móviles
- **Selectores `::part()`**: estiliza elementos individuales de Shadow DOM desde fuera
- **Atajos de teclado**: Espacio (reproducir/pausar), Izquierda/Derecha (saltar), M (silencio)
- **API Media Session**: se integra con los controles multimedia del sistema operativo
- **Feed RSS de podcast**: generación de feed compatible con iTunes a partir del contenido de Hugo
- **Accesible**: etiquetas ARIA, anillos `:focus-visible`, controles semánticos

---

## Inicio rápido

```markdown
{{< podcast-player
  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  title="Episode 42: Hello World"
  poster="https://picsum.photos/seed/podcast/400/400"
  description="Show notes with **Markdown**."
  chapters="00:00:00-Intro,00:05:30-News,00:15:00-Interview"
>}}
```

Coloca los archivos de audio en el directorio `assets/` de tu proyecto Hugo y usa `src="episodes/my-episode.mp3"` para la reproducción local.

Añade el pie de página fijo a `layouts/_default/baseof.html` justo antes de `</body>`:

```html
<podcast-footer id="podcast-footer"
  data-turbolinks-permanent data-turbo-permanent hx-preserve>
</podcast-footer>
```

Elige un framework de navegación y añade el script a tu `<head>`:

```html
<!--# if you want to use htmx -->
<script src="https://unpkg.com/htmx.org@1.9.12/dist/htmx.min.js"
        integrity="sha384-ujb1lZYygJmzgSwoxRggbCHcjc0rB2XoQrxeTUQyRjrOnlCoYta87iKBWq3EsdM2"
        crossorigin="anonymous" defer></script>
<!--# ...and the body tag: <body hx-boost="true"> -->
```

Sin un framework, el pie de página se destruye en cada navegación y el audio se detiene. Consulta [docs/homepage-setup](https://adurrr.github.io/wavecast/docs/homepage-setup/) para opciones de Turbo y Turbolinks.

---

## Instalación

**Requisitos previos**: Hugo v0.146.0+, Go 1.23+ (solo para instalación de módulo)

**Tema** (recomendado para la mayoría de los sitios):
```bash
git clone git@github.com:adurrr/wavecast.git themes/wavecast
```
```toml
# hugo.toml
theme = "wavecast"
```

**Módulo** (para sitios de múltiples módulos):
```bash
hugo mod get github.com/adurrr/wavecast
```
```toml
# hugo.toml
[module]
  [[module.imports]]
    path = "github.com/adurrr/wavecast"
```

**Ejecutar la demo**:
```bash
git clone git@github.com:adurrr/wavecast.git
cd wavecast/exampleSite
hugo server --port 1313
```

---

## Documentación

La documentación completa está integrada en el [sitio de demostración en vivo](https://adurrr.github.io/wavecast/docs/) y en el sitio de ejemplo (ejecútalo localmente para navegarlo). Cada página incluye ejemplos de código funcionales:

| Página | Cubre |
|------|--------|
| [Bienvenido](https://adurrr.github.io/wavecast/docs/) | Vista general, características, navegación |
| [Instalación](https://adurrr.github.io/wavecast/docs/installation/) | Tema vs módulo, fijación de versión |
| [Primeros pasos](https://adurrr.github.io/wavecast/docs/getting-started/) | Primer episodio, parámetros |
| [Configuración](https://adurrr.github.io/wavecast/docs/configuration/) | Valores predeterminados globales, propiedades CSS, selectores `::part()` |
| [Configuración de la página principal](https://adurrr.github.io/wavecast/docs/homepage-setup/) | Reproductor de pie de página, atributos de framework |
| [Shortcodes de utilidad](https://adurrr.github.io/wavecast/docs/shortcodes/) | Advertencias, botones, figuras, pestañas, galerías |
| [Front Matter](https://adurrr.github.io/wavecast/docs/front-matter/) | Campos de audio, campos de RSS de podcast |
| [Avanzado](https://adurrr.github.io/wavecast/docs/advanced/) | Adaptadores de fuente, eventos, persistencia, solución de problemas |

La documentación incluye una traducción al español en `/es/docs/`.

---

## Desarrollo

### Estructura del proyecto

```
assets/
  css/podcast-player.css    # External stylesheet (light theme, responsive, focus-visible)
  js/podcast-player.js      # Web Component + source adapters + persistence (~1790 lines)
  js/sources.js             # Re-exports for test imports
  demo/demo-audio.wav       # Demo audio file for the example site
layouts/
  _default/
    rss.xml                   # Podcast RSS template (auto-detects podcast config)
  _shortcodes/
    podcast-player.html       # Hugo shortcode template
tests/
  hugo/                     # Go integration tests (builds Hugo sites per case)
  js/                       # Vitest unit tests
  e2e/                      # Playwright E2E tests
exampleSite/                # Runnable demo site with built-in documentation
theme.toml                  # Hugo theme manifest
```

### Suites de pruebas

```bash
npm test                          # JS unit tests (Vitest + jsdom)
go test -v -timeout 120s ./tests/hugo/...  # Go integration tests
npm run test:e2e                  # E2E tests (Playwright + Hugo server)
npm test && go test ./tests/hugo/... && npm run test:e2e  # All tests
```

### Añadir un nuevo adaptador de fuente

1. Crea una nueva clase en `assets/js/podcast-player.js` que implemente `fetchStreamUrl()` y/o `fetchMetadata()`
2. Regístrala en el mapa `sourceAdapters`
3. Añade reglas de detección automática en `_detectSource()`
4. Escribe pruebas unitarias JS en `tests/js/` y pruebas E2E en `tests/e2e/`
5. Ejecuta las tres suites de pruebas

---

## Licencia

AGPLv3
