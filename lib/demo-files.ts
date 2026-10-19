// Mock data for the logged-in cloud (/app). Everything is fictional; nothing is fetched or stored.

export type Kind = "psd" | "fig" | "ai" | "pdf" | "png" | "mp4";
/** filter chips: Макети · Експорти · Відео · Документи */
export type Category = "layout" | "export" | "video" | "doc";
export type ProjectId = "kadr" | "varta" | "kyt";
export type PlanId = "free" | "pro" | "team";

/** fem picks the verb ending in audit lines («погодив» / «погодила»); company = client side */
export type Person = { id: string; name: string; initials: string; color: string; fem?: boolean; company?: string };

/** file-level review status; «approved» always means the final version was approved */
export type Status = "draft" | "progress" | "review" | "changes" | "approved";
export const STATUS_ORDER: Status[] = ["draft", "progress", "review", "changes", "approved"];
export const STATUS_META: Record<Status, { label: string; color: string }> = {
  draft: { label: "Чернетка", color: "#8b919c" },
  progress: { label: "В роботі", color: "#3d8bff" },
  review: { label: "На погодженні", color: "#a78bfa" },
  changes: { label: "Потрібні правки", color: "#ff7ab6" },
  approved: { label: "Погоджено", color: "#4fe3c1" },
};
export type Decision = { fileId: string; who: string; versionId: string; decision: "approved" | "changes"; at: string };
/** one «Історія» line: `${PEOPLE[who].name} ${text}` (who = null: the system) */
export type AuditEntry = { id: string; fileId: string; at: string; who: string | null; kind: "approve" | "changes" | "status" | "final"; text: string; to?: Status };
/** per-version preview params so versions look different: hue shift (deg), shape offset (px in a 160×120 box), layout variant */
export type Look = { hue: number; dx: number; dy: number; variant: number };
export type Version = { id: string; v: number; author: string; note: string; at: string; final?: boolean; look: Look };
export type Role = "Клієнт" | "Команда";
export type AppComment = {
  id: string;
  fileId: string;
  versionId: string;
  author: string;
  role: Role;
  /** client company, shown next to the name */
  company?: string;
  text: string;
  /** pin position 0–1 on the preview, null = general comment */
  x: number | null;
  y: number | null;
  createdAt: string;
  resolved: boolean;
};
/** authoring shape: version number, optional pin ([x, y]; null = no pin; omitted = seeded position) */
type RawComment = { author: string; company?: string; text: string; at: string; version: number; pin?: [number, number] | null; resolved?: boolean };

export type DemoFile = {
  id: string;
  name: string;
  kind: Kind;
  category: Category;
  project: ProjectId;
  folder: string;
  /** megabytes */
  size: number;
  owner: string;
  updatedAt: string;
  /** oldest first; the last one is current */
  versions: Version[];
  linkedFrom?: string;
  linkedTo: string[];
  starred?: boolean;
  shared?: boolean;
  trashed?: boolean;
  /** seed status (the store may override it) */
  status: Status;
  /** 1–3 person ids */
  reviewers: string[];
  /** optional deadline, Kyiv date «2026-10-21» */
  due?: string;
};

/** fixed "now" so relative dates match between server and client */
export const DEMO_NOW = new Date("2026-10-18T12:00:00+03:00").getTime();

export const ME = "dt";

export const PEOPLE: Record<string, Person> = {
  dt: { id: "dt", name: "Дарина Ткач", initials: "ДТ", color: "#3d8bff", fem: true },
  ok: { id: "ok", name: "Олена Коваль", initials: "ОК", color: "#22d3ee", fem: true },
  tm: { id: "tm", name: "Тарас Мельник", initials: "ТМ", color: "#8b5cf6" },
  ib: { id: "ib", name: "Ірина Бойко", initials: "ІБ", color: "#f472b6", fem: true },
  mh: { id: "mh", name: "Максим Гнатюк", initials: "МГ", color: "#2dd4bf" },
  // clients (reviewers)
  or: { id: "or", name: "Ольга Руденко", initials: "ОР", color: "#fb923c", fem: true, company: "Кадр 24" },
  vp: { id: "vp", name: "Віктор Пасічник", initials: "ВП", color: "#fbbf24", company: "Кадр 24" },
  as: { id: "as", name: "Андрій Савчук", initials: "АС", color: "#60a5fa", company: "VARTA" },
  hy: { id: "hy", name: "Галина Яремчук", initials: "ГЯ", color: "#c084fc", fem: true, company: "Сірий кит" },
};

