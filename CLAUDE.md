# MaxArt Digital: website of our web studio

> One-page site, **Ukrainian** at `/`, **English** at `/en`. Values marked `// DRAFT` in `lib/content.ts` / `lib/content.en.ts` are placeholders (prices, terms, contacts, case texts): replace before launch.
> UI forked from Cloud Sphere (`~/Desktop/cloudsphere-site`, never edit the original).

## What it is
We sell design, website development and admin panels, ideally as one package. **The site's job is to sell**: in seconds a visitor should feel we are skilled, have taste and can be trusted.

## Stack and commands
- Next.js 15 (App Router) + TypeScript + Tailwind v4 (tokens in `app/globals.css`, `@theme inline`). Deploy: Vercel (`maxart-digital`), every push to `master` deploys.
- Star background is plain WebGL (`components/StarField.tsx`, no 3D library: three / r3f were removed in Oct 2026 for speed, do not bring them back). UI motion is CSS + IntersectionObserver; no animation libs.
- Icons: `@phosphor-icons/react/dist/ssr`, light weight. Images via `next/image`.
- `npm run dev` · `npm run build` · `npm run lint` (ESLint, next/core-web-vitals + typescript) · `npm run typecheck`. Keep lint and `npx tsc --noEmit --noUnusedLocals` clean.
- Env (`.env.example`): `RESEND_API_KEY`, `CONTACT_TO`, optional `CONTACT_FROM` (contact form → email), `NEXT_PUBLIC_SITE_URL` (canonical / sitemap origin).

## Structure
- `app/(uk)/layout.tsx` (`/`, `/privacy`) and `app/(en)/layout.tsx` (`/en`, `/en/privacy`): two root layouts, both render `components/Shell.tsx` (html lang, head boot script, Ambient + StarField background, Nav, main, Footer, RevealRoot, CardFx, `LangProvider`). Pages: `components/HomePage.tsx`, privacy = `PageHero` with placeholder text. Also `app/api/contact/route.ts`, `app/robots.ts`, `app/sitemap.ts`.
- **Copy**: all of it in `lib/content.ts` (uk) and `lib/content.en.ts` (en, typed `Content`, same shape). No copy in components; new copy goes into BOTH files. Components read it with `useContent()` / `useLang()` (`components/Lang.tsx`), server code with `contentFor(lang)` (`lib/i18n.ts`). Small UI strings, locale and plural days live in `UI`.
- Home order: Hero (`top`) → `Build` («Як ми працюємо», `process`) → `Work` (`work`) → `Pricing` (`services`) → `FinalCta` (`contact`). `NAV` and `HOME_SECTIONS` list only these. `About.tsx`, `Faq.tsx` and `ui/HomeSection.tsx` are parked (not rendered): bring back only when asked. About, admin-panel demo, Team and Guarantees were removed on purpose (too much decoration, too little information).
- Cross-section event: `PACKAGE_PICK` (`components/home.ts`): «Обрати» on a pricing row → the contact chip of that website type (`CONTACT.chips[i]` = `SERVICES.plans[i]`, last chip «Інше»).

