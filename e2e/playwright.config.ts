import { defineConfig, devices } from '@playwright/test'

// Puertos propios de los tests, distintos de los de desarrollo, para que
// no choquen con un `pnpm dev` abierto ni usen su base de datos.
const API_PORT = 3100
const WEB_PORT = 5174

const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Móvil Android con 360 px de ancho, el más habitual en teléfonos
      name: 'mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 360, height: 800 } },
    },
  ],

  // Levanta la API con una base de datos en memoria, recién sembrada, y la web
  // apuntando a ella.
  webServer: [
    {
      command: 'pnpm --filter @devjobs/api exec tsx src/server.ts',
      cwd: '..',
      url: `http://localhost:${API_PORT}/api/health`,
      env: { PORT: String(API_PORT), DB_PATH: ':memory:' },
      reuseExistingServer: !isCI,
    },
    {
      command: `pnpm --filter @devjobs/web exec vite --port ${WEB_PORT} --strictPort`,
      cwd: '..',
      url: `http://localhost:${WEB_PORT}`,
      env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
      reuseExistingServer: !isCI,
    },
  ],
})
