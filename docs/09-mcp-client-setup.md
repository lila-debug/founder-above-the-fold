# MCP Client Setup

## Purpose

This file defines how AI clients connect to the implemented Founder Above the Fold stdio MCP server.

The server should expose Founder Above the Fold tools and resources only. It should not expose raw LinkedIn credentials, generic HTTP tools, shell access, browser automation, or arbitrary LinkedIn API calls.

Internal note: the public product name is Founder Above the Fold. The MCP tool namespace remains `dispatch.*` until a deliberate technical rename/refactor pass.

## Local Stdio Mode

Use this first.

Command after `npm run build -w apps/mcp-server`:

```bash
node /absolute/path/to/apps/mcp-server/dist/index.js
```

Expected environment:

```bash
MCP_API_BASE_URL=http://localhost:3000
MCP_API_KEY=...
```

Example Claude Desktop-style config:

```json
{
  "mcpServers": {
    "dispatch-linkedin": {
      "command": "node",
      "args": [
        "/absolute/path/to/apps/mcp-server/dist/index.js"
      ],
      "env": {
        "MCP_API_BASE_URL": "http://localhost:3000",
        "MCP_API_KEY": "replace-with-local-key"
      }
    }
  }
}
```

## Remote Streamable HTTP Mode

Use only after local stdio is stable.

Expected endpoint:

```text
https://YOUR_DOMAIN/mcp
```

Requirements:

- Origin validation.
- Auth required.
- No unauthenticated local network exposure.
- No token-bearing data in resource responses.
- Logs redact authorization headers.

## Client Smoke Test

After connecting the MCP server, the AI client should be able to:

1. List tools.
2. Call `dispatch.health`.
3. Read `dispatch://voice-guide`.
4. Create a draft.
5. Run a voice check.
6. Queue a post only after the current revision passes.
7. Cancel that local test post so no public action occurs.
8. Read all four registered resources.

The repeatable client proof is:

```bash
MCP_API_BASE_URL=http://localhost:3100 \
MCP_API_KEY=<local-key> \
npm run test:smoke -w apps/mcp-server
```

It must report 17 tools, 4 resources and `publicSideEffect: false`.

## Tool Permission Posture

Default allow:

- create drafts
- edit drafts
- run voice checks
- list queue
- queue voice-approved posts
- read profile copy
- render templates
- read analytics

Extra-care tools:

- `dispatch.publish_post_now`
- `dispatch.cancel_post`
- `dispatch.refresh_analytics`

Never allow:

- LinkedIn browser automation.
- LinkedIn scraping.
- Messaging.
- Auto-connect.
- Auto-like/comment/follow/repost.
- Raw HTTP requests to LinkedIn.

## Remote Transport Stop

The shipped adapter is local stdio. Do not describe it as a hosted ChatGPT connector until a remote Streamable HTTP transport, origin validation, authentication, redacted logging and an approved deployment have passed their own finished-build test.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
