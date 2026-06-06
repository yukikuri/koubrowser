import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// Vitest config for an electron-vite + Vue 3 + TS project.
// - Node環境: main / preload のユニットテスト
// - happy-dom: renderer(SPA)のコンポーネント/ロジックテスト
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@common': resolve(__dirname, 'src/common'),
    },
  },

  test: {
    // カバレッジレポート
    coverage: {
      provider: 'v8', // or 'istanbul'. need to install additional packages
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx,js,jsx,vue}']
    },
    reporters: ['default'],
    projects: [
      {
        extends: true,
        test: {
          name: 'common',
          environment: 'node',            
          include: [
            './src/common/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
          ],
          testTimeout: 10000,
        }
      },
      {
        extends: true,
        resolve: {
          alias: {
            '@main': resolve(__dirname, 'src/main'),
          },
        },
        test: {
          name: 'main process',
          environment: 'node',            
          include: [
            './src/main/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
          ],
          testTimeout: 10000,
        }
      },
      {
        extends: true,
        resolve: {
          alias: {
            '@global': resolve('src/global'),
            '@renderer': resolve(__dirname, 'src/renderer/src'),
            '@assets': resolve('src/renderer/src/assets')
          },
        },
        test: {
          name: 'renderer process',
          environment: 'happy-dom',            
          include: [
            './src/renderer/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
          ],
          testTimeout: 10000,
        }
      },
    ]
  },
})
