---
title: "Front Matter"
description: "Campos de front matter para episodios, metadatos RSS de podcast y configuración del reproductor por página."
date: 2026-01-01
weight: 60
---

Wavecast usa el front matter de Hugo para configurar episodios tanto para el reproductor como para el feed RSS del podcast.

## Front Matter del Reproductor de Audio

Añade una clave `podcast:` al front matter YAML de cualquier página para renderizar un reproductor:

```
---
title: "Episodio 42: El Grande"
date: 2026-06-01
podcast:
  src: "https://ejemplo.com/audio/ep42.mp3"
  poster: "/images/ep42-portada.jpg"
  chapters: "00:00:00-Intro,00:05:30-Noticias,00:15:00-Entrevista"
  description: "En este episodio hablamos de..."
---
```

### Campos del Reproductor

| Campo | Requerido | Descripción |
|-------|----------|-------------|
| `podcast.src` | **sí** | URL de audio o ruta de archivo local |
| `podcast.poster` | no | URL de imagen de portada |
| `podcast.chapters` | no | Pares `HH:MM:SS-Etiqueta` separados por comas |
| `podcast.description` | no | Notas en Markdown renderizadas debajo del reproductor |
| `podcast.source` | no | Adaptador de fuente: `"local"`, `"azuracast"`, `"ivoox"` |
| `podcast.persistent` | no | Establecer en `false` para desactivar persistencia |

También puedes pasarlos directamente como parámetros del shortcode:

```
{{</* podcast-player
  src="https://ejemplo.com/audio.mp3"
  title="Episodio 42"
  poster="/images/portada.jpg"
  chapters="00:00:00-Intro,00:05:30-Tema"
  description="Notas del episodio aquí."
*/>}}
```

## Campos RSS del Podcast

Para feeds RSS de podcast compatibles con iTunes, añade campos adicionales a `podcast:` en tu front matter:

```
---
title: "Episodio 42: El Grande"
date: 2026-06-01
podcast:
  src: "https://ejemplo.com/audio/ep42.mp3"
  type: "audio/mpeg"              # Tipo MIME (por defecto: audio/mpeg)
  duration: "00:45:00"            # HH:MM:SS o segundos
  season: 2                       # Número de temporada
  episode: 42                     # Número de episodio
  explicit: false                 # Sobrescribe el valor del sitio
  author: "Presentador Invitado"  # Sobrescribe el autor del sitio
  guid: "unico-ep-42"             # Por defecto usa el enlace permanente
  episodeType: "full"             # "full", "trailer", o "bonus"
  subtitle: "Un breve avance"     # ≤255 caracteres
  summary: "Resumen completo"     # Hasta 4000 caracteres
---
```

### Referencia de Campos RSS

| Campo | Tipo | Por defecto | Descripción |
|-------|------|---------|-------------|
| `podcast.src` | string |: | URL del archivo (requerido para inclusión en feed) |
| `podcast.type` | string | `"audio/mpeg"` | Tipo MIME |
| `podcast.duration` | string |: | Duración como `HH:MM:SS` o segundos |
| `podcast.season` | int |: | Número de temporada iTunes |
| `podcast.episode` | int |: | Número de episodio iTunes |
| `podcast.explicit` | bool |: | Sobrescribe indicador explícito del sitio |
| `podcast.author` | string |: | Sobrescribe autor del podcast del sitio |
| `podcast.guid` | string | Enlace permanente | Identificador único |
| `podcast.episodeType` | string | `"full"` | `"full"`, `"trailer"`, o `"bonus"` |
| `podcast.subtitle` | string |: | Avance breve (máx 255 caracteres) |
| `podcast.summary` | string |: | Descripción completa (máx 4000 caracteres) |

## Configuración Global del Podcast

Los metadatos globales del podcast van en `hugo.toml` bajo `[params.podcast]`:

```
[params.podcast]
  description = "Un programa semanal sobre código abierto e ingeniería de software."
  author = "Tu Nombre"
  summary  = "Descripción más larga (hasta 4000 caracteres). Se muestra en el popup ⓘ de apps de podcast."
  image    = "/podcast-portada.jpg"  # ≥1400×1400 px recomendado
  explicit = false                    # "true" o "false"
  type     = "episodic"               # "episodic" o "serial"
  owner_name  = "Tu Nombre"
  owner_email = "tu@ejemplo.com"
  language = "es-es"                  # Sobrescribe site.languageCode
  copyright = "© 2026 Tu Nombre"

  [[params.podcast.categories]]
    category = "Technology"
  [[params.podcast.categories]]
    category = "Education"
    subcategory = "Courses"
```

## Cómo Funciona la Detección RSS

| Escenario | Salida RSS |
|----------|-----------|
| Sin `[params.podcast]` en config | RSS 2.0 estándar (para blogs) |
| `[params.podcast]` con `author`, `image` o `description` | RSS de podcast iTunes completo con namespace `itunes:` |
| Episodio tiene `podcast.src` (archivo local) | Enclosure con `length` resuelto desde recursos Hugo |
| Episodio tiene `podcast.src` (URL remota) | Enclosure con `length="0"` |
| Episodio NO tiene `podcast.src` | Omitido del feed |

El feed está disponible en `/index.xml`. Valídalo en [validator.w3.org/feed](https://validator.w3.org/feed/).

## Próximos Pasos

- [Configurar página de inicio y pie]({{< ref "docs/homepage-setup" >}})
- [Aprender sobre adaptadores de fuente]({{< ref "docs/advanced" >}}) para AzuraCast e iVoox
- [Ver todos los shortcodes]({{< ref "docs/shortcodes" >}}) para contenido enriquecido
