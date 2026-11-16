import type { SessionState } from './types';

/**
 * Copia en disco del estado de sesión vía la API local (/api/datos).
 * localStorage sigue siendo la caché inmediata; el disco es la fuente durable.
 */

/** `conflicto`: otra ventana u otro navegador guardó una versión más nueva en disco */
export type DiskStatus = 'desconocido' | 'guardando' | 'guardado' | 'sin-disco' | 'conflicto';

export interface DiskSyncInfo {
  status: DiskStatus;
  savedAt: number | null;
}

const SAVE_DEBOUNCE_MS = 800;

let info: DiskSyncInfo = { status: 'desconocido', savedAt: null };
const listeners = new Set<(info: DiskSyncInfo) => void>();
let pendingState: SessionState | null = null;
/** `updatedAt` de la versión sobre la que se hizo el primer cambio pendiente */
let pendingBase: number | undefined;
let timer: ReturnType<typeof setTimeout> | null = null;

function setInfo(next: Partial<DiskSyncInfo>) {
  info = { ...info, ...next };
  listeners.forEach((fn) => fn(info));
}

export function getDiskSyncInfo(): DiskSyncInfo {
  return info;
}

export function subscribeDiskSync(fn: (info: DiskSyncInfo) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function putState(state: SessionState, baseUpdatedAt?: number, keepalive = false): Promise<void> {
  if (info.status === 'conflicto') return; // no pisar la versión más nueva hasta recargar
  setInfo({ status: 'guardando' });
  try {
    const res = await fetch('/api/datos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, baseUpdatedAt }),
      keepalive,
    });
    if (res.status === 409) {
      setInfo({ status: 'conflicto' });
      return;
    }
    if (!res.ok) throw new Error(String(res.status));
    setInfo({ status: 'guardado', savedAt: Date.now() });
  } catch {
    setInfo({ status: 'sin-disco' });
  }
}

export function scheduleDiskSave(state: SessionState, baseUpdatedAt?: number): void {
  if (typeof fetch === 'undefined') return;
  if (!pendingState) pendingBase = baseUpdatedAt;
  pendingState = state;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    const toSave = pendingState;
    pendingState = null;
    if (toSave) void putState(toSave, pendingBase);
  }, SAVE_DEBOUNCE_MS);
}

/** Guarda de inmediato lo pendiente (al cerrar la ventana) */
export function flushDiskSave(): void {
  if (!timer || !pendingState) return;
  clearTimeout(timer);
  timer = null;
  const toSave = pendingState;
  pendingState = null;
  void putState(toSave, pendingBase, true);
}

/** Guarda lo pendiente y luego crea un respaldo con nombre (p. ej. al cerrar la clase) */
export async function requestDiskBackup(label: string): Promise<string | null> {
  if (timer && pendingState) {
    clearTimeout(timer);
    timer = null;
    const toSave = pendingState;
    pendingState = null;
    await putState(toSave, pendingBase);
  }
  try {
    const res = await fetch('/api/respaldo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) return null;
    return ((await res.json()) as { backup: string | null }).backup;
  } catch {
    return null;
  }
}

/**
 * Al abrir la app: si el disco tiene datos más recientes que este navegador
 * (otro puerto, otro perfil o localStorage borrado), los restaura en localStorage.
 * Si este navegador es más reciente, sube su copia al disco.
 */
export async function restoreFromDisk(storageKey: string, timeoutMs = 1500): Promise<'disco' | 'local' | 'sin-disco'> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return 'sin-disco';
  const controller = new AbortController();
  const abort = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('/api/datos', { signal: controller.signal });
    if (!res.ok) throw new Error(String(res.status));
    const disk = ((await res.json()) as { state: SessionState | null }).state;

    let local: SessionState | null = null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      local = raw ? (JSON.parse(raw) as SessionState) : null;
    } catch {
      local = null;
    }

    if (disk && (!local || (disk.updatedAt ?? 0) > (local.updatedAt ?? 0))) {
      window.localStorage.setItem(storageKey, JSON.stringify(disk));
      setInfo({ status: 'guardado', savedAt: disk.updatedAt ?? null });
      return 'disco';
    }
    if (local) await putState(local);
    else setInfo({ status: 'guardado' });
    return 'local';
  } catch {
    setInfo({ status: 'sin-disco' });
    return 'sin-disco';
  } finally {
    clearTimeout(abort);
  }
}
