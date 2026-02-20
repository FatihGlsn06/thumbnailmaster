import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    launchOptions: {
      executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
      args: ['--use-gl=swiftshader', '--enable-webgl', '--no-sandbox'],
    },
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 15000,
  },
});
