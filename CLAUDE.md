# MaxArt Digital: website of our web studio

> One-page site, **Ukrainian** at `/`, **English** at `/en`. Values marked `// DRAFT` in `lib/content.ts` / `lib/content.en.ts` are placeholders (prices, terms, contacts, case texts): replace before launch.
> UI forked from Cloud Sphere (`~/Desktop/cloudsphere-site`, never edit the original).

## What it is
We sell design, website development and admin panels, ideally as one package. **The site's job is to sell**: in seconds a visitor should feel we are skilled, have taste and can be trusted.

## Stack and commands
- Next.js 15 (App Router) + TypeScript + Tailwind v4 (tokens in `app/globals.css`, `@theme inline`). Deploy: Vercel (`maxart-digital`), every push to `master` deploys.
- three + @react-three/fiber for the star background only. UI motion is CSS + IntersectionObserver; no other animation libs.
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
- **Build** (`Build.tsx`): a ~14s self-playing film (plays when ≥45% in view, pauses off screen, loops). Each lap: title card `IntroCard` («Що ми робимо?», `INTRO` = 1.3s) → 4 stages design → code → CMS → launch with whip transitions, a big typed H1 per stage, final frame held `HOLD` = 5s. Fixed 1200×620 stage scaled to fit; every stage uses the band y 20..580. Design = Figma multiplayer scene (three cursors `Mate` with selections `Sel`, two sidebars `LS`/`RS` of `.tool` panels, floating toolbar); code = editor + terminal + preview; CMS = product form + history + toast + `IPhone`; launch = checklist (`CHECK`, `DONE`) + browser with «Онлайн» pill. Entrances `expo`, moves `smooth`, typing `Typed`; state changes tweened. The mock site uses the neutral brand `BUILD.brand` («Your product»), visuals are the inline `Visual` SVG. A grid on the background is allowed here. No camera zooms (tried, looked jerky).
  - **Phones and tablets (< 64rem)**: each stage crops to ONE focus rect (`FOCUS`: artboard, editor + terminal, product form, browser) scaled to the box width (capped at 58% of the viewport height, box height follows the stage), clipped (`StageLayer` + `FitCtx`), pinned under the title, then a note (`BUILD.stages[i].note`, «0N / 04»). Desktop untouched.
  - The stage renders only after the client measured it (keeps float-heavy inline styles out of SSR: no hydration mismatch). Reduced motion: final frame at once.
- **Work** (`Work.tsx`): 4 case cards (2 on md, 1 on phones): browser-bar frame with the full-page screenshot (`full`: 720px wide webp in `public/cases/*-full.webp`, stitched from viewport shots) and a site-type pill, name + kind, short text, tags, full-width «Переглянути». Hover (fine pointer): the screenshot scrolls inside the frame (`.work-scroll`, `--fh`, `--dur`). Click opens the case `<dialog>` (cover in `DeviceShot`). `full: null` → static cover.
- **Pricing** (`Pricing.tsx`): prices by website type in USD (`SERVICES.plans`): 4 rows on hairlines (icon, name, who it is for, included pills, «від $N» + term, «Обрати»), the hot plan (Лендинг) gets a blue stripe, faint tint, «Рекомендуємо» and the primary button; one line of `extras` under the list. Included pills hide on desktop screens under 52rem tall.
- **FinalCta** (`FinalCta.tsx`): title + lead + direct contacts, and the form in one `.card` (two columns from xl, stacked below; centred pair from `wide:`). Chips = website types + «Інше», free multi-select, none picked by default. Honeypot field `website`. `POST /api/contact` → Resend; without keys it answers 503 and the form points to Telegram / email.
- **Snap scrolling** (`SectionSnap.tsx`): full-screen sections carry `.snap-section`; one wheel / key step moves one section (desktop fine pointer only, rAF tween with `scroll-behavior: auto` while it runs). A section taller than the screen scrolls natively until its edge. Never use CSS scroll-snap (it bounced back).

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
- `components/StarField.tsx` (client only via `Scene.tsx`) + `lib/stars.ts` + `lib/starShaders.ts`: one screen of additive star sprites, generated for the viewport (regenerated only when the width changes > 20%). The shader scrolls the stars with the page (nearer = faster) and wraps them vertically. Hover brightens nearby stars, a click on the background sends an impulse wave, gentle drift + pointer tilt. Below the hero the stars only **dim** (`uDim`) and the wrapper's opacity drops: never enlarge the sprites (additive overdraw made the site slow).
- `components/Ambient.tsx`: page colour + two soft colour washes (transform-only drift) whose tint follows the section on screen.
- The ivy / neuron scene of the original was removed (Oct 2026); `reference/ivy-scene.html` is the old prototype.

## Performance
- No CSS `filter` / `backdrop-filter` on full-screen layers. Background motion is transform-only on its own layers.
- WebGL: DPR ≤ 1.5, render loop paused while the tab is hidden, no allocations inside `useFrame`.
- Build film: motion blur only on big moving elements (≥ `BIG_BLUR`) and off entirely when DPR > 1.5 or ≤ 4 CPU cores (`MB`); static parts are `memo`ised.

## Hard rules learned from bugs (do not undo)
- RevealRoot marks shown elements with the `data-in` ATTRIBUTE (CSS `.js [data-reveal][data-in]`), never a class.
- Never run `npm run build` while the dev server runs (corrupts `.next`); use `npx tsc --noEmit`.
- SVGs with `preserveAspectRatio="none"` need an explicit height. Line draw-ins use `clip-path` / `scaleX`, not `stroke-dasharray`.
- Boot: `html.booting` (head script) hides stars (`.scene-fade`), ambient, nav (`[data-boot]`), `.plate` halos and revealed copy until the star field rendered two frames (safety timeout 1.8s), then all fade in together.
- Intro: the first load of a tab session (sessionStorage `intro`) plays a CSS-only «MaxArt Digital» title card (`Intro.tsx`, `.intro-*`); `window.__introEnd` = 2000 makes the boot wait for it. Skipped under reduced motion.
- Sharpness: the Build stage is scaled with `transform: scale(k)`; never leave a permanent `will-change`, `translate3d` or `filter` on settled elements inside it (Chrome freezes the raster at 1×).

## Rules
- Never invent numbers, prices, testimonials or facts: use `[PLACEHOLDERS]` / `// DRAFT`.
- Responsive: check 320 / 375 / 768 / 1024 / 1440 / 1920, no horizontal scroll.
- Accessibility: real `<button>` / `<a>` / `<label>`, text contrast ≥ 4.5:1 (axe clean), `aria-label` on icon buttons, visible focus.
- Work only inside this folder. After changes `npm run build` must pass; end with a short report.
