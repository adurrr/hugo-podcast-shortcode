/**
 * Tests for the PodcastPlayer Web Component.
 *
 * Runs in jsdom — audio features are partially mocked (play/pause events
 * must be dispatched manually since jsdom doesn't implement them).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Import registers the custom element as a side-effect
// and gives us the class for static property access.
import PodcastPlayer from "../../assets/js/podcast-player.js";

describe("PodcastPlayer Web Component", () => {
  /** @type {HTMLElement} */
  let el;

  beforeEach(() => {
    // Remove any leftover instances
    document.querySelectorAll("podcast-player").forEach((e) => e.remove());
    el = document.createElement("podcast-player");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  /* ------------------------------------------------------------------ */
  /*  Registration & Rendering                                           */
  /* ------------------------------------------------------------------ */

  it("should be registered as a custom element", () => {
    expect(customElements.get("podcast-player")).toBeDefined();
  });

  it("should have an open shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
    expect(el.shadowRoot.mode).toBe("open");
  });

  it("should render the player UI inside shadow DOM", () => {
    expect(el.shadowRoot.querySelector(".player")).not.toBeNull();
    expect(el.shadowRoot.querySelector(".btn-play")).not.toBeNull();
    expect(el.shadowRoot.querySelector(".progress")).not.toBeNull();
    expect(el.shadowRoot.querySelector(".volume")).not.toBeNull();
    expect(el.shadowRoot.querySelector(".rate-btn")).not.toBeNull();
  });

  /* ------------------------------------------------------------------ */
  /*  Attribute handling                                                 */
  /* ------------------------------------------------------------------ */

  it("should apply src attribute to internal audio element", () => {
    el.setAttribute("src", "https://example.com/audio.mp3");
    expect(el._audio).toBeDefined();
    expect(el._audio.src).toContain("example.com/audio.mp3");
  });

  it("should update title display when title attribute changes", () => {
    el.setAttribute("title", "Episode 42: Test");
    const titleEl = el.shadowRoot.querySelector(".title");
    expect(titleEl.textContent).toBe("Episode 42: Test");
  });

  it("should show poster image when poster attribute is set", () => {
    el.setAttribute("poster", "https://example.com/cover.jpg");
    const posterImg = el.shadowRoot.querySelector(".poster");
    expect(posterImg.hidden).toBe(false);
    expect(posterImg.src).toContain("example.com/cover.jpg");
  });

  it("should hide poster when poster attribute is empty", () => {
    el.setAttribute("poster", "");
    const posterImg = el.shadowRoot.querySelector(".poster");
    expect(posterImg.hidden).toBe(true);
  });

  it("should parse chapters attribute into chapter data", () => {
    el.setAttribute("chapters", "00:00:00-Intro,00:05:30-News,00:15:00-Main");
    expect(el._chapters).toHaveLength(3);
    expect(el._chapters[0]).toEqual({ time: 0, label: "Intro" });
    expect(el._chapters[1]).toEqual({ time: 330, label: "News" });
    expect(el._chapters[2]).toEqual({ time: 900, label: "Main" });
  });

  it("should render chapter chips when chapters attribute is present", () => {
    el.setAttribute("chapters", "00:00:00-Intro,00:05:30-News");
    const chips = el.shadowRoot.querySelectorAll(".chapter-chip");
    expect(chips).toHaveLength(2);
    expect(chips[0].textContent).toBe("Intro");
    expect(chips[1].textContent).toBe("News");
  });

  it("should hide chapters container when no chapters", () => {
    const container = el.shadowRoot.querySelector(".chapters");
    expect(container.hidden).toBe(true);
  });

  it("should set audio preload from data-preload attribute", () => {
    el.setAttribute("data-preload", "none");
    expect(el._audio.preload).toBe("none");
    el.setAttribute("data-preload", "auto");
    expect(el._audio.preload).toBe("auto");
  });

  it("should set audio autoplay when autoplay attribute is present", () => {
    el.setAttribute("autoplay", "");
    expect(el._audio.autoplay).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /*  Play/Pause controls                                                */
  /* ------------------------------------------------------------------ */

  it("should toggle play button icon on play/pause events", () => {
    const playBtn = el.shadowRoot.querySelector(".btn-play");
    expect(playBtn.getAttribute("aria-label")).toBe("Play");

    // Simulate play event on the internal audio
    el._audio.dispatchEvent(new Event("play"));
    expect(playBtn.getAttribute("aria-label")).toBe("Pause");

    // Simulate pause event
    el._audio.dispatchEvent(new Event("pause"));
    expect(playBtn.getAttribute("aria-label")).toBe("Play");
  });

  it("should call _togglePlay when play button is clicked", () => {
    const spy = vi.spyOn(el, "_togglePlay");
    el.shadowRoot.querySelector(".btn-play").click();
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("should skip backward on skip-back button click", () => {
    const spy = vi.spyOn(el, "_skip");
    el.shadowRoot.querySelector(".btn-skip-back").click();
    expect(spy).toHaveBeenCalledWith(-15);
    spy.mockRestore();
  });

  it("should skip forward on skip-fwd button click", () => {
    const spy = vi.spyOn(el, "_skip");
    el.shadowRoot.querySelector(".btn-skip-fwd").click();
    expect(spy).toHaveBeenCalledWith(15);
    spy.mockRestore();
  });

  /* ------------------------------------------------------------------ */
  /*  Volume                                                             */
  /* ------------------------------------------------------------------ */

  it("should update audio volume when volume slider changes", () => {
    const volSlider = el.shadowRoot.querySelector(".volume");
    volSlider.value = "0.5";
    volSlider.dispatchEvent(new Event("input"));
    expect(el._audio.volume).toBe(0.5);
  });

  it("should toggle mute when mute button is clicked", () => {
    const muteBtn = el.shadowRoot.querySelector(".btn-mute");
    el._audio.muted = false;
    muteBtn.click();
    expect(el._audio.muted).toBe(true);
    muteBtn.click();
    expect(el._audio.muted).toBe(false);
  });

  /* ------------------------------------------------------------------ */
  /*  Playback rate                                                      */
  /* ------------------------------------------------------------------ */

  it("should cycle through playback rates on rate button click", () => {
    el._audio.playbackRate = 1;
    const rateBtn = el.shadowRoot.querySelector(".rate-btn");
    rateBtn.click();
    expect(el._audio.playbackRate).toBe(1.25);
    expect(rateBtn.textContent).toBe("1.25×");
    rateBtn.click();
    expect(el._audio.playbackRate).toBe(1.5);
  });

  /* ------------------------------------------------------------------ */
  /*  Time formatting                                                    */
  /* ------------------------------------------------------------------ */

  it("should update time display on timeupdate event", () => {
    // Set a mock duration and dispatch timeupdate
    Object.defineProperty(el._audio, "duration", { value: 3661, configurable: true });
    Object.defineProperty(el._audio, "currentTime", { value: 125, configurable: true });
    el._audio.dispatchEvent(new Event("timeupdate"));

    const current = el.shadowRoot.querySelector(".time-current");
    expect(current.textContent).toBe("2:05");
  });

  it("should display duration on loadedmetadata", () => {
    Object.defineProperty(el._audio, "duration", { value: 3661, configurable: true });
    el._audio.dispatchEvent(new Event("loadedmetadata"));

    const duration = el.shadowRoot.querySelector(".time-duration");
    expect(duration.textContent).toBe("1:01:01");
  });

  it("should show --:-- for time when duration is NaN", () => {
    Object.defineProperty(el._audio, "duration", { value: NaN, configurable: true });
    el._audio.dispatchEvent(new Event("loadedmetadata"));

    const duration = el.shadowRoot.querySelector(".time-duration");
    expect(duration.textContent).toBe("--:--");
  });

  /* ------------------------------------------------------------------ */
  /*  Chapter seeking                                                    */
  /* ------------------------------------------------------------------ */

  it("should seek to chapter time when chapter chip is clicked", () => {
    el.setAttribute("chapters", "00:01:00-Chapter1,00:05:00-Chapter2");
    const chips = el.shadowRoot.querySelectorAll(".chapter-chip");

    // Set a duration so seeking works
    Object.defineProperty(el._audio, "duration", { value: 600, configurable: true });

    chips[1].click();
    expect(el._audio.currentTime).toBe(300);
  });

  it("should mark the active chapter chip", () => {
    el.setAttribute("chapters", "00:00:00-Intro,00:05:00-Mid,00:10:00-End");
    Object.defineProperty(el._audio, "duration", { value: 900, configurable: true });
    Object.defineProperty(el._audio, "currentTime", { value: 350, configurable: true });

    el._audio.dispatchEvent(new Event("timeupdate"));

    // At 5:50, "Mid" (starts at 5:00) is the active chapter
    const chips = el.shadowRoot.querySelectorAll(".chapter-chip");
    expect(chips[0].classList.contains("active")).toBe(false);
    expect(chips[1].classList.contains("active")).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /*  Error handling                                                     */
  /* ------------------------------------------------------------------ */

  it("should show error message on audio error event", () => {
    el._audio.dispatchEvent(new Event("error"));
    const errorEl = el.shadowRoot.querySelector(".error-msg");
    expect(errorEl.hidden).toBe(false);
    expect(errorEl.textContent.length).toBeGreaterThan(0);
  });

  /* ------------------------------------------------------------------ */
  /*  Keyboard shortcuts                                                 */
  /* ------------------------------------------------------------------ */

  it("should dispatch player-state custom event on play state change", () => {
    const handler = vi.fn();
    el.addEventListener("player-state", handler);

    // jsdom's HTMLAudioElement doesn't update `paused` on synthetic events,
    // so we mock the property before each dispatch.
    Object.defineProperty(el._audio, "paused", { value: false, configurable: true });
    el._audio.dispatchEvent(new Event("play"));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.paused).toBe(false);

    Object.defineProperty(el._audio, "paused", { value: true, configurable: true });
    el._audio.dispatchEvent(new Event("pause"));
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1][0].detail.paused).toBe(true);
  });

  /* ================================================================== */
  /*  Persistence (Phase 4)                                              */
  /* ================================================================== */

  describe("persistence", () => {
    beforeEach(() => {
      sessionStorage.clear();
      // Reset element to a clean state for each test
      // (the outer beforeEach creates a plain element without attributes)
    });

    it("should add framework DOM markers when persistent attribute is present", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      el.setAttribute("persistent", ""); // triggers _persistenceSetup()

      expect(el.hasAttribute("data-turbolinks-permanent")).toBe(true);
      expect(el.hasAttribute("data-turbo-permanent")).toBe(true);
      expect(el.getAttribute("hx-preserve")).toBe("true");
      expect(el.id).toMatch(/^pp-/);
    });

    it("should detect 'vanilla' adapter when no navigation library is present", () => {
      el.setAttribute("persistent", ""); // triggers _persistenceSetup()
      expect(el._persistenceAdapter).toBe("vanilla");
    });

    it("should save playback state to sessionStorage with per-instance key", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      el.setAttribute("persistent", ""); // triggers _persistenceSetup()
      el._audio.src = "https://example.com/a.mp3";
      el._savePlaybackState();

      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const raw = sessionStorage.getItem(key);
      expect(raw).not.toBeNull();
      const state = JSON.parse(raw);
      expect(state.src).toContain("example.com/a.mp3");
      expect(state.volume).toBe(1);
      expect(typeof state.timestamp).toBe("number");
    });

    it("should isolate state per instance with different sessionStorage keys", () => {
      // Save for one player
      el.setAttribute("src", "https://example.com/a.mp3");
      el.setAttribute("persistent", "");
      el._audio.src = "https://example.com/a.mp3";
      el._savePlaybackState();

      const keyA = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const keyB = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/b.mp3";
      expect(sessionStorage.getItem(keyA)).not.toBeNull();
      expect(sessionStorage.getItem(keyB)).toBeNull();
    });

    it("should restore volume and rate from saved state", () => {
      // Seed sessionStorage FIRST, then set attributes
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://example.com/a.mp3",
        currentTime: 120,
        paused: true,
        volume: 0.3,
        muted: true,
        playbackRate: 1.5,
        timestamp: Date.now(),
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", ""); // triggers _persistenceSetup() which reads storage

      expect(el._audio.volume).toBe(0.3);
      expect(el._audio.muted).toBe(true);
      expect(el._audio.playbackRate).toBe(1.5);
    });

    it("should still restore volume/rate even when src differs", () => {
      // Seed storage with DIFFERENT src
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://other.com/different.mp3",
        currentTime: 300,
        paused: true,
        volume: 0.3,
        muted: true,
        playbackRate: 1.5,
        timestamp: Date.now(),
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", ""); // triggers restore — different src but volume/rate restored

      expect(el._audio.volume).toBe(0.3);
      expect(el._audio.muted).toBe(true);
      expect(el._audio.playbackRate).toBe(1.5);
    });

    it("should NOT restore position for a different src", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://other.com/different.mp3",
        currentTime: 300,
        paused: true,
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now(),
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", "");

      // currentTime should NOT be 300 since src doesn't match
      expect(el._audio.currentTime).not.toBe(300);
    });

    it("should clear saved state after restoring", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://example.com/a.mp3",
        currentTime: 0,
        paused: true,
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now(),
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", "");

      expect(sessionStorage.getItem(key)).toBeNull();
    });

    it("should save state on beforeunload when persistent", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      el.setAttribute("persistent", "");
      el._audio.src = "https://example.com/a.mp3";

      // Simulate beforeunload
      window.dispatchEvent(new Event("beforeunload"));

      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const raw = sessionStorage.getItem(key);
      expect(raw).not.toBeNull();
    });

    it("should discard stale state older than STATE_TTL_SECONDS", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://example.com/a.mp3",
        currentTime: 120,
        paused: true,
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now() - 7200000, // 2 hours ago — beyond 1-hour TTL
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", ""); // saves _pendingRestoreState
      // Simulate loadedmetadata so _applyRestoredPosition runs
      Object.defineProperty(el._audio, "duration", { value: 600, configurable: true });
      el._audio.dispatchEvent(new Event("loadedmetadata"));

      expect(el._audio.currentTime).not.toBe(120);
    });

    it("should NOT estimate forward when audio was paused", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://example.com/a.mp3",
        currentTime: 120, // paused at 2:00
        paused: true, // was paused!
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now() - 300000, // 5 minutes ago
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", "");
      Object.defineProperty(el._audio, "duration", { value: 600, configurable: true });
      el._audio.dispatchEvent(new Event("loadedmetadata"));

      // Position should be exactly 120 (not 120+300=420 since it was paused)
      expect(el._audio.currentTime).toBe(120);
    });

    it("should estimate forward when audio was playing", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://example.com/a.mp3",
        currentTime: 60, // was at 1:00
        paused: false, // was playing!
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now() - 120000, // 2 minutes ago
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", "");
      Object.defineProperty(el._audio, "duration", { value: 600, configurable: true });
      el._audio.dispatchEvent(new Event("loadedmetadata"));

      // Position should be estimated: ~60 + 120 = ~180
      // (allow small floating-point drift from elapsed wall-clock time)
      expect(el._audio.currentTime).toBeCloseTo(180, 0);
    });

    it("should not apply restore before loadedmetadata fires", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      const key = PodcastPlayer.PERSISTENCE_KEY + ":https://example.com/a.mp3";
      const saved = {
        src: "https://example.com/a.mp3",
        currentTime: 120,
        paused: true,
        volume: 0.3,
        muted: true,
        playbackRate: 1.5,
        timestamp: Date.now(),
        title: "",
        poster: "",
      };
      sessionStorage.setItem(key, JSON.stringify(saved));

      el.setAttribute("persistent", ""); // triggers _restorePlaybackState → sets _pendingRestoreState

      // Pending state should exist but not yet applied
      expect(el._pendingRestoreState).not.toBeNull();

      // After loadedmetadata, it should be applied and cleared
      Object.defineProperty(el._audio, "duration", { value: 600, configurable: true });
      el._audio.dispatchEvent(new Event("loadedmetadata"));
      expect(el._pendingRestoreState).toBeNull();
    });

    it("should be idempotent — calling _persistenceSetup twice is a no-op", () => {
      el.setAttribute("src", "https://example.com/a.mp3");
      el.setAttribute("persistent", ""); // first call via attributeChangedCallback
      const idBefore = el.id;

      // Call again manually — should be a no-op
      el._persistenceSetup();
      expect(el.id).toBe(idBefore);
      expect(el._persistenceActive).toBe(true);
    });

    it("should generate unique IDs for same-src players", () => {
      // Create two fresh elements with same src
      const el1 = document.createElement("podcast-player");
      el1.setAttribute("src", "https://example.com/a.mp3");
      el1.setAttribute("persistent", "");
      document.body.appendChild(el1);

      const el2 = document.createElement("podcast-player");
      el2.setAttribute("src", "https://example.com/a.mp3");
      el2.setAttribute("persistent", "");
      document.body.appendChild(el2);

      expect(el1.id).not.toBe(el2.id);
      el1.remove();
      el2.remove();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  Bidirectional state sync (issue #25)                                */
  /* ------------------------------------------------------------------ */

  describe("podcast-state-change sync", () => {
    /** @type {HTMLElement} */
    let player;
    /** @type {HTMLElement} */
    let footer;

    beforeEach(() => {
      document.querySelectorAll("podcast-player, podcast-footer").forEach((e) => e.remove());
      player = document.createElement("podcast-player");
      footer = document.createElement("podcast-footer");
      document.body.appendChild(player);
      document.body.appendChild(footer);
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    it("should dispatch podcast-state-change from inline when volume changes", () => {
      const handler = vi.fn();
      document.addEventListener("podcast-state-change", handler);

      const volSlider = player.shadowRoot.querySelector(".volume");
      volSlider.value = "0.3";
      volSlider.dispatchEvent(new Event("input"));

      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.volume).toBe(0.3);
      expect(detail.muted).toBe(false);

      document.removeEventListener("podcast-state-change", handler);
    });

    it("should dispatch podcast-state-change from inline when mute toggled", () => {
      const handler = vi.fn();
      document.addEventListener("podcast-state-change", handler);

      player.shadowRoot.querySelector(".btn-mute").click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.muted).toBe(true);

      document.removeEventListener("podcast-state-change", handler);
    });

    it("should dispatch podcast-state-change from inline when rate changed", () => {
      player._audio.playbackRate = 1;
      const handler = vi.fn();
      document.addEventListener("podcast-state-change", handler);

      player.shadowRoot.querySelector(".rate-btn").click();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].detail.playbackRate).toBe(1.25);

      document.removeEventListener("podcast-state-change", handler);
    });

    it("should dispatch podcast-seek from inline when chapter clicked", () => {
      const handler = vi.fn();
      document.addEventListener("podcast-seek", handler);
      player.setAttribute("chapters", "00:05:00-Intro,00:30:00-Main");

      const chips = player.shadowRoot.querySelectorAll(".chapter-chip");
      expect(chips.length).toBe(2);
      chips[1].click(); // "Main" at 00:30:00

      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.currentTime).toBe(1800); // 30 min in seconds

      document.removeEventListener("podcast-seek", handler);
    });

    it("should dispatch podcast-seek from inline when skip (rewind/forward) used", () => {
      const handler = vi.fn();
      document.addEventListener("podcast-seek", handler);
      Object.defineProperty(player._audio, "duration", { value: 300, configurable: true });
      player._audio.currentTime = 50;

      // Click skip-forward button (15s forward)
      player.shadowRoot.querySelector(".btn-skip-fwd").click();

      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.currentTime).toBe(65);

      document.removeEventListener("podcast-seek", handler);
    });

    it("should NOT send silenced inline volume when changing rate with footer active", () => {
      // Simulate footer active — inline audio was silenced by _onPlay
      footer.setAttribute("active", "");
      // The inline audio is at volume=0 (silenced), but the UI shows volume=0.7
      player._audio.volume = 0;
      player._audio.muted = false;
      player._audio.playbackRate = 1;
      player.shadowRoot.querySelector(".volume").value = "0.7";

      const handler = vi.fn();
      document.addEventListener("podcast-state-change", handler);

      player.shadowRoot.querySelector(".rate-btn").click();

      expect(handler).toHaveBeenCalledTimes(1);
      const d = handler.mock.calls[0][0].detail;
      expect(d.playbackRate).toBe(1.25);
      // Volume MUST reflect the UI (0.7), NOT the silenced audio (0)
      expect(d.volume).toBe(0.7);
      expect(d.muted).toBe(false);

      document.removeEventListener("podcast-state-change", handler);
    });

    it("should NOT send silenced inline volume when changing rate (no footer)", () => {
      // No footer — audio should be the source of truth
      player._audio.volume = 0.9;
      player._audio.muted = false;
      player._audio.playbackRate = 1;

      const handler = vi.fn();
      document.addEventListener("podcast-state-change", handler);

      player.shadowRoot.querySelector(".rate-btn").click();

      expect(handler).toHaveBeenCalledTimes(1);
      const d = handler.mock.calls[0][0].detail;
      expect(d.volume).toBe(0.9); // reads from audio since no footer
      expect(d.muted).toBe(false);
      expect(d.playbackRate).toBe(1.25);

      document.removeEventListener("podcast-state-change", handler);
    });

    it("should apply inline mute/volume to footer audio", () => {
      // Set up footer with an active source
      footer._audio.src = "https://example.com/test.mp3";
      footer._els.volume.value = "1";
      footer.setAttribute("active", "");

      // Inline dispatches state change (mute with current volume)
      player.setAttribute("src", "https://example.com/test.mp3");
      player.dispatchEvent(
        new CustomEvent("podcast-state-change", {
          bubbles: true,
          composed: true,
          detail: {
            src: "https://example.com/test.mp3",
            volume: 0.8,
            muted: true,
            playbackRate: 1,
          },
        }),
      );

      // Footer should have applied the changes
      expect(footer._audio.muted).toBe(true);
      expect(footer._audio.volume).toBe(0.8);
    });

    it("should apply footer mute/volume/speed to footer audio from inline event", () => {
      footer._audio.src = "https://example.com/test.mp3";
      footer._els.volume.value = "1";
      footer.setAttribute("active", "");

      player.setAttribute("src", "https://example.com/test.mp3");
      player.dispatchEvent(
        new CustomEvent("podcast-state-change", {
          bubbles: true,
          composed: true,
          detail: {
            src: "https://example.com/test.mp3",
            volume: 0.5,
            muted: false,
            playbackRate: 1.5,
          },
        }),
      );

      expect(footer._audio.volume).toBe(0.5);
      expect(footer._audio.muted).toBe(false);
      expect(footer._audio.playbackRate).toBe(1.5);
    });

    it("should update inline UI when footer dispatches state change", () => {
      player.setAttribute("src", "https://example.com/test.mp3");
      player._audio.muted = false;
      player._audio.volume = 1;

      footer._audio.src = "https://example.com/test.mp3";
      footer.dispatchEvent(
        new CustomEvent("podcast-state-change", {
          bubbles: true,
          composed: true,
          detail: {
            src: "https://example.com/test.mp3",
            volume: 0.2,
            muted: false,
            playbackRate: 2,
          },
        }),
      );

      // Inline UI should reflect footer state
      expect(player.shadowRoot.querySelector(".volume").value).toBe("0.2");
      expect(player.shadowRoot.querySelector(".rate-btn").textContent).toContain("2");
    });

    it("should NOT apply footer state to inline when src differs", () => {
      footer._audio.src = "https://example.com/other-track.mp3";

      player.setAttribute("src", "https://example.com/track-a.mp3");
      player._audio.volume = 1;
      player._audio.muted = false;
      player._audio.playbackRate = 1;

      footer.dispatchEvent(
        new CustomEvent("podcast-state-change", {
          bubbles: true,
          composed: true,
          detail: {
            src: "https://example.com/track-b.mp3",
            volume: 0.1,
            muted: true,
            playbackRate: 2,
          },
        }),
      );

      // Inline state should NOT change
      expect(player._audio.volume).toBe(1);
      expect(player._audio.muted).toBe(false);
    });
  });

  /* ================================================================== */
  /*  Footer title marquee (issue #63)                                  */
  /* ================================================================== */

  describe("footer title marquee", () => {
    /** @type {HTMLElement} */
    let footer;
    /** @type {Array<FrameRequestCallback>} */
    let rafCallbacks;
    let origRaf;
    let origResizeObserver;
    /** ResizeObserver class captured so tests can assert the instance was created. */
    let ResizeObserverSpy;

    /** Flush any rAF callbacks queued via the mocked requestAnimationFrame. */
    const flushRaf = () => {
      const cbs = rafCallbacks.slice();
      rafCallbacks = [];
      cbs.forEach((cb) => cb(performance.now()));
    };

    beforeEach(() => {
      // Clean up any leftover footers from previous tests in this describe
      document.querySelectorAll("podcast-footer").forEach((e) => e.remove());

      // jsdom does not implement requestAnimationFrame; install a mock that
      // captures callbacks so tests can flush them deterministically.
      rafCallbacks = [];
      origRaf = globalThis.requestAnimationFrame;
      globalThis.requestAnimationFrame = /** @type {any} */ (
        (cb) => {
          rafCallbacks.push(cb);
          return rafCallbacks.length;
        }
      );

      // jsdom does not implement ResizeObserver. Install a spy class so we
      // can assert it was instantiated, and so the footer's code path runs.
      origResizeObserver = globalThis.ResizeObserver;
      ResizeObserverSpy = class {
        constructor() {}
        observe() {}
        unobserve() {}
        disconnect() {}
      };
      globalThis.ResizeObserver = /** @type {any} */ (ResizeObserverSpy);

      footer = document.createElement("podcast-footer");
      document.body.appendChild(footer);
    });

    afterEach(() => {
      footer.remove();
      globalThis.requestAnimationFrame = origRaf;
      if (origResizeObserver === undefined) {
        delete globalThis.ResizeObserver;
      } else {
        globalThis.ResizeObserver = origResizeObserver;
      }
    });

    it("renders an inner .title-text span nested inside .title", () => {
      const title = footer.shadowRoot.querySelector(".title");
      const titleText = footer.shadowRoot.querySelector(".title-text");
      expect(title).not.toBeNull();
      expect(titleText).not.toBeNull();
      // .title-text must be a child of .title
      expect(title.contains(titleText)).toBe(true);
    });

    it("caches _els.titleText as an HTMLSpanElement with class 'title-text'", () => {
      expect(footer._els).toBeDefined();
      expect(footer._els.titleText).not.toBeNull();
      expect(footer._els.titleText).toBeInstanceOf(HTMLSpanElement);
      expect(footer._els.titleText.classList.contains("title-text")).toBe(true);
    });

    it("writes the title into .title-text (not .title) on podcast-play", () => {
      // The footer listens for podcast-play on `document` (not the element
      // itself), so the event must be dispatched from `document` to reach
      // the handler. This matches how inline <podcast-player> elements
      // dispatch their play events in production.
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: { src: "https://example.com/x.mp3", title: "Hello World" },
        }),
      );

      // Inner span should hold the title text
      expect(footer._els.titleText.textContent).toBe("Hello World");
      // Parent .title's textContent concatenates descendants, so it must
      // also include the title (this is a DOM-text-content invariant, asserted
      // to document the nested structure).
      expect(footer._els.title.textContent).toContain("Hello World");
    });

    it("writes the restored title into .title-text via _restorePlaybackState", () => {
      // Clear storage and any prior state left from previous tests so we
      // start from a known-empty baseline.
      sessionStorage.removeItem("podcastPlayerState:footer");

      // Remove the outer-beforeEach footer BEFORE seeding storage; the
      // footer's `disconnectedCallback` saves its current state on remove,
      // which would otherwise overwrite the seeded state.
      footer.remove();
      footer = null;

      // Seed sessionStorage with the footer's PERSISTENCE_KEY before
      // instantiating so the new element picks it up in its connectedCallback.
      const saved = {
        src: "https://example.com/restored.mp3",
        currentTime: 5,
        paused: true,
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now(),
        title: "Restored Episode Title",
        poster: "",
      };
      const FOOTER_KEY = "podcastPlayerState:footer";
      sessionStorage.setItem(FOOTER_KEY, JSON.stringify(saved));

      // Sanity: the storage must be set before the new footer is appended.
      expect(sessionStorage.getItem(FOOTER_KEY)).not.toBeNull();

      // Create a fresh footer — its connectedCallback calls
      // _restorePlaybackState which should consume the seeded state.
      footer = document.createElement("podcast-footer");
      document.body.appendChild(footer);

      // The fresh element's connectedCallback should have consumed storage.
      expect(footer._els.titleText.textContent).toBe("Restored Episode Title");
      // The saved state must be cleared after restoration (one-shot).
      expect(sessionStorage.getItem(FOOTER_KEY)).toBeNull();
    });

    it("sets data-overflow and CSS vars when the inner text overflows", async () => {
      // Mock the dimensions BEFORE the measurement runs.
      Object.defineProperty(footer._els.title, "clientWidth", {
        configurable: true,
        value: 100,
      });
      Object.defineProperty(footer._els.titleText, "scrollWidth", {
        configurable: true,
        value: 200,
      });

      footer._setupTitleMarquee();
      // rAF is mocked; flush it.
      flushRaf();

      expect(footer._els.title.hasAttribute("data-overflow")).toBe(true);
      // overflow = 200 - 100 = 100
      expect(footer._els.title.style.getPropertyValue("--marquee-distance")).toBe("100px");
      // duration = Math.min(20, Math.max(6, 100 / 40)) = 6
      expect(footer._els.title.style.getPropertyValue("--marquee-duration")).toBe("6s");
    });

    it("does NOT set data-overflow when the inner text fits", () => {
      Object.defineProperty(footer._els.title, "clientWidth", {
        configurable: true,
        value: 200,
      });
      Object.defineProperty(footer._els.titleText, "scrollWidth", {
        configurable: true,
        value: 100,
      });

      footer._setupTitleMarquee();
      flushRaf();

      expect(footer._els.title.hasAttribute("data-overflow")).toBe(false);
      expect(footer._els.title.style.getPropertyValue("--marquee-distance")).toBe("");
      expect(footer._els.title.style.getPropertyValue("--marquee-duration")).toBe("");
    });

    it("re-measures after a new podcast-play event changes the title", () => {
      // Start with a fitting title (no overflow)
      Object.defineProperty(footer._els.title, "clientWidth", {
        configurable: true,
        value: 500,
      });
      Object.defineProperty(footer._els.titleText, "scrollWidth", {
        configurable: true,
        get() {
          return footer._els.titleText.textContent.length;
        },
      });
      // .title clientWidth is constant; .title-text scrollWidth scales with
      // text length under our mock.

      // Short title → fits
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: { src: "https://example.com/short.mp3", title: "Hi" },
        }),
      );
      flushRaf();
      expect(footer._els.title.hasAttribute("data-overflow")).toBe(false);

      // Long title → overflows (2 chars vs 500px width still fits, so make
      // it 600 chars to force overflow).
      const longTitle = "A".repeat(600);
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: { src: "https://example.com/long.mp3", title: longTitle },
        }),
      );
      flushRaf();
      expect(footer._els.title.hasAttribute("data-overflow")).toBe(true);

      // Back to a short title → overflow attribute removed.
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: { src: "https://example.com/short2.mp3", title: "Hi again" },
        }),
      );
      flushRaf();
      expect(footer._els.title.hasAttribute("data-overflow")).toBe(false);
    });

    it("declares a marquee animation in the shadow style block", () => {
      const css = footer.shadowRoot.querySelector("style").textContent;
      expect(css).toContain("animation: marquee");
      expect(css).toContain("@keyframes marquee");
      expect(css).toContain("prefers-reduced-motion");
    });

    it("disables the marquee animation under prefers-reduced-motion: reduce", () => {
      const css = footer.shadowRoot.querySelector("style").textContent;
      // The reduced-motion guard must exist as a media query AND must set
      // animation: none on the title-text child.
      expect(css).toContain("@media (prefers-reduced-motion: reduce)");
      // Look for the no-motion rule in the reduced-motion context. We
      // assert the substring "animation: none" appears within the
      // @media block by checking the larger combined string is present
      // (substring matching the closing of the media query is loose by
      // design — the test doesn't need to parse CSS).
      const idx = css.indexOf("@media (prefers-reduced-motion: reduce)");
      expect(idx).toBeGreaterThan(-1);
      const reducedBlock = css.slice(idx);
      expect(reducedBlock).toContain("animation: none");
    });

    it("creates a single ResizeObserver instance and reuses it", () => {
      // First call from connectedCallback already created one (mocked class).
      const first = footer._titleResizeObserver;
      expect(first).toBeInstanceOf(ResizeObserverSpy);

      // A second explicit call must NOT replace it.
      footer._setupTitleMarquee();
      const second = footer._titleResizeObserver;
      expect(second).toBe(first);
    });

    it("is a no-op when ResizeObserver is not supported", () => {
      // Re-create the footer with ResizeObserver unavailable.
      footer.remove();
      const savedRO = globalThis.ResizeObserver;
      // Mimic environments without ResizeObserver.
      // eslint-disable-next-line no-undef
      delete globalThis.ResizeObserver;

      footer = document.createElement("podcast-footer");
      document.body.appendChild(footer);

      // _setupTitleMarquee must not throw and must not set the field.
      expect(() => footer._setupTitleMarquee()).not.toThrow();
      expect(footer._titleResizeObserver).toBeUndefined();

      // Restore for the afterEach cleanup.
      globalThis.ResizeObserver = savedRO;
    });
  });

  /* ================================================================== */
  /*  Footer source link (issue #64)                                    */
  /* ================================================================== */

  describe("footer source link", () => {
    /** @type {HTMLElement} */
    let footer;
    /** @type {HTMLElement} */
    let player;

    beforeEach(() => {
      // Clean up any leftover footers / players from previous tests.
      document.querySelectorAll("podcast-footer, podcast-player").forEach((e) => e.remove());
      sessionStorage.clear();

      footer = document.createElement("podcast-footer");
      document.body.appendChild(footer);
    });

    afterEach(() => {
      document.querySelectorAll("podcast-footer, podcast-player").forEach((e) => e.remove());
      sessionStorage.clear();
    });

    /* ---------------------------------------------------------------- */
    /*  Inline player: _resolveUrl                                       */
    /* ---------------------------------------------------------------- */

    it("inline player: _resolveUrl returns 'none' for the sentinel (case-insensitive)", () => {
      player = document.createElement("podcast-player");
      document.body.appendChild(player);

      for (const v of ["none", "NONE", "None", "nOnE"]) {
        player.setAttribute("url", v);
        expect(player._resolveUrl()).toBe("none");
      }
    });

    it("inline player: _resolveUrl returns the resolved absolute URL for an explicit value", () => {
      player = document.createElement("podcast-player");
      document.body.appendChild(player);

      // Absolute URL is returned as-is.
      player.setAttribute("url", "https://example.com/episode");
      expect(player._resolveUrl()).toBe("https://example.com/episode");

      // A relative URL is resolved against document.baseURI.
      player.setAttribute("url", "/relative/path");
      expect(player._resolveUrl()).toBe(new URL("/relative/path", document.baseURI).href);
    });

    it("inline player: _resolveUrl auto-derives from audio src when url is absent", () => {
      player = document.createElement("podcast-player");
      document.body.appendChild(player);

      // src with a sub-path and filename — strips the filename, keeps the trailing slash.
      player.setAttribute("src", "https://example.com/episodes/foo.mp3");
      expect(player._resolveUrl()).toBe("https://example.com/episodes/");

      // src with a top-level filename — strips to the root.
      player.setAttribute("src", "https://example.com/foo.mp3");
      expect(player._resolveUrl()).toBe("https://example.com/");

      // src without a trailing slash — URL constructor normalizes to one, and
      // the implementation strips to that trailing slash.
      player.setAttribute("src", "https://example.com");
      expect(player._resolveUrl()).toBe("https://example.com/");
    });

    it("inline player: _resolveUrl rejects non-http(s) audio src schemes", () => {
      player = document.createElement("podcast-player");
      document.body.appendChild(player);

      // javascript: and data: schemes are explicitly not http(s), so the
      // auto-derived URL must be empty (callers treat "" as "hide the link").
      for (const bad of [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "ftp://example.com/foo.mp3",
      ]) {
        player.setAttribute("src", bad);
        expect(player._resolveUrl()).toBe("");
      }
    });

    it("inline player: explicit url attribute wins over auto-derivation", () => {
      player = document.createElement("podcast-player");
      document.body.appendChild(player);

      // Even though the audio src would auto-derive to the mp3's directory,
      // an explicit `url` attribute must take precedence.
      player.setAttribute("src", "https://example.com/episodes/foo.mp3");
      player.setAttribute("url", "https://example.com/custom-page");
      expect(player._resolveUrl()).toBe("https://example.com/custom-page");
    });

    /* ---------------------------------------------------------------- */
    /*  Footer: _setSourceLink                                           */
    /* ---------------------------------------------------------------- */

    it("footer: .source is rendered as an <a> element (not a <div>) in the shadow DOM", () => {
      // The implementation upgraded the original <div class="source"> to
      // <a class="source" href="" hidden> with part="source" preserved.
      const source = footer.shadowRoot.querySelector(".source");
      expect(source).not.toBeNull();
      expect(source.tagName).toBe("A");
    });

    it("footer: _setSourceLink shows the link with a valid http(s) URL", () => {
      // _setSourceLink only reveals the link when it already has visible
      // text content (so an empty link doesn't flash before any track
      // starts). Pre-populate the textContent to match the production
      // code path that dispatches a podcast-play event.
      footer._els.source.textContent = "example.com";

      footer._setSourceLink("https://example.com/page");

      // The URL is normalized through `new URL(...)` which canonicalizes
      // it (this URL already has a path, so no trailing-slash change).
      const expected = new URL("https://example.com/page", document.baseURI).href;
      expect(footer._els.source.hidden).toBe(false);
      expect(footer._els.source.getAttribute("href")).toBe(expected);
      // The accepted URL is cached for persistence round-trips.
      expect(footer._currentSourceUrl).toBe(expected);
      // The localized aria-label is applied when the link is revealed.
      expect(footer._els.source.getAttribute("aria-label")).toBe("View episode");
    });

    it("footer: _setSourceLink hides the link for 'none' (case-insensitive)", () => {
      // Set textContent first so the unhide path WOULD otherwise reveal
      // the link — this proves the "none" sentinel wins regardless.
      footer._els.source.textContent = "should not be shown";

      for (const v of ["none", "NONE", "None"]) {
        footer._setSourceLink(v);
        expect(footer._els.source.hidden).toBe(true);
        expect(footer._els.source.hasAttribute("href")).toBe(false);
        expect(footer._currentSourceUrl).toBe("");
      }
    });

    it("footer: _setSourceLink hides the link for an empty string", () => {
      // Even with textContent set, an empty string must hide the link.
      footer._els.source.textContent = "should not be shown";
      footer._setSourceLink("");

      expect(footer._els.source.hidden).toBe(true);
      expect(footer._els.source.hasAttribute("href")).toBe(false);
      expect(footer._currentSourceUrl).toBe("");
    });

    it("footer: _setSourceLink rejects non-http(s) schemes", () => {
      // Pre-populate textContent so the only thing keeping the link hidden
      // is the URL rejection (not the empty-textContent guard).
      footer._els.source.textContent = "should not be shown";

      for (const bad of [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "ftp://example.com/",
      ]) {
        footer._setSourceLink(bad);
        expect(footer._els.source.hidden).toBe(true);
        expect(footer._els.source.hasAttribute("href")).toBe(false);
        expect(footer._currentSourceUrl).toBe("");
      }
    });

    it("footer: _setSourceLink hides the link for malformed URLs", () => {
      footer._els.source.textContent = "should not be shown";

      // "http://[invalid" makes the URL constructor throw (unmatched
      // bracket in the authority), so the implementation's catch block
      // hides the link.
      footer._setSourceLink("http://[invalid");
      expect(footer._els.source.hidden).toBe(true);
      expect(footer._els.source.hasAttribute("href")).toBe(false);
      expect(footer._currentSourceUrl).toBe("");
    });

    /* ---------------------------------------------------------------- */
    /*  podcast-play event dispatch                                      */
    /* ---------------------------------------------------------------- */

    it("footer: podcast-play with url field shows the link with that URL", () => {
      // The footer listens for podcast-play on `document` (matching how
      // inline <podcast-player> elements dispatch the event in production).
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/audio.mp3",
            title: "Episode 1",
            poster: "",
            url: "https://example.com/page",
            currentTime: 0,
          },
        }),
      );

      // After dispatch, the link should be visible and pointing at the
      // explicit URL from the event detail. The URL is normalized through
      // `new URL(...)` which canonicalizes hostnames (e.g. appends a
      // trailing slash to bare hosts), so compare against the normalized
      // form.
      const expected = new URL("https://example.com/page", document.baseURI).href;
      expect(footer._els.source.hidden).toBe(false);
      expect(footer._els.source.getAttribute("href")).toBe(expected);
      expect(footer._currentSourceUrl).toBe(expected);
    });

    it("footer: podcast-play with url='none' hides the link", () => {
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/audio.mp3",
            title: "Episode 1",
            poster: "",
            url: "none",
            currentTime: 0,
          },
        }),
      );

      // The "none" sentinel is honored even when the event carries one.
      expect(footer._els.source.hidden).toBe(true);
      expect(footer._els.source.hasAttribute("href")).toBe(false);
      expect(footer._currentSourceUrl).toBe("");
    });

    /* ---------------------------------------------------------------- */
    /*  Top-level override on <podcast-footer>                           */
    /* ---------------------------------------------------------------- */

    it("footer: <podcast-footer url='...'> attribute overrides the event's url", () => {
      // Set the override BEFORE dispatching the event.
      footer.setAttribute("url", "https://override.example.com");

      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/audio.mp3",
            title: "Episode 1",
            poster: "",
            // Inline player's URL — must be ignored in favor of the override.
            url: "https://inline.example.com",
            currentTime: 0,
          },
        }),
      );

      // The URL is normalized through `new URL(...)`, which appends a
      // trailing slash to a bare host. Compare against the canonical form.
      const expected = new URL("https://override.example.com", document.baseURI).href;
      expect(footer._els.source.hidden).toBe(false);
      expect(footer._els.source.getAttribute("href")).toBe(expected);
      expect(footer._currentSourceUrl).toBe(expected);
    });

    it("footer: <podcast-footer url='none'> override hides the link even when event has a URL", () => {
      footer.setAttribute("url", "none");

      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/audio.mp3",
            title: "Episode 1",
            poster: "",
            url: "https://inline.example.com",
            currentTime: 0,
          },
        }),
      );

      // Top-level "none" override beats the inline URL.
      expect(footer._els.source.hidden).toBe(true);
      expect(footer._els.source.hasAttribute("href")).toBe(false);
    });

    it("footer: changing <podcast-footer url='...'> at runtime updates the visible link", () => {
      // URLs are normalized through `new URL(...)` which appends a
      // trailing slash to bare hosts; compare against the canonical form.
      const firstExpected = new URL("https://first.example.com", document.baseURI).href;
      const secondExpected = new URL("https://second.example.com", document.baseURI).href;

      // First, dispatch a play event that sets a URL.
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/audio.mp3",
            title: "Episode 1",
            poster: "",
            url: "https://first.example.com",
            currentTime: 0,
          },
        }),
      );
      expect(footer._els.source.getAttribute("href")).toBe(firstExpected);

      // Now flip the top-level override to a different URL and dispatch
      // again — the visible link must follow the override.
      footer.setAttribute("url", "https://second.example.com");
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/other.mp3",
            title: "Episode 2",
            poster: "",
            url: "https://other-inline.example.com",
            currentTime: 0,
          },
        }),
      );
      expect(footer._els.source.hidden).toBe(false);
      expect(footer._els.source.getAttribute("href")).toBe(secondExpected);
    });

    /* ---------------------------------------------------------------- */
    /*  Persistence: save / restore url round-trip                       */
    /* ---------------------------------------------------------------- */

    it("footer: _savePlaybackState includes the currently displayed url", () => {
      // Seed the footer's audio state so _savePlaybackState has something
      // to persist (it bails out when audio.src is empty).
      footer._audio.src = "https://example.com/audio.mp3";
      footer._setSourceLink("https://example.com/page");

      // Capture the raw sessionStorage entry before invoking save (the
      // previous _setSourceLink may have left state on a different key).
      footer._savePlaybackState();

      const raw = sessionStorage.getItem("podcastPlayerState:footer");
      expect(raw).not.toBeNull();
      const state = JSON.parse(raw);
      // The URL is normalized through `new URL(...)`; compare against the
      // canonical form.
      const expected = new URL("https://example.com/page", document.baseURI).href;
      expect(state.url).toBe(expected);
    });

    it("footer: _restorePlaybackState applies the saved url to the link", () => {
      // Seed storage with a saved state that includes a url.
      const saved = {
        src: "https://example.com/restored.mp3",
        currentTime: 5,
        paused: true,
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now(),
        title: "Restored Episode",
        poster: "",
        url: "https://example.com/restored-page",
      };
      sessionStorage.setItem("podcastPlayerState:footer", JSON.stringify(saved));

      // Create a fresh footer; connectedCallback calls _restorePlaybackState.
      const fresh = document.createElement("podcast-footer");
      document.body.appendChild(fresh);

      // The saved url must be applied to the link (URL is normalized through
      // `new URL(...)`).
      const expected = new URL("https://example.com/restored-page", document.baseURI).href;
      expect(fresh._els.source.hidden).toBe(false);
      expect(fresh._els.source.getAttribute("href")).toBe(expected);
      expect(fresh._currentSourceUrl).toBe(expected);
      // One-shot restore: storage is consumed.
      expect(sessionStorage.getItem("podcastPlayerState:footer")).toBeNull();
    });

    it("footer: top-level <podcast-footer url='...'> override beats the saved url on restore", () => {
      // Seed storage with a saved url, but also set a top-level override.
      // The override is applied first, so it should win on restore.
      const saved = {
        src: "https://example.com/restored.mp3",
        currentTime: 5,
        paused: true,
        volume: 1,
        muted: false,
        playbackRate: 1,
        timestamp: Date.now(),
        title: "Restored Episode",
        poster: "",
        url: "https://saved.example.com",
      };
      sessionStorage.setItem("podcastPlayerState:footer", JSON.stringify(saved));

      const fresh = document.createElement("podcast-footer");
      fresh.setAttribute("url", "https://override.example.com");
      document.body.appendChild(fresh);

      // Top-level override wins — the URL is normalized through
      // `new URL(...)` (bare host → trailing slash).
      const expected = new URL("https://override.example.com", document.baseURI).href;
      expect(fresh._els.source.hidden).toBe(false);
      expect(fresh._els.source.getAttribute("href")).toBe(expected);
    });
  });

  /* ================================================================== */
  /*  Footer size attribute (issue #62)                                 */
  /* ================================================================== */

  describe("footer size attribute", () => {
    /** @type {HTMLElement} */
    let footer;

    beforeEach(() => {
      // Clean up any leftover footers from previous tests.
      document.querySelectorAll("podcast-footer").forEach((e) => e.remove());
      sessionStorage.clear();

      footer = document.createElement("podcast-footer");
      document.body.appendChild(footer);
    });

    afterEach(() => {
      document.querySelectorAll("podcast-footer").forEach((e) => e.remove());
      sessionStorage.clear();
    });

    /* ---------------------------------------------------------------- */
    /*  A. observedAttributes                                            */
    /* ---------------------------------------------------------------- */

    it("observedAttributes includes the 'size' attribute", () => {
      // The component must opt-in to observing the 'size' attribute so
      // that mutations trigger attributeChangedCallback (and the CSS
      // :host([size="..."]) selectors pick up the change).
      const PodcastFooter = customElements.get("podcast-footer");
      expect(PodcastFooter).toBeDefined();
      expect(PodcastFooter.observedAttributes).toContain("size");
    });

    /* ---------------------------------------------------------------- */
    /*  B/C. Reflecting the host attribute                               */
    /* ---------------------------------------------------------------- */

    it("setting size='medium' reflects the attribute on the host", () => {
      footer.setAttribute("size", "medium");
      expect(footer.getAttribute("size")).toBe("medium");
    });

    it("setting size='large' reflects the attribute on the host", () => {
      footer.setAttribute("size", "large");
      expect(footer.getAttribute("size")).toBe("large");
    });

    /* ---------------------------------------------------------------- */
    /*  D. Remove is allowed                                             */
    /* ---------------------------------------------------------------- */

    it("removing the size attribute is allowed (no error)", () => {
      footer.setAttribute("size", "medium");
      expect(footer.hasAttribute("size")).toBe(true);
      expect(() => footer.removeAttribute("size")).not.toThrow();
      expect(footer.hasAttribute("size")).toBe(false);
    });

    /* ---------------------------------------------------------------- */
    /*  E. Unknown values are accepted                                    */
    /* ---------------------------------------------------------------- */

    it("unknown size values like 'huge' are accepted without validation", () => {
      // The component must not validate the value; unknown values are
      // ignored by CSS, falling back to the default layout. The
      // attribute is stored on the host regardless.
      expect(() => footer.setAttribute("size", "huge")).not.toThrow();
      expect(footer.getAttribute("size")).toBe("huge");
    });

    /* ---------------------------------------------------------------- */
    /*  F. Shadow DOM style selectors                                    */
    /* ---------------------------------------------------------------- */

    it("Shadow DOM style block declares :host([size='medium']) and :host([size='large']) rules", () => {
      const css = footer.shadowRoot.querySelector("style").textContent;
      expect(css).toContain(':host([size="medium"])');
      expect(css).toContain(':host([size="large"])');
    });

    /* ---------------------------------------------------------------- */
    /*  G. Size-specific CSS custom properties                           */
    /* ---------------------------------------------------------------- */

    it(":host([size='medium']) declares the expected footprint variables", () => {
      const css = footer.shadowRoot.querySelector("style").textContent;
      // Assert a representative subset of the 13 vars (full enumeration
      // makes the test brittle to value tweaks). The selected vars are
      // the most distinctive for the medium footprint.
      expect(css).toContain("--podcast-footer-cover-size: 48px;");
      expect(css).toContain("--podcast-footer-info-max-width: 240px;");
      expect(css).toContain("--podcast-footer-btn-size: 36px;");
      expect(css).toContain("--podcast-footer-min-height: 60px;");
    });

    it(":host([size='large']) declares the expected footprint variables", () => {
      const css = footer.shadowRoot.querySelector("style").textContent;
      expect(css).toContain("--podcast-footer-cover-size: 64px;");
      expect(css).toContain("--podcast-footer-info-max-width: 400px;");
      expect(css).toContain("--podcast-footer-btn-size: 44px;");
      expect(css).toContain("--podcast-footer-min-height: 72px;");
    });

    /* ---------------------------------------------------------------- */
    /*  H. var() with fallback in base rules                             */
    /* ---------------------------------------------------------------- */

    it("base rules consume the new --podcast-footer-* CSS vars", () => {
      const css = footer.shadowRoot.querySelector("style").textContent;
      // The base rules must use var(--podcast-footer-*, FALLBACK) so
      // that omitting the size attribute falls through to the original
      // hardcoded value. Spot-check four of the most-used rules.
      expect(css).toContain("var(--podcast-footer-cover-size");
      expect(css).toContain("var(--podcast-footer-info-max-width");
      expect(css).toContain("var(--podcast-footer-btn-size");
      expect(css).toContain("var(--podcast-footer-padding");
    });

    /* ---------------------------------------------------------------- */
    /*  I. Mobile media query overrides the size vars                    */
    /* ---------------------------------------------------------------- */

    it("mobile media query (max-width: 768px) overrides the size vars back to compact values", () => {
      const css = footer.shadowRoot.querySelector("style").textContent;
      // Locate the 768px media block by finding its opening and the next
      // top-level @media. A loose substring match within the block is
      // sufficient.
      const idx = css.indexOf("@media (max-width: 768px)");
      expect(idx).toBeGreaterThan(-1);
      // Slice from the start of the @media rule to the next @media (or
      // end of string) so we can scope our checks to this block.
      const nextMedia = css.indexOf("@media", idx + 1);
      const block = nextMedia > -1 ? css.slice(idx, nextMedia) : css.slice(idx);
      // The block must contain BOTH the medium and large host selectors
      // in the same rule (they target both size variants together).
      expect(block).toContain(':host([size="medium"])');
      expect(block).toContain(':host([size="large"])');
      // And it must collapse the cover size back to the compact value.
      expect(block).toContain("--podcast-footer-cover-size: 28px;");
    });

    /* ---------------------------------------------------------------- */
    /*  J. Default (no size attribute) equals today's layout             */
    /* ---------------------------------------------------------------- */

    it("default (no size attribute) uses the original hardcoded values as fallbacks", () => {
      // Without a size attribute, the :host([size="..."]) selectors
      // don't match, so the base rules use the var() fallback. The
      // fallback is the original hardcoded value, so the layout is
      // byte-equivalent to today (the pre-issue-#62 default).
      const css = footer.shadowRoot.querySelector("style").textContent;
      // .cover uses 36px as the fallback
      expect(css).toContain("var(--podcast-footer-cover-size, 36px)");
      // .info uses 140px as the fallback
      expect(css).toContain("var(--podcast-footer-info-max-width, 140px)");
      // .footer padding uses 6px 12px as the fallback
      expect(css).toContain("var(--podcast-footer-padding, 6px 12px)");
      // .btn uses 32px as the fallback
      expect(css).toContain("var(--podcast-footer-btn-size, 32px)");
    });

    /* ---------------------------------------------------------------- */
    /*  K. attributeChangedCallback doesn't throw on size changes        */
    /* ---------------------------------------------------------------- */

    it("attributeChangedCallback does not throw when size is set, removed, or changed", () => {
      expect(() => {
        footer.setAttribute("size", "medium");
        footer.removeAttribute("size");
        footer.setAttribute("size", "large");
        footer.setAttribute("size", "medium");
        footer.setAttribute("size", "huge"); // unknown value
        footer.removeAttribute("size");
      }).not.toThrow();
    });

    /* ---------------------------------------------------------------- */
    /*  L. Size attribute is independent of url                          */
    /* ---------------------------------------------------------------- */

    it("size attribute does not interfere with the url source link", () => {
      // Set both attributes BEFORE dispatching the event. The url
      // attribute should drive the source link via attributeChangedCallback;
      // size is a no-op.
      footer.setAttribute("url", "https://example.com/page");
      footer.setAttribute("size", "medium");

      // Synthesize a podcast-play event with a DIFFERENT inline url —
      // the top-level url override must still win, regardless of the
      // presence of the size attribute.
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/audio.mp3",
            title: "Episode 1",
            poster: "",
            url: "https://inline.example.com",
            currentTime: 0,
          },
        }),
      );

      // The top-level url override wins.
      const expected = new URL("https://example.com/page", document.baseURI).href;
      expect(footer._els.source.hidden).toBe(false);
      expect(footer._els.source.getAttribute("href")).toBe(expected);
      // And the size attribute is still present.
      expect(footer.getAttribute("size")).toBe("medium");
    });
  });

  /* ================================================================== */
  /*  <podcast-live> Web Component (issue #65)                           */
  /* ================================================================== */
  //
  // TDD RED — these tests exercise a <podcast-live> custom element that
  // does NOT exist yet. They will fail (customElements.get returns
  // undefined, shadowRoot is null, etc.) until the implementation lands.
  //
  // Design choices documented up-front (kept stable for the impl author):
  //
  //   • The "Listen Live" button is rendered with class .listen-live.
  //     This name does not conflict with the player's .btn-play / .btn
  //     classes (see assets/js/podcast-player.js around line 1842).
  //
  //   • Metadata slots:
  //       .badge      — "LIVE" pill (animated when data-state="playing")
  //       .title      — current track title text
  //       .artist     — current track artist text
  //       .time       — "HH:MM-HH:MM" start→end time string
  //       .listen-live— the button that dispatches podcast-play
  //
  //   • State is exposed on the host as a `data-state` attribute with
  //     one of: "idle" | "loading" | "playing" | "offline" | "error".
  //     This mirrors the existing pattern (see :host([size="..."]) usage
  //     in the footer).
  //
  //   • _fmtClockTime(date) is exposed as a STATIC method on the class so
  //     unit tests can call it without instantiating the element.
  //     Static access path: customElements.get("podcast-live")._fmtClockTime(d)
  //
  //   • Configurable intervals (ms) are read from attributes:
  //       poll-interval-active (default 15000)
  //       poll-interval-idle   (default 60000)
  //
  //   • Exponential-backoff delay sequence on error: 30000, 60000, 120000,
  //     240000, then capped at 600000; reset to base on success.
  //
  //   • On disconnectedCallback, any in-flight fetch is aborted via
  //     AbortController and any pending poll timer is cleared.

  describe("podcast-live", () => {
    /** @type {HTMLElement} */
    let live;
    /** @type {HTMLElement} */
    let footer;
    /** @type {ReturnType<typeof vi.fn> | undefined} */
    let origFetch;

    const VALID_API_URL = "https://station.example.com/api/live/nowplaying/test";
    const LIVE_STREAM_URL = "https://station.example.com/radio.mp3";

    /**
     * Build a minimal "now playing" payload that resolves through the
     * mock fetch. The component reads these fields off the JSON body.
     */
    const fakeNowPlaying = (overrides = {}) => ({
      station: { listen_url: LIVE_STREAM_URL },
      now_playing: {
        song: { title: "Test Track", artist: "Test Artist" },
        elapsed: 0,
        duration: 0,
        ...overrides,
      },
      ...overrides,
    });

    beforeEach(() => {
      // Clean up any leftover live/footer instances from previous tests.
      document.querySelectorAll("podcast-live, podcast-footer").forEach((e) => e.remove());

      // Save and replace globalThis.fetch with a vi.fn() so tests can
      // assert call counts. Tests that need a specific response use the
      // `.mockResolvedValueOnce(...)` pattern.
      origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(fakeNowPlaying()),
      });

      // A footer sibling is required for d2/d3 (single-stream integration).
      // It is not required for the rest of the suite, but creating it
      // unconditionally keeps state predictable.
      footer = document.createElement("podcast-footer");
      document.body.appendChild(footer);
    });

    afterEach(() => {
      document.querySelectorAll("podcast-live, podcast-footer").forEach((e) => e.remove());
      if (origFetch === undefined) {
        delete globalThis.fetch;
      } else {
        globalThis.fetch = origFetch;
      }
      vi.useRealTimers();
    });

    /** Helper: create a <podcast-live> with the two required attributes set. */
    const createLive = (overrides = {}) => {
      const el = document.createElement("podcast-live");
      el.setAttribute("data-azuracast-api-url", VALID_API_URL);
      el.setAttribute("station-name", "test-station");
      for (const [k, v] of Object.entries(overrides)) {
        el.setAttribute(k, v);
      }
      document.body.appendChild(el);
      return el;
    };

    /* ---------------------------------------------------------------- */
    /*  A. Registration & rendering                                      */
    /* ---------------------------------------------------------------- */

    it("A1: registers a custom element named 'podcast-live'", () => {
      expect(customElements.get("podcast-live")).toBeDefined();
    });

    it("A2: renders badge, title, artist, time and listen-live in the shadow root", () => {
      live = createLive();
      expect(live.shadowRoot).not.toBeNull();
      expect(live.shadowRoot.querySelector(".badge")).not.toBeNull();
      expect(live.shadowRoot.querySelector(".title")).not.toBeNull();
      expect(live.shadowRoot.querySelector(".artist")).not.toBeNull();
      expect(live.shadowRoot.querySelector(".time")).not.toBeNull();
      expect(live.shadowRoot.querySelector(".listen-live")).not.toBeNull();
    });

    it("A3: exposes data-azuracast-api-url and station-name as readable attributes", () => {
      live = createLive();
      // The host element reflects the attributes regardless of whether
      // the custom element is defined (setAttribute on an
      // HTMLUnknownElement still works), so this is a sanity check on
      // the DOM round-trip, not on custom-element behaviour.
      expect(live.getAttribute("data-azuracast-api-url")).toBe(VALID_API_URL);
      expect(live.getAttribute("station-name")).toBe("test-station");

      // The component must OBSERVE the attributes so attributeChangedCallback
      // fires when they are set (this is what kicks off the fetch).
      const Cls = customElements.get("podcast-live");
      expect(Cls).toBeDefined();
      expect(Cls.observedAttributes).toContain("data-azuracast-api-url");
      expect(Cls.observedAttributes).toContain("station-name");
    });

    it("A4: shadow root contains a <style> element", () => {
      live = createLive();
      expect(live.shadowRoot.querySelector("style")).not.toBeNull();
    });

    /* ---------------------------------------------------------------- */
    /*  B. State machine                                                 */
    /* ---------------------------------------------------------------- */

    it("B1: initial data-state is 'idle'", () => {
      live = createLive();
      expect(live.getAttribute("data-state")).toBe("idle");
    });

    it("B2: transitions to 'loading' or 'playing' after a successful fetch", async () => {
      live = createLive();
      // Let the initial connectedCallback fetch resolve and the
      // microtask queue drain.
      await Promise.resolve();
      await Promise.resolve();
      const state = live.getAttribute("data-state");
      expect(["loading", "playing"]).toContain(state);
    });

    it("B3: fetch failure transitions data-state to 'offline'", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));
      live = createLive();
      // Allow the rejection to propagate and the catch handler to run.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(live.getAttribute("data-state")).toBe("offline");
    });

    it("B4: bad URL (javascript:/data:/http:/malformed) → 'error' and no fetch attempted", () => {
      // Each sub-case must reject the URL without invoking fetch.
      // We install a fresh vi.fn() as globalThis.fetch for each iteration
      // and assert it was never called.
      const badUrls = [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "http://insecure.example.com/api/live/nowplaying/test",
        "not-a-url",
        "http://[invalid",
      ];
      for (const bad of badUrls) {
        // Reset DOM and mock between sub-cases.
        document.querySelectorAll("podcast-live").forEach((e) => e.remove());
        globalThis.fetch = vi.fn();

        const el = document.createElement("podcast-live");
        el.setAttribute("data-azuracast-api-url", bad);
        el.setAttribute("station-name", "x");
        document.body.appendChild(el);

        expect(el.getAttribute("data-state")).toBe("error");
        expect(globalThis.fetch).not.toHaveBeenCalled();
        el.remove();
      }
    });

    it("B5: disconnected component has no data-state set (or is fully cleaned up)", () => {
      live = createLive();
      const snapshot = live;
      snapshot.remove();
      // After removal, the element is detached and any state mutation
      // it performed before removal must not be visible on a fresh
      // element. We assert the cleanup by creating a new instance and
      // confirming it starts at "idle" — i.e. the previous instance did
      // not leak global state.
      live = createLive();
      expect(live.getAttribute("data-state")).toBe("idle");
    });

    /* ---------------------------------------------------------------- */
    /*  C. Polling                                                       */
    /* ---------------------------------------------------------------- */
    //
    // The polling describe block installs fake timers in beforeEach and
    // restores them in afterEach (the outer describe's afterEach also
    // calls vi.useRealTimers() as a safety net).

    describe("polling", () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it("C1: fetches exactly once on connectedCallback", async () => {
        live = createLive();
        // Drain any pending microtasks queued by the constructor.
        // We deliberately use `await Promise.resolve()` instead of
        // `vi.runOnlyPendingTimersAsync()` because the latter advances
        // the fake clock and fires any future-scheduled timers, which
        // would mask the "exactly once" assertion by triggering the
        // 15000ms follow-up poll.
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(globalThis.fetch).toHaveBeenCalledWith(
          VALID_API_URL,
          expect.objectContaining({ signal: expect.any(AbortSignal) }),
        );
      });

      it("C2: refetches after poll-interval-active (default 15000ms) when playing", async () => {
        live = createLive();
        // Drain the initial fetch (microtasks only — see C1).
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        // Advance just below the active interval — must NOT refetch.
        await vi.advanceTimersByTimeAsync(14999);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        // Advance past the boundary — must refetch exactly once more.
        // `advanceTimersByTimeAsync` drains microtasks too, so the new
        // fetch's promise resolves and count increments by one.
        await vi.advanceTimersByTimeAsync(2);
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      });

      it("C3: refetches after poll-interval-idle (default 60000ms) when NOT playing", async () => {
        // Force a fetch error so the component stays in 'offline' (not
        // 'playing') for this test.
        globalThis.fetch = vi.fn().mockRejectedValue(new Error("down"));
        live = createLive();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        // Initial fetch was attempted once.
        expect(globalThis.fetch.mock.calls.length).toBe(1);

        // Advance past the active interval (15000) — must NOT refetch
        // because state is not 'playing'.
        await vi.advanceTimersByTimeAsync(20000);
        expect(globalThis.fetch.mock.calls.length).toBe(1);

        // Advance past the idle interval (60000 cumulative) — must refetch.
        await vi.advanceTimersByTimeAsync(40001);
        expect(globalThis.fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
      });

      it("C4: doubles the next delay on error (exponential backoff: 30s, 60s, 120s, ...)", async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error("boom"));
        live = createLive();
        // Drain initial fetch + its microtask.
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        const initialCalls = globalThis.fetch.mock.calls.length;
        expect(initialCalls).toBe(1);

        // First retry should happen at 30000ms (base error delay).
        await vi.advanceTimersByTimeAsync(29999);
        expect(globalThis.fetch.mock.calls.length).toBe(1);

        await vi.advanceTimersByTimeAsync(2);
        expect(globalThis.fetch.mock.calls.length).toBe(2);

        // Second retry should happen at 30000 + 60000 = 90000ms cumulative.
        // The advance is 1ms short of the boundary so we can prove the
        // 90000ms timer has NOT fired before that point.
        await vi.advanceTimersByTimeAsync(59998);
        expect(globalThis.fetch.mock.calls.length).toBe(2);

        await vi.advanceTimersByTimeAsync(2);
        expect(globalThis.fetch.mock.calls.length).toBe(3);
      });

      it("C5: a successful fetch after errors resets the delay to the base interval", async () => {
        // First two fetches fail, third succeeds.
        globalThis.fetch = vi
          .fn()
          .mockRejectedValueOnce(new Error("e1"))
          .mockRejectedValueOnce(new Error("e2"))
          .mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(fakeNowPlaying()),
          });

        live = createLive();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(globalThis.fetch.mock.calls.length).toBe(1);

        // Trigger first error retry (30000ms).
        await vi.advanceTimersByTimeAsync(30001);
        expect(globalThis.fetch.mock.calls.length).toBe(2);

        // Trigger second error retry (cumulative 90000ms).
        await vi.advanceTimersByTimeAsync(60000);
        expect(globalThis.fetch.mock.calls.length).toBe(3);

        // Third call succeeds. The next retry should be at the base
        // active interval (15000ms) — NOT the next backoff step.
        // 1ms short of the boundary so we can prove the 15000ms timer
        // has NOT fired before that point.
        await vi.advanceTimersByTimeAsync(14998);
        expect(globalThis.fetch.mock.calls.length).toBe(3);

        await vi.advanceTimersByTimeAsync(2);
        expect(globalThis.fetch.mock.calls.length).toBe(4);
      });
    });

    /* ---------------------------------------------------------------- */
    /*  D. Single-stream integration (event flow)                        */
    /* ---------------------------------------------------------------- */

    it("D1: clicking the .listen-live button dispatches podcast-play on document", async () => {
      live = createLive();
      // Drain the initial fetch so the component has a stream URL cached.
      // The mock fetch resolves synchronously, so a few microtask ticks
      // are sufficient.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      const handler = vi.fn();
      document.addEventListener("podcast-play", handler);

      const btn = live.shadowRoot.querySelector(".listen-live");
      btn.click();

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0];
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.type).toBe("podcast-play");
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.detail).toBeDefined();
      expect(event.detail.src).toBe(LIVE_STREAM_URL);
      expect(typeof event.detail.title).toBe("string");
      // currentTime is the live start offset (0 by default for a stream).
      expect(event.detail.currentTime).toBe(0);

      document.removeEventListener("podcast-play", handler);
    });

    it("D2: when a podcast-play event with the live URL arrives, data-state becomes 'playing'", async () => {
      live = createLive();
      // Drain initial fetch so the component is aware of the live URL.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      // Simulate the footer (or any source) starting playback of the
      // live stream. With the matching src, the live component should
      // enter the 'playing' state.
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: LIVE_STREAM_URL,
            title: "Live",
            poster: "",
            currentTime: 0,
          },
        }),
      );

      expect(live.getAttribute("data-state")).toBe("playing");
    });

    it("D3: a podcast-play event with a non-matching src does not change the live component's state", async () => {
      live = createLive();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      // First, drive the live component to 'playing' via a matching event.
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: { src: LIVE_STREAM_URL, title: "Live", poster: "", currentTime: 0 },
        }),
      );
      expect(live.getAttribute("data-state")).toBe("playing");

      // Now dispatch a podcast-play for a DIFFERENT source. The live
      // component must not transition out of 'playing' (or be confused
      // by the unrelated event).
      document.dispatchEvent(
        new CustomEvent("podcast-play", {
          detail: {
            src: "https://other.example.com/episode.mp3",
            title: "Episode 99",
            poster: "",
            currentTime: 0,
          },
        }),
      );

      expect(live.getAttribute("data-state")).toBe("playing");
    });

    /* ---------------------------------------------------------------- */
    /*  E. 24H time formatting                                           */
    /* ---------------------------------------------------------------- */

    it("E1: _fmtClockTime(14:32) returns '14:32'", () => {
      const Cls = customElements.get("podcast-live");
      expect(typeof Cls._fmtClockTime).toBe("function");
      expect(Cls._fmtClockTime(new Date(2026, 0, 1, 14, 32))).toBe("14:32");
    });

    it("E2: _fmtClockTime(00:00) returns '00:00'", () => {
      const Cls = customElements.get("podcast-live");
      expect(Cls._fmtClockTime(new Date(2026, 0, 1, 0, 0))).toBe("00:00");
    });

    it("E3: _fmtClockTime(23:59) returns '23:59'", () => {
      const Cls = customElements.get("podcast-live");
      expect(Cls._fmtClockTime(new Date(2026, 0, 1, 23, 59))).toBe("23:59");
    });

    it("E4: _fmtClockTime on an invalid Date returns '--:--'", () => {
      const Cls = customElements.get("podcast-live");
      expect(Cls._fmtClockTime(new Date("invalid"))).toBe("--:--");
    });

    it("E5: rendered .time reflects now-elapsed and now-elapsed+duration in 24H", async () => {
      // Use fake timers so Date.now() is deterministic.
      vi.useFakeTimers();
      // Pick a "now" that yields a clean local-time 14:30:00.
      const realNow = new Date(2026, 0, 15, 14, 30, 0).getTime();
      vi.setSystemTime(realNow);

      // Mock fetch to return a track that started 60s ago and lasts 240s.
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve(
            fakeNowPlaying({
              elapsed: 60,
              duration: 240,
            }),
          ),
      });

      live = createLive();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      const time = live.shadowRoot.querySelector(".time");
      expect(time).not.toBeNull();
      // start = now - elapsed = 14:30 - 60s = 14:29
      // end   = start + duration = 14:29 + 240s = 14:33
      const text = time.textContent;
      expect(text).toContain("14:29");
      expect(text).toContain("14:33");

      vi.useRealTimers();
    });

    /* ---------------------------------------------------------------- */
    /*  F. URL sanitization                                              */
    /* ---------------------------------------------------------------- */
    //
    // These tests verify the four "bad URL" categories listed in the
    // spec. The component MUST refuse to fetch and MUST set
    // data-state="error". Each sub-case gets its own fresh fetch mock
    // so we can assert it was not invoked.

    it("F1: javascript: URL → data-state='error' and no fetch", () => {
      globalThis.fetch = vi.fn();
      live = document.createElement("podcast-live");
      live.setAttribute("data-azuracast-api-url", "javascript:alert(1)");
      live.setAttribute("station-name", "x");
      document.body.appendChild(live);

      expect(live.getAttribute("data-state")).toBe("error");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("F2: data: URL → data-state='error' and no fetch", () => {
      globalThis.fetch = vi.fn();
      live = document.createElement("podcast-live");
      live.setAttribute("data-azuracast-api-url", "data:text/html,<script>x</script>");
      live.setAttribute("station-name", "x");
      document.body.appendChild(live);

      expect(live.getAttribute("data-state")).toBe("error");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("F3: http:// (non-https) URL → data-state='error' and no fetch", () => {
      globalThis.fetch = vi.fn();
      live = document.createElement("podcast-live");
      live.setAttribute("data-azuracast-api-url", "http://insecure.example.com/api/nowplaying/x");
      live.setAttribute("station-name", "x");
      document.body.appendChild(live);

      expect(live.getAttribute("data-state")).toBe("error");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("F4: malformed URL → data-state='error' and no fetch", () => {
      globalThis.fetch = vi.fn();
      live = document.createElement("podcast-live");
      // "not-a-url" lacks a scheme; the URL constructor will throw.
      live.setAttribute("data-azuracast-api-url", "not-a-url");
      live.setAttribute("station-name", "x");
      document.body.appendChild(live);

      expect(live.getAttribute("data-state")).toBe("error");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    /* ---------------------------------------------------------------- */
    /*  G. CSS animation                                                 */
    /* ---------------------------------------------------------------- */

    it("G1: shadow style block declares @keyframes live-pulse", () => {
      live = createLive();
      const css = live.shadowRoot.querySelector("style").textContent;
      expect(css).toContain("@keyframes live-pulse");
    });

    it("G2: @media (prefers-reduced-motion: reduce) disables the live-pulse animation", () => {
      live = createLive();
      const css = live.shadowRoot.querySelector("style").textContent;
      const idx = css.indexOf("@media (prefers-reduced-motion: reduce)");
      expect(idx).toBeGreaterThan(-1);
      const block = css.slice(idx);
      // Inside the reduced-motion block, the animation must be set to
      // "none" (or otherwise neutralized). "animation: none" is the
      // canonical expression.
      expect(block).toContain("animation: none");
    });

    it("G3: badge has an accessible name conveying 'live broadcasting'", () => {
      live = createLive();
      const badge = live.shadowRoot.querySelector(".badge");
      expect(badge).not.toBeNull();
      // The spec gives the exact aria-label string.
      expect(badge.getAttribute("aria-label")).toBe("Live radio currently broadcasting");
    });

    /* ---------------------------------------------------------------- */
    /*  H. Cleanup                                                       */
    /* ---------------------------------------------------------------- */

    it("H1: disconnectedCallback clears the pending poll timer", async () => {
      vi.useFakeTimers();
      live = createLive();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      // The component must have made its initial fetch — that's the
      // precondition for the "no further fetch after disconnect" check
      // to be meaningful. In the TDD-red state the component does not
      // exist, so this assertion fails.
      const callsAfterConnect = globalThis.fetch.mock.calls.length;
      expect(callsAfterConnect).toBe(1);

      // Disconnect, then advance well past the active interval. No new
      // fetch should fire because the poll timer was cleared.
      live.remove();
      await vi.advanceTimersByTimeAsync(60000);

      expect(globalThis.fetch.mock.calls.length).toBe(callsAfterConnect);
      vi.useRealTimers();
    });

    it("H2: disconnectedCallback aborts the in-flight fetch (late response is ignored)", async () => {
      // Mock fetch with a promise that does NOT resolve until we
      // explicitly resolve it. The component must abort via the
      // AbortSignal, so when we resolve late, the component's state
      // should not change.
      let resolveFetch;
      const latePromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      globalThis.fetch = vi.fn().mockReturnValue(latePromise);

      live = createLive();
      // The initial fetch is now pending. Disconnect.
      live.remove();

      // Now resolve the "late" fetch — well after the component is
      // gone. A correct implementation ignores the response because
      // the AbortController fired. We assert no further fetch happens
      // and the mock's signal was aborted.
      const fetchOpts = globalThis.fetch.mock.calls[0][1];
      expect(fetchOpts).toBeDefined();
      expect(fetchOpts.signal).toBeDefined();
      expect(fetchOpts.signal.aborted).toBe(true);

      // Resolving the late promise must not throw inside the (already
      // disconnected) component.
      expect(() =>
        resolveFetch({
          ok: true,
          json: () => Promise.resolve(fakeNowPlaying()),
        }),
      ).not.toThrow();
    });

    it("H3: multiple connect/disconnect cycles do not leak timers or global state", async () => {
      vi.useFakeTimers();
      // Capture the timer count after a clean baseline.
      const baselineTimers = vi.getTimerCount();

      // The component must have been registered and have observed
      // attribute changes — verify it exists so the connect/disconnect
      // exercise below is meaningful. Fails in the TDD-red state.
      expect(customElements.get("podcast-live")).toBeDefined();

      let totalFetches = 0;
      for (let i = 0; i < 3; i++) {
        const el = document.createElement("podcast-live");
        el.setAttribute("data-azuracast-api-url", VALID_API_URL);
        el.setAttribute("station-name", "x");
        document.body.appendChild(el);
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        totalFetches = globalThis.fetch.mock.calls.length;
        el.remove();
      }

      // After cycling, the pending-timer count should match the
      // baseline (i.e. nothing left dangling) AND no extra fetches
      // should have been issued after the last disconnect.
      expect(vi.getTimerCount()).toBe(baselineTimers);
      const callsAfterAllCycles = globalThis.fetch.mock.calls.length;
      // Advance well past the poll interval. No new fetch should fire
      // because the (disconnected) elements have no live timers.
      await vi.advanceTimersByTimeAsync(120000);
      expect(globalThis.fetch.mock.calls.length).toBe(callsAfterAllCycles);
      // Sanity: at least one fetch happened per cycle (3 total).
      expect(totalFetches).toBe(3);
      vi.useRealTimers();
    });
  });
});
