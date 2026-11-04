import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean>;
declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * One call, both tools: Vercel Analytics (cookieless, always on) and Microsoft Clarity (only exists after the visitor
 * allowed cookies). Never pass names, contacts or any text the visitor typed: labels and ids only.
 */
export function track(name: string, props?: Props) {
  try {
    vercelTrack(name, props);
  } catch {}
  try {
    const label = props && (props.label ?? props.section ?? props.step ?? props.pct);
    window.clarity?.("event", label === undefined ? name : `${name}: ${label}`);
  } catch {}
}
