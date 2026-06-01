# PT Duta Firza — Website & CMS

Company profile website + custom CMS for PT Duta Firza, an Indonesian energy & EPC company.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** React 19.2, TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** MongoDB 7 (self-hosted on GCP Compute Engine)
- **Auth:** NextAuth.js v5 (Credentials)
- **i18n:** next-intl (ID / EN)
- **Theme:** next-themes (light / dark / system)
- **Forms:** react-hook-form + zod
- **Email:** Resend
- **Lint + Format:** Biome v2
- **Hosting:** GCP Cloud Run

## Prerequisites

- Node.js 22 LTS (see `.nvmrc`)
- pnpm 10+
- Access to MongoDB instance (local Docker or GCP VM)
- Resend API key

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with real values (MongoDB URI, Resend key, etc.)

# 3. Run dev server
pnpm dev
```

Open <http://localhost:3000> — you will be redirected to `/id` (default locale).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Lint check with Biome |
| `pnpm lint:fix` | Lint + auto-fix |
| `pnpm format` | Format files with Biome |
| `pnpm typecheck` | TypeScript type check (no emit) |

## Environment Variables

See [.env.example](./.env.example) for the full list with comments. All vars are validated at boot via `src/lib/env.ts` (Zod) — the app fails fast if any required var is missing or invalid.

## Folder Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/     # public-facing pages
│   │   └── (admin)/      # admin / CMS pages
│   ├── api/              # route handlers
│   └── layout.tsx        # root pass-through
├── components/
│   ├── ui/               # shadcn primitives
│   ├── layout/           # header, footer, switchers
│   ├── public/           # public page sections
│   └── admin/            # admin components
├── lib/                  # env, db, auth, email, utils
├── models/               # Mongoose schemas
├── hooks/
├── types/
├── messages/             # next-intl JSON files (en, id)
├── i18n/                 # routing + request config
└── middleware.ts         # next-intl middleware
```

## Roadmap

8-week delivery plan tracked in internal project timeline.
