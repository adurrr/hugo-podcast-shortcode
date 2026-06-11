---
title: "Configuration"
description: "Global defaults, all config options, CSS custom properties, and ::part() selectors for theming."
date: 2026-01-01
weight: 30
---

Set defaults for all shortcode invocations in your `hugo.toml`. Per-shortcode params override site config; site config overrides built-in defaults.

## Global Player Defaults

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

Supported site config keys match the shortcode parameter names (except `src`, `title`, `poster`, `description`, and `chapters`, which are always per-episode).

## All Config Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `source` | string | `"local"` | Default source adapter: `"local"`, `"azuracast"`, `"ivoox"` |
| `persistent` | bool | `true` | Navigation persistence across page loads |
| `preload` | string | `"metadata"` | Browser preload hint: `"metadata"`, `"auto"`, `"none"` |
| `type` | string | `"audio/mpeg"` | MIME type for the audio element |
| `autoplay` | bool | `false` | Auto-play on page load (blocked by most browsers) |
| `rate` | bool | `true` | Show playback rate control (cycles 0.5× to 2×) |

## CSS Custom Properties

The player renders in a Shadow DOM with a default dark theme. The external stylesheet provides a light theme. Both are customizable via CSS custom properties on `<podcast-player>` and `<podcast-footer>`.

| Property | Light default | Dark default | Description |
|----------|--------------|-------------|-------------|
| `--podcast-player-primary` | `#4f46e5` | `#6366f1` | Accent colour for buttons, active states |
| `--podcast-player-bg` | `#ffffff` | `#1e1e2e` | Background colour |
| `--podcast-player-surface` | `#f3f4f6` | `#2a2a3e` | Surface colour for buttons, containers |
| `--podcast-player-text` | `#111827` | `#e0e0e0` | Primary text colour |
| `--podcast-player-text-muted` | `#6b7280` | `#888` | Muted text (times, description) |
| `--podcast-player-accent` | `#7c3aed` | `#a78bfa` | Hover/alt accent colour |
| `--podcast-player-radius` | `12px` | `12px` | Outer border radius |
| `--podcast-player-border` | `#e5e7eb` | `rgba(255,255,255,0.06)` | Border around the player |
| `--podcast-player-progress-height` | `5px` | `5px` | Progress bar track height |
| `--podcast-player-thumb-size` | `14px` | `14px` | Progress bar thumb diameter |
| `--podcast-player-focus-ring` | `rgba(79,70,229,0.35)` | `rgba(167,139,250,0.35)` | `:focus-visible` ring shadow |

### Light / Dark Mode

The light theme is the default. For dark mode, wrap the player in a container with `[data-theme="dark"]` or `.theme-dark`:

```
body.dark-mode podcast-player {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}
```

{{< admonition type="tip" >}}
The built-in dark selectors (`[data-theme="dark"]`, `.theme-dark`, `html[data-theme="dark"]`) are applied automatically. You rarely need custom overrides unless your theme uses different attribute names.
{{< /admonition >}}

## ::part() Selectors

Use `::part()` to style individual Shadow DOM elements from outside:

```
/* Play button */
podcast-player::part(play-btn) { background: hotpink; }

/* Progress bar */
podcast-player::part(progress) { height: 8px; }

/* All buttons on hover */
podcast-player::part(play-btn):hover,
podcast-player::part(skip-back-btn):hover {
  transform: scale(1.1);
}
```

### Available Parts: Inline Player

| Part | Description |
|------|-------------|
| `player` | Outer container |
| `header` | Top header row |
| `poster` | Cover image |
| `title` | Episode title |
| `controls` | Control bar |
| `play-btn` | Play/pause button |
| `skip-back-btn` | Skip backward button |
| `skip-fwd-btn` | Skip forward button |
| `progress-wrap` | Progress bar container |
| `progress` | Progress bar |
| `time-current` | Current time display |
| `time-sep` | Time separator (`/`) |
| `time-duration` | Duration display |
| `extras` | Volume/mute/rate extras row |
| `vol-wrap` | Volume container |
| `mute-btn` | Mute toggle button |
| `volume` | Volume slider |
| `rate-btn` | Playback rate button |
| `chapters` | Chapter list container |
| `error` | Error message |

### Available Parts: Footer Player

| Part | Description |
|------|-------------|
| `footer` | Outer container |
| `poster` | Cover image |
| `title` | Track title |
| `play-btn` | Play/pause button |
| `skip-back-btn` | Skip backward button |
| `skip-fwd-btn` | Skip forward button |
| `progress` | Progress bar |
| `time-current` | Current time display |
| `time-duration` | Duration display |
| `mute-btn` | Mute toggle button |
| `volume` | Volume slider |
| `rate-btn` | Playback rate button |
| `close-btn` | Close button |

## Responsive Behaviour

Below **480px** the player adapts:

- Progress bar drops to its own full-width row
- Play button grows to 52×52px; other buttons to 44×44px
- Slider thumbs enlarge for easier touch targeting
- Chapters switch to horizontal scroll
