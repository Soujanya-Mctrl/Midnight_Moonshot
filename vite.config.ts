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
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    force: true,
    include: ['object-inspect', 'buffer', '@midnight-ntwrk/compact-runtime', '@midnight-ntwrk/ledger-v8', '@midnight-ntwrk/onchain-runtime-v3'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
