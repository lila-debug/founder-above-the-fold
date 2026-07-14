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
    description: "Run the British English voice gate for a draft post.",
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

server.registerResource(
  "dispatch-voice-guide",
  "dispatch://voice-guide",
  {
    title: "Founder Above the Fold Voice Guide",
    description: "British English and Prototype Cafe voice rules.",
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
          "- British English only.",
          "- No engagement bait.",
          "- No fabricated client results.",
          "- Calm confidence, exact product judgement, warm commercial clarity.",
          "- The current MCP tools create drafts and run voice checks only.",
          "- A future queue must require a passing voice check for the current revision.",
        ].join("\n"),
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
          "[Owner] -> [Founder workbench] -> [Draft] -> [Voice check] -> [Manual review]",
          "                         +-> [Safe MCP tools] -> [ChatGPT]",
          "[Planned only] -> [Queue] -> [Official LinkedIn API]",
          "",
          "### Assembly order",
          "1. Open the owner cabinet with a passwordless link.",
          "2. Fasten the database parts bin and inspect dispatch.health.",
          "3. Insert the official LinkedIn OAuth socket. Never provide LinkedIn keys to ChatGPT.",
          "4. Clamp the British English voice gate before any future queue can be fitted.",
          "5. Create drafts with dispatch.create_draft and test them with dispatch.run_voice_check.",
          "6. Keep profile edits and outreach sending manual.",
          "7. Treat queueing and official publishing as not implemented in this build.",
          "",
          "### Safety stickers",
          "- No LinkedIn scraping or browser automation.",
          "- No automated DMs, follows, likes, comments, reposts, or profile edits.",
          "- Any future publishing must use only approved LinkedIn APIs and owner-authorised tools.",
          "- Stop when setup evidence is missing; dispatch.health identifies unfilled labelled slots.",
        ].join("\n"),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
