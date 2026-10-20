// All site copy lives here (Sanity CMS comes later). Ukrainian only.
// Never invent numbers, prices, testimonials or facts: anything unknown stays a [PLACEHOLDER].
import type { Accent } from "@/components/ui/accent";

export const BRAND = {
  name: "Orbit.studio",
  wordmark: "orbit.studio",
  city: "Львів",
  telegram: "[@нік]",
  telegramUrl: "https://t.me/[нік]",
  email: "[email]",
  privacyHref: "/privacy",
};

export const META = {
  title: "Orbit.studio · цифрові рішення для вашого бізнесу",
  description: "Студія дизайну й розробки у Львові: дизайн, сайт і панель керування під ключ, в одних руках.",
};

export const CTA = {
  primary: "Обговорити проєкт",
  primaryHref: "/#contact",
  work: "Наші роботи",
};

export const NAV = [
  { href: "/#work", label: "Роботи" },
  { href: "/#services", label: "Послуги" },
  { href: "/#admin", label: "Панель керування" },
  { href: "/#process", label: "Процес" },
  { href: "/#faq", label: "FAQ" },
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
  text: string;
  tags: string[];
  result: string;
  /** media from assets/cases/; null = placeholder visual */
  media: string | null;
  /** live project link, null when there is none (yet) */
  url: string | null;
  status: string;
  /** colour of the placeholder visual and of the node in the particle network */
  color: string;
  accent: Accent;
};

export const WORK = {
  label: "Роботи",
  title: ["Роботи, якими", "ми пишаємось."],
  lead: "Від живого магазину з панеллю керування до сміливих концептів.",
  /** desktop only (case nodes need a fine pointer) */
  nodeHint: "Підказка: кожен кольоровий вузол на фоні відкриває один із проєктів.",
  cta: "Хочу схожий",
  cases: [
    {
      id: "maina",
      name: "Maina by Rivka",
      kind: "Магазин напівфабрикатів",
      text: "Сайт магазину напівфабрикатів з панеллю керування: товари, ціни й фото клієнт змінює сам.",
      tags: ["Дизайн", "Next.js", "Sanity"],
      result: "[РЕЗУЛЬТАТ]",
      media: "/cases/maina.webp",
      url: null,
      status: "Живий проєкт",
      color: "#4fe3c1",
      accent: "green",
    },
    {
      id: "biganskiy",
      name: "BIGANSKIY",
      kind: "Архітектурне бюро",
      text: "Сайт бюро, що проєктує футуристичні будинки.",
      tags: ["Дизайн", "Next.js"],
      result: "[РЕЗУЛЬТАТ]",
      media: "/cases/biganskiy.webp",
      url: null,
      status: "Концепт",
      color: "#a78bfa",
      accent: "violet",
    },
    {
      id: "cloud-sphere",
      name: "Cloud Sphere",
      kind: "SaaS-лендинг",
      text: "Лендинг SaaS-продукту з інтерактивними 3D-частинками на фоні.",
      tags: ["Дизайн", "Next.js", "three.js"],
      result: "[РЕЗУЛЬТАТ]",
      media: "/cases/cloudsphere.webp",
      url: null,
      status: "Концепт",
      color: "#3d8bff",
      accent: "blue",
    },
    {
      id: "krendel",
      name: "Крендель",
      kind: "Домашня пекарня",
      text: "Лендинг домашньої пекарні.",
      tags: ["Дизайн", "Лендинг"],
      result: "[РЕЗУЛЬТАТ]",
      media: "/cases/krendel.webp",
      url: null,
      status: "Концепт",
      color: "#22d3ee",
      accent: "cyan",
    },
  ] satisfies Case[],
  closing: {
    title: "Тут може бути ваш сайт",
    text: "Розкажіть про ідею, і ми запропонуємо, як її зробити.",
  },
};

