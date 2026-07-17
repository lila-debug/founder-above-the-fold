# MCP Tool Contract

## Design Principle

The MCP server exposes guarded Founder Above the Fold workflows, never raw LinkedIn primitives. The customer-facing name is Founder Above the Fold; the technical namespace remains `dispatch.*` for this version.

Every mutation calls the Founder Above the Fold backend with `MCP_API_KEY`, so the same database, voice, queue, audit and publication locks apply to the web UI and MCP client.

## Implemented Tools

| Tool | Input | Job and hard stop |
|---|---|---|
| `dispatch.health` | none | Reads backend, setup, connection, capability and safety state without secrets. |
| `dispatch.create_draft` | `body`; optional `pillar`, `archetype`, `notes` | Creates a draft; never publishes. |
| `dispatch.list_posts` | optional `status`, `limit` | Lists owner workflow state. |
| `dispatch.get_post` | `post_id` | Reads one post and its current state. |
| `dispatch.update_draft` | `post_id`; optional changed fields | Updates an unpublished draft; a text change invalidates the earlier voice lock. |
| `dispatch.run_voice_check` | `post_id` | Stores a British-English result for the exact body hash. |
| `dispatch.queue_post` | `post_id`, ISO `scheduled_at` | Requires a future time and a passing check for the current revision. |
| `dispatch.cancel_post` | `post_id`; optional `reason` | Cancels a queued post and audits the reason. |
| `dispatch.publish_post_now` | `post_id`, literal `confirm_publication: true` | Public side effect; requires explicit owner confirmation and the same voice/connection locks. |
| `dispatch.get_profile_copy` | none | Reads canonical manual-paste profile copy. |
| `dispatch.upsert_profile_copy` | `field`, `content`; optional `change_note` | Adds a version; never edits LinkedIn. Fields are `headline`, `about`, or `experience`. |
| `dispatch.list_templates` | optional `type` | Lists versioned outreach or post jigs. |
| `dispatch.create_template` | `type`, `scenario_tag`, `body`; optional `notes` | Creates manual-only copy. |
| `dispatch.update_template` | `template_id`; optional changed fields | Advances the template version. |
| `dispatch.render_template` | `template_id`, `variables` | Fits variables, reports missing labels, and never sends outreach. |
| `dispatch.list_analytics` | none | Reads stored official own-post snapshots and permission readiness. |
| `dispatch.refresh_analytics` | optional `post_id` | Pulls official metrics only when the separate LinkedIn analytics grant exists. |

## Implemented Resources

| URI | Contents |
|---|---|
| `dispatch://voice-guide` | British-English and Prototype Cafe voice rules. |
| `dispatch://profile-copy/current` | Current canonical manual-paste profile copy. |
| `dispatch://templates/current` | Versioned outreach copy and post-idea jigs. |
| `dispatch://assembly-manual` | Shared operating order and LinkedIn safety locks. |

No MCP prompts are registered in v0.1. Clients may compose workflows from tools and resources, but the server does not claim prompt endpoints it does not expose.

## Protocol Finished-Build Test

Run:

```bash
MCP_API_BASE_URL=http://localhost:3100 \
MCP_API_KEY=<local-key> \
npm run test:smoke -w apps/mcp-server
```

The test starts the compiled stdio server, negotiates the MCP protocol, checks the tool/resource lists, calls health and templates, then completes:

```text
[draft] ---> [voice-passed] ---> [queued] ---> [cancelled]
```

Expected report: 17 tools, 4 resources, `publicSideEffect: false`.

## Explicitly Not Exposed

Never add raw tools for profile search/read, messaging, connections, follows, likes, comments, reposts, scraping, LinkedIn browser control or arbitrary LinkedIn HTTP requests. Profile editing and outreach sending remain manual; public posting uses only the owner-authorised official Posts API rail.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
