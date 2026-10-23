# MaxArt Digital — website for our web studio (UI forked from Cloud Sphere)

> Studio name: **MaxArt Digital** (renamed from the working name Orbit.studio). All site copy is in **Ukrainian**.
> Values marked `// DRAFT` in `lib/content.ts` are invented placeholders (prices, terms, team, contacts, case texts): replace before launch.
> Forked from `~/Desktop/cloudsphere-site` (restore point: first commit «Fork of Cloud Sphere»). Never edit the original.

## What it is
A one-page site for our studio. We sell design, website development and admin panels (CMS), ideally all as one turnkey package.
**The site's job is to sell.** A visitor should feel in seconds that we are skilled, have taste and can be trusted.

## Visual rule: KEEP the Cloud Sphere UI 1:1
The visual language is the Cloud Sphere one and does not change: layout, the 3D particle (ivy) background, the glass `.card` surfaces, typography, gradients, animations, button / CTA styles. New sections are **composed from existing components and styles** (`HomeSection`, `.card`, `.card-pro`, `Eyebrow`, `G`, `Tag`, `IconTile`, `Button`, the stepper, the accordion, `[data-reveal]`). **No new visual language.**

## Stack
- Next.js (App Router) + TypeScript + Tailwind v4 (tokens in `app/globals.css`, exposed via `@theme inline`). Deploy target: Vercel.
- three + @react-three/fiber for the background scene. No other 3D/animation libs unless asked; UI motion is CSS + IntersectionObserver.
- Icons: `@phosphor-icons/react` (`/dist/ssr`), `light` weight, used sparingly. Images via `next/image`.
- **All copy lives in one file: `lib/content.ts`** (Sanity CMS comes later). Components import from it; no copy in components.

## Design system (inherited, do not change)

### Hard rules
- **Never use the Unbounded font.** Font: **Geologica** (next/font, Latin + Cyrillic). Display weight 600 with negative tracking.
- **Never use arbitrary px breakpoints** (`min-[1100px]:`): Tailwind v4 sorts them before `md:`/`lg:`. Add a rem breakpoint to `@theme` (`nav:` = 1100px, `wide:` = 1440px).
- **No max-width container.** Every section is full-bleed with side padding `--gutter` = clamp(24px, 5.5vw, 80px) (`px-gutter`). Since Oct 2026 the home content block below the hero is full width too (no 1120px cap); only text measures are limited.
- Case previews are never flat screenshots: use `components/ui/DeviceShot.tsx` (screenshot on a monitor / laptop in perspective, glare, screen light spill; follows the pointer via `data-tilt-inner` on the card).
- The 3D canvas always covers the whole viewport (`fixed left-0 top-0 h-lvh w-screen`). **No vignette, overlay, frame or opaque section background** on top of it.
- Dark only.

### Banned
HUD / mono / coordinate labels, glowing or animated borders, coloured glow blobs, grey-filled or fully transparent cards, any surface utility other than `.card`, light beams, scanlines, noise, grid or dot backgrounds, corner brackets, fake terminal UI, white buttons, em dashes in copy.

### Tokens (app/globals.css)
- Colours: bg `#05070d` (= scene clear colour), fg `#f5f7fa`, **body `#c4cad4`** (paragraphs over the scene), grey `#8b919c` (small meta inside surfaces), faint `#5b616c`, hairline `rgba(255,255,255,.09)`.
- Accents: **blue `#3d8bff`** primary (buttons, links). Category colours: **cyan `#22d3ee`**, **violet `#8b5cf6`** (small text `violet-soft #a78bfa`), **green `#34d399`**. Class map in `components/ui/accent.ts`.
- Type scale: `text-mega` home hero only · `text-section` every other home heading (max 2 lines) · `text-display` inner pages · `text-headline` · `text-title` · `text-lead`.
- Key words in headings: 1–2 per heading with `<G tone="…">` (`.text-gradient`). Hero / contact use the brand aurora; each section keeps its own tone (work aurora, about mind, services fresh, admin calm, process ice, team warm, guarantees shield, FAQ soft). Do not unify them.
- Surfaces: **one `.card` utility for every card and panel** (dark frosted glass, `backdrop-filter: blur(40px) saturate(140%)`, 1px `rgba(255,255,255,.08)` border, radius 16px). `.card-nav` navbar variant. `.card-pro` = blue → cyan gradient border (used for the turnkey package).
- Pills / badges / tags / eyebrows: ≥12px, padding 6px 12px, coloured text on a 12% tint.
- Readability: every heading + intro on particles sits in a **`.plate`** and uses `.legible`.
- Buttons (`components/ui/Button.tsx`): **primary** blue, 64px tall (lg) / 48px (nav); **secondary** transparent + hairline. Every CTA is «Обговорити проєкт» → `#contact`.

