// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Podcast Player E2E", () => {
  test("page loads with podcast-player element", async ({ page }) => {
    await page.goto("/posts/test-episode/");
    const player = page.locator("podcast-player");
    await expect(player).toBeAttached();
  });

  test("player has src attribute from shortcode", async ({ page }) => {
    await page.goto("/posts/test-episode/");
    const player = page.locator("podcast-player");
    await expect(player).toHaveAttribute("src", /\.mp3$/);
  });
});
