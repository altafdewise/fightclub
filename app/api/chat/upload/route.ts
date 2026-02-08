import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { resolveChatAccess } from "@/lib/chat";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const ext = file.type.split("/")[1] || "bin";
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/chat/${filename}`;
    return NextResponse.json({ ok: true, url });
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Unable to upload file.";
    if (message === "Unauthorized") {
      return NextResponse.json({ message }, { status: 401 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
