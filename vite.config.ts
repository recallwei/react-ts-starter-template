import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react-swc'
import type { ProxyOptions } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_PORT, VITE_BASE_API_URL } = env as ImportMetaEnv

  const port = parseInt(VITE_PORT, 10)
  const proxy: Record<string, string | ProxyOptions> = {
    '/base-api': {
      target: VITE_BASE_API_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/base-api/, '')
    }
  }

  return {
    base: './',
    plugins: [
      react(),
      AutoImport({
        dts: './src/types/auto-imports.d.ts',
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.md$/ // .md
        ],
        imports: [
          'react',
          'react-router-dom',
          'ahooks',
          {
            from: '@/constants',
            imports: ['GlobalEnvConfig', 'BasePageModel']
          }
        ],
        dirs: [
          'src/api',
          'src/components',
          'src/config',
          'src/hooks',
          'src/layouts',
          'src/providers',
          'src/store',
          'src/utils'
        ]
      }),
      Icons({ autoInstall: true })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },
    server: {
      host: true,
      port,
      strictPort: true,
      open: false,
      proxy
    },
    preview: {
      host: true,
      port,
      strictPort: true,
      open: false,
      proxy
    }
  }
})
