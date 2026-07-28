import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // host: true (= "0.0.0.0") : le serveur de dev écoute sur toutes les
  // interfaces réseau, pas seulement localhost, pour être accessible depuis
  // un autre poste du réseau local (ex. http://192.168.50.93:5173) sans
  // devoir se souvenir du flag `--host` à chaque lancement. N'affecte que
  // `vite dev`/`vite preview` — sans effet sur `vite build` (production).
  server: {
    host: true,
  },
})
