import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3100",
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
      // Compiles every route once, serially, so the parallel projects are not racing
      // the dev server's on-demand compiler. See the comment in warm.setup.ts.
      name: "warm",
      testMatch: /warm\.setup\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        storageState: "e2e/.auth/operator.json",
      },
    },
    {
      name: "chromium",
      testIgnore:
        /auth\.(setup|spec)\.ts|warm\.setup\.ts|operator(-records)?\.(evidence\.)?spec\.ts/,
      dependencies: ["warm"],
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        storageState: "e2e/.auth/observer.json",
      },
    },
    {
      name: "operator",
      testMatch: /operator\.spec\.ts/,
      dependencies: ["warm"],
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
      testMatch: /auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  // Own ports, never reused: e2e must not attach to a dev:stack web server on :3000
  // (real platform) or a dev:fake platform on :4100 whose Origin is :3000.
  webServer: [
    {
      command: "node e2e/fake-platform.mjs",
      url: "http://127.0.0.1:4110/health",
      reuseExistingServer: false,
      env: { FAKE_PLATFORM_PORT: "4110", FAKE_PLATFORM_APP_URL: "http://localhost:3100" },
    },
    {
      command: "npm run dev -- --port 3100",
      url: "http://localhost:3100/en",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        DARKVIEW_PLATFORM_API_URL: "http://127.0.0.1:4110",
        APP_URL: "http://localhost:3100",
      },
    },
  ],
});
