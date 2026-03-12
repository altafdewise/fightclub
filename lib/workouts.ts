export type WorkoutExercise = {
  id: string;
  blockName: string;
  exerciseName: string;
  prescription: string;
  notes: string;
  videoUrl: string | null;
  sortOrder: number;
  checked: boolean;
  label: string;
};

export type WorkoutBlock = {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
};

type WorkoutRow = {
  id?: string | null;
  blockName?: string | null;
  block_name?: string | null;
  exerciseName?: string | null;
  exercise_name?: string | null;
  prescription?: string | null;
  exerciseNotes?: string | null;
  exercise_notes?: string | null;
  videoUrl?: string | null;
  video_url?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
  checked?: boolean | null;
  label?: string | null;
};

export const DEFAULT_WORKOUT_BLOCK = "Workout";

function normalizeText(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function parseLegacyLabel(label: string) {
  const trimmed = normalizeText(label);
  if (!trimmed) {
    return { exerciseName: "", prescription: "" };
  }

  const divider = trimmed.includes(" – ") ? " – " : trimmed.includes(" - ") ? " - " : null;
  if (!divider) {
    return { exerciseName: trimmed, prescription: "" };
  }

  const [exerciseName, ...rest] = trimmed.split(divider);
  return {
    exerciseName: normalizeText(exerciseName),
    prescription: normalizeText(rest.join(divider)),
  };
}

export function normalizeWorkoutExercise(row: WorkoutRow, fallbackIndex: number): WorkoutExercise {
  const blockName = normalizeText(row.blockName ?? row.block_name) || DEFAULT_WORKOUT_BLOCK;
  const legacy = parseLegacyLabel(row.label ?? "");
  const exerciseName =
    normalizeText(row.exerciseName ?? row.exercise_name) || legacy.exerciseName || `Exercise ${fallbackIndex + 1}`;
  const prescription = normalizeText(row.prescription) || legacy.prescription;
  const notes = normalizeText(row.exerciseNotes ?? row.exercise_notes);
  const videoUrl = normalizeText(row.videoUrl ?? row.video_url) || null;
  const sortOrder = Number(row.sortOrder ?? row.sort_order ?? fallbackIndex);
  const label = buildExerciseLabel(exerciseName, prescription);

  return {
    id: row.id ?? `${blockName}-${sortOrder}-${fallbackIndex}`,
    blockName,
    exerciseName,
    prescription,
    notes,
    videoUrl,
    sortOrder,
    checked: row.checked ?? false,
    label,
  };
}

export function groupWorkoutBlocks(rows: WorkoutRow[]): WorkoutBlock[] {
  const normalized = rows
    .map((row, index) => normalizeWorkoutExercise(row, index))
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const blocks: WorkoutBlock[] = [];
  const lookup = new Map<string, WorkoutBlock>();

  normalized.forEach((exercise, index) => {
    const blockKey = `${exercise.blockName}-${blocks.length}`;
    let block = lookup.get(exercise.blockName);
    if (!block) {
      block = {
        id: `${blockKey}-${index}`,
        name: exercise.blockName,
        exercises: [],
      };
      lookup.set(exercise.blockName, block);
      blocks.push(block);
    }
    block.exercises.push({
      ...exercise,
      sortOrder: block.exercises.length,
    });
  });

  return blocks;
}

export function flattenWorkoutBlocks(blocks: WorkoutBlock[]) {
  return blocks.flatMap((block, blockIndex) =>
    block.exercises
      .map((exercise, exerciseIndex) => {
        const blockName = normalizeText(block.name) || `${DEFAULT_WORKOUT_BLOCK} ${blockIndex + 1}`;
        const exerciseName = normalizeText(exercise.exerciseName);
        const prescription = normalizeText(exercise.prescription);
        const notes = normalizeText(exercise.notes);
        const videoUrl = normalizeText(exercise.videoUrl) || null;

        if (!exerciseName) {
          return null;
        }

        return {
          id: exercise.id,
          blockName,
          exerciseName,
          prescription,
          notes,
          videoUrl,
          sortOrder: blockIndex * 1000 + exerciseIndex,
          label: buildExerciseLabel(exerciseName, prescription),
        };
      })
      .filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise))
  );
}

export function buildExerciseLabel(exerciseName: string, prescription?: string | null) {
  const normalizedName = normalizeText(exerciseName);
  const normalizedPrescription = normalizeText(prescription);
  if (!normalizedPrescription) return normalizedName;
  return `${normalizedName} – ${normalizedPrescription}`;
}
