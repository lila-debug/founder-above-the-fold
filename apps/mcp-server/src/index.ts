#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { FounderClient } from "./dispatch-client.js";

const client = new FounderClient();

const server = new McpServer({
  name: process.env.MCP_SERVER_NAME ?? "founder-above-the-fold",
  version: "0.1.0",
});

server.registerTool(
  "dispatch.health",
  {
    title: "Founder Above the Fold Health",
    description: "Check the Founder Above the Fold backend and safety posture.",
    inputSchema: {},
  },
  async () => {
    const health = await client.health();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(health, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "dispatch.create_draft",
  {
    title: "Create Draft",
    description:
      "Create a Founder Above the Fold draft post. This does not publish to LinkedIn.",
    inputSchema: {
      body: z.string().min(1),
      languageCode: z
        .enum(["en-CA", "en-GB", "en-US", "en-AU", "en", "fr-FR", "fr-CA"])
        .optional()
        .describe("Draft language/dialect. Defaults to Canadian English."),
      pillar: z.string().optional(),
      archetype: z.string().optional(),
      notes: z.string().optional(),
    },
  },
  async (input) => {
    const draft = await client.createDraft(input);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(draft, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "dispatch.run_voice_check",
  {
    title: "Run Voice Check",
    description: "Run the draft's selected language and voice gate.",
    inputSchema: {
      post_id: z.string().min(1),
    },
  },
  async ({ post_id }) => {
    const result = await client.runVoiceCheck(post_id);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "dispatch.list_posts",
  {
    title: "List Posts",
    description: "List owner posts by workflow state.",
    inputSchema: {
      status: z
        .enum(["draft", "queued", "publishing", "published", "failed", "cancelled"])
        .optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
  },
  async ({ status, limit }) => jsonResult(await client.listPosts(status, limit)),
);

server.registerTool(
  "dispatch.get_post",
  {
    title: "Get Post",
    description: "Read one post and its current workflow state.",
    inputSchema: { post_id: z.string().min(1) },
  },
  async ({ post_id }) => jsonResult(await client.getPost(post_id)),
);

server.registerTool(
  "dispatch.update_draft",
  {
    title: "Update Draft",
    description: "Update an unpublished draft and reset its voice lock when text changes.",
    inputSchema: {
      post_id: z.string().min(1),
      body: z.string().min(1).optional(),
      languageCode: z
        .enum(["en-CA", "en-GB", "en-US", "en-AU", "en", "fr-FR", "fr-CA"])
        .optional(),
      pillar: z.string().optional(),
      archetype: z.string().optional(),
      notes: z.string().optional(),
    },
  },
  async ({ post_id, ...input }) => jsonResult(await client.updateDraft(post_id, input)),
);

server.registerTool(
  "dispatch.queue_post",
  {
    title: "Queue Post",
    description:
      "Schedule a draft only after the current revision passes the voice gate. This does not publish immediately.",
    inputSchema: {
      post_id: z.string().min(1),
      scheduled_at: z.string().datetime(),
    },
  },
  async ({ post_id, scheduled_at }) =>
    jsonResult(await client.queuePost(post_id, scheduled_at)),
);

server.registerTool(
  "dispatch.cancel_post",
  {
    title: "Cancel Queued Post",
    description: "Cancel a queued post before it reaches the publishing conveyor.",
    inputSchema: {
      post_id: z.string().min(1),
      reason: z.string().max(500).optional(),
    },
  },
  async ({ post_id, reason }) => jsonResult(await client.cancelPost(post_id, reason)),
);

server.registerTool(
  "dispatch.publish_post_now",
  {
    title: "Publish Confirmed Post Now",
    description:
      "Publish a voice-passed draft or queued post through LinkedIn's official API. The owner must explicitly confirm this public action.",
    inputSchema: {
      post_id: z.string().min(1),
      confirm_publication: z.literal(true),
    },
  },
  async ({ post_id, confirm_publication }) =>
    jsonResult(await client.publishPostNow(post_id, confirm_publication)),
);

server.registerTool(
  "dispatch.get_profile_copy",
  {
    title: "Read Profile Copy",
    description: "Read the canonical profile copy and manual-paste state.",
    inputSchema: {},
  },
  async () => jsonResult(await client.getProfileCopy()),
);

server.registerTool(
  "dispatch.upsert_profile_copy",
  {
    title: "Update Profile Copy",
    description:
      "Create a canonical profile-copy version. This never edits LinkedIn automatically.",
    inputSchema: {
      field: z.enum(["headline", "about", "experience"]),
      content: z.string().min(1),
      change_note: z.string().optional(),
    },
  },
  async ({ field, content, change_note }) =>
    jsonResult(
      await client.upsertProfileCopy({ field, content, changeNote: change_note }),
    ),
);

server.registerTool(
  "dispatch.list_templates",
  {
    title: "List Manual Templates",
    description: "List copy-only outreach templates or post-idea jigs.",
    inputSchema: { type: z.enum(["outreach", "post"]).optional() },
  },
  async ({ type }) => jsonResult(await client.listTemplates(type)),
);

server.registerTool(
  "dispatch.create_template",
  {
    title: "Create Manual Template",
    description: "Create a versioned text template. Outreach remains manual and is never sent.",
    inputSchema: {
      type: z.enum(["outreach", "post"]),
      scenario_tag: z.string().min(1).max(80),
      body: z.string().min(1).max(5000),
      notes: z.string().max(1000).optional(),
    },
  },
  async ({ type, scenario_tag, body, notes }) =>
    jsonResult(await client.createTemplate({ type, scenarioTag: scenario_tag, body, notes })),
);

server.registerTool(
  "dispatch.update_template",
  {
    title: "Update Manual Template",
    description: "Update a template and advance its version when the panel changes.",
    inputSchema: {
      template_id: z.string().min(1),
      scenario_tag: z.string().min(1).max(80).optional(),
      body: z.string().min(1).max(5000).optional(),
      notes: z.string().max(1000).optional(),
    },
  },
  async ({ template_id, scenario_tag, body, notes }) =>
    jsonResult(
      await client.updateTemplate(template_id, {
        scenarioTag: scenario_tag,
        body,
        notes,
      }),
    ),
);

server.registerTool(
  "dispatch.render_template",
  {
    title: "Render Copy-Only Template",
    description: "Fit labelled text variables and return copy for manual inspection and use.",
    inputSchema: {
      template_id: z.string().min(1),
      variables: z.record(z.string(), z.string()).default({}),
    },
  },
  async ({ template_id, variables }) =>
    jsonResult(await client.renderTemplate(template_id, variables)),
);

server.registerResource(
  "dispatch-template-library",
  "dispatch://templates/current",
  {
    title: "Current Manual Template Library",
    description: "Versioned outreach copy and post-idea jigs. Nothing is sent automatically.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(await client.listTemplates(), null, 2),
      },
    ],
  }),
);

server.registerTool(
  "dispatch.list_analytics",
  {
    title: "List Official Post Analytics",
    description: "Read stored official LinkedIn snapshots for the owner's published posts.",
    inputSchema: {},
  },
  async () => jsonResult(await client.listAnalytics()),
);

server.registerTool(
  "dispatch.refresh_analytics",
  {
    title: "Refresh Official Post Analytics",
    description: "Pull official owner-post metrics when LinkedIn has granted the separate analytics scope.",
    inputSchema: { post_id: z.string().min(1).optional() },
  },
  async ({ post_id }) => jsonResult(await client.refreshAnalytics(post_id)),
);

server.registerResource(
  "dispatch-voice-guide",
  "dispatch://voice-guide",
  {
    title: "Founder Above the Fold Voice Guide",
    description: "Selected language/dialect and Prototype Cafe voice rules.",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: [
          "# Founder Above the Fold Voice Guide",
          "",
          "- Preserve the draft's selected English dialect, Parisian French, or Québécois French.",
          "- No engagement bait.",
          "- No fabricated client results.",
          "- Calm confidence, exact product judgement, warm commercial clarity.",
          "- Queueing requires a passing voice check for the current revision.",
          "- Publishing is a public side effect and requires explicit owner confirmation.",
        ].join("\n"),
      },
    ],
  }),
);

