import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:1313';
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
const shot = async (label, delay = 600) => {
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

async function footerIsActive() {
  return page.evaluate(() => {
    const f = document.querySelector('podcast-footer');
    return f && f.hasAttribute('active');
  });
}

async function waitFooterActive(timeout = 5000) {
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

// === 1. Homepage — show inline player ===
await page.goto(`${BASE}/`);
await page.waitForSelector('podcast-player');
await shot('01-homepage-inline-player', 1000);

// === 2. Click play on first player → footer appears ===
await clickPlay();
await waitFooterActive();
await shot('02-footer-appeared');

// === 3. Navigate to a post page → footer persists ===
await page.locator('a[href="/posts/test-episode/"]').first().click();
await page.waitForTimeout(1500);
await waitFooterActive();
await shot('03-navigate-footer-persists');

// === 4. Navigate back to home — footer still there ===
await page.locator('a[href="/"]').first().click();
await page.waitForTimeout(1500);
await waitFooterActive();
await shot('04-navigate-back-footer-still-there');

// === 5. Close footer ===
await clickClose();
await waitFooterInactive();
await shot('05-footer-closed');

// === 6. Navigate again — footer should NOT reappear ===
await page.locator('a[href="/posts/test-episode/"]').first().click();
await page.waitForTimeout(1500);
await shot('06-navigate-no-footer');

await browser.close();
console.log(`Captured ${frame} frames to ${OUT}`);
