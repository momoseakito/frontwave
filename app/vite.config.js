import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      'frontwave-engine': resolve(__dirname, '../packages/game-engine/dist/index.js'),
    },
    conditions: ['browser'],
  },
  optimizeDeps: {
    include: ['pixi.js'],
  },
});