/** verb by gender: g("ib", "погодив", "погодила") */
export const g = (who: string, m: string, f: string) => (PEOPLE[who]?.fem ? f : m);

export const PROJECTS: { id: ProjectId; name: string; color: string }[] = [
  { id: "kadr", name: "Кадр 24 · ребрендинг", color: "#3d8bff" },
  { id: "varta", name: "VARTA · кампанія", color: "#22d3ee" },
  { id: "kyt", name: "Сірий кит · книга", color: "#a78bfa" },
];

export const PLANS: Record<PlanId, { name: string; limitGb: number; color: string }> = {
  free: { name: "Free", limitGb: 20, color: "#4fe3c1" },
  pro: { name: "Pro", limitGb: 2000, color: "#3d8bff" },
  team: { name: "Team", limitGb: 10000, color: "#a78bfa" },
};

/** demo usage per plan, GB */
export const USED_GB: Record<PlanId, number> = { free: 7.4, pro: 486, team: 2140 };

export const KIND_CATEGORY: Record<Kind, Category> = {
  psd: "layout",
  fig: "layout",
  ai: "layout",
  png: "export",
  mp4: "video",
  pdf: "doc",
};

const d = (s: string) => `2026-${s}:00+03:00`;

/** builds v1…vN with dates spread back from the last update */
function history(last: string, notes: [string, string][], finalAt?: number): RawVersion[] {
  const end = new Date(last).getTime();
  const n = notes.length;
  return notes.map(([author, note], i) => ({
    v: i + 1,
    author,
    note,
    at: new Date(end - (n - 1 - i) * 1000 * 60 * 60 * 26).toISOString(),
    final: finalAt === i + 1 || undefined,
  }));
}

type RawVersion = Omit<Version, "id" | "look">;
type Raw = Omit<DemoFile, "category" | "linkedTo" | "versions" | "status" | "reviewers" | "due"> & { linkedTo?: string[]; versions: RawVersion[]; comments: RawComment[] };

