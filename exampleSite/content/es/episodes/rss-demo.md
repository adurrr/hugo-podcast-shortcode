---
title: "Introducción a los Feeds RSS de Wavecast"
program: "Wavecast Demo"
episode: "S1E1"
date: 2026-06-01
tags: [Wavecast, Hugo, Podcasting, RSS]
podcast:
  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  poster: "https://picsum.photos/seed/wavecast-rss/400/400"
  chapters: "00:00:00-Intro,00:00:30-How It Works,00:01:20-Episode Front Matter,00:02:10-Channel Config,00:02:45-Validating the Feed"
  type: "audio/mpeg"
  duration: "00:03:45"
  season: 1
  episode: 1
  explicit: false
  author: "Wavecast Radio"
  guid: "wavecast-demo-s1e1"
  episodeType: "full"
  subtitle: "Aprende cómo Wavecast genera feeds RSS de podcasts compatibles con iTunes a partir de contenido Hugo."
show_notes:
  - "[W3C Feed Validator](https://validator.w3.org/feed/): valida tu feed RSS antes de enviarlo a directorios"
  - "[Apple Podcasts Connect](https://podcastsconnect.apple.com/): envía tu podcast a Apple Podcasts"
  - "[Hugo RSS Templates](https://gohugo.io/templates/rss/): documentación oficial de plantillas RSS de Hugo"
attribution:
  text: "Wavecast RSS Demo"
  url: "https://github.com/adurrr/wavecast"
---

Este episodio demuestra cómo Wavecast genera automáticamente feeds RSS de podcasts
compatibles con iTunes cuando configuras `[params.podcast]` en tu archivo de
configuración del sitio Hugo.

## Cómo Funciona

Wavecast incluye `layouts/_default/rss.xml`, una plantilla única que maneja tanto
blogs estándar como feeds de podcasts. En el momento de la construcción, la
plantilla verifica tu configuración `[params.podcast]`:

<div class="info-card" style="margin:1.5rem 0">

**Reglas de detección:**

| Condición                                                   | Comportamiento                                                                 |
|-------------------------------------------------------------|----------------------------------------------------------------------------------|
| `[params.podcast]` tiene `author`, `image` o `description` | Renderiza un feed RSS **completo de podcast iTunes** (con namespace `itunes:`, categorías, propietario, artwork) |
| `[params.podcast]` falta o está vacío                      | Renderiza un feed RSS **plain 2.0** adecuado para blogs                          |
| La página tiene `podcast.src` en su front matter            | Incluido como `<item>` con un elemento `<enclosure>`                             |
| La página no tiene `podcast.src`                            | Omitido completamente (no es un episodio de podcast)                            |

</div>

No hay ningún interruptor o bandera que configurar. Si tu configuración de sitio
define metadatos de podcast, obtienes un feed de podcast. Si no los define,
obtienes un feed de blog. Ambos funcionan desde la misma plantilla única.

Los episodios con archivos de audio locales (ej. `src: "audio/episode.mp3"`) tienen
el tamaño del archivo `<enclosure>` auto-resuelto mediante los recursos de Hugo.
Las URLs remotas usan por defecto `length="0"`, que es RSS válido y aceptado por
todos los directorios de podcasts principales.

## Front Matter del Episodio

Todos los campos específicos de iTunes viven bajo la clave `podcast:` en el YAML
front matter de tu episodio:

```yaml
podcast:
  src: "https://example.com/audio/ep42.mp3"   # required
  type: "audio/mpeg"                           # MIME type
  duration: "00:45:00"                         # HH:MM:SS or seconds
  season: 2                                    # season number
  episode: 42                                  # episode number
  explicit: false                              # "true" or "false"
  author: "Guest Host"                         # overrides site-level
  guid: "unique-ep-42"                         # falls back to permalink
  episodeType: "full"                          # full|trailer|bonus
  subtitle: "A short episode teaser"           # max 255 chars
  summary: "Full episode description"          # max 4000 chars
```

Los campos estándar de Hugo (`title`, `date`, `tags`, `summary`) se extraen del
front matter regular automáticamente.

## Configuración del Canal

Los metadatos de podcast a nivel de sitio van en tu `hugo.toml`:

```toml
[params.podcast]
  author = "Your Name"
  image  = "/podcast-cover.jpg"   # min 1400x1400px recommended
  description = "A weekly show about open-source."
  explicit = false
  type     = "episodic"           # "episodic" or "serial"
  owner_name  = "Your Name"
  owner_email = "you@example.com"

  [[params.podcast.categories]]
    category = "Technology"
```

## Validando el Feed

Una vez que tu sitio esté en vivo, valida tu feed:

1. Visita [validator.w3.org/feed](https://validator.w3.org/feed/)
2. Ingresa la URL del feed de tu sitio (generalmente `/index.xml`)
3. Corrige cualquier advertencia antes de enviar a los directorios

El feed está listo para **Apple Podcasts**, **Spotify**, **Google Podcasts**,
y cualquier aplicación de podcasts compatible con RSS.

<div class="nav-buttons" style="margin-top:1.5rem">
  <a href="/wavecast/index.xml" class="nav-button nav-button-primary" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:middle"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/></svg>
    Ver Feed RSS
  </a>
  <a href="https://validator.w3.org/feed/" target="_blank" rel="noopener" class="nav-button">Validar Feed</a>
</div>
