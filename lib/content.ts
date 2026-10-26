// All site copy lives here (Sanity CMS comes later). Ukrainian; the English copy is lib/content.en.ts
// (same shape, typed as `Content`). Components read the current language via useContent() (components/Lang.tsx).
//
// ⚠️ DRAFT VALUES: everything marked `// DRAFT` is an invented, realistic-looking placeholder
// (prices, terms, contacts, team, case texts). Replace each one with real data before launch.
import type { Accent } from "@/components/ui/accent";
import type { IconKey } from "@/components/ui/icons";

export const BRAND = {
  name: "MaxArt Digital",
  wordmark: ["MaxArt", "Digital"],
  city: "Львів",
  telegram: "@maxartdigital", // DRAFT
  telegramUrl: "https://t.me/maxartdigital", // DRAFT
  email: "hello@maxartdigital.com",
  privacyHref: "/privacy",
};

export const META = {
  title: "MaxArt Digital · цифрові рішення для вашого бізнесу",
  description: "Студія дизайну й розробки у Львові: дизайн, сайт і панель керування під ключ, в одних руках.",
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
  lead: "Дизайн, розробка й панель керування в одних руках. Ви отримуєте сайт, який редагуєте самі.",
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
  /** 1–2 lines under the name in the Work list */
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
  visit: "Відкрити сайт",
  close: "Закрити",
  taskLabel: "Задача",
  doneLabel: "Що зробили",
  cases: [
    {
      id: "maina",
      name: "Maina by Rivka",
      kind: "Магазин напівфабрикатів і готової їжі", // DRAFT
      did: ["UX і структура", "UI-дизайн", "Розробка Next.js", "Адмінка Sanity"], // DRAFT
      text: "Магазин напівфабрикатів і готової їжі з доставкою по Україні. Асортимент і ціни клієнт оновлює сам в адмінці.", // DRAFT
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
      did: ["UX-структура", "UI-дизайн", "Каталог продукції", "Форма запиту"], // DRAFT
      text: "Сайт виробника сендвіч-панелей, фургонів і причепів.", // DRAFT
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
      did: ["Арт-дирекшн", "UI-дизайн", "Анімації", "Розробка"], // DRAFT
      text: "Стильне архітектурне бюро футуристичних будинків: сайт-портфоліо з ефектною подачею проєктів.", // DRAFT
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
      did: ["Ілюстративний стиль", "UI-дизайн", "Адаптив", "Розробка"], // DRAFT
      text: "Лендинг домашньої пекарні: меню, замовлення, теплий мультяшний стиль.", // DRAFT
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

export type Service = {
  id: string;
  name: string;
  blurb: string;
  /** «від» price in UAH */
  price: number;
  /** term in days: [min, max] */
  days: [number, number];
  color: Accent;
  icon: IconKey;
  features: string[];
};

export const SERVICES = {
  label: "Послуги",
  /** plain start · accent end */
  title: ["Наш", "прайс-лист."],
  lead: "Можна окремо, вигідніше під ключ.",
  pricePrefix: "від",
  currency: "₴",
  add: "Додати",
  added: "Додано",
  listLabel: "Послуги",
  /** the package card on the right */
  package: "Ваш пакет",
  total: "Разом",
  term: "Термін:",
  empty: "Оберіть послуги зліва",
  remove: "Прибрати",
  save: "економія",
  items: [
    {
      id: "design",
      name: "Дизайн",
      blurb: "Макет, що виглядає дорого й веде до заявки.",
      price: 12000, // DRAFT
      days: [5, 7], // DRAFT
      color: "violet",
      icon: "design",
      features: ["Структура й прототип", "Десктоп + мобайл", "UI-кіт і стилі", "Анімації"], // DRAFT
    },
    {
      id: "dev",
      name: "Розробка",
      blurb: "Швидкий адаптивний сайт на сучасному стеку.",
      price: 18000, // DRAFT
      days: [7, 10], // DRAFT
      color: "blue",
      icon: "code",
      features: ["Next.js", "Адаптив", "Швидкість і SEO", "Домен і хостинг"], // DRAFT
    },
    {
      id: "cms",
      name: "Адмінка",
      blurb: "Тексти, ціни, фото й товари змінюєте самі.",
      price: 8000, // DRAFT
      days: [3, 5], // DRAFT
      color: "cyan",
      icon: "cms",
      features: ["Sanity CMS", "Редагування з телефона", "Схеми під ваш контент", "Навчання"], // DRAFT
    },
  ] satisfies Service[],
  /** all three picked */
  turnkey: {
    name: "Під ключ",
    price: 32000, // DRAFT
    term: "від 2 тижнів", // DRAFT
    perks: ["3 раунди правок", "Підтримка 1 місяць після запуску"], // DRAFT
  },
};

export const PROCESS = {
  label: "Процес",
  title: ["Як народжується", "ваш сайт."],
  lead: "Після брифу (1–2 дні) все відбувається у вас на очах. Гортайте.",
  scroll: "Гортайте",
  total: "Разом: від 2 тижнів",
  steps: [
    // DRAFT: durations
    { n: "01", icon: "brief", title: "Бриф", text: "Знайомимось із бізнесом і цілями. Фіксуємо обсяг, ціну й терміни.", days: "1–2 дні" },
    { n: "02", icon: "design", title: "Дизайн", text: "Структура й макети для десктопа та мобільного. Правки до вашого «так».", days: "3–5 днів" },
    { n: "03", icon: "code", title: "Верстка", text: "Збираємо швидкий адаптивний сайт. Прогрес видно на тестовому посиланні.", days: "5–7 днів" },
    { n: "04", icon: "cms", title: "Панель керування", text: "Підключаємо CMS: тексти, ціни, фото й товари змінюєте самі.", days: "2–3 дні" },
    { n: "05", icon: "launch", title: "Запуск", text: "Домен, аналітика, навчання команди й підтримка після старту.", days: "1 день" },
  ] as { n: string; icon: IconKey; title: string; text: string; days: string }[],
  /** labels inside the animated mock UIs (illustrative demo data, not real prices) */
  demo: {
    design: {
      file: "maxart · Головна",
      layers: ["Desktop", "Фото", "Заголовок", "Кнопка"],
      layersLabel: "Шари",
      title: "Сайти, які продають",
      button: "Замовити",
      props: "Властивості",
      fill: "Заливка",
      font: "Geologica · 44",
      picker: "Колір кнопки",
    },
    code: {
      file: "app/page.tsx",
      url: "localhost:3000",
      h1: "Домашня кухня",
      p: "Заморожені напівфабрикати",
      btn: "Замовити",
      cmd: "npm run build",
      ok1: "Compiled successfully",
      ok2: "Ready on Vercel",
    },
    cms: {
      win: "Панель керування · Sanity",
      nav: ["Товари", "Категорії", "Сторінки", "Налаштування"],
      crumb: "Товари / Новий товар",
      name: "Назва",
      nameVal: "Вареники з картоплею",
      price: "Ціна",
      priceVal: "149",
      currency: "₴",
      photo: "Фото",
      upload: "Завантаження",
      stock: "В наявності",
      publish: "Опублікувати",
      published: "Опубліковано",
      toast: "Зміни вже на сайті",
      live: "Наживо",
      preview: "Сайт",
    },
    launch: {
      pack: "MaxArt Digital → клієнту",
      url: "https://ваш-сайт.ua",
      online: "Онлайн",
      checks: ["Домен і SSL", "Аналітика", "Навчання команди", "Підтримка"],
      done: "Сайт запущено",
      client: "Клієнт",
    },
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
  chips: ["Все під ключ", "Дизайн", "Розробка", "Адмінка"],
  submit: "Надіслати",
  availability: "Зараз приймаємо проєкти на листопад", // DRAFT
  sending: "Надсилаємо…",
  errName: "Вкажіть, як до вас звертатись.",
  errContact: "Вкажіть Telegram (@нік) або email.",
  errNeeds: "Оберіть хоча б одну послугу.",
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
    { id: "design", title: ["Малюємо", "дизайн."], step: "Дизайн", days: "3–5 днів", color: "#a78bfa" }, // DRAFT: days
    { id: "code", title: ["Пишемо", "код."], step: "Верстка", days: "5–7 днів", color: "#5aa2ff" }, // DRAFT: days
    { id: "cms", title: ["Підключаємо", "панель."], step: "Панель керування", days: "2–3 дні", color: "#22d3ee" }, // DRAFT: days
    { id: "launch", title: ["Запускаємо", "сайт."], step: "Запуск", days: "1 день", color: "#34d399" }, // DRAFT: days
  ],
  replayNote: "Разом: від 2 тижнів", // DRAFT
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
    nav: ["Продукт", "Ціни", "Контакти"],
    login: "Почати",
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
    crumb: "Тарифи / Новий",
    form: "Новий товар",
    draft: "Чернетка",
    name: "Назва",
    nameVal: "Стандарт",
    max: 60,
    slug: "your-product.com/standard",
    price: "Ціна",
    priceVal: "1 990",
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
    log: ["Назву змінено", "Ціну оновлено", "Фото завантажено", "Опубліковано"],
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
  lead: "[Текст політики конфіденційності]",
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
