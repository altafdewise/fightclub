import { NextResponse } from "next/server";
import { fcSupabase, SELFIE_BUCKET } from "@/lib/fightclub/supabase";

export const runtime = "nodejs";

// Uploads a boxer selfie to the PRIVATE boxer-selfies bucket using the
// service-role key (server-side only). Returns the storage path, which is
// stored on the boxer record. Admin reads it back via a signed URL.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file provided." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File must be an image." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ message: "Image too large (max 8MB)." }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await fcSupabase()
      .storage.from(SELFIE_BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[fightclub/upload-selfie]", error);
      return NextResponse.json({ message: "Upload failed." }, { status: 500 });
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error("[fightclub/upload-selfie]", error);
    return NextResponse.json({ message: "Upload failed." }, { status: 500 });
  }
}
