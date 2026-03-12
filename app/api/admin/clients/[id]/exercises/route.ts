import { NextResponse } from "next/server";
import { getAdminSession, getHQSession } from "@/lib/auth";
import { transaction } from "@/lib/db";
import { todayKey } from "@/lib/date";
import { isSafeHttpUrl } from "@/utils/url";
import { DEFAULT_WORKOUT_BLOCK, flattenWorkoutBlocks } from "@/lib/workouts";
import { requireAdminOrHQ } from "@/lib/server/requireAdminOrHQ";

type CleanedExercise = {
  blockName: string;
  exerciseName: string;
  prescription: string;
  notes: string;
  label: string;
  videoUrl: string | null;
  sortOrder: number;
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrHQ();
  if (!auth.authorized) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (auth.role === "admin") {
    const adminSession = await getAdminSession();
    if (!adminSession?.admin) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
  } else {
    const hqSession = await getHQSession();
    if (!hqSession?.hq) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
  }

  try {
    const body = await req.json();
    const { items, blocks } = body;
    const { id } = await params;
    if (!Array.isArray(items) && !Array.isArray(blocks)) {
      return NextResponse.json({ message: "Invalid items list." }, { status: 400 });
    }

    const legacyItems = Array.isArray(items) ? items : [];
    const normalizedBlocks = Array.isArray(blocks)
      ? blocks.map((block: any, blockIndex: number) => ({
          id: String(block?.id ?? `block-${blockIndex}`),
          name: String(block?.name ?? "").trim() || `${DEFAULT_WORKOUT_BLOCK} ${blockIndex + 1}`,
          exercises: Array.isArray(block?.exercises)
            ? block.exercises.map((exercise: any, exerciseIndex: number) => ({
                id: String(exercise?.id ?? `exercise-${blockIndex}-${exerciseIndex}`),
                exerciseName: String(exercise?.exerciseName ?? "").trim(),
                prescription: String(exercise?.prescription ?? "").trim(),
                notes: String(exercise?.notes ?? "").trim(),
                videoUrl: String(exercise?.videoUrl ?? "").trim() || null,
              }))
            : [],
        }))
      : [];

    const sourceItems =
      normalizedBlocks.length > 0
        ? flattenWorkoutBlocks(normalizedBlocks)
        : legacyItems.map((item: any, index: number) => {
            if (typeof item === "string") {
              return {
                blockName: DEFAULT_WORKOUT_BLOCK,
                exerciseName: String(item || "").trim(),
                prescription: "",
                notes: "",
                videoUrl: null as string | null,
                sortOrder: index,
                label: String(item || "").trim(),
              };
            }

            const exerciseName = String(item?.exerciseName ?? item?.label ?? "").trim();
            const prescription = String(item?.prescription ?? "").trim();
            const notes = String(item?.notes ?? "").trim();
            const rawVideo = String(item?.videoUrl ?? item?.video_url ?? "").trim();

            return {
              blockName:
                String(item?.blockName ?? item?.block_name ?? DEFAULT_WORKOUT_BLOCK).trim() ||
                DEFAULT_WORKOUT_BLOCK,
              exerciseName,
              prescription,
              notes,
              videoUrl: rawVideo.length === 0 ? null : rawVideo,
              sortOrder: index,
              label: exerciseName,
            };
          });

    const cleaned: CleanedExercise[] = sourceItems
      .map((item: any): CleanedExercise | null => {
        if (typeof item === "string") {
          return null;
        }

        return {
          blockName: String(item?.blockName ?? DEFAULT_WORKOUT_BLOCK).trim() || DEFAULT_WORKOUT_BLOCK,
          exerciseName: String(item?.exerciseName ?? item?.label ?? "").trim(),
          prescription: String(item?.prescription ?? "").trim(),
          notes: String(item?.notes ?? "").trim(),
          label: String(item?.label ?? item?.exerciseName ?? "").trim(),
          videoUrl: typeof item?.videoUrl === "string" ? item.videoUrl : null,
          sortOrder: Number(item?.sortOrder ?? 0),
        };
      })
      .filter((item): item is CleanedExercise => Boolean(item?.exerciseName));

    const invalid = cleaned.find(
      (item: { videoUrl: string | null }) => item.videoUrl && !isSafeHttpUrl(item.videoUrl)
    );
    if (invalid) {
      return NextResponse.json(
        { message: "Video link must start with http:// or https://." },
        { status: 400 }
      );
    }

    const today = todayKey();

    await transaction(async (client) => {
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2 LIMIT 1",
        [id, today]
      );

      let checklistId = existing.rows[0]?.id;
      if (!checklistId) {
        const created = await client.query<{ id: string }>(
          "INSERT INTO daily_checklists (client_id, date) VALUES ($1, $2) RETURNING id",
          [id, today]
        );
        checklistId = created.rows[0].id;
      }

      await client.query("DELETE FROM daily_checklist_items WHERE daily_checklist_id = $1", [checklistId]);

      if (cleaned.length > 0) {
        const values = cleaned
          .map(
            (_, index) =>
              `($1, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, false, $${index * 7 + 7}, $${index * 7 + 8})`
          )
          .join(", ");
        const paramsList = [
          checklistId,
          ...cleaned.flatMap((item) => [
            item.label,
            item.blockName,
            item.exerciseName,
            item.prescription || null,
            item.notes || null,
            item.sortOrder,
            item.videoUrl,
          ]),
        ];
        await client.query(
          `INSERT INTO daily_checklist_items (
             daily_checklist_id,
             label,
             block_name,
             exercise_name,
             prescription,
             exercise_notes,
             checked,
             sort_order,
             video_url
           )
           VALUES ${values}`,
          paramsList
        );
      }
    });

    const updated = cleaned.map((item, index) => ({
      id: `${id}-${index}`,
      label: item.label,
      blockName: item.blockName,
      exerciseName: item.exerciseName,
      prescription: item.prescription,
      notes: item.notes,
      sortOrder: item.sortOrder,
      videoUrl: item.videoUrl,
    }));

    return NextResponse.json({ ok: true, items: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to update exercises." }, { status: 500 });
  }
}
