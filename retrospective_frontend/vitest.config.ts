import { defineConfig, defaultExclude } from 'vitest/config'
import path from 'path'

// Config de test séparée de vite.config.ts (utilisé pour le build/dev)
// afin de ne pas mélanger les deux préoccupations.
// L'alias "@" est répliqué depuis vite.config.ts pour que les imports
// du code source (ex: "@/components/ui/Button") se résolvent aussi en test.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    // jsdom désactive localStorage/sessionStorage tant qu'aucune origine
    // http(s) n'est définie (sécurité par défaut sur "about:blank").
    environmentOptions: {
      jsdom: { url: 'http://localhost/' },
    },
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...defaultExclude, 'e2e/**'],
  },
})
