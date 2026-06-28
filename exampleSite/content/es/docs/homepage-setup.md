---
title: "Configuración de Inicio"
description: "Configura el reproductor de pie persistente, intégralo con Turbolinks/Turbo/htmx y añade soporte para alternancia de tema."
date: 2026-01-01
weight: 40
---

El reproductor de pie fijo (`<podcast-footer>`) debe estar presente en la plantilla base de tu sitio para la persistencia entre páginas.

## Añadir el Pie de Página

Añade este elemento justo antes de `</body>` en `layouts/_default/baseof.html`:

```
<podcast-footer id="podcast-footer"
  data-turbolinks-permanent
  data-turbo-permanent
  hx-preserve>
</podcast-footer>
```

{{< admonition type="important" >}}
El reproductor de pie es **opcional**. Si no añades `<podcast-footer>` a tu plantilla, solo se renderizan los componentes `<podcast-player>` en línea, y no aparece ninguna barra de pie. El reproductor funciona perfectamente sin pie.
{{< /admonition >}}

## Atributos de Framework

Los atributos `data-turbolinks-permanent`, `data-turbo-permanent` y `hx-preserve` aseguran que el pie sobreviva a la navegación al usar estos frameworks:

| Framework | Atributo | Qué hace |
|-----------|-----------|-------------|
| **Turbolinks** | `data-turbolinks-permanent` | Evita que Turbolinks reemplace el pie en la navegación |
| **Turbo** | `data-turbo-permanent` | Evita que Turbo Drive transforme/reemplace el pie |
| **htmx** | `hx-preserve` | Indica a htmx que preserve el elemento durante intercambios DOM |

Si no usas ninguno de estos frameworks, omite esos atributos: el pie persistirá mediante `sessionStorage` para cargas de página vanilla.

## Cómo Funciona la Persistencia

El reproductor sobrevive a las navegaciones usando múltiples estrategias:

1. **Ganchos de framework**: `data-turbolinks-permanent` / `data-turbo-permanent` / `hx-preserve` mantienen vivo el elemento DOM del pie durante navegaciones SPA
2. **Respaldo sessionStorage**: Estado guardado en `sessionStorage` en `beforeunload`, restaurado en la siguiente carga
3. **HTML vanilla**: Las cargas de página tradicionales restauran posición, volumen, silencio y velocidad desde `sessionStorage`

### Estado Guardado

| Campo | Descripción |
|-------|-------------|
| `currentTime` | Posición de reproducción en segundos |
| `paused` | Si el audio estaba pausado |
| `volume` | Nivel de volumen (0–1) |
| `muted` | Estado de silencio |
| `playbackRate` | Velocidad de reproducción |

### Reglas de Restauración de Posición

- **Coincidencia exacta de URL**: La posición solo se restaura cuando el `src` guardado coincide con el del elemento actual
- **Protección de antigüedad**: Posiciones de más de 1 hora se descartan
- **Estimación en pausa**: Si el audio estaba pausado, la posición se restaura tal cual
- **Estimación en reproducción**: Si estaba reproduciendo, el tiempo transcurrido desde el guardado se añade
- **Diferido a `loadedmetadata`**: La posición se establece solo después de que el navegador informe que la duración es conocida

## Integración con Alternancia de Tema

Si tu sitio tiene un toggle de tema claro/oscuro, asegúrate de que las propiedades CSS del pie respondan a tu cambio de tema. El elemento `<podcast-footer>` responde automáticamente a estos selectores:

```
/* Selectores integrados a los que el reproductor responde */
[data-theme="dark"] podcast-footer,
.theme-dark podcast-footer,
html[data-theme="dark"] podcast-footer {
  /* El reproductor aplica variables de tema oscuro */
}
```

Si tu tema usa nombres de atributos diferentes, añade tus propias reglas:

```
body.dark podcast-footer {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}

body.dark podcast-player {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}

## Títulos Desplazables

Cuando un episodio en reproducción tiene un título más largo que el área de
título del pie, el título se desplaza horizontalmente de forma automática para
mostrar todo el texto. Los títulos cortos se renderizan normalmente sin
animación. El comportamiento respeta `prefers-reduced-motion: reduce`, que
cae de vuelta a truncamiento con elipsis.

## Vincular el Pie

El pie persistente muestra una pequeña etiqueta de fuente (el dominio del servidor de audio) bajo el título del episodio. Por defecto esta etiqueta es un enlace al directorio padre del archivo de audio. El parámetro `url` del shortcode sobrescribe u oculta el enlace:

- Omitido, derivado automáticamente: el enlace apunta al directorio padre del archivo de audio (ej. `src="https://example.com/episodes/foo.mp3"` produce el enlace `https://example.com/episodes/`).
- Una URL: el enlace apunta a esa URL. Acepta `http://`, `https://` y rutas relativas al sitio que empiecen por `/`, `#` o `.`.
- `"none"`: el enlace se oculta por completo. Útil para transmisiones de radio en vivo sin página de episodio.

