---
title: "Installation"
description: "Install Wavecast as a Hugo theme or Hugo module. Step-by-step instructions for both paths."
date: 2026-01-01
weight: 70
---

Wavecast can be used in two ways. Choose the one that fits your project.

## Prerequisites

- **Hugo** v0.146.0 or later
- **Go** 1.23 or later (only if using the module install path)

## Option A: Install as a Hugo Theme

Recommended for most sites. Clone Wavecast into your `themes/` directory:

```shell
git clone git@github.com:adurrr/wavecast.git themes/wavecast
```

Then add to your site's `hugo.toml`:

```toml
theme = "wavecast"
```

That's it. Hugo automatically discovers the shortcode (`layouts/_shortcodes/podcast-player.html`), JS (`assets/js/podcast-player.js`), and CSS (`assets/css/podcast-player.css`) from the theme directory.

{{< admonition type="tip" title="Version Pinning" >}}
Pin a specific release with a Git tag:
```shell
cd themes/wavecast && git checkout v1.3.0
```
{{< /admonition >}}

## Option B: Install as a Hugo Module

If you're already using Hugo modules or need to compose Wavecast with other modules:

```shell
hugo mod init github.com/yourusername/your-site
hugo mod get github.com/adurrr/wavecast
```

Then in your site's `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/adurrr/wavecast"
```

Hugo resolves the module and makes the shortcode, JS, and CSS available automatically.

## Which Option Should I Choose?

| You want... | Use |
|-------------|-----|
| Simple setup, one theme | **Theme** (`theme = "wavecast"`) |
| To use Wavecast alongside other modules | **Module** (`[module.imports]`) |
| To override Wavecast's templates in your own project | **Theme** (Hugo's theme cascade handles overrides) |
| Pinned, reproducible builds | Either: both support version pinning |
| No git submodule or clone in your repo | **Module** (`hugo mod get`) |

## Local Development / Demo

Clone the repo and run the included example site:

```shell
git clone git@github.com:adurrr/wavecast.git
cd wavecast/exampleSite
hugo server --port 1313
```

Open your browser to the URL shown in the server output (e.g. `http://localhost:1313/wavecast/`). The first demo player uses a local `.wav` file so it works immediately with no external dependencies.

## Verify Installation

After installing, check that the shortcode is recognized:

```shell
cd wavecast/exampleSite
hugo server --port 1313
```

Create a test page and add a podcast-player shortcode. If the player renders, you're all set.

{{< admonition type="note" >}}
Seeing `errorf` messages about the shortcode not being found? Make sure your `hugo.toml` has `theme = "wavecast"` (theme) or `[module.imports]` (module) configured correctly.
{{< /admonition >}}
