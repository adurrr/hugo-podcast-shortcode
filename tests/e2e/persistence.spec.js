// @ts-check
import { test, expect } from "@playwright/test";

test.describe("Player Persistence", () => {
  test("player persists across page navigation", async ({ page }) => {
    // This test verifies that the <podcast-player> element is preserved
    // when navigating between pages. Will be fully implemented in Phase 4.
    test.fixme("Persistence layer not yet implemented — Phase 4");

    await page.goto("/posts/test-episode/");
    const player = page.locator("podcast-player");

    // Navigate to another page
    await page.click("a[href='/']");
    await page.waitForURL("/");

    // Player should still be in the DOM
    await expect(player).toBeAttached();
  });
});
