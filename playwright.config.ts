import { defineConfig, devices } from "@playwright/test";

// Drive the app at this base URL. Override with PLAYWRIGHT_BASE_URL.
// Default to a dedicated port 3100 (not the dev server's 3000) on 127.0.0.1
// (not "localhost", to dodge the IPv6 quirk on this Windows box). e2e runs
// against a PRODUCTION build: Next 16's dev server fails to hydrate in headless
// Chromium (its HMR websocket bails), so onClick handlers are dead under `next
// dev`. `next start` has no HMR and hydrates cleanly — and as a bonus it runs
// on its own port, never colliding with a dev server you have on 3000.
const BASE = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,                 // builds stream; give each test room
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,                      // tests mutate the shared dev DB — run serially
  retries: 1,
  reporter: [["list"]],
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Build once and serve a production build on port 3100. Reuses it if already
  // up (fast repeat runs); otherwise builds + starts it (first run ~30-60s).
  // Use `next build` directly (not `npm run build`) to skip the `prisma
  // generate` step — the client is already generated, and regenerating it
  // fails with EPERM if any server has the query-engine DLL open.
  webServer: {
    command: "npx next build && npx next start -p 3100",
    url: BASE,
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
