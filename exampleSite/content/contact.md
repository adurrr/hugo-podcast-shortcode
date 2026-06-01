---
title: "Contact"
---

Have a question, suggestion, or want to be a guest on one of our shows? We'd love to hear from you.

<div class="demo-player">
  <div class="info-card" style="margin-bottom:1rem;background:var(--pp-surface);border:none">
    <p style="font-size:0.85rem;margin:0;color:var(--text-muted)">
      <strong>Note:</strong> This is a demo site. The form below is for demonstration only and does not send real messages. For real contact, open an issue or discussion on <a href="https://github.com/adurrr/wavecast" target="_blank" rel="noopener">GitHub</a>.
    </p>
  </div>
  <h3 style="margin-bottom:1rem">Get in Touch</h3>
  <form style="display:flex;flex-direction:column;gap:1rem;max-width:500px" onsubmit="event.preventDefault();this.innerHTML='<div class=info-card style=text-align:center><p><strong>Message received!</strong></p><p style=font-size:0.85rem;color:var(--text-muted)>This is a demo form. No data was sent. For real inquiries, please visit our <a href=https://github.com/adurrr/wavecast>GitHub repository</a>.</p></div>'" novalidate>
    <div>
      <label for="name" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Name</label>
      <input type="text" id="name" placeholder="Your name" required style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem">
    </div>
    <div>
      <label for="email" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Email</label>
      <input type="email" id="email" placeholder="you@example.com" required style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem">
    </div>
    <div>
      <label for="message" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Message</label>
      <textarea id="message" rows="5" placeholder="Your message" required style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem;resize:vertical"></textarea>
    </div>
    <button type="submit" class="nav-button nav-button-primary" style="align-self:flex-start;border:none;font-size:0.9rem">Send Message</button>
  </form>
</div>

## Other Ways to Reach Us

- [**GitHub**](https://github.com/adurrr/wavecast) :  source code, issues, feature requests, and pull requests
- [**README**](https://github.com/adurrr/wavecast#readme) :  full documentation with installation, theming, and API reference
