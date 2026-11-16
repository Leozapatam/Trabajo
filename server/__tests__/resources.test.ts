import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';
import { afterEach, describe, expect, it } from 'vitest';
import { createResourceScanner } from '../resources.mjs';

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'exp6-res-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((d) => fs.rm(d, { recursive: true, force: true })));
});

describe('Banco de Recursos (server/resources.mjs)', () => {
  it('parsea ambos formatos, marca opcional, ignora basura y mantiene ids estables', async () => {
    const root = await makeTempDir();
    const sociales = path.join(root, 'Ciencias Sociales');
    const generales = path.join(root, 'Generales');

    await fs.mkdir(path.join(sociales, '01. Cosmos y Tierra'), { recursive: true });
    await fs.mkdir(path.join(sociales, '08. Conflicto Armado y Paz'), { recursive: true });
    await fs.mkdir(path.join(sociales, '.wpp_backup'), { recursive: true });
    await fs.mkdir(generales, { recursive: true });

    await fs.writeFile(
      path.join(sociales, '01. Cosmos y Tierra', 'Cosmos y Tierra, origen del universo (opcional).pptx'),
      'ppt-data'
    );
    await fs.writeFile(
      path.join(sociales, '08. Conflicto Armado y Paz', '6.8.1 La paz en Colombia.mp4'),
      '0123456789ABCDEF'
    );
    await fs.writeFile(path.join(sociales, '.wpp_backup', 'backup.pptx'), 'ignored');
    await fs.writeFile(path.join(sociales, '01. Cosmos y Tierra', '~$temporal.pptx'), 'ignored');
    await fs.writeFile(path.join(sociales, '01. Cosmos y Tierra', 'desktop.ini'), 'ignored');
    await fs.writeFile(path.join(generales, 'Cronología.gslides'), '{}');

    const scanner = createResourceScanner({ socialesDir: sociales, generalesDir: generales });
    const first = await scanner.getIndex(true);

    expect(first.available).toBe(true);
    expect(first.resources).toHaveLength(3);

    const ppt = first.resources.find((r) => r.ext === '.pptx')!;
    expect(ppt.title).toBe('origen del universo');
    expect(ppt.opcional).toBe(true);
    expect(ppt.unit.code).toBe('01');
    expect(ppt.type).toBe('diapositivas');

    const vid = first.resources.find((r) => r.ext === '.mp4')!;
    expect(vid.code).toBe('6.8.1');
    expect(vid.title).toBe('La paz en Colombia');
    expect(vid.opcional).toBe(false);
    expect(vid.unit.code).toBe('08');
    expect(vid.type).toBe('video');

    const gslides = first.resources.find((r) => r.ext === '.gslides')!;
    expect(gslides.isDriveShortcut).toBe(true);
    expect(gslides.unit.code).toBe('00');

    // ID estable al refrescar
    const second = await scanner.getIndex(true);
    expect(second.resources.map((r) => r.id)).toEqual(first.resources.map((r) => r.id));
  });

  it('transmite archivos con soporte de Range (206 Partial Content)', async () => {
    const root = await makeTempDir();
    const sociales = path.join(root, 'Ciencias Sociales');
    const generales = path.join(root, 'Generales');
    await fs.mkdir(path.join(sociales, '01. Cosmos y Tierra'), { recursive: true });
    await fs.mkdir(generales, { recursive: true });

    await fs.writeFile(
      path.join(sociales, '01. Cosmos y Tierra', '6.1.1 Video prueba.mp4'),
      '0123456789ABCDEF'
    );

    const scanner = createResourceScanner({ socialesDir: sociales, generalesDir: generales });
    const idx = await scanner.getIndex(true);
    const vid = idx.resources[0];

    const headers: Record<string, string> = {};
    const chunks: Buffer[] = [];
    const mockRes = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(Buffer.from(chunk));
        cb();
      },
    }) as Writable & { statusCode: number; setHeader: (k: string, v: string) => void };
    mockRes.statusCode = 200;
    mockRes.setHeader = (k, v) => {
      headers[k.toLowerCase()] = v;
    };

    await new Promise<void>((resolve) => {
      mockRes.on('finish', resolve);
      scanner.serveResourceFile(vid.id, { headers: { range: 'bytes=0-5' } }, mockRes);
    });

    expect(mockRes.statusCode).toBe(206);
    expect(headers['content-range']).toBe('bytes 0-5/16');
    expect(Buffer.concat(chunks).toString('utf8')).toBe('012345');
  });
});
