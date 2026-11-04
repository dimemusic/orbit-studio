// All site copy lives here (Sanity CMS comes later). Ukrainian; the English copy is lib/content.en.ts
// (same shape, typed as `Content`). Components read the current language via useContent() (components/Lang.tsx).
//
// ⚠️ DRAFT VALUES: everything marked `// DRAFT` is an invented, realistic-looking placeholder
// (prices, terms, contacts, team, case texts). Replace each one with real data before launch.
import type { Accent } from "@/components/ui/accent";

export const BRAND = {
  name: "MaxArt Digital",
  wordmark: ["MaxArt", "Digital"],
  city: "Львів",
  telegram: "@maxartdigital", // DRAFT
  telegramUrl: "https://t.me/maxartdigital", // DRAFT
  email: "hello@maxartdigital.com",
  privacyHref: "/privacy",
};

/** search snippet + social preview: title ≤ 60 chars, description ≤ 160 */
export const META = {
  title: "Розробка сайтів під ключ у Львові · MaxArt Digital",
  description: "Створюємо лендинги, сайти-візитівки, інтернет-магазини й корпоративні сайти під ключ: дизайн, розробка й адмін-панель. Львів і вся Україна.",
  ogAlt: "MaxArt Digital: розробка сайтів під ключ",
  /** service description for structured data (JSON-LD) */
  service: "Дизайн і розробка сайтів під ключ: лендинги, сайти-візитівки, інтернет-магазини, корпоративні сайти з адмін-панеллю.",
};

export const CTA = {
  primary: "Обговорити проєкт",
  primaryHref: "/#contact",
  home: "/",
  work: "Наші роботи",
};

// sections are being rebuilt one by one: only the live ones are linked
export const NAV = [
  { href: "/#process", label: "Як ми працюємо" },
  { href: "/#work", label: "Наші роботи" },
  { href: "/#services", label: "Послуги" },
  { href: "/#contact", label: "Контакти" },
];

export const HERO = {
  /** line 1 · plain start of line 2 · gradient end of line 2 */
  title: ["Сайти під\u00a0ключ", "для", "вашого бізнесу."],
  lead: "Дизайн, розробка й адмін-панель в одних руках. Ви отримуєте сайт, який редагуєте самі.",
  /** count-up parts: prefix · value (animated) · suffix. `value: null` = static text in `prefix`. */
  stats: [
    { prefix: "", value: 2, suffix: " тижні", label: "мінімальний термін запуску" },
    { prefix: "3 в 1", value: null, suffix: "", label: "дизайн + код + CMS" },
    { prefix: "", value: 24, suffix: " год", label: "відповідь на заявку" },
    { prefix: "", value: 90, suffix: "+", label: "PageSpeed на мобільних" },
  ] as { prefix: string; value: number | null; suffix: string; label: string }[],
};

export type Case = {
  id: string;
  name: string;
  kind: string;
  /** kind of website, shown as a tag on the card preview */
  type: string;
  /** 2–3 lines under the name on the Work card */
  text: string;
  /** one line for the card (the full text lives in the case window) */
  short: string;
  /** four short items in the Work list row («що зробили») */
  did: string[];
  tags: string[];
  /** cover screenshot (case window, light spill) */
  media: string;
  /** screens the laptop cycles through while the case is active, sorted by name; one shot = slow vertical scroll */
  shots: string[];
  /** full-page screenshot (720px wide) that scrolls inside the Work card on hover; null = static cover */
  full: { src: string; w: number; h: number } | null;
  /** photo of the finished site in a real setting (laptop mockup) for the case window; null = the old monitor mockup */
  photo: string | null;
  /** live project link, null when there is none (yet) */
  url: string | null;
  status: string;
  /** DRAFT: measurable result of the project */
  result: string;
  color: string;
  accent: Accent;
  /** case window */
  task: string;
  done: string[];
  facts: { label: string; value: string }[];
};

