
import { NextRequest, NextResponse } from "next/server";
import emailjs from "@emailjs/nodejs";
import config from "@/lib/config";

export async function POST(req: NextRequest) {
  const { email, subject, message } = await req.json();
  console.log(process.env.EMAILJS_PUBLIC_KEY)

  try {
    const result = await emailjs.send(
      config.env.emaijs.emailId!,
      config.env.emaijs.emailTemplateId!,
      {
        email:email,
        subject,
        message,
      },
      {
        publicKey:process.env.EMAILJS_PUBLIC_KEY!,
        privateKey:config.env.emaijs.emailPrivateKey!,
      },
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Erreur EmailJS:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
