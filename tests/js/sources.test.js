import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  LocalAdapter,
  AzuracastAdapter,
  IvooxAdapter,
  createSourceAdapter,
  detectSourceType,
} from "../../assets/js/sources.js";

function makeEl(attrs = {}) {
  const el = document.createElement("podcast-player");
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

describe("LocalAdapter", () => {
  it("should return the src attribute", async () => {
    const el = makeEl({ src: "https://example.com/audio.mp3" });
    const adapter = new LocalAdapter(el);
    await expect(adapter.resolve()).resolves.toBe("https://example.com/audio.mp3");
  });

  it("should throw when src is missing", async () => {
    const el = makeEl();
    const adapter = new LocalAdapter(el);
    await expect(adapter.resolve()).rejects.toThrow("missing src");
  });

  it("should return null from enrich", async () => {
    const el = makeEl({ src: "https://example.com/audio.mp3" });
    const adapter = new LocalAdapter(el);
    await expect(adapter.enrich()).resolves.toBeNull();
  });
});

describe("AzuracastAdapter", () => {
  it("should return explicit src when set", async () => {
    const el = makeEl({
      src: "https://station.example.com/radio.mp3",
      "data-source": "azuracast",
    });
    const adapter = new AzuracastAdapter(el);
    await expect(adapter.resolve()).resolves.toBe("https://station.example.com/radio.mp3");
  });

  it("should throw when both src and api-url are missing", async () => {
    const el = makeEl({ "data-source": "azuracast" });
    const adapter = new AzuracastAdapter(el);
    await expect(adapter.resolve()).rejects.toThrow("missing azuracast-api-url");
  });

  it("should fetch API and return listen_url", async () => {
    const el = makeEl({
      "data-source": "azuracast",
      "azuracast-api-url": "https://station.example.com/api/live/nowplaying/test",
    });

    const fakeResponse = {
      station: { listen_url: "https://station.example.com/radio.mp3" },
      now_playing: { song: { title: "Test Song", artist: "Test Artist" } },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeResponse),
    });

    const adapter = new AzuracastAdapter(el);
    const url = await adapter.resolve();
    expect(url).toBe("https://station.example.com/radio.mp3");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://station.example.com/api/live/nowplaying/test",
    );

    // enrich should return song metadata
    const meta = await adapter.enrich();
    expect(meta).toEqual({ title: "Test Song", artist: "Test Artist" });

    delete globalThis.fetch;
  });

  it("should throw on API error", async () => {
    const el = makeEl({
      "data-source": "azuracast",
      "azuracast-api-url": "https://station.example.com/api/nowplaying/test",
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    const adapter = new AzuracastAdapter(el);
    await expect(adapter.resolve()).rejects.toThrow("API error 403");

    delete globalThis.fetch;
  });

  it("should throw on missing listen_url", async () => {
    const el = makeEl({
      "data-source": "azuracast",
      "azuracast-api-url": "https://station.example.com/api/nowplaying/test",
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ station: {} }),
    });

    const adapter = new AzuracastAdapter(el);
    await expect(adapter.resolve()).rejects.toThrow("no listen_url");

    delete globalThis.fetch;
  });
});

describe("IvooxAdapter", () => {
  it("should passthrough non-ivoox URLs", async () => {
    const el = makeEl({
      src: "https://example.com/audio.mp3",
      "data-source": "ivoox",
    });
    const adapter = new IvooxAdapter(el);
    await expect(adapter.resolve()).resolves.toBe("https://example.com/audio.mp3");
  });

  it("should extract og:audio from iVoox page HTML", async () => {
    const el = makeEl({
      src: "https://www.ivoox.com/episode_test",
      "data-source": "ivoox",
    });

    const fakeHtml = `<html><head>
      <meta property="og:audio" content="https://audio.ivoox.com/episode.mp3">
    </head></html>`;

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(fakeHtml),
    });

    const adapter = new IvooxAdapter(el);
    await expect(adapter.resolve()).resolves.toBe("https://audio.ivoox.com/episode.mp3");

    delete globalThis.fetch;
  });

  it("should fallback to src on fetch failure", async () => {
    const el = makeEl({
      src: "https://www.ivoox.com/episode_test",
      "data-source": "ivoox",
    });

    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

    const adapter = new IvooxAdapter(el);
    await expect(adapter.resolve()).resolves.toBe("https://www.ivoox.com/episode_test");

    delete globalThis.fetch;
  });

  it("should return null from enrich", async () => {
    const el = makeEl({
      src: "https://www.ivoox.com/episode_test",
      "data-source": "ivoox",
    });
    const adapter = new IvooxAdapter(el);
    await expect(adapter.enrich()).resolves.toBeNull();
  });
});

describe("createSourceAdapter", () => {
  it("should create LocalAdapter when data-source is local", () => {
    const el = makeEl({ src: "/audio.mp3", "data-source": "local" });
    const adapter = createSourceAdapter(el);
    expect(adapter).toBeInstanceOf(LocalAdapter);
  });

  it("should create AzuracastAdapter when data-source is azuracast", () => {
    const el = makeEl({ src: "/audio.mp3", "data-source": "azuracast" });
    const adapter = createSourceAdapter(el);
    expect(adapter).toBeInstanceOf(AzuracastAdapter);
  });

  it("should create IvooxAdapter when data-source is ivoox", () => {
    const el = makeEl({ src: "/audio.mp3", "data-source": "ivoox" });
    const adapter = createSourceAdapter(el);
    expect(adapter).toBeInstanceOf(IvooxAdapter);
  });

  it("should default to LocalAdapter when data-source is missing", () => {
    const el = makeEl({ src: "/audio.mp3" });
    const adapter = createSourceAdapter(el);
    expect(adapter).toBeInstanceOf(LocalAdapter);
  });

  it("should auto-detect ivoox from URL when data-source is absent", () => {
    const el = makeEl({ src: "https://www.ivoox.com/episode" });
    const adapter = createSourceAdapter(el);
    expect(adapter).toBeInstanceOf(IvooxAdapter);
  });

  it("should auto-detect azuracast from URL pattern", () => {
    const el = makeEl({ src: "https://station.azuracast.com/radio.mp3" });
    const adapter = createSourceAdapter(el);
    expect(adapter).toBeInstanceOf(AzuracastAdapter);
  });
});

describe("detectSourceType", () => {
  it("should return 'local' for relative paths", () => {
    expect(detectSourceType("/audio/episode.mp3")).toBe("local");
  });

  it("should return 'local' for standard audio URLs", () => {
    expect(detectSourceType("https://cdn.example.com/audio.mp3")).toBe("local");
  });

  it("should return 'ivoox' for iVoox URLs", () => {
    expect(detectSourceType("https://www.ivoox.com/episode-123")).toBe("ivoox");
  });

  it("should return 'azuracast' when URL contains azuracast", () => {
    expect(detectSourceType("https://stream.azuracast.com/radio.mp3")).toBe("azuracast");
  });

  it("should return 'local' for empty URL", () => {
    expect(detectSourceType("")).toBe("local");
  });

  it("should return 'local' for null URL", () => {
    expect(detectSourceType(null)).toBe("local");
  });
});
