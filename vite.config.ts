import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  assetsInclude: ['**/*.wasm'],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['object-inspect', 'buffer'],
    esbuildOptions: {
      target: 'esnext',
    },
    // Exclude WASM-heavy Midnight packages from pre-bundling
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/ledger-v8',
    ],
  },
});
