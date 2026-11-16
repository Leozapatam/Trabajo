import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error módulo JS del servidor sin tipos
import { createDataStore, DATA_FILE_NAME, MAX_BACKUPS } from '../dataStore.mjs';
// @ts-expect-error módulo JS del servidor sin tipos
import { createApiHandler } from '../api.mjs';

const state = (students: { id: string }[], extra: Record<string, unknown> = {}) => ({
  activeSceneIndex: 0,
  students,
  rostersByClassroom: {},
  updatedAt: 1,
  ...extra,
});

let dir: string;
let mirror: string;
let clock: Date;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'exp6-data-'));
  mirror = mkdtempSync(join(tmpdir(), 'exp6-mirror-'));
  clock = new Date(2026, 1, 2, 7, 30, 0);
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  rmSync(mirror, { recursive: true, force: true });
});

describe('Almacén de datos en disco', () => {
  it('escribe, lee y crea un respaldo diario solo una vez por día', async () => {
    const store = createDataStore({ dataDir: dir, mirrorDir: mirror, now: () => clock });
    expect(await store.read()).toBeNull();

    await store.write(state([{ id: 'a' }]));
    expect(existsSync(store.backupDir)).toBe(false); // nada que respaldar aún

    await store.write(state([{ id: 'a' }, { id: 'b' }]));
    await store.write(state([{ id: 'a' }, { id: 'b' }, { id: 'c' }]));
    expect(readdirSync(store.backupDir)).toHaveLength(1);
    expect(readdirSync(mirror)).toHaveLength(1);
    expect((await store.read()).students).toHaveLength(3);

    clock = new Date(2026, 1, 3, 7, 30, 0);
    await store.write(state([{ id: 'a' }, { id: 'b' }, { id: 'c' }]));
    expect(readdirSync(store.backupDir)).toHaveLength(2);
  });

  it('respalda antes de un guardado que reduce la lista de estudiantes', async () => {
    const store = createDataStore({ dataDir: dir, mirrorDir: null, now: () => clock });
    await store.write(state([{ id: 'a' }, { id: 'b' }]));
    await store.write(state([{ id: 'a' }, { id: 'b' }])); // diario
    await store.write(state([]));
    const names = readdirSync(store.backupDir);
    expect(names.some((n: string) => n.includes('antes-de-reducir-lista'))).toBe(true);
  });

  it('rechaza estados inválidos y aparta un archivo ilegible', async () => {
    const store = createDataStore({ dataDir: dir, mirrorDir: null, now: () => clock });
    await expect(store.write({ foo: 1 })).rejects.toThrow();
    writeFileSync(join(dir, DATA_FILE_NAME), '{roto');
    expect(await store.read()).toBeNull();
    expect(readdirSync(dir).some((n) => n.includes('.corrupt-'))).toBe(true);
  });

  it(`conserva como máximo ${MAX_BACKUPS} respaldos`, async () => {
    const store = createDataStore({ dataDir: dir, mirrorDir: null, now: () => clock });
    await store.write(state([{ id: 'a' }]));
    for (let i = 0; i < MAX_BACKUPS + 5; i++) {
      clock = new Date(clock.getTime() + 1000);
      await store.backup(`cierre-6°A`);
    }
    const names = readdirSync(store.backupDir);
    expect(names).toHaveLength(MAX_BACKUPS);
    expect(names[0]).toMatch(/_cierre-6-A\.json$/);
  });
});

describe('API local', () => {
  function call(handler: any, method: string, url: string, body?: unknown, headers: Record<string, string> = {}) {
    return new Promise<{ status: number; json: any }>((resolve) => {
      const payload = body === undefined ? '' : JSON.stringify(body);
      const listeners: Record<string, (arg?: any) => void> = {};
      const req: any = {
        method,
        url,
        headers: { host: '127.0.0.1:5176', ...headers },
        on: (ev: string, fn: (arg?: any) => void) => {
          listeners[ev] = fn;
          if (ev === 'end') queueMicrotask(() => {
            if (payload) listeners.data?.(Buffer.from(payload));
            listeners.end?.();
          });
        },
        destroy: () => {},
      };
      const res: any = {
        statusCode: 200,
        setHeader: () => {},
        end: (text: string) => resolve({ status: res.statusCode, json: JSON.parse(text) }),
      };
      handler(req, res, () => resolve({ status: 0, json: null }));
    });
  }

  it('guarda y devuelve el estado', async () => {
    const handler = createApiHandler(createDataStore({ dataDir: dir, mirrorDir: null }));
    expect((await call(handler, 'PUT', '/api/datos', { state: state([{ id: 'x' }]) })).status).toBe(200);
    const got = await call(handler, 'GET', '/api/datos');
    expect(got.json.state.students[0].id).toBe('x');
    expect(JSON.parse(readFileSync(join(dir, DATA_FILE_NAME), 'utf8')).students).toHaveLength(1);
  });

  it('bloquea peticiones desde otros sitios web', async () => {
    const handler = createApiHandler(createDataStore({ dataDir: dir, mirrorDir: null }));
    const res = await call(handler, 'GET', '/api/datos', undefined, { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    const rebinding = await call(handler, 'GET', '/api/datos', undefined, { host: 'evil.example:5176' });
    expect(rebinding.status).toBe(403);
  });

  it('deja pasar rutas que no son /api', async () => {
    const handler = createApiHandler(createDataStore({ dataDir: dir, mirrorDir: null }));
    expect((await call(handler, 'GET', '/game-master')).status).toBe(0);
  });
});

describe('Protección entre ventanas', () => {
  it('rechaza un guardado hecho sobre una versión más vieja que la del disco', async () => {
    const store = createDataStore({ dataDir: dir, mirrorDir: null, now: () => clock });
    await store.write(state([{ id: 'a' }], { updatedAt: 100 }));
    await store.write(state([{ id: 'a' }, { id: 'b' }], { updatedAt: 200 }), 100);
    // Otra ventana que todavía estaba en la versión 100 intenta guardar
    await expect(store.write(state([{ id: 'a' }], { updatedAt: 300 }), 100)).rejects.toMatchObject({ status: 409 });
    expect((await store.read()).students).toHaveLength(2);
    // Sin base (clientes antiguos) o con base al día, se acepta
    await store.write(state([{ id: 'a' }, { id: 'b' }, { id: 'c' }], { updatedAt: 400 }), 200);
    expect((await store.read()).students).toHaveLength(3);
  });
});
