import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const DEFAULT_SOCIALES_DIR =
  'G:\\Mi unidad\\1. 💼 Trabajo\\1. Clases\\Banco de Recursos\\Ciencias Sociales';
export const DEFAULT_GENERALES_DIR =
  'G:\\Mi unidad\\1. 💼 Trabajo\\1. Clases\\Banco de Recursos\\Generales';
export const POWERPOINT_EXE =
  'C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE';

const CACHE_TTL_MS = 5 * 60 * 1000;

const TYPE_BY_EXT = {
  '.pptx': 'diapositivas',
  '.ppt': 'diapositivas',
  '.gslides': 'diapositivas',
  '.mp4': 'video',
  '.webm': 'video',
  '.mkv': 'video',
  '.mov': 'video',
  '.pdf': 'pdf',
  '.docx': 'documento',
  '.doc': 'documento',
  '.gdoc': 'documento',
  '.html': 'actividad',
  '.htm': 'actividad',
  '.json': 'datos',
  '.csv': 'datos',
  '.xlsx': 'datos',
  '.png': 'imagen',
  '.jpg': 'imagen',
  '.jpeg': 'imagen',
  '.webp': 'imagen',
  '.gif': 'imagen',
};

const MIME_BY_EXT = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.json': 'application/json; charset=utf-8',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.zip': 'application/zip',
};

export function shouldIgnoreEntry(name) {
  if (!name) return true;
  if (name.startsWith('.')) return true;
  if (name.startsWith('~$')) return true;
  if (name.toLowerCase() === 'desktop.ini') return true;
  return false;
}

export function parseUnitFolder(folderName) {
  const m = /^(\d{1,2})\.\s*(.+)$/.exec(folderName.trim());
  if (m) {
    return {
      code: m[1].padStart(2, '0'),
      name: m[2].trim(),
      label: folderName.trim(),
    };
  }
  return {
    code: '00',
    name: folderName.trim(),
    label: folderName.trim(),
  };
}

export function parseResourceFileName(fileName, unitTopicName) {
  const ext = path.extname(fileName).toLowerCase();
  let base = path.basename(fileName, path.extname(fileName)).trim();

  const opcional = /\(opcional\)/i.test(base);
  base = base.replace(/\(opcional\)/gi, '').replace(/\s+/g, ' ').replace(/,\s*$/g, '').trim();

  let code = null;
  const codeMatch = /^(\d+(?:\.\d+)+)\s+(.+)$/.exec(base);
  if (codeMatch) {
    code = codeMatch[1];
    base = codeMatch[2].trim();
  } else if (unitTopicName) {
    const escaped = unitTopicName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixRe = new RegExp(`^${escaped}\\s*[,:\\-–]\\s*`, 'i');
    base = base.replace(prefixRe, '').trim();
  }

  return {
    title: base || fileName,
    code,
    opcional,
    ext,
    type: TYPE_BY_EXT[ext] ?? 'archivo',
  };
}

function stableId(relPath) {
  return crypto.createHash('sha1').update(relPath.replace(/\\/g, '/')).digest('hex').slice(0, 12);
}

function compareCodes(a, b) {
  if (a.unit.code !== b.unit.code) return a.unit.code.localeCompare(b.unit.code);
  if (a.code && b.code) {
    const pa = a.code.split('.').map(Number);
    const pb = b.code.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
      const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
      if (diff !== 0) return diff;
    }
  }
  if (a.code && !b.code) return -1;
  if (!a.code && b.code) return 1;
  return a.title.localeCompare(b.title, 'es');
}

