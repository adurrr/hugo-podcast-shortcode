# Wavecast

A persistent podcast/radio audio player for Hugo - drop `<podcast-player>` into any page with a single shortcode. Supports **local files**, **AzuraCast** radio streams, and **iVoox** episodes. Works as a **Hugo module** _and_ as a **Hugo theme**.

## How It Works

Wavecast provides two custom Web Components that work together:

| Component | Where | What it does |
|-----------|-------|-------------|
| `<podcast-player>` | Inline (in your content) | Play/pause, skip, seek, volume, chapters, poster |
| `<podcast-footer>` | Sticky footer | Persistent player bar at the bottom of every page |

Both components are **bidirectionally synced** - pausing the footer pauses all inline players, and vice versa. Only one audio source plays at a time. Position, volume, mute, and speed are saved to `sessionStorage` and restored across page navigations.

## Features

- **Web Component** (`<podcast-player>`) with Shadow DOM - framework-agnostic, works anywhere
- **Inline player**: play/pause, skip ±15s, seekable progress bar, volume slider, mute, playback rate (0.5×–2×)
- **Sticky footer player**: radio-t style bottom bar with cover art, track name, skip, play/pause, wide progress bar, volume, mute, speed, close
- **Bidirectional sync**: pausing any player pauses all audio; all play buttons stay in sync
- **Single-stream**: playing a new source stops the previous one automatically
- **Chapters**: timestamp-labelled navigation chips (`00:00:00-Intro, ...`)
- **Poster & description**: cover image with responsive sizing, Markdown-rendered show notes
- **Source adapters**: local files, AzuraCast radio stations, iVoox episodes (with auto-detection)
- **Navigation persistence**: survives Turbolinks, Turbo, htmx, and vanilla page loads via `sessionStorage`
- **Theming**: 12 CSS custom properties for light/dark themes, responsive on mobile (<480px)
- **`::part()` selectors**: style individual Shadow DOM elements from outside
- **Keyboard shortcuts**: Space (play/pause), Left/Right (skip), M (mute)
- **Media Session API**: integrates with OS media controls (lock screen, notification centre)
- **Accessible**: ARIA labels, `:focus-visible` rings, semantic controls
- **Well tested**: Go integration tests, JS unit tests (Vitest), Playwright E2E

---

## Installation

Wavecast can be used in two ways. Choose the one that fits your project.

### Prerequisites

- Hugo v0.146.0+
- Go 1.23+

### Option A: Install as a Hugo theme (recommended for most sites)

Clone or copy the repo into the `themes/` directory of your Hugo site:

```bash
git clone git@github.com:adurrr/wavecast.git themes/wavecast
```

Then add to your site's `hugo.toml`, `hugo.yaml`, or `hugo.json`:

```toml
theme = "wavecast"
```

That's it. Hugo automatically discovers the shortcode (`layouts/_shortcodes/podcast-player.html`), JS (`assets/js/podcast-player.js`), and CSS (`assets/css/podcast-player.css`) from the theme directory.

> **Tip:** Pin a specific version with a Git tag:
> ```bash
> cd themes/wavecast && git checkout v0.1.0
> ```

### Option B: Install as a Hugo module (for multi-module sites)

If you're already using Hugo modules or need to compose Wavecast with other modules:

```bash
hugo mod init github.com/yourusername/your-site
hugo mod get github.com/adurrr/wavecast
```

Then in your site's `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/adurrr/wavecast"
```

Hugo will resolve the module and make the shortcode, JS, and CSS available.

### Which option should I choose?

| You want... | Use |
|-------------|-----|
| Simple setup, one theme | **Theme** (`theme = "wavecast"`) |
| To use Wavecast alongside other modules | **Module** (`[module.imports]`) |
| To override Wavecast's templates in your own project theme | **Theme** (Hugo's theme cascade handles overrides) |
| Pinned, reproducible builds | Either - both support version pinning |
| No git submodule or clone in your repo | **Module** (`hugo mod get`) |

### Local development / demo

Clone the repo and use the included example site:

```bash
git clone git@github.com:adurrr/wavecast.git
cd wavecast/exampleSite
hugo server --port 1313
```

Open your browser to the URL shown in the server output (e.g. `http://localhost:1313/wavecast/`). The first demo player uses a local `.wav` file so it works immediately with no external dependencies.

---

## Quick Start

### With a remote audio URL

```markdown
{{< podcast-player
  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  title="Episode 42: Hello World"
  poster="https://picsum.photos/seed/podcast/400/400"
  description="Show notes with **Markdown**."
  chapters="00:00:00-Intro,00:05:30-News,00:15:00-Interview"
  persistent="true"
>}}
```

### With a local asset

Place your audio file in your Hugo project's `assets/` directory, then reference it by path:

```markdown
{{< podcast-player
  src="episodes/my-episode.mp3"
  title="Episode 42: Hello World"
>}}
```

The shortcode resolves local files via `resources.GetMatch` - it checks page-scoped resources first, then the global `assets/` directory. Remote URLs are passed through as-is to the `<audio>` element.

