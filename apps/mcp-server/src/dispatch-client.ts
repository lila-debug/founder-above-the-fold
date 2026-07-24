export type FounderHealth = {
  name: string;
  status: string;
  linkedin: string;
  auth: string;
  capabilities: {
    draftCrud: string;
    voiceGate: string;
    queueScheduling: string;
    officialApiPublishing: string;
    analytics: string;
    templateLibrary: string;
  };
  safety: {
    scraping: boolean;
    browserAutomation: boolean;
    automatedMessages: boolean;
    officialApiPublishing: boolean;
  };
};

export class FounderClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor() {
    this.baseUrl = process.env.MCP_API_BASE_URL ?? "http://localhost:3000";
    this.apiKey = process.env.MCP_API_KEY;
  }

  async health(): Promise<FounderHealth> {
    const response = await fetch(`${this.baseUrl}/api/mcp/health`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Founder Above the Fold health check failed: ${response.status}`);
    }

    return response.json() as Promise<FounderHealth>;
  }

  async createDraft(input: {
    body: string;
    languageCode?: string;
    pillar?: string;
    archetype?: string;
    notes?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/posts`, {
      method: "POST",
      headers: this.headers({ json: true }),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Founder Above the Fold draft create failed: ${response.status}`);
    }

    return response.json();
  }

  async listPosts(status?: string, limit = 50) {
    const query = new URLSearchParams({ limit: String(limit) });

    if (status) {
      query.set("status", status);
    }

    return this.request(`/api/posts?${query.toString()}`);
  }

  async getPost(postId: string) {
    return this.request(`/api/posts/${encodeURIComponent(postId)}`);
  }

  async updateDraft(
    postId: string,
    input: {
      body?: string;
      languageCode?: string;
      pillar?: string;
      archetype?: string;
      notes?: string;
    },
  ) {
    return this.request(`/api/posts/${encodeURIComponent(postId)}`, {
      method: "PATCH",
      json: input,
    });
  }

  async runVoiceCheck(postId: string) {
    return this.request(`/api/posts/${encodeURIComponent(postId)}/voice-check`, {
      method: "POST",
    });
  }

  async queuePost(postId: string, scheduledAt: string) {
    return this.request(`/api/posts/${encodeURIComponent(postId)}/queue`, {
      method: "POST",
      json: { scheduledAt },
    });
  }

  async cancelPost(postId: string, reason?: string) {
    return this.request(`/api/posts/${encodeURIComponent(postId)}/cancel`, {
      method: "POST",
      json: { reason },
    });
  }

  async publishPostNow(postId: string, confirmPublication: true) {
    return this.request(`/api/posts/${encodeURIComponent(postId)}/publish-now`, {
      method: "POST",
      json: { confirmPublication },
    });
  }

  async getProfileCopy() {
    return this.request("/api/profile-copy");
  }

  async upsertProfileCopy(input: {
    field: string;
    content: string;
    changeNote?: string;
  }) {
    return this.request("/api/profile-copy", { method: "POST", json: input });
  }

  async listTemplates(type?: "outreach" | "post") {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    return this.request(`/api/templates${query}`);
  }

  async createTemplate(input: {
    type: "outreach" | "post";
    scenarioTag: string;
    body: string;
    notes?: string;
  }) {
    return this.request("/api/templates", { method: "POST", json: input });
  }

  async updateTemplate(
    templateId: string,
    input: { scenarioTag?: string; body?: string; notes?: string },
  ) {
    return this.request(`/api/templates/${encodeURIComponent(templateId)}`, {
      method: "PATCH",
      json: input,
    });
  }

  async renderTemplate(templateId: string, variables: Record<string, string>) {
    return this.request(`/api/templates/${encodeURIComponent(templateId)}/render`, {
      method: "POST",
      json: { variables },
    });
  }

  async listAnalytics() {
    return this.request("/api/analytics/posts");
  }

  async refreshAnalytics(postId?: string) {
    return this.request("/api/analytics/refresh", {
      method: "POST",
      json: postId ? { postId } : {},
    });
  }

  private async request(
    path: string,
    options: { method?: string; json?: unknown } = {},
  ) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: this.headers({ json: options.json !== undefined }),
      body: options.json === undefined ? undefined : JSON.stringify(options.json),
    });

    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      const detail =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error: unknown }).error)
          : `HTTP ${response.status}`;
      throw new Error(`Founder Above the Fold request failed: ${detail}`);
    }

    return payload;
  }

  private headers({ json = false }: { json?: boolean } = {}) {
    const headers = new Headers({ Accept: "application/json" });

    if (json) {
      headers.set("Content-Type", "application/json");
    }

    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }

    return headers;
  }
}
