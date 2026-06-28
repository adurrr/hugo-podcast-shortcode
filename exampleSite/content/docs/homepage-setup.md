---
title: "Homepage Setup"
description: "Set up the persistent footer player, integrate with Turbolinks/Turbo/htmx, and add theme toggle support."
date: 2026-01-01
weight: 40
---

The sticky footer player (`<podcast-footer>`) must be present in your site's base template for cross-page persistence.

## Adding the Footer

Add this element just before the closing `</body>` tag in `layouts/_default/baseof.html`:

```html
<podcast-footer id="podcast-footer"
  data-turbolinks-permanent
  data-turbo-permanent
  hx-preserve>
</podcast-footer>
```

{{< admonition type="important" >}}
The footer player is **opt-in**. If you don't add `<podcast-footer>` to your template, only the inline `<podcast-player>` components render, and no footer bar appears. The player still works perfectly without a footer.
{{< /admonition >}}

## How Persistence Works

The footer survives page navigations using two complementary strategies:

1. **Framework DOM preservation** (required for seamless playback). One of these
   frameworks must be loaded on the page:
   - **htmx** (recommended — smallest, most predictable)
   - **Turbo** (Hotwire — "Rails-y" feel, more aggressive)
   - **Turbolinks 5** (legacy; vendored copy in `assets/js/vendor/turbolinks.js`)

   Without a framework, the footer is **destroyed and recreated** on every
   navigation. The `<audio>` element is re-instantiated with no source and
   playback stops, even though Wavecast will restore `currentTime` from
   `sessionStorage` on the next page.

2. **State restoration via `sessionStorage`** (always active). On every
   `beforeunload`, the footer saves `{currentTime, volume, muted, playbackRate, paused}`.
   On the next page, the inline player on the same source restores position
   (with a 1-hour staleness guard).

## Framework Attributes

The footer element declares which framework to opt into:

| Framework | Attribute on `<podcast-footer>` | What it does |
|-----------|----------------------------------|--------------|
| **htmx**  | `hx-preserve`                    | Tells htmx to keep the element during `hx-boost` swaps |
| **Turbo** | `data-turbo-permanent`           | Tells Turbo Drive to morph-instead-of-replace the element |
| **Turbolinks 5** | `data-turbolinks-permanent` | Tells Turbolinks to relocate the element into the new body |

Wavecast's JS detects the first available framework on load (`window.htmx`,
`window.Turbo`, `window.Turbolinks`) and logs the chosen adapter. The other
attributes are harmless no-ops.

## Quick setup per framework

**htmx** (recommended):

```html
<!-- in <head> -->
<script src="https://unpkg.com/htmx.org@1.9.12/dist/htmx.min.js"
        integrity="sha384-ujb1lZYygJmzgSwoxRggbCHcjc0rB2XoQrxeTUQyRjrOnlCoYta87iKBWq3EsdM2"
        crossorigin="anonymous" defer></script>

<!-- in <body> -->
<body hx-boost="true">

<podcast-footer id="podcast-footer" hx-preserve></podcast-footer>
```
**Turbo:**
```html
<!-- in <head> -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@hotwired/turbo@8.0.1/dist/turbo.es2017-esm.min.js"></script>

<podcast-footer id="podcast-footer" data-turbo-permanent></podcast-footer>
```
**Turbolinks 5** (uses the copy bundled in the Wavecast module):
```html
<!-- in <head> -->
<script src="{{ "js/vendor/turbolinks.js" | relURL }}"></script>

<podcast-footer id="podcast-footer" data-turbolinks-permanent></podcast-footer>
```

Without one of these scripts, the persistence attributes are dead code —
the browser ignores them, and the footer is re-created on every page load.

## Theme Toggle Integration

If your site has a dark/light theme toggle, make sure the footer's CSS custom properties respond to your theme switching. The `<podcast-footer>` element responds to these selectors automatically:

```css
/* Built-in selectors the player responds to */
[data-theme="dark"] podcast-footer,
.theme-dark podcast-footer,
html[data-theme="dark"] podcast-footer {
  /* Player applies dark theme variables */
}
```

If your theme uses different attribute names (e.g., `body.dark` or `[color-scheme="dark"]`), add your own rules:

