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
      await page.locator('header nav a', { hasText: 'Programs' }).click();
      await page.waitForTimeout(1000);

      // Footer should still be active and playing
      const footer = page.locator("podcast-footer");
      await expect(footer).toHaveAttribute("active", "");
      // The play button should show the pause icon indicating audio is playing
      await expect(footer.locator("[part='play-btn']")).toHaveAttribute("aria-label", "Pause");
    });

    test.describe("Bidirectional play/pause sync", () => {
      test("pause on inline player pauses both", async ({ page }) => {
        await page.goto("posts/test-episode/");
        const footer = page.locator("podcast-footer");
        const playBtn = page.locator("podcast-player").first()
          .locator("[part='play-btn']");

        // Play on inline
        await playBtn.click();
        await expect(footer).toHaveAttribute("active", "");
        await expect(footer.locator("[part='play-btn']")).toHaveAttribute("aria-label", "Pause");
        await expect(playBtn).toHaveAttribute("aria-label", "Pause");

        // Pause on inline
        await playBtn.click();
        await expect(footer.locator("[part='play-btn']")).toHaveAttribute("aria-label", "Play");
        await expect(playBtn).toHaveAttribute("aria-label", "Play");
      });

      test("pause on footer pauses both", async ({ page }) => {
        await page.goto("posts/test-episode/");
        const footer = page.locator("podcast-footer");
        const playBtn = page.locator("podcast-player").first()
          .locator("[part='play-btn']");
        const footerPlayBtn = footer.locator("[part='play-btn']");

        // Play on inline
        await playBtn.click();
        await expect(playBtn).toHaveAttribute("aria-label", "Pause");
        await expect(footerPlayBtn).toHaveAttribute("aria-label", "Pause");

        // Pause on footer
        await footerPlayBtn.click();
        await expect(footerPlayBtn).toHaveAttribute("aria-label", "Play");
        await expect(playBtn).toHaveAttribute("aria-label", "Play");
      });

      test("play on footer after pause resumes both", async ({ page }) => {
        await page.goto("posts/test-episode/");
        const footer = page.locator("podcast-footer");
        const playBtn = page.locator("podcast-player").first()
          .locator("[part='play-btn']");
        const footerPlayBtn = footer.locator("[part='play-btn']");

        // Play on inline
        await playBtn.click();
        await page.waitForTimeout(500);
        await expect(footerPlayBtn).toHaveAttribute("aria-label", "Pause");
        await expect(playBtn).toHaveAttribute("aria-label", "Pause");

        // Pause on footer
        await footerPlayBtn.click();
        await page.waitForTimeout(500);
        await expect(footerPlayBtn).toHaveAttribute("aria-label", "Play");
        await expect(playBtn).toHaveAttribute("aria-label", "Play");

        // Play on footer — both resume
        await footerPlayBtn.click();
        await page.waitForTimeout(1500);
        await expect(footerPlayBtn).toHaveAttribute("aria-label", "Pause");
        await expect(playBtn).toHaveAttribute("aria-label", "Pause");
      });

      test("close footer pauses inline player", async ({ page }) => {
        await page.goto("posts/test-episode/");
        const footer = page.locator("podcast-footer");
        const firstInline = page.locator("podcast-player").first();
        const playBtn = firstInline.locator("[part='play-btn']");

        // Play on inline
        await playBtn.click();
        await expect(playBtn).toHaveAttribute("aria-label", "Pause");
        await expect(footer).toHaveAttribute("active", "");

        // Verify inline player audio is actually playing
        const playing = await firstInline.evaluate(el => !el._audio.paused);
        expect(playing).toBe(true);

        // Close footer
        await footer.locator("[part='close-btn']").click();
        await expect(footer).not.toHaveAttribute("active");

        // Inline player audio should now be paused
        const paused = await firstInline.evaluate(el => el._audio.paused);
        expect(paused).toBe(true);
        // Button should show play icon
        await expect(playBtn).toHaveAttribute("aria-label", "Play");
      });

      test.describe("Single-stream (only one song at a time)", () => {
        test("playing second inline stops the first", async ({ page }) => {
          await page.goto("posts/test-episode/");
          const firstInline = page.locator("podcast-player").first();
          const secondInline = page.locator("podcast-player").nth(1);
          const firstPlayBtn = firstInline.locator("[part='play-btn']");
          const secondPlayBtn = secondInline.locator("[part='play-btn']");
          const footer = page.locator("podcast-footer");

          // Play first inline player
          await firstPlayBtn.click();
          await expect(firstPlayBtn).toHaveAttribute("aria-label", "Pause");
          await expect(footer).toHaveAttribute("active", "");
          expect(await firstInline.evaluate(el => el._audio.paused)).toBe(false);

          // Play second inline player
          await secondPlayBtn.click();
          await expect(secondPlayBtn).toHaveAttribute("aria-label", "Pause");
          await expect(footer).toHaveAttribute("active", "");

          // First should now be stopped, second should be playing
          expect(await firstInline.evaluate(el => el._audio.paused)).toBe(true);
          expect(await secondInline.evaluate(el => el._audio.paused)).toBe(false);
          await expect(firstPlayBtn).toHaveAttribute("aria-label", "Play");
        });

        test("can switch back to first player", async ({ page }) => {
          await page.goto("posts/test-episode/");
          const firstInline = page.locator("podcast-player").first();
          const secondInline = page.locator("podcast-player").nth(1);
          const firstPlayBtn = firstInline.locator("[part='play-btn']");
          const secondPlayBtn = secondInline.locator("[part='play-btn']");
          const footer = page.locator("podcast-footer");

          // Play first, then second
          await firstPlayBtn.click();
          await expect(firstPlayBtn).toHaveAttribute("aria-label", "Pause");
          await secondPlayBtn.click();
          await expect(secondPlayBtn).toHaveAttribute("aria-label", "Pause");
          await expect(firstPlayBtn).toHaveAttribute("aria-label", "Play");

          // Switch back to first
          await firstPlayBtn.click();
          await expect(firstPlayBtn).toHaveAttribute("aria-label", "Pause");
          await expect(secondPlayBtn).toHaveAttribute("aria-label", "Play");

          // Only first should be playing
          expect(await firstInline.evaluate(el => el._audio.paused)).toBe(false);
          expect(await secondInline.evaluate(el => el._audio.paused)).toBe(true);
        });
      });
    });
  });
});