const RAW: Raw[] = [
  // ---------- Кадр 24 · ребрендинг ----------
  {
    id: "kadr-kv",
    name: "Ключовий візуал.psd",
    kind: "psd",
    project: "kadr",
    folder: "Кампанія",
    size: 1240,
    owner: "dt",
    updatedAt: d("10-18T10:42"),
    starred: true,
    versions: history(
      d("10-18T10:42"),
      [
        ["dt", "Перший ескіз композиції"],
        ["dt", "Нова сітка, логотип у лівому куті"],
        ["ok", "Фото Марка замінено на зйомку з 12.10"],
        ["dt", "Кольори під новий гайдлайн"],
        ["ib", "Правки клієнта: більше повітря"],
        ["dt", "Затверджено клієнтом"],
        ["dt", "Ретуш шкіри, кадрування для банерів"],
      ],
      6,
    ),
    comments: [
      // left on an OLD version: the stale-comment guard offers to move it to the latest
      { author: "Ольга Руденко", company: "Кадр 24", text: "Логотип трохи більше, зараз губиться на фото.", at: d("10-13T15:40"), version: 3, pin: [0.2, 0.18] },
      { author: "Віктор Пасічник", company: "Кадр 24", text: "Тут інший відтінок синього, звірте з гайдлайном.", at: d("10-15T12:10"), version: 5, pin: [0.64, 0.34] },
      { author: "Ірина Бойко", text: "Взяла в роботу, виправлю у v6.", at: d("10-15T13:00"), version: 5, pin: null, resolved: true },
      { author: "Ольга Руденко", company: "Кадр 24", text: "Цю версію погоджено, запускаємо банери.", at: d("10-16T11:05"), version: 6, pin: null, resolved: true },
      { author: "Ольга Руденко", company: "Кадр 24", text: "Логотип можна ще на 10% менший? В іншому все чудово.", at: d("10-17T16:20"), version: 6, pin: [0.22, 0.16] },
      { author: "Олена Коваль", text: "Ретуш тут м'якша, глянь на тіні під очима.", at: d("10-18T10:05"), version: 7, pin: [0.55, 0.5] },
      { author: "Ольга Руденко", company: "Кадр 24", text: "Підпис дрібнуватий для банера, можна на кегль більше?", at: d("10-18T10:30"), version: 7, pin: [0.72, 0.82] },
      { author: "Віктор Пасічник", company: "Кадр 24", text: "Тизер теж беремо з цього кадру, так?", at: d("10-18T11:12"), version: 7, pin: null },
    ],
  },
  {
    id: "kadr-banner",
    name: "Банер 1200×628.png",
    kind: "png",
    project: "kadr",
    folder: "Кампанія / Експорти",
    size: 2.4,
    owner: "dt",
    updatedAt: d("10-18T10:50"),
    linkedFrom: "kadr-kv",
    versions: history(d("10-18T10:50"), [
      ["dt", "Експорт з v5"],
      ["dt", "Експорт з v6"],
      ["dt", "Експорт з v7"],
    ]),
    comments: [],
  },
  {
    id: "kadr-poster",
    name: "Постер A2.pdf",
    kind: "pdf",
    project: "kadr",
    folder: "Кампанія / Експорти",
    size: 48,
    owner: "ok",
    updatedAt: d("10-17T18:05"),
    linkedFrom: "kadr-kv",
    versions: history(
      d("10-17T18:05"),
      [
        ["ok", "Експорт для друкарні, CMYK"],
        ["ok", "Виліт 3 мм, мітки різу"],
      ],
      2,
    ),
    comments: [{ author: "Ольга Руденко", company: "Кадр 24", text: "Друкарня підтвердила файл, дякуємо!", at: d("10-17T19:30"), version: 2, pin: null, resolved: true }],
  },
  {
    id: "kadr-teaser",
    name: "Тизер 15 с.mp4",
    kind: "mp4",
    project: "kadr",
    folder: "Кампанія / Відео",
    size: 186,
    owner: "mh",
    updatedAt: d("10-17T14:30"),
    linkedFrom: "kadr-kv",
    starred: true,
    versions: history(d("10-17T14:30"), [
      ["mh", "Чорновий монтаж"],
      ["mh", "Музика й титри"],
      ["mh", "Колір під ключовий візуал"],
      ["mh", "Скорочено до 15 секунд"],
    ]),
    comments: [
      { author: "Віктор Пасічник", company: "Кадр 24", text: "Титр на 0:09 трохи затримати.", at: d("10-17T15:10"), version: 4 },
      { author: "Ольга Руденко", company: "Кадр 24", text: "Музика ідеальна.", at: d("10-17T15:42"), version: 4, pin: null },
    ],
  },
  {
    id: "kadr-logo",
    name: "Логотип мастер.ai",
    kind: "ai",
    project: "kadr",
    folder: "Логотип",
    size: 14,
    owner: "tm",
    updatedAt: d("10-12T13:00"),
    linkedTo: ["kadr-guide"],
    versions: history(
      d("10-12T13:00"),
      [
        ["tm", "Три напрями"],
        ["tm", "Обрано напрям Б"],
        ["tm", "Оптичне вирівнювання"],
        ["tm", "Фінальний знак і версія для фавікону"],
      ],
      4,
    ),
    comments: [],
  },
  {
    id: "kadr-guide",
    name: "Гайдлайн.fig",
    kind: "fig",
    project: "kadr",
    folder: "Гайдлайн",
    size: 92,
    owner: "tm",
    updatedAt: d("10-15T17:20"),
    linkedFrom: "kadr-logo",
    versions: history(d("10-15T17:20"), [
      ["tm", "Структура розділів"],
      ["ib", "Типографіка й кольори"],
      ["tm", "Приклади застосування"],
      ["ib", "Розділ про соцмережі"],
      ["tm", "Вичитка тексту"],
    ]),
    comments: [{ author: "Ольга Руденко", company: "Кадр 24", text: "Додайте, будь ласка, сторінку з неправильним використанням.", at: d("10-15T18:00"), version: 5, pin: null }],
  },
  {
    id: "kadr-brandbook",
    name: "Брендбук.pdf",
    kind: "pdf",
    project: "kadr",
    folder: "Гайдлайн",
    size: 36,
    owner: "tm",
    updatedAt: d("10-15T17:40"),
    linkedFrom: "kadr-guide",
    shared: true,
    versions: history(d("10-15T17:40"), [
      ["tm", "Експорт для клієнта"],
      ["tm", "Оновлені приклади"],
    ]),
    comments: [],
  },
  {
    id: "kadr-social",
    name: "Шаблони соцмереж.png",
    kind: "png",
    project: "kadr",
    folder: "Соцмережі",
    size: 6.8,
    owner: "ib",
    updatedAt: d("10-14T11:15"),
    linkedFrom: "kadr-guide",
    versions: history(d("10-14T11:15"), [["ib", "Пости й сторіз, 6 шаблонів"]]),
    comments: [],
  },
  {
    id: "kadr-mood",
    name: "Мудборд.png",
    kind: "png",
    project: "kadr",
    folder: "Дослідження",
    size: 12,
    owner: "ok",
    updatedAt: d("09-28T10:00"),
    shared: true,
    versions: history(d("09-28T10:00"), [
      ["ok", "Перша добірка"],
      ["ok", "Після зустрічі з клієнтом"],
    ]),
    comments: [],
  },

  // ---------- VARTA · кампанія ----------
  {
    id: "varta-kv",
    name: "VARTA ключовий кадр.psd",
    kind: "psd",
    project: "varta",
    folder: "Осінь 2026",
    size: 2180,
    owner: "ib",
    updatedAt: d("10-17T20:10"),
    shared: true,
    starred: true,
    versions: history(
      d("10-17T20:10"),
      [
        ["ib", "Концепт «Тиша в місті»"],
        ["ib", "Друга зйомка"],
        ["dt", "Композиція під білборд"],
        ["ib", "Затверджено"],
        ["ib", "Адаптація для 9:16"],
      ],
      4,
    ),
    comments: [
      { author: "Андрій Савчук", company: "VARTA", text: "Слоган краще на одному рядку.", at: d("10-16T12:00"), version: 4, pin: [0.5, 0.74] },
      { author: "Андрій Савчук", company: "VARTA", text: "Небо темніше, як у референсі з мудборду.", at: d("10-17T21:20"), version: 5, pin: [0.4, 0.22] },
      { author: "Андрій Савчук", company: "VARTA", text: "Погоджуємо, дякуємо команді!", at: d("10-16T15:30"), version: 4, pin: null },
    ],
  },
  {
    id: "varta-billboard",
    name: "Білборд 6×3.pdf",
    kind: "pdf",
    project: "varta",
    folder: "Осінь 2026 / Друк",
    size: 128,
    owner: "ib",
    updatedAt: d("10-16T18:00"),
    linkedFrom: "varta-kv",
    shared: true,
    versions: history(d("10-16T18:00"), [["ib", "Для підрядника, 1:10"]], 1),
    comments: [],
  },
  {
    id: "varta-stories",
    name: "Сторіз 9×16.mp4",
    kind: "mp4",
    project: "varta",
    folder: "Осінь 2026 / Відео",
    size: 64,
    owner: "mh",
    updatedAt: d("10-17T21:00"),
    linkedFrom: "varta-kv",
    shared: true,
    versions: history(d("10-17T21:00"), [
      ["mh", "Анімація логотипа"],
      ["mh", "Звук"],
      ["mh", "З кадру v5"],
    ]),
    comments: [{ author: "Андрій Савчук", company: "VARTA", text: "Перехід на 0:03 занадто різкий.", at: d("10-18T08:40"), version: 3 }],
  },
  {
    id: "varta-banner",
    name: "Банер 300×250.png",
    kind: "png",
    project: "varta",
    folder: "Осінь 2026 / Діджитал",
    size: 0.4,
    owner: "dt",
    updatedAt: d("10-16T19:20"),
    linkedFrom: "varta-kv",
    shared: true,
    versions: history(d("10-16T19:20"), [
      ["dt", "Перший експорт"],
      ["dt", "Вага до 150 КБ"],
    ]),
    comments: [],
  },
  {
    id: "varta-landing",
    name: "Лендинг кампанії.fig",
    kind: "fig",
    project: "varta",
    folder: "Осінь 2026 / Сайт",
    size: 74,
    owner: "tm",
    updatedAt: d("10-13T16:00"),
    shared: true,
    versions: history(d("10-13T16:00"), [
      ["tm", "Вайрфрейми"],
      ["tm", "Дизайн десктоп"],
      ["dt", "Мобільна версія"],
    ]),
    comments: [],
  },
  {
    id: "varta-hero",
    name: "Перший екран.png",
    kind: "png",
    project: "varta",
    folder: "Осінь 2026 / Сайт",
    size: 3.2,
    owner: "tm",
    updatedAt: d("10-13T16:10"),
    linkedFrom: "varta-landing",
    shared: true,
    versions: history(d("10-13T16:10"), [["tm", "Експорт 2x"]]),
    comments: [],
  },
  {
    id: "varta-brief",
    name: "Бриф VARTA.pdf",
    kind: "pdf",
    project: "varta",
    folder: "Осінь 2026",
    size: 1.8,
    owner: "ok",
    updatedAt: d("09-20T09:30"),
    shared: true,
    versions: history(d("09-20T09:30"), [["ok", "Отримано від клієнта"]]),
    comments: [],
  },
  {
    id: "varta-icons",
    name: "Іконки кампанії.ai",
    kind: "ai",
    project: "varta",
    folder: "Осінь 2026",
    size: 8.6,
    owner: "tm",
    updatedAt: d("10-08T12:00"),
    versions: history(d("10-08T12:00"), [
      ["tm", "12 іконок"],
      ["tm", "Товщина лінії 1,5 px"],
    ]),
    comments: [],
  },

  // ---------- Сірий кит · книга ----------
  {
    id: "kyt-cover",
    name: "Обкладинка.psd",
    kind: "psd",
    project: "kyt",
    folder: "Обкладинка",
    size: 860,
    owner: "ok",
    updatedAt: d("10-16T13:30"),
    starred: true,
    versions: history(
      d("10-16T13:30"),
      [
        ["ok", "Ілюстрація кита"],
        ["ok", "Шрифт назви"],
        ["ib", "Корінець 24 мм"],
        ["ok", "Тиснення фольгою"],
        ["ok", "Затверджено видавництвом"],
        ["ok", "Виправлено прізвище авторки"],
      ],
      5,
    ),
    comments: [
      { author: "Галина Яремчук", company: "Сірий кит", text: "Прізвище авторки з м'яким знаком!", at: d("10-15T10:15"), version: 5 },
      { author: "Галина Яремчук", company: "Сірий кит", text: "Тепер ідеально, передаємо в друк.", at: d("10-16T14:00"), version: 6, pin: null, resolved: true },
    ],
  },
  {
    id: "kyt-print",
    name: "Обкладинка друк.pdf",
    kind: "pdf",
    project: "kyt",
    folder: "Обкладинка",
    size: 96,
    owner: "ok",
    updatedAt: d("10-16T13:50"),
    linkedFrom: "kyt-cover",
    versions: history(d("10-16T13:50"), [
      ["ok", "Розгортка з корінцем"],
      ["ok", "З v6 обкладинки"],
    ]),
    comments: [],
  },
  {
    id: "kyt-web",
    name: "Обкладинка веб.png",
    kind: "png",
    project: "kyt",
    folder: "Обкладинка",
    size: 1.6,
    owner: "ok",
    updatedAt: d("10-16T13:55"),
    linkedFrom: "kyt-cover",
    versions: history(d("10-16T13:55"), [["ok", "Для магазину, 1600 px"]], 1),
    comments: [],
  },
  {
    id: "kyt-trailer",
    name: "Буктрейлер.mp4",
    kind: "mp4",
    project: "kyt",
    folder: "Промо",
    size: 420,
    owner: "mh",
    updatedAt: d("10-10T19:00"),
    linkedFrom: "kyt-cover",
    versions: history(d("10-10T19:00"), [
      ["mh", "Сценарій і раскадровка"],
      ["mh", "Анімація кита"],
    ]),
    comments: [{ author: "Галина Яремчук", company: "Сірий кит", text: "Можна додати дату виходу в кінці?", at: d("10-11T09:00"), version: 2 }],
  },
  {
    id: "kyt-layout",
    name: "Верстка книги.fig",
    kind: "fig",
    project: "kyt",
    folder: "Верстка",
    size: 310,
    owner: "ib",
    updatedAt: d("10-11T15:45"),
    versions: history(d("10-11T15:45"), [
      ["ib", "Сітка й стилі"],
      ["ib", "Розділи 1–6"],
      ["ib", "Розділи 7–12"],
    ]),
    comments: [],
  },
  {
    id: "kyt-proof",
    name: "Верстка коректура.pdf",
    kind: "pdf",
    project: "kyt",
    folder: "Верстка",
    size: 22,
    owner: "ib",
    updatedAt: d("10-11T16:00"),
    linkedFrom: "kyt-layout",
    versions: history(d("10-11T16:00"), [["ib", "Для коректора"]]),
    comments: [{ author: "Галина Яремчук", company: "Сірий кит", text: "Правки коректора надішлю до п'ятниці.", at: d("10-12T10:30"), version: 1, pin: null }],
  },
  {
    id: "kyt-illustrations",
    name: "Ілюстрації розділів.ai",
    kind: "ai",
    project: "kyt",
    folder: "Ілюстрації",
    size: 240,
    owner: "ok",
    updatedAt: d("10-05T11:20"),
    versions: history(d("10-05T11:20"), [
      ["ok", "12 замальовок"],
      ["ok", "Вектор, 6 з 12"],
      ["ok", "Вектор, 12 з 12"],
    ]),
    comments: [],
  },

  // ---------- кошик ----------
  {
    id: "kadr-old-logo",
    name: "Логотип старий.ai",
    kind: "ai",
    project: "kadr",
    folder: "Логотип",
    size: 6.2,
    owner: "tm",
    updatedAt: d("09-14T10:00"),
    trashed: true,
    versions: history(d("09-14T10:00"), [["tm", "Архів попереднього знака"]]),
    comments: [],
  },
  {
    id: "varta-draft",
    name: "Чернетка банера.png",
    kind: "png",
    project: "varta",
    folder: "Осінь 2026",
    size: 1.1,
    owner: "dt",
    updatedAt: d("10-02T18:00"),
    trashed: true,
    versions: history(d("10-02T18:00"), [["dt", "Не пішло в роботу"]]),
    comments: [],
  },
];

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** the latest version is the reference look; older ones drift further away (hue, offset, layout) */
function lookFor(fileId: string, i: number, n: number): Look {
  const k = n - 1 - i;
  if (k === 0) return { hue: 0, dx: 0, dy: 0, variant: 0 };
  const h = hash(`${fileId}${k}`);
  return { hue: ((h % 9) - 4) * 8 || 12, dx: ((h >> 4) % 9) - 4, dy: ((h >> 8) % 7) - 3, variant: k % 3 };
}

