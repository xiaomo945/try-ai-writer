# Try AI Writer

> The AI that learns your brand voice, not just your prompts. Write better, faster, cheaper.

**Try AI Writer** is an AI writing SaaS built with **Next.js 16 (App Router)**, **React 19**, **TypeScript (strict)**, and **Tailwind CSS v3**. It turns a short prompt into polished blog posts, emails, and social content, while a "Digital Twin" learns your tone and style over time.

- Live site: https://tryaiwriter.com
- Repo: https://github.com/xiaomo945/try-ai-writer

## Features

- **Streaming generation** across 4 modes: Blog, Email, Social, and Custom.
- **One-click rewrite / polish** — rewrite, shorten, expand, switch to a formal or casual tone, or translate to Chinese, applied directly to the generated draft.
- **Export** — download the result as Markdown (`.md`), plain text (`.txt`), or a formatted web page (`.html`), ready to drop into a blog, doc, or WeChat.
- **Dual AI providers** — Anthropic Claude (`claude-sonnet-4`) and DeepSeek (`deepseek-chat`), with automatic fallback (DeepSeek → Claude → mock) so the app never hard-fails.
- **Brand Voice learning** — upload a writing sample or use the Creative Interview Engine; the AI adapts to your voice.
- **Digital Twin persona** — memory bank + interview memory that keep context across sessions.
- **Dashboard** — usage stats, generation history, brand-voice and memory management.
- **Templates & Tools** — reusable writing templates and a headline generator.
- **SEO content engine** — 380+ pre-written blog posts, comparison pages, and customer-case pages for organic acquisition.
- **Auth** — NextAuth v5 with Google and Apple OAuth.
- **Payments** — Creem (subscriptions + credit packs), with checkout, success/pending pages, and webhooks.
- **Referral & affiliate** system.
- **Browser extension** (popup) under `public/extension/`.
- **Dark mode**, fully responsive, accessible.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + custom theme (`tailwind.config.js`) |
| Icons | lucide-react |
| Auth | NextAuth v5 (`next-auth` beta) — Google + Apple OAuth |
| AI | Anthropic Claude API + DeepSeek API (direct, streaming) |
| Payments | Creem |
| Analytics | Vercel Analytics |
| Monitoring | Sentry (optional, only when `SENTRY_DSN` is set) |
| SEO | `robots.ts`, `sitemap.ts`, JSON-LD structured data, IndexNow/Google submit scripts |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.local.example .env.local
# Then edit .env.local with real values (see below)

# 3. Run the dev server
npm run dev

# 4. Production build
npm run build && npm run start
```

Open [http://localhost:3000](http://localhost:3000). The app runs in **mock mode** out of the box (no API key needed) and streams canned responses, so you can explore the UI immediately.

## Environment Variables

Copy `.env.local.example` to `.env.local`. Key variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `AI_PROVIDER` | `claude` \| `deepseek` \| `mock` \| (empty = auto-fallback) | No |
| `CLAUDE_API_KEY` | Anthropic API key | For Claude generation |
| `DEEPSEEK_API_KEY` | DeepSeek API key | For DeepSeek generation |
| `CLAUDE_MODEL` / `DEEPSEEK_MODEL` | Model overrides | No |
| `NEXTAUTH_SECRET` | NextAuth session encryption | Yes |
| `NEXTAUTH_URL` | NextAuth callback base URL | Yes |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth | For login |
| `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` | Apple OAuth | For login |
| `CREEM_API_KEY` / `CREEM_ENV` / `CREEM_PRODUCT_*` / `CREEM_WEBHOOK_SECRET` | Creem payments | For paid plans |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run check` | typecheck + test + build |
| `npm run submit-to-google` / `index-now` / `generate-and-index` | SEO indexing helpers |

## Project Structure

```
app/                 # Routes: landing, write, dashboard, blog, pricing, tools, auth, payment…
app/api/             # API routes: generate, auth, payment, brand-voice, referral, history…
components/          # Shared React components
lib/                 # Core logic: ai-providers, auth, payment, brand-voice, memory, referral…
data/blog-posts/     # 380+ Markdown blog posts (SEO content)
public/extension/    # Browser extension assets
scripts/             # SEO indexing / generation scripts
.trae/rules/         # Project conventions (programming, design, copywriting, security)
```

## Branch Status (revival note)

`main` is the canonical, most-complete branch. The older `trae/solo-agent-*` and `vercel/*` branches were **stale** — created by earlier coding agents, they lagged `main` by 100–156 commits, and their unique work was either already incorporated into `main` or was a conflicting parallel experiment (a Stripe integration vs the adopted Creem, a Prisma/Postgres layer vs the current file-based storage, a full site redesign).

These 12 stale branches have now been **deleted** from the remote. Before deletion, the two branches carrying genuinely unique work were preserved as tags so nothing valuable is lost:

- `archive/trae-1RaD7T-prisma` — Prisma + Postgres data layer
- `archive/trae-VCqSdK-conversion` — conversion funnel, A/B testing, and retention system

The repository is now down to a single clean branch: `main`.

## Deployment

Designed for **Vercel** (CI/CD on push to `main`). Configure the environment variables above in the Vercel dashboard. A `wrangler.toml` and `.cloudflare/` config are also present for optional Cloudflare Pages deployment.
