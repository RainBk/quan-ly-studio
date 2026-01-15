import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Quản Lý Studio Pro', // Tên dài của App
        short_name: 'Studio Pro',   // Tên ngắn hiện dưới icon
        description: 'Phần mềm quản lý Studio chuyên nghiệp',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',      // QUAN TRỌNG: Lệnh này giúp App chạy Full màn hình
        orientation: 'portrait',    // Khóa màn hình dọc (như App thông thường)
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/logo.png',       // Đường dẫn đến logo bạn vừa chép vào
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})