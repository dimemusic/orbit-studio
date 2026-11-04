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
    title: ["Turnkey websites", "for", "your business."],
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
    stack: {
      title: "Our tech stack.",
      lead: "What we use for design, websites and admin panels.",
      groups: [
        { title: "Design", items: [{ id: "figma", name: "Figma" }] },
        { title: "Development", items: [{ id: "nextjs", name: "Next.js" }, { id: "react", name: "React" }, { id: "typescript", name: "TypeScript" }, { id: "javascript", name: "JavaScript" }, { id: "tailwind", name: "Tailwind CSS" }, { id: "html", name: "HTML5" }] },
        { title: "Admin panel", items: [{ id: "sanity", name: "Sanity" }, { id: "wordpress", name: "WordPress" }, { id: "shopify", name: "Shopify" }] },
        { title: "Launch and services", items: [{ id: "vercel", name: "Vercel" }] },
      ],
    },
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
        short: "A catalogue with categories, ordering in a few clicks, and the owner updates prices herself.",
        tags: ["Design", "Next.js", "Sanity"],
        media: "/cases/maina.webp",
        shots: ["/cases/maina.webp"],
        full: { src: "/cases/maina-page.webp", w: 1440, h: 3874 },
        photo: "/cases/maina-mockup.webp",
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
        short: "A product catalogue and a quote request form so clients quickly find what they need.",
        tags: ["UI/UX", "Design"],
        media: "/cases/avtoban-hero.webp",
        shots: ["/cases/avtoban.webp", "/cases/avtoban-2.webp", "/cases/avtoban-3.webp"],
        full: { src: "/cases/avtoban-page.webp", w: 1440, h: 4646 },
        photo: "/cases/avtoban-mockup.webp",
        url: "https://avtoban-trailers.vercel.app/",
        status: "UI/UX",
        result: "[RESULT]",
        color: "#e5322d",
        accent: "cyan",
        task: "A clear website for a maker of sandwich panels and vans: products, services and a quick quote request.",
        done: ["Page structure and user flows", "Catalogue: vans, panels, trailers", "Service and upgrades section", "Responsive request form"],
        facts: [
          { label: "Time", value: "2 weeks" },
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
        short: "Video on the first screen, a project gallery and animations that present every house as an event.",
        tags: ["Design", "Next.js"],
        media: "/cases/biganskiy.webp",
        shots: ["/cases/biganskiy.webp"],
        full: { src: "/cases/biganskiy-page.webp", w: 1440, h: 7742 },
        photo: "/cases/biganskiy-mockup.webp",
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
        id: "zdorovo",
        name: "Zdorovo!",
        kind: "Mobile app website", // DRAFT
        type: "Landing page",
        did: ["UI design", "Responsive", "Development"], // DRAFT
        text: "Website for an app that scans a barcode and rates the product's ingredients at once. It explains how the score works, shows additives and allergens, and leads to the download.", // DRAFT
        short: "Barcode scanner with an ingredient score: how it works, additives, allergens and the download.",
        tags: ["Design", "Landing page"],
        media: "/cases/zdorovo.webp",
        shots: ["/cases/zdorovo.webp"],
        full: null, // TODO: full-page shot (1440 wide) so the card scrolls on hover
        photo: "/cases/zdorovo-mockup.webp",
        url: "https://zdorovo.app/",
        status: "Live",
        result: "[RESULT]",
        color: "#6a9a2f",
        accent: "green",
        task: "Explain in a few lines what the app does and bring people to download it.",
        done: ["Hero with a live score example", "«How it works» block", "Scoring method, additives and allergens", "App Store and Google Play buttons"],
        facts: [
          { label: "Type", value: "App website" },
          { label: "Language", value: "Ukrainian" },
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
    more: "Details",
    includes: "What's included",
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
    pages: {
      crumb: "Services",
      home: "Home",
      included: "What's included",
      process: "How we work",
      others: "Other services",
      about: "All about this service",
      priceLabel: "Price",
      termLabel: "Timeline",
      items: {
        card: {
          h1: ["Business card", "website design."],
          title: "Business card website, turnkey, from $400",
          description: "Turnkey business card website: design, mobile-friendly layout, request form and basic SEO. From $400, from 5 days. MaxArt Digital studio, Lviv, Ukraine.",
          intro: "A few pages about you and your services, so clients find you on Google, see your prices and leave a request right away. Design, development and launch, turnkey.",
        },
        landing: {
          h1: ["Landing page", "design."],
          title: "Landing page, turnkey, from $600",
          description: "Turnkey landing page: custom design, scroll animations, request form and analytics, fast loading. From $600, from 7 days. MaxArt Digital, Lviv, Ukraine.",
          intro: "One page for a product, service or ad campaign: a clear offer, benefits and a request form. Custom design, scroll animations and fast loading.",
        },
        shop: {
          h1: ["Online store", "development."],
          title: "Online store, turnkey, from $1000",
          description: "Turnkey online store: catalogue with filters, cart, payment and delivery, admin panel for products and prices. From $1000. MaxArt Digital, Lviv, Ukraine.",
          intro: "A catalogue with filters, cart, checkout, payment and delivery. You update products, prices and photos yourself in the admin panel, no developer needed.",
        },
        corp: {
          h1: ["Corporate website", "development."],
          title: "Corporate website, turnkey",
          description: "Corporate website development: sections for several lines of business, services or product catalogue, several languages and an admin panel. From $1200.",
          intro: "A site for a company with several lines of business: separate sections, a services or product catalogue, several languages and an admin panel for your team.",
        },
      },
    },
    quiz: {
      step: (i: number, n: number) => `Step ${i} of ${n}`,
      back: "Back",
      next: "Next",
      reset: "Reset answers",
      skip: "Skip and write in your own words",
      questions: [
        { id: "type", q: "What kind of site do you need?", short: "Type of site" },
        { id: "admin", q: "Who will update texts, prices and photos?", short: "Updates", options: ["We will, in an admin panel", "Rarely, we'll ask you"] },
        { id: "support", q: "Do you need support after launch?", short: "Support", options: ["Yes, monthly", "Not for now"] },
        { id: "when", q: "When do you want to launch?", short: "Launch", options: ["As soon as possible", "Within a month", "No rush"] },
      ],
      adminPrice: 200,
      supportPrice: 50,
      adminIncluded: "This type of site already includes an admin panel.",
      final: "Your request",
      change: "Change",
      estimate: "Rough price",
      perMonth: "/ mo",
      note: "Starting price from our price list. The exact amount is fixed after the brief.",
      free: "Your notes",
      freePh: "For example: we have a logo and photos, need online booking",
      from: "from",
    },
  },

  // keep the numbers in step with SERVICES.plans / extras above
  FAQ: {
    title: ["Frequently asked", "questions."],
    items: [
      { q: "How much does a website cost?", a: "Business card site from $400, landing page from $600, online store from $1,000, corporate website from $1,200. The exact amount is fixed after the brief." },
      { q: "How long does it take?", a: "Business card site from 5 days, landing page from 7 days, online store and corporate website from 14 days. We agree on the timing of every stage in advance." },
      { q: "Can I edit the site myself?", a: "Yes. We connect an admin panel: you change texts, prices, photos and products yourself, no developer needed. It is included in online stores and corporate websites and costs from $200 for other sites." },
      { q: "What happens after launch?", a: "We hand over every access and show you how to run the site. If you need support, it costs from $50 a month." }, // DRAFT
      { q: "Can I order design only?", a: "Yes. Design without development costs from $250, an admin panel for an existing site from $200." },
      { q: "What do you build with?", a: "Design in Figma, websites on Next.js, React and TypeScript, admin panels on Sanity, hosting on Vercel. The sites open fast on phones and are easy for Google to index." },
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
    channelLabel: "How do you prefer to talk?",
    channels: [
      { id: "telegram", label: "Telegram", field: "Your Telegram", ph: "@username or phone number", err: "Enter your @username (5 to 32 characters: Latin letters, digits, _) or phone number." },
      { id: "viber", label: "Viber", field: "Viber number", ph: "+380 67 123 45 67", err: "Enter a phone number, e.g. +380 67 123 45 67." },
      { id: "whatsapp", label: "WhatsApp", field: "WhatsApp number", ph: "+380 67 123 45 67", err: "Enter a phone number, e.g. +380 67 123 45 67." },
      { id: "email", label: "Email", field: "Your email", ph: "name@mail.com", err: "Enter an email, e.g. name@mail.com." },
    ],
    errNeeds: "Pick at least one option.",
    tgChecking: "Checking the Telegram username…",
    tgFound: "Telegram account found",
    tgMissing: "There is no such Telegram username. Check the spelling.",
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
    lead: "We only collect what you type into the request form, so we can reply. No ads, no tracking, no selling of data.",
    updated: "Updated October 31, 2026",
    sections: [
      {
        id: "who",
        title: "Who we are",
        body: [
          `The MaxArt Digital website belongs to [sole proprietor or company name, address] ("we"). We are the controller of the personal data you send through this site.`, // DRAFT
          `This policy follows the Law of Ukraine "On Personal Data Protection" and, for visitors from the EU, the EU General Data Protection Regulation (GDPR).`,
          "For any question about your data, write to hello@maxartdigital.com.",
        ],
      },
      {
        id: "data",
        title: "What data we receive",
        body: [
          "When you send the request form, we receive your name, the way you prefer to be contacted (Telegram, Viber, WhatsApp or email) and your username, phone number or email for our reply, the type of website, your answers to the form questions and the project description, if you wrote one. When you write to us on Telegram or by email, we receive what you sent, plus your messenger profile details or email address.",
          "When you open the site, the hosting automatically records technical request data: IP address, browser type and request time. These are standard server logs; we do not use them to identify you.",
          "We do not ask for or collect passwords, payment or other sensitive data. Providing data is voluntary, but without a name and a contact we cannot reply to you.",
        ],
      },
      {
        id: "purpose",
        title: "Why",
        body: [
          "We use the data to answer your request, clarify the task and prepare an offer, to talk about the project if we agree to work together, and to protect the site from spam and attacks.",
          "We send no newsletters, show no ads, do not sell data and do not share it for marketing.",
        ],
      },
      {
        id: "basis",
        title: "Legal basis",
        body: [
          "We process data based on your consent, which you give by sending the form or writing to us. The reply and the offer are prepared at your request before a contract. Technical logs are processed in our legitimate interest: security and stable operation of the site.",
        ],
      },
      {
        id: "share",
        title: "Who we share data with",
        body: [
          "We share data only with services the site and our correspondence cannot work without, and only as much as they need: Vercel (USA) for hosting, Resend (USA) for delivering requests to our inbox and our email provider ([country]) for storing the emails. These services work under standard contractual clauses on data protection.", // DRAFT
          "We share data with anyone else only when the law requires it.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep data",
        body: [
          "We keep requests and correspondence while we are talking or working together, but no longer than 3 years after the last contact. Hosting logs are kept for a limited time under Vercel's rules. At your request we delete data sooner, unless the law requires us to keep it.", // DRAFT: term
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        body: [
          "The site uses no cookies, analytics or ad trackers. The browser keeps only one technical value in sessionStorage so the intro plays once. It holds no personal data and is gone when you close the tab.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        body: [
          "You can find out what data of yours we hold, where it is stored and who it was shared with, get a copy, correct inaccurate data, delete it, restrict or object to its processing, and receive your data in a portable format or move it to another service. You can withdraw consent at any time: this does not affect processing that already took place.",
          "Write to hello@maxartdigital.com and we will reply within 30 days. You can also complain to the Ukrainian Parliament Commissioner for Human Rights (https://ombudsman.gov.ua), a court or the data protection authority of your EU country.",
        ],
      },
      {
        id: "security",
        title: "Security",
        body: ["The site runs over HTTPS only, and requests travel over an encrypted connection. Only our team has access to them."],
      },
      {
        id: "other",
        title: "Children and automated decisions",
        body: [
          "The site is not meant for children. If a child sent us their data, write to us and we will delete it.",
          "We make no automated decisions about you and build no profiles. A person reads every request.",
        ],
      },
      {
        id: "changes",
        title: "Changes",
        body: ["A new version of the policy will appear on this page with a new update date."],
      },
    ],
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
