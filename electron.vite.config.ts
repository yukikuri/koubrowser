import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
const isDev = process.env.NODE_ENV === 'development'
const isDropConsole = !isDev
const minify = !isDev

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@common': resolve('src/common'),
        '@main': resolve('src/main'),
        '@global': resolve('src/global')
      }
    },
    plugins: [externalizeDepsPlugin()],
    esbuild: {
      drop: isDropConsole ? ['console', 'debugger'] : []
    },
    build: {
      minify,
      // 1MB以上のチャンクが生成される場合に警告を表示する
      // Electronアプリでは大きなチャンクが生成されたとしてもローカルでの動作のため影響は無い
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
          worker: resolve(__dirname, 'src/main/worker/worker-main.ts')
        }
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@common': resolve('src/common')
      }
    },
    plugins: [externalizeDepsPlugin()],
    esbuild: {
      drop: isDropConsole ? ['console', 'debugger'] : []
    },
    build: {
      minify,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          option: resolve(__dirname, 'src/preload/option.ts'),
          'xhr-hook': resolve(__dirname, 'src/preload/xhr-hook.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@common': resolve('src/common'),
        '@global': resolve('src/global'),
        '@renderer': resolve('src/renderer/src'),
        '@assets': resolve('src/renderer/src/assets')
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // electronのwebviewタグをvueが認識しないようにする
            isCustomElement: (tag) => tag === 'webview'
          }
        }
      }),
      svgLoader()
    ],
    esbuild: {
      drop: isDropConsole ? ['console', 'debugger'] : []
    },
    build: {
      minify,
      cssMinify: false,
      // 5MB以上のチャンクが生成される場合に警告を表示する
      // Electronアプリでは大きなチャンクが生成されたとしても、ローカルでの動作のため影響は無い
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          option: resolve(__dirname, 'src/renderer/option.html')
        }
      }
    }
  }
})
