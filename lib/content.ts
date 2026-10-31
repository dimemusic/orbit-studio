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
  title: ["Цифрові рішення", "для", "вашого бізнесу."],
  lead: "Створюємо сайти під ключ: дизайн, розробка й адмін-панель в одних руках. Ви отримуєте сайт, який редагуєте самі.",
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
  /** four short items in the Work list row («що зробили») */
  did: string[];
  tags: string[];
  /** cover screenshot (case window, light spill) */
  media: string;
  /** screens the laptop cycles through while the case is active, sorted by name; one shot = slow vertical scroll */
  shots: string[];
  /** full-page screenshot (720px wide) that scrolls inside the Work card on hover; null = static cover */
  full: { src: string; w: number; h: number } | null;
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
      tags: ["Дизайн", "Next.js", "Sanity"],
      media: "/cases/maina.webp",
      shots: ["/cases/maina.webp"],
      full: { src: "/cases/maina-full.webp", w: 720, h: 1910 },
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
      tags: ["UI/UX", "Дизайн"],
      media: "/cases/avtoban.webp",
      shots: ["/cases/avtoban.webp", "/cases/avtoban-2.webp", "/cases/avtoban-3.webp"],
      full: { src: "/cases/avtoban-full.webp", w: 720, h: 2283 },
      url: "https://avtoban-trailers.vercel.app/",
      status: "UI/UX",
      result: "[РЕЗУЛЬТАТ]",
      color: "#e5322d",
      accent: "cyan",
      // DRAFT: case texts
      task: "Зробити зрозумілий сайт для виробника сендвіч-панелей і фургонів: продукція, послуги та швидкий запит на розрахунок.",
      done: ["Структура й сценарії сторінок", "Каталог: фургони, панелі, причепи", "Блок сервісу та модернізації", "Форма запиту з адаптивом"],
      facts: [
        { label: "Термін", value: "[ТЕРМІН]" },
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
      tags: ["Дизайн", "Next.js"],
      media: "/cases/biganskiy.webp",
      shots: ["/cases/biganskiy.webp"],
      full: { src: "/cases/biganskiy-full.webp", w: 720, h: 3871 },
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
      tags: ["Дизайн", "Лендинг"],
      media: "/cases/krendel.webp",
      shots: ["/cases/krendel.webp"],
      full: null, // TODO: full-page shot once the site is online
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

export const FAQ = {
  label: "Питання",
  title: ["Часті", "питання."],
  lead: "Коротко про ціну, терміни й те, що буде після запуску.",
  // DRAFT: numbers follow the draft prices / terms above
  items: [
    { q: "Скільки коштує сайт?", a: "Окрема послуга від $200, сайт під ключ від $750. Точну ціну фіксуємо після брифу, і вона вже не змінюється.", color: "green" as Accent },
    { q: "Скільки часу займає?", a: "Зазвичай від 2 до 3 тижнів від брифу до запуску. Терміни кожного етапу узгоджуємо заздалегідь.", color: "cyan" as Accent },
    { q: "Чи зможу я сам редагувати сайт?", a: "Так. Ми підключаємо панель керування: тексти, ціни, фото й товари ви змінюєте самі, без програміста.", color: "violet" as Accent },
    { q: "Що буде після запуску?", a: "Навчимо вашу команду працювати з панеллю і місяць підтримуємо сайт безкоштовно.", color: "green" as Accent },
    { q: "Скільки правок входить у ціну?", a: "3 раунди правок на кожному етапі. Цього вистачає, щоб довести дизайн до вашого «так».", color: "cyan" as Accent },
    { q: "Можна замовити тільки дизайн або тільки розробку?", a: "Так. Кожну послугу можна взяти окремо, а під ключ виходить вигідніше.", color: "violet" as Accent },
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
  errNeeds: "Оберіть хоча б один варіант.",
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

export const PRIVACY = {
  crumb: "Політика конфіденційності",
  title: "Політика конфіденційності",
  lead: "Коротко: ми збираємо лише те, що ви самі пишете у формі заявки, щоб вам відповісти. Без реклами, без стеження, без продажу даних.",
  updated: "Оновлено 31 жовтня 2026",
  summary: [
    { t: "Тільки форма заявки", d: "Ім'я, контакт і опис проєкту, які ви самі пишете." },
    { t: "Без cookies і аналітики", d: "Жодних трекерів, пікселів і реклами." },
    { t: "Не продаємо дані", d: "Лише сервіси, без яких сайт не працює." },
    { t: "Видалимо на запит", d: "Напишіть нам, відповімо протягом 30 днів." },
  ],
  sections: [
    {
      h: "Хто ми",
      p: [
        "Сайт maxartdigital.com належить веб-студії MaxArt Digital (Львів, Україна). Розпорядник персональних даних: [ПІБ ФОП або назва компанії], [адреса].", // DRAFT
        "З будь-яких питань щодо даних пишіть на hello@maxartdigital.com.",
      ],
      li: [],
    },
    {
      h: "Які дані ми отримуємо",
      p: ["Коли ви надсилаєте форму заявки:"],
      li: ["ім'я або як до вас звертатися;", "Telegram або email для відповіді;", "тип сайту, який вас цікавить;", "опис проєкту, якщо ви його залишили."],
    },
    {
      h: "",
      p: [
        "Під час відвідування сайту хостинг автоматично фіксує технічні дані запиту: IP-адресу, тип браузера і час. Це стандартні журнали сервера, ми не використовуємо їх, щоб вас ідентифікувати.",
        "Ми не просимо і не зберігаємо паролі, платіжні дані чи інформацію про здоров'я, релігію, політичні погляди тощо.",
      ],
      li: [],
    },
    {
      h: "Навіщо",
      p: [],
      li: [
        "щоб відповісти на заявку, уточнити задачу і підготувати пропозицію;",
        "щоб спілкуватися з вами щодо проєкту, якщо ми домовимося про співпрацю;",
        "щоб сайт працював стабільно і був захищений від спаму та атак.",
      ],
    },
    {
      h: "",
      p: ["Ми не надсилаємо розсилок, не показуємо рекламу і не продаємо та не передаємо ваші дані для маркетингу."],
      li: [],
    },
    {
      h: "Правові підстави",
      p: [
        "Ми обробляємо дані відповідно до Закону України «Про захист персональних даних», а для відвідувачів з ЄС також відповідно до GDPR. Підстави: ваша згода, яку ви надаєте, надсилаючи форму; кроки на ваш запит перед укладенням договору; наш законний інтерес у безпеці сайту.",
      ],
      li: [],
    },
    {
      h: "Кому ми передаємо дані",
      p: ["Лише сервісам, без яких сайт не працює:"],
      li: [
        "Vercel Inc. (США): хостинг сайту і технічні журнали;",
        "Resend (США): доставка вашої заявки нам на пошту;",
        "наш поштовий сервіс: там зберігається лист із заявкою.",
      ],
    },
    {
      h: "",
      p: [
        "Ці сервіси можуть обробляти дані за межами України та ЄС. Вони працюють за стандартними договірними умовами щодо захисту даних. Іншим особам ми передаємо дані лише тоді, коли цього вимагає закон.",
      ],
      li: [],
    },
    {
      h: "Cookies",
      p: [
        "Сайт не використовує cookies, аналітику чи рекламні трекери. У браузері зберігається лише одне технічне значення в sessionStorage, щоб заставка показувалась один раз за сесію. Воно не містить персональних даних і зникає, коли ви закриваєте вкладку.",
      ],
      li: [],
    },
    {
      h: "Скільки зберігаємо",
      p: [
        "Заявки зберігаються, поки триває спілкування або співпраця, і не довше 3 років після останнього контакту. Потім ми їх видаляємо. Технічні журнали хостингу зберігаються обмежений час відповідно до правил Vercel.", // DRAFT: строк зберігання
      ],
      li: [],
    },
    {
      h: "Ваші права",
      p: ["Ви можете в будь-який момент:"],
      li: [
        "дізнатися, які ваші дані ми маємо, і отримати їх копію;",
        "виправити неточні дані;",
        "попросити видалити дані або обмежити їх обробку;",
        "заперечити проти обробки або відкликати згоду;",
        "поскаржитися Уповноваженому Верховної Ради України з прав людини або органу захисту даних у вашій країні ЄС.",
      ],
    },
    {
      h: "",
      p: ["Щоб скористатися правами, напишіть на hello@maxartdigital.com. Ми відповімо протягом 30 днів."],
      li: [],
    },
    {
      h: "Безпека",
      p: [
        "Сайт працює лише через HTTPS, заявки передаються зашифрованим з'єднанням. Доступ до них має тільки наша команда.",
      ],
      li: [],
    },
    {
      h: "Діти",
      p: [
        "Сайт не призначений для дітей. Якщо ви вважаєте, що дитина надіслала нам свої дані, напишіть нам, і ми їх видалимо.",
      ],
      li: [],
    },
    {
      h: "Зміни",
      p: ["Якщо ми змінимо цю політику, нова версія з'явиться на цій сторінці з новою датою оновлення."],
      li: [],
    },
  ],
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
export const uk = { BRAND, META, CTA, NAV, HERO, WORK, SERVICES, CONTACT, BUILD, FOOTER, PRIVACY, UI };
export type Content = typeof uk;
export type Lang = "uk" | "en";
