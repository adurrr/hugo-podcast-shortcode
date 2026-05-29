// @ts-check
import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exampleSite = path.resolve(__dirname, "../../exampleSite");

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "../test-results" }]],
  use: {
    baseURL: "http://localhost:1313",
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
    command: `hugo server --source "${exampleSite}" --port 1313 --noHTTPCache`,
    url: "http://localhost:1313",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
