# Founder Above the Fold

The passwordless LinkedIn operating system for founders who hate doing LinkedIn.

## Positioning

NOT a LinkedIn scheduler. Taplio, AuthoredUp, Buffer, and Supergrow already own that space.

This is a complete operating system: magic link login, profile setup assistant (headline, About, experience, featured links + paste checklist), voice-locked post queue, safe official LinkedIn publishing through the Posts API, and an MCP/AI command centre so you can say "make me visible this week" and the app turns it into drafts, checks, queue, and reminders.

No scraping. No fake engagement. No account-risky behaviour.

## Sellable MVP Flow

1. Magic link login (no passwords)
2. 10-minute onboarding questionnaire
3. Generate profile copy (headline, About, experience, featured)
4. Copy-to-LinkedIn checklist
5. Generate 2 weeks of posts from content pillars
6. Voice check (British English, banned words, no emojis)
7. Queue / schedule
8. "Manual tasks left" tracker
9. Clean export / share preview

Then: sell 5 beta slots manually at $299-799 setup price before overbuilding.

## Architecture

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API routes + Supabase PostgreSQL
- **Auth:** Passwordless magic links (dev mode / Resend)
- **Publishing:** LinkedIn Posts API (official, `w_member_social` scope)
- **Fonts:** Tarsius (body) + TarsiusMono (code/mono) — base64-embedded WOFF2
- **Palette:** imperial_blue (#03256c), persian_blue (#2541b2), ocean_deep (#1768ac), sky_surge (#06bee1), white
- **Mode:** Light mode only. No gradients. No cartoon imagery.

## Database Schema

- `owner_settings` — single owner record
- `oauth_tokens` — LinkedIn encrypted tokens
- `posts` — drafts, queued, published, failed posts
- `voice_checks` — voice gate results per post revision
- `profile_copy` — headline, about, experience, featured (versioned, sync tracking)
- `templates` — outreach scenarios
- `post_stats` — own-post analytics
- `audit_log` — every public side effect
- `magic_link_tokens` — temporary auth tokens
- `content_pillars` — content strategy pillars

## API Endpoints

### Auth
- `POST /api/auth/magic-link` — send magic link
- `POST /api/auth/verify` — verify token, create session
- `POST /api/auth/signout` — clear session

### Posts
- `GET /api/posts` — list posts (with status filter)
- `POST /api/posts` — create draft
- `GET /api/posts/:id` — get post with voice checks
- `PATCH /api/posts/:id` — update post
- `DELETE /api/posts/:id` — delete post
- `POST /api/posts/:id/voice-check` — run voice gate
- `POST /api/posts/:id/queue` — schedule post (requires passed voice check)
- `DELETE /api/posts/:id/queue` — cancel queued post

### Profile Copy
- `GET /api/profile-copy` — list all profile fields
- `POST /api/profile-copy` — create/update field
- `POST /api/profile-copy/:field/sync` — mark as synced

### LinkedIn OAuth
- `GET /api/linkedin/oauth/start` — start OAuth flow
- `GET /api/linkedin/oauth/callback` — OAuth callback
- `GET /api/linkedin/status` — connection status
- `POST /api/linkedin/disconnect` — revoke connection

### Cron
- `GET /api/cron/publish-due` — publish queued posts (Vercel Cron)

## Dashboard Pages

- `/dashboard` — Today (overview, status cards, manual tasks, recent posts)
- `/dashboard/drafts` — Draft list with filter tabs
- `/dashboard/drafts/new` — Create new draft
- `/dashboard/drafts/:id` — Draft detail, voice check, edit, queue
- `/dashboard/drafts/:id/queue` — Schedule post for publishing
- `/dashboard/queue` — Queued posts with cancel action
- `/dashboard/profile` — Profile copy tracker with copy and sync flow
- `/dashboard/settings` — LinkedIn connection, session management

## Landing Page

`/` — Above-the-fold hero, positioning, features grid, pricing tiers, CTA

## Setup

```bash
# 1. Copy env
cp .env.example .env.local

# 2. Fill in your Supabase credentials, LinkedIn app credentials, and secrets

# 3. Install dependencies
cd apps/web && npm install

# 4. Run database migrations (use Supabase SQL Editor with schema.sql)

# 5. Start dev server
npm run dev
```

## Deployment

- Vercel + Supabase
- Connect `founderaccount.app`, `founderaccount.com`, `founderaccount.dev`
- Configure LinkedIn redirect URIs for production
- Set up Resend for production magic links
- Configure Vercel Cron for publish-due

## Voice Check Rules

- Banned words: gonna, wanna, gotta, kinda, sorta, etc. (full list in `voice-check/route.ts`)
- Americanisms flagged as warnings (color, center, realize, etc.)
- Emojis rejected for professional tone
- Sentences over 40 words flagged
- Must pass before queueing
- Body hash invalidated on edit — re-check required

## Safety Boundary

- Only LinkedIn Posts API (official, `w_member_social`)
- No scraping. No browser automation. No fake engagement.
- No auto-connect, auto-like, auto-comment, auto-DM.
- Profile copy stays manual (copy + paste + mark synced).
- Outreach templates are copy-to-clipboard only.
- Audit log for every public side effect.

## What is Built

- Project structure (apps/web, packages/design-system)
- Next.js app with Tailwind CSS, locked palette, Tarsius fonts (base64 WOFF2)
- Database schema (Supabase SQL)
- Auth system (magic links, JWT sessions, middleware guard)
- Landing page (hero, positioning, features, pricing, CTA)
- Dashboard with navigation sidebar
- Post CRUD API + voice check gate + queue system
- Profile copy tracker with sync flow
- LinkedIn OAuth scaffold (start, callback, status, disconnect)
- Publish cron endpoint (LinkedIn Posts API)
- All dashboard pages (Today, Drafts, Queue, Profile, Settings)

## What is Next

1. **Database setup** — Create Supabase project, run schema.sql, add env vars
2. **LinkedIn Developer App** — Create app, request `Sign In with LinkedIn` + `Share on LinkedIn`, add redirect URIs
3. **Onboarding questionnaire** — Build the 10-min flow that generates profile copy and content pillars
4. **Post generator** — AI-powered post generation from pillars
5. **Stripe integration** — Setup $299-799 setup + $49-99/mo billing
6. **Beta signup flow** — Landing page CTA → onboarding → payment
7. **iOS app** — SwiftUI native app using same API
8. **Android app** — Kotlin/Compose native app using same API
9. **MCP server** — TypeScript MCP server with stdio transport for AI command centre

## Pricing Tiers

| Tier | Price | What you get |
|------|-------|-------------|
| Setup | £299-799 one-time | Profile overhaul, 2 weeks of posts, voice check, queue, paste checklist |
| SaaS | £49-99/month | Dashboard, magic link, voice lock, queue, reminders, analytics, MCP tools |
| Done-With-You | £500-1,500/month | Full visibility ops: content strategy, weekly posts, profile refreshes, inbound optimisation |

## License

Proprietary. All rights reserved. Lila Olufemi Abegunrin. Trademarks and Patents Pending (CIPO).
