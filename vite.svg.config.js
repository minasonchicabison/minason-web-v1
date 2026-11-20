import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config.js';
import { resolve } from 'node:path';

export default defineConfig((env) =>
  mergeConfig(baseConfig(env), {
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(process.cwd(), 'src/main.js'),
        name: 'Minason',
        formats: ['iife'],
        fileName: () => 'assets/minason.js',
        cssFileName: 'assets/minason'
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    }
  })
);
