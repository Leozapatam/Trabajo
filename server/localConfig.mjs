// Rutas de cada computador: dónde están los datos, el Banco de Recursos y PowerPoint.
// Prioridad: variables de entorno > ~/.ciencias-sociales.json > detección automática.
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const LOCAL_CONFIG_FILE = join(homedir(), '.ciencias-sociales.json');

/** Carpeta "1. Clases" dentro de Google Drive para escritorio, en cualquier letra de unidad */
const CLASES_SUBPATHS = [
  join('Mi unidad', '1. 💼 Trabajo', '1. Clases'),
  join('My Drive', '1. 💼 Trabajo', '1. Clases'),
];

const POWERPOINT_CANDIDATES = [
  'C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE',
  'C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\POWERPNT.EXE',
  'C:\\Program Files\\Microsoft Office\\Office16\\POWERPNT.EXE',
  'C:\\Program Files (x86)\\Microsoft Office\\Office16\\POWERPNT.EXE',
];

export const DATA_FOLDER_NAME = 'Expedicion6-Datos';
/** Ubicación anterior de los datos (antes de sincronizarlos por Drive) */
export const LEGACY_DATA_DIR = join(homedir(), 'Documents', DATA_FOLDER_NAME);

function readLocalConfig(file = LOCAL_CONFIG_FILE) {
  try {
    // Sin BOM: PowerShell 5.1 lo agrega al guardar en UTF-8
    return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
  } catch {
    return {};
  }
}

/** Busca la carpeta "1. Clases" de Drive probando las letras de unidad de D: a Z: (y G: primero) */
export function detectClasesDir(exists = existsSync) {
  if (process.platform !== 'win32') return null;
  const letters = ['G', ...'DEFHIJKLMNOPQRSTUVWXYZ'.split('')];
  for (const letter of letters) {
    for (const sub of CLASES_SUBPATHS) {
      const candidate = `${letter}:\\${sub}`;
      if (exists(candidate)) return candidate;
    }
  }
  return null;
}

/**
 * Resuelve las rutas de este PC.
 * - dataDir: dentro de Drive (se sincroniza entre computadores) si se encuentra; si no, Documentos.
 * - mirrorDir: copia extra de respaldos solo cuando los datos son locales.
 */
export function resolvePaths({ env = process.env, configFile = LOCAL_CONFIG_FILE, exists = existsSync } = {}) {
  const config = readLocalConfig(configFile);
  const clasesDir = env.CS_CLASES_DIR || config.clasesDir || detectClasesDir(exists);
  const dataDir =
    env.EXPEDICION6_DATA_DIR || config.dataDir || (clasesDir ? join(clasesDir, DATA_FOLDER_NAME) : LEGACY_DATA_DIR);
  const dataInDrive = !!clasesDir && dataDir.startsWith(clasesDir);

  let mirrorDir = env.EXPEDICION6_MIRROR_DIR ?? config.mirrorDir;
  if (mirrorDir === undefined) {
    mirrorDir = clasesDir && !dataInDrive ? join(clasesDir, 'Expedicion6-Respaldos') : '';
  }

  const bancoDir = env.CS_BANCO_DIR || config.bancoDir || (clasesDir ? join(clasesDir, 'Banco de Recursos') : null);
  const powerpointExe =
    env.CS_POWERPOINT_EXE || config.powerpointExe || POWERPOINT_CANDIDATES.find((p) => exists(p)) || POWERPOINT_CANDIDATES[0];

  return {
    configFile,
    clasesDir,
    dataDir,
    mirrorDir: mirrorDir || null,
    socialesDir: bancoDir ? join(bancoDir, 'Ciencias Sociales') : null,
    generalesDir: bancoDir ? join(bancoDir, 'Generales') : null,
    powerpointExe,
    dbaPlanFile: clasesDir ? join(clasesDir, '0.1 DBA PLAN SABER 11.html') : null,
  };
}

/**
 * Primera vez que los datos pasan a Drive: copia lo que había en Documentos
 * (datos, agenda y respaldos). No toca nada si Drive ya tiene datos.
 * Devuelve true si copió algo.
 */
export function migrateLegacyData(dataDir, legacyDir = LEGACY_DATA_DIR) {
  if (!dataDir || dataDir === legacyDir) return false;
  const dataFile = 'expedicion6-datos.json';
  if (existsSync(join(dataDir, dataFile)) || !existsSync(join(legacyDir, dataFile))) return false;
  mkdirSync(dataDir, { recursive: true });
  for (const name of [dataFile, 'config.json']) {
    if (existsSync(join(legacyDir, name))) copyFileSync(join(legacyDir, name), join(dataDir, name));
  }
  if (existsSync(join(legacyDir, 'respaldos'))) {
    cpSync(join(legacyDir, 'respaldos'), join(dataDir, 'respaldos'), { recursive: true });
  }
  writeFileSync(
    join(legacyDir, 'LEEME - datos movidos.txt'),
    `Desde ${new Date().toLocaleDateString('es-CO')} los datos de Ciencias Sociales se guardan en:\r\n${dataDir}\r\n\r\nEsta carpeta queda como copia antigua; la app ya no la usa.\r\n`,
    'utf8'
  );
  return true;
}
