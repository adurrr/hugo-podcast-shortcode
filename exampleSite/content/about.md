---
title: "About"
---

<section class="hero">
  <h1>About Wavecast Radio</h1>
  <p>Tune in to Tech.</p>
</section>

<section class="demo-section">
  <p>Wavecast Radio is a demo site for <a href="https://github.com/adurrr/wavecast" target="_blank" rel="noopener">Wavecast</a> — a persistent <code>&lt;podcast-player&gt;</code> Web Component built for Hugo. The site showcases what a real radio station built with Wavecast looks like: professional program pages, episode listings with chapters and posters, and — most importantly — audio that never stops, even as you navigate between pages.</p>
</section>

<section class="demo-section">
  <h2>How It Works</h2>
  <p>The sticky footer player at the bottom of every page uses <code>data-turbolinks-permanent</code> to survive page navigation. When you start an episode and click through to other pages, the audio keeps playing uninterrupted. The footer syncs bidirectionally with every inline player on the page — pausing one pauses both.</p>
  <p style="margin-top:0.75rem">Key features demonstrated on this site:</p>
  <ul class="link-list">
    <li><strong>Persistent audio</strong> — navigate between pages without restarting</li>
    <li><strong>Bidirectional sync</strong> — inline and footer players stay in sync</li>
    <li><strong>Chapters</strong> — timestamp-labelled navigation within episodes</li>
    <li><strong>Session storage</strong> — remembers position, volume, and speed</li>
    <li><strong>Dark/light mode</strong> — toggle themes in the header</li>
    <li><strong>Multiple sources</strong> — works with local audio, remote MP3s, and streaming</li>
  </ul>
</section>

<section class="demo-section">
  <h2>The Tech Stack</h2>
  <ul class="link-list">
    <li><strong>Hugo</strong> — static site generation (v0.158+)</li>
    <li><strong>Web Components</strong> — vanilla JS custom elements with Shadow DOM</li>
    <li><strong>Turbolinks 5</strong> — fast navigation with permanent element support</li>
    <li><strong>sessionStorage</strong> — cross-page state persistence</li>
    <li><strong>Playwright</strong> — end-to-end testing (21 tests)</li>
    <li><strong>Vitest</strong> — JavaScript unit testing (80 tests)</li>
  </ul>
</section>

<section class="demo-section">
  <h2>Real Podcasts, Real Audio</h2>
  <p>The episodes on this site are real tech podcasts, used with attribution. We are grateful to:</p>
  <ul class="link-list">
    <li><a href="https://coder.show" target="_blank" rel="noopener">Coder Radio</a> — programming and developer culture (Jupiter Broadcasting)</li>
    <li><a href="https://www.reality2cast.com/" target="_blank" rel="noopener">Reality 2.0</a> — open source and technology conversations</li>
    <li><a href="https://devsecops.fm/" target="_blank" rel="noopener">DevSecOps Talks</a> — DevOps, security, and SRE</li>
    <li><a href="https://opensourcesystempodcast.vf.io/" target="_blank" rel="noopener">Open Source System Podcast</a> — open source project highlights</li>
  </ul>
</section>

<div class="nav-buttons">
  <a href="{{< relref "programs/" >}}" class="nav-button nav-button-primary">Browse Programs</a>
  <a href="{{< relref "contact/" >}}" class="nav-button">Contact</a>
</div>
