---
title: "Podcast Player Demo"
---

<section class="hero">
  <h1>Hugo Podcast Shortcode</h1>
  <p>A reusable <strong>&lt;podcast-player&gt;</strong> Web Component for Hugo — persistent audio playback with chapter navigation, poster support, and full accessibility. Drop it into any post with a single shortcode.</p>
  <div class="nav-buttons" style="margin-top:1rem">
    <a href="{{< relref "posts/test-episode.md" >}}" class="nav-button">📻 Test Episode</a>
    <a href="{{< relref "posts/second-episode.md" >}}" class="nav-button">▶️ Second Episode</a>
    <a href="https://github.com/adurrr/hugo-podcast-shortcode" class="nav-button" target="_blank" rel="noopener">📖 GitHub</a>
  </div>
</section>

<section class="demo-section">
  <h2>📻 Basic Player</h2>
  <p class="desc">Minimal usage — just a <code>src</code> and <code>title</code>. This example uses a local <code>.wav</code> asset served from <code>assets/demo/</code>.</p>
  <div class="demo-player">
    <div class="player-wrapper">
      {{< podcast-player
        src="demo/demo-audio.wav"
        title="Demo: 440Hz Sine Tone"
      >}}
    </div>
  </div>
  <div class="demo-code">
    <code>&#123;&#123;&lt; podcast-player
  src="demo/demo-audio.wav"
  title="Demo: 440Hz Sine Tone"
&gt;&#125;&#125;</code>
  </div>
</section>

<section class="demo-section">
  <h2>🎵 Player with Poster</h2>
  <p class="desc">Show an album-art poster alongside the controls.</p>
  <div class="demo-player">
    <div class="player-wrapper">
      {{< podcast-player
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        title="SoundHelix: Chilled Beats"
        poster="https://picsum.photos/seed/player1/400/400"
      >}}
    </div>
  </div>
  <div class="demo-code">
    <code>&#123;&#123;&lt; podcast-player
  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  title="SoundHelix: Chilled Beats"
  poster="https://picsum.photos/seed/player1/400/400"
&gt;&#125;&#125;</code>
  </div>
</section>

<section class="demo-section">
  <h2>📖 Player with Chapters</h2>
  <p class="desc">Add timestamp-labelled chapters for easy navigation.</p>
  <div class="demo-player">
    <div class="player-wrapper">
      {{< podcast-player
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        title="SoundHelix: Long Mix"
        poster="https://picsum.photos/seed/player2/400/400"
        chapters="00:00:00-Intro,00:00:45-Buildup,00:02:15-Main Theme,00:04:00-Bridge,00:05:30-Climax,00:06:45-Outro"
        persistent="true"
      >}}
    </div>
  </div>
  <div class="demo-code">
    <code>&#123;&#123;&lt; podcast-player
  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  title="SoundHelix: Long Mix"
  poster="https://picsum.photos/seed/player2/400/400"
  chapters="00:00:00-Intro,00:00:45-Buildup,00:02:15-Main Theme,00:04:00-Bridge,00:05:30-Climax,00:06:45-Outro"
  persistent="true"
&gt;&#125;&#125;</code>
  </div>
</section>

<section class="demo-section">
  <h2>💾 Persistence Demo</h2>
  <p class="desc">Toggle <code>persistent="true"</code> — the player saves your position, volume, mute, and playback speed to <code>sessionStorage</code>. Navigate between pages and resume where you left off. Try it on these two instances of the same audio:</p>

  <div class="demo-player">
    <h3 style="font-size:1rem;margin-bottom:0.5rem">🔁 Player A (with persistence)</h3>
    <div class="player-wrapper">
      {{< podcast-player
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        title="SoundHelix: Persistent Player"
        persistent="true"
      >}}
    </div>
  </div>
  <div class="demo-code" style="margin-bottom:1rem">
    <code>&#123;&#123;&lt; podcast-player src="…" title="SoundHelix: Persistent Player" persistent="true" &gt;&#125;&#125;</code>
  </div>

  <div class="demo-player">
    <h3 style="font-size:1rem;margin-bottom:0.5rem">🔁 Player B (no persistence)</h3>
    <div class="player-wrapper">
      {{< podcast-player
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        title="SoundHelix: Non-Persistent"
        persistent="false"
      >}}
    </div>
  </div>
  <div class="demo-code">
    <code>&#123;&#123;&lt; podcast-player src="…" title="SoundHelix: Non-Persistent" &gt;&#125;&#125;</code>
  </div>
  <p class="desc" style="margin-top:0.75rem;font-size:0.85rem">💡 Play some of Player A, then <a href="{{< relref "posts/second-episode.md" >}}">navigate to the second page</a> and come back — your position, volume, mute, and speed are remembered. Player B always starts fresh. You can also try navigating between <a href="{{< relref "posts/test-episode.md" >}}">Test Episode</a> and <a href="{{< relref "posts/second-episode.md" >}}">Second Episode</a>.</p>
