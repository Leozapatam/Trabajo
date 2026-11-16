import type {
  MissionDefinition,
  WorldDefinition,
  ZoneDefinition,
} from '../engine/types';
import dbaPlan from './dbaPlan.json';

export interface ZoneMetaSpec {
  num: number;
  title: string;
  subtitle: string;
  accentColor: string;
  artwork: string;
  resourceUnits: string[];
  missionId: string;
  missionTitle: string;
  centralQuestion: string;
}

export function getGradeDbas(gradeNum: number) {
  const found = dbaPlan.grades.find((g) => g.grade === gradeNum);
  if (!found) {
    throw new Error(`Grado ${gradeNum} no encontrado en dbaPlan.json`);
  }
  return found.dbas;
}

/**
 * Construye una misión esqueleto jugable en aula a partir de un DBA exacto de dbaPlan.json,
 * garantizando que todas las evidencias citadas pertenezcan exclusivamente al núcleo depurado.
 */
export function buildSkeletonMissionFromDba(
  gradeLabel: string,
  worldId: string,
  zoneId: string,
  dba: { num: number; statement: string; focus: string; evidences: string[] },
  spec: ZoneMetaSpec
): MissionDefinition {
  return {
    id: spec.missionId,
    worldId,
    zoneId,
    code: `MISIÓN ${gradeLabel.replace('°', '')}0${dba.num}`,
    title: spec.missionTitle,
    subtitle: spec.subtitle,
    centralQuestion: spec.centralQuestion,
    grade: `Grado ${gradeLabel} — Ciencias Sociales`,
    area: 'Ciencias Sociales (I.E.R. Boyacá)',
    estimatedDurations: [45],
    objectives: [dba.statement],
    resourceUnits: spec.resourceUnits,
    curriculumRefs: [
      {
        code: `DBA ${dba.num} — Ciencias Sociales ${gradeLabel} (I.E.R. Boyacá)`,
        source: 'Plan DBA depurado (src/data/dbaPlan.json)',
        statement: dba.statement,
        nature: 'directa',
        evidences: [...dba.evidences],
      },
    ],
    glossary: [
      {
        term: spec.title,
        definition: dba.focus,
      },
    ],
    sources: [
      {
        id: `src-${spec.missionId}`,
        title: `DBA ${dba.num} — Grado ${gradeLabel}`,
        institution: 'MEN / I.E.R. Boyacá (núcleo depurado)',
        note: dba.focus,
      },
    ],
    scenes: [
      {
        id: `${spec.missionId}-e0`,
        index: 0,
        code: 'PANTALLA 1',
        title: `Apertura: ${spec.missionTitle}`,
        type: 'opening',
        participationMode: 'individual',
        participationLabel: 'Narración docente · Cuaderno de campo',
        narrative: dba.statement,
        promptQuestion: spec.centralQuestion,
        notebookPrompt:
          'Escribe en tu cuaderno tu hipótesis inicial en 2 o 3 líneas antes de analizar las evidencias.',
        defaultTimerSeconds: 180,
        hints: [dba.evidences[0] ?? dba.focus],
        publicAnswerSummary: dba.focus,
        scientificFeedback: dba.evidences[0] ?? dba.statement,
        teacherNotes: {
          pedagogicalGoal: dba.statement,
          facilitationScript:
            'Presente la pregunta central, escuche 2 o 3 hipótesis iniciales y conecte con las evidencias del DBA.',
          whatToWatchFor: dba.focus,
          adaptationShortSession: 'Focalice la discusión en la primera evidencia clave.',
        },
      },
      {
        id: `${spec.missionId}-e1`,
        index: 1,
        code: 'PANTALLA 2',
        title: 'Síntesis y retos de evidencia',
        type: 'closing',
        participationMode: 'deliberation',
        participationLabel: 'Deliberación colectiva · Síntesis',
        narrative: dba.focus,
        promptQuestion: `¿Qué evidencias nos permiten responder: ${spec.centralQuestion}?`,
        defaultTimerSeconds: 180,
        hints: dba.evidences.slice(1),
        publicAnswerSummary: dba.evidences.join(' · '),
        scientificFeedback: dba.statement,
        challengeData: {
          closingSynthesis: [...dba.evidences],
        },
        teacherNotes: {
          pedagogicalGoal: 'Verificar las evidencias clave del DBA en el cuaderno del explorador.',
          facilitationScript: 'Revise con el grupo cada evidencia depurada y cierre la sesión.',
          whatToWatchFor: 'Uso de argumentos propios basados en las evidencias trabajadas.',
          adaptationShortSession: 'Cierre con síntesis oral y registro de puntos.',
        },
      },
    ],
  };
}

export function buildWorldFromDbas(
  gradeNum: number,
  gradeLabel: string,
  worldId: string,
  title: string,
  subtitle: string,
  description: string,
  artwork: string,
  specs: ZoneMetaSpec[]
): WorldDefinition {
  const dbas = getGradeDbas(gradeNum);
  const zones: ZoneDefinition[] = dbas.map((dba, idx) => {
    const spec = specs.find((s) => s.num === dba.num) ?? specs[idx];
    return {
      id: `${worldId}-z${dba.num}`,
      number: dba.num,
      title: spec.title,
      subtitle: spec.subtitle,
      accentColor: spec.accentColor,
      artwork: spec.artwork,
      resourceUnits: spec.resourceUnits,
      mapPosition: { x: 14 + idx * 10, y: idx % 2 === 0 ? 28 : 66 },
      fundamentalQuestions: [dba.statement, spec.centralQuestion],
      mechanics: ['Narración docente', 'Retos de evidencia', 'Cuaderno de campo'],
      summary: dba.focus,
      nodes: dba.evidences.map((ev, evIdx) => ({
        id: `${worldId}-dba${dba.num}-ret${evIdx + 1}`,
        title: evIdx === 0 ? spec.missionTitle : `Reto ${dba.num}.${evIdx + 1}`,
        kind: evIdx === 0 ? 'mision' : 'exploracion',
        summary: ev,
        scientificDetail: dba.focus,
        linkedMissionId: evIdx === 0 ? spec.missionId : undefined,
      })),
    };
  });

  return {
    id: worldId,
    grade: gradeLabel,
    title,
    subtitle,
    description,
    artwork,
    zones,
  };
}
