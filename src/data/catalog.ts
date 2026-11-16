import { ORIGENES_WORLD } from './origenesWorld';
import { MISION_00 } from './mision00';
import { MISION_001 } from './mision001';
import type { MissionDefinition, WorldDefinition } from '../engine/types';

export const worldsByGrade: Record<string, WorldDefinition[]> = {
  '6°': [ORIGENES_WORLD],
  '7°': [],
  '8°': [],
  '9°': [],
  '10°': [],
  '11°': [],
  '6°–7°': [],
  '8°–9°': [],
  '10°–11°': [],
};

export const worldArtById: Record<string, string> = {
  [ORIGENES_WORLD.id]: '/assets/art/mundo-6-origenes.webp',
};

export const WORLDS: Record<string, WorldDefinition> = {
  [ORIGENES_WORLD.id]: ORIGENES_WORLD,
};

export const MISSIONS: Record<string, MissionDefinition> = {
  [MISION_00.id]: MISION_00,
  [MISION_001.id]: MISION_001,
};

export const MISSIONS_LIST: MissionDefinition[] = [MISION_00, MISION_001];

export function getWorld(worldId: string): WorldDefinition {
  return WORLDS[worldId] ?? ORIGENES_WORLD;
}

export function getMission(missionId: string): MissionDefinition {
  return MISSIONS[missionId] ?? MISION_00;
}
