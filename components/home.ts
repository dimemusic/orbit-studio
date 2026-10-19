// Home page story: one idea per screen. Shared by section headers and the bottom section indicator.
export const HOME_SECTIONS = [
  { id: "top", label: "Головна" },
  { id: "about", label: "Хто ми" },
  { id: "problem", label: "Знайомо?" },
  { id: "how", label: "Як це працює" },
  { id: "security", label: "Безпека" },
  { id: "proof", label: "Відгуки" },
  { id: "pricing", label: "Тарифи" },
  { id: "faq", label: "Питання" },
  { id: "start", label: "Старт" },
] as const;

export type HomeId = (typeof HOME_SECTIONS)[number]["id"];

/** "02" for the section's position on the home page */
export const homeNum = (id: HomeId) => String(HOME_SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, "0");
