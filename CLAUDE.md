# Cloud Sphere — cloud storage landing (portfolio)

Fictional product for a design portfolio. Folder name: cloudsphere-site. Product name on the page: **Cloud Sphere** (indeclinable in Ukrainian copy; avoid gendered verb endings next to it). Contact: hello@cloudsphere.example.
Cloud Sphere = cloud storage for creative teams that remembers links between files (versions, client edits, exports), with on-device encryption.

## Source of truth
- `reference/ivy-scene.html` — approved prototype of the background scene. Port from its `<script>` only; its HTML/CSS is not the site UI.
- `reference/inspo/` — mood references. Take ideas, never copy 1:1.
- Scene code: `components/IvyScene.tsx` (canvas, loop, input, per-route regeneration), `lib/ivy.ts` (generator), `lib/ivyShaders.ts` (shaders). Loaded client-only via `components/Scene.tsx`.

## Stack
- Next.js (App Router) + TypeScript + Tailwind v4 (tokens in `app/globals.css`, exposed via `@theme inline`)
- three + @react-three/fiber for the background scene. No other 3D/animation libs unless asked; UI motion is CSS + IntersectionObserver.
- Icons: `@phosphor-icons/react` (`/dist/ssr`), `light` weight, used sparingly.
- Deploy target: Vercel

## Design direction: minimal, full-bleed, liquid glass
Modern and quiet, in the spirit of Linear / Vercel / Apple / Framer award sites. Huge tight display type, lots of empty space, liquid-glass surfaces. Content is built to be scanned in seconds: eyebrow → heading → 1–2 line intro, then icon tiles, short titles, one-line descriptions, tags and small mini-mockups.

### Hard rules
- **Never use the Unbounded font.**
- **Never use arbitrary px breakpoints** (`min-[1100px]:`, `max-[1099px]:`): Tailwind v4 sorts them before the rem breakpoints (`md:`, `lg:`), so those win. Add a rem breakpoint to `@theme` in `app/globals.css` and use its name (`nav:` = 68.75rem / 1100px, `wide:` = 90rem / 1440px).
- **No max-width container.** Every section is full-bleed (edge to edge) with side padding `--gutter` = clamp(24px, 5.5vw, 80px) (`px-gutter`). Sections are large, often full height (`tall` → `md:min-h-[100dvh]`, never forced on phones).
- Content is centered horizontally; compositions may use the full width (wide grids, huge type, full-width hairline dividers). Only text measures are limited (`max-w-[NNch]`), plus the two product visuals.
- The 3D canvas always covers the whole viewport (`fixed left-0 top-0 h-lvh w-screen`). **No vignette, overlay, frame or opaque section background** on top of it.
- Copy in Ukrainian. People, companies, numbers are fictional. Footer says «Концепт для портфоліо».
- Dark only.

### Banned (removed on purpose)
HUD / mono / coordinate labels, glowing or animated borders, coloured glow blobs, grey-filled or fully transparent cards, any surface utility other than `.card`, light beams, scanlines, noise, grid or dot backgrounds, corner brackets, fake terminal / game-like UI, white buttons, em dashes in copy.