export const vid = (fileId: string, v: number) => `${fileId}:v${v}`;

/**
 * Review seed: status, reviewers, deadline and decisions ([who, decision, version, at]).
 * Kept consistent with the rule: all approved → «Погоджено» (= final), any правки → «Потрібні правки».
 * kadr-kv was approved on v6 and got v7 later, so it shows «В роботі · Погоджено v6 · є новіша v7».
 */
type Flow = { status: Status; reviewers: string[]; due?: string; decisions?: [string, Decision["decision"], number, string][] };
const FLOW: Record<string, Flow> = {
  "kadr-kv": {
    status: "approved",
    reviewers: ["or", "ib", "dt"],
    due: "2026-10-20",
    decisions: [
      ["or", "approved", 6, d("10-17T18:30")],
      ["dt", "approved", 6, d("10-17T19:05")],
      ["ib", "approved", 6, d("10-17T20:10")],
    ],
  },
  "kadr-banner": { status: "progress", reviewers: ["dt"], due: "2026-10-19" },
  "kadr-poster": { status: "approved", reviewers: ["or"], decisions: [["or", "approved", 2, d("10-17T19:30")]] },
  "kadr-teaser": {
    status: "changes",
    reviewers: ["or", "vp", "dt"],
    due: "2026-10-17",
    decisions: [
      ["vp", "changes", 4, d("10-17T15:10")],
      ["or", "approved", 4, d("10-17T15:42")],
    ],
  },
  "kadr-logo": {
    status: "approved",
    reviewers: ["or", "dt"],
    decisions: [
      ["dt", "approved", 4, d("10-12T14:10")],
      ["or", "approved", 4, d("10-12T15:00")],
    ],
  },
  "kadr-guide": { status: "review", reviewers: ["or", "dt"], due: "2026-10-24", decisions: [["dt", "approved", 5, d("10-15T18:30")]] },
  "kadr-brandbook": { status: "progress", reviewers: ["or", "tm"] },
  "kadr-social": { status: "draft", reviewers: ["ib"] },
  "kadr-mood": { status: "draft", reviewers: ["ok"] },
  "varta-kv": {
    status: "review",
    reviewers: ["as", "ib", "dt"],
    due: "2026-10-19",
    decisions: [
      ["as", "approved", 4, d("10-16T19:30")],
      ["ib", "approved", 5, d("10-17T21:40")],
    ],
  },
  "varta-billboard": { status: "approved", reviewers: ["as"], decisions: [["as", "approved", 1, d("10-16T18:40")]] },
  "varta-stories": {
    status: "changes",
    reviewers: ["as", "ib"],
    due: "2026-10-18",
    decisions: [
      ["ib", "approved", 3, d("10-17T22:15")],
      ["as", "changes", 3, d("10-18T08:40")],
    ],
  },
  "varta-banner": { status: "review", reviewers: ["as", "dt"], due: "2026-10-21", decisions: [["dt", "approved", 2, d("10-16T19:40")]] },
  "varta-landing": { status: "progress", reviewers: ["as", "dt"], due: "2026-10-25" },
  "varta-hero": { status: "draft", reviewers: ["tm"] },
  "varta-brief": { status: "draft", reviewers: ["ok"] },
  "varta-icons": { status: "progress", reviewers: ["dt"] },
  "kyt-cover": {
    status: "review",
    reviewers: ["hy", "ok", "dt"],
    due: "2026-10-20",
    decisions: [
      ["hy", "approved", 6, d("10-16T14:00")],
      ["ok", "approved", 6, d("10-16T15:20")],
    ],
  },
  "kyt-print": { status: "review", reviewers: ["hy", "dt"], due: "2026-10-19" },
  "kyt-web": { status: "approved", reviewers: ["hy"], decisions: [["hy", "approved", 1, d("10-16T14:10")]] },
  "kyt-trailer": { status: "changes", reviewers: ["hy", "ok"], due: "2026-10-15", decisions: [["hy", "changes", 2, d("10-11T09:00")]] },
  "kyt-layout": { status: "progress", reviewers: ["hy", "ib"], due: "2026-10-30" },
  "kyt-proof": { status: "review", reviewers: ["hy"], due: "2026-10-17" },
  "kyt-illustrations": { status: "draft", reviewers: ["hy", "ok"], due: "2026-10-28" },
};

