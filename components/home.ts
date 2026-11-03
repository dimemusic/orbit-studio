// Home page story: section order and labels (lib/content.ts) + cross-section events.
import { HOME_SECTIONS } from "@/lib/content";

export { HOME_SECTIONS };

/** any section id; sections parked while the page is rebuilt keep type-checking */
export type HomeId = (typeof HOME_SECTIONS)[number]["id"] | "work" | "services" | "about" | "faq" | "contact";

/** "02" for the section's position on the home page */
export const homeNum = (id: HomeId) => String(HOME_SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, "0");

/** pricing card «Обрати» → contact form chips (detail = chip labels; CONTACT.chips[i] = SERVICES.plans[i]) */
export const PACKAGE_PICK = "package-pick";
