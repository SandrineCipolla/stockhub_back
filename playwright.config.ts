import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3006',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'API Tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // webServer disabled - server should be running manually with npm run start:dev
  // webServer: {
  //   command: 'npm start',
  //   url: 'http://localhost:3006',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});