export const ABOUT = {
  label: "Хто ми",
  title: ["Одна команда.", "Від макета до панелі керування."],
  /** manifesto: hl = phrase lit in colour */
  manifesto: [
    { text: "Ми студія з Львова. Робимо сайти, які продають, і ведемо їх" },
    { text: "від першого ескізу до панелі керування", hl: "[[data-in]>&]:text-cyan" },
    { text: ". Дизайн, код і система керування в одних руках, тож нічого не губиться між підрядниками, а ви" },
    { text: "редагуєте сайт самі", hl: "[[data-in]>&]:text-[#4fe3c1]" },
    { text: "без програміста." },
  ],
  facts: [
    { value: "[X]+", label: "запущених сайтів" },
    { value: "[X] тиж.", label: "від брифу до запуску" },
    { value: "3 в 1", label: "дизайн, код і панель керування в одних руках" },
    { value: "0 ₴", label: "консультація безкоштовна" },
  ],
};

export type Service = {
  id: string;
  name: string;
  blurb: string;
  price: string;
  color: Accent;
  hex: string;
  features: string[];
};

export const SERVICES = {
  label: "Послуги",
  title: ["Беріть частину", "або все під ключ."],
  lead: "Позначте, що потрібно, і ми підкажемо пакет.",
  pickLabel: "Що вам потрібно?",
  recommend: "Вам підійде",
  pricePrefix: "від",
  items: [
    {
      id: "design",
      name: "Дизайн",
      blurb: "Макет, що виглядає дорого й веде до заявки",
      price: "[ЦІНА]",
      color: "violet",
      hex: "#a78bfa",
      features: ["Прототип і структура", "Дизайн десктоп + мобайл", "Анімації й інтерактив", "UI-кіт для розробки"],
    },
    {
      id: "dev",
      name: "Розробка",
      blurb: "Швидкий сайт на сучасному стеку",
      price: "[ЦІНА]",
      color: "blue",
      hex: "#3d8bff",
      features: ["Next.js + TypeScript", "Адаптив і доступність", "Швидкість і SEO-основа", "Деплой на Vercel"],
    },
    {
      id: "cms",
      name: "Панель керування",
      blurb: "Система керування сайтом (CMS): товари, ціни й фото редагуєте самі",
      price: "[ЦІНА]",
      color: "cyan",
      hex: "#22d3ee",
      features: ["Sanity CMS", "Схеми під ваш контент", "Ролі й доступи", "Навчання команди"],
    },
  ] satisfies Service[],
  turnkey: {
    name: "Під ключ",
    price: "[ЦІНА]",
    blurb: "Дизайн, розробка й панель керування одним проєктом, з однією командою й фіксованою ціною.",
    tag: "Найвигідніше",
    features: ["Усе з трьох послуг", "Фіксована ціна після брифу", "Тестове посилання з першого дня розробки", "Навчання й підтримка після запуску"],
  },
};

export const ADMIN = {
  label: "Панель керування",
  title: ["Змінюйте сайт", "самі за хвилину."],
  lead: "Ціни, фото й товари без програміста. Ось як це виглядає.",
  window: "Панель керування · Sanity",
  sidebar: ["Товари", "Категорії", "Сторінки", "Налаштування"],
  /** demo data in the mock panel: names are illustrative, prices stay placeholders */
  products: ["Вареники з картоплею", "Пельмені домашні", "Сирники"],
  oldPrice: "[ЦІНА]",
  newPrice: "[НОВА ЦІНА]",
  newProduct: "Новий товар",
  saved: "Опубліковано на сайті",
  steps: [
    { n: "01", title: "Ціна", text: "Клік по ціні, нове значення, «Опублікувати»." },
    { n: "02", title: "Фото", text: "Перетягніть нове фото, і воно вже на сайті." },
    { n: "03", title: "Товар", text: "Новий товар додається за кілька полів." },
  ],
  publish: "Опублікувати",
  preview: "Сайт",
};

export const PROCESS = {
  label: "Процес",
  title: ["Чотири кроки", "до запуску."],
  lead: "Ви завжди знаєте, що відбувається і коли буде готово.",
  steps: [
    { n: "01", title: "Бриф і оцінка", text: "Розбираємо задачу, фіксуємо обсяг і ціну.", days: "[X днів]" },
    { n: "02", title: "Дизайн", text: "Структура, макети й анімації на погодження.", days: "[X днів]" },
    { n: "03", title: "Розробка й панель керування", text: "Верстаємо й підключаємо панель керування. Прогрес видно на тестовому посиланні.", days: "[X днів]" },
    { n: "04", title: "Запуск, навчання, підтримка", text: "Публікуємо сайт, вчимо команду, лишаємось на зв'язку.", days: "[X днів]" },
  ],
};

