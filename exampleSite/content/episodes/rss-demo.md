---
title: "Introduction to Wavecast RSS Feeds"
program: "Wavecast Demo"
episode: "S1E1"
date: 2026-06-01
tags: [Wavecast, Hugo, Podcasting, RSS]
podcast:
  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  poster: "https://picsum.photos/seed/wavecast-rss/400/400"
  chapters: "00:00:00-Intro,00:00:30-How It Works,00:01:20-Episode Front Matter,00:02:10-Channel Config,00:02:45-Validating the Feed"
  type: "audio/mpeg"
  duration: "00:03:45"
  season: 1
  episode: 1
  explicit: false
  author: "Wavecast Radio"
  guid: "wavecast-demo-s1e1"
  episodeType: "full"
  subtitle: "Learn how Wavecast generates iTunes-compatible podcast RSS feeds from Hugo content."
show_notes:
  - "[W3C Feed Validator](https://validator.w3.org/feed/): validate your RSS feed before submitting to directories"
  - "[Apple Podcasts Connect](https://podcastsconnect.apple.com/): submit your podcast to Apple Podcasts"
  - "[Hugo RSS Templates](https://gohugo.io/templates/rss/): Hugo's official RSS template documentation"
attribution:
  text: "Wavecast RSS Demo"
  url: "https://github.com/adurrr/wavecast"
---

This episode demonstrates how Wavecast automatically generates
iTunes-compatible podcast RSS feeds when you configure
`[params.podcast]` in your Hugo site config.

## How It Works

Wavecast ships `layouts/_default/rss.xml`, a single template that handles both
standard blogs and podcast feeds. At build time, the template checks your
`[params.podcast]` config:

<div class="info-card" style="margin:1.5rem 0">

**Detection rules:**

| Condition                                | Behaviour                                            |
|------------------------------------------|------------------------------------------------------|
| `[params.podcast]` has `author`, `image`, or `description` | Renders a **full iTunes podcast RSS** feed (with `itunes:` namespace, categories, owner, artwork) |
| `[params.podcast]` is missing or empty   | Renders a **plain RSS 2.0** feed suitable for blogs   |
| Page has `podcast.src` in its front matter | Included as an `<item>` with an `<enclosure>` element |
| Page has no `podcast.src`                | Skipped entirely (not a podcast episode)             |

</div>

There is no toggle or flag to set. If your site config defines podcast metadata,
you get a podcast feed. If it does not, you get a blog feed. Both work from the
same single template.

Episodes with a local audio file (e.g. `src: "audio/episode.mp3"`) get their
`<enclosure>` file size auto-resolved via Hugo resources. Remote URLs default to
`length="0"`, which is valid RSS and accepted by all major podcast directories.

## Episode Front Matter

All iTunes-specific fields live under the `podcast:` key in your episode's
YAML front matter:

```yaml
podcast:
  src: "https://example.com/audio/ep42.mp3"   # required
  type: "audio/mpeg"                           # MIME type
  duration: "00:45:00"                         # HH:MM:SS or seconds
  season: 2                                    # season number
  episode: 42                                  # episode number
  explicit: false                              # "true" or "false"
  author: "Guest Host"                         # overrides site-level
  guid: "unique-ep-42"                         # falls back to permalink
  episodeType: "full"                          # full|trailer|bonus
  subtitle: "A short episode teaser"           # max 255 chars
  summary: "Full episode description"          # max 4000 chars
```

Standard Hugo fields (`title`, `date`, `tags`, `summary`) are pulled from
the regular front matter automatically.

## Channel Configuration

Site-level podcast metadata goes in your `hugo.toml`:

```toml
[params.podcast]
  author = "Your Name"
  image  = "/podcast-cover.jpg"   # min 1400x1400px recommended
  description = "A weekly show about open-source."
  explicit = false
  type     = "episodic"           # "episodic" or "serial"
  owner_name  = "Your Name"
  owner_email = "you@example.com"

  [[params.podcast.categories]]
    category = "Technology"
```

## Validating the Feed

Once your site is live, validate your feed:

1. Visit [validator.w3.org/feed](https://validator.w3.org/feed/)
2. Enter your site's feed URL (usually `/index.xml`)
3. Fix any warnings before submitting to directories

The feed is ready for **Apple Podcasts**, **Spotify**, **Google Podcasts**,
and any RSS-compatible podcast app.

<div class="nav-buttons" style="margin-top:1.5rem">
  <a href="/wavecast/index.xml" class="nav-button nav-button-primary" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:middle"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/></svg>
    View RSS Feed
  </a>
  <a href="https://validator.w3.org/feed/" target="_blank" rel="noopener" class="nav-button">Validate Feed</a>
</div>
