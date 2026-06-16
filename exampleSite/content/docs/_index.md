---
title: "Documentation"
description: "Learn how to use Wavecast: the persistent podcast player Web Component for Hugo."
weight: 80

cascade:
  showDate: false
  showAuthor: false
---

{{< admonition type="tip" >}}
**You're looking at the docs.** This page was built with Wavecast itself. Every code example on this page is a working shortcode rendered live in your browser.
{{< /admonition >}}

## What is Wavecast?

Wavecast is an open-source Hugo theme and module that adds a **persistent podcast/radio audio player** to any Hugo site. It provides two custom Web Components that work together:

<div class="info-card">

| Component | Where | What it does |
|-----------|-------|-------------|
| `<podcast-player>` | Inline (in your content) | Play/pause, skip, seek, volume, chapters, poster |
| `<podcast-footer>` | Sticky footer | Persistent player bar at the bottom of every page |

</div>

Both components are **bidirectionally synced**: pausing the footer pauses all inline players, and vice versa. Only one audio source plays at a time. Position, volume, mute, and speed survive page navigation.

## Features at a Glance

- **Web Component** with Shadow DOM: framework-agnostic, works anywhere
- **Inline player** with play/pause, skip ±15s, seekable progress bar, volume, mute, playback rate (0.5×–2×)
- **Sticky footer player** with cover art, track name, wide progress bar, volume, mute, speed, close
- **Bidirectional sync** between inline and footer players
- **Single-stream**: playing a new source stops the previous one
- **Chapters**: timestamp-labelled navigation chips
- **Poster & description**: cover image and Markdown-rendered show notes
- **Source adapters**: local files, AzuraCast radio stations, iVoox episodes
- **Navigation persistence**: survives Turbolinks, Turbo, htmx, and vanilla page loads
- **Theming**: 11 CSS custom properties for light/dark themes
- **`::part()` selectors**: style Shadow DOM elements from outside
- **Keyboard shortcuts**: Space (play/pause), Left/Right (skip), M (mute)
- **Media Session API**: integrates with OS media controls
- **Podcast RSS feed**: iTunes-compatible RSS with automatic podcast detection
- **Accessible**: ARIA labels, `:focus-visible` rings, semantic controls

## Who is it for?

- **Podcasters** who want a self-hosted Hugo site with a polished audio player
- **Radio stations** using AzuraCast who need a persistent web player
- **Hugo theme developers** who want to embed audio in their themes
- **Anyone** building a content site who wants audio that survives page navigation

## Live Demo

{{< button url="https://adurrr.github.io/wavecast/" variant="primary" icon="→" >}}Open Live Demo{{< /button >}}
{{< button url="https://github.com/adurrr/wavecast" variant="outline" icon="→" >}}GitHub Repository{{< /button >}}