export const TEAM = {
  label: "Команда",
  title: ["Люди, які", "роблять ваш сайт."],
  lead: "Без менеджерів-посередників: ви говорите з тими, хто робить.",
  people: [
    { name: "Максим", role: "UI/UX-дизайн", initials: "М", color: "violet" as Accent },
    { name: "[Ім'я]", role: "Розробка", initials: "[І]", color: "blue" as Accent },
  ],
  photo: "[Фото]",
  quote: {
    text: "[Відгук клієнта Maina by Rivka]",
    name: "[Ім'я клієнта]",
    role: "Maina by Rivka",
    initials: "MR",
  },
};

export const GUARANTEES = {
  label: "Гарантії",
  title: ["Без ризику", "для вас."],
  lead: "Домовляємось на березі, щоб потім не сперечатись.",
  items: [
    { title: "[N] раундів правок", text: "Правки на кожному етапі входять у ціну.", color: "violet" as Accent },
    { title: "Фіксована ціна", text: "Ціна не змінюється після брифу.", color: "green" as Accent },
    { title: "Підтримка", text: "[умови підтримки]", color: "cyan" as Accent },
  ],
};

export const FAQ = {
  label: "Питання",
  title: ["Часті", "питання."],
  items: [
    { q: "Скільки коштує сайт?", a: "Від [ЦІНА] за окрему послугу, від [ЦІНА] під ключ. Точну ціну фіксуємо після брифу.", color: "green" as Accent },
    { q: "Скільки часу займає?", a: "Зазвичай [X] тижнів від брифу до запуску. Терміни кожного етапу узгоджуємо заздалегідь.", color: "cyan" as Accent },
    { q: "Чи зможу я сам редагувати сайт?", a: "Так. Ми підключаємо панель керування: тексти, ціни, фото й товари ви змінюєте самі, без програміста.", color: "violet" as Accent },
    { q: "Що буде після запуску?", a: "Навчимо вашу команду працювати з панеллю керування і лишимось на підтримці: [умови підтримки].", color: "green" as Accent },
    { q: "Можна замовити тільки дизайн або тільки розробку?", a: "Так. Кожну послугу можна взяти окремо, а під ключ виходить вигідніше.", color: "violet" as Accent },
  ],
};

export const CONTACT = {
  label: "Контакт",
  title: ["Є ідея?", "Поговорімо."],
  lead: "Відповімо протягом [ЧАС] і запропонуємо, як це зробити.",
  name: "Ваше ім'я",
  namePh: "Як до вас звертатись",
  contact: "Telegram або email",
  contactPh: "@нік або name@mail.com",
  needs: "Що потрібно",
  chips: ["Все під ключ", "Дизайн", "Сайт", "Панель керування"],
  submit: "Надіслати",
  availability: "Зараз приймаємо проєкти на [місяць]",
  sending: "Надсилаємо…",
  errName: "Вкажіть, як до вас звертатись.",
  errContact: "Вкажіть Telegram (@нік) або email.",
  errNeeds: "Оберіть хоча б одну послугу.",
  thanksTitle: "Дякуємо!",
  thanksText: "Ми отримали заявку і напишемо вам найближчим часом.",
  again: "Надіслати ще одну",
  or: "Або напишіть напряму",
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

/** Home page story: order shared by section headers and the bottom section indicator. */
export const HOME_SECTIONS = [
  { id: "top", label: "Головна" },
  { id: "work", label: WORK.label },
  { id: "about", label: ABOUT.label },
  { id: "services", label: SERVICES.label },
  { id: "admin", label: ADMIN.label },
  { id: "process", label: PROCESS.label },
  { id: "team", label: TEAM.label },
  { id: "guarantees", label: GUARANTEES.label },
  { id: "faq", label: FAQ.label },
  { id: "contact", label: CONTACT.label },
] as const;