/** exports are derived from linkedFrom, so links never disagree */
export const FILES: DemoFile[] = RAW.map(({ comments: _c, ...f }) => ({
  ...f,
  category: KIND_CATEGORY[f.kind],
  linkedTo: RAW.filter((o) => o.linkedFrom === f.id).map((o) => o.id),
  versions: f.versions.map((v, i) => ({ ...v, id: vid(f.id, v.v), look: lookFor(f.id, i, f.versions.length) })),
  status: FLOW[f.id]?.status ?? "draft",
  reviewers: FLOW[f.id]?.reviewers ?? [f.owner],
  due: FLOW[f.id]?.due,
}));

/** seed decisions; the app store owns them after the first load */
export const DECISIONS: Decision[] = Object.entries(FLOW).flatMap(([fileId, fl]) =>
  (fl.decisions ?? []).map(([who, decision, v, at]) => ({ fileId, who, versionId: vid(fileId, v), decision, at })),
);

const addMin = (iso: string, min: number) => new Date(new Date(iso).getTime() + min * 60000).toISOString();

/** seed «Історія»: sent for review → each decision → resulting status / final (+ a newer version reopening the file) */
export const AUDIT: AuditEntry[] = RAW.flatMap((r) => {
  const fl = FLOW[r.id];
  if (!fl || fl.status === "draft" || fl.status === "progress") return [];
  const ds = [...(fl.decisions ?? [])].sort((a, b) => a[3].localeCompare(b[3]));
  const out: Omit<AuditEntry, "id">[] = [];
  const firstV = ds[0]?.[2] ?? r.versions.length;
  const sentAt = addMin(r.versions[firstV - 1].at, 20);
  const L = (s: Status) => STATUS_META[s].label;
  out.push({ fileId: r.id, at: sentAt, who: r.owner, kind: "status", to: "review", text: `${g(r.owner, "надіслав", "надіслала")} v${firstV} на погодження` });
  for (const [who, dec, v, at] of ds)
    out.push(
      dec === "approved"
        ? { fileId: r.id, at, who, kind: "approve", text: `${g(who, "погодив", "погодила")} v${v}` }
        : { fileId: r.id, at, who, kind: "changes", text: `${g(who, "попросив", "попросила")} правки до v${v}` },
    );
  const last = ds[ds.length - 1];
  if (last && fl.status === "changes") out.push({ fileId: r.id, at: last[3], who: null, kind: "status", to: "changes", text: `Статус: ${L("review")} → ${L("changes")}` });
  if (last && fl.status === "approved") {
    out.push({ fileId: r.id, at: last[3], who: null, kind: "status", to: "approved", text: `Статус: ${L("review")} → ${L("approved")}` });
    out.push({ fileId: r.id, at: last[3], who: null, kind: "final", text: `v${last[2]} стала фінальною` });
    const latest = r.versions[r.versions.length - 1];
    if (latest.v !== last[2])
      out.push({ fileId: r.id, at: latest.at, who: null, kind: "status", to: "progress", text: `Нова версія v${latest.v}: статус → ${L("progress")}` });
  }
  return out;
}).map((e, i) => ({ ...e, id: `seed-a${i}` }));

