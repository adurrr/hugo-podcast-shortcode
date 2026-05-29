/**
 * <podcast-player> — Custom Web Component for podcast/radio audio playback.
 *
 * Attributes (all reflect observed props):
 *   src        — Audio source URL (required at runtime)
 *   title      — Episode title
 *   poster     — Cover image URL
 *   type       — MIME type of audio
 *   chapters   — Comma-separated "HH:MM:SS-Label" pairs
 *   persistent — Boolean attribute; hints the page framework to keep this
 *                element alive across navigations
 *   autoplay   — Boolean attribute
 *
 * Slots:
 *   description — Rendered Markdown description from the shortcode
 *
 * Events emitted (bubbles):
 *   player-state  — { paused, src, currentTime, duration }
 *   podcast-play  — { src, title, url }  (compat with radio-t style controllers)
 *
 * @element podcast-player
 */

/* ------------------------------------------------------------------ */
/*  Source Adapters (inlined to avoid ES module import issues          */
/*  when Hugo serves the file via resources.Get without js.Build)      */
/* ------------------------------------------------------------------ */

/**
 * Detect the source type from a URL string.
 * @param {string} url
 * @returns {"local"|"azuracast"|"ivoox"}
 */
export function detectSourceType(url) {
  if (!url) return "local";
  if (/ivoox\.com/i.test(url)) return "ivoox";
  if (/azuracast/i.test(url) || /\.stream\./i.test(url)) return "azuracast";
  return "local";
}

/**
 * Create the appropriate SourceAdapter for a <podcast-player> element.
 * @param {HTMLElement} element
 * @returns {SourceAdapter}
 */
export function createSourceAdapter(element) {
  const type = element.getAttribute("data-source") || detectSourceType(
    element.getAttribute("src") || "",
  );
  switch (type) {
    case "azuracast": return new AzuracastAdapter(element);
    case "ivoox":     return new IvooxAdapter(element);
    default:          return new LocalAdapter(element);
  }
}

export class LocalAdapter {
  constructor(element) { this.element = element; }
  async resolve() {
    const src = this.element.getAttribute("src");
    if (!src) throw new Error("LocalAdapter: missing src attribute");
    return src;
  }
  async enrich() { return null; }
}

export class AzuracastAdapter {
  constructor(element) { this.element = element; }
  async resolve() {
    const src = this.element.getAttribute("src");
    if (src) return src;
    const apiUrl = this.element.getAttribute("azuracast-api-url");
    if (!apiUrl) throw new Error("AzuracastAdapter: missing azuracast-api-url attribute");
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`AzuracastAdapter: API error ${resp.status}`);
    const data = await resp.json();
    const listenUrl = data?.station?.listen_url;
    if (!listenUrl) throw new Error("AzuracastAdapter: no listen_url in API response");
    this._cachedData = data;
    return listenUrl;
  }
  async enrich() {
    if (!this._cachedData) return null;
    const np = this._cachedData.now_playing;
    if (!np?.song) return null;
    const meta = {};
    if (np.song.title) meta.title = np.song.title;
    if (np.song.artist) meta.artist = np.song.artist;
    return Object.keys(meta).length > 0 ? meta : null;
  }
}

export class IvooxAdapter {
  constructor(element) { this.element = element; }
  async resolve() {
    const src = this.element.getAttribute("src");
    if (!/ivoox\.com/i.test(src)) return src;
    try {
      const resp = await fetch(src);
      if (!resp.ok) return src;
      const html = await resp.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const ogAudio = doc.querySelector('meta[property="og:audio"]');
      if (ogAudio?.content) return ogAudio.content;
      const dataUrl = doc.querySelector("[data-audio-url]");
      if (dataUrl?.getAttribute("data-audio-url")) return dataUrl.getAttribute("data-audio-url");
      const audioSrc = doc.querySelector("audio source");
      if (audioSrc?.src) return audioSrc.src;
    } catch { /* fall through */ }
    return src;
  }
  async enrich() { return null; }
}

class PodcastPlayer extends HTMLElement {
  /** Attributes the component should react to. */
  static get observedAttributes() {
    return ["src", "title", "poster", "chapters", "type", "autoplay",
      "data-preload", "persistent", "data-source"];
  }

