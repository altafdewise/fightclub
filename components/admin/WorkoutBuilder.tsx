"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { DEFAULT_WORKOUT_BLOCK, groupWorkoutBlocks, type WorkoutBlock } from "@/lib/workouts";

type WorkoutBuilderItem = {
  id: string;
  label: string;
  blockName?: string;
  exerciseName?: string;
  prescription?: string;
  notes?: string;
  sortOrder: number;
  videoUrl?: string | null;
};

type WorkoutBuilderProps = {
  clientId: string;
  initialItems: WorkoutBuilderItem[];
};

function createBlock(name: string, index: number): WorkoutBlock {
  return {
    id: `block-${Date.now()}-${index}`,
    name,
    exercises: [],
  };
}

function createExercise(blockName: string, index: number) {
  return {
    id: `exercise-${Date.now()}-${index}`,
    blockName,
    exerciseName: "",
    prescription: "",
    notes: "",
    videoUrl: "",
    sortOrder: index,
    checked: false,
    label: "",
  };
}

export function WorkoutBuilder({ clientId, initialItems }: WorkoutBuilderProps) {
  const router = useRouter();
  const initialBlocks = useMemo(
    () => groupWorkoutBlocks(initialItems).map((block) => ({ ...block, exercises: [...block.exercises] })),
    [initialItems]
  );
  const [blocks, setBlocks] = useState<WorkoutBlock[]>(
    initialBlocks.length > 0 ? initialBlocks : [createBlock(DEFAULT_WORKOUT_BLOCK, 0)]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlocks(initialBlocks.length > 0 ? initialBlocks : [createBlock(DEFAULT_WORKOUT_BLOCK, 0)]);
  }, [initialBlocks]);

  const moveBlock = (index: number, direction: number) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;
    const nextBlocks = [...blocks];
    [nextBlocks[index], nextBlocks[nextIndex]] = [nextBlocks[nextIndex], nextBlocks[index]];
    setBlocks(nextBlocks);
  };

  const updateBlock = (index: number, patch: Partial<WorkoutBlock>) => {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block
      )
    );
  };

  const deleteBlock = (index: number) => {
    setBlocks((current) => {
      const next = current.filter((_, blockIndex) => blockIndex !== index);
      return next.length > 0 ? next : [createBlock(DEFAULT_WORKOUT_BLOCK, 0)];
    });
  };

  const addBlock = () => {
    setBlocks((current) => [...current, createBlock(`${DEFAULT_WORKOUT_BLOCK} ${current.length + 1}`, current.length)]);
  };

  const moveExercise = (blockIndex: number, exerciseIndex: number, direction: number) => {
    const nextExerciseIndex = exerciseIndex + direction;
    const block = blocks[blockIndex];
    if (!block || nextExerciseIndex < 0 || nextExerciseIndex >= block.exercises.length) return;

    const nextExercises = [...block.exercises];
    [nextExercises[exerciseIndex], nextExercises[nextExerciseIndex]] = [
      nextExercises[nextExerciseIndex],
      nextExercises[exerciseIndex],
    ];

    updateBlock(blockIndex, { exercises: nextExercises });
  };

  const updateExercise = (
    blockIndex: number,
    exerciseIndex: number,
    field: "exerciseName" | "prescription" | "notes" | "videoUrl",
    value: string
  ) => {
    setBlocks((current) =>
      current.map((block, currentBlockIndex) => {
        if (currentBlockIndex !== blockIndex) return block;
        return {
          ...block,
          exercises: block.exercises.map((exercise, currentExerciseIndex) =>
            currentExerciseIndex === exerciseIndex
              ? { ...exercise, blockName: block.name, [field]: value }
              : exercise
          ),
        };
      })
    );
  };

  const deleteExercise = (blockIndex: number, exerciseIndex: number) => {
    setBlocks((current) =>
      current.map((block, currentBlockIndex) =>
        currentBlockIndex === blockIndex
          ? { ...block, exercises: block.exercises.filter((_, index) => index !== exerciseIndex) }
          : block
      )
    );
  };

  const addExercise = (blockIndex: number) => {
    setBlocks((current) =>
      current.map((block, currentBlockIndex) =>
        currentBlockIndex === blockIndex
          ? {
              ...block,
              exercises: [
                ...block.exercises,
                createExercise(block.name, block.exercises.length),
              ],
            }
          : block
      )
    );
  };

  const saveWorkout = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/exercises`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to save workout.");
      }

      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Unable to save workout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Workout Builder</p>
          <h2 className="text-xl font-semibold text-white">Plan by blocks</h2>
          <p className="mt-2 text-sm text-white/60">
            Build warm-ups, strength, core, conditioning, and cooldown work in a clean structure.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={addBlock}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.06]"
          >
            Add Block
          </button>
          <button
            type="button"
            onClick={saveWorkout}
            disabled={saving}
            className={cn(
              "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
              saving && "hover:bg-white"
            )}
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {blocks.map((block, blockIndex) => (
          <div
            key={block.id}
            className="space-y-4 rounded-[26px] border border-white/12 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent p-4 sm:p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <label className="flex flex-col gap-2 text-sm text-white/75">
                  Block Name
                  <input
                    value={block.name}
                    onChange={(event) => updateBlock(blockIndex, { name: event.target.value })}
                    className="w-full rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                    placeholder="Warm Up"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => moveBlock(blockIndex, -1)}
                  className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(blockIndex, 1)}
                  className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(blockIndex)}
                  className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {block.exercises.length === 0 ? (
                <p className="text-sm text-white/45">No exercises in this block yet.</p>
              ) : null}

              {block.exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exercise.id}
                  className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="grid gap-3 lg:grid-cols-[1.3fr_0.9fr]">
                    <label className="flex flex-col gap-2 text-sm text-white/75">
                      Exercise
                      <input
                        value={exercise.exerciseName}
                        onChange={(event) =>
                          updateExercise(blockIndex, exerciseIndex, "exerciseName", event.target.value)
                        }
                        className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="Barbell Squat"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-white/75">
                      Sets / Reps / Duration
                      <input
                        value={exercise.prescription}
                        onChange={(event) =>
                          updateExercise(blockIndex, exerciseIndex, "prescription", event.target.value)
                        }
                        className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                        placeholder="5 x 5"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-2 text-sm text-white/75">
                    Notes (optional)
                    <input
                      value={exercise.notes}
                      onChange={(event) =>
                        updateExercise(blockIndex, exerciseIndex, "notes", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="Keep rest under 2 minutes"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-white/75">
                    Video Link (optional)
                    <input
                      value={exercise.videoUrl || ""}
                      onChange={(event) =>
                        updateExercise(blockIndex, exerciseIndex, "videoUrl", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                      placeholder="https://..."
                    />
                  </label>

                  <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => moveExercise(blockIndex, exerciseIndex, -1)}
                      className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExercise(blockIndex, exerciseIndex, 1)}
                      className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteExercise(blockIndex, exerciseIndex)}
                      className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addExercise(blockIndex)}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.06] sm:w-auto"
            >
              Add Exercise
            </button>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
