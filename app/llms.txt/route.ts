import { contentFor, SITE_URL } from "@/lib/i18n";
import { SLUG } from "@/lib/services";

// /llms.txt: a plain-text summary of the studio for AI assistants and AI search (llmstxt.org format).
// Built from the content files, so prices, terms and FAQ always match the site.
export const dynamic = "force-static";

export function GET() {
  const { BRAND, META, SERVICES, FAQ } = contentFor("uk");
  const en = contentFor("en");
  const lines = [
    `# ${BRAND.name}`,
    "",
    `> ${META.description}`,
    "",
    `Веб-студія у місті ${BRAND.city}, Україна. Працюємо онлайн з клієнтами з усієї України. Контакти: ${BRAND.email}, Telegram ${BRAND.telegram}.`,
    "",
    "## Послуги й ціни (USD, стартова ціна, точну фіксуємо після брифу)",
    ...SERVICES.plans.map(
      (p) => `- [${p.name}](${SITE_URL}/${SLUG[p.id]}): від $${p.price}, від ${p.days} днів. ${p.for} Входить: ${p.features.join(", ")}.`,
    ),
    ...SERVICES.extras.map((e) => `- ${e.name}: ${e.price}`),
    "",
    "## Часті питання",
    ...FAQ.items.flatMap((f) => [`### ${f.q}`, f.a, ""]),
    "## English",
    `${en.META.description}`,
    ...en.SERVICES.plans.map((p) => `- [${p.name}](${SITE_URL}/en/${SLUG[p.id]}): from $${p.price}, from ${p.days} days. ${p.for}`),
    "",
    `- [Головна](${SITE_URL}/) · [Home (English)](${SITE_URL}/en)`,
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
