---
title: "Contact"
---

<section class="hero">
  <h1>Contact Us</h1>
  <p>Have a question, suggestion, or want to be a guest on one of our shows? We'd love to hear from you.</p>
</section>

<section class="demo-section">
  <div class="demo-player">
    <h3 style="margin-bottom:1rem">Get in Touch</h3>

    <form style="display:flex;flex-direction:column;gap:1rem;max-width:500px" onsubmit="event.preventDefault();alert('Thank you for your message! (This is a demo form — no data is sent.)')">
      <div>
        <label for="name" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Name</label>
        <input type="text" id="name" placeholder="Your name" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem">
      </div>

      <div>
        <label for="email" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Email</label>
        <input type="email" id="email" placeholder="you@example.com" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem">
      </div>

      <div>
        <label for="message" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Message</label>
        <textarea id="message" rows="5" placeholder="Your message" style="width:100%;padding:0.5rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem;resize:vertical"></textarea>
      </div>

      <button type="submit" class="nav-button nav-button-primary" style="align-self:flex-start;border:none;font-size:0.9rem">Send Message</button>
    </form>
  </div>
</section>

<section class="demo-section">
  <h2>Other Ways to Reach Us</h2>
  <ul class="link-list">
    <li><strong>GitHub</strong> — <a href="https://github.com/adurrr/wavecast" target="_blank" rel="noopener">github.com/adurrr/wavecast</a> (source code, issues, PRs)</li>
    <li><strong>Documentation</strong> — <a href="https://github.com/adurrr/wavecast#readme" target="_blank" rel="noopener">full README</a> with installation, theming, and API reference</li>
  </ul>
</section>

<div class="nav-buttons">
  <a href="{{< relref "/" >}}" class="nav-button">← Back to Home</a>
  <a href="{{< relref "programs/" >}}" class="nav-button nav-button-primary">Browse Programs</a>
</div>
