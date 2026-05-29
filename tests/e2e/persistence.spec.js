// @ts-check
import { test, expect } from "@playwright/test";

const KEY_PREFIX = "podcastPlayerState:";

test.describe("Player Persistence", () => {
  test("player has persistent attribute when enabled", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").first();

    // The shortcode sets persistent="true" by default
    await expect(player).toHaveAttribute("persistent", "");
  });

  test("player has framework DOM markers for persistence", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").first();

    // The Web Component adds these markers when persistent is present
    await expect(player).toHaveAttribute("data-turbolinks-permanent", "");
    await expect(player).toHaveAttribute("data-turbo-permanent", "");
    await expect(player).toHaveAttribute("hx-preserve", "true");
  });

  test("player keeps a stable ID for hx-preserve", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").first();
    const id = await player.getAttribute("id");
    expect(id).toMatch(/^pp-/);
  });

  test("second player has chapters attribute", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").nth(1);
    await expect(player).toHaveAttribute("chapters", /Intro.*News.*Topic/);
  });

  test("player state is saved to sessionStorage with per-instance key", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const player = page.locator("podcast-player").first();
    const src = await player.getAttribute("src");

    // Verify the element is rendered
    await expect(player).toBeAttached();

    // Directly invoke the save method (audio URLs are fake so timeupdate won't fire)
    await page.evaluate(() => {
      const el = document.querySelector("podcast-player");
      if (el) el._savePlaybackState();
    });

    // Check the per-instance key (prefix + src)
    const key = KEY_PREFIX + src;
    const state = await page.evaluate((k) => {
      return sessionStorage.getItem(k);
    }, key);

    expect(state).not.toBeNull();
    if (state) {
      const parsed = JSON.parse(state);
      expect(parsed).toHaveProperty("src");
      expect(parsed).toHaveProperty("currentTime");
      expect(parsed).toHaveProperty("paused");
      expect(parsed).toHaveProperty("volume");
      expect(parsed).toHaveProperty("muted");
      expect(parsed).toHaveProperty("playbackRate");
    }
  });

  test("two players have independent sessionStorage keys", async ({ page }) => {
    await page.goto("posts/test-episode/");
    const players = page.locator("podcast-player");
    await expect(players).toHaveCount(2);

    // Save state for both players
    await page.evaluate(() => {
      const els = document.querySelectorAll("podcast-player");
      els.forEach((el) => el._savePlaybackState());
    });

    // Check they use different keys
    const keys = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        keys.push(sessionStorage.key(i));
      }
      return keys;
    });

    const playerKeys = keys.filter((k) => k.startsWith(KEY_PREFIX));
    expect(playerKeys.length).toBe(2);
    expect(playerKeys[0]).not.toBe(playerKeys[1]);
  });
});
