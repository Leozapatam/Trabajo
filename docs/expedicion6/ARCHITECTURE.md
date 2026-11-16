# Arquitectura del Sistema — Expedición 6

## 1. Principios de diseño

1. **Separación contenido / motor:** Los mundos (`src/data/origenesWorld.ts`) y misiones (`src/data/mision001.ts`) son estructuras de datos declarativas consumidas por un motor reutilizable (`src/engine/`). Agregar una Misión 002 o un Mundo 2 no requiere reconstruir las interfaces.
2. **Prioridad de aula sin dispositivos estudiantiles:** El docente controla la sesión desde `/game-master` y proyecta `/projector` en 16:9.
3. **Cero dependencias de backend o cuentas:** La sincronización entre consola y proyector usa `BroadcastChannel('expedicion6-session')` con respaldo y persistencia en `localStorage` (`expedicion6.session.v1`) y evento `storage`.

## 2. Estructura de carpetas

- `src/engine/types.ts` — Contratos tipados para mundos, zonas, misiones, escenas, sesión y modo explorador.
- `src/engine/sessionStore.ts` — Estado de sesión del Game Master, temporizador, votación, puntuación en 4 categorías y filtro de privacidad `buildPublicProjectorView()`.
- `src/engine/explorerStore.ts` — Persistencia local del Modo Explorador (`expedicion6.explorer.v1`).
- `src/data/origenesWorld.ts` — Datos del Mundo 1 (*Orígenes*) y sus 4 zonas.
- `src/data/mision001.ts` — Datos completos de *Misión 001 — El comienzo de todo* (7 escenas, glosario, rúbrica y fuentes).
- `src/data/catalog.ts` — Registro central de mundos y misiones.
- `src/components/SceneVisualStage.tsx` — Renderizador visual 2D reutilizable por tipo de escena.
- `src/pages/LandingPage.tsx`, `WorldMapPage.tsx`, `GameMasterPage.tsx`, `ProjectorPage.tsx`, `ExplorerPage.tsx`.

## 3. Garantía de privacidad en `/projector`

`ProjectorPage` nunca lee `scene.teacherNotes` directamente. Toda la información pasa por `buildPublicProjectorView(session, scene)`:
- Cuando `session.revealed === false`, `publicAnswerSummary` y `scientificFeedback` se devuelven como `null`, y `SceneVisualStage` oculta los indicadores de validez.
- Solo se muestran las pistas hasta `session.revealedHintsCount`.
