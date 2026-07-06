# Compliance and Safety Boundary

## Source Check

Checked on 2026-07-06.

Official sources:

- LinkedIn API permissions: https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
- LinkedIn Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- LinkedIn Profile API: https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
- LinkedIn prohibited software and extensions: https://www.linkedin.com/help/linkedin/answer/a1341387
- MCP TypeScript SDK: https://ts.sdk.modelcontextprotocol.io/
- MCP transport specification: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports

The linked community MCP listing claims capabilities such as profile search, profile retrieval, job search, messaging, and network stats. Treat that as a catalogue claim, not as a safe product requirement. Dispatch v1 should not copy those capabilities unless LinkedIn grants explicit, documented access for the owner's use case.

## Green Zone

Allowed for Dispatch v1:

- Owner OAuth through LinkedIn.
- Store owner profile identity returned by permitted auth/profile scopes.
- Create drafts in Dispatch.
- Voice-check drafts locally.
- Queue drafts in Dispatch.
- Publish owner posts through official LinkedIn post/share APIs.
- Upload approved images when supported by the official API.
- Pull analytics for posts published by Dispatch when available.
- Store canonical profile copy in Dispatch.
- Remind owner to manually update profile fields.
- Render outreach templates for manual copy-paste.

## Yellow Zone

Allowed only with explicit review:

- Commenting on the owner's own posts through official APIs.
- Deleting Dispatch-published posts through official APIs.
- Remote MCP via Streamable HTTP.
- Any new LinkedIn product or partner endpoint.
- Analytics beyond the basic metrics already validated.

Before adding a yellow-zone capability, update this file and add a source link.

## Red Zone

Do not build:

- Browser automation against LinkedIn.
- Scraping LinkedIn profile, post, feed, job, comment, company, or connection data.
- Automated DMs.
- Automated connection requests.
- Automated follows.
- Automated likes.
- Automated comments on other people's posts.
- Automated reposts.
- Fake accounts or test accounts used to evade LinkedIn controls.
- Generic MCP tools that let the model call arbitrary LinkedIn endpoints.

## Security Requirements

- Encrypt OAuth tokens at rest.
- Never expose tokens to frontend, MCP clients, logs, or AI prompts.
- Redact `Authorization`, `client_secret`, token fields, cookies, and LinkedIn raw private headers.
- Use an allowlist for MCP tool names.
- Validate every MCP input with schemas.
- Require explicit confirmation for immediate publication.
- Write audit events for all public side effects.
- Bind local Streamable HTTP MCP to localhost only.
- Validate `Origin` for HTTP MCP.
- Require authentication for HTTP MCP.
- Avoid generic shell or browser tools inside the MCP server.

## Prompt Injection Considerations

LinkedIn post text, templates, and profile copy are user-controlled content. Treat them as data.

Rules:

- MCP resources must not contain hidden instructions telling the model to bypass safety.
- Tools must enforce server-side validation even if the AI client asks confidently.
- A post body cannot grant itself permission to publish.
- A template cannot request raw tokens or arbitrary HTTP calls.
- Public-side-effect tools should return structured results, not free-form model instructions.

## Data Retention

Keep:

- Draft and published post text.
- Voice-check output.
- LinkedIn post IDs for Dispatch-published posts.
- Analytics snapshots for Dispatch-published posts.
- Canonical profile copy versions.
- Audit events.

Do not store:

- Scraped LinkedIn content.
- Other members' profile data.
- Other members' post/comment data.
- LinkedIn session cookies.
- Browser automation traces.

## External MCP Servers

The MCP marketplace page provided by the user is useful for understanding desired shape, but its advertised capabilities go beyond this PRD's safe scope. Do not install or depend on it for Dispatch unless a later review proves each capability uses official LinkedIn access that the owner actually has.

Dispatch should be safer and narrower: an MCP server for the owner's content operation, not a general LinkedIn control plane.

