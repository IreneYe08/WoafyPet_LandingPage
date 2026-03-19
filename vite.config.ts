import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

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
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})