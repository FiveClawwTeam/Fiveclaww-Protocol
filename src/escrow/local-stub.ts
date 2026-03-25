import { ESCROW_PAYMENT_SCHEMA_VERSION, type EscrowPaymentIntent } from "../types/escrow-payment.js";

/**
 * In-memory escrow stub: demonstrates the state machine shape without real liquidity.
 */
export class LocalEscrowStub {
  private intents = new Map<string, EscrowPaymentIntent>();

  quote(params: Omit<EscrowPaymentIntent, "schema_version" | "state"> & { state?: never }): EscrowPaymentIntent {
    const intent: EscrowPaymentIntent = {
      schema_version: ESCROW_PAYMENT_SCHEMA_VERSION,
      ...params,
      state: "quoted",
    };
    this.intents.set(intent.intent_id, intent);
    return intent;
  }

  lock(intentId: string): EscrowPaymentIntent {
    const cur = this.require(intentId);
    if (cur.state !== "quoted") throw new Error(`Cannot lock from state ${cur.state}`);
    const next = { ...cur, state: "locked" as const };
    this.intents.set(intentId, next);
    return next;
  }

  markExecuting(intentId: string): EscrowPaymentIntent {
    const cur = this.require(intentId);
    if (cur.state !== "locked") throw new Error(`Cannot execute from state ${cur.state}`);
    const next = { ...cur, state: "executing" as const };
    this.intents.set(intentId, next);
    return next;
  }

  settle(intentId: string, settlementRef: string): EscrowPaymentIntent {
    const cur = this.require(intentId);
    if (cur.state !== "executing" && cur.state !== "pending_verification") {
      throw new Error(`Cannot settle from state ${cur.state}`);
    }
    const next: EscrowPaymentIntent = {
      ...cur,
      state: "settled",
      settlement_ref: settlementRef,
    };
    this.intents.set(intentId, next);
    return next;
  }

  get(intentId: string): EscrowPaymentIntent | undefined {
    return this.intents.get(intentId);
  }

  private require(intentId: string): EscrowPaymentIntent {
    const v = this.intents.get(intentId);
    if (!v) throw new Error(`Unknown intent ${intentId}`);
    return v;
  }
}