## Sections
- **Hero** (`Hero.tsx`, `Logos.tsx`): promise in `text-mega` (accent violet), lead, «Обговорити проєкт» + «Наші роботи», count-up stats line.
- **Build** (`sections/Build.tsx` = player, intro card, rolling stage titles, `Stages`; parts in `components/build/`: `shared.tsx` timeline / `PROD` rects / `handover` / `beatsOf` / motion blur / `fly` / `box` / `Visual` / `useB`, `Product.tsx` the product frame, `Stage.tsx` scaling + phone crop + `useFit`, `Design.tsx`, `Code.tsx`, `Cms.tsx`, `IPhone.tsx` phone parts, `Launch.tsx`, `util.tsx` easing + `Typed`): a ~15s self-playing film (plays when ≥45% in view, pauses off screen, loops). Each lap: title card `IntroCard` («Що ми робимо?», `INTRO` = 1.3s) → 4 stages design → code → CMS → launch → held final frame `HOLD` = 5s. Fixed 1200×620 stage scaled to fit; every stage uses the band y 20..580.
  - **One product through the film** (Oct 2026): the mock site is ONE frame (`Product.tsx`, rects `PROD`): Figma artboard → live preview beside the code → phone (the frame grows a titanium rim, bezel and buttons) → browser. Between stages it slides and reshapes while its screen cross-fades from one stage's `*Screen` component to the next (each stage file exports `XStage` = tools and `XScreen` = what is on the product). The designer still drags the artboard open (`designFrame`).
  - **The page is never rebuilt, only improved**: every screen renders the SAME designed page (`DesignScreen`, 480 × 560). Code: it sits in the browser (scaled), each block starts as the washed-out mock with a dashed outline and turns real when its line is typed (`BLOCKS` → code line, green flash). CMS: the phone shows the same site's phone layout, scrolled to the plans; the form edits the existing «Стандарт» plan (old price selected and typed over with a sale price, new photo, description, in stock) and the card takes each edit live. Launch: the same page with those edits (`ALL_EDITS`) on the domain, scaled to the browser and centred.
  - **No empty beats**: hand-over windows (`HAND`) overlap: the outgoing stage's tools fade early with a small drift and are drawn UNDER the product, the incoming ones whip in above it; the H1 rolls (old letters lift away while the new ones rise in the same cell).
  - **Finale** (the held frame, `hold` seconds): «Онлайн» rolls into a live visitor count, a visitor's cursor clicks the hero button, and three toasts arrive (first visitor, request, order: `BUILD.launch.events`). Reduced motion shows this finished frame at once.
  - **Film UI kit** (Oct 2026): `.tool` panels (opaque, light top edge, dark outer hairline, deep shadow), `.tool-cell` inputs / values, `.tool-label` section labels (globals.css); the mock site has its own header `MockNav` and browser chrome `BrowserBar` (shared.tsx), the product shot `Visual` is studio-lit with gradient contact shadows (no SVG filters). The code stage is a real editor panel: file tabs + branch, the typed line lit, the terminal docked at the bottom.
  - Design = Figma multiplayer scene (three cursors `Mate` with selections `Sel`, two sidebars `LS`/`RS` of `.tool` panels, floating toolbar); code = editor + terminal; CMS = product form + history + toast; launch = checklist (`CHECK`, `DONE`). Entrances `expo`, moves `smooth`, typing `Typed`; state changes tweened. The mock site uses the neutral brand `BUILD.brand` («Your product»), visuals are the inline `Visual` SVG. A grid on the background is allowed here. No camera zooms (tried, looked jerky).
  - **Phones and tablets (< 64rem)**: each stage crops to ONE focus rect (`FOCUS`: artboard, editor + terminal, product form, browser) scaled to the box width (capped at 58% of the viewport height, box height follows the stage), clipped (`StageLayer` + `FitCtx`), pinned under the title, then a note (`BUILD.stages[i].note`, «0N / 04»). There the product is drawn inside each stage's own layer (`ProductAt`), no morph. Desktop untouched.
  - The stage renders only after the client measured it (keeps float-heavy inline styles out of SSR: no hydration mismatch) AND the visitor showed signs of life (pointer / touch / wheel / scroll / key) or the box is already on screen: the heavy stages stay out of the initial load (`StageBox`, `awake`). Reduced motion: final frame at once.
- **Work** (`Work.tsx`): 4 case cards (2 on md, 1 on phones): browser-bar frame with the full-page screenshot (`full`: 720px wide webp in `public/cases/*-full.webp`, stitched from viewport shots) and a site-type pill, name + kind, short text, tags, full-width «Переглянути». Hover (fine pointer): the screenshot scrolls inside the frame (`.work-scroll`, `--fh`, `--dur`). Click opens the case `<dialog>` (cover in `DeviceShot`). `full: null` → static cover.
- **Pricing** (`Pricing.tsx`): prices by website type in USD (`SERVICES.plans`): 4 rows on hairlines (icon, name, who it is for, included pills, «від $N» + term, «Обрати»), the hot plan (Лендинг) gets a blue stripe, faint tint, «Рекомендуємо» and the primary button; one line of `extras` under the list. Included pills hide on desktop screens under 52rem tall.
- **FinalCta** (`FinalCta.tsx`): title + lead + direct contacts, and the form in one `.card` (two columns from xl, stacked below; centred pair from `wide:`). Chips = website types + «Інше», free multi-select, none picked by default. Honeypot field `website`. `POST /api/contact` → Resend; without keys it answers 503 and the form points to Telegram / email.
- **Scrolling is native** (Oct 2026: the section-by-section wheel snap was removed, it felt jerky and low-fps). Do not add scroll hijacking, smooth-scroll libraries or CSS scroll-snap.

