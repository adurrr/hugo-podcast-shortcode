// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Podcast Player E2E", () => {
  test("page loads with podcast-player elements", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const players = page.locator("podcast-player");
    await expect(players.first()).toBeAttached();
    await expect(players).toHaveCount(2);
  });

  test("player has src attribute from shortcode", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").first();
    await expect(player).toHaveAttribute("src", /soundhelix|SoundHelix/);
  });

  test("player title is rendered", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").first();
    await expect(player).toHaveAttribute("title", /Hello World/);
  });

  test("player has shadow DOM with controls", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").first();
    const shadow = await player.evaluateHandle((el) => el.shadowRoot);
    expect(shadow).not.toBeNull();
  });

  test("play button exists in shadow DOM", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const playBtn = page.locator("podcast-player").first()
      .locator("[part='play-btn']");
    await expect(playBtn).toBeAttached();
  });

  test.describe("Podcast Footer", () => {
    test("footer element exists and has shadow DOM", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();
      const shadow = await footer.evaluateHandle((el) => el.shadowRoot);
      expect(shadow).not.toBeNull();
    });

    test("footer is hidden by default, activates on play click", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).not.toHaveAttribute("active");

      // Click play on first inline player — dispatches podcast-play event
      const playBtn = page.locator("podcast-player").first()
        .locator("[part='play-btn']");
      await playBtn.click();

      // Footer should become active and show the episode title
      await expect(footer).toHaveAttribute("active", "");
      await expect(footer.locator("[part='title']")).toHaveText(/Hello World/);
    });

    test("close button hides the footer", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");

      // Activate footer via play
      const playBtn = page.locator("podcast-player").first()
        .locator("[part='play-btn']");
      await playBtn.click();
      await expect(footer).toHaveAttribute("active", "");

      // Click close button
      await footer.locator("[part='close-btn']").click();
      await expect(footer).not.toHaveAttribute("active");
    });

    test("Turbolinks: audio persists across navigation", async ({ page }) => {
      await page.goto("posts/test-episode/");

      // Activate footer via play
      const playBtn = page.locator("podcast-player").first()
        .locator("[part='play-btn']");
      await playBtn.click();
      await page.waitForTimeout(1000);

      // Navigate via Turbolinks (click an internal link)
      await page.locator('header nav a', { hasText: 'Second Episode' }).click();
      await page.waitForTimeout(1000);

      // Footer should still be active and playing
      const footer = page.locator("podcast-footer");
      await expect(footer).toHaveAttribute("active", "");
      // The play button should show "⏸" (pause icon) indicating audio is playing
      await expect(footer.locator("[part='play-btn']")).toHaveText("⏸");
    });
  });
});
