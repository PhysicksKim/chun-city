import { rmSync, existsSync, readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import eslintPlugin from 'vite-plugin-eslint';
import pkg from './package.json';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true });

  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  // Load .env.secret if exists (dev server only)
  if (isServe && process.env.VITE_APP_ENV === 'dev') {
    const secretPath = resolve(__dirname, '.env.secret');
    if (existsSync(secretPath)) {
      const secretContent = readFileSync(secretPath, 'utf-8');
      secretContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
          }
        }
      });
    }
  }

  return {
    resolve: {
      alias: {
        '@src': path.join(__dirname, 'src'),
        '@assets': path.join(__dirname, 'assets'),
        '@app': path.join(__dirname, 'src/renderer/pages/app'),
        '@matchlive': path.join(__dirname, 'src/renderer/pages/matchlive'),
      },
    },
    plugins: [
      // basicSsl(),
      react(),
      eslintPlugin({
        include: ['src/**/*.ts', 'src/**/*.tsx'],
      }),
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: 'electron/main/main.ts',
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
              );
            } else {
              args.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {}
                ),
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: 'electron/preload/preload.ts',
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {}
                ),
              },
            },
          },
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
      }),
    ],
    build: {
      // 여기서 멀티 페이지 설정을 추가합니다.
      rollupOptions: {
        input: {
          app: resolve(__dirname, 'app.html'),
          matchlive: resolve(__dirname, 'matchlive.html'),
          updatechecker: resolve(__dirname, 'updatechecker.html'),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
    server: {
      ...(process.env.VSCODE_DEBUG
        ? (() => {
            const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
            return {
              host: url.hostname,
              port: +url.port,
            };
          })()
        : {
            port: 7777,
          }),
    },
    clearScreen: false,
  };
});
