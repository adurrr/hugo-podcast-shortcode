---
title: "Advanced Configuration"
description: "Source adapters, JavaScript events API, persistence internals, and keyboard shortcuts."
date: 2026-01-01
weight: 10
---

## Source Adapters

The `source` parameter controls how the player resolves its audio URL. When omitted, the source type is auto-detected from the `src` URL.

### Local (default)

Plays the URL as-is. Use for direct audio file links or local Hugo resources.

```go-html-template
{{</* podcast-player src="https://example.com/audio.mp3" */>}}
```

### AzuraCast

Fetches the AzuraCast nowplaying API to discover the stream URL and enriches the player with current song metadata.

Requires the `data-azuracast-api-url` attribute:

```go-html-template
{{</* podcast-player
  src=""
  source="azuracast"
  data-azuracast-api-url="https://radio.example.org/api/live/nowplaying/station-slug"
*/>}}
```

If `src` is provided alongside `source="azuracast"`, it's used directly without fetching the API.

**Auto-detection**: triggered when the URL contains `azuracast` or `.stream.`.

### iVoox

Fetches the iVoox episode page and extracts the audio URL from:

1. `og:audio` meta property
2. `data-audio-url` attribute
3. `<audio><source>` element

On fetch failure, falls back to the `src` URL as-is.

```go-html-template
{{</* podcast-player
  src="https://www.ivoox.com/episode-title_12345_1.html"
  source="ivoox"
*/>}}
```

**Auto-detection**: triggered when the URL contains `ivoox.com`.

## JavaScript Events API

The component emits custom events that bubble through the DOM. Listen on any `<podcast-player>` or `<podcast-footer>` element:

```javascript
document.querySelector("podcast-player")
  .addEventListener("player-state", (e) => {
    console.log(e.detail);
    // { paused, src, currentTime, duration }
  });
```

### Event Reference

| Event | Fired on | Detail payload |
|-------|----------|----------------|
| `player-state` | play, pause, seek | `{ paused, src, currentTime, duration }` |
| `podcast-play` | play (compat) | `{ src, title, url }` |
| `podcast-pause` | pause | `{ src }` |
| `podcast-close` | footer close button | `{ src }` |
| `podcast-seek` | seek on any player | `{ src, currentTime }` |

## sessionStorage Persistence

State is saved per-source in `sessionStorage` using the key format:

```text
podcastPlayerState:<src>
```

This means multiple players on the same page use separate keys and don't interfere with each other.

### Cross-Page Behaviour

- Navigating away pauses inline audio (saves position)
- Returning to a page does **not** autoplay: the player restores in paused state
- The footer player persists across all pages without interruption

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause |
| `Left Arrow` | Skip back 15 seconds |
| `Right Arrow` | Skip forward 15 seconds |
| `M` | Toggle mute |

Works on both inline and footer players when the player is focused.

## Media Session API

Wavecast integrates with the [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API), which means:

- Play/pause controls appear on OS lock screens and notification centres
- Track title and cover art are displayed in system media controls
- Hardware media keys (headphones, keyboard) control playback

This is automatic: no configuration needed.

## Troubleshooting

### Footer disappears on page navigation

**Symptom:** Click play on an inline player, the footer bar appears. Click a
nav link — the new page loads, the footer is gone, and the audio stops.

**Root cause:** No navigation framework is loaded. The
`data-turbo-permanent` / `data-turbolinks-permanent` / `hx-preserve`
attributes on `<podcast-footer>` are inert HTML attributes with no effect on
their own — they are read by htmx / Turbo / Turbolinks JS. If none of those
libraries is loaded, the browser does a full page reload and the footer DOM
element is destroyed and recreated with no `src`.

**Diagnose:** In the browser console on any page, type:

```js
[window.htmx, window.Turbo, window.Turbolinks].filter(Boolean)
// should print exactly one entry
```
If it prints an empty array, no framework is loaded.
**Fix:** Load one — see [Homepage Setup → Framework Attributes]({{< ref
"docs/homepage-setup.md#framework-attributes" >}}).

### Inline player and footer out of sync after navigation

**Symptom:** Volume / mute / playback rate changes on the inline player do
not update the footer (or vice versa).

**Root cause:** Some themes (especially ones that bundle a DOMContentLoaded
init script) re-bind event handlers on every full page load, but not on
htmx/Turbo swaps. If your theme has this pattern, hook the theme's re-init
function to `htmx:afterSwap` / `turbo:render` / `turbolinks:render`.

**Fix (Blowfish example):** add to your `extend-head.html`:

```js
if (window.htmx) {
  document.addEventListener("htmx:afterSwap", () => {
    // re-run your theme's page-load init here
  });
}
```

{{< admonition type="warning" title="Player doesn't appear" >}}

- Check the browser console for JavaScript errors. The `<podcast-player>` custom element must be registered.
- Verify the JS asset loads. In your Network tab, look for `podcast-player.js`. With `hugo server` it's at `/wavecast/js/podcast-player.js`.
- Some ad-blockers or script blockers may prevent module scripts from loading.

{{< /admonition >}}

{{< admonition type="warning" title="Audio doesn't play" >}}

- Click the play button: the player doesn't autoplay by default (browsers block it).
- Check for CORS errors. The audio source must be same-origin or have permissive CORS headers.
- Ensure the `src` URL points to a playable audio file.
- Check that the `type` attribute matches the format (e.g. `audio/mpeg` for MP3).

{{< /admonition >}}

{{< admonition type="warning" title="Poster image doesn't appear" >}}

- The poster URL must be accessible. Check for CORS or 404 errors.
- The component hides the poster `<img>` when no `poster` attribute is set.

{{< /admonition >}}

{{< admonition type="warning" title="Shortcode not found (errorf message)" >}}

- Hugo v0.146.0+ is required for the `_shortcodes/` directory naming convention.
- If using as a **theme**, verify `theme = "wavecast"` in `hugo.toml`.
- If using as a **module**, verify the import under `[module.imports]`.

{{< /admonition >}}

{{< admonition type="warning" title="Footer player doesn't appear" >}}

- The `<podcast-footer>` element must be in your `baseof.html` template. It won't appear automatically.
- Add it just before `</body>` (see [Homepage Setup]({{< ref "docs/homepage-setup" >}})).

{{< /admonition >}}

{{< admonition type="warning" title="Persistence doesn't work" >}}

- `persistent` must be enabled (it is by default). Setting `persistent="false"` disables it.
- State is in `sessionStorage`: it persists only within the same browser tab.
- The footer player persists automatically; no `persistent` attribute needed on `<podcast-footer>`.

{{< /admonition >}}
