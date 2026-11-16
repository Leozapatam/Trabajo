import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { expedicionApiPlugin } from './server/api.mjs';

export default defineConfig({
  plugins: [react(), expedicionApiPlugin()],
  server: {
    port: 5173,
    strictPort: false,
  },
});
