---
title: "Configuración"
description: "Valores globales, todas las opciones de configuración, propiedades CSS personalizadas y selectores ::part() para tematización."
date: 2026-01-01
weight: 30
---

Establece valores predeterminados para todas las invocaciones de shortcodes en tu `hugo.toml`. Los parámetros por shortcode sobrescriben la configuración del sitio; la configuración del sitio sobrescribe los valores integrados.

## Valores Predeterminados del Reproductor

```
[params]
  [params.podcastPlayer]
    source = "azuracast"
    persistent = false
    preload = "metadata"
    type = "audio/mpeg"
    autoplay = "false"
    rate = "true"
```

Las claves de configuración del sitio coinciden con los nombres de los parámetros del shortcode (excepto `src`, `title`, `poster`, `description` y `chapters`, que siempre son por episodio).

## Todas las Opciones de Configuración

| Clave | Tipo | Por defecto | Descripción |
|-----|------|---------|-------------|
| `source` | string | `"local"` | Adaptador de fuente: `"local"`, `"azuracast"`, `"ivoox"` |
| `persistent` | bool | `true` | Persistencia de navegación entre cargas de página |
| `preload` | string | `"metadata"` | Sugerencia de precarga: `"metadata"`, `"auto"`, `"none"` |
| `type` | string | `"audio/mpeg"` | Tipo MIME para el elemento de audio |
| `autoplay` | bool | `false` | Reproducción automática (bloqueada por la mayoría de navegadores) |
| `rate` | bool | `true` | Mostrar control de velocidad (ciclos 0.5× a 2×) |

## Propiedades CSS Personalizadas

El reproductor se renderiza en un Shadow DOM con un tema oscuro predeterminado. La hoja de estilo externa proporciona un tema claro. Ambos son personalizables mediante propiedades CSS en `<podcast-player>` y `<podcast-footer>`.

| Propiedad | Claro por defecto | Oscuro por defecto | Descripción |
|----------|--------------|-------------|-------------|
| `--podcast-player-primary` | `#4f46e5` | `#6366f1` | Color de acento para botones, estados activos |
| `--podcast-player-bg` | `#ffffff` | `#1e1e2e` | Color de fondo |
| `--podcast-player-surface` | `#f3f4f6` | `#2a2a3e` | Color de superficie para botones, contenedores |
| `--podcast-player-text` | `#111827` | `#e0e0e0` | Color de texto principal |
| `--podcast-player-text-muted` | `#6b7280` | `#888` | Texto atenuado (tiempos, descripción) |
| `--podcast-player-accent` | `#7c3aed` | `#a78bfa` | Color de acento hover/alternativo |
| `--podcast-player-radius` | `12px` | `12px` | Radio de borde exterior |
| `--podcast-player-border` | `#e5e7eb` | `rgba(255,255,255,0.06)` | Borde alrededor del reproductor |
| `--podcast-player-progress-height` | `5px` | `5px` | Altura de la pista de progreso |
| `--podcast-player-thumb-size` | `14px` | `14px` | Diámetro del pulgar de la barra |
| `--podcast-player-focus-ring` | `rgba(79,70,229,0.35)` | `rgba(167,139,250,0.35)` | Sombra de anillo `:focus-visible` |

### Modo Claro / Oscuro

El tema claro es el predeterminado. Para modo oscuro, envuelve el reproductor en un contenedor con `[data-theme="dark"]` o `.theme-dark`:

```
body.dark-mode podcast-player {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}
```

{{< admonition type="tip" >}}
Los selectores oscuros integrados (`[data-theme="dark"]`, `.theme-dark`, `html[data-theme="dark"]`) se aplican automáticamente. Raramente necesitas sobrescrituras personalizadas a menos que tu tema use nombres de atributos diferentes.
{{< /admonition >}}

## Selectores ::part()

Usa `::part()` para estilizar elementos individuales del Shadow DOM desde fuera:

```
/* Botón de reproducir */
podcast-player::part(play-btn) { background: hotpink; }

/* Barra de progreso */
podcast-player::part(progress) { height: 8px; }

/* Todos los botones al pasar el cursor */
podcast-player::part(play-btn):hover,
podcast-player::part(skip-back-btn):hover {
  transform: scale(1.1);
}
```

### Partes Disponibles: Reproductor en Línea

| Parte | Descripción |
|------|-------------|
| `player` | Contenedor exterior |
| `header` | Fila de cabecera superior |
| `poster` | Imagen de portada |
| `title` | Título del episodio |
| `controls` | Barra de controles |
| `play-btn` | Botón reproducir/pausa |
| `skip-back-btn` | Botón retroceder |
| `skip-fwd-btn` | Botón adelantar |
| `progress-wrap` | Contenedor de la barra de progreso |
| `progress` | Barra de progreso |
| `time-current` | Tiempo actual |
| `time-sep` | Separador de tiempo (`/`) |
| `time-duration` | Duración |
| `extras` | Fila de volumen/silencio/velocidad |
| `vol-wrap` | Contenedor de volumen |
| `mute-btn` | Botón de silencio |
| `volume` | Deslizador de volumen |
| `rate-btn` | Botón de velocidad |
| `chapters` | Contenedor de lista de capítulos |
| `error` | Mensaje de error |

### Partes Disponibles: Reproductor de Pie

| Parte | Descripción |
|------|-------------|
| `footer` | Contenedor exterior |
| `poster` | Imagen de portada |
| `title` | Título de la pista |
| `play-btn` | Botón reproducir/pausa |
| `skip-back-btn` | Botón retroceder |
| `skip-fwd-btn` | Botón adelantar |
| `progress` | Barra de progreso |
| `time-current` | Tiempo actual |
| `time-duration` | Duración |
| `mute-btn` | Botón de silencio |
| `volume` | Deslizador de volumen |
| `rate-btn` | Botón de velocidad |
| `close-btn` | Botón cerrar |

## Comportamiento Responsivo

Por debajo de **480px** el reproductor se adapta:

- La barra de progreso ocupa su propia fila a ancho completo
- El botón de reproducir crece a 52×52px; otros botones a 44×44px
- Los pulgares de los deslizadores se agrandan para facilitar el toque
- Los capítulos cambian a desplazamiento horizontal
