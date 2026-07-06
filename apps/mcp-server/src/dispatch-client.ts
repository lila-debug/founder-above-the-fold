export type DispatchHealth = {
  name: string;
  status: string;
  linkedin: string;
  auth: string;
  safety: {
    scraping: boolean;
    browserAutomation: boolean;
    automatedMessages: boolean;
    officialApiPublishing: boolean;
  };
};

export class DispatchClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor() {
    this.baseUrl = process.env.MCP_API_BASE_URL ?? "http://localhost:3000";
    this.apiKey = process.env.MCP_API_KEY;
  }

  async health(): Promise<DispatchHealth> {
    const response = await fetch(`${this.baseUrl}/api/mcp/health`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Dispatch health check failed: ${response.status}`);
    }

    return response.json() as Promise<DispatchHealth>;
  }

  async createDraft(input: { body: string; pillar?: string; notes?: string }) {
    return {
      post_id: crypto.randomUUID(),
      status: "draft",
      voice_status: "unchecked",
      ...input,
    };
  }

  async runVoiceCheck(postId: string) {
    return {
      post_id: postId,
      voice_status: "pending_backend",
      message: "Voice runner will attach here when the backend endpoint is implemented.",
    };
  }

  private headers() {
    const headers = new Headers({ Accept: "application/json" });

    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }

    return headers;
  }
}
