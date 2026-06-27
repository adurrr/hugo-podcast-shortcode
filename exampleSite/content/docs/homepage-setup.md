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
```

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
