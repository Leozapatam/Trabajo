# EXPEDICIÓN 6 — Mundo 1: ORÍGENES (Del universo a la Tierra)

Entorno de aprendizaje gamificado para **Ciencias Sociales de grado sexto** (Colombia), centrado en el **Modo Aula** dirigido por el docente como Game Master y complementado por un **Modo Explorador** voluntario para el hogar.

## Requisitos

- Node.js 20+ y npm

## Instalación y ejecución local

```bash
npm install
npm run dev
```

Luego abra en el navegador la URL que indique Vite (por defecto `http://localhost:5173`).

## Rutas principales

- `/` — Portal de inicio y selección de modalidad.
- `/origenes` — Mapa interactivo del Mundo 1 (*Orígenes*) con sus 4 zonas.
- `/game-master` — Consola privada del docente (control de sesión, escenas, temporizador, pistas, votaciones, equipos y guía pedagógica).
- `/projector` — Pantalla pública 16:9 sincronizada en tiempo real con la consola.
- `/explorar` — Modo Explorador individual para casa (adaptado a móvil, progreso local en `localStorage`, sin cuentas).

## Pruebas y compilación

```bash
npm run typecheck
npm test
npm run build
```

## Documentación del proyecto

- `docs/expedicion6/PROJECT_AUDIT.md` — Auditoría inicial y decisiones técnicas.
- `docs/expedicion6/CURRICULUM_ALIGNMENT.md` — Alineación curricular (DBA Sociales 6° y Lineamientos MEN).
- `docs/expedicion6/ARCHITECTURE.md` — Arquitectura del motor reutilizable y sincronización.
- `docs/expedicion6/MISSION_001_DESIGN.md` — Diseño pedagógico y lúdico de la Misión 001.
- `docs/expedicion6/TEACHER_MANUAL.md` — Manual breve de uso en aula para docentes.
