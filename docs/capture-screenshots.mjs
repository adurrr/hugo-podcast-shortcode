import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "images");

async function capture(url, outputName) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const outPath = path.join(outDir, outputName);
  await page.screenshot({ path: outPath, fullPage: true });
  console.log("Saved", outPath, `(${fs.statSync(outPath).size} bytes)`);
  await browser.close();
}

// Requires a running Hugo server on port 1313
capture("http://localhost:1313/wavecast/", "screenshot.png");
capture("http://localhost:1313/wavecast/", "tn.png");
