# Hugo Podcast Shortcode

A Hugo module shortcode for a persistent podcast/radio audio player with Web Component, multi-source support, and navigation survival.

## Features

- **Web Component** (`<podcast-player>`) with Shadow DOM, framework-agnostic
- **Audio controls**: play/pause, skip +/-15s, seekable progress, volume, mute, playback rate
- **Chapters**: timestamp-labeled navigation chips
- **Poster & description**: cover image and Markdown-rendered description
- **Source adapters**: local files, AzuraCast radio stations, iVoox episodes
- **Navigation persistence**: survives Turbolinks, Turbo, htmx, and vanilla page loads via sessionStorage
- **Theming**: 12 CSS custom properties for light/dark themes, responsive on mobile (<480px)
- **Keyboard shortcuts**: Space (play/pause), Left/Right (skip), M (mute)
- **Media Session API**: integrates with OS media controls
- **Accessible**: ARIA labels, `:focus-visible` rings, semantic controls
- **100 tests**: Go integration (9), JS unit (80), Playwright E2E (11)

## Installation

### Prerequisites

- Hugo v0.146.0+
- Go 1.23+

### As a Hugo module

```bash
hugo mod init github.com/yourusername/your-site
hugo mod get github.com/adurrr/hugo-podcast-shortcode
```

Then in your `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/adurrr/hugo-podcast-shortcode"
```

### Local development

Clone the repo and use the included example site:

```bash
git clone git@github.com:adurrr/hugo-podcast-shortcode.git
cd hugo-podcast-shortcode/exampleSite
hugo server --port 1313
```

## Quick start

```markdown
{{< podcast-player
  src="https://example.com/audio/episode.mp3"
  title="Episode 42: Hello World"
  poster="https://example.com/cover.jpg"
  description="Show notes with **Markdown**."
  chapters="00:00:00-Intro,00:05:30-News,00:15:00-Interview"
  persistent="true"
>}}
```

## Site-wide configuration

Set defaults for all shortcode invocations in your `hugo.toml`. Per-shortcode params override site config; site config overrides built-in defaults.

```toml
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

## Shortcode parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `src` | yes | -- | Audio URL or local file path. Local resources resolved via `.Resources.GetMatch` / `resources.GetMatch`. |
| `title` | no | `""` | Episode title displayed in the player header. |
| `poster` | no | `""` | Cover image URL displayed next to the title. |
| `description` | no | `""` | Markdown description rendered into a `slot="description"` element. |
| `type` | no | `"audio/mpeg"` | MIME type. Auto-detected for local resources. |
| `source` | no | `"local"` | Source adapter hint: `"local"`, `"azuracast"`, or `"ivoox"`. Also auto-detected from URL. |
| `persistent` | no | `"true"` | Set to `"false"` to disable navigation persistence. |
| `preload` | no | `"metadata"` | `<audio>` preload attribute value. |
| `chapters` | no | `""` | Comma-separated `HH:MM:SS-Label` pairs for chapter navigation. |
| `autoplay` | no | `"false"` | Auto-play on page load. |
| `rate` | no | `"true"` | Show the playback rate control button. |

## Source adapters

The `source` parameter controls how the player resolves its audio URL. When omitted, the source type is auto-detected from the `src` URL.

### Local (default)

Plays the URL as-is. Use for direct audio file links or local Hugo resources.

```markdown
{{< podcast-player src="https://example.com/audio.mp3" >}}
```

### AzuraCast

Fetches the AzuraCast nowplaying API to discover the stream URL and enriches the player with current song metadata (title, artist).

Requires the `azuracast-api-url` attribute set on the element (passed through the shortcode as a data attribute).

```markdown
{{< podcast-player
  src=""
  source="azuracast"
  data-azuracast-api-url="https://radio.example.org/api/live/nowplaying/station-slug"
>}}
```

If `src` is provided alongside `source="azuracast"`, it's used directly without fetching the API.

Auto-detected when the URL contains `azuracast` or `.stream.`:

```markdown
{{< podcast-player src="https://stream.azuracast.com/radio.mp3" >}}
```

### iVoox

Fetches the iVoox episode page and extracts the audio URL from:

1. `og:audio` meta property
2. `data-audio-url` attribute
3. `<audio><source>` element

On fetch failure, falls back to the `src` URL as-is.

```markdown
{{< podcast-player
  src="https://www.ivoox.com/episode-title_12345_1.html"
  source="ivoox"
>}}
```

Auto-detected when the URL contains `ivoox.com`:

```markdown
{{< podcast-player src="https://www.ivoox.com/episode-title_12345_1.html" >}}
```

## Navigation persistence

The player can survive page navigations in single-page-app frameworks. Enabled by default (`persistent="true"`).

### Framework support

- **Turbolinks**: adds `data-turbolinks-permanent`
- **Turbo**: adds `data-turbo-permanent`
- **htmx**: adds `hx-preserve` + a stable generated ID
- **Vanilla JS**: saves state to `sessionStorage` on `beforeunload`, restores on next page load

### State saved

| Field | Description |
|-------|-------------|
| `currentTime` | Playback position in seconds |
| `paused` | Whether audio was paused |
| `volume` | Volume level (0-1) |
| `muted` | Mute state |
| `playbackRate` | Playback speed multiplier |

### Position restore rules

- **Exact URL match**: position only restored when the saved `src` matches the current element's `src`
- **Staleness guard**: positions older than 1 hour are discarded
- **Paused-state estimation**: if audio was paused, position is restored as-is (no forward estimation)
- **Playing-state estimation**: if audio was playing, elapsed time since save is added to the position
- **Deferred to `loadedmetadata`**: position is set only after the browser reports audio duration is known

### Per-instance isolation

Multiple players on the same page use separate `sessionStorage` keys (`podcastPlayerState:<src>`), so they don't interfere with each other.

## CSS theming

The player renders in a Shadow DOM with a default dark theme. The external stylesheet provides a light theme that activates automatically. Both are fully customizable via CSS custom properties.

### Custom properties

| Property | Default (light) | Default (dark) | Description |
|----------|-----------------|----------------|-------------|
| `--podcast-player-primary` | `#4f46e5` | `#6366f1` | Accent color for buttons, active states |
| `--podcast-player-bg` | `#ffffff` | `#1e1e2e` | Background color |
| `--podcast-player-surface` | `#f3f4f6` | `#2a2a3e` | Surface color for buttons, containers |
| `--podcast-player-text` | `#111827` | `#e0e0e0` | Primary text color |
| `--podcast-player-text-muted` | `#6b7280` | `#888` | Muted text color (time, description) |
| `--podcast-player-accent` | `#7c3aed` | `#a78bfa` | Hover/alt accent color |
| `--podcast-player-radius` | `12px` | `12px` | Outer border radius |
| `--podcast-player-border` | `#e5e7eb` | `rgba(255,255,255,0.06)` | Border color around the player |
| `--podcast-player-progress-height` | `5px` | `5px` | Progress bar track height |
| `--podcast-player-thumb-size` | `14px` | `14px` | Progress bar thumb diameter |
| `--podcast-player-focus-ring` | `0 0 0 3px rgba(79,70,229,0.35)` | `0 0 0 3px rgba(167,139,250,0.35)` | Focus-visible ring shadow |

