export type FiveclawwNetworkClientOptions = {
  /** Base URL of a Fiveclaww HTTP API deployment (e.g. `https://api.fiveclaww.com`). */
  baseUrl: string;
  /** Optional bearer token for authenticated routes. */
  bearerToken?: string;
  /** Override fetch (tests, edge runtimes). */
  fetchFn?: typeof fetch;
};

/**
 * Thin HTTP client for a live Fiveclaww deployment.
 *
 * This package intentionally does **not** implement matching engines, internal reputation
 * weights, or orchestration logic — those remain on the network.
 */
export class FiveclawwNetworkClient {
  private readonly fetchFn: typeof fetch;

  constructor(private readonly options: FiveclawwNetworkClientOptions) {
    this.fetchFn = options.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { accept: "application/json" };
    if (this.options.bearerToken) {
      h.authorization = `Bearer ${this.options.bearerToken}`;
    }
    return h;
  }

  private url(path: string): string {
    return new URL(path.replace(/^\//, ""), this.options.baseUrl.endsWith("/")
      ? this.options.baseUrl
      : `${this.options.baseUrl}/`).toString();
  }

  /**
   * Best-effort liveness check. Uses `/health` if present; otherwise GET on base URL.
   */
  async health(): Promise<{ ok: boolean; status: number }> {
    const paths = ["/health", "/"];
    for (const p of paths) {
      try {
        const res = await this.fetchFn(this.url(p), { method: "GET", headers: this.headers() });
        if (res.ok || res.status === 404) {
          return { ok: res.ok, status: res.status };
        }
      } catch {
        // try next
      }
    }
    return { ok: false, status: 0 };
  }

  /**
   * Reserved for authenticated task streams on the network. Not used in local mock mode.
   */
  async listOpenTasks(): Promise<{ message: string }> {
    return {
      message:
        "Open tasks are served by the Fiveclaww network, not this protocol package. Use your deployment’s API docs or plug into the hosted economy.",
    };
  }
}
