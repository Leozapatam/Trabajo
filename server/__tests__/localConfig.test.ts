import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error módulo JS del servidor sin tipos
import { migrateLegacyData, resolvePaths } from '../localConfig.mjs';

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'cs-config-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const noConfig = () => join(dir, 'no-existe.json');

describe('Rutas de cada PC', () => {
  it('sin Drive ni configuración guarda en Documentos y no encuentra el Banco', () => {
    const p = resolvePaths({ env: {}, configFile: noConfig(), exists: () => false });
    expect(p.dataDir).toMatch(/Documents[\\/]Expedicion6-Datos$/);
    expect(p.socialesDir).toBeNull();
    expect(p.mirrorDir).toBeNull();
  });

  it('el archivo del PC define Clases: datos y Banco quedan dentro de Drive, sin espejo', () => {
    const clases = join(dir, 'Clases');
    const configFile = join(dir, 'cfg.json');
    writeFileSync(configFile, JSON.stringify({ clasesDir: clases }));
    const p = resolvePaths({ env: {}, configFile, exists: () => false });
    expect(p.dataDir).toBe(join(clases, 'Expedicion6-Datos'));
    expect(p.socialesDir).toBe(join(clases, 'Banco de Recursos', 'Ciencias Sociales'));
    expect(p.mirrorDir).toBeNull();
    expect(p.dataDirIsDefault).toBe(true);
  });

  it('las variables de entorno mandan sobre el archivo', () => {
    const configFile = join(dir, 'cfg.json');
    writeFileSync(configFile, JSON.stringify({ clasesDir: join(dir, 'A'), dataDir: join(dir, 'datosA') }));
    const p = resolvePaths({ env: { EXPEDICION6_DATA_DIR: join(dir, 'datosB') }, configFile, exists: () => false });
    expect(p.dataDir).toBe(join(dir, 'datosB'));
    expect(p.dataDirIsDefault).toBe(false);
    // Datos fuera de Drive: los respaldos se copian también a Drive
    expect(p.mirrorDir).toBe(join(dir, 'A', 'Expedicion6-Respaldos'));
  });

  it.runIf(process.platform === 'win32')('encuentra Drive en cualquier letra de unidad', () => {
    const target = 'H:\\Mi unidad\\1. 💼 Trabajo\\1. Clases';
    const p = resolvePaths({ env: {}, configFile: noConfig(), exists: (x: string) => x === target });
    expect(p.clasesDir).toBe(target);
  });
});

describe('Traslado de los datos a Drive', () => {
  it('copia datos, agenda y respaldos la primera vez y nunca pisa lo que ya hay', () => {
    const legacy = join(dir, 'Documents', 'Expedicion6-Datos');
    const drive = join(dir, 'Drive', 'Expedicion6-Datos');
    mkdirSync(join(legacy, 'respaldos'), { recursive: true });
    writeFileSync(join(legacy, 'expedicion6-datos.json'), '{"v":1}');
    writeFileSync(join(legacy, 'config.json'), '{"agendaIcsUrl":"x"}');
    writeFileSync(join(legacy, 'respaldos', 'r1.json'), '{}');

    expect(migrateLegacyData(drive, legacy)).toBe(true);
    expect(readFileSync(join(drive, 'expedicion6-datos.json'), 'utf8')).toBe('{"v":1}');
    expect(existsSync(join(drive, 'config.json'))).toBe(true);
    expect(existsSync(join(drive, 'respaldos', 'r1.json'))).toBe(true);
    expect(existsSync(join(legacy, 'LEEME - datos movidos.txt'))).toBe(true);

    writeFileSync(join(legacy, 'expedicion6-datos.json'), '{"v":2}');
    expect(migrateLegacyData(drive, legacy)).toBe(false);
    expect(readFileSync(join(drive, 'expedicion6-datos.json'), 'utf8')).toBe('{"v":1}');
  });

  it('no hace nada si no hay datos viejos o si es la misma carpeta', () => {
    const legacy = join(dir, 'vacio');
    expect(migrateLegacyData(join(dir, 'drive'), legacy)).toBe(false);
    expect(migrateLegacyData(legacy, legacy)).toBe(false);
  });
});