export const WORK = {
  label: "Наші роботи",
  /** plain start · accent end (in the active case's colour) */
  title: ["З чим ми", "працюємо."],
  listLabel: "Проєкти",
  /** «Стек технологій» under the cases: only tools we really use (DRAFT: add / remove as the stack changes) */
  stack: {
    title: "Стек технологій.",
    lead: "На чому робимо дизайн, сайти й адмін-панелі.",
    groups: [
      { title: "Дизайн", items: [{ id: "figma", name: "Figma" }] },
      { title: "Розробка", items: [{ id: "nextjs", name: "Next.js" }, { id: "react", name: "React" }, { id: "typescript", name: "TypeScript" }, { id: "javascript", name: "JavaScript" }, { id: "tailwind", name: "Tailwind CSS" }, { id: "html", name: "HTML5" }] },
      { title: "Адмін-панель", items: [{ id: "sanity", name: "Sanity" }, { id: "wordpress", name: "WordPress" }, { id: "shopify", name: "Shopify" }] },
      { title: "Запуск і сервіси", items: [{ id: "vercel", name: "Vercel" }] },
    ],
  },
  /** link in the section header */
  more: "Обговорити проєкт",
  /** closing row of the list */
  next: {
    name: "Тут може бути ваш сайт",
    kind: "Обговорімо ваш проєкт", // DRAFT
    text: "Розкажіть про ідею, і ми запропонуємо рішення під ваш бізнес.", // DRAFT
    cta: "Обговорити проєкт",
  },
  open: "Деталі проєкту",
  cta: "Хочу схожий",
  view: "Переглянути",
  visit: "Відкрити сайт",
  close: "Закрити",
  taskLabel: "Задача",
  doneLabel: "Що зробили",
  cases: [
    {
      id: "maina",
      name: "Maina by Rivka",
      kind: "Магазин напівфабрикатів", // DRAFT
      type: "Інтернет-магазин",
      did: ["UX і структура", "UI-дизайн", "Розробка Next.js", "Адмін-панель Sanity"], // DRAFT
      text: "Інтернет-магазин напівфабрикатів і готової їжі з доставкою по Україні. Каталог із категоріями, замовлення в кілька кліків, а асортимент і ціни власниця оновлює сама в адмінці Sanity.", // DRAFT
      short: "Каталог із категоріями й замовлення в кілька кліків, а ціни власниця оновлює сама.",
      tags: ["Дизайн", "Next.js", "Sanity"],
      media: "/cases/maina.webp",
      shots: ["/cases/maina.webp"],
      full: { src: "/cases/maina-page.webp", w: 1440, h: 3874 },
      photo: "/cases/maina-mockup.webp",
      url: null,
      status: "Живий проєкт",
      result: "[РЕЗУЛЬТАТ]",
      color: "#4fe3c1",
      accent: "green",
      // DRAFT: case texts
      task: "Магазину потрібен був сайт, де клієнти бачать асортимент і замовляють, а власниця сама оновлює товари без програміста.",
      done: ["Дизайн у стилі фізичного магазину", "Каталог із категоріями", "Панель керування Sanity", "Навчання власниці роботі з панеллю"],
      facts: [
        { label: "Термін", value: "3 дні" },
        { label: "Тип", value: "Сайт + CMS" },
      ],
    },
    {
      id: "avtoban",
      name: "Автобан Трейлерз",
      kind: "Сайт виробника",
      type: "Корпоративний сайт",
      did: ["UX-структура", "UI-дизайн", "Каталог продукції", "Форма запиту"], // DRAFT
      text: "Сайт виробника сендвіч-панелей, фургонів і причепів. Продумали структуру й сценарії, каталог продукції та форму запиту на розрахунок, щоб клієнт швидко знаходив потрібне.", // DRAFT
      short: "Каталог продукції та форма запиту на розрахунок, щоб клієнт швидко знаходив потрібне.",
      tags: ["UI/UX", "Дизайн"],
      media: "/cases/avtoban-hero.webp",
      shots: ["/cases/avtoban.webp", "/cases/avtoban-2.webp", "/cases/avtoban-3.webp"],
      full: { src: "/cases/avtoban-page.webp", w: 1440, h: 4646 },
      photo: "/cases/avtoban-mockup.webp",
      url: "https://avtoban-trailers.vercel.app/",
      status: "UI/UX",
      result: "[РЕЗУЛЬТАТ]",
      color: "#e5322d",
      accent: "cyan",
      // DRAFT: case texts
      task: "Зробити зрозумілий сайт для виробника сендвіч-панелей і фургонів: продукція, послуги та швидкий запит на розрахунок.",
      done: ["Структура й сценарії сторінок", "Каталог: фургони, панелі, причепи", "Блок сервісу та модернізації", "Форма запиту з адаптивом"],
      facts: [
        { label: "Термін", value: "2 тижні" }, // DRAFT: picked by Maksym («придумай щось сам»), not a measured figure
        { label: "Тип", value: "Корпоративний сайт" },
      ],
    },
    {
      id: "biganskiy",
      name: "BIGANSKIY",
      kind: "Архітектурне бюро (концепт)", // DRAFT
      type: "Сайт-портфоліо",
      did: ["Арт-дирекшн", "UI-дизайн", "Анімації", "Розробка"], // DRAFT
      text: "Сайт-портфоліо архітектурного бюро футуристичних будинків. Відео на першому екрані, галерея проєктів і анімації, що подають кожен будинок як подію.", // DRAFT
      short: "Відео на першому екрані, галерея проєктів і анімації, що подають кожен будинок як подію.",
      tags: ["Дизайн", "Next.js"],
      media: "/cases/biganskiy.webp",
      shots: ["/cases/biganskiy.webp"],
      full: { src: "/cases/biganskiy-page.webp", w: 1440, h: 7742 },
      photo: "/cases/biganskiy-mockup.webp",
      url: "https://biganskiy-site.vercel.app",
      status: "Концепт",
      result: "[РЕЗУЛЬТАТ]",
      color: "#a78bfa",
      accent: "violet",
      // DRAFT: case texts
      task: "Показати проєкти бюро так, щоб з першого екрана було відчуття «вау» і бажання замовити консультацію.",
      done: ["Відео на першому екрані", "Галерея проєктів", "Сторінка послуг", "Форма заявки"],
      facts: [
        { label: "Термін", value: "1 тиждень" },
        { label: "Тип", value: "Концепт сайту" },
      ],
    },
    {
      id: "krendel",
      name: "Крендель",
      kind: "Лендинг домашньої пекарні", // DRAFT
      type: "Лендинг",
      did: ["Ілюстративний стиль", "UI-дизайн", "Адаптив", "Розробка"], // DRAFT
      text: "Лендинг кав'ярні з власною пекарнею в теплому мультяшному стилі. Меню й асортимент, доставка та контакти: усе веде до замовлення або візиту.", // DRAFT
      short: "Меню, доставка й контакти в теплому мультяшному стилі: усе веде до замовлення.",
      tags: ["Дизайн", "Лендинг"],
      media: "/cases/krendel.webp",
      shots: ["/cases/krendel.webp"],
      full: null, // TODO: full-page shot once the site is online
      photo: null, // TODO: Krendel mockup photo
      url: null,
      status: "Концепт",
      result: "[РЕЗУЛЬТАТ]",
      color: "#22d3ee",
      accent: "cyan",
      // DRAFT: case texts
      task: "Передати атмосферу домашньої випічки і привести людей замовити або завітати в кав'ярню.",
      done: ["Ілюстративний стиль", "Меню й асортимент", "Блок доставки", "Контакти й карта"],
      facts: [
        { label: "Термін", value: "5 днів" },
        { label: "Тип", value: "Концепт лендингу" },
      ],
    },
  ] satisfies Case[],
};

