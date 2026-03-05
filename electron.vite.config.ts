import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
    // build: {
    //   rollupOptions: {
    //     external: ['better-sqlite3']
    //   }
    // }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: [
        { find: '@renderer', replacement: resolve('src/renderer/src') },
        // 仅对 import('highlight.js') 生效，不影响 import('highlight.js/styles/xxx.css')
        { find: /^highlight\.js$/, replacement: resolve('src/renderer/src/lib/highlight-core.ts') }
      ]
    },
    plugins: [vue()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'antd': ['ant-design-vue'],
            'bytemd': ['@bytemd/vue-next', 'bytemd']
          }
        }
      }
    },
    server: {
      host: 'localhost',
      port: 32107
    }
  }
})