/** seed comments; the app store owns them after the first load */
export const COMMENTS: AppComment[] = RAW.flatMap((f) =>
  f.comments.map((c, i) => {
    const h = hash(`${f.id}${i}`);
    const pin = c.pin === undefined ? ([0.2 + ((h % 60) / 100), 0.2 + (((h >> 6) % 60) / 100)] as [number, number]) : c.pin;
    return {
      id: `${f.id}-c${i + 1}`,
      fileId: f.id,
      versionId: vid(f.id, c.version),
      author: c.author,
      role: c.company ? "Клієнт" : "Команда",
      company: c.company,
      text: c.text,
      x: pin ? pin[0] : null,
      y: pin ? pin[1] : null,
      createdAt: c.at,
      resolved: !!c.resolved,
    } satisfies AppComment;
  }),
);

export const FILE_BY_ID: Record<string, DemoFile> = Object.fromEntries(FILES.map((f) => [f.id, f]));

export const linkCount = (f: DemoFile) => f.linkedTo.length + (f.linkedFrom ? 1 : 0);
/** the latest version */
export const current = (f: DemoFile) => f.versions[f.versions.length - 1];
/** final version from the seed data (the store may override it) */
export const finalVersion = (f: DemoFile) => f.versions.find((v) => v.final);
export const versionById = (f: DemoFile, id: string | null | undefined) => f.versions.find((v) => v.id === id);