### Tokens (app/globals.css)
- Colours: bg `#05070d` (= scene clear colour), fg `#f5f7fa`, **body `#c4cad4`** (all paragraphs over the scene), grey `#8b919c` (small meta inside surfaces only), faint `#5b616c`, hairline `rgba(255,255,255,.09)`.
- Accents: **blue `#3d8bff`** primary (buttons, links). Category colours for icon tiles, tags, checks, highlights: **cyan `#22d3ee`**, **violet `#8b5cf6`** (small text uses `violet-soft #a78bfa` for AA contrast), **green `#34d399`** (security / "OK" states). Class map in `components/ui/accent.ts`.
- Font: **Geist** only (next/font, Latin + Cyrillic). Display weight 600 with negative tracking.
- Type scale: `text-mega` clamp(56→210px) **home hero only** · `text-section` clamp(36→60px) every other home section heading (max 2 lines) · `text-display` clamp(42→120px) inner-page section titles · `text-headline` · `text-title` · `text-lead` clamp(17→21px). Home subtext: 18px, one line.
- Key words in headings: 1–2 per heading with `<G>` (`.text-gradient`). Home uses only the brand aurora gradient (#5aa2ff → #8b5cf6 → #e83fa8, the default `<G>`); per-section `tone`s remain on inner pages only. Big numbers are white; colour only in small dots / tags. `.text-gradient` must not inherit `text-shadow` (muddies the fill); it uses its own drop-shadow.
- Audit findings and open low-priority items: `AUDIT.md`.
- Surfaces: **one `.card` utility for every card and panel** (feature / step / security cards, search panel, app window, testimonial, pricing columns + toggle, FAQ items, navbar). Dark frosted glass, see `reference/inspo/glass-card-target.png`: background `rgba(6,8,14,.72)` + inner radial vignette (edges darker than centre), `backdrop-filter: blur(40px) saturate(140%)` so particles behind become a soft blur, 1px `rgba(255,255,255,.08)` border, radius 16px, shadow `0 24px 64px rgba(0,0,0,.45)`, no coloured glow.
- `.card-nav`: navbar variant, background `rgba(6,8,14,.6)`. `.card-pro`: Pro plan, same card with a 1px blue → cyan gradient border (masked `::before`), no glow.
- Pills / badges / tags / eyebrows: ≥12px, padding 6px 12px, coloured text on a 12% tint of the same colour; neutral tags white 85% on white 7%.
- Readability: every heading + intro on particles sits in a **`.plate`** (radial dark backdrop, no hard edge) and uses `.legible` (soft text-shadow).
- Radii: all cards and panels 16px (from `.card`); buttons, pills and toggles fully rounded.
- Buttons (`components/ui/Button.tsx`): **primary** = blue `#3d8bff`, white 16px/600 text, 56px tall, 32px inline padding, glow (accent 40%) + 2px lift on hover; **nav** size 44px tall; **secondary** (`.btn-secondary`) = transparent, hairline border, white text; hover = brighter border + `rgba(255,255,255,.04)`; never grey-filled; text. All CTAs are primary.

### Content patterns (`components/ui/Bits.tsx`)
- `Eyebrow`: tinted pill, coloured dot, uppercase label. Every section starts with one.
- `IconTile`: 44px tile, coloured Phosphor glyph on a 12% tint (no blur).
- `Tag`: tinted chip for specs, file types, sizes (`AES-256`, `.fig`, `2 ТБ`).
- `Progress`: thin bar for mini-mockups. Also used: numbered step markers, big stat callouts (white, with a small coloured dot), coloured check icons in pricing.
- Descriptions max 2 lines. Rhythm alternates dense (cards) and airy (one big statement / big numbers).

### Motion
Smooth and subtle only: `[data-reveal]` fade + 24px slide on scroll (single `RevealRoot` observer, stagger with `--d`), gentle `Counter`, `quote-in` fade, button lift, search typing autoplay. Section micro-UIs run **once** on entering view (`useInView` in `components/ui/hooks.ts`; charts draw, counters count, checklists tick). Only loops: search caret, sync dots in Features (only while on screen) and the testimonials marquee (pauses on hover/focus). Everything shows its final state under `prefers-reduced-motion`.

### Card interaction layer (`components/ui/CardFx.tsx`, mounted once in `app/layout.tsx`)
Only on hover-capable fine pointers (`(hover: hover) and (pointer: fine)`), and only on **interactive** cards (the card is or contains a button / link / input / `[tabindex]`); static cards never light up or tilt. Writes `--mx/--my/--spot` on the hovered card: soft radial spotlight (background layer of `.card`) + border light (`.card::after` masked ring). `data-tilt` adds max 4° 3D tilt; large interactive cards only, not on home. Put `data-reveal` on a wrapper, not on a tilted card (both use `transform`). Never set `opacity < 1`, `filter` or `mask` on a `.card` or its ancestors: it becomes a backdrop root and the glass blur disappears (cross-fade content *inside* a card instead; slide floating cards in/out with transform + visibility).

### Product visuals
1. `AppWindow` on /features («Граф файлу»): one file with its version history and linked files.
2. `Search` demo: real input, autoplay typing, scored results.
3. `Stats` dashboard panel on /analytics (custom SVG charts, no chart libs). Donut colour order blue → green → violet → cyan → grey (validated for CVD adjacency).

**Layout rule:** inner pages: no two sections use the same layout pattern. Home: the opposite, ONE calm system (see Home page).

## 3D scene behaviour: growing ivy (must keep)
- Fixed full-screen canvas behind content (`z-0`, `pointer-events: none`; all listeners on `window`), additive blending, clear colour `#05070d`, rendered `linear flat` to match the r128 prototype colours.
- **Generator** (`buildIvy({ visH, visW, pageScreens, small })`, pure, returns typed arrays): roots start at the top centre (4 roots, 3 on small screens) and meander around their own lanes down the whole page. Spread, thickness and branch density grow with depth via `spreadAt()`. Trunks (depth 0) grow until `TOP - y >= DEPTH_TOTAL` (page top → document bottom), never by step count; the per-root segment budget and `CAP` per depth (∞ / 70 / 26 / 10 / 6) limit side branches only, leaves as small elongated particle clusters, short cross-links (#9cc4ff) between nearby tips of *different* roots. 34k particles / 16k segments (18k / 9k on small screens).
- **Generated after layout**: first pass after fonts + one frame; once the page has loaded and its height is quiet for 600ms, regenerates once if `document.scrollHeight` changed, so `DEPTH_TOTAL` matches the final page and the ivy reaches the footer. Regenerates on resize **only if the width changes by more than 20%**.
- **Attached to the page**: camera follows scroll 1:1 (`camY = -(scrollY / innerHeight) * visH`, smoothed). Camera z = 10 (15 when aspect < 0.8).
- **Growth**: `uGrow` front = scroll depth + `visH * 1.08` (just below the bottom edge), max speed 9 units/s with a smooth approach; one-way: scrolling up keeps what has grown.
- **Palette** (muted): `#3d8bff #22d3ee #8b5cf6 #2dd4bf #6366f1 #f472b6`.
- **Hover**: particles and lines near the cursor brighten in their own colour. **No displacement, no hole/ring.**
- **Click on background** (not on `button, a, input, label, summary, .card`): impulse wave travels outward.
- Gentle continuous sway (stems, lines and leaves stay attached), slight pointer tilt of the whole group, twinkle.
- `prefers-reduced-motion`: no sway/twinkle motion, growth jumps instantly. DPR capped at 2.
- **One ivy per route**: regenerates for each page's height on route change (`usePathname`); growth restarts per page, already grown above the visible screen, and stays one-way. No counter pill any more (`branchBirths` / `linkBirths` + `countBelow` remain in `lib/ivy.ts`, unused).
- **Calm centre column (home)**: `uCalm` (0 over the hero → 1 below it, from scroll) dims particles and lines by up to 60% in the central ~60% of the screen width (`calmAt()` in the shaders, screen-space x); edges keep full strength. Inner pages: `uCalm` = 0.

## App structure
- `app/layout.tsx` holds everything shared: `Scene` (ivy), `Nav`, `<main id="main">`, `Footer`, `RevealRoot`, `CardFx`. Pages render only their sections.
- `RevealRoot` and `CardFx` re-run on route change (`usePathname`); `RevealRoot` also observes late-mounted `[data-reveal]` nodes.
- `Button` renders `next/link` for internal hrefs (`/…`), plain `<a>` for `#…` and `mailto:`.
- Nav links: Як це працює `/#how` · Можливості `/features` · Безпека `/security` · Тарифи `/#pricing` · FAQ `/#faq`; page links get `aria-current="page"` + blue dot.

## Home page (`app/page.tsx`): one story, one idea per screen, exactly 8 sections
Order and labels live in `components/home.ts` (`HOME_SECTIONS`, `homeNum`). Every section after the hero uses `components/ui/HomeSection.tsx`: centered header (pill «NN · Label» → `text-section` heading, max 2 lines → one 18px line of subtext → optional small blue «Детальніше →» link to the inner page, sections 2–4) → 48px → ONE content block, max-width 1120px, centered. Same vertical padding everywhere: clamp(96px, 12vh, 160px). No left/right two-column layouts at section level (two columns only inside a card). No section taller than ~1.6 screens except How it works (~2.5).

| # | Section (file) | id | Content |
|---|---|---|---|
| 01 | Hero (`Hero.tsx` + `LogoStrip` in `Logos.tsx`) | `top` | promise in mega type, lead, primary + secondary CTA, small studio strip at the bottom of the screen |
| 02 | Problem (`Problem.tsx`) | `problem` | «Знайомо?», ~1 screen (`HomeSection tall`, md+), where the dust collapses into the roots. 3 equal cards with live visuals: duplicate «final» files that pile up (jitter on hover), a comment landing on v3 while v7 is current (dashed arrow on hover), five places around an empty «?» (chips drift on hover); rose #fb7185 only for the problem markers; quiet bobbing link «… ↓» to #how |
| 03 | How it works (`HowItWorks.tsx`) | `how` | horizontal stepper (01 Завантаж · 02 Пов'яжи · 03 Знайди, progress line), one-line step text, ONE demo card below whose panes cross-fade inside it: `UploadDemo` → `LineageDemo` → `SearchPanel bare`. Desktop ≥1024×760: 180dvh sticky track switches steps on scroll, click scrolls to a step; elsewhere tap to switch |
| 04 | Security (`Security.tsx` → `Security`) | `security` | «Зберігаємо, але не читаємо.», ONE `Cipher` card (no tilt) with the 3 short points inside its footer |
| 05 | Proof (`Testimonials.tsx` → `Proof`) | `proof` | ONE card: 3 white counters with coloured dots, featured quote + metric, avatar row to switch quotes (marquee removed) |
| 06 | Pricing (`Pricing.tsx`) | `pricing` | storage slider recommends a plan, highlight (`.card-pro`) moves to it, prices tween; monthly / yearly toggle |
| 07 | FAQ (`Faq.tsx`) | `faq` | the 5 most important questions in one card, one column, hairlines between, smooth accordion (`.acc`) |
| 08 | Final CTA (`FinalCta.tsx`) | `start` | «Дай файлам пам'ять.» at section scale, 2 CTAs, tags, login link |

`SectionProgress` (home only, fixed bottom centre, `.card` pill, h-9, 13px): hidden over the hero, slides in after it; «03 / 08 · Як це працює», follows scroll; click opens a list to jump between sections.

## Inner pages (same layout, nav, footer, ivy)
Each: `PageHero` (breadcrumb «Головна / …», h1, one line) → content → `CtaBand` (back to `/#pricing`).

| Route | Content |
|---|---|
| `/features` «Можливості» | `Features` bento (graph 2×2, comments, sync 1×2, 500 ГБ, versions, lineage), `Search` section, «Граф файлу» with `AppWindow` |
| `/analytics` «Cloud Sphere в цифрах» | `Stats` dashboard (KPIs + sparklines, area, bars, donut), `Uptime` (90-day bars + 6 regions) |
| `/security` «Безпека» | `SecurityDetail`: `Cipher` + `Checklist` with ring, then 3 detailed cards (encryption, biometrics/2FA, EU data centres) |

Demos accept `active` (latched with `useStarted`), so inside the home stage they only play when their step is shown.

Footer (`Footer.tsx`): frosted full-bleed panel, links to all pages, «Концепт для портфоліо», giant faint wordmark.

Copy rules: one label per intent (signup «Почати безкоштовно», sales «Написати нам»), brand name in `translate="no"`.

## Working style
- Keep changes scoped to the files named in the task. No broad repo scans.
- After changes run the build and fix errors. Report a short list of changed files.

## Hard rules learned from bugs (do not undo)
- Scroll reveal: RevealRoot marks shown elements with the `data-in` ATTRIBUTE; CSS is `.js [data-reveal][data-in]`. Never switch back to a class (`is-in`): React rewrites className on re-render and the element disappears again (FAQ bug), and a mismatch with CSS hides the whole site.
- Never run `npm run build` while the dev server may be running (it corrupts `.next`). Use `npx tsc --noEmit`.
- SVGs with `preserveAspectRatio="none"` need an explicit height, otherwise they take the square viewBox ratio and spill out of their card.
- Line draw-in animations: use `clip-path`, not `stroke-dasharray` + `pathLength` together with `vector-effect: non-scaling-stroke` (Chrome renders dashes).
- Heading key words keep their per-section gradient tones (`<G tone="…">`): hero/final CTA aurora, how it works calm, security shield, proof warm, pricing fresh, FAQ soft, features mind, search spark, stats ice, uptime fresh. Do not unify them to one gradient.
- Ivy look = reference/ivy-scene.html: 1px quiet lines, brightness carried by the particles. Don't brighten or thicken the lines.
