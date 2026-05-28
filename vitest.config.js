import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/js/**/*.test.{js,ts}"],
    environment: "jsdom",
    globals: true,
  },
});
