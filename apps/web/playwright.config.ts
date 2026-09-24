import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "chromium",
      testIgnore: /auth\.(setup|spec)\.ts|shell-signed-out\.spec\.ts|operator(-records)?\.(evidence\.)?spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        storageState: "e2e/.auth/observer.json",
      },
    },
    {
      name: "operator",
      testMatch: /operator\.spec\.ts/,
      dependencies: ["setup"],
      // The DV-077 evidence includes a recording of Park acting on a simulated mission.
      use: { ...devices["Desktop Chrome"], channel: "chrome", video: "on" },
    },
    {
      // Writes docs/evidence/dv-077. Run on its own -- it mutates the fake platform's
      // mode and parked state, which the operator project also reads.
      name: "operator-evidence",
      testMatch: /operator\.evidence\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      // DV-078. Writes docs/evidence/dv-078, and cancels a mission and disables a
      // target in the fake, so it runs on its own like the other operator projects.
      name: "operator-records",
      testMatch: /operator-records\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "signed-out",
      testMatch: /(auth|shell-signed-out)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: [
    {
      command: "node e2e/fake-platform.mjs",
      url: "http://127.0.0.1:4100/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000/en",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { DARKVIEW_PLATFORM_API_URL: "http://127.0.0.1:4100" },
    },
  ],
});