async function scanDirectoryTree(dirPath, rootLabel, unitInfo, baseRootForId, outList) {
  let entries;
  try {
    entries = await fsp.readdir(dirPath, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const entry of entries) {
    if (shouldIgnoreEntry(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await scanDirectoryTree(fullPath, rootLabel, unitInfo, baseRootForId, outList);
    } else if (entry.isFile()) {
      let stat;
      try {
        stat = await fsp.stat(fullPath);
      } catch {
        continue;
      }
      const relPath = `${rootLabel}/${path.relative(baseRootForId, fullPath)}`;
      const parsed = parseResourceFileName(entry.name, unitInfo.name);
      outList.push({
        id: stableId(relPath),
        title: parsed.title,
        fileName: entry.name,
        code: parsed.code,
        unit: unitInfo,
        type: parsed.type,
        ext: parsed.ext,
        opcional: parsed.opcional,
        size: stat.size,
        mtimeMs: Math.round(stat.mtimeMs),
        isDriveShortcut: parsed.ext === '.gslides' || parsed.ext === '.gdoc',
        fullPath,
      });
    }
  }
  return true;
}

export function createResourceScanner({
  socialesDir = DEFAULT_SOCIALES_DIR,
  generalesDir = DEFAULT_GENERALES_DIR,
  powerpointExe = POWERPOINT_EXE,
  ttlMs = CACHE_TTL_MS,
} = {}) {
  let cache = null;
  let cacheAt = 0;

  async function scan() {
    const items = [];
    let available = false;

    try {
      const topEntries = await fsp.readdir(socialesDir, { withFileTypes: true });
      available = true;
      for (const entry of topEntries) {
        if (shouldIgnoreEntry(entry.name)) continue;
        const full = path.join(socialesDir, entry.name);
        if (entry.isDirectory()) {
          const unit = parseUnitFolder(entry.name);
          await scanDirectoryTree(full, 'Sociales', unit, socialesDir, items);
        }
      }
    } catch {
      // Sociales dir no disponible
    }

    const genOk = await scanDirectoryTree(
      generalesDir,
      'Generales',
      { code: '00', name: 'Generales', label: 'Generales' },
      generalesDir,
      items
    );
    if (genOk) available = true;

    items.sort(compareCodes);

    const byId = new Map();
    const publicResources = items.map(({ fullPath, ...pub }) => {
      byId.set(pub.id, { ...pub, fullPath });
      return pub;
    });

    const unitsMap = new Map();
    for (const r of publicResources) {
      if (!unitsMap.has(r.unit.code)) unitsMap.set(r.unit.code, r.unit);
    }
    const units = [...unitsMap.values()].sort((a, b) => a.code.localeCompare(b.code));

    cache = {
      available,
      scannedAt: Date.now(),
      units,
      resources: publicResources,
      byId,
    };
    cacheAt = Date.now();
    return cache;
  }

  async function getIndex(forceRefresh = false) {
    if (!forceRefresh && cache && Date.now() - cacheAt < ttlMs) {
      return cache;
    }
    return scan();
  }

  async function openResource(id, modo = 'abrir') {
    const idx = await getIndex(false);
    const entry = idx.byId.get(id);
    if (!entry) {
      throw Object.assign(new Error('Recurso no encontrado'), { status: 404 });
    }

    const usePowerPoint =
      entry.ext === '.pptx' && modo === 'presentar' && fs.existsSync(powerpointExe);

    const cmd = usePowerPoint ? powerpointExe : 'explorer.exe';
    const args = usePowerPoint ? ['/S', entry.fullPath] : [entry.fullPath];

    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    child.unref();

    return {
      ok: true,
      launchedWith: usePowerPoint ? 'powerpoint' : 'explorer',
      id: entry.id,
      title: entry.title,
    };
  }

  async function serveResourceFile(id, req, res) {
    const idx = await getIndex(false);
    const entry = idx.byId.get(id);
    if (!entry) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Recurso no encontrado' }));
      return;
    }
    if (entry.isDriveShortcut) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Acceso directo de Drive: usar abrir' }));
      return;
    }

    const stat = await fsp.stat(entry.fullPath);
    const total = stat.size;
    const contentType = MIME_BY_EXT[entry.ext] ?? 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-store');

    const range = req.headers?.range;
    if (range && typeof range === 'string') {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!m) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${total}`);
        res.end();
        return;
      }
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Math.min(total - 1, Number(m[2])) : total - 1;
      if (start >= total || start > end || Number.isNaN(start) || Number.isNaN(end)) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${total}`);
        res.end();
        return;
      }
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
      res.setHeader('Content-Length', String(end - start + 1));
      fs.createReadStream(entry.fullPath, { start, end }).pipe(res);
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Length', String(total));
    fs.createReadStream(entry.fullPath).pipe(res);
  }

  return { getIndex, openResource, serveResourceFile };
}
