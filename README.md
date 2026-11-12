# MaxArt Digital

Website of the MaxArt Digital web studio: a one-page site in Ukrainian (`/`) and English (`/en`).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # production build (stop the dev server first)
```

Copy `.env.example` to `.env.local` and fill what you need: Telegram bot (leads), Resend (email), site URL, Clarity id, Upstash (rate limits). Every push to `master` deploys to Vercel.

## Where things are

| Path | What |
|---|---|
| `CLAUDE.md` | **start here**: context, rules and past decisions (read by Claude Code automatically) |
| `lib/content.ts`, `lib/content.en.ts` | all site copy (uk / en, same shape) |
| `components/Lang.tsx`, `components/lang/*`, `lib/i18n.ts`, `lib/site.ts` | how copy reaches the page: one language per visitor on the client, both on the server; language-independent constants |
| `app/global-not-found.tsx`, `components/NotFoundPage.tsx` | the 404 page |
| `components/HomePage.tsx` | the home page: Hero → Build → Work → Pricing → Faq → FinalCta |
| `components/sections/*` | page sections: Hero, Build (process film), Work + Stack, Pricing, Faq, FinalCta (form), Footer |
| `components/build/*` | parts of the home «Як ми працюємо» film |
| `components/GeoPage.tsx` | the «website development across Ukraine» page (all cities, one real page) |
| `components/ServicePage.tsx`, `components/explain/*` | service pages (/business-card-site …) and their explainer films |
| `components/analytics/*`, `lib/track.ts` | Vercel Analytics events, Clarity behind the cookie banner |
| `components/StarField.tsx`, `lib/stars.ts`, `lib/starShaders.ts` | WebGL star background |
| `components/Shell.tsx` | page frame shared by both language layouts (head boot script, intro, nav, footer) |
| `app/(uk)`, `app/(en)` | routes per language |
| `app/api/contact/route.ts`, `app/api/tg-check/route.ts` | contact form → Telegram bot / email, Telegram nick check |
| `lib/guard.ts`, `next.config.ts` | rate limits, origin checks, security headers |
| `app/sitemap.ts`, `scripts/indexnow.mjs`, `public/*.txt` | sitemap (bump `LAST_UPDATED` with copy changes), IndexNow submit script + key |
| `app/globals.css` | design tokens and global styles |

Project conventions and design rules: `CLAUDE.md`.
