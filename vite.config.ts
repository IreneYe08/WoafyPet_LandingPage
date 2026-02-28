import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// 自定义插件：将 ../assets/xxx.png 解析为 src/assets/xxx.png
function figmaAssetPlugin() {
  return {
    name: 'figma-asset-resolver',
    resolveId(source: string) {
      if (source.startsWith('../assets/')) {
        const filename = source.replace('../assets/', '')
        return path.resolve(__dirname, './src/assets/', filename)
      }
      return null
    }
  }
}

export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})