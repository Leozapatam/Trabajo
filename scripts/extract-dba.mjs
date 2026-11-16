// Extrae el "Núcleo soberano (depurado)" del plan DBA del docente a src/data/dbaPlan.json.
// Uso: node scripts/extract-dba.mjs ["ruta\al\0.1 DBA PLAN SABER 11.html"]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const DEFAULT_SOURCE = 'G:\\Mi unidad\\1. 💼 Trabajo\\1. Clases\\0.1 DBA PLAN SABER 11.html';
const source = process.argv[2] ?? DEFAULT_SOURCE;
const outFile = fileURLToPath(new URL('../src/data/dbaPlan.json', import.meta.url));

const html = readFileSync(source, 'utf8');
const start = html.indexOf('const dataset = [');
if (start < 0) throw new Error('No se encontró "const dataset" en el plan DBA');

// Recorta el literal del arreglo contando corchetes (ignorando los que van dentro de comillas)
let i = html.indexOf('[', start);
let depth = 0;
let quote = null;
let end = -1;
for (; i < html.length; i++) {
  const ch = html[i];
  if (quote) {
    if (ch === '\\') i++;
    else if (ch === quote) quote = null;
    continue;
  }
  if (ch === '"' || ch === "'" || ch === '`') quote = ch;
  else if (ch === '[') depth++;
  else if (ch === ']' && --depth === 0) {
    end = i + 1;
    break;
  }
}
const literal = html.slice(html.indexOf('[', start), end);
// Contexto vacío: solo evalúa el literal de datos, sin acceso a Node
const dataset = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });

const plan = dataset.map((g) => ({
  grade: g.grado,
  title: g.titulo,
  dbas: g.dbas.map((d) => ({
    num: d.num,
    statement: d.enunciado,
    focus: d.filtro,
    evidences: d.evidencias.filter((e) => e.s === 'clave').map((e) => e.t),
  })),
}));

writeFileSync(outFile, JSON.stringify({ source: 'DBA PLAN IER BOYACÁ — núcleo depurado', grades: plan }, null, 2) + '\n');
const counts = plan.map((g) => `${g.grade}°: ${g.dbas.length} DBA, ${g.dbas.reduce((n, d) => n + d.evidences.length, 0)} evidencias clave`);
console.log(counts.join('\n'));