## Design system
### Hard rules
- **Never use the Unbounded font.** Font: Geologica (next/font, Latin + Cyrillic), display 600 with negative tracking.
- **No arbitrary breakpoints** (`min-[1100px]:` sorts before `md:`). Use rem breakpoints from `@theme`: `xs` 25rem, `nav` 68.75rem, `wide` 90rem (plus Tailwind's).
- No max-width container: sections are full-bleed with `px-gutter` (clamp(24px, 5.5vw, 80px)); only text measures are limited.
- Dark only. The star canvas covers the whole viewport; no vignette, overlay, frame or opaque section background on top of it.
- **No gradients** (Oct 2026): key words in headings are one solid colour per section via `<G tone>` (`--tc`): hero / intro / pricing violet `#a78bfa`, Build intro + contact turquoise `#2dd4bf`, work coral `#fb7185` (class `tg-amber`). `.card-pro` border and the intro underline are solid blue.

### Banned
Eyebrow pills above headings («NN · Назва»), HUD / mono / coordinate labels, glowing or animated borders, coloured glow blobs, grey-filled or fully transparent cards, any surface utility other than `.card`, light beams, scanlines, noise, grid or dot backgrounds (except the Build film), corner brackets, fake terminal UI outside the Build film, white buttons, em dashes in copy.

### Tokens
- Colours: bg `#05070d`, fg `#f5f7fa`, body `#c4cad4`, grey `#8b919c`, faint `#5b616c`, hairline `rgba(255,255,255,.09)`. Accents: blue `#3d8bff` (links, accents), cyan `#22d3ee`, violet `#8b5cf6` (`violet-soft #a78bfa`), green `#34d399` (`components/ui/accent.ts`).
- Type: `text-mega` (clamp(44px, 6vw, 104px)) for the hero and every big section title · `text-display` inner pages · `text-headline` · `text-title` · `text-lead`.
- Surfaces: one `.card` utility for every card and panel (`.card-nav` for the navbar, `.card-pro` blue border). Glass blur only outside `<main>`. Pills: ≥12px, 6px 12px, coloured text on a 12% tint. Headings on the stars use `.legible` / `.plate`.
- Buttons (`ui/Button.tsx`): primary 64px (lg) / 48px (nav), background `#2a6fe8` (a shade deeper than `--blue` so white text passes WCAG AA), hover violet `#7c3aed`, big primaries share a min width; secondary transparent + hairline. Main CTA «Обговорити проєкт» → `#contact`.

### Motion
`[data-reveal]` fade + 24px slide (one `RevealRoot` observer, stagger `--d`); section titles use `RevealWords` (words rise out of a blur). Counters and micro-UIs run once on entering view (`useInView`). Everything shows its final state under `prefers-reduced-motion`.

### Cards (`ui/CardFx.tsx`)
Spotlight / border light on interactive cards, fine pointers only. **Never set `opacity < 1`, `filter` or `mask` on a `.card` or its ancestors** (kills the glass): fade content inside the card instead.

## Background
- `components/StarField.tsx` (client only via `Scene.tsx`; raw WebGL: one program, one `drawArrays(POINTS)`, its own small matrix helpers; clears to `#05070d` in linear light = the deep black it always had) + `lib/stars.ts` + `lib/starShaders.ts` (the head declaring `modelMatrix` / `viewMatrix` / `projectionMatrix` / `position` is prepended in StarField): one screen of additive star sprites, generated for the viewport (regenerated by `stale`: width ±20%, the view wider than the field or much narrower, camera distance or star budget changed; the phone budget goes by width / touch, never by height, so a low desktop window keeps the full field). The shader scrolls the stars with the page (nearer = faster, same frame, no easing: an eased lag made the background trail the content) and wraps them vertically. Hover brightens nearby stars, a click on the background sends an impulse wave, gentle drift + pointer tilt. Below the hero the stars only **dim** (`uDim`) and the wrapper's opacity drops: never enlarge the sprites (additive overdraw made the site slow).
- `components/Ambient.tsx`: page colour + two soft colour washes (transform-only drift) whose tint follows the section on screen.
- The ivy / neuron scene of the original was removed (Oct 2026); `reference/ivy-scene.html` is the old prototype.

## SEO
- Page metadata via `pageMetadata(lang, path, opts)` (`lib/seo.ts`): title / description from `META` in the content files (title ≤ 60 chars, description ≤ 160), canonical, hreflang uk / en / x-default (= uk), Open Graph + Twitter `summary_large_image` with `public/og-uk.png` / `og-en.png` (1200×630; redraw them if the brand or promise changes). `shellMetadata` in Shell only sets metadataBase, title template and app name.
- `components/JsonLd.tsx` (rendered by `HomePage`): schema.org `ProfessionalService` + offer catalogue from `SERVICES.plans`, plus `WebSite`. Built from content, so prices stay in sync.
- Privacy pages are `noindex` and left out of `app/sitemap.ts` until the real policy text is in. `app/manifest.ts`, `app/apple-icon.png`, `public/icon-512.png`.
- Case images carry descriptive `alt`. One `h1` per page (hero).

## Performance
- No CSS `filter` / `backdrop-filter` on full-screen layers. Background motion is transform-only on its own layers.
- WebGL: DPR ≤ 1.5, no MSAA (it tripled the first frame on GPU-less devices / PageSpeed); instead the vertex shader keeps every sprite ≥ 3 device px with alpha scaled by its area, so tiny stars glide instead of snapping pixel to pixel (that snapping made the page look like it shakes). Render loop paused while the tab is hidden, no allocations per frame.
- The hero is the LCP: its copy is server-rendered with `data-in` and shows when the boot ends, never waiting for hydration or WebGL. Below-the-fold heavy UI (the Build film) mounts on first interaction.
- Lighthouse (Oct 2026, after these changes, local headless): mobile 80 / desktop 89, TBT 430 / 220 ms; real PageSpeed runs higher (it has a GPU). Re-check pagespeed.web.dev after big changes.
- Build film: motion blur only on big moving elements (≥ `BIG_BLUR`) and off entirely when DPR > 1.5 or ≤ 4 CPU cores (`MB`); static parts are `memo`ised.

## Hard rules learned from bugs (do not undo)
- RevealRoot marks shown elements with the `data-in` ATTRIBUTE (CSS `.js [data-reveal][data-in]`), never a class.
- Never run `npm run build` while the dev server runs (corrupts `.next`); use `npx tsc --noEmit`.
- SVGs with `preserveAspectRatio="none"` need an explicit height. Line draw-ins use `clip-path` / `scaleX`, not `stroke-dasharray`.
- Boot: `html.booting` (head script) hides stars (`.scene-fade`), ambient, nav and any copy without a reveal (`[data-boot]`: section leads, the pricing extras line, the Work «more» link, the whole Build section; put it on a wrapper, its opacity transition overrides the element's own), `.plate` halos and revealed copy until the star field rendered two frames or the head script's deadline (0.9s; 2.0s with the intro), then all fade in together. The stars themselves only show once they rendered (`.scene-fade[data-on]`), so on a slow device the copy comes first and the stars fade in a moment later.
- Intro: the first load of a tab session (sessionStorage `intro`) plays a CSS-only «MaxArt Digital» title card (`Intro.tsx`, `.intro-*`); `window.__introEnd` = 2000 makes the boot wait for it. Skipped under reduced motion.
- Sharpness: the Build stage is scaled with `transform: scale(k)`; never leave a permanent `will-change`, `translate3d` or `filter` on settled elements inside it (Chrome freezes the raster at 1×).

## Rules
- Never invent numbers, prices, testimonials or facts: use `[PLACEHOLDERS]` / `// DRAFT`.
- Responsive: check 320 / 375 / 768 / 1024 / 1440 / 1920, no horizontal scroll.
- Accessibility: real `<button>` / `<a>` / `<label>`, text contrast ≥ 4.5:1 (axe clean), `aria-label` on icon buttons, visible focus.
- Work only inside this folder. After changes `npm run build` must pass; end with a short report.
