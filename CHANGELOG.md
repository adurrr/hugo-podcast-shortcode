# Changelog

All notable changes to Wavecast are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Demo GIF to README showing persistent player across page navigation
- Scripts for capturing and generating demo GIF (`scripts/capture-demo.mjs`, `scripts/make-gif.py`)
- Favicon and browser assets (SVG, ICO, PNG sizes, Apple touch icon, Android Chrome icons, webmanifest)
- Theme-color meta tags for light and dark color schemes
- `CHANGELOG.md` with Keep a Changelog format

### Changed

- Replaced emoji with Feather/Lucide SVG icons in inline player skip and mute buttons

## [1.1.0] - 2026-05-31

### Changed

- Updated theme.toml tags for Hugo theme gallery: `podcast`, `radio`, `music`, `responsive`, `dark`, `dark mode`

### Added

- Hugo theme gallery screenshots (`images/screenshot.png`, `images/tn.png`)
- README badges (release, license, tests, GitHub stars)
- `demosite` field in theme.toml

### Fixed

- Em dashes replaced with hyphens in theme.toml

## [1.0.0] - 2026-05-31

### Added

- Project renamed from `hugo-podcast-shortcode` to `wavecast`
- `theme.toml` for Hugo theme gallery submission
- Social preview image for GitHub
- README rewritten for dual module + theme usage

### Changed

- Em dashes (—) replaced with hyphens in README, example site, and templates
- Module path changed to `github.com/adurrr/wavecast`

## [0.x] - hugo-podcast-shortcode (pre-rename)

> **Note:** Versions before 1.0.0 were released under the name `hugo-podcast-shortcode`.

### Added

- `<podcast-player>` Web Component with full audio controls (play/pause, skip, seek, volume, rate)
- `<podcast-footer>` sticky footer player with radio-t style layout
- Bidirectional sync between inline and footer players
- Single-stream enforcement (one audio source at a time)
- Cross-page persistence via `sessionStorage` (Turbolinks 5, Turbo, htmx)
- Source adapters: local files, AzuraCast, iVoox
- Chapters support with timestamp-labelled navigation chips
- Poster and description slots
- CSS custom properties for theming (light/dark)
- Keyboard shortcuts (Space, arrows, M)
- Media Session API integration
- Source-fenced `podcast-seek` event for progress sync
- `::part()` selectors for external Shadow DOM styling
- Accessibility: ARIA labels, `:focus-visible` rings, landmark roles

### Fixed

- Cross-page ghost audio playback
- Autoplay on page return (paused state saved on disconnect)
- Progress seek filter by source to prevent cross-player leaks
- Play button centered with inline SVG
- Subpath-aware baseURL handling in CI and E2E tests
- webServer timeout in CI

---

[Unreleased]: https://github.com/adurrr/wavecast/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/adurrr/wavecast/releases/tag/v1.1.0
[1.0.0]: https://github.com/adurrr/wavecast/releases/tag/v1.0.0
