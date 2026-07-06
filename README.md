# Dispatch LinkedIn MCP Server

Dispatch is a single-owner, API-compliant LinkedIn automation system for building a consistent fractional CPO presence. It combines a private web app, scheduled publishing, canonical profile-copy tracking, voice checks, and an MCP server that lets AI assistants create and manage approved workflows.

The important boundary: Dispatch automates only what can be done through permitted LinkedIn APIs or the owner's own app data. It does not scrape LinkedIn, automate browsing, send DMs, search profiles, auto-connect, auto-like, or auto-comment on other people's content.

## What This Repo Contains

- [Saved PRD](tasks/prd-dispatch-linkedin-mcp.md)
- [Build plan](docs/00-build-plan.md)
- [Architecture](docs/01-architecture.md)
- [MCP tool contract](docs/02-mcp-tool-contract.md)
- [Data model and internal API](docs/03-data-model-and-api.md)
- [Automation workflows](docs/04-automation-workflows.md)
- [LinkedIn developer setup](docs/05-linkedin-developer-setup.md)
- [Compliance and safety boundary](docs/06-compliance-and-safety.md)
- [Roadmap and backlog](docs/07-roadmap-and-backlog.md)
- [Voice and content system](docs/08-voice-and-content-system.md)
- [MCP client setup](docs/09-mcp-client-setup.md)
- [Launch checklist](docs/10-launch-checklist.md)
- [Environment template](.env.example)

Auth note: this app uses real passwordless magic links. `AUTH_PROVIDER=dev` generates local test links without sending email; `AUTH_PROVIDER=resend` sends production links through Resend. No password storage or password login flow is part of Dispatch.

## Product Shape

Dispatch has two surfaces:

1. Web app: owner dashboard for OAuth, drafts, queue, profile copy, templates, analytics, and manual sync flags.
2. MCP server: AI-facing tools, resources, and prompts for drafting, scheduling, checking voice, reading approved profile copy, and inspecting post analytics.

The MCP server should call the Dispatch backend. It should not hold LinkedIn tokens directly and should never expose scraping or browser automation capabilities.

## Passwordless Login

Local development:

```bash
AUTH_PROVIDER=dev
MAGIC_LINK_SECRET=any-long-random-local-secret
AUTH_CALLBACK_URL=http://localhost:3000/auth/callback
```

Production email delivery:

```bash
AUTH_PROVIDER=resend
MAGIC_LINK_SECRET=<long-random-secret>
MAGIC_LINK_FROM="Dispatch <login@yourdomain.com>"
RESEND_API_KEY=<resend-api-key>
AUTH_CALLBACK_URL=https://YOUR_DOMAIN/auth/callback
```

The magic link expires after 15 minutes. Successful sign-in sets an httpOnly `dispatch_session` cookie.

## Automation Definition

Fully automated in this product means:

- AI can draft and revise posts against a stored voice system.
- Drafts cannot be queued until they pass the British English voice gate.
- Queued posts publish on schedule through the LinkedIn Posts API.
- Failed publishes retry once and then require manual attention.
- Post analytics sync on a schedule for posts published by Dispatch.
- Canonical profile copy is versioned and reminders persist until the owner manually pastes updates into LinkedIn.

Manual forever:

- LinkedIn developer app approval.
- Initial owner OAuth connection.
- Profile edits on LinkedIn.
- Any outreach message sending.
- Any action involving other people's LinkedIn profiles, feeds, comments, or messages.

## Source Baseline

Checked on 2026-07-06:

- LinkedIn API permissions and products: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
- LinkedIn Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- LinkedIn Profile API restrictions: https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
- LinkedIn prohibited software and automation policy: https://www.linkedin.com/help/linkedin/answer/a1341387
- MCP TypeScript SDK: https://ts.sdk.modelcontextprotocol.io/
- MCP transports: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports

## Recommended First Implementation Move

Start with the app foundation, not the MCP server:

1. Create the LinkedIn Developer App and request the required products.
2. Pick the magic-link provider behind the adapter.
3. Implement OAuth and encrypted token storage.
4. Implement drafts, voice checks, queue, and publish-due cron.
5. Add the MCP server after the backend contract is stable.