```css
body.dark podcast-footer {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}

body.dark podcast-player {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}

## Scrolling Long Titles

When a playing episode has a title longer than the footer's title area, the
title automatically scrolls horizontally so the full text is visible. Short
titles render normally with no animation. The behavior respects
`prefers-reduced-motion: reduce`, which falls back to ellipsis truncation.

## Linking the Footer

The persistent footer shows a small source label (the audio host's domain) below the episode title. By default this label is a link to the audio file's parent directory. The `url` shortcode parameter overrides or hides the link:

- Omitted, auto-derived: the link points at the audio file's parent directory (e.g. `src="https://example.com/episodes/foo.mp3"` makes the link `https://example.com/episodes/`).
- A URL: the link points at that URL instead. Accepts `http://`, `https://`, and site-relative paths starting with `/`, `#`, or `.`.
- `"none"`: the link is hidden entirely. Useful for live radio streams that have no episode page.

```go-html-template
{{</* podcast-player
  src="https://example.com/stream.mp3"
  title="Live Broadcast"
  url="https://example.com/shows/live"
*/>}}

{{</* podcast-player
  src="https://example.com/stream.mp3"
  title="Live Broadcast"
  url="none"
*/>}}
```

The same attribute can be set on the top-level `<podcast-footer url="...">` to override whatever the inline player sends. URLs are sanitized at build time and at runtime; only `http` and `https` schemes are accepted when the link is rendered.

## Footer Size

The `size` attribute on `<podcast-footer>` controls the bar's visual footprint. Three presets are available:

- `size="small"` (default): the current compact bar. 36px cover, 140px info column, 32px buttons. Omitting the `size` attribute is equivalent to `size="small"`.
- `size="medium"`: a wider bar with a 48px cover, 240px info column, 36px buttons, and slightly larger fonts.
- `size="large"`: a full-bleed banner with a 64px cover, 400px info column, 44-56px buttons, and the largest fonts.

```html
<podcast-footer id="podcast-footer" size="medium" data-turbo-permanent></podcast-footer>
```

On viewports narrower than 768px, all three sizes collapse to the same compact layout that `size="small"` produces on desktop. Unknown values (`size="huge"`, etc.) fall back to the default `small` layout.

The attribute is purely visual. Persistence, playback, and the audio source URL are unaffected by `size`. Theme variables (`--podcast-player-bg`, `--podcast-player-text`, etc.) continue to work as before.

## Live Radio Mode

The persistent footer can host a live radio station via the
`<podcast-live>` element, typically placed as a sibling of
`<podcast-footer>` in `baseof.html`. When the live stream is playing,
the footer shows a red LIVE badge, the current track metadata, and a
24H start-to-end time that updates as the track progresses.

To enable:

```go-html-template
<podcast-live
  data-azuracast-api-url="https://radio.example.org/api/live/nowplaying/station-slug"
  station-name="My Radio">
</podcast-live>
```

While any non-live source is playing, a "Listen Live" button appears
in the footer. Clicking it switches to the live stream and stops the
other source. The live badge has a pulse animation by default; users
with `prefers-reduced-motion: reduce` see a static dot instead.

The metadata refreshes every 15 seconds while playing and every 60
seconds otherwise, with exponential backoff on errors. The configuration
follows the same `data-turbolinks-permanent` / `hx-preserve` rules as
the rest of the footer, so it persists across htmx / Turbo / Turbolinks
navigation.

## Example: Full baseof.html Footer Section

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}">
  <head>
    <meta charset="utf-8">
    <title>{{ block "title" . }}{{ .Site.Title }}{{ end }}</title>
    <!-- head content... -->
  </head>
  <body>
    {{ block "main" . }}{{ end }}

    <!-- Footer player -->
    <podcast-footer id="podcast-footer"
      data-turbolinks-permanent
      data-turbo-permanent
      hx-preserve>
    </podcast-footer>
  </body>
</html>
```

## Next Steps

- [Configure per-episode front matter]({{< ref "docs/front-matter" >}}) for podcast RSS
- [Set up site-wide defaults]({{< ref "docs/configuration" >}}) for all players
- [Explore source adapters]({{< ref "docs/advanced" >}}) for AzuraCast and iVoox
