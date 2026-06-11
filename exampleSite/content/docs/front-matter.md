---
title: "Front Matter"
description: "Episode front matter fields, podcast RSS metadata, and per-page player configuration."
date: 2026-01-01
weight: 60
---

Wavecast uses Hugo front matter to configure episodes for both the player and the podcast RSS feed.

## Audio Player Front Matter

Add a `podcast:` key to any page's YAML front matter to render a player:

```
---
title: "Episode 42: The Big One"
date: 2026-06-01
podcast:
  src: "https://example.com/audio/ep42.mp3"
  poster: "/images/ep42-cover.jpg"
  chapters: "00:00:00-Intro,00:05:30-News,00:15:00-Interview"
  description: "In this episode we discuss..."
---
```

### Player Fields

| Field | Required | Description |
|-------|----------|-------------|
| `podcast.src` | **yes** | Audio URL or local file path |
| `podcast.poster` | no | Cover image URL |
| `podcast.chapters` | no | Comma-separated `HH:MM:SS-Label` pairs |
| `podcast.description` | no | Markdown show notes rendered below player |
| `podcast.source` | no | Source adapter: `"local"`, `"azuracast"`, `"ivoox"` |
| `podcast.persistent` | no | Set to `false` to disable navigation persistence |

You can also pass these directly as shortcode parameters:

```
{{</* podcast-player
  src="https://example.com/audio.mp3"
  title="Episode 42"
  poster="/images/cover.jpg"
  chapters="00:00:00-Intro,00:05:30-Topic"
  description="Show notes here."
*/>}}
```

## Podcast RSS Fields

For iTunes-compatible podcast RSS feeds, add additional fields to `podcast:` in your episode front matter:

```
---
title: "Episode 42: The Big One"
date: 2026-06-01
podcast:
  src: "https://example.com/audio/ep42.mp3"
  type: "audio/mpeg"              # MIME type (default: audio/mpeg)
  duration: "00:45:00"            # HH:MM:SS or seconds
  season: 2                       # Season number
  episode: 42                     # Episode number
  explicit: false                 # Overrides site-level explicit
  author: "Guest Host"            # Overrides site-level author
  guid: "unique-ep-42"            # Falls back to permalink
  episodeType: "full"             # "full", "trailer", or "bonus"
  subtitle: "A short teaser"      # ≤255 chars, appears in Description column
  summary: "Full episode summary" # Up to 4000 characters
---
```

### RSS Fields Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `podcast.src` | string |: | Enclosure URL (required for feed inclusion) |
| `podcast.type` | string | `"audio/mpeg"` | MIME type for the enclosure |
| `podcast.duration` | string |: | Duration as `HH:MM:SS` or integer seconds |
| `podcast.season` | int |: | iTunes season number |
| `podcast.episode` | int |: | iTunes episode number |
| `podcast.explicit` | bool |: | Overrides site-level explicit flag |
| `podcast.author` | string |: | Overrides site-level podcast author |
| `podcast.guid` | string | Permalink | Unique episode identifier |
| `podcast.episodeType` | string | `"full"` | `"full"`, `"trailer"`, or `"bonus"` |
| `podcast.subtitle` | string |: | Short teaser (max 255 chars) |
| `podcast.summary` | string |: | Full description (max 4000 chars) |

## Site-Level Podcast Config

Global podcast metadata goes in `hugo.toml` under `[params.podcast]`:

```
[params.podcast]
  description = "A weekly show about open-source and software engineering."
  author = "Your Name"
  summary  = "Longer show description (up to 4000 characters). Shown on the ⓘ info popup in podcast apps."
  image    = "/podcast-cover.jpg"     # ≥1400×1400 px recommended
  explicit = false                     # "true" or "false"
  type     = "episodic"                # "episodic" or "serial"
  owner_name  = "Your Name"
  owner_email = "you@example.com"
  language = "en-us"                   # Overrides site.languageCode
  copyright = "© 2026 Your Name"

  [[params.podcast.categories]]
    category = "Technology"
  [[params.podcast.categories]]
    category = "Education"
    subcategory = "Courses"
```

## How RSS Detection Works

| Scenario | RSS output |
|----------|-----------|
| No `[params.podcast]` in config | Standard RSS 2.0 (suitable for blogs) |
| `[params.podcast]` with `author`, `image`, or `description` | Full iTunes podcast RSS with `itunes:` namespace |
| Episode has `podcast.src` (local file) | Enclosure with `length` auto-resolved from Hugo resources |
| Episode has `podcast.src` (remote URL) | Enclosure with `length="0"` |
| Episode has NO `podcast.src` | Omitted from feed entirely |

The feed is available at `/index.xml`. Validate at [validator.w3.org/feed](https://validator.w3.org/feed/).

## Next Steps

- [Set up homepage and footer]({{< ref "docs/homepage-setup" >}})
- [Learn about source adapters]({{< ref "docs/advanced" >}}) for AzuraCast and iVoox
- [See all shortcodes]({{< ref "docs/shortcodes" >}}) for building rich content
