// Home page story: section order + cross-section events. No copy here (client components import this file).

/** ids of the home sections in page order: the ambient background follows them */
export const HOME_IDS = ["top", "process", "work", "services", "faq", "contact"] as const;

/** any section id; sections parked while the page is rebuilt keep type-checking */
export type HomeId = (typeof HOME_IDS)[number] | "about";

/** "02" for the section's position on the home page */
export const homeNum = (id: HomeId) => String(HOME_IDS.findIndex((s) => s === id) + 1).padStart(2, "0");

/** «Обговорити проєкт» in a plan's dialog → the contact form picks that plan (detail = chip labels; CONTACT.chips[i] = SERVICES.plans[i]) */
export const PACKAGE_PICK = "package-pick";
