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

  async runVoiceCheck(postId: string) {
    const response = await fetch(`${this.baseUrl}/api/posts/${postId}/voice-check`, {
      method: "POST",
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Founder Above the Fold voice check failed: ${response.status}`);
    }

    return response.json();
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
