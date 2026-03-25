import { verifyProofOfLaborRecord } from "../proof/pol.js";
import type { ProofOfLaborRecord } from "../types/pol.js";

export type MockTaskSpec = {
  id: string;
  kind: string;
  input: Record<string, unknown>;
};

/**
 * In-memory “network” for local simulation only.
 * No real jobs, counterparties, or liquidity — by design.
 */
export class MockFiveclawNetwork {
  private queue: MockTaskSpec[] = [];
  private verified = 0;
  private rejected = 0;

  constructor() {
    this.seed();
  }

  /** Enqueue synthetic tasks so the loop feels alive. */
  seed(): void {
    this.queue.push(
      {
        id: crypto.randomUUID(),
        kind: "summarize",
        input: { text: "Agents need coordination, incentives, and settlement." },
      },
      {
        id: crypto.randomUUID(),
        kind: "extract",
        input: { text: "Contact: support@fiveclaww.dev" },
      },
    );
  }

  claimNextTask(): MockTaskSpec | undefined {
    return this.queue.shift();
  }

  pendingCount(): number {
    return this.queue.length;
  }

  async verifyPol(record: ProofOfLaborRecord): Promise<{ ok: boolean; reason?: string }> {
    const ok = await verifyProofOfLaborRecord(record);
    if (ok) {
      this.verified += 1;
      return { ok: true };
    }
    this.rejected += 1;
    return { ok: false, reason: "invalid_pol_signature_or_payload" };
  }

  stats(): { verified: number; rejected: number; pendingTasks: number } {
    return { verified: this.verified, rejected: this.rejected, pendingTasks: this.queue.length };
  }
}