  /** Prefix for sessionStorage state key (instance ID appended). */
  static get PERSISTENCE_KEY() { return "podcastPlayerState"; }

  /** Minimum interval (ms) between throttled sessionStorage writes. */
  static get SAVE_INTERVAL_MS() { return 30000; }

  /** Staleness threshold (seconds) — discard saved position older than this. */
  static get STATE_TTL_SECONDS() { return 3600; }

  constructor() {
    super();
    /** @type {ShadowRoot} */
    this._shadow = this.attachShadow({ mode: "open" });
    /** @type {HTMLAudioElement} */
    this._audio = new Audio();
    this._audio.preload = "metadata";

    // Internal state
    /** @type {Array<{time: number, label: string}>} */
    this._chapters = [];
    /** @type {number} */
    this._currentChapterIndex = -1;
    /** @type {string|null} detected navigation adapter */
    this._persistenceAdapter = null;
    /** @type {boolean} idempotency guard for _persistenceSetup */
    this._persistenceActive = false;
    /** @type {object|null} deferred restore state, applied on loadedmetadata */
    this._pendingRestoreState = null;

    // Bind handlers so we can add/remove them
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onLoadedMetadata = this._onLoadedMetadata.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onPause = this._onPause.bind(this);
    this._onEnded = this._onEnded.bind(this);
    this._onError = this._onError.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onBeforeUnload = this._onBeforeUnload.bind(this);
  }

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  connectedCallback() {
    this._render();
    this._bindAudioEvents();
    this._bindUIEvents();
    document.addEventListener("keydown", this._onKeyDown);
    this._applyAttributes();

    // Phase 4: persistence — only when the persistent attribute is present
    if (this.hasAttribute("persistent")) {
      this._persistenceSetup();
    }
  }

