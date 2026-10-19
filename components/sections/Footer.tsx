import Link from "next/link";
import { BRAND, FOOTER, NAV } from "@/lib/content";

export function Footer() {
  return (
    <footer className="card relative w-full overflow-hidden rounded-none border-x-0 border-b-0 px-gutter pb-10 pt-16 text-center shadow-none">
      <nav aria-label="Посилання у футері">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-1">
          {NAV.map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="inline-block py-2 text-[14px] text-body transition-colors hover:text-fg">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a href={BRAND.telegramUrl} className="inline-block py-2 text-[14px] text-body transition-colors hover:text-fg">
              Telegram
            </a>
          </li>
          <li>
            <a href={`mailto:${BRAND.email}`} className="inline-block py-2 text-[14px] text-body transition-colors hover:text-fg">
              Email
            </a>
          </li>
        </ul>
      </nav>

      <p className="mt-10 text-[14px] text-body">
        {FOOTER.copy} <span translate="no">{BRAND.name}</span> · {BRAND.city}
      </p>
      <p className="mt-1 text-[13px]">
        <Link href={BRAND.privacyHref} className="text-grey underline decoration-white/20 underline-offset-4 transition-colors hover:text-fg">
          {FOOTER.privacy}
        </Link>
      </p>
    </footer>
  );
}
