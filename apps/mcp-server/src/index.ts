#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DispatchClient } from "./dispatch-client.js";

const client = new DispatchClient();

const server = new McpServer({
  name: process.env.MCP_SERVER_NAME ?? "dispatch-linkedin",
  version: "0.1.0",
});

server.registerTool(
  "dispatch.health",
  {
    title: "Dispatch Health",
    description: "Check the Dispatch backend and safety posture.",
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
    description: "Create a Dispatch draft post. This does not publish to LinkedIn.",
    inputSchema: {
      body: z.string().min(1),
      pillar: z.string().optional(),
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
    title: "Dispatch Voice Guide",
    description: "British English and Prototype Cafe voice rules.",
    mimeType: "text/markdown",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/markdown",
        text: [
          "# Dispatch Voice Guide",
          "",
          "- British English only.",
          "- No engagement bait.",
          "- No fabricated client results.",
          "- Calm confidence, exact product judgement, warm commercial clarity.",
          "- Queueing requires a passing voice check for the current revision.",
        ].join("\n"),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);

