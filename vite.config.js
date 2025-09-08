import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
  //   proxy: {
  //     '/api': {  // Giả sử API path bắt đầu bằng /api, thay bằng '/Product' nếu cần
  //       target: 'https://localhost:7278',  // Cổng backend
  //       changeOrigin: true,
  //       secure: false,  // Bỏ qua SSL check nếu dùng self-signed cert
  //       rewrite: (path) => path.replace(/^\/api/, '')  // Rewrite path nếu cần
  //     }
  //   }
  }
})