  disconnectedCallback() {
    // Save state before we lose the audio context
    if (this._persistenceActive) {
      this._savePlaybackState();
    }
    this._unbindAudioEvents();
    this._teardownPersistence();
    document.removeEventListener("keydown", this._onKeyDown);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    switch (name) {
      case "src":
        this._applySrc(newVal);
        break;
      case "title":
        this._updateTitle(newVal);
        break;
      case "poster":
        this._updatePoster(newVal);
        break;
      case "chapters":
        this._parseChapters(newVal);
        break;
      case "type":
        // stored for internal use when setting source
        break;
      case "autoplay":
        this._audio.autoplay = newVal !== null;
        break;
      case "data-preload":
        this._audio.preload = newVal || "metadata";
        break;
      case "persistent":
        if (newVal !== null && this.isConnected) {
          this._persistenceSetup();
        } else if (newVal === null) {
          this._teardownPersistence();
        }
        break;
      case "data-source":
        if (this.isConnected) {
          const src = this.getAttribute("src");
          if (src) this._applySrc(src);
        }
        break;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Shadow DOM template                                                */
  /* ------------------------------------------------------------------ */

  _render() {
    this._shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
          --pp-primary: var(--podcast-player-primary, #6366f1);
          --pp-bg: var(--podcast-player-bg, #1e1e2e);
          --pp-surface: var(--podcast-player-surface, #2a2a3e);
          --pp-text: var(--podcast-player-text, #e0e0e0);
          --pp-text-muted: var(--podcast-player-text-muted, #888);
          --pp-radius: var(--podcast-player-radius, 12px);
          --pp-accent: var(--podcast-player-accent, #a78bfa);
          background: var(--pp-bg);
          color: var(--pp-text);
          border-radius: var(--pp-radius);
          padding: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,.25);
          transition: background .2s;
        }
        .player      { display: flex; flex-direction: column; gap: 12px; }
        .header      { display: flex; gap: 14px; align-items: flex-start; }
        .poster      { width: 64px; height: 64px; border-radius: 8px;
                        object-fit: cover; flex-shrink: 0; background: var(--pp-surface); }
        .info        { flex: 1; min-width: 0; }
        .title       { font-weight: 600; font-size: 1rem; margin: 0 0 4px;
                        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        ::slotted([slot="description"]) { font-size: .85rem; color: var(--pp-text-muted);
                                          margin: 0; line-height: 1.4;
                                          display: -webkit-box;
                                          -webkit-line-clamp: 2;
                                          -webkit-box-orient: vertical;
                                          overflow: hidden; }
        .controls    { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .btn         { background: var(--pp-surface); border: none; color: var(--pp-text);
                        width: 36px; height: 36px; border-radius: 50%;
                        cursor: pointer; display: inline-flex; align-items: center;
                        justify-content: center; font-size: 1.1rem;
                        transition: background .15s, transform .1s; }
        .btn:hover   { background: var(--pp-primary); color: #fff; }
        .btn:active  { transform: scale(.92); }
        .btn-play    { width: 44px; height: 44px; font-size: 1.3rem;
                        background: var(--pp-primary); color: #fff; }
        .btn-play:hover { background: var(--pp-accent); }
        .progress-wrap { flex: 1; min-width: 100px; position: relative; }
        input[type="range"] { -webkit-appearance: none; appearance: none;
                               width: 100%; height: 5px; border-radius: 3px;
                               background: var(--pp-surface); outline: none;
                               cursor: pointer; margin: 0; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--pp-primary); border: 2px solid var(--pp-bg);
          cursor: pointer; transition: transform .1s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type="range"]::-moz-range-thumb { width: 14px; height: 14px;
          border-radius: 50%; background: var(--pp-primary); border: 2px solid var(--pp-bg);
          cursor: pointer; }
        .time        { font-size: .8rem; font-variant-numeric: tabular-nums;
                        color: var(--pp-text-muted); white-space: nowrap; }
        .extras      { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .vol-wrap    { display: flex; align-items: center; gap: 4px; width: 90px; }
        .vol-wrap .btn { width: 28px; height: 28px; font-size: .85rem; }
        .rate-btn    { font-size: .75rem; font-weight: 600; width: auto;
                        height: 28px; border-radius: 14px; padding: 0 10px; }
        .chapters    { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
        .chapter-chip { font-size: .75rem; padding: 2px 8px; border-radius: 10px;
                         background: var(--pp-surface); color: var(--pp-text-muted);
                         cursor: pointer; border: none; transition: background .15s; }
        .chapter-chip:hover { background: var(--pp-primary); color: #fff; }
        .chapter-chip.active { background: var(--pp-primary); color: #fff; }
        .error-msg   { color: #f87171; font-size: .8rem; padding: 4px 0; }
        [hidden]     { display: none !important; }
      </style>
      <div class="player" part="player">
        <div class="header">
          <img class="poster" part="poster" src="" alt="Cover" hidden>
          <div class="info">
            <p class="title" part="title"></p>
            <slot name="description"></slot>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-skip-back"  part="skip-back-btn"
                  title="Rewind 15s" aria-label="Rewind 15 seconds">⏪</button>
          <button class="btn btn-play" part="play-btn"
                  title="Play" aria-label="Play">▶</button>
          <button class="btn btn-skip-fwd"  part="skip-fwd-btn"
                  title="Forward 15s" aria-label="Forward 15 seconds">⏩</button>
          <div class="progress-wrap">
            <input type="range" class="progress" part="progress"
                   min="0" max="100" value="0"
                   aria-label="Seek position">
          </div>
          <span class="time time-current" part="time-current">--:--</span>
          <span class="time time-sep">/</span>
          <span class="time time-duration" part="time-duration">--:--</span>
        </div>
        <div class="extras">
          <div class="vol-wrap">
            <button class="btn btn-mute" part="mute-btn"
                    title="Mute" aria-label="Toggle mute">🔊</button>
            <input type="range" class="volume" part="volume"
                   min="0" max="1" step="0.05" value="1"
                   aria-label="Volume">
          </div>
          <button class="btn rate-btn" part="rate-btn"
                  title="Playback speed" aria-label="Playback speed">1×</button>
          <div class="chapters" part="chapters" hidden></div>
        </div>
        <div class="error-msg" part="error" hidden></div>
      </div>
    `;

    // Cache DOM refs
    this._els = {
      poster:       this._shadow.querySelector(".poster"),
      title:        this._shadow.querySelector(".title"),
      playBtn:      this._shadow.querySelector(".btn-play"),
      skipBack:     this._shadow.querySelector(".btn-skip-back"),
      skipFwd:      this._shadow.querySelector(".btn-skip-fwd"),
      progress:     this._shadow.querySelector(".progress"),
      timeCurrent:  this._shadow.querySelector(".time-current"),
      timeDuration: this._shadow.querySelector(".time-duration"),
      volume:       this._shadow.querySelector(".volume"),
      muteBtn:      this._shadow.querySelector(".btn-mute"),
      rateBtn:      this._shadow.querySelector(".rate-btn"),
      chapters:     this._shadow.querySelector(".chapters"),
      error:        this._shadow.querySelector(".error-msg"),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Audio event binding                                                */
  /* ------------------------------------------------------------------ */

  _bindAudioEvents() {
    this._audio.addEventListener("timeupdate", this._onTimeUpdate);
    this._audio.addEventListener("loadedmetadata", this._onLoadedMetadata);
    this._audio.addEventListener("play", this._onPlay);
    this._audio.addEventListener("pause", this._onPause);
    this._audio.addEventListener("ended", this._onEnded);
    this._audio.addEventListener("error", this._onError);
  }

  _unbindAudioEvents() {
    this._audio.removeEventListener("timeupdate", this._onTimeUpdate);
    this._audio.removeEventListener("loadedmetadata", this._onLoadedMetadata);
    this._audio.removeEventListener("play", this._onPlay);
    this._audio.removeEventListener("pause", this._onPause);
    this._audio.removeEventListener("ended", this._onEnded);
    this._audio.removeEventListener("error", this._onError);
  }

  /* ------------------------------------------------------------------ */
  /*  UI event binding                                                   */
  /* ------------------------------------------------------------------ */

  _bindUIEvents() {
    this._els.playBtn.addEventListener("click", () => this._togglePlay());
    this._els.skipBack.addEventListener("click", () => this._skip(-15));
    this._els.skipFwd.addEventListener("click", () => this._skip(15));
    this._els.progress.addEventListener("input", () => this._seek());
    this._els.volume.addEventListener("input", () => this._setVolume());
    this._els.muteBtn.addEventListener("click", () => this._toggleMute());
    this._els.rateBtn.addEventListener("click", () => this._cycleRate());
    // Chapter clicks — delegated
    this._els.chapters.addEventListener("click", (e) => {
      const chip = e.target.closest(".chapter-chip");
      if (chip) {
        const idx = parseInt(chip.dataset.index, 10);
        this._seekToChapter(idx);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Attribute handling                                                 */
  /* ------------------------------------------------------------------ */

  _applyAttributes() {
    const src = this.getAttribute("src");
    if (src) this._applySrc(src);

    const title = this.getAttribute("title");
    if (title) this._updateTitle(title);

    const poster = this.getAttribute("poster");
    if (poster) this._updatePoster(poster);

    const chapters = this.getAttribute("chapters");
    if (chapters) this._parseChapters(chapters);

    const preload = this.getAttribute("data-preload") || "metadata";
    this._audio.preload = preload;
    this._audio.autoplay = this.hasAttribute("autoplay");
  }

  _applySrc(src) {
    if (!src) return;

    const dataSource = this.getAttribute("data-source");
    const sourceType = dataSource || detectSourceType(src);

    if (sourceType !== "local") {
      this._resolveAdapterSource();
      return;
    }

    this._setAudioSrc(src);
  }

  /** Directly assign a URL to the internal <audio> element. */
  _setAudioSrc(src, { updateAttribute = true } = {}) {
    const wasPlaying = !this._audio.paused;
    this._audio.src = src;
    this._audio.load();
    if (wasPlaying) {
      this._audio.play()?.catch(() => {});
    }
    if (updateAttribute && this.getAttribute("src") !== src) {
      this.setAttribute("src", src);
    }
  }

  /** Create the appropriate source adapter and resolve the real audio URL. */
  async _resolveAdapterSource() {
    const adapter = createSourceAdapter(this);
    try {
      const resolved = await adapter.resolve();
      this._setAudioSrc(resolved, { updateAttribute: false });
      await adapter.enrich();
    } catch (err) {
      this._showError(err.message);
    }
  }

  _showError(msg) {
    this._els.error.textContent = msg;
    this._els.error.hidden = false;
  }

  _updateTitle(val) {
    this._els.title.textContent = val || "";
  }

  _updatePoster(val) {
    if (val) {
      this._els.poster.src = val;
      this._els.poster.hidden = false;
    } else {
      this._els.poster.src = "";
      this._els.poster.hidden = true;
    }
  }

  _parseChapters(val) {
    this._chapters = [];
    this._els.chapters.innerHTML = "";
    if (!val) {
      this._els.chapters.hidden = true;
      return;
    }
    const parts = val.split(",");
    for (const p of parts) {
      const m = p.match(/^(\d{2}):(\d{2}):(\d{2})-(.+)/);
      if (!m) continue;
      const seconds = parseInt(m[1], 10) * 3600
                    + parseInt(m[2], 10) * 60
                    + parseInt(m[3], 10);
      this._chapters.push({ time: seconds, label: m[4].trim() });
    }
    if (this._chapters.length === 0) {
      this._els.chapters.hidden = true;
      return;
    }
    this._els.chapters.hidden = false;
    this._chapters.forEach((ch, i) => {
      const chip = document.createElement("button");
      chip.className = "chapter-chip";
      chip.dataset.index = i;
      chip.textContent = ch.label;
      chip.title = this._fmtTime(ch.time);
      chip.setAttribute("aria-label", `Seek to chapter: ${ch.label}`);
      this._els.chapters.appendChild(chip);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Playback controls                                                  */
  /* ------------------------------------------------------------------ */

  /** Toggle play/pause. */
  _togglePlay() {
    if (this._audio.paused) {
      this._audio.play()?.catch(() => {});
    } else {
      this._audio.pause();
    }
  }

  /** Skip relative seconds (negative = backward). */
  _skip(sec) {
    this._audio.currentTime = Math.max(0, Math.min(
      this._audio.currentTime + sec,
      this._audio.duration || 0,
    ));
  }

  /** Seek to the position set on the progress slider. */
  _seek() {
    if (!this._audio.duration) return;
    const pct = parseFloat(this._els.progress.value) / 100;
    this._audio.currentTime = pct * this._audio.duration;
  }

  /** Seek to a chapter by index. */
  _seekToChapter(index) {
    const ch = this._chapters[index];
    if (!ch) return;
    this._audio.currentTime = ch.time;
    // Update active chip
    this._els.chapters.querySelectorAll(".chapter-chip").forEach((chip, i) => {
      chip.classList.toggle("active", i === index);
    });
    this._currentChapterIndex = index;
    // Auto-play if paused
    if (this._audio.paused) {
      this._audio.play()?.catch(() => {});
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Volume                                                             */
  /* ------------------------------------------------------------------ */

  _setVolume() {
    const v = parseFloat(this._els.volume.value);
    this._audio.volume = v;
    this._audio.muted = false;
    this._updateMuteIcon(v);
  }

  _toggleMute() {
    this._audio.muted = !this._audio.muted;
    this._updateMuteIcon(this._audio.muted ? 0 : this._audio.volume);
  }

  _updateMuteIcon(vol) {
    if (this._audio.muted || vol === 0) {
      this._els.muteBtn.textContent = "🔇";
      this._els.volume.value = 0;
    } else if (vol < 0.5) {
      this._els.muteBtn.textContent = "🔉";
    } else {
      this._els.muteBtn.textContent = "🔊";
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Playback rate                                                      */
  /* ------------------------------------------------------------------ */

  _cycleRate() {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const current = this._audio.playbackRate;
    const idx = rates.indexOf(current);
    const next = rates[(idx + 1) % rates.length];
    this._audio.playbackRate = next;
    this._els.rateBtn.textContent = next + "×";
  }

  /* ------------------------------------------------------------------ */
  /*  Audio event handlers                                               */
  /* ------------------------------------------------------------------ */

  _onTimeUpdate() {
    if (!this._audio.duration) return;
    const pct = (this._audio.currentTime / this._audio.duration) * 100;
    this._els.progress.value = pct;
    this._els.progress.style.setProperty("--progress", pct + "%");
    this._els.timeCurrent.textContent = this._fmtTime(this._audio.currentTime);

    // Highlight active chapter
    this._updateActiveChapter();

    // Persistence: save state periodically (throttled to ~every 30 s)
    // so the restored position is reasonably fresh on full page reload.
    if (this.hasAttribute("persistent")) {
      this._savePlaybackStateThrottled();
    }
  }

  /** Throttled wrapper around _savePlaybackState — respects SAVE_INTERVAL_MS. */
  _savePlaybackStateThrottled() {
    const now = Date.now();
    if (this._lastSaveTs && (now - this._lastSaveTs) < PodcastPlayer.SAVE_INTERVAL_MS) return;
    this._lastSaveTs = now;
    this._savePlaybackState();
  }

  _onLoadedMetadata() {
    this._els.timeDuration.textContent = this._fmtTime(this._audio.duration);
    this._els.progress.max = "100";
    this._els.error.hidden = true;

    // Apply deferred position restore (saved in _restorePlaybackState)
    if (this._pendingRestoreState) {
      this._applyRestoredPosition(this._pendingRestoreState);
    }

    // Update Media Session metadata
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.getAttribute("title") || "Podcast",
        artist: "",
        album: "",
        artwork: this.getAttribute("poster")
          ? [{ src: this.getAttribute("poster"), sizes: "512x512", type: "image/jpeg" }]
          : [],
      });
    }
  }

  _onPlay() {
    this._els.playBtn.textContent = "⏸";
    this._els.playBtn.setAttribute("aria-label", "Pause");
    this._els.playBtn.title = "Pause";
    this._dispatchState();
    this._updateMediaSessionPlayback();

    // Persistence: save play state immediately
    if (this.hasAttribute("persistent")) {
      this._lastSaveTs = Date.now();
      this._savePlaybackState();
    }
  }

  _onPause() {
    this._els.playBtn.textContent = "▶";
    this._els.playBtn.setAttribute("aria-label", "Play");
    this._els.playBtn.title = "Play";
    this._dispatchState();
    this._updateMediaSessionPlayback();

    // Persistence: save pause state immediately
    if (this.hasAttribute("persistent")) {
      this._lastSaveTs = Date.now();
      this._savePlaybackState();
    }
  }

  _onEnded() {
    this._onPause();
    this._audio.currentTime = 0;
    this._els.progress.value = 0;
  }

  _onError() {
    const err = this._audio.error;
    let msg = "Playback error";
    if (err && err.message) msg += ": " + err.message;
    else if (this._audio.networkState === this._audio.NETWORK_NO_SOURCE) {
      msg = "No audio source available";
    }
    this._els.error.textContent = msg;
    this._els.error.hidden = false;
    this._dispatchState();
  }

  /* ------------------------------------------------------------------ */
  /*  Keyboard shortcuts                                                 */
  /* ------------------------------------------------------------------ */

  _onKeyDown(e) {
    // Only respond when this player is the relevant audio context
    // (space should not interfere with other page elements)
    if (e.target.closest("input, textarea, [contenteditable]")) return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        this._togglePlay();
        break;
      case "ArrowLeft":
        e.preventDefault();
        this._skip(-15);
        break;
      case "ArrowRight":
        e.preventDefault();
        this._skip(15);
        break;
      case "ArrowUp":
        e.preventDefault();
        this._audio.volume = Math.min(1, this._audio.volume + 0.1);
        this._updateMuteIcon(this._audio.volume);
        break;
      case "ArrowDown":
        e.preventDefault();
        this._audio.volume = Math.max(0, this._audio.volume - 0.1);
        this._updateMuteIcon(this._audio.volume);
        break;
      case "KeyM":
        e.preventDefault();
        this._toggleMute();
        break;
    }
  }

  /* ================================================================== */
  /*  Phase 4 — Persistence Layer                                        */
  /* ================================================================== */
  //
  // Two-tier strategy:
  //   1. DOM persistence via framework-specific markers
  //      (Turbolinks data-turbolinks-permanent, Turbo data-turbo-permanent,
  //       htmx hx-preserve + stable ID)
  //   2. State persistence via sessionStorage as a vanilla safety net
  //      (saves on beforeunload, restores on next connectedCallback)

  /** Per-instance sessionStorage key derived from src or id. */
  _persistenceKey() {
    const tag = this.getAttribute("src") || this.id || "player";
    return PodcastPlayer.PERSISTENCE_KEY + ":" + tag;
  }

  /**
   * Enable persistence for this player instance.
   * Called from connectedCallback when persistent attribute is present.
   */
  _persistenceSetup() {
    // Idempotency guard — avoid double-setup from attributeChangedCallback
    if (this._persistenceActive) return;
    this._persistenceActive = true;

    // 1. Generate a stable ID if none exists (required by htmx hx-preserve).
    //    If another player on the page already has the same derived ID, append
    //    a counter to avoid collisions.
    if (!this.id) {
      const base = "pp-" + (this.getAttribute("src") || "player")
          .replace(/[^a-zA-Z0-9_-]/g, "")
          .slice(0, 32) || "pp-player";
      this.id = base;
      // Resolve collisions: if we're in the DOM and another element already
      // owns this ID, append a counter until we find a free one.
      if (this.isConnected) {
        let counter = 2;
        while (this.ownerDocument.getElementById(this.id) !== null &&
               this.ownerDocument.getElementById(this.id) !== this) {
          this.id = base + "-" + counter++;
        }
      }
    }

    // 2. Sprinkle framework-specific DOM markers so the element survives
    //    partial page swaps (these are no-ops if the library isn't loaded).
    this.setAttribute("data-turbolinks-permanent", "");
    this.setAttribute("data-turbo-permanent", "");
    this.setAttribute("hx-preserve", "true");

    // 3. Detect which navigation library is available (for logging / debugging)
    if (window.Turbolinks) {
      this._persistenceAdapter = "turbolinks";
    } else if (window.Turbo) {
      this._persistenceAdapter = "turbo";
    } else if (window.htmx) {
      this._persistenceAdapter = "htmx";
    } else {
      this._persistenceAdapter = "vanilla";
    }

    // 4. Vanilla safety net — save state before the page unloads
    window.addEventListener("beforeunload", this._onBeforeUnload);

    // 5. Attempt to restore any previously saved playback state
    this._restorePlaybackState();
  }

  /** Tear down persistence listeners. Called from disconnectedCallback. */
  _teardownPersistence() {
    this._persistenceActive = false;
    this._pendingRestoreState = null;
    window.removeEventListener("beforeunload", this._onBeforeUnload);
  }

  /**
   * beforeunload handler — persists the full player state to sessionStorage
   * so it can be restored on the next page view.
   */
  _onBeforeUnload() {
    this._savePlaybackState();
  }

  /**
   * Serialize the player's current state into sessionStorage.
   * Called automatically on beforeunload; also called periodically from
   * play/pause/timeupdate so the saved position is always current.
   */
  _savePlaybackState() {
    try {
      const state = {
        src:          this._audio.src || this.getAttribute("src") || "",
        currentTime:  this._audio.currentTime,
        paused:       this._audio.paused,
        volume:       this._audio.volume,
        muted:        this._audio.muted,
        playbackRate: this._audio.playbackRate,
        timestamp:    Date.now(),
        title:        this.getAttribute("title") || "",
        poster:       this.getAttribute("poster") || "",
      };
      sessionStorage.setItem(this._persistenceKey(), JSON.stringify(state));
    } catch (_) {
      // sessionStorage may be unavailable (private browsing, quota, etc.)
    }
  }

  /**
   * Restore a previously saved playback state from sessionStorage.
   *
   * Rules:
   *   • Only restores if the saved `src` matches the current element's `src`
   *     (prevents restoring a different episode's position).
   *   • Restores volume, mute, playback rate unconditionally.
   *   • Only restores position if the save is less than 1 hour old
   *     (stale positions are discarded).
   *   • Clears the saved state after restoring (one-shot).
   */
  /** Compare two URLs by their absolute form. */
  _urlsMatch(a, b) {
    try {
      return new URL(a, document.baseURI).href === new URL(b, document.baseURI).href;
    } catch {
      return a === b;
    }
  }

  _restorePlaybackState() {
    try {
      const raw = sessionStorage.getItem(this._persistenceKey());
      if (!raw) return;
      const state = JSON.parse(raw);
      sessionStorage.removeItem(this._persistenceKey());

      // Restore audio properties eagerly (safe regardless of src or metadata)
      if (state.volume != null)        this._audio.volume = state.volume;
      if (state.muted != null)         this._audio.muted = state.muted;
      if (state.playbackRate != null)  this._audio.playbackRate = state.playbackRate;

      // Update UI immediately for volume/rate
      this._els.volume.value = this._audio.muted ? 0 : this._audio.volume;
      this._updateMuteIcon(this._audio.muted ? 0 : this._audio.volume);
      this._els.rateBtn.textContent = this._audio.playbackRate + "\u00d7";

      // Verify src matches (exact URL comparison) — if different, skip position
      const currentSrc = this.getAttribute("src");
      if (currentSrc && state.src && !this._urlsMatch(state.src, currentSrc)) {
        return;
      }

      // Defer position + autoplay to loadedmetadata (where duration is known)
      this._pendingRestoreState = state;
    } catch (_) {
      // Ignore parse / storage errors
    }
  }

  /**
   * Apply deferred position restore once metadata is loaded.
   * Called from _onLoadedMetadata when _pendingRestoreState is set.
   */
  _applyRestoredPosition(state) {
    this._pendingRestoreState = null;

    // Restore display attributes if the element doesn't already have them
    if (!this.getAttribute("title") && state.title) {
      this._updateTitle(state.title);
      this.setAttribute("title", state.title);
    }
    if (!this.getAttribute("poster") && state.poster) {
      this._updatePoster(state.poster);
      this.setAttribute("poster", state.poster);
    }

    // Position restore with staleness guard
    const elapsed = (state.timestamp != null)
      ? (Date.now() - state.timestamp) / 1000
      : Infinity;

    if (elapsed < PodcastPlayer.STATE_TTL_SECONDS
        && state.currentTime != null
        && state.currentTime > 0) {
      // Only estimate forward if the audio was actively playing
      let targetTime = state.currentTime;
      if (!state.paused) {
        targetTime = Math.min(
          state.currentTime + elapsed,
          this._audio.duration || Infinity,
        );
      }
      if (targetTime < (this._audio.duration || Infinity)) {
        this._audio.currentTime = targetTime;
      }
      // else: episode likely ended — don't restore position
    }

    // Resume playback if it was active (browser may block — update UI on catch)
    if (!state.paused) {
      this._audio.play()?.catch(() => {
        this._onPause();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  /** Format seconds to HH:MM:SS or MM:SS. */
  _fmtTime(t) {
    if (!t || !isFinite(t)) return "--:--";
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const pad = (n) => String(n).padStart(2, "0");
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${m}:${pad(s)}`;
  }

  /** Highlight the currently playing chapter. */
  _updateActiveChapter() {
    const t = this._audio.currentTime;
    let activeIdx = -1;
    for (let i = this._chapters.length - 1; i >= 0; i--) {
      if (t >= this._chapters[i].time) { activeIdx = i; break; }
    }
    if (activeIdx !== this._currentChapterIndex) {
      this._currentChapterIndex = activeIdx;
      this._els.chapters.querySelectorAll(".chapter-chip").forEach((chip, i) => {
        chip.classList.toggle("active", i === activeIdx);
      });
    }
  }

  /** Dispatch a player-state custom event. */
  _dispatchState() {
    this.dispatchEvent(new CustomEvent("player-state", {
      bubbles: true,
      detail: {
        paused: this._audio.paused,
        src: this._audio.src,
        currentTime: this._audio.currentTime,
        duration: this._audio.duration,
      },
    }));
  }

  /** Update Media Session action handlers. */
  _updateMediaSessionPlayback() {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = this._audio.paused ? "paused" : "playing";
    navigator.mediaSession.setActionHandler("play", () => this._audio.play());
    navigator.mediaSession.setActionHandler("pause", () => this._audio.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => this._skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => this._skip(15));
  }
}

// -----------------------------------------------------------------------
// Registration
// -----------------------------------------------------------------------
if (!customElements.get("podcast-player")) {
  customElements.define("podcast-player", PodcastPlayer);
}

export default PodcastPlayer;
