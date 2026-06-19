import { defineConfig, devices } from "@playwright/test";

const basePath = "/auto-panda-motive/";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: `http://127.0.0.1:4321${basePath}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4321",
    url: `http://127.0.0.1:4321${basePath}`,
    reuseExistingServer: !process.env.CI,
  },
});
