import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api/repeater-source': {
        target: 'https://www.radyoamatorleri.com',
        changeOrigin: true,
        rewrite: () => '/depo/linkver/html/TA_ROLE.php',
        headers: {
          Referer: 'https://www.radyoamatorleri.com/depo/linkver/html/TA_ROLE.html',
        },
      },
      '/api/radioid': {
        target: 'https://radioid.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/radioid/, '/api'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://radioid.net/'
        }
      },
      '/api/brandmeister': {
        target: 'https://api.brandmeister.network',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/brandmeister/, '/v2'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://brandmeister.network/'
        }
      },
      '/api/aprs': {
        target: 'https://api.aprs.fi',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/aprs/, '/api'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://aprs.fi/'
        }
      },
    },
  },
  preview: {
    proxy: {
      '/api/repeater-source': {
        target: 'https://www.radyoamatorleri.com',
        changeOrigin: true,
        rewrite: () => '/depo/linkver/html/TA_ROLE.php',
        headers: {
          Referer: 'https://www.radyoamatorleri.com/depo/linkver/html/TA_ROLE.html',
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Dilaver Telsiz',
        short_name: 'Dilaver',
        description: 'Amatör Telsizcilik ve Haberleşme Uygulaması',
        theme_color: '#007AFF',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
