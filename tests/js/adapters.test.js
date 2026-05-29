import { describe, it, expect } from "vitest";
import { detectSourceType, createSourceAdapter } from "../../assets/js/sources.js";
import { LocalAdapter, AzuracastAdapter, IvooxAdapter } from "../../assets/js/sources.js";

/**
 * Integration tests for source adapter detection and creation.
 */
describe("Source Type Detection", () => {
  describe("detectSourceType", () => {
    it("should detect local from relative path", () => {
      expect(detectSourceType("/audio/episode.mp3")).toBe("local");
    });

    it("should detect local from standard URL", () => {
      expect(detectSourceType("https://cdn.example.com/podcast.mp3")).toBe("local");
    });

    it("should detect azuracast from URL with azuracast", () => {
      expect(detectSourceType("https://stream.azuracast.com/radio.mp3")).toBe("azuracast");
    });

    it("should detect azuracast from .stream. domain", () => {
      expect(detectSourceType("https://radio.stream.example.com/live")).toBe("azuracast");
    });

    it("should detect ivoox from ivoox.com URL", () => {
      expect(detectSourceType("https://www.ivoox.com/episode-123")).toBe("ivoox");
    });

    it("should detect ivoox from subdomain ivoox.com URL", () => {
      expect(detectSourceType("https://audio.ivoox.com/episode.mp3")).toBe("ivoox");
    });

    it("should return local for empty string", () => {
      expect(detectSourceType("")).toBe("local");
    });

    it("should return local for null", () => {
      expect(detectSourceType(null)).toBe("local");
    });
  });

  describe("createSourceAdapter", () => {
    function makeEl(attrs = {}) {
      const el = document.createElement("podcast-player");
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      return el;
    }

    it("should create LocalAdapter for data-source=local", () => {
      const el = makeEl({ src: "/a.mp3", "data-source": "local" });
      expect(createSourceAdapter(el)).toBeInstanceOf(LocalAdapter);
    });

    it("should create AzuracastAdapter for data-source=azuracast", () => {
      const el = makeEl({ src: "/a.mp3", "data-source": "azuracast" });
      expect(createSourceAdapter(el)).toBeInstanceOf(AzuracastAdapter);
    });

    it("should create IvooxAdapter for data-source=ivoox", () => {
      const el = makeEl({ src: "/a.mp3", "data-source": "ivoox" });
      expect(createSourceAdapter(el)).toBeInstanceOf(IvooxAdapter);
    });

    it("should default to LocalAdapter without data-source", () => {
      const el = makeEl({ src: "/a.mp3" });
      expect(createSourceAdapter(el)).toBeInstanceOf(LocalAdapter);
    });

    it("should auto-detect ivoox from URL", () => {
      const el = makeEl({ src: "https://www.ivoox.com/episode" });
      expect(createSourceAdapter(el)).toBeInstanceOf(IvooxAdapter);
    });

    it("should auto-detect azuracast from URL", () => {
      const el = makeEl({ src: "https://station.azuracast.com/radio.mp3" });
      expect(createSourceAdapter(el)).toBeInstanceOf(AzuracastAdapter);
    });

    it("should prefer explicit data-source over URL detection", () => {
      const el = makeEl({
        src: "https://www.ivoox.com/episode",
        "data-source": "local",
      });
      expect(createSourceAdapter(el)).toBeInstanceOf(LocalAdapter);
    });
  });
});
