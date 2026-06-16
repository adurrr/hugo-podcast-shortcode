---
title: "Configuración Avanzada"
description: "Adaptadores de fuente, API de eventos JavaScript, persistencia interna y atajos de teclado."
date: 2026-01-01
weight: 10
---

## Adaptadores de Fuente

El parámetro `source` controla cómo el reproductor resuelve su URL de audio. Cuando se omite, el tipo de fuente se auto-detecta desde la URL `src`.

### Local (predeterminado)

Reproduce la URL tal cual. Para enlaces directos de archivos de audio o recursos locales de Hugo.

```
{{</* podcast-player src="https://ejemplo.com/audio.mp3" */>}}
```

### AzuraCast

Obtiene la API nowplaying de AzuraCast para descubrir la URL del stream y enriquece el reproductor con metadatos de la canción actual.

Requiere el atributo `data-azuracast-api-url`:

```
{{</* podcast-player
  src=""
  source="azuracast"
  data-azuracast-api-url="https://radio.ejemplo.org/api/live/nowplaying/station-slug"
*/>}}
```

Si se proporciona `src` junto con `source="azuracast"`, se usa directamente sin consultar la API.

**Auto-detección**: se activa cuando la URL contiene `azuracast` o `.stream.`.

### iVoox

Obtiene la página del episodio de iVoox y extrae la URL de audio de:

1. Meta propiedad `og:audio`
2. Atributo `data-audio-url`
3. Elemento `<audio><source>`

Si falla la obtención, usa la URL `src` tal cual como respaldo.

```
{{</* podcast-player
  src="https://www.ivoox.com/titulo-episodio_12345_1.html"
  source="ivoox"
*/>}}
```

**Auto-detección**: se activa cuando la URL contiene `ivoox.com`.

## API de Eventos JavaScript

El componente emite eventos personalizados que burbujean a través del DOM. Escucha en cualquier elemento `<podcast-player>` o `<podcast-footer>`:

```
document.querySelector("podcast-player")
  .addEventListener("player-state", (e) => {
    console.log(e.detail);
    // { paused, src, currentTime, duration }
  });
```

### Referencia de Eventos

| Evento | Se emite en | Carga útil |
|-------|----------|----------------|
| `player-state` | play, pause, seek | `{ paused, src, currentTime, duration }` |
| `podcast-play` | play (compat) | `{ src, title, url }` |
| `podcast-pause` | pause | `{ src }` |
| `podcast-close` | botón cerrar del pie | `{ src }` |
| `podcast-seek` | seek en cualquier reproductor | `{ src, currentTime }` |

## Persistencia en sessionStorage

El estado se guarda por fuente en `sessionStorage` usando el formato de clave:

```
podcastPlayerState:<src>
```

Esto significa que múltiples reproductores en la misma página usan claves separadas y no interfieren entre sí.

### Comportamiento entre Páginas

- Navegar fuera de una página pausa el audio en línea (guarda posición)
- Volver a una página **no** reproduce automáticamente: el reproductor se restaura en estado pausado
- El reproductor de pie persiste en todas las páginas sin interrupción

## Atajos de Teclado

| Tecla | Acción |
|-----|--------|
| `Espacio` | Alternar reproducir/pausa |
| `Flecha Izquierda` | Retroceder 15 segundos |
| `Flecha Derecha` | Adelantar 15 segundos |
| `M` | Alternar silencio |

Funciona tanto en el reproductor en línea como en el de pie cuando el reproductor tiene el foco.

## API Media Session

Wavecast se integra con la [API Media Session](https://developer.mozilla.org/es/docs/Web/API/Media_Session_API), lo que significa:

- Los controles de reproducir/pausa aparecen en las pantallas de bloqueo y centros de notificación
- El título de la pista y la portada se muestran en los controles multimedia del sistema
- Las teclas multimedia de hardware (auriculares, teclado) controlan la reproducción

Esto es automático: no requiere configuración.

## Solución de Problemas

{{< admonition type="warning" title="El reproductor no aparece" >}}

- Revisa la consola del navegador por errores de JavaScript. El elemento personalizado `<podcast-player>` debe estar registrado.
- Verifica que el archivo JS se carga. En la pestaña Red, busca `podcast-player.js`. Con `hugo server` está en `/wavecast/js/podcast-player.js`.
- Algunos bloqueadores de anuncios pueden impedir la carga de scripts de módulo.

{{< /admonition >}}

{{< admonition type="warning" title="El audio no se reproduce" >}}

- Haz clic en el botón de reproducir: el reproductor no se reproduce automáticamente (los navegadores lo bloquean).
- Verifica errores CORS. La fuente de audio debe ser del mismo origen o tener cabeceras CORS permisivas.
- Asegúrate de que la URL `src` apunte a un archivo de audio reproducible.
- Verifica que el atributo `type` coincida con el formato (ej. `audio/mpeg` para MP3).

{{< /admonition >}}

{{< admonition type="warning" title="La imagen de portada no aparece" >}}

- La URL de la portada debe ser accesible. Verifica errores CORS o 404.
- El componente oculta la imagen `<img>` cuando no se establece el atributo `poster`.

{{< /admonition >}}

{{< admonition type="warning" title="Shortcode no encontrado (mensaje errorf)" >}}

- Se requiere Hugo v0.146.0+ para la convención de nombres `_shortcodes/`.
- Si usas como **tema**, verifica `theme = "wavecast"` en `hugo.toml`.
- Si usas como **módulo**, verifica la importación bajo `[module.imports]`.

{{< /admonition >}}

{{< admonition type="warning" title="El reproductor de pie no aparece" >}}

- El elemento `<podcast-footer>` debe estar en tu plantilla `baseof.html`. No aparece automáticamente.
- Añádelo justo antes de `</body>` (ver [Configuración de Inicio]({{< ref "docs/homepage-setup" >}})).

{{< /admonition >}}

{{< admonition type="warning" title="La persistencia no funciona" >}}

- `persistent` debe estar habilitado (lo está por defecto). Establecer `persistent="false"` lo desactiva.
- El estado está en `sessionStorage`: persiste solo dentro de la misma pestaña del navegador.
- El reproductor de pie persiste automáticamente; no necesita atributo `persistent` en `<podcast-footer>`.

{{< /admonition >}}
