/**
 * Tests for the PodcastPlayer Web Component.
 *
 * Runs in jsdom — audio features are partially mocked (play/pause events
 * must be dispatched manually since jsdom doesn't implement them).
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";

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
});
