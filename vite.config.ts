import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { expedicionApiPlugin } from './server/api.mjs';

const ART_DIR = normalizePath(fileURLToPath(new URL('./public/assets/art/', import.meta.url)));
const FONDOS_ID = 'virtual:fondos';

/**
 * `virtual:fondos`: lista de ilustraciones de public/assets/art.
 * Basta con guardar una imagen nueva ahí para que entre a la rotación de fondos.
 */
function fondosPlugin(): Plugin {
  return {
    name: 'cs-fondos',
    resolveId(source) {
      return source === FONDOS_ID ? `\0${FONDOS_ID}` : undefined;
    },
    load(id) {
      if (id !== `\0${FONDOS_ID}`) return undefined;
      const files = readdirSync(ART_DIR)
        .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
        .sort();
      return `export default ${JSON.stringify(files.map((f) => `/assets/art/${f}`))};`;
    },
    configureServer(server) {
      const refresh = (file: string) => {
        if (!normalizePath(file).startsWith(ART_DIR)) return;
        const mod = server.moduleGraph.getModuleById(`\0${FONDOS_ID}`);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
    },
  };
}

export default defineConfig({
  plugins: [react(), expedicionApiPlugin(), fondosPlugin()],
  server: {
    port: 5173,
    strictPort: false,
  },
});
