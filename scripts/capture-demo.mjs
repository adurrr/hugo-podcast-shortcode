import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:1311/wavecast';
const OUT = '/tmp/demo-frames';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();

let frame = 0;
const shot = async (label, delay = 800) => {
  await page.waitForTimeout(delay);
  const n = String(frame++).padStart(2, '0');
  await page.screenshot({ path: `${OUT}/frame-${n}-${label}.png` });
};

async function clickPlay() {
  await page.evaluate(() => {
    const pp = document.querySelector('podcast-player');
    if (pp && pp.shadowRoot) {
      pp.shadowRoot.querySelector('[part="play-btn"]')?.click();
    }
  });
}

async function clickClose() {
  await page.evaluate(() => {
    const f = document.querySelector('podcast-footer');
    if (f && f.shadowRoot) {
      f.shadowRoot.querySelector('[part="close-btn"]')?.click();
    }
  });
}

async function clickRateBtn() {
  await page.evaluate(() => {
    const pp = document.querySelector('podcast-player');
    if (pp && pp.shadowRoot) {
      pp.shadowRoot.querySelector('[part="rate-btn"]')?.click();
    }
  });
}

async function setVolume(value) {
  await page.evaluate((v) => {
    const pp = document.querySelector('podcast-player');
    if (pp && pp.shadowRoot) {
      const slider = pp.shadowRoot.querySelector('[part="volume"]');
      if (slider) {
        // Set value and dispatch input event
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(slider, String(v));
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, value);
}

async function footerIsActive() {
  return page.evaluate(() => {
    const f = document.querySelector('podcast-footer');
    return f && f.hasAttribute('active');
  });
}

async function waitFooterActive(timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await footerIsActive()) return;
    await page.waitForTimeout(100);
  }
  throw new Error('Footer did not become active');
}

async function waitFooterInactive(timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (!(await footerIsActive())) return;
    await page.waitForTimeout(100);
  }
  throw new Error('Footer did not become inactive');
}

// === 1. Homepage — inline player loaded ===
await page.goto(`${BASE}/`);
await page.waitForSelector('podcast-player');
await shot('01-homepage-inline-player', 1200);

// === 2. Click play → footer appears with SVG icons and poster ===
await clickPlay();
await waitFooterActive();
await shot('02-footer-appears-with-icons', 400);

// === 3. Change volume on inline → footer syncs ===
// Drag inline volume slider to 0.3 and capture footer following
await setVolume(0.3);
await page.waitForTimeout(600);
await shot('03-volume-sync-footer-follows', 200);

// === 4. Change playback speed on inline → footer syncs ===
await clickRateBtn(); // 1× → 1.25×
await page.waitForTimeout(400);
await shot('04-speed-sync-footer-follows', 200);

// === 5. Navigate to episode page → footer persists ===
await page.locator('a[href*="/episodes/"]').first().click();
await page.waitForTimeout(1800);
await waitFooterActive();
await shot('05-navigate-footer-persists');

// === 6. Interact with footer controls (skip forward) ===
await page.evaluate(() => {
  const f = document.querySelector('podcast-footer');
  if (f && f.shadowRoot) {
    f.shadowRoot.querySelector('[part="skip-fwd-btn"]')?.click();
  }
});
await page.waitForTimeout(600);
await shot('06-footer-skip-forward');

// === 7. Close footer ===
await clickClose();
await waitFooterInactive();
await shot('07-footer-closed');

// === 8. Navigate to another page → footer stays closed ===
await page.locator('a[href*="/programs/"]').first().click();
await page.waitForTimeout(1500);
await shot('08-navigate-footer-stays-closed');

await browser.close();
console.log(`Captured ${frame} frames to ${OUT}`);