---

## Footer Player Setup

The sticky footer player (`<podcast-footer>`) must be present in your site's base template for it to appear on every page.

Add this element just before the closing `</body>` tag in `layouts/_default/baseof.html`:

```html
<podcast-footer id="podcast-footer" data-turbolinks-permanent data-turbo-permanent hx-preserve></podcast-footer>
```

The `data-turbolinks-permanent`, `data-turbo-permanent`, and `hx-preserve` attributes ensure the footer survives page navigation when using Turbolinks, Turbo, or htmx respectively. If you don't use any of those, omit the framework-specific attributes - the footer will still persist via `sessionStorage`.

> **Important:** The footer player is **opt-in**. If you don't add `<podcast-footer>` to your template, only the inline `<podcast-player>` components will render, and no footer bar will appear. The project works perfectly without a footer.

---

## Site-Wide Configuration

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

---

## Shortcode Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `src` | **yes** | - | Audio URL or local file path. Local resources resolved via `.Resources.GetMatch` / `resources.GetMatch`. |
| `title` | no | `""` | Episode title displayed in the player header (and footer). |
| `poster` | no | `""` | Cover image URL displayed next to the controls. Responsive size via `clamp(64px, 10vw, 110px)`. |
| `description` | no | `""` | Markdown description rendered into a `slot="description"` element below the player controls. |
| `type` | no | `"audio/mpeg"` | MIME type. Auto-detected for local resources. |
| `source` | no | `"local"` | Source adapter hint: `"local"`, `"azuracast"`, or `"ivoox"`. Also auto-detected from URL. |
| `persistent` | no | `"true"` | Set to `"false"` to disable navigation persistence. |
| `preload` | no | `"metadata"` | `<audio>` preload attribute value. |
| `chapters` | no | `""` | Comma-separated `HH:MM:SS-Label` pairs for chapter navigation. |
| `autoplay` | no | `"false"` | Auto-play on page load. |
| `rate` | no | `"true"` | Show the playback rate control button (cycles 0.5× → 0.75× → 1× → 1.25× → 1.5× → 2×). |

---

## Source Adapters

The `source` parameter controls how the player resolves its audio URL. When omitted, the source type is auto-detected from the `src` URL.

### Local (default)

Plays the URL as-is. Use for direct audio file links or local Hugo resources.

```markdown
{{< podcast-player src="https://example.com/audio.mp3" >}}
```

### AzuraCast

Fetches the AzuraCast nowplaying API to discover the stream URL and enriches the player with current song metadata (title, artist).

Requires the `data-azuracast-api-url` attribute set on the element:

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

---

## Navigation Persistence

The player survives page navigations in single-page-app frameworks. Enabled by default (`persistent="true"`).

### Framework support

- **Turbolinks**: adds `data-turbolinks-permanent` (both inline and footer)
- **Turbo**: adds `data-turbo-permanent`
- **htmx**: adds `hx-preserve` + a stable generated ID
- **Vanilla JS**: saves state to `sessionStorage` on `beforeunload`, restores on next page load

### State saved

| Field | Description |
|-------|-------------|
| `currentTime` | Playback position in seconds |
| `paused` | Whether audio was paused |
| `volume` | Volume level (0–1) |
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

### Cross-page behaviour

- Navigating away from a page pauses inline audio (saves position)
- Returning to a page does **not** autoplay - the player restores in paused state
- The footer player persists across all pages without interruption

---

## CSS Theming

The player renders in a Shadow DOM with a default dark theme. The external stylesheet provides a light theme that activates automatically. Both are fully customizable via CSS custom properties defined on `<podcast-player>` and `<podcast-footer>`.

### Custom properties

| Property | Default (light) | Default (dark) | Description |
|----------|-----------------|----------------|-------------|
| `--podcast-player-primary` | `#4f46e5` | `#6366f1` | Accent colour for buttons, active states |
| `--podcast-player-bg` | `#ffffff` | `#1e1e2e` | Background colour |
| `--podcast-player-surface` | `#f3f4f6` | `#2a2a3e` | Surface colour for buttons, containers |
| `--podcast-player-text` | `#111827` | `#e0e0e0` | Primary text colour |
| `--podcast-player-text-muted` | `#6b7280` | `#888` | Muted text colour (time, description) |
| `--podcast-player-accent` | `#7c3aed` | `#a78bfa` | Hover/alt accent colour |
| `--podcast-player-radius` | `12px` | `12px` | Outer border radius |
| `--podcast-player-border` | `#e5e7eb` | `rgba(255,255,255,0.06)` | Border colour around the player |
| `--podcast-player-progress-height` | `5px` | `5px` | Progress bar track height |
| `--podcast-player-thumb-size` | `14px` | `14px` | Progress bar thumb diameter |
| `--podcast-player-focus-ring` | `0 0 0 3px rgba(79,70,229,0.35)` | `0 0 0 3px rgba(167,139,250,0.35)` | Focus-visible ring shadow |

### Light / dark mode