// ---------- formatting (uk, round values) ----------

const num = (n: number, digits = 0) => n.toLocaleString("uk-UA", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export function formatSize(mb: number) {
  if (mb < 1) return `${num(mb * 1000)} КБ`;
  if (mb < 1000) return `${num(mb, mb < 10 ? 1 : 0)} МБ`;
  return `${num(mb / 1000, 1)} ГБ`;
}

export function formatGb(gb: number) {
  return gb >= 1000 ? `${num(gb / 1000, 1)} ТБ` : `${num(gb, gb < 10 ? 1 : 0)} ГБ`;
}

const MONTHS = ["січ", "лют", "бер", "квіт", "трав", "черв", "лип", "серп", "вер", "жовт", "лист", "груд"];
const two = (n: number) => String(n).padStart(2, "0");

/** «щойно», «2 год тому», «вчора», «3 дні тому», «28 вер» */
export function formatAgo(iso: string) {
  const t = new Date(iso).getTime();
  const min = Math.round((DEMO_NOW - t) / 60000);
  if (min < 2) return "щойно";
  if (min < 60) return `${min} хв тому`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} год тому`;
  const days = Math.round(h / 24);
  if (days === 1) return "вчора";
  if (days < 7) return `${days} ${days < 5 ? "дні" : "днів"} тому`;
  const dt = new Date(t + 3 * 3600000);
  return `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}`;
}

/** deadline: «до 21 жовт» and whole days left from the demo «today» (negative = overdue) */
export function dueInfo(due: string) {
  const [y, m, day] = due.split("-").map(Number);
  const today = new Date(DEMO_NOW + 3 * 3600000);
  const days = Math.round((Date.UTC(y, m - 1, day) - Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) / 86400000);
  return { days, label: `до ${day} ${MONTHS[m - 1]}` };
}

/** «16 жовт, 13:30» (Kyiv time, independent of the viewer's zone) */
export function formatDate(iso: string) {
  const dt = new Date(new Date(iso).getTime() + 3 * 3600000);
  return `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}, ${two(dt.getUTCHours())}:${two(dt.getUTCMinutes())}`;
}
