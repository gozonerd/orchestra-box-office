import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for end-to-end testing
 * Tests critical user flows: auth, sync, budgets, reporting
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  reporter: "html",

  use: {
    baseURL: "tauri://localhost",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["desktop chromium"] },
    },
  ],

  webServer: {
    command: "npm run tauri:dev",
    url: "http://localhost:1420",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
