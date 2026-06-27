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

  test.describe("Footer title scrolling", () => {
    /** Synthesize a podcast-play event that activates the footer with the
     *  given title. Used to drive the marquee code without depending on a
     *  specific example post having a long title. */
    const synthesizePlay = async (page, title) => {
      await page.evaluate((t) => {
        const footer = document.querySelector("podcast-footer");
        if (footer) footer.setAttribute("active", "");
        document.dispatchEvent(new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/test.mp3",
            title: t,
            poster: "",
          },
        }));
      }, title);
      // Give the footer's requestAnimationFrame a chance to run.
      await page.waitForTimeout(150);
    };

    test("footer shadow DOM contains a .title-text span inside .title", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      const hasInner = await footer.evaluate((el) => {
        const title = el.shadowRoot?.querySelector(".title");
        const inner = el.shadowRoot?.querySelector(".title-text");
        return !!title && !!inner && title.contains(inner);
      });
      expect(hasInner).toBe(true);
    });

    test("short title does not set data-overflow on the footer title", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Use a known short title — the footer's available width is narrow
      // enough that even the example post's "Episode 42: Hello World"
      // overflows. Synthesizing the event with a deterministic short
      // string makes the assertion independent of the post content.
      await synthesizePlay(page, "Hi");

      const result = await footer.evaluate((el) => {
        const title = el.shadowRoot?.querySelector(".title");
        return {
          hasOverflow: title?.hasAttribute("data-overflow") ?? false,
          distance: title?.style.getPropertyValue("--marquee-distance") ?? "",
        };
      });
      expect(result.hasOverflow).toBe(false);
      expect(result.distance).toBe("");
    });

    test("long title sets data-overflow, CSS vars, and runs the marquee animation", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Synthesize a long title to force overflow.
      const longTitle = "A".repeat(500) + " — this is a very long episode title to force overflow";
      await synthesizePlay(page, longTitle);

      const result = await footer.evaluate((el) => {
        const title = el.shadowRoot?.querySelector(".title");
        const titleText = el.shadowRoot?.querySelector(".title-text");
        if (!title || !titleText) return null;
        const cs = getComputedStyle(titleText);
        return {
          hasOverflow: title.hasAttribute("data-overflow"),
          distance: title.style.getPropertyValue("--marquee-distance"),
          duration: title.style.getPropertyValue("--marquee-duration"),
          animationName: cs.animationName,
          animationPlayState: cs.animationPlayState,
        };
      });

      expect(result).not.toBeNull();
      expect(result.hasOverflow).toBe(true);
      expect(result.distance).not.toBe("");
      expect(result.duration).not.toBe("");
      expect(result.animationName).toBe("marquee");
      expect(result.animationPlayState).toBe("running");
    });

    test("prefers-reduced-motion: reduce disables the marquee animation", async ({ page }) => {
      // Opt into reduced motion before the page loads so the CSS media
      // query resolves to "reduce" for the duration of the test.
      await page.emulateMedia({ reducedMotion: "reduce" });

      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      const longTitle = "A".repeat(500) + " — long title under reduced motion";
      await synthesizePlay(page, longTitle);

      const result = await footer.evaluate((el) => {
        const title = el.shadowRoot?.querySelector(".title");
        const titleText = el.shadowRoot?.querySelector(".title-text");
        if (!title || !titleText) return null;
        const cs = getComputedStyle(titleText);
        return {
          hasOverflow: title.hasAttribute("data-overflow"),
          animationName: cs.animationName,
        };
      });

      expect(result).not.toBeNull();
      // Detection still runs — the attribute is set.
      expect(result.hasOverflow).toBe(true);
      // But the animation is suppressed.
      expect(result.animationName).toBe("none");
    });

    test("marquee state survives a page navigation (Turbolinks permanent)", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      const longTitle = "A".repeat(500) + " — long title that must survive navigation";
      await synthesizePlay(page, longTitle);

      // Sanity: the marquee is active before navigation.
      const before = await footer.evaluate((el) => {
        const title = el.shadowRoot?.querySelector(".title");
        return {
          hasOverflow: title?.hasAttribute("data-overflow") ?? false,
          distance: title?.style.getPropertyValue("--marquee-distance") ?? "",
        };
      });
      expect(before.hasOverflow).toBe(true);
      expect(before.distance).not.toBe("");

      // Navigate via a header link (Turbolinks).
      await page.locator('header nav a', { hasText: 'Programs' }).click();
      await page.waitForTimeout(1000);

      // Footer is preserved (data-turbolinks-permanent) and still active.
      await expect(footer).toHaveAttribute("active", "");
      const after = await footer.evaluate((el) => {
        const title = el.shadowRoot?.querySelector(".title");
        return {
          hasOverflow: title?.hasAttribute("data-overflow") ?? false,
          distance: title?.style.getPropertyValue("--marquee-distance") ?? "",
        };
      });
      expect(after.hasOverflow).toBe(true);
      expect(after.distance).not.toBe("");
    });

    test("hovering the title pauses the marquee animation", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      const longTitle = "A".repeat(500) + " — long title for hover pause test";
      await synthesizePlay(page, longTitle);

      // Sanity: the animation is running before hover.
      const before = await footer.evaluate((el) => {
        const titleText = el.shadowRoot?.querySelector(".title-text");
        return getComputedStyle(titleText).animationPlayState;
      });
      expect(before).toBe("running");

      // Hover the title element (the part="title" exposes the parent .title
      // so the :hover rule from the shadow stylesheet applies).
      await footer.locator("[part='title']").hover();

      // The :hover rule sets animation-play-state: paused.
      const after = await footer.evaluate((el) => {
        const titleText = el.shadowRoot?.querySelector(".title-text");
        return getComputedStyle(titleText).animationPlayState;
      });
      expect(after).toBe("paused");
    });
  });

  test.describe("Mobile Responsive", () => {
    test("time-duration stays inside player bounds on narrow viewports", async ({ page }) => {
      // Test with a narrow mobile viewport (iPhone SE width)
      await page.setViewportSize({ width: 375, height: 812 });

      // Use the democratizing-security episode which has ~61 min duration
      await page.goto("episodes/r2-19-democratizing-security/");
      const player = page.locator("podcast-player").first();
      await expect(player).toBeAttached();

      // Click play to trigger metadata load (time-duration changes from --:--)
      const playBtn = player.locator("[part='play-btn']");
      await playBtn.click();

      // Wait for time-duration to show actual duration (not "--:--")
      const timeDuration = player.locator("[part='time-duration']");
      await expect(timeDuration).not.toHaveText("--:--", { timeout: 15000 });

      // Get bounding boxes and verify time-duration is inside the player
      const playerBox = await player.boundingBox();
      const timeBox = await timeDuration.boundingBox();

      expect(playerBox).not.toBeNull();
      expect(timeBox).not.toBeNull();

      if (playerBox && timeBox) {
        // Right edge of time-duration must be <= right edge of the host element
        expect(timeBox.x + timeBox.width).toBeLessThanOrEqual(
          playerBox.x + playerBox.width,
        );
        // Left edge must be >= player's left edge
        expect(timeBox.x).toBeGreaterThanOrEqual(playerBox.x);
      }
    });
  });
});
