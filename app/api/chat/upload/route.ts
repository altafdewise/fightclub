import { NextResponse } from "next/server";
import { resolveChatAccess } from "@/lib/chat";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    await resolveChatAccess();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "File is required." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Only JPG, PNG, or WEBP images are allowed." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "File too large. Max 5MB." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("chat-images")
      .upload(`chat/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("chat-images")
      .getPublicUrl(`chat/${fileName}`);

    return NextResponse.json({ ok: true, url: publicUrl.publicUrl });
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Unable to upload file.";
    if (message === "Unauthorized") {
      return NextResponse.json({ message }, { status: 401 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