export type Plan = {
  id: "card" | "landing" | "shop" | "corp";
  name: string;
  /** who it is for, one line */
  for: string;
  /** «від» price in USD */
  price: number;
  /** minimal term in days */
  days: number;
  features: string[];
  /** highlighted card (card-pro + badge) */
  hot?: boolean;
};

/** Prices by website type (USD). Values marked DRAFT are placeholders to confirm. */
export const SERVICES = {
  label: "Послуги",
  /** plain start · accent end */
  title: ["Наш", "прайс-лист."],
  lead: "Ціна залежить від типу сайту. Точну суму фіксуємо після брифу.",
  pricePrefix: "від",
  currency: "$",
  term: "від",
  choose: "Обрати",
  more: "Детальніше",
  includes: "Що входить",
  hot: "Рекомендуємо",
  listLabel: "Тарифи",
  plans: [
    { id: "card", name: "Сайт-візитівка", for: "Для експертів, майстрів і малого бізнесу.", price: 400, days: 5, features: ["До 5 сторінок", "Адаптив під телефони", "Форма заявки й контакти", "Базове SEO"] }, // DRAFT: days, features
    { id: "landing", name: "Лендинг", for: "Одна сторінка під продукт, послугу чи рекламу.", price: 600, days: 7, hot: true, features: ["Унікальний дизайн", "Анімації на скролі", "Форма заявки й аналітика", "Швидке завантаження"] }, // DRAFT: days, features
    { id: "shop", name: "Інтернет-магазин", for: "Каталог, кошик і замовлення онлайн.", price: 1000, days: 14, features: ["Каталог із фільтрами", "Кошик і оформлення", "Адмін-панель для товарів і цін", "Оплата й доставка"] }, // DRAFT: days, features
    { id: "corp", name: "Корпоративний сайт", for: "Для компаній з кількома напрямками.", price: 1200, days: 14, features: ["Багато сторінок і розділів", "Каталог послуг чи продукції", "Адмін-панель для контенту", "Кілька мов"] }, // DRAFT: price, days, features
  ] satisfies Plan[],
  extrasLabel: "Окремо",
  // DRAFT: all extras
  extras: [
    { name: "Дизайн без розробки", price: "від $250" },
    { name: "Адмін-панель до готового сайту", price: "від $200" },
    { name: "Підтримка після запуску", price: "від $50 / міс" },
  ],
  /** one SEO page per plan (/business-card-site, /landing-page, /online-store, /corporate-website); DRAFT copy */
  pages: {
    crumb: "Послуги",
    home: "Головна",
    included: "Що входить",
    process: "Як ми працюємо",
    others: "Інші послуги",
    about: "Усе про послугу",
    priceLabel: "Ціна",
    termLabel: "Термін",
    items: {
      card: {
        h1: ["Розробка", "сайту-візитівки."],
        title: "Сайт-візитівка під ключ у Львові від $400",
        description: "Розробка сайту-візитівки під ключ: дизайн, адаптив під телефони, форма заявки й базове SEO. Від $400, від 5 днів. Студія MaxArt Digital, Львів.",
        intro: "Кілька сторінок про вас і ваші послуги, щоб клієнти знайшли вас у Google, побачили ціни й одразу залишили заявку. Дизайн, розробка й запуск під ключ.",
      },
      landing: {
        h1: ["Розробка", "лендингу."],
        title: "Лендинг під ключ у Львові від $600",
        description: "Розробка лендингу під ключ: унікальний дизайн, анімації, форма заявки й аналітика, швидке завантаження. Від $600, від 7 днів. MaxArt Digital, Львів.",
        intro: "Одна сторінка під продукт, послугу чи рекламу: зрозуміла пропозиція, переваги й форма заявки. Унікальний дизайн, анімації на скролі й швидке завантаження.",
      },
      shop: {
        h1: ["Розробка", "інтернет-магазину."],
        title: "Інтернет-магазин під ключ у Львові від $1000",
        description: "Розробка інтернет-магазину під ключ: каталог із фільтрами, кошик, оплата й доставка, адмін-панель для товарів і цін. Від $1000. MaxArt Digital, Львів.",
        intro: "Каталог із фільтрами, кошик, оформлення замовлення, оплата й доставка. Товари, ціни й фото ви оновлюєте самі в адмін-панелі, без програміста.",
      },
      corp: {
        h1: ["Розробка", "корпоративного сайту."],
        title: "Корпоративний сайт під ключ у Львові",
        description: "Розробка корпоративного сайту: розділи для кількох напрямків, каталог послуг чи продукції, кілька мов і адмін-панель. Від $1200. MaxArt Digital, Львів.",
        intro: "Сайт для компанії з кількома напрямками: окремі розділи, каталог послуг чи продукції, кілька мов і адмін-панель, щоб команда оновлювала контент сама.",
      },
    },
  },
  quiz: {
    step: (i: number, n: number) => `Крок ${i} з ${n}`,
    back: "Назад",
    next: "Далі",
    reset: "Скинути відповіді",
    skip: "Пропустити й написати своїми словами",
    questions: [
      { id: "type", q: "Який сайт потрібен?", short: "Тип сайту" },
      { id: "admin", q: "Хто оновлюватиме тексти, ціни й фото?", short: "Оновлення", options: ["Самі, через адмін-панель", "Рідко, попросимо вас"] },
      { id: "support", q: "Потрібна підтримка після запуску?", short: "Підтримка", options: ["Так, щомісяця", "Поки ні"] },
      { id: "when", q: "Коли плануєте запуск?", short: "Запуск", options: ["Якнайшвидше", "Протягом місяця", "Не поспішаємо"] },
    ],
    /** DRAFT: must match SERVICES.extras («Адмін-панель до готового сайту», «Підтримка після запуску») */
    adminPrice: 200,
    supportPrice: 50,
    adminIncluded: "Адмін-панель уже входить у цей тип сайту.",
    final: "Ваш запит",
    change: "Змінити",
    estimate: "Орієнтовно",
    perMonth: "/ міс",
    note: "Стартова ціна за нашим прайсом. Точну суму фіксуємо після брифу.",
    free: "Ваші примітки",
    freePh: "Наприклад: є логотип і фото, потрібен запис онлайн",
    from: "від",
  },
};

