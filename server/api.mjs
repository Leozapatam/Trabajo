// Endpoints /api/* compartidos por el servidor de desarrollo (Vite) y el servidor local de aula.
import { createAgenda } from './agenda.mjs';
import { createDataStore } from './dataStore.mjs';
import { migrateLegacyData, resolvePaths } from './localConfig.mjs';
import { createResourceScanner } from './resources.mjs';

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

/** Datos de este PC; la primera vez trae los que estaban en Documentos */
function createDefaultStore() {
  const { dataDir, mirrorDir } = resolvePaths();
  if (migrateLegacyData(dataDir)) console.log(`Datos copiados de Documentos a ${dataDir}`);
  return createDataStore({ dataDir, mirrorDir });
}

function resourcePaths() {
  const { socialesDir, generalesDir, powerpointExe } = resolvePaths();
  return { socialesDir: socialesDir ?? '', generalesDir: generalesDir ?? '', powerpointExe };
}

export function createApiHandler(
  store = createDefaultStore(),
  agenda = createAgenda({ dataDir: resolvePaths().dataDir }),
  resources = createResourceScanner(resourcePaths())
) {
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
      // --- Agenda (Google Calendar vía iCal secreto) ---
      if (url.pathname === '/api/agenda' && req.method === 'GET') {
        const days = Number(url.searchParams.get('dias') ?? 7);
        const from = url.searchParams.get('desde');
        return sendJson(res, 200, await agenda.events({ days, from, force: url.searchParams.has('refrescar') }));
      }
      if (url.pathname === '/api/agenda/config' && req.method === 'PUT') {
        const body = JSON.parse((await readBody(req)) || '{}');
        await agenda.configure(body.url);
        return sendJson(res, 200, { ok: true });
      }
      if (url.pathname === '/api/agenda/config' && req.method === 'DELETE') {
        await agenda.disconnect();
        return sendJson(res, 200, { ok: true });
      }
      // --- Banco de Recursos (Google Drive local) ---
      if (url.pathname === '/api/recursos' && req.method === 'GET') {
        const force = url.searchParams.get('refrescar') === '1';
        const idx = await resources.getIndex(force);
        return sendJson(res, 200, {
          available: idx.available,
          scannedAt: idx.scannedAt,
          units: idx.units,
          resources: idx.resources,
        });
      }
      const openMatch = /^\/api\/recursos\/([a-f0-9]+)\/abrir$/.exec(url.pathname);
      if (openMatch && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        const modo = body.modo === 'presentar' ? 'presentar' : 'abrir';
        return sendJson(res, 200, await resources.openResource(openMatch[1], modo));
      }
      const fileMatch = /^\/api\/recursos\/([a-f0-9]+)\/archivo$/.exec(url.pathname);
      if (fileMatch && req.method === 'GET') {
        await resources.serveResourceFile(fileMatch[1], req, res);
        return;
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
