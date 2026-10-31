// English copy: the same shape as the Ukrainian `uk` in lib/content.ts (typed as Content, so nothing can go missing).
// `// DRAFT` values mirror the Ukrainian placeholders: replace both before launch.
import type { Case, Content, Plan } from "./content";

export const en: Content = {
  BRAND: {
    name: "MaxArt Digital",
    wordmark: ["MaxArt", "Digital"],
    city: "Lviv",
    telegram: "@maxartdigital", // DRAFT
    telegramUrl: "https://t.me/maxartdigital", // DRAFT
    email: "hello@maxartdigital.com",
    privacyHref: "/en/privacy",
  },

  META: {
    title: "Website Design & Development Studio · MaxArt Digital",
    description: "We design and build landing pages, business card sites, online stores and corporate websites with an admin panel. Turnkey, from Lviv, Ukraine.",
    ogAlt: "MaxArt Digital: turnkey website design and development",
    service: "Turnkey website design and development: landing pages, business card sites, online stores and corporate websites with an admin panel.",
  },

  CTA: {
    primary: "Discuss a project",
    primaryHref: "/en#contact",
    home: "/en",
    work: "Our work",
  },

  NAV: [
    { href: "/en#process", label: "How we work" },
    { href: "/en#work", label: "Our work" },
    { href: "/en#services", label: "Services" },
    { href: "/en#contact", label: "Contact" },
  ],

  HERO: {
    title: ["Digital solutions", "for", "your business."],
    lead: "Turnkey websites: design, development and an admin panel from one team. You get a website you can edit yourself.",
    stats: [
      { prefix: "", value: 2, suffix: " weeks", label: "fastest launch" },
      { prefix: "3 in 1", value: null, suffix: "", label: "design + code + CMS" },
      { prefix: "", value: 24, suffix: " h", label: "reply to your request" },
      { prefix: "", value: 90, suffix: "+", label: "PageSpeed on mobile" },
    ],
  },

  WORK: {
    label: "Our work",
    title: ["What we", "build."],
    listLabel: "Projects",
    more: "Discuss a project",
    next: {
      name: "Your website could be here",
      kind: "Let's talk about your project", // DRAFT
      text: "Tell us your idea and we'll suggest a solution for your business.", // DRAFT
      cta: "Discuss a project",
    },
    open: "Project details",
    cta: "I want one like this",
    view: "View project",
    visit: "Open the website",
    close: "Close",
    taskLabel: "Task",
    doneLabel: "What we did",
    cases: [
      {
        id: "maina",
        name: "Maina by Rivka",
        kind: "Frozen food shop", // DRAFT
        type: "Online store",
        did: ["UX and structure", "UI design", "Next.js development", "Sanity admin"], // DRAFT
        text: "An online store for frozen and ready meals with delivery across Ukraine. A catalogue with categories, ordering in a few clicks, and the owner updates products and prices herself in Sanity.", // DRAFT
        tags: ["Design", "Next.js", "Sanity"],
        media: "/cases/maina.webp",
        shots: ["/cases/maina.webp"],
        full: { src: "/cases/maina-full.webp", w: 720, h: 1910 },
        url: null,
        status: "Live project",
        result: "[RESULT]",
        color: "#4fe3c1",
        accent: "green",
        task: "The shop needed a website where customers browse and order, and the owner updates products herself without a developer.",
        done: ["Design in the style of the physical store", "Catalogue with categories", "Sanity admin panel", "Training for the owner"],
        facts: [
          { label: "Time", value: "3 days" },
          { label: "Type", value: "Website + CMS" },
        ],
      },
      {
        id: "avtoban",
        name: "Avtoban Trailers",
        kind: "Manufacturer website",
        type: "Corporate website",
        did: ["UX structure", "UI design", "Product catalogue", "Request form"], // DRAFT
        text: "Website for a maker of sandwich panels, vans and trailers. We planned the structure and user flows, the product catalogue and a quote request form so clients find what they need fast.", // DRAFT
        tags: ["UI/UX", "Design"],
        media: "/cases/avtoban.webp",
        shots: ["/cases/avtoban.webp", "/cases/avtoban-2.webp", "/cases/avtoban-3.webp"],
        full: { src: "/cases/avtoban-full.webp", w: 720, h: 2283 },
        url: "https://avtoban-trailers.vercel.app/",
        status: "UI/UX",
        result: "[RESULT]",
        color: "#e5322d",
        accent: "cyan",
        task: "A clear website for a maker of sandwich panels and vans: products, services and a quick quote request.",
        done: ["Page structure and user flows", "Catalogue: vans, panels, trailers", "Service and upgrades section", "Responsive request form"],
        facts: [
          { label: "Time", value: "[TIME]" },
          { label: "Type", value: "Corporate website" },
        ],
      },
      {
        id: "biganskiy",
        name: "BIGANSKIY",
        kind: "Architecture studio (concept)", // DRAFT
        type: "Portfolio website",
        did: ["Art direction", "UI design", "Animations", "Development"], // DRAFT
        text: "Portfolio website for a studio of futuristic houses. Video on the first screen, a project gallery and animations that present every house as an event.", // DRAFT
        tags: ["Design", "Next.js"],
        media: "/cases/biganskiy.webp",
        shots: ["/cases/biganskiy.webp"],
        full: { src: "/cases/biganskiy-full.webp", w: 720, h: 3871 },
        url: "https://biganskiy-site.vercel.app",
        status: "Concept",
        result: "[RESULT]",
        color: "#a78bfa",
        accent: "violet",
        task: "Present the studio's projects so the first screen says «wow» and makes people want to book a consultation.",
        done: ["Video on the first screen", "Project gallery", "Services page", "Request form"],
        facts: [
          { label: "Time", value: "1 week" },
          { label: "Type", value: "Website concept" },
        ],
      },
      {
        id: "krendel",
        name: "Krendel",
        kind: "Home bakery landing page", // DRAFT
        type: "Landing page",
        did: ["Illustrated style", "UI design", "Responsive", "Development"], // DRAFT
        text: "Landing page for a café with its own bakery, in a warm cartoon style. Menu and range, delivery and contacts: everything leads to an order or a visit.", // DRAFT
        tags: ["Design", "Landing page"],
        media: "/cases/krendel.webp",
        shots: ["/cases/krendel.webp"],
        full: null,
        url: null,
        status: "Concept",
        result: "[RESULT]",
        color: "#22d3ee",
        accent: "cyan",
        task: "Convey the feel of home baking and bring people to order or visit the café.",
        done: ["Illustrated style", "Menu and range", "Delivery section", "Contacts and map"],
        facts: [
          { label: "Time", value: "5 days" },
          { label: "Type", value: "Landing page concept" },
        ],
      },
    ] satisfies Case[],
  },

  SERVICES: {
    label: "Services",
    title: ["Our", "pricing."],
    lead: "The price depends on the type of website. We fix the exact sum after the brief.",
    pricePrefix: "from",
    currency: "$",
    term: "from",
    choose: "Choose",
    hot: "Recommended",
    listLabel: "Plans",
    plans: [
      { id: "card", name: "Business card site", for: "For experts, craftspeople and small businesses.", price: 400, days: 5, features: ["Up to 5 pages", "Mobile-friendly", "Request form and contacts", "Basic SEO"] }, // DRAFT
      { id: "landing", name: "Landing page", for: "One page for a product, service or ad campaign.", price: 600, days: 7, hot: true, features: ["Custom design", "Scroll animations", "Request form and analytics", "Fast loading"] }, // DRAFT
      { id: "shop", name: "Online store", for: "Catalogue, cart and online orders.", price: 1000, days: 14, features: ["Catalogue with filters", "Cart and checkout", "Admin for products and prices", "Payment and delivery"] }, // DRAFT
      { id: "corp", name: "Corporate website", for: "For companies with several lines of business.", price: 1200, days: 14, features: ["Many pages and sections", "Services or product catalogue", "Content admin panel", "Several languages"] }, // DRAFT
    ] satisfies Plan[],
    extrasLabel: "Separately",
    extras: [
      { name: "Design without development", price: "from $250" },
      { name: "Admin panel for an existing site", price: "from $200" },
      { name: "Support after launch", price: "from $50 / mo" },
    ],
  },

  CONTACT: {
    label: "Contact",
    title: ["Got an idea?", "Let's talk."],
    lead: "We reply within 24 hours and suggest how to make it happen.",
    name: "Your name",
    namePh: "How should we call you",
    contact: "Telegram or email",
    contactPh: "@username or name@mail.com",
    message: "About the project",
    messagePh: "For example: a café website with a menu and delivery",
    needs: "What do you need?",
    consent: "By sending the request you agree to the",
    consentLink: "privacy policy",
    chips: ["Business card site", "Landing page", "Online store", "Corporate website", "Other"],
    submit: "Send",
    availability: "Now booking projects for November", // DRAFT
    sending: "Sending…",
    errName: "Tell us how to call you.",
    errContact: "Enter your Telegram (@username) or email.",
    errNeeds: "Pick at least one option.",
    errSend: "Couldn't send it. Message us on Telegram or by email.",
    thanksTitle: "Thank you!",
    thanksText: "We've got your request and will reply within 24 hours.",
    again: "Send another one",
    or: "Or message us directly",
  },

  BUILD: {
    label: "How we work",
    intro: ["What", "we", "do?"],
    brand: "Your product",
    stages: [
      { id: "design", title: ["We draw", "the design."], step: "Design", color: "#a78bfa", note: "Structure and layouts for phone and desktop. You watch the design live and comment right in Figma." },
      { id: "code", title: ["We write", "the code."], step: "Development", color: "#5aa2ff", note: "We build a fast responsive site. You follow the progress on a test link from day one." },
      { id: "cms", title: ["We connect", "the admin."], step: "Admin panel", color: "#22d3ee", note: "We connect the admin panel: you change texts, prices, photos and products yourself, no developer needed." },
      { id: "launch", title: ["We launch", "the site."], step: "Launch", color: "#34d399", note: "Domain, SSL, analytics and team training. We stay in touch after launch." },
    ],
    design: {
      layers: ["Desktop", "Photo", "Form", "Heading", "Text", "Button", "Plans"],
      team: [{ name: "Designer" }, { name: "Editor" }, { name: "Client" }],
      comment: "Exactly what we need!",
      layersLabel: "Layers",
      pagesLabel: "Pages",
      pages: ["Home", "Catalogue", "About"],
      compLabel: "Components",
      comps: ["Button", "Card", "Input", "Badge"],
      props: "Properties",
      layout: "Auto layout",
      gap: "Gap",
      pad: "Padding",
      text: "Text",
      font: "Geologica",
      weight: "Semibold",
      fill: "Fill",
      effects: "Effects",
      shadow: "Shadow",
      badge: "New",
      title: "Your product here",
      sub: "A short line on why it beats the rest.",
      button: "Try it",
      more: "Learn more",
      email: "Your email",
      join: "Get access",
      plans: [
        { name: "Start", price: "990 ₴" },
        { name: "Standard", price: "1 990 ₴" },
        { name: "Pro", price: "3 490 ₴" },
      ],
    },
    code: { cmd: "npm run build", ok: "Ready · 0.9s", h1: "Your product here", p: "A short line on why it beats the rest.", btn: "Try it" },
    cms: {
      crumb: "Plans / Standard",
      form: "Edit plan",
      draft: "Draft",
      sale: "Sale",
      name: "Name",
      nameVal: "Standard",
      max: 60,
      slug: "your-product.com/standard",
      price: "Price",
      priceVal: "1 790",
      priceOld: "1 990",
      cur: "₴",
      cat: "Category",
      catVal: "Plans",
      photo: "Photo",
      drop: "Drop a file or browse",
      file: "product.png",
      size: "240 KB",
      descVal: "Everything a team of up to 10 people needs.",
      stock: "In stock",
      stockHint: "Show on the website",
      save: "Save draft",
      publish: "Publish",
      published: "Published",
      toast: "Changes are live",
      live: "Live",
      logLabel: "Change history",
      log: ["Price changed", "Photo updated", "Description added", "Published"],
      now: "just now",
      tags: ["New", "Hit"],
      buy: "Buy",
    },
    layers: { label: "Layers", items: ["Grid", "Typography", "Visuals", "Code", "Admin panel"] },
    launch: {
      url: "your-product.com",
      online: "Online",
      listLabel: "Before launch",
      items: [
        { t: "Domain and SSL", d: "your-product.com · HTTPS" },
        { t: "Analytics", d: "See where clients come from" },
        { t: "Training", d: "We show how to run the site" },
        { t: "Support", d: "Still here after launch" },
      ],
      visitors: "on the site",
      events: [
        { t: "First visitor", d: "just now · from Google" },
        { t: "New request", d: "“Standard” plan" },
        { t: "New order", d: "Standard · 1 790 ₴" },
      ],
    },
  },

  FOOTER: {
    copy: "© 2026",
    privacy: "Privacy policy",
  },

  PRIVACY: {
    crumb: "Privacy policy",
    title: "Privacy policy",
    lead: "[Privacy policy text]",
  },

  UI: {
    skip: "Skip to content",
    mainNav: "Main navigation",
    toHome: "home",
    menu: "Menu",
    close: "Close",
    footerNav: "Footer links",
    crumbs: "Breadcrumbs",
    home: "Home",
    tags: "Tags",
    why: "Why us",
    noWebgl: "This browser doesn't support WebGL.",
    lang: "Language",
    locale: "en-GB",
    days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
  },
};