### Motion
`[data-reveal]` fade + 24px slide (single `RevealRoot` observer, stagger with `--d`), word-by-word manifesto, autoplay stepper (admin demo), process line draw, counters / micro-UIs run **once** on entering view (`useInView`, `components/ui/hooks.ts`). Everything shows its final state under `prefers-reduced-motion`.

### Card interaction layer (`components/ui/CardFx.tsx`)
Fine pointers only, interactive cards only (the card is or contains a button / link / input). Writes `--mx/--my/--spot` for the spotlight + border light. Put `data-reveal` on a wrapper, not on a tilted card. **Never set `opacity < 1`, `filter` or `mask` on a `.card` or its ancestors** (kills the glass blur): cross-fade content *inside* a card, slide floating cards with transform + visibility.

## 3D scene: growing ivy (must keep)
Scene code: `components/IvyScene.tsx`, `lib/ivy.ts` (generator), `lib/ivyShaders.ts`; client-only via `components/Scene.tsx`. Reference prototype: `reference/ivy-scene.html`.
- Fixed full-screen canvas behind content (`z-0`, `pointer-events: none`, listeners on `window`), additive blending, rendered `linear flat`.
- Generated after layout (fonts + one frame, regenerated once when the page height settles), regenerates on width changes > 20%, one ivy per route.
- Camera follows scroll 1:1; growth front just below the bottom edge, one-way. Hero dust field morphs into the ivy roots over the first screen.
- Hover brightens nearby particles (no displacement). Click on background sends an impulse wave. Gentle sway, pointer tilt, twinkle. Reduced motion: no sway, instant growth. DPR capped at 2.
- Ivy look = 1px quiet lines, brightness carried by the particles. Don't brighten or thicken the lines.
- **Case nodes** (fine pointers only): `Work` places 4 `[data-case-node]` anchors in its side margins; IvyScene snaps each to the nearest ivy particle (branch depth ≤ 2), projects it to the screen every frame and moves a DOM marker (`CaseNodes`, fixed overlay `z-[3]`, `aria-hidden`). Cursor within 40px → glass preview of that case; click → scrolls to its card. Hovering a case card dispatches `CASE_HOVER` (`components/home.ts`) and lights its node; the shown case gets `data-hot` on its card. Nodes appear only where the side margin is ≥ ~70px (≈ ≥1264px wide); the Work cards carry the same info accessibly.

## Background decision (Oct 2026, overrides the ivy notes above)
The ivy / neurons are OFF site-wide. `IvyScene` only renders the hero dust field as stars (morph locked at 0, no ivy points/lines, no case nodes) and its canvas fades out after the first screen. Below the hero the calm `Ambient` layer shows: page colour + two very soft drifting colour washes whose tint follows the section on screen (`components/Ambient.tsx`, `.ambient` in globals.css). This replaces the "no coloured glow" rule for the background only.

## Structure decision (Oct 2026)
About, the admin-panel demo, Team and Guarantees were removed on purpose: too much decoration, too little information. Do not bring them back unless asked. Icons: one glyph per idea via `components/ui/icons.tsx` (`Icon name="brief|design|code|cms|launch"`) inside `IconTile`.

## App structure
- `app/layout.tsx`: `Scene`, `Nav`, `<main id="main">`, `Footer`, `RevealRoot`, `CardFx`. Pages render only their sections.
- Routes: `/` (one-page site) and `/privacy` (`PageHero` with placeholder text).
- Home order and labels: `HOME_SECTIONS` in `lib/content.ts` (re-exported by `components/home.ts`). Every section after the hero uses `components/ui/HomeSection.tsx` (pill «NN · Label» → heading → one line → ONE content block, max 1120px). `SectionProgress` pill follows scroll.

