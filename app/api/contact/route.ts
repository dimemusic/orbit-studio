import { NextResponse } from "next/server";
import type { Lang } from "@/lib/content";
import { contentFor } from "@/lib/i18n";
import { tgUsername } from "@/lib/telegram";

// Contact form → Telegram bot and / or email. Set in .env.local / Vercel env (either channel is enough):
//   TELEGRAM_BOT_TOKEN – token from @BotFather
//   TELEGRAM_CHAT_ID   – where leads go: your chat id, or a group / channel id (starts with -100…); several, comma-separated
//   RESEND_API_KEY     – API key from resend.com
//   CONTACT_TO         – where email leads go
//   CONTACT_FROM       – optional sender, defaults to Resend's test sender (works only for your own account email)
// The lead counts as sent if at least one channel accepted it. With nothing configured the route answers 503
// and the form shows «напишіть нам у Telegram».

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

type Lead = { name: string; contact: string; channel: string; message: string; needs: string[] };

/** the first message to the client, from CONTACT.reply (their language): «Вітаю, Дмитро! Я менеджер MaxArt Digital…» */
function greeting(lead: Lead, lang: Lang) {
  const first = lead.name.split(/\s+/)[0];
  return contentFor(lang).CONTACT.reply.replace("{name}", first);
}

/**
 * One-tap answer with the greeting already typed in. Telegram's inline buttons accept only https / tg:// links, so
 * only Telegram (t.me) and WhatsApp (wa.me) get a button; Viber and email stay as plain text in the message.
 */
function replyLink(lead: Lead, text: string): string | null {
  const digits = lead.contact.replace(/\D/g, "");
  const q = encodeURIComponent(text);
  const ch = lead.channel.toLowerCase();
  if (ch === "telegram") {
    const nick = tgUsername(lead.contact);
    if (nick) return `https://t.me/${nick}?text=${q}`;
    return digits ? `https://t.me/+${digits}?text=${q}` : null;
  }
  if (ch === "whatsapp" && digits) return `https://wa.me/${digits}?text=${q}`;
  return null;
}

async function toTelegram(lead: Lead, lang: Lang, token: string, chats: string[]) {
  const link = replyLink(lead, greeting(lead, lang));
  const text = [
    "🆕 <b>Нова заявка з сайту</b>",
    "",
    `👤 <b>${esc(lead.name)}</b>`,
    `💬 ${esc(lead.channel || "Контакт")}: <code>${esc(lead.contact)}</code>`,
    `🧩 ${esc(lead.needs.join(", "))}`,
    ...(lead.message ? ["", esc(lead.message)] : []),
  ].join("\n");
  const reply_markup = link ? { inline_keyboard: [[{ text: "Відповісти", url: link }]] } : undefined;
  const send = (chat_id: string, markup: typeof reply_markup) =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, ...(markup ? { reply_markup: markup } : {}) }),
    });
  const results = await Promise.all(
    chats.map(async (chat_id) => {
      try {
        let r = await send(chat_id, reply_markup);
        // a rejected button (bad link) must never lose the lead: send it again without the button
        if (!r.ok && reply_markup && r.status === 400) r = await send(chat_id, undefined);
        if (!r.ok) console.error("[contact] Telegram error", chat_id, r.status, await r.text().catch(() => ""));
        return r.ok;
      } catch (e) {
        console.error("[contact] Telegram failed", e);
        return false;
      }
    }),
  );
  return results.some(Boolean);
}

async function toEmail(lead: Lead, key: string, to: string) {
  const html = `
    <h2>Нова заявка з сайту</h2>
    <p><b>Ім'я:</b> ${esc(lead.name)}</p>
    <p><b>Контакт:</b> ${esc(lead.contact)}${lead.channel ? ` (${esc(lead.channel)})` : ""}</p>
    <p><b>Потрібно:</b> ${lead.needs.map(esc).join(", ")}</p>
    ${lead.message ? `<p><b>Про проєкт:</b><br>${esc(lead.message).replace(/\n/g, "<br>")}</p>` : ""}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "MaxArt Digital <onboarding@resend.dev>",
      to: [to],
      subject: `Заявка: ${lead.name} · ${lead.needs.join(", ")}${lead.channel ? ` · ${lead.channel}` : ""}`,
      html,
      ...(lead.contact.includes("@") && lead.contact.includes(".") ? { reply_to: lead.contact } : {}),
    }),
  }).catch((e) => {
    console.error("[contact] Resend failed", e);
    return null;
  });
  if (!res?.ok) console.error("[contact] Resend error", res?.status, await res?.text().catch(() => ""));
  return !!res?.ok;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }
  // honeypot: a hidden field real visitors never fill; bots get a fake «ok» and nothing is sent
  if (str(body.website, 200)) return NextResponse.json({ ok: true });
  const lang: Lang = body.lang === "en" ? "en" : "uk";
  const lead: Lead = {
    name: str(body.name, 120),
    contact: str(body.contact, 160),
    channel: str(body.channel, 30),
    message: str(body.message, 1500),
    needs: Array.isArray(body.needs) ? body.needs.filter((n): n is string => typeof n === "string").slice(0, 6) : [],
  };
  if (lead.name.length < 2 || lead.contact.length < 4 || lead.needs.length === 0) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChats = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;

  const jobs: Promise<boolean>[] = [];
  if (tgToken && tgChats.length) jobs.push(toTelegram(lead, lang, tgToken, tgChats));
  if (key && to) jobs.push(toEmail(lead, key, to));
  if (!jobs.length) {
    console.warn("[contact] no channel configured (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID or RESEND_API_KEY + CONTACT_TO), lead not sent");
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }
  const sent = await Promise.all(jobs);
  if (!sent.some(Boolean)) return NextResponse.json({ error: "send-failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
