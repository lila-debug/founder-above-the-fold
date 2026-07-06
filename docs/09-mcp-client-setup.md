# MCP Client Setup

## Purpose

This file defines how AI clients should connect to Dispatch once the MCP server exists.

The server should expose Dispatch tools and resources only. It should not expose raw LinkedIn credentials, generic HTTP tools, shell access, browser automation, or arbitrary LinkedIn API calls.

## Local Stdio Mode

Use this first.

Expected command after implementation:

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
6. Queue a post only after voice check passes.

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
- `dispatch.mark_profile_copy_synced`

Never allow:

- LinkedIn browser automation.
- LinkedIn scraping.
- Messaging.
- Auto-connect.
- Auto-like/comment/follow/repost.
- Raw HTTP requests to LinkedIn.

## MCP Inspector

Once implemented, add package scripts similar to:

```json
{
  "scripts": {
    "mcp:dev": "tsx src/index.ts",
    "mcp:build": "tsc -p tsconfig.json",
    "mcp:inspect": "npx @modelcontextprotocol/inspector node dist/index.js"
  }
}
```

Use the inspector before connecting production clients.