</section>

<section class="demo-section">
  <h2>🎨 Theming</h2>
  <p class="desc">Click the <strong>🌙 Dark / ☀️ Light</strong> toggle in the header to switch between built-in themes. The player responds to <code>data-theme</code> on <code>&lt;html&gt;</code>. You can also customise every visual aspect with <a href="https://github.com/adurrr/hugo-podcast-shortcode#css-custom-properties" target="_blank" rel="noopener">CSS custom properties</a> — primary colour, background, radius, progress height, and more.</p>
  <div class="demo-player">
    <div class="player-wrapper">
      {{< podcast-player
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
        title="SoundHelix: Theme Demo"
      >}}
    </div>
  </div>
</section>

<section class="demo-section">
  <h2>📋 All Shortcode Parameters</h2>
  <p class="desc">These can be passed per-invocation or set globally in <code>hugo.toml</code> under <code>[params.podcastPlayer]</code>:</p>

  <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
    <thead>
      <tr style="border-bottom:2px solid var(--border);text-align:left">
        <th style="padding:0.5rem 0.75rem">Param</th>
        <th style="padding:0.5rem 0.75rem">Default</th>
        <th style="padding:0.5rem 0.75rem">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>src</code></td><td style="padding:0.5rem 0.75rem">—</td><td style="padding:0.5rem 0.75rem">Audio URL or local resource path</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>title</code></td><td style="padding:0.5rem 0.75rem">—</td><td style="padding:0.5rem 0.75rem">Episode title (required for a11y)</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>type</code></td><td style="padding:0.5rem 0.75rem"><code>local</code></td><td style="padding:0.5rem 0.75rem">Source type: <code>local</code>, <code>azuracast</code>, <code>ivoox</code></td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>persistent</code></td><td style="padding:0.5rem 0.75rem"><code>false</code></td><td style="padding:0.5rem 0.75rem">Save/resume playback in sessionStorage</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>preload</code></td><td style="padding:0.5rem 0.75rem"><code>metadata</code></td><td style="padding:0.5rem 0.75rem">HTML5 <code>&lt;audio&gt;</code> preload hint</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>autoplay</code></td><td style="padding:0.5rem 0.75rem"><code>false</code></td><td style="padding:0.5rem 0.75rem">Start playing on page load</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>rate</code></td><td style="padding:0.5rem 0.75rem"><code>1</code></td><td style="padding:0.5rem 0.75rem">Playback speed multiplier</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>poster</code></td><td style="padding:0.5rem 0.75rem">—</td><td style="padding:0.5rem 0.75rem">Cover image URL</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:0.5rem 0.75rem"><code>chapters</code></td><td style="padding:0.5rem 0.75rem">—</td><td style="padding:0.5rem 0.75rem">Comma-separated <code>time-label</code> list</td></tr>
      <tr><td style="padding:0.5rem 0.75rem"><code>description</code></td><td style="padding:0.5rem 0.75rem">—</td><td style="padding:0.5rem 0.75rem">Rich text description (supports Markdown)</td></tr>
    </tbody>
  </table>
</section>

<section class="demo-section">
  <h2>🔗 Demo Pages</h2>
  <ul class="link-list">
    <li><a href="{{< relref "/" >}}">Home</a> — this page (all demo variations)</li>
    <li><a href="{{< relref "posts/test-episode.md" >}}">Test Episode</a> — basic player + player with chapters and poster</li>
    <li><a href="{{< relref "posts/second-episode.md" >}}">Second Episode</a> — player with persistence enabled for cross-page testing</li>
    <li><a href="https://github.com/adurrr/hugo-podcast-shortcode" target="_blank" rel="noopener">GitHub Repository</a> — source code, issues, contributing</li>
    <li><a href="https://github.com/adurrr/hugo-podcast-shortcode#readme" target="_blank" rel="noopener">README</a> — full documentation, install guide, all CSS custom properties and <code>::part()</code> selectors</li>
    <li><a href="https://github.com/adurrr/hugo-podcast-shortcode?tab=readme-ov-file#keyboard-shortcuts" target="_blank" rel="noopener">Keyboard Shortcuts</a> — Space, arrows, M, and more</li>
  </ul>
</section>
