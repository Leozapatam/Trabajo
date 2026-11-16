// Endpoints /api/* compartidos por el servidor de desarrollo (Vite) y el servidor local de aula.
import { createDataStore, resolveDataDirs } from './dataStore.mjs';

const MAX_BODY_BYTES = 25 * 1024 * 1024;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function hostnameOf(value) {
  try {
    return new URL(value.includes('://') ? value : `http://${value}`).hostname;
  } catch {
    return '';
  }
}

/** Solo atiende peticiones del propio PC (evita que otra página web lea o borre los datos) */
function isLocalRequest(req) {
  if (!LOCAL_HOSTS.has(hostnameOf(req.headers.host ?? ''))) return false;
  const origin = req.headers.origin;
  return !origin || LOCAL_HOSTS.has(hostnameOf(origin));
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Datos demasiado grandes'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function createApiHandler(store = createDataStore(resolveDataDirs())) {
  return async function apiHandler(req, res, next) {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/')) return next?.();
    if (!isLocalRequest(req)) return sendJson(res, 403, { error: 'Solo acceso local' });

    try {
      if (url.pathname === '/api/salud' && req.method === 'GET') {
        return sendJson(res, 200, { ok: true, ...(await store.info()) });
      }
      if (url.pathname === '/api/datos' && req.method === 'GET') {
        return sendJson(res, 200, { state: await store.read() });
      }
      if (url.pathname === '/api/datos' && req.method === 'PUT') {
        const body = JSON.parse(await readBody(req));
        return sendJson(res, 200, { ok: true, ...(await store.write(body.state, body.baseUpdatedAt)) });
      }
      if (url.pathname === '/api/respaldo' && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        return sendJson(res, 200, { ok: true, backup: await store.backup(body.label) });
      }
      return sendJson(res, 404, { error: 'Ruta no encontrada' });
    } catch (err) {
      const status = err.status ?? (err instanceof SyntaxError ? 400 : 500);
      return sendJson(res, status, { error: err.message });
    }
  };
}

/** Plugin de Vite: monta la misma API en `npm run dev` */
export function expedicionApiPlugin() {
  return {
    name: 'expedicion6-api',
    configureServer(server) {
      const handler = createApiHandler();
      server.middlewares.use((req, res, next) => handler(req, res, next));
    },
    configurePreviewServer(server) {
      const handler = createApiHandler();
      server.middlewares.use((req, res, next) => handler(req, res, next));
    },
  };
}
