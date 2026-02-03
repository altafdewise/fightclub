import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = process.env.TO_EMAIL || "altafdewise@gmail.com";
const resend = new Resend(process.env.RESEND_API_KEY);

const isValidEmail = (value: string | undefined) =>
  !!value && /.+@.+\..+/.test(value.replace(/^.*<|>$/g, ""));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, whatsapp, goal, message } = body || {};

    if (!name || !email || !whatsapp) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL || !isValidEmail(TO_EMAIL)) {
      return NextResponse.json({ message: "Email service is not configured." }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [TO_EMAIL],
      subject: "New consult request - BRUTAL",
      html: `<p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Goal:</strong> ${goal}</p>
        <p><strong>Message:</strong> ${message || "(none)"}</p>`,
      text: `Name: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}\nGoal: ${goal}\nMessage: ${message || "(none)"}`,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Unable to process your request now." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to process your request now." }, { status: 500 });
  }
}
