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
        currentTime: 120,           // paused at 2:00
        paused: true,               // was paused!
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
        currentTime: 60,            // was at 1:00
        paused: false,              // was playing!
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
      player.dispatchEvent(new CustomEvent("podcast-state-change", {
        bubbles: true,
        composed: true,
        detail: { src: "https://example.com/test.mp3", volume: 0.8, muted: true, playbackRate: 1 }
      }));

      // Footer should have applied the changes
      expect(footer._audio.muted).toBe(true);
      expect(footer._audio.volume).toBe(0.8);
    });

    it("should apply footer mute/volume/speed to footer audio from inline event", () => {
      footer._audio.src = "https://example.com/test.mp3";
      footer._els.volume.value = "1";
      footer.setAttribute("active", "");

      player.setAttribute("src", "https://example.com/test.mp3");
      player.dispatchEvent(new CustomEvent("podcast-state-change", {
        bubbles: true,
        composed: true,
        detail: { src: "https://example.com/test.mp3", volume: 0.5, muted: false, playbackRate: 1.5 }
      }));

      expect(footer._audio.volume).toBe(0.5);
      expect(footer._audio.muted).toBe(false);
      expect(footer._audio.playbackRate).toBe(1.5);
    });

    it("should update inline UI when footer dispatches state change", () => {
      player.setAttribute("src", "https://example.com/test.mp3");
      player._audio.muted = false;
      player._audio.volume = 1;

      footer._audio.src = "https://example.com/test.mp3";
      footer.dispatchEvent(new CustomEvent("podcast-state-change", {
        bubbles: true,
        composed: true,
        detail: { src: "https://example.com/test.mp3", volume: 0.2, muted: false, playbackRate: 2 }
      }));

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

      footer.dispatchEvent(new CustomEvent("podcast-state-change", {
        bubbles: true,
        composed: true,
        detail: { src: "https://example.com/track-b.mp3", volume: 0.1, muted: true, playbackRate: 2 }
      }));

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
      globalThis.requestAnimationFrame = /** @type {any} */ ((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });

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
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: { src: "https://example.com/x.mp3", title: "Hello World" },
      }));

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
        configurable: true, value: 100,
      });
      Object.defineProperty(footer._els.titleText, "scrollWidth", {
        configurable: true, value: 200,
      });

      footer._setupTitleMarquee();
      // rAF is mocked; flush it.
      flushRaf();

      expect(footer._els.title.hasAttribute("data-overflow")).toBe(true);
      // overflow = 200 - 100 = 100
      expect(footer._els.title.style.getPropertyValue("--marquee-distance"))
        .toBe("100px");
      // duration = Math.min(20, Math.max(6, 100 / 40)) = 6
      expect(footer._els.title.style.getPropertyValue("--marquee-duration"))
        .toBe("6s");
    });

    it("does NOT set data-overflow when the inner text fits", () => {
      Object.defineProperty(footer._els.title, "clientWidth", {
        configurable: true, value: 200,
      });
      Object.defineProperty(footer._els.titleText, "scrollWidth", {
        configurable: true, value: 100,
      });

      footer._setupTitleMarquee();
      flushRaf();

      expect(footer._els.title.hasAttribute("data-overflow")).toBe(false);
      expect(footer._els.title.style.getPropertyValue("--marquee-distance"))
        .toBe("");
      expect(footer._els.title.style.getPropertyValue("--marquee-duration"))
        .toBe("");
    });

    it("re-measures after a new podcast-play event changes the title", () => {
      // Start with a fitting title (no overflow)
      Object.defineProperty(footer._els.title, "clientWidth", {
        configurable: true, value: 500,
      });
      Object.defineProperty(footer._els.titleText, "scrollWidth", {
        configurable: true, get() { return footer._els.titleText.textContent.length; },
      });
      // .title clientWidth is constant; .title-text scrollWidth scales with
      // text length under our mock.

      // Short title → fits
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: { src: "https://example.com/short.mp3", title: "Hi" },
      }));
      flushRaf();
      expect(footer._els.title.hasAttribute("data-overflow")).toBe(false);

      // Long title → overflows (2 chars vs 500px width still fits, so make
      // it 600 chars to force overflow).
      const longTitle = "A".repeat(600);
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: { src: "https://example.com/long.mp3", title: longTitle },
      }));
      flushRaf();
      expect(footer._els.title.hasAttribute("data-overflow")).toBe(true);

      // Back to a short title → overflow attribute removed.
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: { src: "https://example.com/short2.mp3", title: "Hi again" },
      }));
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
      for (const bad of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "ftp://example.com/foo.mp3"]) {
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
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: {
          src: "https://example.com/audio.mp3",
          title: "Episode 1",
          poster: "",
          url: "https://example.com/page",
          currentTime: 0,
        },
      }));

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
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: {
          src: "https://example.com/audio.mp3",
          title: "Episode 1",
          poster: "",
          url: "none",
          currentTime: 0,
        },
      }));

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

      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: {
          src: "https://example.com/audio.mp3",
          title: "Episode 1",
          poster: "",
          // Inline player's URL — must be ignored in favor of the override.
          url: "https://inline.example.com",
          currentTime: 0,
        },
      }));

      // The URL is normalized through `new URL(...)`, which appends a
      // trailing slash to a bare host. Compare against the canonical form.
      const expected = new URL("https://override.example.com", document.baseURI).href;
      expect(footer._els.source.hidden).toBe(false);
      expect(footer._els.source.getAttribute("href")).toBe(expected);
      expect(footer._currentSourceUrl).toBe(expected);
    });

    it("footer: <podcast-footer url='none'> override hides the link even when event has a URL", () => {
      footer.setAttribute("url", "none");

      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: {
          src: "https://example.com/audio.mp3",
          title: "Episode 1",
          poster: "",
          url: "https://inline.example.com",
          currentTime: 0,
        },
      }));

      // Top-level "none" override beats the inline URL.
      expect(footer._els.source.hidden).toBe(true);
      expect(footer._els.source.hasAttribute("href")).toBe(false);
    });

    it("footer: changing <podcast-footer url='...'> at runtime updates the visible link", () => {
      // URLs are normalized through `new URL(...)` which appends a
      // trailing slash to bare hosts; compare against the canonical form.
      const firstExpected  = new URL("https://first.example.com",  document.baseURI).href;
      const secondExpected = new URL("https://second.example.com", document.baseURI).href;

      // First, dispatch a play event that sets a URL.
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: {
          src: "https://example.com/audio.mp3",
          title: "Episode 1",
          poster: "",
          url: "https://first.example.com",
          currentTime: 0,
        },
      }));
      expect(footer._els.source.getAttribute("href")).toBe(firstExpected);

      // Now flip the top-level override to a different URL and dispatch
      // again — the visible link must follow the override.
      footer.setAttribute("url", "https://second.example.com");
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: {
          src: "https://example.com/other.mp3",
          title: "Episode 2",
          poster: "",
          url: "https://other-inline.example.com",
          currentTime: 0,
        },
      }));
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
        footer.setAttribute("size", "huge");  // unknown value
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
      document.dispatchEvent(new CustomEvent("podcast-play", {
        detail: {
          src: "https://example.com/audio.mp3",
          title: "Episode 1",
          poster: "",
          url: "https://inline.example.com",
          currentTime: 0,
        },
      }));

      // The top-level url override wins.
      const expected = new URL("https://example.com/page", document.baseURI).href;
      expect(footer._els.source.hidden).toBe(false);
      expect(footer._els.source.getAttribute("href")).toBe(expected);
      // And the size attribute is still present.
      expect(footer.getAttribute("size")).toBe("medium");
    });
  });
});
