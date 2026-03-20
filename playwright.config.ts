import type { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"

const port = Number.parseInt(process.env.VITE_PORT ?? "4173") // Vite's default port when running `vite preview`
const timeout = Number.parseInt(process.env.WAIT_ON_TIMEOUT ?? `${20 * 1000}`)

const config: PlaywrightTestConfig = {
  testDir: ".",
  timeout: 10000,
  retries: process.env.CI === "true" ? 1 : 0,
  use: {
    viewport: { width: 1280, height: 720 },
    acceptDownloads: true,
    baseURL: `http://localhost:${port}`,
    screenshot: "only-on-failure",
  },
  reporter:
    process.env.CI === "true"
      ? [["dot"], ["html", { outputFolder: "test-results" }]]
      : "list",
  projects: [
    {
      name: "e2e",
      testDir: "./test/e2e",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
    {
      name: "a11y",
      testDir: "./test/a11y",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
  ],
  webServer: {
    command: `npm run serve -- --port ${port}`,
    port,
    timeout,
  },
}

export default config
