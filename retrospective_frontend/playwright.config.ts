import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  outputDir: 'test-results',
  use: {
    // localhost (pas 127.0.0.1) : API_BASE (src/lib/api.ts) déduit l'hôte de
    // l'API depuis window.location.hostname, et les mocks page.route() des
    // specs E2E ciblent tous http://localhost:8000 — un hôte différent de
    // 127.0.0.1 pour Playwright, donc aucun mock ne matchait plus rien.
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host localhost --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
  },
});