### Light / dark mode

The light theme is the default. For dark mode, wrap the player (or the page) in a container with `[data-theme="dark"]`, `.theme-dark`, or set `data-theme="dark"` directly on the element:

```css
body.dark-mode podcast-player {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
  /* ... or use the built-in dark selectors */
}
```

### Part selectors

Use `::part()` to style individual elements from outside the Shadow DOM:

```css
/* Play button */
podcast-player::part(play-btn) {
  background: hotpink;
}

/* Progress bar */
podcast-player::part(progress) {
  height: 8px;
}

/* All buttons on hover */
podcast-player::part(play-btn):hover,
podcast-player::part(skip-back-btn):hover,
podcast-player::part(skip-fwd-btn):hover {
  transform: scale(1.1);
}
```

Available `part` attributes: `player`, `header`, `poster`, `title`, `controls`, `play-btn`, `skip-back-btn`, `skip-fwd-btn`, `progress-wrap`, `progress`, `time-current`, `time-sep`, `time-duration`, `extras`, `vol-wrap`, `mute-btn`, `volume`, `rate-btn`, `chapters`, `error`.

### Responsive behavior

Below 480px the player adapts:

- Progress bar drops to its own full-width row
- Play button grows to 52x52px; other buttons to 44x44px
- Slider thumbs enlarge for easier touch targeting
- Chapters switch to horizontal scroll

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause |
| `Left` | Skip back 15 seconds |
| `Right` | Skip forward 15 seconds |
| `M` | Toggle mute |

## Events

The component emits custom events that bubble up through the DOM:

```javascript
document.querySelector("podcast-player")
  .addEventListener("player-state", (e) => {
    console.log(e.detail); // { paused, src, currentTime, duration }
  });
```

- `player-state` -- fired on play, pause, and seek
- `podcast-play` -- fired on play (compat); `{ src, title, url }`

## Development

### Test suites

```bash
# JS unit tests (Vitest + jsdom)
npm test

# Go integration tests (builds Hugo sites per test case)
go test -v -timeout 120s ./tests/hugo/...

# E2E tests (Playwright + Hugo server)
npm run test:e2e

# All tests
npm test && go test ./tests/hugo/... && npm run test:e2e
```

### Project structure

```
assets/
  css/podcast-player.css    # External stylesheet (light theme, responsive)
  js/podcast-player.js      # Web Component + source adapters + persistence
  js/sources.js             # Re-exports for test imports
layouts/
  _shortcodes/
    podcast-player.html     # Hugo shortcode template
tests/
  hugo/                     # Go integration tests (9)
  js/                       # Vitest unit tests (80)
  e2e/                      # Playwright E2E tests (11)
exampleSite/                # Runnable demo site
```

## License

AGPLv3
