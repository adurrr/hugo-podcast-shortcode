---
title: "Getting Started"
description: "Create your first episode with the podcast-player shortcode. Minimal setup with a working example."
date: 2026-01-01
weight: 60
---

After installing Wavecast, add a podcast player to any page with a single shortcode.

## Minimal Setup

1. **Add the footer player** to your base template:

   In `layouts/_default/baseof.html`, add just before `</body>`:

   ```html
   <podcast-footer id="podcast-footer" data-turbolinks-permanent data-turbo-permanent hx-preserve></podcast-footer>
   ```

2. **Create an episode** in `content/episodes/my-first-episode.md`:

   ```markdown
   ---
   title: "Episode 1: Hello World"
   date: 2026-01-15
   podcast:
     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
   ---

   Welcome to my first episode!

   {{</* podcast-player
     src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
     title="Episode 1: Hello World"
     poster="https://picsum.photos/seed/podcast/400/400"
     description="Show notes with **Markdown** support."
     chapters="00:00:00-Intro,00:05:30-News,00:15:00-Interview"
   */>}}
   ```

## Shortcode Parameters at a Glance

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `src` | **yes** |: | Audio URL or local file path |
| `title` | no | `""` | Episode title in the player header |
| `url` | no | `""` | Link target for the footer source label. Set to a URL (http/https or site-relative) to make the label clickable, or `"none"` to hide the link. Omit to auto-derive from the audio source. |
| `poster` | no | `""` | Cover image URL |
| `description` | no | `""` | Markdown description |
| `type` | no | `"audio/mpeg"` | MIME type |
| `source` | no | `"local"` | Source adapter hint |
| `persistent` | no | `"true"` | Disable to prevent navigation persistence |
| `preload` | no | `"metadata"` | HTML5 `<audio>` preload value |
| `chapters` | no | `""` | Comma-separated `HH:MM:SS-Label` pairs |
| `autoplay` | no | `"false"` | Auto-play on page load |
| `rate` | no | `"true"` | Show playback rate control |

## With a Local Audio File

Place your audio file in your Hugo project's `assets/` directory:

```go-html-template
{{</* podcast-player
  src="episodes/my-episode.mp3"
  title="Episode 42: Hello World"
*/>}}
```

The shortcode resolves local files via `resources.GetMatch`: it checks page-scoped resources first, then the global `assets/` directory. Remote URLs are passed through as-is.

## Verify It Works

After running `hugo server`, you should see:

1. ✅ A styled audio player with play/pause button, progress bar, and volume controls
2. ✅ Chapters rendered as clickable chips (if you provided them)
3. ✅ Poster image next to the controls (if you provided one)
4. ✅ Description text below the controls (if you provided one)

{{< admonition type="warning" >}}
**Audio doesn't play?** Check the browser console for CORS errors. For local development, use the demo audio file at `assets/demo/demo-audio.wav` or a same-origin audio file. Some ad-blockers may block module scripts.
{{< /admonition >}}

## Next Steps

- [Configure global defaults]({{< ref "docs/configuration" >}}) in your `hugo.toml`
- [Set up the footer player]({{< ref "docs/homepage-setup" >}}) for cross-page persistence
- [Add podcast RSS]({{< ref "docs/front-matter#podcast-rss-fields" >}}) for Apple Podcasts & Spotify submission
- [Explore advanced features]({{< ref "docs/advanced" >}}) like AzuraCast integration
