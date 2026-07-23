import { Resend } from "resend";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, error: "server_misconfigured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const msg = body?.msg?.trim();
  if (!name || !email || !msg) {
    return Response.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev",
    to: process.env.CONTACT_TO_EMAIL ?? "",
    replyTo: email,
    subject: `Nuevo mensaje de contacto — ${name}`,
    text: `De: ${name} <${email}>\n\n${msg}`,
  });

  if (error) {
    console.error("resend send failed", error);
    return Response.json({ ok: false, error: "send_failed" }, { status: 500 });
  }
  return Response.json({ ok: true }, { status: 200 });
}