| # | Section (file) | id | Content |
|---|---|---|---|
| 01 | Hero (`Hero.tsx` + `Logos.tsx`) | `top` | promise in mega type, lead, «Обговорити проєкт» + «Наші роботи», availability pill + 4 trust points |
| 02 | Work (`Work.tsx`) | `work` | endless marquee of project names (click → its slide), then desktop: pinned horizontal showcase (vertical scroll slides projects in, parallax via `--o`, counter + progress); phones: swipe carousel with snap. Slides open the case window (native `<dialog>`) |
| 03 | Services (`Pricing.tsx`) | `services` | 3 service cards with «Додати» toggles + live estimate bar; all three = «Під ключ» (`.card-pro`) with saving |
| 04 | Process (`Process.tsx`) | `process` | 5 steps with icons + durations on a drawn progress line, total under it |
| 05 | About (`About.tsx`) | `about` | 2 people (photo or initials) + 3 promises row |
| 06 | FAQ (`Faq.tsx`) | `faq` | 6 questions, accordion |
| 07 | Contact (`FinalCta.tsx`) | `contact` | Telegram / email panel + form (name, contact, message, chips) → `POST /api/contact` → email via Resend (`RESEND_API_KEY`, `CONTACT_TO`, see `.env.example`) |

## Content that sells (brief)
- **Hero:** one concrete promise. Direction: «Сайти, які продають. Від дизайну до адмінки.» Primary CTA «Обговорити проєкт».
- **Availability badge:** «Беремо [N] нові проєкти на [місяць]».
- **Trust numbers:** [X]+ запущених сайтів · [X] тижнів від брифу до запуску · дизайн + код + адмінка в одних руках · безкоштовна консультація.
- **Work (most important section):**
  - Maina by Rivka: live client project, site for a semi-finished food shop + Sanity admin.
  - Cloud Sphere: SaaS landing with interactive 3D particles.
  - BIGANSKIY: site for an architecture bureau of futuristic houses (concept).
  - Крендель: landing page for a home bakery.
  - Each case: tags (design / stack), `[РЕЗУЛЬТАТ]` placeholder, media from `assets/cases/` (else placeholder). Plus a closing tile «Тут може бути ваш сайт».
- **Services:** Дизайн / Розробка / Адмінка, each with what's included + «від [ЦІНА]»; a highlighted turnkey package «Під ключ — від [ЦІНА]».
- **Admin demo:** show that the client edits prices / photos / products themselves in a minute (a mock CMS panel, ideally animated).
- **Process:** 4 steps with [X днів]: Бриф і оцінка → Дизайн → Розробка й адмінка (live test link) → Запуск, навчання, підтримка.
- **Team + testimonial:** Максим (UI/UX design), [Ім'я] (development), photo placeholders; quote «[Відгук клієнта Maina by Rivka]».
- **Risk reversal:** [N] раундів правок, фіксована ціна після брифу, [умови підтримки].
- **FAQ:** cost, timeline, can I edit the site myself, what happens after launch, can I order only design or only development.
- **Final CTA + form:** «Є ідея? Поговорімо.», Telegram [@нік], [email]; form fields: name, Telegram/email, multi-select chips (Все під ключ / Дизайн / Сайт / Адмінка). No backend yet: just validation + a "thanks" state.
- **Footer:** © 2026 · Львів · privacy policy link.

## Rules
- **Never invent** numbers, prices, testimonials or facts. Use `[PLACEHOLDERS]`.
- Responsive: check 375 / 768 / 1440 px, no horizontal scrollbar (except intentional horizontal-scroll sections).
- Accessibility: real `<button>` / `<a>` / `<label>`, text contrast ≥ 4.5:1, `aria-label` on icon buttons, visible focus.
- Work only inside this folder; don't scan other directories.
- After changes, `npm run build` must pass. End with a short report: what was done, key files, remaining placeholders.

## Hard rules learned from bugs (do not undo)
- Scroll reveal: RevealRoot marks shown elements with the `data-in` ATTRIBUTE; CSS is `.js [data-reveal][data-in]`. Never switch to a class.
- Never run `npm run build` while the dev server may be running (it corrupts `.next`). Use `npx tsc --noEmit`.
- SVGs with `preserveAspectRatio="none"` need an explicit height.
- Line draw-in animations: use `clip-path` / `scaleX`, not `stroke-dasharray` + `vector-effect: non-scaling-stroke`.