server.registerResource(
  "dispatch-profile-copy-current",
  "dispatch://profile-copy/current",
  {
    title: "Current Founder Profile Copy",
    description:
      "Canonical headline, About and Experience copy with manual-paste status.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(await client.getProfileCopy(), null, 2),
      },
    ],
  }),
);

server.registerResource(
  "dispatch-assembly-manual",
  "dispatch://assembly-manual",
  {
    title: "Founder Above the Fold Assembly Manual",
    description:
      "The shared IKEA-style operating manual for the LinkedIn workbench and ChatGPT app.",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: [
          "# Founder Above the Fold",
          "## IKEA / Meccano Assembly Manual Edition",
          "",
          "### Mission Control Board",
          "[Owner] -> [Founder workbench] -> [Draft] -> [Voice check] -> [Queue]",
          "                         +-> [Safe MCP tools] -> [ChatGPT]",
          "[Confirmed or due] -> [Official LinkedIn API] -> [Published post]",
          "",
          "### Assembly order",
          "1. Open the owner cabinet with a passwordless link.",
          "2. Fasten the database parts bin and inspect dispatch.health.",
          "3. Insert the official LinkedIn OAuth socket. Never provide LinkedIn keys to ChatGPT.",
          "4. Label the draft's language or dialect, then clamp the matching voice gate before queueing.",
          "5. Create drafts, run the voice check, then queue or cancel them with the dispatch tools.",
          "6. Keep profile edits and outreach sending manual.",
          "7. Use dispatch.publish_post_now only after the owner explicitly confirms the public post.",
          "",
          "### Safety stickers",
          "- No LinkedIn scraping or browser automation.",
          "- No automated DMs, follows, likes, comments, reposts, or profile edits.",
          "- Publishing uses only LinkedIn's official API and owner-authorised tools.",
          "- Stop when setup evidence is missing; dispatch.health identifies unfilled labelled slots.",
        ].join("\n"),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);

function jsonResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}
