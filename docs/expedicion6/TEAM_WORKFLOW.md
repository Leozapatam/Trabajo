# Flujo de Trabajo Colaborativo: Antigravity + Claude Code

**Repositorio objetivo:** `https://github.com/Leozapatam/Trabajo`  
**Carpeta local en PC:** `C:\Users\leoza\.gemini\antigravity\scratch\expedicion-6`

Ambos agentes trabajan sobre la misma carpeta local y sincronizan mediante `git pull` / `git commit` / `git push` para no pisarse el código.

---

## 1. División de Tareas Recomendada

### Tareas para Antigravity (Diseño visual, Mundos, Proyector y Verificación en Navegador)
1. **Dirección artística y Mundo 2+:** Ilustraciones generadas, mapas tácticos tipo estrategia con niebla de guerra y estética retro epic pixel art.
2. **Pantallas de proyección (`/projector`):** Nuevos pantallazos narrativos, animaciones limpias y pruebas visuales en Chromium (16:9).
3. **Currículo y Misiones nuevas:** Estructuración pedagógica de los siguientes mundos (DBA 2 a DBA 8 de Ciencias Sociales 6°) y verificación documental.
4. **Modo Explorador (`/explorar`):** Adaptación móvil para práctica voluntaria en casa.

### Tareas para Claude Code (Lógica de Datos, Reportes de Notas y Automatización Local)
1. **Exportación e informes de notas (3 Periodos):** Exportar a Excel/CSV por salón (`6°A`, `6°B`) con asistencia acumulada (`P/A/E`), puntos por criterio y nota final `1.0` a `5.0` por periodo y anual.
2. **Respaldo automático local (JSON / SQLite ligero opcional):** Guardar y restaurar copias de seguridad de `expedicion6.session.v1` directamente en una carpeta del PC para no depender solo del navegador.
3. **Escáner automático de `G:\Mi unidad\1. 💼 Trabajo\1. Clases\Banco de Recursos`:** Script Node/PowerShell que indexe nuevos `.pptx`, `.pdf`, `.mp4` y `.html` de otras carpetas (`02. Prehistoria...` hasta `12. Ciudadanía...`) al JSON del inventario.
4. **Refinamiento de pruebas unitarias (`vitest`)** para cálculos de notas por periodo y cierre de año.

---

## 2. Regla de oro para trabajar juntos sin conflictos
- Antes de pedirle cambios a uno de los dos, hacer `git pull` o confirmar qué archivos va a tocar.
- Antigravity trabaja principalmente en `src/pages/`, `src/components/`, `src/data/` y `public/assets/`.
- Claude Code trabaja principalmente en `src/engine/`, scripts de exportación/escaneo en `scripts/` y pruebas en `src/engine/__tests__/`.
