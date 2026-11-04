"use client";

import Link from "next/link";
import { SLUG } from "@/lib/services";
import { useContent, useLang } from "../Lang";
import { CLARITY_ID, CONSENT_OPEN } from "../analytics/Consent";

export function Footer() {
  const { BRAND, FOOTER, NAV, UI, SERVICES } = useContent();
  const base = useLang() === "en" ? "/en/" : "/";
  return (
    <footer className="card relative w-full overflow-hidden rounded-none border-x-0 border-b-0 px-gutter pb-10 pt-16 text-center shadow-none">
      <nav aria-label={UI.footerNav}>
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-1">
          {NAV.map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="inline-block py-2 text-sm text-body transition-colors hover:text-fg">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a href={BRAND.telegramUrl} className="inline-block py-2 text-sm text-body transition-colors hover:text-fg">
              Telegram
            </a>
          </li>
          <li>
            <a href={`mailto:${BRAND.email}`} className="inline-block py-2 text-sm text-body transition-colors hover:text-fg">
              Email
            </a>
          </li>
        </ul>
      </nav>
      {/* the service pages: links for visitors and for search engines */}
      <nav aria-label={SERVICES.pages.crumb} className="mt-4">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-1">
          {SERVICES.plans.map((p) => (
            <li key={p.id}>
              <Link href={`${base}${SLUG[p.id]}`} className="inline-block py-2 text-sm text-grey transition-colors hover:text-fg">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-10 text-sm text-body">
        {FOOTER.copy} <span translate="no">{BRAND.name}</span> · {BRAND.city}
      </p>
      <p className="mt-1 text-xs">
        <Link href={BRAND.privacyHref} className="text-grey underline decoration-white/20 underline-offset-4 transition-colors hover:text-fg">
          {FOOTER.privacy}
        </Link>
        {CLARITY_ID && (
          <>
            <span aria-hidden="true" className="px-2 text-faint">·</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN))}
              className="text-grey underline decoration-white/20 underline-offset-4 transition-colors hover:text-fg"
            >
              {FOOTER.cookies}
            </button>
          </>
        )}
      </p>
    </footer>
  );
}