export const ABOUT = {
  label: "Про нас",
  title: ["Люди, з якими", "ви працюєте."],
  lead: "Без менеджерів-посередників: ви говорите напряму з тими, хто робить ваш сайт.",
  // DRAFT: second member, roles and lines; photos go to public/team/<id>.webp
  people: [
    { id: "maksym", name: "Максим", role: "Дизайн і UX", text: "Відповідає за структуру, вигляд і зручність сайту.", initials: "М", color: "violet" as Accent, photo: null as string | null },
    { id: "andrii", name: "Андрій", role: "Розробка й CMS", text: "Верстає, підключає панель керування й запускає сайт.", initials: "А", color: "blue" as Accent, photo: null as string | null },
  ],
  values: [
    { title: "Фіксована ціна", text: "Після брифу ціна не змінюється." },
    { title: "3 раунди правок", text: "На кожному етапі, вже в ціні." }, // DRAFT
    { title: "Місяць підтримки", text: "Безкоштовно після запуску." }, // DRAFT
  ],
};

/** questions people ask before ordering (home + service pages, also FAQPage JSON-LD); numbers come from SERVICES */
export const FAQ = {
  title: ["Часті", "питання."],
  items: [
    { q: "Скільки коштує сайт?", a: `${SERVICES.plans.map((p, i) => `${i ? p.name.toLowerCase() : p.name} від $${p.price.toLocaleString("uk-UA")}`).join(", ")}. Точну суму фіксуємо після брифу.` },
    { q: "Скільки часу займає розробка?", a: `${SERVICES.plans.map((p, i) => `${i ? p.name.toLowerCase() : p.name} від ${p.days} днів`).join(", ")}. Терміни кожного етапу узгоджуємо заздалегідь.` },
    { q: "Чи зможу я сам редагувати сайт?", a: "Так. Ми підключаємо адмін-панель: тексти, ціни, фото й товари ви змінюєте самі, без програміста. В інтернет-магазині й корпоративному сайті вона вже входить, до інших сайтів додається від $200." },
    { q: "Що буде після запуску?", a: "Передаємо вам усі доступи й показуємо, як керувати сайтом. Якщо потрібна підтримка, вона коштує від $50 на місяць." }, // DRAFT
    { q: "Можна замовити тільки дизайн?", a: "Так. Дизайн без розробки коштує від $250, адмін-панель до вже готового сайту від $200." },
    { q: "На чому ви робите сайти?", a: "Дизайн робимо у Figma, сайти на Next.js, React і TypeScript, адмін-панель на Sanity, розміщуємо на Vercel. Сайти швидко відкриваються з телефону й добре індексуються в Google." },
  ],
};

