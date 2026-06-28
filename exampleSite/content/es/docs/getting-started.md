---
title: "Primeros Pasos"
description: "Crea tu primer episodio con el shortcode podcast-player. Configuración mínima con un ejemplo funcional."
date: 2026-01-01
weight: 60
---

Después de instalar Wavecast, añade un reproductor de podcast a cualquier página con un solo shortcode.

## Configuración Mínima

1. **Añade el reproductor de pie** a tu plantilla base:

   En `layouts/_default/baseof.html`, añade justo antes de `</body>`:

    ```
    <podcast-footer id="podcast-footer" data-turbolinks-permanent data-turbo-permanent hx-preserve></podcast-footer>
    ```

2. **Crea un episodio** en `content/es/episodes/mi-primer-episodio.md`:

    ```
    ---
    title: "Episodio 1: Hola Mundo"
    date: 2026-01-15
    podcast:
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    ---

    ¡Bienvenido a mi primer episodio!

    {{</* podcast-player
      src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      title="Episodio 1: Hola Mundo"
      poster="https://picsum.photos/seed/podcast/400/400"
      description="Notas del episodio con soporte para **Markdown**."
      chapters="00:00:00-Intro,00:05:30-Noticias,00:15:00-Entrevista"
    */>}}
    ```

## Parámetros del Shortcode

| Parámetro | Requerido | Por defecto | Descripción |
|-----------|----------|---------|-------------|
| `src` | **sí** |: | URL de audio o ruta de archivo local |
| `title` | no | `""` | Título del episodio en el reproductor |
| `url` | no | `""` | Destino del enlace para la etiqueta de fuente del pie. Establece una URL (http/https o relativa al sitio) para hacer la etiqueta clickeable, o `"none"` para ocultar el enlace. Omite para derivar automáticamente desde la fuente de audio. |
| `poster` | no | `""` | URL de la imagen de portada |
| `description` | no | `""` | Descripción en Markdown |
| `type` | no | `"audio/mpeg"` | Tipo MIME |
| `source` | no | `"local"` | Adaptador de fuente |
| `persistent` | no | `"true"` | Desactivar para evitar persistencia |
| `preload` | no | `"metadata"` | Valor de precarga HTML5 |
| `chapters` | no | `""` | Pares `HH:MM:SS-Etiqueta` separados por comas |
| `autoplay` | no | `"false"` | Reproducción automática al cargar |
| `rate` | no | `"true"` | Mostrar control de velocidad |

## Con un Archivo de Audio Local

Coloca tu archivo de audio en el directorio `assets/` de tu proyecto Hugo:

```
{{</* podcast-player
  src="episodes/mi-episodio.mp3"
  title="Episodio 42: Hola Mundo"
*/>}}
```

El shortcode resuelve archivos locales mediante `resources.GetMatch`: primero busca recursos del ámbito de la página, luego el directorio global `assets/`. Las URLs remotas se pasan directamente.

## Verificar que Funciona

Después de ejecutar `hugo server`, deberías ver:

1. ✅ Un reproductor de audio estilizado con botón de reproducir/pausa, barra de progreso y controles de volumen
2. ✅ Capítulos renderizados como chips interactivos (si los proporcionaste)
3. ✅ Imagen de portada junto a los controles (si la proporcionaste)
4. ✅ Texto de descripción debajo de los controles (si lo proporcionaste)

{{< admonition type="warning" >}}
**¿El audio no se reproduce?** Revisa la consola del navegador por errores CORS. Para desarrollo local, usa el archivo demo en `assets/demo/demo-audio.wav` o un archivo de audio del mismo origen. Algunos bloqueadores de anuncios pueden bloquear scripts de módulo.
{{< /admonition >}}

## Próximos Pasos

- [Configurar valores globales]({{< ref "docs/configuration" >}}) en tu `hugo.toml`
- [Configurar el reproductor de pie]({{< ref "docs/homepage-setup" >}}) para persistencia entre páginas
- [Añadir RSS de podcast]({{< ref "docs/front-matter#campos-rss-del-podcast" >}}) para envío a Apple Podcasts y Spotify
- [Explorar funciones avanzadas]({{< ref "docs/advanced" >}}) como la integración con AzuraCast
