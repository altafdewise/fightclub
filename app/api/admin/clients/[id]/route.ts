import { NextResponse } from "next/server";
import { getAdminSession, getHQSession } from "@/lib/auth";
import { query, transaction } from "@/lib/db";
import { requireAdminOrHQ } from "@/lib/server/requireAdminOrHQ";
import { stripTrainerNoteHtml, sanitizeTrainerNoteHtml } from "@/lib/trainerNotes";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const client = await query<{
    id: string;
    name: string;
    username: string;
    trainer_note: string | null;
    trainer_note_html: string | null;
  }>(
    `SELECT c.id, c.name, c.username, tn.note AS trainer_note, tn.note_html AS trainer_note_html
     FROM clients c
     LEFT JOIN trainer_notes tn ON tn.client_id = c.id
     WHERE c.id = $1
     LIMIT 1`,
    [id]
  );

  if (!client.rows.length) {
    return NextResponse.json({ message: "Client not found." }, { status: 404 });
  }

  const templateChecklist = await query<{ id: string }>(
    "SELECT id FROM daily_checklists WHERE client_id = $1 AND date = 'template' LIMIT 1",
    [id]
  );

  const items = templateChecklist.rows.length
    ? await query<{
        label: string;
        block_name: string | null;
        exercise_name: string | null;
        prescription: string | null;
        exercise_notes: string | null;
        sort_order: number;
        video_url: string | null;
      }>(
        `SELECT label, block_name, exercise_name, prescription, exercise_notes, sort_order, video_url
         FROM daily_checklist_items
         WHERE daily_checklist_id = $1
         ORDER BY sort_order ASC`,
        [templateChecklist.rows[0].id]
      )
    : {
        rows: [] as {
          label: string;
          block_name: string | null;
          exercise_name: string | null;
          prescription: string | null;
          exercise_notes: string | null;
          sort_order: number;
          video_url: string | null;
        }[],
      };

  return NextResponse.json({
    client: {
      id: client.rows[0].id,
      name: client.rows[0].name,
      username: client.rows[0].username,
      trainerDietNote: client.rows[0].trainer_note,
      trainerDietNoteHtml: client.rows[0].trainer_note_html,
      exerciseItems: items.rows.map((row, index) => ({
        id: `${id}-${index}`,
        label: row.label,
        blockName: row.block_name ?? "Workout",
        exerciseName: row.exercise_name ?? row.label,
        prescription: row.prescription ?? "",
        notes: row.exercise_notes ?? "",
        sortOrder: row.sort_order,
        videoUrl: row.video_url ?? null,
      })),
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { trainerDietNote, trainerDietNoteHtml } = await req.json();
    const { id } = await params;
    const noteHtml = sanitizeTrainerNoteHtml(
      typeof trainerDietNoteHtml === "string" ? trainerDietNoteHtml : ""
    );
    const noteText =
      typeof trainerDietNote === "string" && trainerDietNote.trim().length > 0
        ? trainerDietNote.trim()
        : stripTrainerNoteHtml(noteHtml) || null;

    const existing = await query<{ client_id: string }>(
      "SELECT client_id FROM trainer_notes WHERE client_id = $1 LIMIT 1",
      [id]
    );

    if (existing.rows.length) {
      await query(
        "UPDATE trainer_notes SET note = $1, note_html = $2, updated_at = NOW() WHERE client_id = $3",
        [noteText, noteHtml || null, id]
      );
    } else {
      await query(
        "INSERT INTO trainer_notes (client_id, note, note_html) VALUES ($1, $2, $3)",
        [id, noteText, noteHtml || null]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to update note." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;
    await transaction(async (client) => {
      await client.query("DELETE FROM sessions WHERE client_id = $1", [id]);
      await client.query("DELETE FROM trainer_notes WHERE client_id = $1", [id]);
      await client.query(
        "DELETE FROM daily_checklist_items WHERE daily_checklist_id IN (SELECT id FROM daily_checklists WHERE client_id = $1)",
        [id]
      );
      await client.query("DELETE FROM daily_checklists WHERE client_id = $1", [id]);
      await client.query("DELETE FROM clients WHERE id = $1", [id]);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to delete client." }, { status: 500 });
  }
}