export const CONTACT = {
  label: "Контакт",
  title: ["Є ідея?", "Поговорімо."],
  lead: "Відповімо протягом 24 годин і запропонуємо, як це зробити.",
  name: "Ваше ім'я",
  namePh: "Як до вас звертатись",
  contact: "Telegram або email",
  contactPh: "@нік або name@mail.com",
  message: "Коротко про проєкт",
  messagePh: "Наприклад: сайт для кав'ярні з меню й доставкою",
  needs: "Що потрібно?",
  consent: "Надсилаючи заявку, ви погоджуєтесь з",
  consentLink: "політикою конфіденційності",
  /** [i] = SERVICES.plans[i], then «Інше» */
  chips: ["Сайт-візитівка", "Лендинг", "Інтернет-магазин", "Корпоративний сайт", "Інше"],
  submit: "Надіслати",
  availability: "Зараз приймаємо проєкти на листопад", // DRAFT
  sending: "Надсилаємо…",
  errName: "Вкажіть, як до вас звертатись.",
  errContact: "Вкажіть Telegram (@нік) або email.",
  /** «Де зручніше зв'язатися?»: the one contact field below follows the chosen channel */
  channelLabel: "Де вам зручніше спілкуватися?",
  channels: [
    { id: "telegram", label: "Telegram", field: "Ваш Telegram", ph: "@нік або номер телефону", err: "Вкажіть @нік (5–32 символи: латиниця, цифри, _) або номер телефону." },
    { id: "viber", label: "Viber", field: "Номер у Viber", ph: "+380 67 123 45 67", err: "Вкажіть номер телефону, наприклад +380 67 123 45 67." },
    { id: "whatsapp", label: "WhatsApp", field: "Номер у WhatsApp", ph: "+380 67 123 45 67", err: "Вкажіть номер телефону, наприклад +380 67 123 45 67." },
    { id: "email", label: "Email", field: "Ваш email", ph: "name@mail.com", err: "Вкажіть email, наприклад name@mail.com." },
  ],
  errNeeds: "Оберіть хоча б один варіант.",
  tgChecking: "Перевіряємо нік у Telegram…",
  tgFound: "Акаунт у Telegram знайдено",
  tgMissing: "Такого ніка в Telegram немає. Перевірте написання.",
  errSend: "Не вдалося надіслати. Напишіть нам у Telegram або на email.",
  thanksTitle: "Дякуємо!",
  thanksText: "Ми отримали заявку і напишемо вам протягом 24 годин.",
  again: "Надіслати ще одну",
  or: "Або напишіть напряму",
};