```go-html-template
{{</* podcast-player
  src="https://example.com/stream.mp3"
  title="Transmisión en vivo"
  url="https://example.com/shows/live"
*/>}}

{{</* podcast-player
  src="https://example.com/stream.mp3"
  title="Transmisión en vivo"
  url="none"
*/>}}
```

El mismo atributo puede establecerse en el `<podcast-footer url="...">` de nivel superior para sobrescribir lo que envíe el reproductor en línea. Las URL se sanitizan en tiempo de compilación y de ejecución; solo se aceptan los esquemas `http` y `https` al renderizar el enlace.

## Tamaño del Pie

El atributo `size` en `<podcast-footer>` controla el tamaño visual de la barra. Hay tres preajustes disponibles:

- `size="small"` (por defecto): la barra compacta actual. Portada de 36px, columna de info de 140px, botones de 32px. Omitir el atributo `size` es equivalente a `size="small"`.
- `size="medium"`: una barra más ancha con portada de 48px, columna de info de 240px, botones de 36px y fuentes ligeramente más grandes.
- `size="large"`: un banner de ancho completo con portada de 64px, columna de info de 400px, botones de 44-56px y las fuentes más grandes.

```html
<podcast-footer id="podcast-footer" size="medium" data-turbo-permanent></podcast-footer>
```

En pantallas de menos de 768px de ancho, los tres tamaños colapsan al mismo diseño compacto que `size="small"` produce en escritorio. Los valores desconocidos (`size="huge"`, etc.) vuelven al diseño `small` por defecto.

El atributo es puramente visual. La persistencia, la reproducción y la URL de la fuente de audio no se ven afectadas por `size`. Las variables de tema (`--podcast-player-bg`, `--podcast-player-text`, etc.) siguen funcionando como antes.

## Modo Radio en Vivo

El pie persistente puede alojar una estación de radio en vivo mediante
el elemento `<podcast-live>`, normalmente colocado como hermano de
`<podcast-footer>` en `baseof.html`. Cuando la transmisión está
activa, el pie muestra una insignia roja LIVE, los metadatos de la
pista actual y un tiempo de inicio a fin en formato 24H que se
actualiza según avanza la pista.

Para activarlo:

```
<podcast-live
  data-azuracast-api-url="https://radio.example.org/api/live/nowplaying/station-slug"
  station-name="Mi Radio">
</podcast-live>
```

Mientras se reproduce cualquier fuente que no sea en vivo, aparece un
botón "Escuchar en vivo" en el pie. Al hacer clic, se cambia a la
transmisión en vivo y se detiene la otra fuente. La insignia tiene una
animación de pulso por defecto; los usuarios con
`prefers-reduced-motion: reduce` ven un punto estático en su lugar.

Los metadatos se actualizan cada 15 segundos durante la reproducción y
cada 60 segundos en caso contrario, con retroceso exponencial ante
errores. La configuración sigue las mismas reglas
`data-turbolinks-permanent` / `hx-preserve` que el resto del pie, por
lo que persiste entre navegaciones con htmx / Turbo / Turbolinks.

## Ejemplo: Sección de Pie en baseof.html Completa

```
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}">
  <head>
    <meta charset="utf-8">
    <title>{{ block "title" . }}{{ .Site.Title }}{{ end }}</title>
    <!-- contenido del head... -->
  </head>
  <body>
    {{ block "main" . }}{{ end }}

    <!-- Reproductor de pie -->
    <podcast-footer id="podcast-footer"
      data-turbolinks-permanent
      data-turbo-permanent
      hx-preserve>
    </podcast-footer>
  </body>
</html>
```

## Próximos Pasos

- [Configurar front matter por episodio]({{< ref "docs/front-matter" >}}) para RSS de podcast
- [Establecer valores globales]({{< ref "docs/configuration" >}}) para todos los reproductores
- [Explorar adaptadores de fuente]({{< ref "docs/advanced" >}}) para AzuraCast e iVoox
