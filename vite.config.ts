import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // The existing Korean manifest in public/ stays the single source of truth.
      manifest: false,
      includeAssets: ['icon.svg', 'manifest.webmanifest'],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,webmanifest,png,ico}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  // GitHub Pages serves the app from /mathgenius_fr/.
  // Cloudflare Pages (and custom domains) serves it from /.
  // CF_PAGES=1 is provided automatically by Cloudflare's build environment.
  base: process.env.CF_PAGES === '1' ? '/' : '/mathgenius_fr/',
});
