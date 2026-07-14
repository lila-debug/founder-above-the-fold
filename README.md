# Founder Above the Fold LinkedIn MCP App

Founder Above the Fold is a single-owner, API-compliant LinkedIn presence system for building and maintaining a founder's above-the-fold positioning. It combines a private web app, scheduled publishing, canonical profile-copy tracking, voice checks, and an MCP server that lets AI assistants create and manage approved workflows.

The important boundary: Founder Above the Fold automates only what can be done through permitted LinkedIn APIs or the owner's own app data. It does not scrape LinkedIn, automate browsing, send DMs, search profiles, auto-connect, auto-like, or auto-comment on other people's content.

Internal note: the MCP tool namespace currently remains `dispatch.*` while the customer-facing product name is Founder Above the Fold.

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
- [App and launch video plan](docs/11-app-and-launch-video-plan.md)
- [iOS app plan](docs/11-ios-app-plan.md)
- [Android app plan](docs/12-android-app-plan.md)
- [Product delivery backlog](docs/13-product-delivery-backlog.md)
- [Domain and deployment manual](docs/14-domain-and-deployment-manual.md)
- [Owner access guard manual](docs/15-owner-access-manual.md)
- [Interactive tutorial manual](docs/18-interactive-tutorial-manual.md)
- [Four-hour launch control manual](docs/19-four-hour-launch-control-manual.md)
- [LinkedIn launch kit](docs/20-linkedin-launch-kit.md)
- [Environment template](.env.example)

Auth note: this app uses real passwordless magic links. `AUTH_PROVIDER=dev` generates local test links without sending email; `AUTH_PROVIDER=resend` sends production links through Resend. No password storage or password login flow is part of Founder Above the Fold.

## Product Shape

Founder Above the Fold has two surfaces:

1. Web app: owner dashboard for OAuth, drafts, queue, profile copy, templates, analytics, and manual sync flags.
2. MCP server: AI-facing tools, resources, and prompts for drafting, scheduling, checking voice, reading approved profile copy, and inspecting post analytics.

The private workbench includes an interactive IKEA-style assembly tutorial. The MCP
server exposes the matching `dispatch://assembly-manual` resource so ChatGPT and the
web app operate from the same safety instructions.

The MCP server should call the Founder Above the Fold backend. It should not hold LinkedIn tokens directly and should never expose scraping or browser automation capabilities.

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
MAGIC_LINK_FROM="Founder Above the Fold <login@yourdomain.com>"
RESEND_API_KEY=<resend-api-key>
AUTH_CALLBACK_URL=https://YOUR_DOMAIN/auth/callback
```

The magic link expires after 15 minutes. Successful sign-in sets an httpOnly `dispatch_session` cookie.
The private owner workbench lives at `/dashboard`; unauthenticated visitors are routed back to the public page for sign-in.

## Target Automation Contract

The following is the intended finished assembly, not the current launch claim. Use
`/api/mcp/health` and the launch control manual for the evidence-backed state.

Fully automated in this product means:

- AI can draft and revise posts against a stored voice system.
- Drafts cannot be queued until they pass the British English voice gate.
- Queued posts publish on schedule through the LinkedIn Posts API.
- Failed publishes retry once and then require manual attention.
- Post analytics sync on a schedule for posts published by Founder Above the Fold.
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
