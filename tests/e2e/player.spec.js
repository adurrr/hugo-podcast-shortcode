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

  test.describe("Footer source link", () => {
    /** Synthesize a podcast-play event with a `url` field, used to drive
     *  the footer's source-link code path without depending on the audio
     *  network — the example posts use real SoundHelix mp3s which we
     *  don't want to actually play in CI. */
    const synthesizePlay = async (page, detail) => {
      await page.evaluate((d) => {
        const footer = document.querySelector("podcast-footer");
        if (footer) footer.setAttribute("active", "");
        document.dispatchEvent(new CustomEvent("podcast-play", {
          detail: Object.assign({
            src: "https://example.com/test.mp3",
            title: "Test Episode",
            poster: "",
            currentTime: 0,
          }, d),
        }));
      }, detail);
      await page.waitForTimeout(150);
    };

    test("url-override post: footer link is visible and points at the configured href", async ({ page }) => {
      await page.goto("posts/url-override/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Activate the footer via the inline player's play button.
      const playBtn = page.locator("podcast-player").first()
        .locator("[part='play-btn']");
      await playBtn.click();
      await expect(footer).toHaveAttribute("active", "");

      const result = await footer.evaluate((el) => {
        const a = el.shadowRoot?.querySelector(".source");
        if (!a) return null;
        return {
          tagName: a.tagName,
          href: a.getAttribute("href"),
          hidden: a.hidden,
        };
      });
      expect(result).not.toBeNull();
      expect(result.tagName).toBe("A");
      // The URL was normalized through `new URL(...)` in the implementation.
      // Compare against the canonical form.
      const expected = new URL("https://example.com/episodes/long-title-demo", page.url()).href;
      expect(result.href).toBe(expected);
      expect(result.hidden).toBe(false);
    });

    test("url-override post: footer link text is the domain (existing behavior preserved)", async ({ page }) => {
      await page.goto("posts/url-override/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Activate the footer.
      const playBtn = page.locator("podcast-player").first()
        .locator("[part='play-btn']");
      await playBtn.click();
      await expect(footer).toHaveAttribute("active", "");

      // The visible text label is the domain (stripped from the audio src,
      // not from the explicit url). This preserves existing visual behavior.
      const text = await footer.evaluate((el) => {
        return el.shadowRoot?.querySelector(".source")?.textContent ?? "";
      });
      expect(text).toContain("soundhelix.com");
    });

    test("url-hidden post: footer link is hidden (no href)", async ({ page }) => {
      await page.goto("posts/url-hidden/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Activate the footer.
      const playBtn = page.locator("podcast-player").first()
        .locator("[part='play-btn']");
      await playBtn.click();
      await expect(footer).toHaveAttribute("active", "");

      const result = await footer.evaluate((el) => {
        const a = el.shadowRoot?.querySelector(".source");
        if (!a) return null;
        return {
          tagName: a.tagName,
          hasHref: a.hasAttribute("href"),
          hidden: a.hidden,
        };
      });
      expect(result).not.toBeNull();
      expect(result.tagName).toBe("A");
      // "none" must clear the href and hide the link entirely.
      expect(result.hasHref).toBe(false);
      expect(result.hidden).toBe(true);
    });

    test("synthesized podcast-play with url='none' hides the link", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      await synthesizePlay(page, { url: "none" });

      const result = await footer.evaluate((el) => {
        const a = el.shadowRoot?.querySelector(".source");
        if (!a) return null;
        return {
          hasHref: a.hasAttribute("href"),
          hidden: a.hidden,
        };
      });
      expect(result).not.toBeNull();
      expect(result.hasHref).toBe(false);
      expect(result.hidden).toBe(true);
    });

    test("synthesized podcast-play with a valid URL shows the link with that href", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      await synthesizePlay(page, { url: "https://example.com/page" });

      const result = await footer.evaluate((el) => {
        const a = el.shadowRoot?.querySelector(".source");
        if (!a) return null;
        return {
          href: a.getAttribute("href"),
          hidden: a.hidden,
          ariaLabel: a.getAttribute("aria-label"),
        };
      });
      expect(result).not.toBeNull();
      expect(result.hidden).toBe(false);
      const expected = new URL("https://example.com/page", page.url()).href;
      expect(result.href).toBe(expected);
      // The localized aria-label is applied when the link is revealed.
      expect(result.ariaLabel).toBe("View episode");
    });

    test("top-level <podcast-footer url='...'> override beats the inline player's url", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Set the top-level override at runtime.
      await footer.evaluate((el) => {
        el.setAttribute("url", "https://override.example.com");
      });

      // Now dispatch a podcast-play with a DIFFERENT inline url. The
      // override must win.
      await page.evaluate(() => {
        const footer = document.querySelector("podcast-footer");
        if (footer) footer.setAttribute("active", "");
        document.dispatchEvent(new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/test.mp3",
            title: "Test",
            poster: "",
            url: "https://inline.example.com",
            currentTime: 0,
          },
        }));
      });
      await page.waitForTimeout(150);

      const result = await footer.evaluate((el) => {
        const a = el.shadowRoot?.querySelector(".source");
        return {
          href: a?.getAttribute("href"),
          hidden: a?.hidden,
        };
      });
      expect(result.hidden).toBe(false);
      const expected = new URL("https://override.example.com", page.url()).href;
      expect(result.href).toBe(expected);
    });
  });

  test.describe("Footer size attribute", () => {
    /** Synthesize a podcast-play event that activates the footer. Used
     *  to drive the cover-sizing code path without depending on the
     *  audio network. */
    const synthesizePlay = async (page) => {
      await page.evaluate(() => {
        const footer = document.querySelector("podcast-footer");
        if (footer) footer.setAttribute("active", "");
        document.dispatchEvent(new CustomEvent("podcast-play", {
          detail: {
            src: "https://example.com/test.mp3",
            title: "Size Test",
            poster: "",
            currentTime: 0,
          },
        }));
      });
      await page.waitForTimeout(150);
    };

    /** Read the rendered width (in px) of the footer's cover element.
     *  Returns NaN if the cover can't be found. Uses page.evaluate
     *  (not locator.evaluate) to avoid Playwright's auto-wait on
     *  visibility — the footer host starts with `display: none` until
     *  the `active` attribute is set, and locator.evaluate can hang
     *  waiting for it to become "actionable" even when the shadow DOM
     *  is fully laid out. */
    const getCoverWidthPx = async (page) => {
      const w = await page.evaluate(() => {
        const footer = document.querySelector("podcast-footer");
        const cover = footer?.shadowRoot?.querySelector(".cover");
        if (!cover) return null;
        // The CSS rule sets width as a length (e.g. "48px"). Strip the
        // unit before returning a number.
        return getComputedStyle(cover).width;
      });
      return w ? parseFloat(w) : NaN;
    };

    test("a. example site footer has size='medium' on every page", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();
      await expect(footer).toHaveAttribute("size", "medium");
    });

    test("b. with size='medium', the cover is larger than the 36px default", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Activate the footer so its shadow DOM is fully laid out.
      await synthesizePlay(page);

      const widthPx = await getCoverWidthPx(page);
      expect(widthPx).toBeGreaterThan(36);
    });

    test("c. setting size='small' at runtime shrinks the cover back to 36px", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Sanity: the example footer starts in "medium" mode.
      await expect(footer).toHaveAttribute("size", "medium");

      // Activate the footer (the example site has size='medium', so the
      // cover should be > 36px here).
      await synthesizePlay(page);
      const mediumWidth = await getCoverWidthPx(page);
      expect(mediumWidth).toBeGreaterThan(36);

      // Override the size at runtime. There's no :host([size='small'])
      // rule, so the CSS var falls back to the original hardcoded value
      // of 36px.
      await footer.evaluate((el) => el.setAttribute("size", "small"));
      await page.waitForTimeout(150);

      const smallWidth = await getCoverWidthPx(page);
      expect(smallWidth).toBe(36);
    });

    test("d. setting size='large' makes the cover even bigger than medium", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      await synthesizePlay(page);
      const mediumWidth = await getCoverWidthPx(page);
      expect(mediumWidth).toBeGreaterThan(36);

      // Flip to large — the :host([size='large']) rule sets the cover
      // to 64px.
      await footer.evaluate((el) => el.setAttribute("size", "large"));
      await page.waitForTimeout(150);

      const largeWidth = await getCoverWidthPx(page);
      expect(largeWidth).toBeGreaterThan(mediumWidth);
      expect(largeWidth).toBe(64);
    });

    test("e. on a narrow viewport, all size variants collapse to the compact layout", async ({ page }) => {
      // Mobile viewport (iPhone SE width) — narrower than the 768px
      // breakpoint that the size media query targets.
      await page.setViewportSize({ width: 375, height: 812 });

      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Force the largest variant — on desktop this would be 64px, but
      // the @media (max-width: 768px) override collapses it to 28px.
      await footer.evaluate((el) => el.setAttribute("size", "large"));
      await synthesizePlay(page);
      await page.waitForTimeout(150);

      const widthPx = await getCoverWidthPx(page);
      // The mobile media query sets --podcast-footer-cover-size: 28px,
      // so the rendered cover must be 28px — NOT 64px.
      expect(widthPx).toBe(28);
    });

    test("f. the size attribute survives a page navigation (Turbolinks permanent)", async ({ page }) => {
      await page.goto("posts/test-episode/");
      const footer = page.locator("podcast-footer");
      await expect(footer).toBeAttached();

      // Activate and override the size at runtime.
      await synthesizePlay(page);
      await footer.evaluate((el) => el.setAttribute("size", "large"));
      await expect(footer).toHaveAttribute("size", "large");

      // Navigate via a header link (Turbolinks).
      await page.locator('header nav a', { hasText: 'Programs' }).click();
      await page.waitForTimeout(1000);

      // The footer is preserved (data-turbolinks-permanent) and the
      // size attribute survives with the element.
      await expect(footer).toHaveAttribute("active", "");
      await expect(footer).toHaveAttribute("size", "large");
    });
  });
});
