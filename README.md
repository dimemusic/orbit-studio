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

Copy `.env.example` to `.env.local` to make the contact form send email (Resend) and to set the public site URL.

## Where things are

| Path | What |
|---|---|
| `lib/content.ts`, `lib/content.en.ts` | all site copy (uk / en, same shape) |
| `components/sections/*` | page sections: Hero, Build (process film), Work, Pricing, FinalCta (form), Footer |
| `components/StarField.tsx`, `lib/stars.ts`, `lib/starShaders.ts` | WebGL star background |
| `components/Shell.tsx` | page frame shared by both language layouts |
| `app/(uk)`, `app/(en)` | routes per language |
| `app/api/contact/route.ts` | contact form endpoint |
| `app/globals.css` | design tokens and global styles |

Project conventions and design rules: `CLAUDE.md`.
