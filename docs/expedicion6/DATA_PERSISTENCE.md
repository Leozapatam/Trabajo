# Datos y respaldos — Expedición 6

## Dónde quedan los datos

| Qué | Dónde |
|---|---|
| Archivo principal | `Documentos\Expedicion6-Datos\expedicion6-datos.json` |
| Respaldos locales (máx. 60) | `Documentos\Expedicion6-Datos\respaldos\` |
| Copia de cada respaldo en Drive | `G:\Mi unidad\1. 💼 Trabajo\1. Clases\Expedicion6-Respaldos\` |

Se cambian con las variables `EXPEDICION6_DATA_DIR` y `EXPEDICION6_MIRROR_DIR` (vacía = sin espejo).

## Cuándo se respalda

- **Diario:** antes del primer guardado de cada día (`AAAA-MM-DD_HHMMSS_diario.json`).
- **Al cerrar clase:** botón "Cerrar clase" (`…_cierre-6-A.json`).
- **Antes de reducir la lista:** si un guardado deja menos estudiantes que el archivo actual (`…_antes-de-reducir-lista.json`).

## Cómo funciona

1. Cada cambio se guarda al instante en `localStorage` y, 0.8 s después, en disco (`PUT /api/datos`, escritura atómica).
2. Al abrir la app, si el disco tiene datos más recientes que el navegador, se restauran (`GET /api/datos`).
3. El panel muestra **Guardado HH:MM** o **Sin respaldo en disco** si el servidor local no responde.
4. La API solo acepta peticiones de `localhost` / `127.0.0.1`.

## Restaurar un respaldo a mano

1. Cerrar la app.
2. Copiar el respaldo elegido sobre `expedicion6-datos.json`.
3. Abrir la app: el disco es más reciente y se restaura solo. Si el navegador tuviera algo más nuevo, borrar sus datos del sitio antes de abrir.

## Comandos

- `npm run dev` — desarrollo (incluye la API).
- `npm run build` y luego `npm run serve` — servidor de aula en `http://127.0.0.1:5176`.
