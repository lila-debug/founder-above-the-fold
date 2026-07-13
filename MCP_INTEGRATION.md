# LinkedIn MCP Server Integration Guide

## What is the LinkedIn MCP Server?

The MCP (Model Context Protocol) server at https://github.com/souravdasbiswas/linkedin-mcp-server provides AI assistants (like Claude) with direct access to LinkedIn's official API. It enables:

- **Posting** to LinkedIn via AI commands
- **Deleting** posts
- **Listing** your posts
- **Creating events**
- **Reacting** to posts
- **Reading** your profile info

**Key benefit**: No scraping, no fake engagement, no account risk. 100% official LinkedIn API.

---

## How This App Uses LinkedIn

### Current Implementation (Built-In)

The app already has **direct LinkedIn publishing**:

1. **OAuth 2.0 Authentication**
   - Users connect their LinkedIn account via `/dashboard/settings`
   - Tokens stored securely in PostgreSQL
   - Uses official `Sign In with LinkedIn` + `Share on LinkedIn` scopes

2. **One-Click Publishing**
   - Draft → Voice Check → Publish button
   - Calls `/api/posts/[id]/publish`
   - Posts directly to LinkedIn with text only (for now)

3. **Post History**
   - Stores LinkedIn post ID + URN
   - Tracks status (draft → published)
   - Stores failure reasons if publishing fails

---

## Optional: MCP Server for AI Command Centre

To enable Claude to say *"make me visible this week"* and have the AI generate, check, and publish posts:

### Step 1: Set Up LinkedIn Developer App

1. Go to [linkedin.com/developers/apps](https://www.linkedin.com/developers/apps)
2. Create app:
   - **Name**: "Founder Above the Fold MCP"
   - **Page**: Your LinkedIn page
   - **Privacy policy**: Any URL
   - **Logo**: Any image (required)
3. Go to **Auth** tab, copy **Client ID** and **Client Secret**
4. Add redirect URL: `http://localhost:3000/callback`
5. Go to **Products** tab, request:
   - "Sign In with LinkedIn using OpenID Connect"
   - "Share on LinkedIn"

### Step 2: Run the MCP Server (Local Development Only)

```bash
# Clone the MCP server
git clone https://github.com/souravdasbiswas/linkedin-mcp-server.git
cd linkedin-mcp-server
npm install
npm run build

# Start the server
LINKEDIN_CLIENT_ID=your_client_id \
LINKEDIN_CLIENT_SECRET=your_client_secret \
node dist/index.js
```

### Step 3: Connect to Claude Desktop

Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "node",
      "args": ["/path/to/linkedin-mcp-server/dist/index.js"],
      "env": {
        "LINKEDIN_CLIENT_ID": "your_client_id",
        "LINKEDIN_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

Restart Claude Desktop. You can now say to Claude:

> "I have access to the LinkedIn MCP server. Generate and publish a post about shipping a new feature."

Claude will:
1. Generate post text
2. Ask permission to publish
3. Call the MCP server's `linkedin_create_post` tool
4. Publish directly to LinkedIn

---

## Architecture Decision: Web App vs MCP Server

### This App (Direct API Integration)
✅ **Best for**:
- Scheduled posts
- Batch operations
- Generating + publishing directly
- Production deployments

❌ **Limitations**:
- No real-time interaction
- No feedback loops with Claude
- Runs on fixed schedule

### MCP Server (Claude Integration)
✅ **Best for**:
- Interactive AI assistance
- Real-time feedback
- "Make me visible this week" commands
- Iterative post refinement

❌ **Limitations**:
- Requires Claude Desktop
- Manual operator required
- Not production-scheduled

---

## Current Capabilities

### What This App Does (No MCP Needed)

- ✅ Magic link login (no passwords)
- ✅ 10-minute onboarding questionnaire
- ✅ AI-generated profile copy (headline, about, experience)
- ✅ AI-generated 14 personalized posts
- ✅ Voice check (British English, banned words, emoji detection)
- ✅ LinkedIn connection (OAuth)
- ✅ **One-click publish to LinkedIn**
- ✅ Queue and schedule posts
- ✅ Track publishing status and failures
- ✅ Dashboard with stats and manual task tracker

### What You Could Add (With MCP Server)

- 🔲 Claude assistant for interactive post generation
- 🔲 "Make me visible this week" commands
- 🔲 Real-time LinkedIn feed analysis
- 🔲 Automated comment/engagement suggestions

---

## Next Steps

**For launching NOW:**
- App is ready to deploy ✅
- No MCP server needed ✅

**For future AI assistant (Claude):**
1. Set up LinkedIn Developer App
2. Clone and run MCP server locally
3. Configure Claude Desktop
4. Use Claude for interactive publishing

**For production MCP deployment:**
- Deploy MCP server as Node.js service
- Configure as backend for web app
- Add MCP integration endpoints to API
- Route AI commands through MCP server

---

## Links

- **LinkedIn MCP Server**: https://github.com/souravdasbiswas/linkedin-mcp-server
- **LinkedIn Developer Portal**: https://www.linkedin.com/developers/apps
- **Model Context Protocol**: https://modelcontextprotocol.io
- **Official LinkedIn API Docs**: https://docs.microsoft.com/en-us/linkedin/shared/api-guide/reference

---

**Bottom line**: The app works perfectly as-is. The MCP server is an optional enhancement for Claude integration.
