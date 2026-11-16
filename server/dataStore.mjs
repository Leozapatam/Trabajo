// Persistencia en disco de Expedición 6: un archivo principal con escritura
// atómica, respaldos diarios y de cierre de clase, y espejo opcional en Drive.
import { copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const DATA_FILE_NAME = 'expedicion6-datos.json';
export const BACKUP_DIR_NAME = 'respaldos';
export const MAX_BACKUPS = 60;

export function resolveDataDirs(env = process.env) {
  const dataDir = env.EXPEDICION6_DATA_DIR || join(homedir(), 'Documents', 'Expedicion6-Datos');
  let mirrorDir = env.EXPEDICION6_MIRROR_DIR;
  if (mirrorDir === undefined) {
    const drive = 'G:\\Mi unidad\\1. 💼 Trabajo\\1. Clases';
    mirrorDir = existsSync(drive) ? join(drive, 'Expedicion6-Respaldos') : '';
  }
  return { dataDir, mirrorDir: mirrorDir || null };
}

function localStamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  const day = `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
  return { day, time: `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}` };
}

function safeLabel(label) {
  return String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Estudiantes en la lista activa y en todas las listas guardadas por salón */
export function countStudents(state) {
  const ids = new Set();
  for (const s of state?.students ?? []) ids.add(s.id);
  for (const list of Object.values(state?.rostersByClassroom ?? {})) {
    for (const s of list ?? []) ids.add(s.id);
  }
  return ids.size;
}

export function isValidSessionState(state) {
  return (
    !!state &&
    typeof state === 'object' &&
    typeof state.activeSceneIndex === 'number' &&
    Array.isArray(state.students)
  );
}

export function createDataStore({ dataDir, mirrorDir = null, now = () => new Date() }) {
  const dataFile = join(dataDir, DATA_FILE_NAME);
  const backupDir = join(dataDir, BACKUP_DIR_NAME);

  async function read() {
    try {
      return JSON.parse(await readFile(dataFile, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      // Archivo ilegible: se aparta para no perderlo y se sigue sin datos
      await rename(dataFile, `${dataFile}.corrupt-${Date.now()}`).catch(() => {});
      return null;
    }
  }

  async function pruneBackups() {
    const files = (await readdir(backupDir)).filter((f) => f.endsWith('.json')).sort();
    for (const f of files.slice(0, Math.max(0, files.length - MAX_BACKUPS))) {
      await rm(join(backupDir, f), { force: true });
    }
  }

  async function mirror(src, name) {
    if (!mirrorDir) return;
    try {
      await mkdir(mirrorDir, { recursive: true });
      await copyFile(src, join(mirrorDir, name));
    } catch {
      // Drive desconectado: el respaldo local sigue siendo válido
    }
  }

  /** Copia el archivo actual a respaldos/. Devuelve el nombre o null si no hay datos aún. */
  async function backup(label = '') {
    if (!existsSync(dataFile)) return null;
    await mkdir(backupDir, { recursive: true });
    const { day, time } = localStamp(now());
    const suffix = safeLabel(label);
    const name = `${day}_${time}${suffix ? `_${suffix}` : ''}.json`;
    const target = join(backupDir, name);
    await copyFile(dataFile, target);
    await mirror(target, name);
    await pruneBackups();
    return name;
  }

  async function hasBackupForToday() {
    if (!existsSync(backupDir)) return false;
    const { day } = localStamp(now());
    return (await readdir(backupDir)).some((f) => f.startsWith(day));
  }

  /**
   * `baseUpdatedAt`: versión sobre la que el cliente hizo el cambio. Si el disco ya
   * tiene algo más nuevo (otra ventana u otro navegador), se rechaza para no pisarlo.
   */
  async function write(state, baseUpdatedAt) {
    if (!isValidSessionState(state)) throw new Error('Estado de sesión inválido');
    await mkdir(dataDir, { recursive: true });
    const previous = await read();
    if (previous && typeof baseUpdatedAt === 'number' && baseUpdatedAt < (previous.updatedAt ?? 0)) {
      throw Object.assign(new Error('Hay una versión más nueva guardada desde otra ventana'), { status: 409 });
    }
    if (previous) {
      // Primer guardado del día, o un guardado que deja menos estudiantes: respaldo previo
      if (countStudents(state) < countStudents(previous)) await backup('antes-de-reducir-lista');
      else if (!(await hasBackupForToday())) await backup('diario');
    }
    const tmp = `${dataFile}.tmp`;
    await writeFile(tmp, JSON.stringify(state), 'utf8');
    await rename(tmp, dataFile);
    return { savedAt: now().getTime() };
  }

  async function info() {
    const exists = existsSync(dataFile);
    const backups = existsSync(backupDir)
      ? (await readdir(backupDir)).filter((f) => f.endsWith('.json')).sort()
      : [];
    return {
      dataFile,
      mirrorDir,
      exists,
      size: exists ? (await stat(dataFile)).size : 0,
      backups: backups.length,
      lastBackup: backups[backups.length - 1] ?? null,
    };
  }

  return { read, write, backup, info, dataFile, backupDir };
}
