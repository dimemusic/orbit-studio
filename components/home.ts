// Home page story: one idea per screen (order and labels in lib/content.ts). Shared by section headers and the bottom section indicator.
import { HOME_SECTIONS } from "@/lib/content";

export { HOME_SECTIONS };

/** any section id; sections parked while the page is rebuilt keep type-checking */
export type HomeId = (typeof HOME_SECTIONS)[number]["id"] | "work" | "services" | "about" | "faq" | "contact";

/** "02" for the section's position on the home page */
export const homeNum = (id: HomeId) => String(HOME_SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, "0");

/** Work case card hover → its node in the background particle network (IvyScene listens; detail = case index or null) */
export const CASE_HOVER = "case-hover";

/** «Ваш пакет» CTA → contact form chips (detail = chip labels from CONTACT.chips) */
export const PACKAGE_PICK = "package-pick";
