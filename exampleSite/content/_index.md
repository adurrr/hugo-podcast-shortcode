---
title: "Wavecast Radio"
---

<section class="hero">
  <h1>Wavecast Radio</h1>
  <p class="tagline">Tune in to Tech</p>
  <p>Your destination for the best conversations about software engineering, cybersecurity, AI, cloud infrastructure, and open source. Every show is powered by <a href="https://github.com/adurrr/wavecast" target="_blank" rel="noopener" style="color:var(--accent)">Wavecast</a> — the persistent podcast-player Web Component for Hugo.</p>
  <div class="nav-buttons">
    <a href="{{< relref "programs/" >}}" class="nav-button nav-button-primary">Browse Programs</a>
    <a href="{{< relref "schedule/" >}}" class="nav-button">Schedule</a>
  </div>
</section>

{{< podcast-player
  src="https://aphid.fireside.fm/d/1437767933/b44de5fa-47c1-4e94-bf9e-c72f8d1c8f5d/8e63b44a-1634-4422-907c-4b96173a0fbd.mp3"
  title="Cloudflare's Sunil Pai — Code & Circuit"
  poster="https://picsum.photos/seed/featured-program/400/400"
  persistent="true"
  chapters="00:00:00-Intro,00:03:00-Cloudflare AI,00:10:00-Vibe Coding,00:18:00-Rust & Ruby,00:25:00-Platform Engineering,00:33:00-Wrap Up"
>}}

<div class="info-card">
  <p><strong>Notice the player at the bottom of the page?</strong> That's Wavecast's sticky footer player. It follows you across all pages, stays in sync with every episode, and remembers your position, volume, and speed. Try navigating between shows while audio is playing.</p>
</div>

<section class="demo-section">
  <h2>Our Programs</h2>
  <p class="desc">Four shows covering the technology topics that matter.</p>

  <div class="program-grid">
    <a href="{{< relref "programs/code-and-circuit" >}}" class="program-card">
      <div class="program-card-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </div>
      <h3>Code &amp; Circuit</h3>
      <p>AI, cloud infrastructure, and the craft of software development.</p>
      <span class="program-card-episodes">2 episodes</span>
    </a>

    <a href="{{< relref "programs/security-brief" >}}" class="program-card">
      <div class="program-card-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <h3>The Security Brief</h3>
      <p>Cybersecurity stories, threat analysis, and defense strategies.</p>
      <span class="program-card-episodes">2 episodes</span>
    </a>

    <a href="{{< relref "programs/open-source-spotlight" >}}" class="program-card">
      <div class="program-card-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
      </div>
      <h3>Open Source Spotlight</h3>
      <p>Projects, communities, and the people building open source.</p>
      <span class="program-card-episodes">2 episodes</span>
    </a>

    <a href="{{< relref "programs/deploy-friday" >}}" class="program-card">
      <div class="program-card-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      </div>
      <h3>Deploy Friday</h3>
      <p>DevOps, SRE, platform engineering, and production stories.</p>
      <span class="program-card-episodes">2 episodes</span>
    </a>
  </div>
</section>

<section class="demo-section">
  <h2>Latest Episodes</h2>
  <p class="desc">Recently aired episodes across all programs.</p>

  <div class="episode-list">
    <div class="episode-list-item">
      <span class="badge">Code &amp; Circuit</span>
      <a href="{{< relref "episodes/cr-620-cloudflare-sunil-pai" >}}">Cloudflare's Sunil Pai</a>
    </div>
    <div class="episode-list-item">
      <span class="badge">Deploy Friday</span>
      <a href="{{< relref "episodes/devsecops-99-ai-sre" >}}">AI SRE and the End of 3 AM On-Call</a>
    </div>
    <div class="episode-list-item">
      <span class="badge">The Security Brief</span>
      <a href="{{< relref "episodes/r2-19-democratizing-security" >}}">Democratizing Cybersecurity</a>
    </div>
    <div class="episode-list-item">
      <span class="badge">Open Source Spotlight</span>
      <a href="{{< relref "episodes/ossp-13-firefox" >}}">Firefox Site Isolation &amp; Open Source Roundup</a>
    </div>
  </div>
</section>

<section class="demo-section">
  <h2>About Wavecast</h2>
  <p class="desc">The technology behind the station.</p>
  <p>Wavecast Radio is a live demo of the <a href="https://github.com/adurrr/wavecast" target="_blank" rel="noopener">Wavecast</a> Hugo module/theme — a persistent <code>&lt;podcast-player&gt;</code> Web Component that survives page navigation without restarting audio. Every episode on this site is a real podcast embedded via a single Hugo shortcode. The persistent footer player follows you across pages, remembers your position, volume, and speed, and stays in sync with every inline player.</p>
  <p style="margin-top:1rem">This demo uses real episodes from <a href="https://coder.show" target="_blank" rel="noopener">Coder Radio</a>, <a href="https://www.reality2cast.com/" target="_blank" rel="noopener">Reality 2.0</a>, <a href="https://devsecops.fm/" target="_blank" rel="noopener">DevSecOps Talks</a>, and the <a href="https://opensourcesystempodcast.vf.io/" target="_blank" rel="noopener">Open Source System Podcast</a> — all excellent tech podcasts well worth subscribing to.</p>
</section>
