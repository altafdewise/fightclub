import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { query, transaction } from "@/lib/db";
import { isSafeHttpUrl } from "@/utils/url";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session?.admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { items } = await req.json();
    const { id } = await params;
    if (!Array.isArray(items)) {
      return NextResponse.json({ message: "Invalid items list." }, { status: 400 });
    }

    const cleaned = items
      .map((item: any) => {
        if (typeof item === "string") {
          return { label: String(item || "").trim(), videoUrl: null as string | null };
        }
        const label = String(item?.label || "").trim();
        const rawVideo = String(item?.videoUrl ?? item?.video_url ?? "").trim();
        const videoUrl = rawVideo.length === 0 ? null : rawVideo;
        return { label, videoUrl };
      })
      .filter((item: { label: string }) => item.label.length > 0);

    const invalid = cleaned.find(
      (item: { videoUrl: string | null }) => item.videoUrl && !isSafeHttpUrl(item.videoUrl)
    );
    if (invalid) {
      return NextResponse.json(
        { message: "Video link must start with http:// or https://." },
        { status: 400 }
      );
    }

    await transaction(async (client) => {
      const template = await client.query<{ id: string }>(
        "SELECT id FROM daily_checklists WHERE client_id = $1 AND date = 'template' LIMIT 1",
        [id]
      );

      let checklistId = template.rows[0]?.id;
      if (!checklistId) {
        const created = await client.query<{ id: string }>(
          "INSERT INTO daily_checklists (client_id, date) VALUES ($1, 'template') RETURNING id",
          [id]
        );
        checklistId = created.rows[0].id;
      }

      await client.query("DELETE FROM daily_checklist_items WHERE daily_checklist_id = $1", [checklistId]);

      if (cleaned.length > 0) {
        const values = cleaned
          .map((_, index) => `($1, $${index * 3 + 2}, $${index * 3 + 3}, false, $${index * 3 + 4})`)
          .join(", ");
        const paramsList = [
          checklistId,
          ...cleaned.flatMap((item, index) => [item.label, index, item.videoUrl]),
        ];
        await client.query(
          `INSERT INTO daily_checklist_items (daily_checklist_id, label, sort_order, checked, video_url)
           VALUES ${values}`,
          paramsList
        );
      }
    });

    const updated = cleaned.map((item, index) => ({
      id: `${id}-${index}`,
      label: item.label,
      sortOrder: index,
      videoUrl: item.videoUrl,
    }));

    return NextResponse.json({ ok: true, items: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to update exercises." }, { status: 500 });
  }
}