/** «Як ми працюємо»: one self-playing ~12s film right after the hero. Demo labels are illustrative. */
export const BUILD = {
  label: "Як ми працюємо",
  /** title card before the film (last word gets the accent) */
  intro: ["Що", "ми", "робимо?"],
  /** neutral demo brand shown inside the mock site */
  brand: "Your product",
  stages: [
    { id: "design", title: ["Малюємо", "дизайн."], step: "Дизайн", color: "#a78bfa", note: "Структура й макет під телефон і десктоп. Ви бачите дизайн наживо й коментуєте прямо у Figma." },
    { id: "code", title: ["Пишемо", "код."], step: "Верстка", color: "#5aa2ff", note: "Верстаємо швидкий адаптивний сайт. Прогрес видно на тестовому посиланні з першого дня." },
    { id: "cms", title: ["Підключаємо", "панель."], step: "Панель керування", color: "#22d3ee", note: "Підключаємо адмін-панель: тексти, ціни, фото й товари змінюєте самі, без програміста." },
    { id: "launch", title: ["Запускаємо", "сайт."], step: "Запуск", color: "#34d399", note: "Домен, SSL, аналітика й навчання команди. Після запуску лишаємось на зв'язку." },
  ],
  // neutral demo theme of the mock site: a generic product page (not a client)
  design: {
    layers: ["Desktop", "Фото", "Форма", "Заголовок", "Опис", "Кнопка", "Тарифи"],
    /** people working in the file at the same time (roles, not real names) */
    team: [{ name: "Дизайнер" }, { name: "Редактор" }, { name: "Клієнт" }],
    comment: "Те, що треба!",
    layersLabel: "Шари",
    pagesLabel: "Сторінки",
    pages: ["Головна", "Каталог", "Про нас"],
    compLabel: "Компоненти",
    comps: ["Кнопка", "Картка", "Поле", "Бейдж"],
    props: "Властивості",
    layout: "Автолейаут",
    gap: "Відступ",
    pad: "Поля",
    text: "Текст",
    font: "Geologica",
    weight: "Semibold",
    fill: "Заливка",
    effects: "Ефекти",
    shadow: "Тінь",
    badge: "Новинка",
    title: "Ваш продукт тут",
    sub: "Коротко про те, чим він кращий за інших.",
    button: "Спробувати",
    more: "Детальніше",
    email: "Ваш email",
    join: "Отримати доступ",
    plans: [
      { name: "Старт", price: "990 ₴" },
      { name: "Стандарт", price: "1 990 ₴" },
      { name: "Про", price: "3 490 ₴" },
    ],
  },
  code: { cmd: "npm run build", ok: "Ready · 0.9s", h1: "Ваш продукт тут", p: "Коротко про те, чим він кращий за інших.", btn: "Спробувати" },
  cms: {
    crumb: "Тарифи / Стандарт",
    form: "Редагування тарифу",
    draft: "Чернетка",
    sale: "Знижка",
    name: "Назва",
    nameVal: "Стандарт",
    max: 60,
    slug: "your-product.com/standard",
    price: "Ціна",
    priceVal: "1 790",
    /** the price before the edit: the site shows it struck through */
    priceOld: "1 990",
    cur: "₴",
    cat: "Категорія",
    catVal: "Тарифи",
    photo: "Фото",
    drop: "Перетягніть файл або оберіть",
    file: "product.png",
    size: "240 KB",
    descVal: "Все необхідне для команди до 10 людей.",
    stock: "В наявності",
    stockHint: "Показувати на сайті",
    save: "Зберегти чернетку",
    publish: "Опублікувати",
    published: "Опубліковано",
    toast: "Зміни вже на сайті",
    live: "Наживо",
    logLabel: "Історія змін",
    log: ["Ціну змінено", "Фото оновлено", "Опис додано", "Опубліковано"],
    now: "щойно",
    tags: ["Новинка", "Хіт"],
    buy: "Купити",
  },
  launch: {
    url: "your-product.com",
    online: "Онлайн",
    listLabel: "Перед запуском",
    items: [
      { t: "Домен і SSL", d: "your-product.com · HTTPS" },
      { t: "Аналітика", d: "Видно, звідки приходять клієнти" },
      { t: "Навчання", d: "Показуємо, як керувати сайтом" },
      { t: "Підтримка", d: "На зв'язку і після запуску" },
    ],
    /** the finale: the site is live and the first things happen on it (a demo, not real data) */
    visitors: "на сайті",
    events: [
      { t: "Перший відвідувач", d: "щойно · з Google" },
      { t: "Нова заявка", d: "Тариф «Стандарт»" },
      { t: "Нове замовлення", d: "Стандарт · 1 790 ₴" },
    ],
  },
};

