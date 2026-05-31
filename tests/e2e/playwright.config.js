// @ts-check
import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exampleSite = path.resolve(__dirname, "../../exampleSite");

// Derive the subpath from Hugo's baseURL for local testing.
// Hugo's server respects the baseURL subpath (e.g. /wavecast/)
// when one is present, so we must match it in Playwright's URL config.
const HUGO_PORT = 1313;
const BASE_PATH = "/wavecast";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "../test-results" }]],
  use: {
    baseURL: `http://localhost:${HUGO_PORT}${BASE_PATH}/`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `hugo server --source "${exampleSite}" --port ${HUGO_PORT} --noHTTPCache`,
    url: `http://localhost:${HUGO_PORT}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
