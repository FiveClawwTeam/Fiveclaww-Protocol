import * as ed from "@noble/ed25519";

import { buildAgentIdentity } from "../identity/did.js";
import { createProofOfLaborRecord, verifyProofOfLaborRecord } from "../proof/pol.js";
import { computeLocalReputationSnapshot } from "../reputation/local.js";
import { LocalEscrowStub } from "../escrow/local-stub.js";
import type { AgentIdentity } from "../types/identity.js";
import type { ProofOfLaborRecord } from "../types/pol.js";
import type { ReputationSnapshot } from "../types/reputation.js";
import type { EscrowPaymentIntent } from "../types/escrow-payment.js";

export type LocalAgentCredentials = {
  identity: AgentIdentity;
  /** Keep on the agent host only — never paste into a browser. */
  secretKey: Uint8Array;
};

/**
 * Minimal local SDK: register, execute a task with PoL, verify, and track local reputation.
 * No network, no liquidity, no global ranking.
 */
export class FiveclawLocalClient {
  private agent: LocalAgentCredentials | null = null;
  private completed = 0;
  private failed = 0;
  readonly escrow = new LocalEscrowStub();

  async createAgent(displayName?: string): Promise<LocalAgentCredentials> {
    const secretKey = ed.utils.randomPrivateKey();
    const publicKey = await ed.getPublicKey(secretKey);
    const identity = buildAgentIdentity({ publicKey, displayName });
    this.agent = { identity, secretKey };
    return this.agent;
  }

  useAgent(credentials: LocalAgentCredentials): void {
    this.agent = credentials;
  }

  getIdentity(): AgentIdentity {
    if (!this.agent) throw new Error("No agent registered. Call createAgent() first.");
    return this.agent.identity;
  }

  async executeTask(params: {
    taskId: string;
    input: unknown;
    output: unknown;
    proof: Record<string, unknown>;
    success: boolean;
  }): Promise<ProofOfLaborRecord> {
    if (!this.agent) throw new Error("No agent registered. Call createAgent() first.");
    const record = await createProofOfLaborRecord({
      secretKey: this.agent.secretKey,
      taskId: params.taskId,
      input: params.input,
      output: params.output,
      proof: params.proof,
      success: params.success,
    });
    if (params.success) this.completed += 1;
    else this.failed += 1;
    return record;
  }

  async verifyPol(record: ProofOfLaborRecord): Promise<boolean> {
    return verifyProofOfLaborRecord(record);
  }

  getLocalReputation(): ReputationSnapshot {
    if (!this.agent) throw new Error("No agent registered. Call createAgent() first.");
    return computeLocalReputationSnapshot({
      agentId: this.agent.identity.did,
      tasksCompleted: this.completed,
      tasksFailed: this.failed,
    });
  }

  /** Demo escrow quote — funds are not real. */
  quoteEscrow(params: {
    intentId: string;
    payerAgentId: string;
    payeeAgentId: string;
    amountMinor: number;
    currencyCode: string;
    taskId?: string;
  }): EscrowPaymentIntent {
    return this.escrow.quote({
      intent_id: params.intentId,
      task_id: params.taskId,
      payer_agent_id: params.payerAgentId,
      payee_agent_id: params.payeeAgentId,
      amount_minor: params.amountMinor,
      currency_code: params.currencyCode,
    });
  }
}
