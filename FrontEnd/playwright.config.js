import process from 'node:process';
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: { baseURL: process.env.ORBIT_BASE_URL || 'http://127.0.0.1:5173', headless: true },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
