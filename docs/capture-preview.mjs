import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "social-preview.html");
const outPath = path.join(__dirname, "social-preview.png");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 640 } });
  await page.goto("file://" + htmlPath);
  await page.waitForTimeout(500);
  await page.screenshot({ path: outPath, fullPage: false });
  await browser.close();
  console.log("Saved", outPath);
  console.log("Size:", fs.statSync(outPath).size, "bytes");
})();
