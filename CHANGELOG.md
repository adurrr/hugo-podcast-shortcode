# Changelog

All notable changes to Wavecast are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- Documentation clarifies that a navigation framework (htmx / Turbo /
  Turbolinks) is required for `<podcast-footer>` persistence. The previous
  "sessionStorage fallback" wording was misleading — state is restored on
  the next page, but the footer DOM element itself is destroyed on every
  full-page navigation when no framework is loaded.

### Added

- One-time console log on init indicating which persistence adapter is
  active (helps diagnose "footer disappears on navigation" issue).
- Footer player horizontally scrolls long episode titles when they overflow,
  with a `prefers-reduced-motion: reduce` fallback to ellipsis (#63).
- `url` shortcode parameter on `podcast-player` controls the footer
  source link: a URL makes the label clickable, `"none"` hides it,
  omitted auto-derives from the audio source (#64).

## [1.3.0] - 2026-06-16

### Added

- Linux Matter program to example site (Linux, open source, desktop focus) with 2 episodes
- S1E3 episodes for all four existing programs (Code & Circuit, Security Brief, Open Source Spotlight, Deploy Friday)
- Wednesday schedule slot for Linux Matter, refreshed upcoming episodes

### Changed

- Example site programs grid expanded to 5 cards, episode counts bumped to 3
- Demo GIF replaced: 7 frames showcasing persistent player across page navigation, inline player in action, and light/dark mode (142 KB)
- Updated demo alt text in README to describe expanded content

### Fixed

- Broken audio sources across 8 episodes: no-CORS SoundHelix URLs and 404 fabricated URLs replaced with verified Fireside.fm audio (CORS-enabled, HTTP 200)
- YAML colon-parsing errors in show_notes lists across all new episode front matter
- Future-dated episodes now render without `--buildFuture` flag

### Previous (v1.2.x backport)

- Language tags added to all 40+ fenced code blocks across 7 docs pages (EN and ES), enabling Chroma syntax highlighting
- Code blocks styled with 0.9rem padding and 3px left accent border (Hextra/Docusaurus pattern)
- Class-based highlighting (`noClasses = false`) with bundled `syntax.css` for light/dark theme-compatible token colors
- Light mode readability: Monokai string colors overridden from yellow to dark gold, operator highlights reset to inherit
- Copy-to-clipboard button always visible (opacity 0.6) with Turbolinks/Turbo event listeners for SPA survival
- Fixed missing closing brace in `addCopyButtons()` that silently broke all copy functionality
- Docs page weights changed to descending order, listing reversed to reading order (Installation first)
- Duplicate TOC tables removed from docs index pages

## [1.2.0] - 2026-06-02

### Added

- Bidirectional real-time sync of mute, volume, playback rate, and chapter seek between inline player and footer via new `podcast-state-change` event (#25, #28)
- `podcast-seek` event dispatched from skip (rewind/forward) and chapter-click buttons so footer tracks all position changes
- Updated demo GIF showing new sync features (8 frames, SVG icons, volume/speed sync)

### Changed

- Updated demo capture script (`scripts/capture-demo.mjs`) for new site structure, port 1311, and `/wavecast/` subpath
- Updated GIF generation script (`scripts/make-gif.py`) with new captions matching updated demo flow

### Fixed

- Speed change on inline player no longer accidentally mutes footer audio (volume/mute defaults now read from UI rather than silenced `<audio>` when footer is active)
- Double-audio prevention: inline `_setVolume`, `_toggleMute`, `_cycleRate`, and keyboard volume handlers now skip modifying the inline `<audio>` when a footer is producing audible output
- Event echo loop prevented with `_suppressSync` guard flag on both inline player and footer

## [1.1.0] - 2026-05-31

### Added

- Demo GIF to README showing persistent player across page navigation
- Scripts for capturing and generating demo GIF (`scripts/capture-demo.mjs`, `scripts/make-gif.py`)
- Favicon and browser assets (SVG, ICO, PNG sizes, Apple touch icon, Android Chrome icons, webmanifest)
- Theme-color meta tags for light and dark color schemes
- `CHANGELOG.md` with Keep a Changelog format
- Hugo theme gallery screenshots (`images/screenshot.png`, `images/tn.png`)
- README badges (release, license, tests, GitHub stars)
- `demosite` field in theme.toml

### Changed

- Replaced emoji with Feather/Lucide SVG icons in inline player skip and mute buttons
- Updated theme.toml tags for Hugo theme gallery: `podcast`, `radio`, `music`, `responsive`, `dark`, `dark mode`

### Fixed

- Em dashes replaced with hyphens in theme.toml

## [1.0.0] - 2026-05-31

### Added

- Project renamed from `hugo-podcast-shortcode` to `wavecast`
- `theme.toml` for Hugo theme gallery submission
- Social preview image for GitHub
- README rewritten for dual module + theme usage

### Changed

- Em dashes replaced with hyphens in README, example site, and templates
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

[Unreleased]: https://github.com/adurrr/wavecast/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/adurrr/wavecast/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/adurrr/wavecast/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/adurrr/wavecast/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/adurrr/wavecast/releases/tag/v1.0.0
