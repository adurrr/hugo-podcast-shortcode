import { describe, it, expect } from "vitest";

describe("PodcastPlayer Web Component", () => {
  it("should be defined as a custom element", () => {
    // This test will fail until the Web Component is registered in Phase 3.
    // It follows the RED phase of TDD.
    expect(customElements.get("podcast-player")).toBeDefined();
  });

  it("should render a shadow root", () => {
    const el = document.createElement("podcast-player");
    document.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
    document.body.removeChild(el);
  });

  it("should reflect src attribute to internal audio element", () => {
    const el = document.createElement("podcast-player");
    el.setAttribute("src", "https://example.com/test.mp3");
    document.body.appendChild(el);
    // Will be implemented in Phase 3
    document.body.removeChild(el);
  });
});
