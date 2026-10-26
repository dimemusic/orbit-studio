// English copy: the same shape as the Ukrainian `uk` in lib/content.ts (typed as Content, so nothing can go missing).
// `// DRAFT` values mirror the Ukrainian placeholders: replace both before launch.
import type { Case, Content, Service } from "./content";

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
    title: "MaxArt Digital · digital solutions for your business",
    description: "Design and development studio in Lviv, Ukraine: design, website and admin panel as one turnkey package, from one team.",
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
    lead: "Design, development and an admin panel from one team. You get a website you can edit yourself.",
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
    visit: "Open the website",
    close: "Close",
    taskLabel: "Task",
    doneLabel: "What we did",
    cases: [
      {
        id: "maina",
        name: "Maina by Rivka",
        kind: "Ready-meal and frozen food shop", // DRAFT
        did: ["UX and structure", "UI design", "Next.js development", "Sanity admin"], // DRAFT
        text: "A shop for frozen and ready meals with delivery across Ukraine. The owner updates products and prices herself in the admin panel.", // DRAFT
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
        did: ["UX structure", "UI design", "Product catalogue", "Request form"], // DRAFT
        text: "Website for a manufacturer of sandwich panels, vans and trailers.", // DRAFT
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
        did: ["Art direction", "UI design", "Animations", "Development"], // DRAFT
        text: "A stylish studio of futuristic houses: a portfolio website that shows off every project.", // DRAFT
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
        did: ["Illustrated style", "UI design", "Responsive", "Development"], // DRAFT
        text: "A landing page for a home bakery: menu, orders and a warm cartoon style.", // DRAFT
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
    lead: "Order separately or save with the full package.",
    pricePrefix: "from",
    currency: "₴",
    add: "Add",
    added: "Added",
    listLabel: "Services",
    package: "Your package",
    total: "Total",
    term: "Time:",
    empty: "Pick services on the left",
    remove: "Remove",
    save: "you save",
    items: [
      {
        id: "design",
        name: "Design",
        blurb: "A layout that looks premium and leads to requests.",
        price: 12000, // DRAFT
        days: [5, 7], // DRAFT
        color: "violet",
        icon: "design",
        features: ["Structure and prototype", "Desktop + mobile", "UI kit and styles", "Animations"], // DRAFT
      },
      {
        id: "dev",
        name: "Development",
        blurb: "A fast responsive website on a modern stack.",
        price: 18000, // DRAFT
        days: [7, 10], // DRAFT
        color: "blue",
        icon: "code",
        features: ["Next.js", "Responsive", "Speed and SEO", "Domain and hosting"], // DRAFT
      },
      {
        id: "cms",
        name: "Admin panel",
        blurb: "Change texts, prices, photos and products yourself.",
        price: 8000, // DRAFT
        days: [3, 5], // DRAFT
        color: "cyan",
        icon: "cms",
        features: ["Sanity CMS", "Edit from your phone", "Schemas for your content", "Training"], // DRAFT
      },
    ] satisfies Service[],
    turnkey: {
      name: "Full package",
      price: 32000, // DRAFT
      term: "from 2 weeks", // DRAFT
      perks: ["3 rounds of revisions", "1 month of support after launch"], // DRAFT
    },
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
    chips: ["Full package", "Design", "Development", "CMS"],
    submit: "Send",
    availability: "Now booking projects for November", // DRAFT
    sending: "Sending…",
    errName: "Tell us how to call you.",
    errContact: "Enter your Telegram (@username) or email.",
    errNeeds: "Pick at least one service.",
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
      { id: "design", title: ["We draw", "the design."], step: "Design", days: "3–5 days", color: "#a78bfa" }, // DRAFT: days
      { id: "code", title: ["We write", "the code."], step: "Development", days: "5–7 days", color: "#5aa2ff" }, // DRAFT: days
      { id: "cms", title: ["We connect", "the admin."], step: "Admin panel", days: "2–3 days", color: "#22d3ee" }, // DRAFT: days
      { id: "launch", title: ["We launch", "the site."], step: "Launch", days: "1 day", color: "#34d399" }, // DRAFT: days
    ],
    replayNote: "Total: from 2 weeks", // DRAFT
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
      nav: ["Product", "Pricing", "Contact"],
      login: "Start",
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
      crumb: "Plans / New",
      form: "New product",
      draft: "Draft",
      name: "Name",
      nameVal: "Standard",
      max: 60,
      slug: "your-product.com/standard",
      price: "Price",
      priceVal: "1 990",
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
      log: ["Name changed", "Price updated", "Photo uploaded", "Published"],
      now: "just now",
      tags: ["New", "Hit"],
      buy: "Buy",
    },
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
