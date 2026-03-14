import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// 自定义插件：将 ../assets/xxx.png 解析为 src/assets/xxx.png
function figmaAssetPlugin() {
  return {
    name: 'figma-asset-resolver',
    resolveId(source: string) {
      if (typeof source === 'string' && source.indexOf('../assets/') === 0) {
        const filename = source.replace('../assets/', '')
        return fileURLToPath(new URL(`./src/assets/${filename}`, import.meta.url))
      }
      return null
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/WoafyPet_LandingPage/',
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Proxy /api to the local Express server so the form works during `npm run dev`
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})