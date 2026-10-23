// All site copy lives here (Sanity CMS comes later). Ukrainian only.
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
  email: "hello@maxart.digital", // DRAFT
  privacyHref: "/privacy",
};

export const META = {
  title: "MaxArt Digital · цифрові рішення для вашого бізнесу",
  description: "Студія дизайну й розробки у Львові: дизайн, сайт і панель керування під ключ, в одних руках.",
};

export const CTA = {
  primary: "Обговорити проєкт",
  primaryHref: "/#contact",
  work: "Наші роботи",
};

// sections are being rebuilt one by one: only the live ones are linked
export const NAV = [{ href: "/#process", label: "Як ми працюємо" }];

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
  /** one line on the card */
  text: string;
  tags: string[];
  media: string;
  /** live project link, null when there is none (yet) */
  url: string | null;
  status: string;
  color: string;
  accent: Accent;
  /** case window */
  task: string;
  done: string[];
  facts: { label: string; value: string }[];
};

export const WORK = {
  label: "Роботи",
  title: ["Роботи, якими", "ми пишаємось."],
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
      kind: "Магазин напівфабрикатів",
      text: "Сайт магазину з каталогом і панеллю керування: товари, ціни й фото власниця змінює сама.",
      tags: ["Дизайн", "Next.js", "Sanity"],
      media: "/cases/maina.webp",
      url: null,
      status: "Живий проєкт",
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
      id: "biganskiy",
      name: "BIGANSKIY",
      kind: "Архітектурне бюро",
      text: "Сайт бюро, що проєктує футуристичні будинки.",
      tags: ["Дизайн", "Next.js"],
      media: "/cases/biganskiy.webp",
      url: "https://biganskiy-site.vercel.app",
      status: "Концепт",
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
      id: "cloud-sphere",
      name: "Cloud Sphere",
      kind: "SaaS-лендинг",
      text: "Лендинг хмарного сховища з інтерактивною 3D-сценою на фоні.",
      tags: ["Дизайн", "Next.js", "three.js"],
      media: "/cases/cloudsphere.webp",
      url: null,
      status: "Концепт",
      color: "#3d8bff",
      accent: "blue",
      // DRAFT: case texts
      task: "Зробити лендинг SaaS-продукту, який запам'ятовується і пояснює продукт за кілька секунд.",
      done: ["3D-фон із частинок, що реагує на курсор", "Анімації на скролі", "Тарифи й FAQ", "Адаптив під телефони"],
      facts: [
        { label: "Термін", value: "10 днів" },
        { label: "Тип", value: "Концепт лендингу" },
      ],
    },
    {
      id: "krendel",
      name: "Крендель",
      kind: "Кав'ярня-пекарня",
      text: "Теплий мультяшний лендинг кав'ярні з власною пекарнею.",
      tags: ["Дизайн", "Лендинг"],
      media: "/cases/krendel.webp",
      url: null,
      status: "Концепт",
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
  /** DRAFT: price in USD, "від" */
  price: number;
  color: Accent;
  icon: IconKey;
  features: string[];
};

export const SERVICES = {
  label: "Послуги",
  title: ["Беріть частину", "або все під ключ."],
  lead: "Оберіть, що потрібно, і побачите орієнтовну ціну.",
  pricePrefix: "від",
  currency: "$",
  add: "Додати",
  added: "Обрано",
  summaryLabel: "Орієнтовно",
  summaryEmpty: "Оберіть хоча б одну послугу",
  summaryNote: "Точну ціну фіксуємо після брифу.",
  items: [
    {
      id: "design",
      name: "Дизайн",
      blurb: "Макет, що виглядає дорого й веде до заявки.",
      price: 300, // DRAFT
      color: "violet",
      icon: "design",
      features: ["Структура й прототип", "Десктоп + мобайл", "Анімації й інтерактив"],
    },
    {
      id: "dev",
      name: "Розробка",
      blurb: "Швидкий адаптивний сайт на сучасному стеку.",
      price: 400, // DRAFT
      color: "blue",
      icon: "code",
      features: ["Next.js + TypeScript", "Швидкість і SEO-основа", "Домен і хостинг"],
    },
    {
      id: "cms",
      name: "Панель керування",
      blurb: "Тексти, ціни, фото й товари змінюєте самі.",
      price: 200, // DRAFT
      color: "cyan",
      icon: "cms",
      features: ["Sanity CMS", "Схеми під ваш контент", "Навчання команди"],
    },
  ] satisfies Service[],
  turnkey: {
    name: "Під ключ",
    price: 750, // DRAFT
    blurb: "Усі три послуги одним проєктом, з фіксованою ціною.",
    save: "економія",
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
  needs: "Що потрібно",
  chips: ["Все під ключ", "Дизайн", "Сайт", "Панель керування"],
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
  /** neutral demo brand shown inside the mock site */
  brand: "Your site",
  stages: [
    { id: "design", title: ["Малюємо", "дизайн."], step: "Дизайн", days: "3–5 днів", color: "#a78bfa" }, // DRAFT: days
    { id: "code", title: ["Пишемо", "код."], step: "Верстка", days: "5–7 днів", color: "#5aa2ff" }, // DRAFT: days
    { id: "cms", title: ["Підключаємо", "панель."], step: "Панель керування", days: "2–3 дні", color: "#22d3ee" }, // DRAFT: days
    { id: "launch", title: ["Запускаємо", "сайт."], step: "Запуск", days: "1 день", color: "#34d399" }, // DRAFT: days
  ],
  replayNote: "Разом: від 2 тижнів", // DRAFT
  // demo theme of the mock site: a boutique chalet rental in the mountains (made up, not a client)
  design: {
    layers: ["Desktop", "Фото", "Заголовок", "Кнопка"],
    layersLabel: "Шари",
    props: "Властивості",
    fill: "Заливка",
    nav: ["Будиночки", "Ціни", "Контакти"],
    place: "Карпати",
    title: "Будиночки в горах",
    sub: "Тиша, ліс і чан з видом на хребет.",
    button: "Забронювати",
    more: "Усі будиночки",
    houses: [
      { name: "Смерека", price: "від 2 800 ₴" },
      { name: "Хмара", price: "від 3 200 ₴" },
      { name: "Ватра", price: "від 2 100 ₴" },
    ],
  },
  code: { cmd: "npm run build", ok: "Ready · 0.9s", h1: "Будиночки в горах", p: "Тиша, ліс і чан з видом на хребет.", btn: "Забронювати" },
  cms: { name: "Назва", nameVal: "Шале з панорамою", price: "Ціна за ніч", priceVal: "3 400 ₴", photo: "Фото", file: "chalet.jpg", stock: "Вільно", publish: "Опублікувати", published: "Опубліковано", toast: "Зміни вже на сайті", live: "Наживо" },
  launch: { url: "your-site.com", online: "Онлайн", checks: ["Домен і SSL", "Аналітика", "Навчання", "Підтримка"] },
};

export const FOOTER = {
  copy: "© 2026",
  privacy: "Політика конфіденційності",
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
] as const;
