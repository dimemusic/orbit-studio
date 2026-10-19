# Cloud Sphere landing — design & quality audit

**Date:** 2026-10-16 · **Method:** rendered page in headless Chrome (real WebGL) at 1440 / 1024 / 390 px, scrolled top → bottom with a screenshot per viewport, plus automated checks (horizontal overflow, elements off-screen, tap-target heights, console errors) and computed WCAG contrast ratios. Code review of every file in `components/sections` and `components/ui`.
**Checklists used:** redesign-existing-projects, design-taste-frontend, frontend-design, web-design-guidelines (Vercel), ui-ux-pro-max (built-in rules; its search script needs Python, not installed), accessibility-review (WCAG 2.1 AA).
**Fixed constraints (not audited as problems):** 3D scene behaviour, blue primary `#3d8bff`, centered content, full-bleed layout, no Unbounded, Ukrainian copy.

Status: ✅ fixed in this pass · ⚠️ needs your decision · ⏳ left (low priority)

---

## High

| # | Problem | Evidence | Fix | Status |
|---|---|---|---|---|
| H1 | **Gradient keywords looked muddy / dark** («пам'ять», «Нуль хаосу», «розуміє»…), the signature highlight of every heading. | Screenshots: dull navy letters. Cause: `.legible` text-shadow is inherited and, because the gradient glyphs are `color: transparent`, the dark shadow shows *through* the letters. | `.text-gradient { text-shadow: none; filter: drop-shadow(…) }` keeps the readability halo without muddying the fill; gradient start lifted to `#5aa2ff`. | ✅ |
| H2 | **Mobile navbar broken at 390 px**: «Почати безкоштовно» shown, «Меню» pushed off-screen (menu unreachable). | Automated check: `BUTTON.btn-secondary` right edge > viewport. Cause: Button base class `inline-flex` overrides the `hidden` passed via `className`. | Visibility moved to a wrapper `span.hidden sm:contents`. | ✅ |
| H3 | **«−20%» badge unreadable** on the active (blue) yearly toggle. | Green `#34d399` on blue `#3d8bff` = **1.72:1**. | Badge switches to white on white/20 when «Щороку» is active, green tint otherwise. | ✅ |
| H4 | **Footer copy on bright particles**: links and «Концепт для портфоліо» sat on the densest part of the knot. | Screenshot 1440 footer. | Footer uses the `.card` material (dark frosted, full-bleed, top hairline): particles behind become a soft blur. | ✅ |
| H5 | **Screen-reader noise in search demo**: results list had `aria-live="polite"` while autoplay typed → an announcement per keystroke, forever. | Code: `Search.tsx`. | `aria-live` is `off` during autoplay, `polite` once the visitor types. | ✅ |
| H6 | **Primary button text contrast**: white on `#3d8bff` = **3.31:1**; AA needs 4.5:1 for 16 px text (3:1 only from 18.66 px bold). | Computed. | Options: (a) button text 19 px/600 → counts as large text, passes at 3.31; (b) dark text `#05070d` on blue = 5.9:1; (c) slightly deeper blue `#2b74e8` for the button fill only. The white-on-`#3d8bff` spec was your explicit choice, so I did not change it. | ⚠️ |

## Medium

| # | Problem | Evidence | Fix | Status |
|---|---|---|---|---|
| M1 | **Empty voids on mobile**: every `tall` section was forced to `100dvh` on phones → screen-high gaps between short content. | 390 px screenshots (half-empty screens). | `tall` now applies from `md` up; section padding `clamp(72px…168px)`. Page is 400 px shorter on mobile. | ✅ |
| M2 | **~400 px dead gap** between logo strip and «Як це працює» on desktop. | 1440 screenshots 01–02. | Logo strip bottom padding and How-it-works top padding reduced; next eyebrow now visible in the same viewport. | ✅ |
| M3 | **Small-text contrast failures**: violet text on violet tint **4.26:1**; `faint #5b616c` labels **3.20:1** (app window labels, search placeholder). | Computed. | Small violet text uses `violet-soft #a78bfa` (**6.63:1**; dots/tints keep `#8b5cf6`); faint labels → `grey #8b919c` (**6.28:1**). | ✅ |
| M4 | **Stats numbers collided** at 1440 («12 400+» touching «3,8 ПБ»). | Screenshot 07. | Size `clamp(40px, 5.2vw, 88px)` + column gap. Section also got a real (visually hidden) `<h2>`. | ✅ |
| M5 | **Tap targets below 24 px** (WCAG 2.5.8): nav links 18 px, footer links ~20 px; testimonial switcher 40 px and search suggestion pills under 44 px. | Automated tap-target scan. | Nav/footer links padded to 38–42 px; switcher and suggestion pills 44 px. | ✅ |
| M6 | **Gradient overuse in Security heading**: blue → cyan covered most of a 3-line headline. | Screenshot 06. | Highlight limited to one word («прочитати»). | ✅ |
| M7 | **Final CTA tags + login line on bright knot** without a backdrop. | Screenshot 13. | Wrapped in the same radial `.plate` as headings. | ✅ |

## Low (left for later)

| # | Problem | Suggested fix |
|---|---|---|
| L1 | Formulaic rhythm: eyebrow + gradient keyword on every section reads as a template after the 4th repeat. | Keep eyebrows, but drop the gradient on 2–3 sections (FAQ, Testimonials, Pricing) so the highlight stays special. |
| L2 | Features = 3 × 2 equal cards (the most common AI layout). | Asymmetric bento: one wide «Граф зв'язків» card with a mini graph, the rest smaller. |
| L3 | Search demo: ties and coarse scores (two results «72%») look fake. | Add a small per-file weight / recency term so scores differ. |
| L4 | 3D on phones (ivy scene): 18k points + 9k line segments at DPR up to 2, antialias on, renders continuously while visible. | Cap DPR at 1.5 on small screens; consider `antialias: false` on mobile (the scene spec keeps DPR cap 2, so not changed). |
| L5 | Console warning: `THREE.Clock is deprecated` (from @react-three/fiber internals with three r186). | Goes away with an R3F update; harmless. |
| L6 | Pricing at exactly 1024 px: three columns are tight, some feature lines wrap. | Switch to 3 columns from `xl`, 1 column with Pro first below. |
| L7 | Missing favicon, Open Graph image, privacy/terms links. | Add `app/icon.svg` (logo mark), `opengraph-image`, two footer links. |
| L8 | Concept-only dead links: «Увійти» (`#login`), signup CTAs (`#start`), `mailto:hello@cloudsphere.example`. | Fine for a portfolio; label the concept clearly or wire to a demo page. |
| L9 | Search input element is 27–35 px tall (the clickable row around it is ~64 px). | Make the input fill the row height. |
| L10 | Straight apostrophes in copy («пам'ять»). | Typographic `ʼ` (U+02BC) for Ukrainian. |
| L11 | Stats numbers in four different accent colours read slightly «rainbow». | Consider one accent for numbers, colour only in the captions' dots. |

## Contrast check (computed, WCAG 2.1)

| Element | Colours | Ratio | Needs | Result |
|---|---|---|---|---|
| Body text | `#c4cad4` on `#05070d` | 12.22 | 4.5 | ✅ |
| Meta text | `#8b919c` on card | 6.28 | 4.5 | ✅ |
| Faint labels (before) | `#5b616c` on card | 3.20 | 4.5 | ❌ → fixed (M3) |
| Violet tag (before → after) | `#8b5cf6` → `#a78bfa` on violet/12 | 4.26 → 6.63 | 4.5 | ✅ after |
| Blue / cyan / green tags | on own 12% tint | 5.31 / 9.19 / 8.71 | 4.5 | ✅ |
| «−20%» on active toggle (before) | `#34d399` on `#3d8bff` | 1.72 | 4.5 | ❌ → fixed (H3) |
| Primary button text | `#fff` on `#3d8bff` | 3.31 | 4.5 | ⚠️ (H6) |

## Verified after fixes

- 1440 / 1024 / 390: no horizontal overflow, no off-screen elements (390 previously had the navbar overflow).
- Tap targets: all nav/footer/switcher targets ≥ 38 px; remaining small items are the visually hidden skip link, the in-sentence «Увійти» link (exempt) and the search input (L9).
- Re-screenshots confirm H1–H4, M2, M4 visually. `npx tsc --noEmit` clean.
