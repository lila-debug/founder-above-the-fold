# Founder Above the Fold(TM) - Product Requirements Document

**PC-FATF-PRD-001 - v0.1 - 5 July 2026**  
**Copyright (c) 2026 Lila Olufemi Abegunrin. All Rights Reserved.**  
**PROPRIETARY AND CONFIDENTIAL - Prototype Cafe(TM)**

---

## 1. Problem

Fractional CPO positioning depends on consistent LinkedIn presence - regular posts in a locked voice, a profile that stays current, and outreach that doesn't get rewritten from scratch every time. Doing this by hand is slow and inconsistent. LinkedIn's own interface has no scheduling, no voice enforcement, and no memory of what's already been said.

## 2. Goal

A single-user tool that queues, voice-checks, and publishes LinkedIn posts automatically, and tracks when the canonical profile copy (headline/About/Experience) has drifted from what's actually live - since that part cannot be automated.

## 3. What LinkedIn Actually Allows (read this before anything else)

LinkedIn's API is restrictive by design. This shapes the entire build.

**Permitted, with standard API access:**

- Sign-in via OpenID Connect (`openid`, `profile`, `email` scopes) - name, photo, email only.
- Publishing text/image/article posts on behalf of the authenticated member, via the Posts API, with `w_member_social` scope.
- Reading engagement stats (likes/comments/impressions) only on posts published through this same app.

**Not permitted, no exceptions:**

- Editing headline, About, Experience, or any other profile field - no such endpoint exists for personal profiles.
- Reading any other member's profile, posts, or connections.
- Scraping profile or feed data in any form.
- Automating connection requests, follows, likes, or comments on other people's content.

The last two are Terms of Service violations, not merely technical gaps - accounts get restricted or banned for exactly this. This PRD builds only within the permitted set.

## 4. Non-Goals (explicitly out of scope)

- Editing the LinkedIn profile itself - remains a manual copy-paste, forever, per section 3.
- Any interaction with content or accounts other than the owner's own.
- Growth/automation features (auto-connect, auto-engage, follower buying) - will not be built at any version.
- Multi-user support - this is a personal tool, v1 and v2 both.

## 5. Users

One user: the founder. No accounts, no permissions system, no multi-tenant logic required.

## 6. Core Features (MVP)

### 6.1 Content Queue & Scheduler

Draft posts stored with a scheduled publish time. A scheduled job calls the LinkedIn Posts API at the set time. Failed publishes retry once, then flag for manual attention - never fail silently.

### 6.2 Voice Lock

Every draft runs through the existing `british_qa.py` hard-fail gate (OED British English, Hunspell `en_GB`) before it can be queued. Same enforcement already built for Benny - reused, not rebuilt.

### 6.3 Canonical Profile Copy Tracker

The current, approved headline/About/Experience text lives in the tool as the single source of truth, versioned. When it's edited, the tool shows a persistent "manual paste required on LinkedIn" flag until marked done. This is the only answer to section 3 - there is no automated alternative.

### 6.4 Outreach Template Library

Stores the fractional CPO outreach messages already drafted, tagged by scenario (cold outreach, warm intro, follow-up). Copy-to-clipboard only - LinkedIn's messaging API is not accessible for personal accounts at any tier relevant here.

### 6.5 Own-Post Analytics

Simple dashboard of impressions/engagement for posts sent through Founder Above the Fold, pulled from the same API. No comparison to industry benchmarks or competitor accounts - that data isn't available and won't be fabricated.

## 7. Technical Architecture

- **Auth:** LinkedIn OAuth 2.0 / OpenID Connect for the one owner account. Token stored server-side, encrypted at rest, refreshed automatically.
- **Posting:** LinkedIn Posts API (`w_member_social`).
- **Backend:** Next.js API routes, single Postgres table set (Supabase is sufficient at this scale - one user, low volume).
- **Scheduler:** Vercel Cron hitting a `/api/publish-due` route every 15 minutes.
- **Frontend:** Same design system conventions as the rest of Prototype Cafe (locked palette, Phosphor icons, light mode only).
- **No Privy needed** - this is a single-owner internal tool, not a customer-facing product with its own user base.

## 8. Data Model (minimum viable)

- `posts`: id, body, status (draft/queued/published/failed), scheduled_at, published_at, linkedin_post_id
- `profile_copy`: id, field (headline/about/experience), content, version, synced_boolean, last_edited_at
- `templates`: id, scenario_tag, body
- `post_stats`: post_id, impressions, likes, comments, pulled_at

## 9. LinkedIn App Registration Requirements

Before any of this works, the app must be registered in the LinkedIn Developer Portal, requesting:

- **Sign In with LinkedIn using OpenID Connect** product
- **Share on LinkedIn** product (this is what grants `w_member_social`)

Both require LinkedIn's own review before going live - this is LinkedIn's process, not something this build can shortcut. Budget for review turnaround before treating any publish date as fixed.

## 10. Trident Test

- **Faster:** posts go out on schedule without opening LinkedIn.
- **Easier:** one voice-checked queue instead of rewriting tone each time.
- **More desirable:** profile drift becomes visible instead of silently accumulating.

## 11. Success Metrics

- Zero posts published in a voice that fails `british_qa.py`.
- Zero manual LinkedIn logins required for scheduled posting.
- Profile copy drift caught within 24 hours of a canonical edit, every time.

## 12. Open Items Requiring a Decision

- **Name:** Founder Above the Fold is the selected customer-facing product name. Internal MCP tool names may continue to use the `dispatch.*` namespace until a deliberate rename/refactor pass.
- **Hosting:** assumed Vercel + Supabase, matching the rest of the stack - confirm before scaffolding.

---

Prototype Cafe(TM) - Revolutionising Life Since 1982(TM)

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
