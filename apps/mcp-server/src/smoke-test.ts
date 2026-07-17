import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const apiBaseUrl = process.env.MCP_API_BASE_URL ?? "http://localhost:3100";
const apiKey = process.env.MCP_API_KEY;

if (!apiKey) {
  throw new Error("MCP_API_KEY must be fitted before the MCP smoke test can turn.");
}

const inheritedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  ),
);
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL("./index.js", import.meta.url))],
  env: {
    ...inheritedEnvironment,
    MCP_API_BASE_URL: apiBaseUrl,
    MCP_API_KEY: apiKey,
  },
  stderr: "pipe",
});
const client = new Client({ name: "founder-above-the-fold-smoke", version: "0.1.0" });

try {
  await client.connect(transport);
  assert.equal(client.getServerVersion()?.name, "founder-above-the-fold");

  const tools = await client.listTools();
  const toolNames = new Set(tools.tools.map((tool) => tool.name));
  for (const expected of [
    "dispatch.health",
    "dispatch.create_draft",
    "dispatch.run_voice_check",
    "dispatch.queue_post",
    "dispatch.cancel_post",
    "dispatch.publish_post_now",
    "dispatch.get_profile_copy",
    "dispatch.upsert_profile_copy",
    "dispatch.list_templates",
    "dispatch.render_template",
    "dispatch.list_analytics",
    "dispatch.refresh_analytics",
  ]) {
    assert.ok(toolNames.has(expected), `MCP tool is missing: ${expected}`);
  }

  const health = await callJson("dispatch.health", {});
  assert.equal(health.safety.scraping, false);
  assert.equal(health.safety.browserAutomation, false);
  assert.equal(health.safety.automatedMessages, false);

  const templateLibrary = await callJson("dispatch.list_templates", {});
  assert.ok(Array.isArray(templateLibrary.items));
  assert.ok(templateLibrary.items.length >= 23);

  const created = await callJson("dispatch.create_draft", {
    body: "A clear product system helps founders decide what matters and explain the trade-off.",
    pillar: "Founder clarity",
    archetype: "Operating principle",
    notes: "Created by the local MCP finished-build test.",
  });
  const postId = String(created.item?.id ?? "");
  assert.ok(postId, "MCP draft creation did not return an item id.");

  const checked = await callJson("dispatch.run_voice_check", { post_id: postId });
  assert.equal(checked.item?.voiceStatus, "passed");

  const scheduledAt = new Date(Date.now() + 10 * 60_000).toISOString();
  const queued = await callJson("dispatch.queue_post", {
    post_id: postId,
    scheduled_at: scheduledAt,
  });
  assert.equal(queued.item?.status ?? queued.status, "queued");

  const cancelled = await callJson("dispatch.cancel_post", {
    post_id: postId,
    reason: "MCP smoke test complete; keep the public conveyor locked.",
  });
  assert.equal(cancelled.item?.status ?? cancelled.status, "cancelled");

  const resources = await client.listResources();
  const resourceUris = new Set(resources.resources.map((resource) => resource.uri));
  for (const uri of [
    "dispatch://templates/current",
    "dispatch://voice-guide",
    "dispatch://profile-copy/current",
    "dispatch://assembly-manual",
  ]) {
    assert.ok(resourceUris.has(uri), `MCP resource is missing: ${uri}`);
    const result = await client.readResource({ uri });
    assert.ok(result.contents.length > 0, `MCP resource is empty: ${uri}`);
  }

  process.stdout.write(
    JSON.stringify(
      {
        status: "passed",
        server: client.getServerVersion(),
        toolCount: tools.tools.length,
        resourceCount: resources.resources.length,
        workflow: ["draft", "voice-passed", "queued", "cancelled"],
        publicSideEffect: false,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await client.close();
}

async function callJson(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  assert.equal(result.isError, undefined, `MCP tool returned an error: ${name}`);
  assert.ok(Array.isArray(result.content), `MCP tool returned no content: ${name}`);
  const textContent = result.content.find(
    (item): item is { type: "text"; text: string } =>
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      item.type === "text" &&
      "text" in item &&
      typeof item.text === "string",
  );
  assert.ok(textContent, `MCP tool returned no text: ${name}`);
  return JSON.parse(textContent.text) as Record<string, any>;
}
