---
title: "Homepage Setup"
description: "Set up the persistent footer player, integrate with Turbolinks/Turbo/htmx, and add theme toggle support."
date: 2026-01-01
weight: 40
---

The sticky footer player (`<podcast-footer>`) must be present in your site's base template for cross-page persistence.

## Adding the Footer

Add this element just before the closing `</body>` tag in `layouts/_default/baseof.html`:

```
<podcast-footer id="podcast-footer"
  data-turbolinks-permanent
  data-turbo-permanent
  hx-preserve>
</podcast-footer>
```

{{< admonition type="important" >}}
The footer player is **opt-in**. If you don't add `<podcast-footer>` to your template, only the inline `<podcast-player>` components render, and no footer bar appears. The player still works perfectly without a footer.
{{< /admonition >}}

## Framework Attributes

The `data-turbolinks-permanent`, `data-turbo-permanent`, and `hx-preserve` attributes ensure the footer survives page navigation when using these frameworks:

| Framework | Attribute | What it does |
|-----------|-----------|-------------|
| **Turbolinks** | `data-turbolinks-permanent` | Prevents Turbolinks from replacing the footer on navigation |
| **Turbo** | `data-turbo-permanent` | Prevents Turbo Drive from morphing/replacing the footer |
| **htmx** | `hx-preserve` | Tells htmx to preserve the element during DOM swaps |

If you don't use any of these frameworks, omit those attributes: the footer will still persist via `sessionStorage` for vanilla page loads.

## How Persistence Works

The player survives page navigations using multiple strategies:

1. **Framework hooks**: `data-turbolinks-permanent` / `data-turbo-permanent` / `hx-preserve` keep the footer DOM element alive during SPA navigations
2. **sessionStorage fallback**: State saved to `sessionStorage` on `beforeunload`, restored on next page load
3. **Vanilla HTML**: Traditional page loads restore position, volume, mute, and speed from `sessionStorage`

### State Saved

| Field | Description |
|-------|-------------|
| `currentTime` | Playback position in seconds |
| `paused` | Whether audio was paused |
| `volume` | Volume level (0–1) |
| `muted` | Mute state |
| `playbackRate` | Playback speed multiplier |

### Position Restore Rules

- **Exact URL match**: Position only restored when the saved `src` matches the current element's `src`
- **Staleness guard**: Positions older than 1 hour are discarded
- **Paused-state estimation**: If audio was paused, position is restored as-is
- **Playing-state estimation**: If audio was playing, elapsed time since save is added
- **Deferred to `loadedmetadata`**: Position set only after browser reports audio duration

## Theme Toggle Integration

If your site has a dark/light theme toggle, make sure the footer's CSS custom properties respond to your theme switching. The `<podcast-footer>` element responds to these selectors automatically:

```
/* Built-in selectors the player responds to */
[data-theme="dark"] podcast-footer,
.theme-dark podcast-footer,
html[data-theme="dark"] podcast-footer {
  /* Player applies dark theme variables */
}
```

If your theme uses different attribute names (e.g., `body.dark` or `[color-scheme="dark"]`), add your own rules:

```
body.dark podcast-footer {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}

body.dark podcast-player {
  --podcast-player-bg: #1e1e2e;
  --podcast-player-text: #e0e0e0;
}
```

## Example: Full baseof.html Footer Section

```
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
