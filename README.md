# Ciencias Sociales — I.E.R. Boyacá

App para dar clase de Ciencias Sociales de 6° a 11° como un videojuego retro: el docente elige el aula, llama a lista, narra las misiones con su guion, da puntos con un clic y proyecta escenas, mapas y votaciones. Notas por periodo según el SIE (30 / 35 / 35), asistencia por fecha, Banco de Recursos en vivo y agenda de Google Calendar.

Es solo para el docente: los estudiantes ven el proyector.

## Instalar en un computador nuevo (Windows)

1. Instala **Node.js LTS** (22.12 o superior) desde <https://nodejs.org> y **Git** desde <https://git-scm.com>.
2. Abre **Google Drive para escritorio** con tu cuenta, para que aparezca la unidad `Mi unidad`.
3. En una terminal:

   ```bash
   git clone https://github.com/Leozapatam/Trabajo.git "%USERPROFILE%\CienciasSociales"
   ```

4. Abre la carpeta `CienciasSociales` y haz doble clic en **`Instalar.cmd`**. Instala, compila, busca tu Drive y crea el acceso directo **Ciencias Sociales** en el Escritorio.

Desde ahí, cada doble clic en el acceso directo:

- trae la última versión de GitHub (si hay internet y no hay cambios locales sin guardar);
- instala o compila solo si hace falta;
- arranca el servidor local y abre la app en una ventana propia.

## Tus datos en varios computadores

Los datos (estudiantes, asistencia, notas, agenda) **no van a GitHub**. Se guardan en tu Google Drive, en `Mi unidad\1. 💼 Trabajo\1. Clases\Expedicion6-Datos`, así que te siguen a cualquier PC con tu Drive.

- **Usa la app en un solo computador a la vez.** Si otro guardó algo más nuevo, la app lo avisa ("Otra ventana guardó cambios · Recargar") en vez de borrarlo.
- **Respaldos:** uno diario, uno al cerrar cada clase y otro antes de cualquier guardado que reduzca la lista; quedan en `respaldos\`.
- **Sin Drive:** los datos quedan en `Documentos\Expedicion6-Datos` de ese PC.

### Rutas distintas en un PC

Se detectan solas en cualquier letra de unidad. Para cambiarlas, crea `%USERPROFILE%\.ciencias-sociales.json`:

```json
{
  "clasesDir": "H:\\Mi unidad\\1. 💼 Trabajo\\1. Clases",
  "dataDir": "D:\\OtraCarpeta\\Expedicion6-Datos",
  "bancoDir": "H:\\Mi unidad\\1. 💼 Trabajo\\1. Clases\\Banco de Recursos",
  "powerpointExe": "C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE"
}
```

Todos los campos son opcionales. También sirven las variables `CS_CLASES_DIR`, `EXPEDICION6_DATA_DIR`, `CS_BANCO_DIR` y `CS_POWERPOINT_EXE`.

## Trabajar en el código (cualquier entorno)

Requiere Node.js 22.12+ (`.nvmrc` indica 24). Funciona en Windows, macOS, Linux y entornos en la nube; sin Drive, la app arranca con datos locales y el Banco vacío.

```bash
npm ci
npm run dev        # app + API en http://localhost:5173
npm test           # pruebas (vitest)
npm run typecheck
npm run build      # compila a dist/
npm run serve      # servidor de aula: dist/ + API en http://127.0.0.1:5176
```

Mientras haya cambios sin subir en la carpeta, el acceso directo **no** se actualiza desde GitHub, para no pisar tu trabajo.

### Estructura

| Carpeta | Qué hay |
|---|---|
| `src/pages/` | Pantallas: portada, aulas, lista, clase, grupos, proyector |
| `src/components/clase/` | Pantalla de clase: grupo, inventario, votación, resumen |
| `src/engine/` | Lógica sin interfaz: sesión, notas SIE, grados, asistencia, flujo de clase |
| `src/data/` | Mundos y misiones de 6° a 11° y el plan DBA depurado (`dbaPlan.json`) |
| `server/` | API local: datos en disco, agenda iCal, Banco de Recursos, rutas de cada PC |
| `launcher/` | Acceso directo, lanzador e instalador de Windows |
| `public/assets/art/` | Ilustraciones; toda imagen nueva entra sola a la rotación de fondos |
| `docs/expedicion6/` | Manual del docente, datos y respaldos, flujo de trabajo del equipo |

### Flujo con varios agentes

Claude Code y Antigravity trabajan sobre el mismo repositorio. Las reglas (quién toca qué archivos y cómo hacer commit) están en `docs/expedicion6/TEAM_WORKFLOW.md`. Siempre `git pull` antes de empezar y `git add <rutas exactas>` al terminar.

## Documentación

- `docs/expedicion6/TEACHER_MANUAL.md` — recorrido de una clase y atajos de teclado.
- `docs/expedicion6/DATA_PERSISTENCE.md` — dónde quedan los datos y cómo restaurar un respaldo.
- `docs/expedicion6/TEAM_WORKFLOW.md` — reglas para trabajar en paralelo.
- `docs/expedicion6/CURRICULUM_ALIGNMENT.md` — alineación con los DBA.
