import type { ExplorerProgress } from './types';

export const EXPLORER_STORAGE_KEY = 'expedicion6.explorer.v1';

export function createInitialExplorerProgress(): ExplorerProgress {
  return {
    discoveredZones: ['zona-1'],
    inspectedNodes: [],
    completedChallenges: [],
    earnedBadges: [],
    lastVisitedZone: 'zona-1',
    reducedMotion: false,
    updatedAt: Date.now(),
  };
}

export function loadExplorerProgress(): ExplorerProgress {
  if (typeof window === 'undefined') return createInitialExplorerProgress();
  try {
    const raw = window.localStorage.getItem(EXPLORER_STORAGE_KEY);
    if (!raw) return createInitialExplorerProgress();
    const parsed = JSON.parse(raw) as ExplorerProgress;
    if (!parsed || !Array.isArray(parsed.discoveredZones)) {
      return createInitialExplorerProgress();
    }
    return parsed;
  } catch {
    return createInitialExplorerProgress();
  }
}

export function saveExplorerProgress(progress: ExplorerProgress): ExplorerProgress {
  const next: ExplorerProgress = { ...progress, updatedAt: Date.now() };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(EXPLORER_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar errores de cuota
    }
  }
  return next;
}
