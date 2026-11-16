// Servidor local de aula: sirve la app compilada (dist/) y la API de datos.
// Uso: npm run build (una vez) y luego npm run serve → http://127.0.0.1:5176
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiHandler } from './api.mjs';
import { resolveDataDirs } from './dataStore.mjs';

const PORT = Number(process.env.EXPEDICION6_PORT || 5176);
const DIST_DIR = fileURLToPath(new URL('../dist/', import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
};

function serveStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  let file = normalize(join(DIST_DIR, pathname));
  if (!(file + sep).startsWith(normalize(DIST_DIR))) {
    res.statusCode = 403;
    return res.end();
  }
  // Rutas de la SPA (/game-master, /projector…) → index.html
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST_DIR, 'index.html');
  if (!existsSync(file)) {
    res.statusCode = 500;
    return res.end('Falta compilar la app: ejecuta npm run build');
  }
  res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
}

const api = createApiHandler();
const server = createServer((req, res) => api(req, res, () => serveStatic(req, res)));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Expedición 6 ya está corriendo en http://127.0.0.1:${PORT}`);
    process.exit(0);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  const { dataDir, mirrorDir } = resolveDataDirs();
  console.log(`Expedición 6 lista en http://127.0.0.1:${PORT}`);
  console.log(`Datos: ${dataDir}`);
  console.log(`Espejo de respaldos: ${mirrorDir ?? '(desactivado)'}`);
});
