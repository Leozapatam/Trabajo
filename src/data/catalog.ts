import { ORIGENES_WORLD, MISIONES_6_ESQUELETO } from './origenesWorld';
import { MUNDO_7_WORLD, MISIONES_7_LIST } from './mundo7';
import { MUNDO_8_WORLD, MISIONES_8_LIST } from './mundo8';
import { MUNDO_9_WORLD, MISIONES_9_LIST } from './mundo9';
import { MISION_00 } from './mision00';
import { MISION_001 } from './mision001';
import type { MissionDefinition, WorldDefinition } from '../engine/types';

export const worldsByGrade: Record<string, WorldDefinition[]> = {
  '6°': [ORIGENES_WORLD],
  '7°': [MUNDO_7_WORLD],
  '8°': [MUNDO_8_WORLD],
  '9°': [MUNDO_9_WORLD],
  '10°': [],
  '11°': [],
  '6°–7°': [ORIGENES_WORLD, MUNDO_7_WORLD],
  '8°–9°': [MUNDO_8_WORLD, MUNDO_9_WORLD],
  '10°–11°': [],
};

export const worldArtById: Record<string, string> = {
  [ORIGENES_WORLD.id]: '/assets/art/mundo-6-origenes.webp',
  [MUNDO_7_WORLD.id]: '/assets/art/mundo-7-imperios.webp',
  [MUNDO_8_WORLD.id]: '/assets/art/mundo-8-revoluciones.webp',
  [MUNDO_9_WORLD.id]: '/assets/art/mundo-9-sigloxx.webp',
};

export const WORLDS: Record<string, WorldDefinition> = {
  [ORIGENES_WORLD.id]: ORIGENES_WORLD,
  [MUNDO_7_WORLD.id]: MUNDO_7_WORLD,
  [MUNDO_8_WORLD.id]: MUNDO_8_WORLD,
  [MUNDO_9_WORLD.id]: MUNDO_9_WORLD,
};

export const MISSIONS_LIST: MissionDefinition[] = [
  MISION_00,
  MISION_001,
  ...MISIONES_6_ESQUELETO,
  ...MISIONES_7_LIST,
  ...MISIONES_8_LIST,
  ...MISIONES_9_LIST,
];

export const MISSIONS: Record<string, MissionDefinition> = Object.fromEntries(
  MISSIONS_LIST.map((m) => [m.id, m])
);

export function getWorld(worldId: string): WorldDefinition {
  return WORLDS[worldId] ?? ORIGENES_WORLD;
}

export function getMission(missionId: string): MissionDefinition {
  return MISSIONS[missionId] ?? MISION_00;
}