export const FOOTER = {
  copy: "© 2026",
  privacy: "Політика конфіденційності",
};

/** small interface strings (aria labels, menu, plural rules) */
export const UI = {
  skip: "Перейти до змісту",
  mainNav: "Головна навігація",
  toHome: "на головну",
  menu: "Меню",
  close: "Закрити",
  footerNav: "Посилання у футері",
  crumbs: "Хлібні крихти",
  home: "Головна",
  tags: "Теги",
  why: "Чому ми",
  noWebgl: "Цей браузер не підтримує WebGL.",
  lang: "Мова",
  locale: "uk-UA",
  /** 1 день · 2–4 дні · 5+ днів */
  days: (n: number) => {
    const d = n % 10;
    const h = n % 100;
    return `${n} ${d === 1 && h !== 11 ? "день" : d >= 2 && d <= 4 && (h < 12 || h > 14) ? "дні" : "днів"}`;
  },
};

/** privacy page: sections of plain paragraphs. Emails and https links become links. */
export const PRIVACY = {
  crumb: "Політика конфіденційності",
  title: "Політика конфіденційності",
  lead: "Ми збираємо лише те, що ви самі пишете у формі заявки, щоб вам відповісти. Без реклами, без стеження, без продажу даних.",
  updated: "Оновлено 31 жовтня 2026",
  sections: [
    {
      id: "who",
      title: "Хто ми",
      body: [
        `Сайт ${BRAND.name} належить [ПІБ ФОП або назва компанії, адреса] (далі «ми»). Ми є володільцем персональних даних, які ви передаєте через цей сайт.`, // DRAFT
        "Політика складена відповідно до Закону України «Про захист персональних даних» та, для відвідувачів з ЄС, Загального регламенту ЄС про захист даних (GDPR).",
        `З будь-яких питань щодо ваших даних пишіть на ${BRAND.email}.`,
      ],
    },
    {
      id: "data",
      title: "Які дані ми отримуємо",
      body: [
        "Коли ви надсилаєте форму заявки, ми отримуємо ваше ім'я, обраний спосіб зв'язку (Telegram, Viber, WhatsApp або email) і ваш нік, номер телефону чи email для відповіді, тип сайту, відповіді на питання форми та текст про проєкт, якщо ви його написали. Коли ви пишете нам у Telegram або на email, ми отримуємо те, що ви надіслали, а також дані вашого профілю в месенджері чи адресу пошти.",
        "Коли ви відкриваєте сайт, хостинг автоматично фіксує технічні дані запиту: IP-адресу, тип браузера і час запиту. Це стандартні журнали сервера, ми не використовуємо їх, щоб вас ідентифікувати.",
        "Ми не просимо і не збираємо паролі, платіжні чи інші чутливі дані. Надавати дані добровільно, але без імені й контакту ми не зможемо вам відповісти.",
      ],
    },
    {
      id: "purpose",
      title: "Навіщо",
      body: [
        "Ми використовуємо дані, щоб відповісти на вашу заявку, уточнити задачу і підготувати пропозицію, спілкуватися щодо проєкту, якщо ми домовимося про співпрацю, а також щоб захищати сайт від спаму та атак.",
        "Ми не надсилаємо розсилок, не показуємо рекламу, не продаємо дані і не передаємо їх для маркетингу.",
      ],
    },
    {
      id: "basis",
      title: "Правові підстави",
      body: [
        "Ми обробляємо дані на підставі вашої згоди, яку ви даєте, надсилаючи форму або пишучи нам. Відповідь і пропозицію готуємо на ваш запит до укладення договору. Технічні журнали обробляємо в межах законного інтересу: безпеки і стабільної роботи сайту.",
      ],
    },
    {
      id: "share",
      title: "Кому ми передаємо дані",
      body: [
        "Ми передаємо дані лише сервісам, без яких сайт і листування не працюють, і лише в потрібному їм обсязі: Vercel (США) для хостингу сайту, Resend (США) для доставки заявок нам на пошту і нашому поштовому сервісу ([країна]) для зберігання листів. Ці сервіси працюють за стандартними договірними умовами щодо захисту даних.", // DRAFT
        "Іншим особам ми передаємо дані лише тоді, коли цього вимагає закон.",
      ],
    },
    {
      id: "retention",
      title: "Скільки ми зберігаємо дані",
      body: [
        "Заявки й листування ми зберігаємо, поки триває спілкування або співпраця, але не довше 3 років після останнього контакту. Журнали хостингу зберігаються обмежений час за правилами Vercel. На ваш запит ми видалимо дані раніше, якщо закон не зобов'язує нас їх зберігати.", // DRAFT: строк
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      body: [
        "Сайт не використовує cookies, аналітику чи рекламні трекери. У браузері зберігається лише одне технічне значення в sessionStorage, щоб заставка показувалась один раз. Воно не містить персональних даних і зникає, коли ви закриваєте вкладку.",
      ],
    },
    {
      id: "rights",
      title: "Ваші права",
      body: [
        "Ви можете дізнатися, які ваші дані ми маємо, де вони зберігаються і кому передані, отримати їх копію, виправити неточні дані, видалити їх, обмежити обробку або заперечити проти неї, отримати свої дані у зручному форматі або передати їх іншому сервісу. Згоду можна відкликати в будь-який момент: це не впливає на обробку, що вже відбулася.",
        `Напишіть на ${BRAND.email}, і ми відповімо протягом 30 днів. Ви також можете поскаржитися Уповноваженому Верховної Ради України з прав людини (https://ombudsman.gov.ua), до суду або до органу захисту даних у вашій країні ЄС.`,
      ],
    },
    {
      id: "security",
      title: "Безпека",
      body: ["Сайт працює лише через HTTPS, заявки передаються зашифрованим з'єднанням. Доступ до них має тільки наша команда."],
    },
    {
      id: "other",
      title: "Діти та автоматизовані рішення",
      body: [
        "Сайт не призначений для дітей. Якщо дитина надіслала нам свої дані, напишіть нам, і ми їх видалимо.",
        "Ми не ухвалюємо щодо вас автоматизованих рішень і не складаємо профілів. Кожну заявку читає людина.",
      ],
    },
    {
      id: "changes",
      title: "Зміни",
      body: ["Нова версія політики з'явиться на цій сторінці з новою датою оновлення."],
    },
  ] as { id: string; title: string; body: string[] }[],
};

/** Home page story: order shared by section headers, the ambient background and the bottom section indicator. */
export const HOME_SECTIONS = [
  { id: "top", label: "Головна" },
  { id: "process", label: BUILD.label },
  { id: "work", label: WORK.label },
  { id: "services", label: SERVICES.label },
  { id: "contact", label: CONTACT.label },
] as const;

/** everything the live pages read, per language */
export const uk = { BRAND, META, CTA, NAV, HERO, WORK, SERVICES, FAQ, CONTACT, BUILD, FOOTER, PRIVACY, UI };
export type Content = typeof uk;
export type Lang = "uk" | "en";
