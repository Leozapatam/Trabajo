import { ORIGENES_WORLD } from './origenesWorld';
import { MISION_00 } from './mision00';
import { MISION_001 } from './mision001';
import type { MissionDefinition, WorldDefinition } from '../engine/types';

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
