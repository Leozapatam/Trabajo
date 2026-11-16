# Datos y respaldos — Ciencias Sociales

## Dónde quedan los datos

Las rutas de cada computador las resuelve `server/localConfig.mjs`: variables de entorno, luego `%USERPROFILE%\.ciencias-sociales.json` y, si no hay nada, detección automática de Google Drive en cualquier letra de unidad.

| Qué | Con Google Drive | Sin Drive |
|---|---|---|
| Archivo principal | `…\1. Clases\Expedicion6-Datos\expedicion6-datos.json` | `Documentos\Expedicion6-Datos\expedicion6-datos.json` |
| Respaldos (máx. 60) | `…\1. Clases\Expedicion6-Datos\respaldos\` | `Documentos\Expedicion6-Datos\respaldos\` |
| Dirección iCal de la agenda | `…\Expedicion6-Datos\config.json` | `Documentos\Expedicion6-Datos\config.json` |
| Registros del lanzador | `%LOCALAPPDATA%\CienciasSociales\` | igual |

Con Drive, los datos se sincronizan entre computadores. **Usa la app en un solo PC a la vez.** Si otro guardó algo más nuevo, la app no lo pisa y muestra "Otra ventana guardó cambios · Recargar".

Variables: `CS_CLASES_DIR`, `EXPEDICION6_DATA_DIR`, `CS_BANCO_DIR`, `CS_POWERPOINT_EXE` y `EXPEDICION6_MIRROR_DIR`. Esta última es una copia extra de los respaldos; solo se activa cuando los datos están fuera de Drive. Si la dejas vacía, no se hace la copia.

### Traslado desde Documentos

Antes los datos vivían en `Documentos\Expedicion6-Datos`. La primera vez que el servidor arranca con Drive disponible, copia ahí los datos, la agenda y los respaldos, y deja en la carpeta vieja un `LEEME - datos movidos.txt`. Nunca reemplaza datos que ya estén en Drive.

## Cuándo se respalda

- **Diario:** antes del primer guardado de cada día (`AAAA-MM-DD_HHMMSS_diario.json`).
- **Al cerrar clase:** botón "Cerrar clase" (`…_cierre-6.json`).
- **Antes de reducir la lista:** si un guardado deja menos estudiantes que el archivo actual (`…_antes-de-reducir-lista.json`).

## Cómo funciona

1. Cada cambio se guarda al instante en el navegador y, 0.8 s después, en disco (`PUT /api/datos`, escritura atómica).
2. Al abrir la app, si el disco tiene datos más recientes que el navegador, se restauran (`GET /api/datos`).
3. Un guardado hecho sobre una versión vieja se rechaza (409) para no pisar lo de otra ventana u otro PC.
4. La API solo acepta peticiones de `localhost` / `127.0.0.1`.

## Restaurar un respaldo a mano

1. Cierra la app en todos los computadores.
2. Copia el respaldo elegido sobre `expedicion6-datos.json`.
3. Abre la app: el disco es más reciente y se restaura solo. Si el navegador tuviera algo más nuevo, borra antes los datos del sitio.

## Acceso directo e instalación

- `Instalar.cmd` (raíz del proyecto) instala dependencias, compila, muestra las rutas detectadas y crea el acceso directo. Se puede repetir sin problema.
- Al hacer doble clic en el acceso directo, `Ciencias-Sociales.vbs` ejecuta `Ciencias-Sociales.ps1` sin mostrar consola:
  1. `git pull --ff-only` desde GitHub si no hay cambios locales sin guardar (30 s máximo; sin internet, sigue con la versión local);
  2. `npm ci` si faltan dependencias o cambió `package-lock.json`;
  3. compila si cambió algo en `src/`, `public/` o `index.html` (si falla, abre la última versión buena);
  4. arranca o reinicia `server/index.mjs` en `127.0.0.1:5176` y abre Edge en modo aplicación.
