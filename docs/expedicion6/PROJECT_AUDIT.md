# Auditoría del Proyecto — Expedición 6

**Fecha:** 2026-11-15  
**Ubicación del proyecto:** `C:\Users\leoza\.gemini\antigravity\scratch\expedicion-6`

## 1. Estado inicial del workspace

Al iniciar la inspección no existía un workspace activo abierto ni una carpeta previa para **Expedición 6** dentro de `C:\Users\leoza\.gemini\antigravity\scratch`. Por ello, el proyecto se inicializa como una aplicación web limpia y autónoma en `expedicion-6/`.

## 2. Selección tecnológica y justificación

Para cumplir con los requisitos de una experiencia 2D ilustrada, proyección 16:9 en aula sin conexión individual de estudiantes, sincronización en tiempo real entre consola privada y pantalla pública, y modo explorador móvil offline-friendly:

- **Framework:** React 19 + TypeScript + Vite.
  - *Justificación:* Compilación rápida, tipado estricto para el motor reutilizable de mundos/misiones/escenas, y cero dependencias de backend o servicios pagos.
- **Enrutamiento:** `react-router-dom`.
  - *Rutas principales:*
    - `/` — Portal de entrada (Selección de Modo Aula / Game Master o Modo Explorador).
    - `/origenes` — Mapa interactivo del Mundo 1: *Orígenes — Del universo a la Tierra* (4 zonas).
    - `/game-master` — Consola privada del docente (control de sesión, temporizador, pistas, votaciones, equipos, puntos, notas pedagógicas).
    - `/projector` — Pantalla pública optimizada 16:9 para proyección en salón (sin controles privados ni respuestas anticipadas).
    - `/explorar` — Modo Explorador individual para casa (adaptado a móvil, táctil, progreso local en `localStorage`).
- **Sincronización entre ventanas:** `BroadcastChannel` (`expedicion6-session`) con respaldo en `localStorage` y evento `storage`.
  - *Justificación:* Permite abrir `/projector` en una ventana independiente (pantalla extendida de Windows) sincronizada instantáneamente con `/game-master` sin servidor externo.
- **Visualización e ilustración:** Gráficos vectoriales SVG interactivos y animaciones CSS con soporte de `prefers-reduced-motion` y toggle manual de movimiento reducido.
- **Pruebas:** `vitest` para pruebas unitarias del motor de misiones, sincronización y puntuación, más verificación visual en navegador.

## 3. Riesgos técnicos identificados y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Duplicación de pantalla en lugar de pantalla extendida en Windows | Exposición de la consola privada del docente al grupo | Documentar claramente el uso de **Pantalla extendida** (`Win + P` -> *Ampliar*) y ofrecer botón dedicado "Abrir pantalla de proyección" con advertencia visual. |
| Desincronización si el navegador restringe `BroadcastChannel` o se recarga `/projector` | El proyector queda en blanco o desfasado | Persistir el estado completo de la sesión en `localStorage` y rehidratar automáticamente al montar `/projector`, escuchando además el evento `storage` como respaldo. |
| Filtración de respuestas o notas docentes en `/projector` | Pérdida del reto pedagógico en aula | Separar estrictamente el estado proyectable (`revealed`, `activeHintIndex`, `activeSceneIndex`) y no renderizar notas docentes ni respuestas correctas en `/projector` mientras `revealed === false`. |
| Desbordamiento visual en proyectores 1366×768 o 1920×1080 | Texto ilegible desde la parte posterior del salón | Tipografía de escala fluida (`clamp`), alto contraste editorial sobre fondo oscuro cósmico y diseño 16:9 sin scroll innecesario en proyección. |
