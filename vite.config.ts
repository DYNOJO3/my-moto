import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

// En el build para Android no se usa service worker: los archivos ya viajan dentro del APK.
const isAndroid = process.env.BUILD_TARGET === 'android';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isAndroid
        ? []
        : [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
              manifest: {
                id: '/',
                name: 'QR SOS Médico - Rescate y Emergencias',
                short_name: 'SOS Médico',
                description: 'Ficha médica de emergencia, modo offline y contactos familiares ICE.',
                theme_color: '#dc2626',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                icons: [
                  { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                  { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                  { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
              },
            }),
          ]),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    build: {
      target: 'es2020',
      cssMinify: true,
      chunkSizeWarningLimit: 700,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
