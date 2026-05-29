// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Podcast Player E2E", () => {
  test("page loads with podcast-player elements", async ({ page }) => {
    await page.goto("/posts/test-episode/");
    const players = page.locator("podcast-player");
    await expect(players.first()).toBeAttached();
    await expect(players).toHaveCount(2);
  });

  test("player has src attribute from shortcode", async ({ page }) => {
    await page.goto("/posts/test-episode/");
    const player = page.locator("podcast-player").first();
    await expect(player).toHaveAttribute("src", /example\.com\/audio/);
  });

  test("player title is rendered", async ({ page }) => {
    await page.goto("/posts/test-episode/");
    const player = page.locator("podcast-player").first();
    await expect(player).toHaveAttribute("title", /Episode 42/);
  });

  test("player has shadow DOM with controls", async ({ page }) => {
    await page.goto("/posts/test-episode/");
    const player = page.locator("podcast-player").first();
    const shadow = await player.evaluateHandle((el) => el.shadowRoot);
    expect(shadow).not.toBeNull();
  });

  test("play button exists in shadow DOM", async ({ page }) => {
    await page.goto("/posts/test-episode/");
    const playBtn = page.locator("podcast-player").first()
      .locator("[part='play-btn']");
    await expect(playBtn).toBeAttached();
  });
});