The light theme is the default. For dark mode, wrap the player in a container with `[data-theme="dark"]`, `.theme-dark`, or set `data-theme="dark"` directly on the `<html>` element:

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

Available `part` attributes:

| Element | Parts |
|---------|-------|
| `<podcast-player>` (inline) | `player`, `header`, `poster`, `title`, `controls`, `play-btn`, `skip-back-btn`, `skip-fwd-btn`, `progress-wrap`, `progress`, `time-current`, `time-sep`, `time-duration`, `extras`, `vol-wrap`, `mute-btn`, `volume`, `rate-btn`, `chapters`, `error` |
| `<podcast-footer>` (footer) | `footer`, `poster`, `title`, `play-btn`, `skip-back-btn`, `skip-fwd-btn`, `progress`, `time-current`, `time-duration`, `mute-btn`, `volume`, `rate-btn`, `close-btn` |

### Responsive behaviour

Below 480px the player adapts:

- Progress bar drops to its own full-width row
- Play button grows to 52×52px; other buttons to 44×44px
- Slider thumbs enlarge for easier touch targeting
- Chapters switch to horizontal scroll

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause |
| `Left` | Skip back 15 seconds |
| `Right` | Skip forward 15 seconds |
| `M` | Toggle mute |

Works on both inline and footer players when the player is focused.

---

## Events

The component emits custom events that bubble up through the DOM:

```javascript
document.querySelector("podcast-player")
  .addEventListener("player-state", (e) => {
    console.log(e.detail); // { paused, src, currentTime, duration }
  });
```

| Event | Fired on | Detail payload |
|-------|----------|----------------|
| `player-state` | play, pause, seek | `{ paused, src, currentTime, duration }` |
| `podcast-play` | play (compat) | `{ src, title, url }` |
| `podcast-pause` | pause | `{ src }` |
| `podcast-close` | footer close button | `{ src }` |
| `podcast-seek` | seek on any player | `{ src, currentTime }` |

---

## Development

### Project structure

```
assets/
  css/podcast-player.css    # External stylesheet (light theme, responsive, focus-visible)
  js/podcast-player.js      # Web Component + source adapters + persistence (~1790 lines)
  js/sources.js             # Re-exports for test imports
  demo/demo-audio.wav       # Demo audio file for the example site
layouts/
  _shortcodes/
    podcast-player.html     # Hugo shortcode template
tests/
  hugo/                     # Go integration tests (builds Hugo sites per case)
  js/                       # Vitest unit tests (80)
  e2e/                      # Playwright E2E tests (21)
exampleSite/                # Runnable demo site
theme.toml                  # Hugo theme manifest
```

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

### Adding a new source adapter

1. Create a new class in `assets/js/podcast-player.js` that implements `fetchStreamUrl()` and/or `fetchMetadata()`
2. Register it in the `sourceAdapters` map
3. Add auto-detection rules in `_detectSource()`
4. Write JS unit tests in `tests/js/` and E2E tests in `tests/e2e/`
5. Run all three test suites

---

## Troubleshooting

**Player doesn't appear (empty area where it should be)**
- Check the browser console for JavaScript errors. The `<podcast-player>` custom element must be registered - if the JS asset fails to load, the player won't render.
- Verify the JS asset is accessible. In your browser's Network tab, look for `podcast-player.js`. With `hugo server` it's typically at `/wavecast/js/podcast-player.js`.
- Some ad-blockers or script blockers may prevent module scripts from loading.

**Audio doesn't play**
- Click the play button - the player doesn't autoplay by default (browsers block autoplay).
- Check the browser console for CORS errors. The audio source must either be same-origin or have permissive CORS headers. For development, use the demo audio file at `assets/demo/demo-audio.wav`.
- Ensure the `src` URL is valid and points to a playable audio file.
- Check that the `type` attribute matches the audio format (e.g. `audio/mpeg` for MP3, `audio/wav` for WAV). When omitted, the browser auto-detects.

**Poster image doesn't appear**
- The poster URL must be accessible. Check for CORS or 404 errors in the browser console.
- The component hides the poster `<img>` when no `poster` attribute is set.

**Shortcode not found (`errorf` message on page)**
- Hugo v0.146.0+ is required for the `_shortcodes/` directory naming convention.
- If using as a **theme**, verify `theme = "wavecast"` is set in your site's `hugo.toml`.
- If using as a **module**, verify the import is listed under `[module.imports]` in `hugo.toml`.

**Footer player doesn't appear**
- The `<podcast-footer>` element must be present in your `baseof.html` template. It won't appear automatically.
- Add `<podcast-footer id="podcast-footer" data-turbolinks-permanent data-turbo-permanent hx-preserve></podcast-footer>` just before `</body>`.

**Persistence doesn't work**
- `persistent` must be present as an attribute on the element. By default it's enabled, but setting `persistent="false"` in a shortcode param or globally in `[params.podcastPlayer]` disables it.
- State is stored in `sessionStorage` - it persists only within the same browser tab.
- The footer player persists automatically; no `persistent` attribute needed on `<podcast-footer>`.

---

## License

AGPLv3
