import { BRAND } from "@/lib/content";

/** Studio mark: two linked points + «MaxArt Digital» wordmark, second word dimmed. */
export function Logo({ className = "" }: { className?: string }) {
  const [main, rest] = BRAND.wordmark;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} translate="no">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="5" cy="12" r="3.2" fill="currentColor" />
        <circle cx="13.5" cy="5" r="2.4" fill="var(--blue)" />
        <line x1="5" y1="12" x2="13.5" y2="5" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      </svg>
      <span className="text-[17px] font-semibold tracking-[-0.04em]">
        {main} <span className="font-normal text-body">{rest}</span>
      </span>
    </span>
  );
}
