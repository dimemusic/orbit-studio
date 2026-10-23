import { NextResponse } from "next/server";

// Contact form → email via Resend (https://resend.com). Set in .env.local / Vercel env:
//   RESEND_API_KEY  – API key from resend.com
//   CONTACT_TO      – where leads go (your email)
//   CONTACT_FROM    – optional sender, defaults to Resend's test sender (works only for your own account email)
// Without a key the route answers 503 and the form shows «напишіть нам у Telegram».

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }
  const name = str(body.name, 120);
  const contact = str(body.contact, 160);
  const message = str(body.message, 1500);
  const needs = Array.isArray(body.needs) ? body.needs.filter((n): n is string => typeof n === "string").slice(0, 6) : [];
  if (name.length < 2 || contact.length < 4 || needs.length === 0) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) {
    console.warn("[contact] RESEND_API_KEY / CONTACT_TO not set, lead not sent:", { name, contact, needs });
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  const html = `
    <h2>Нова заявка з сайту</h2>
    <p><b>Ім'я:</b> ${esc(name)}</p>
    <p><b>Контакт:</b> ${esc(contact)}</p>
    <p><b>Потрібно:</b> ${needs.map(esc).join(", ")}</p>
    ${message ? `<p><b>Про проєкт:</b><br>${esc(message).replace(/\n/g, "<br>")}</p>` : ""}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "MaxArt Digital <onboarding@resend.dev>",
      to: [to],
      subject: `Заявка: ${name} · ${needs.join(", ")}`,
      html,
      ...(contact.includes("@") && contact.includes(".") ? { reply_to: contact } : {}),
    }),
  });
  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "send-failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
