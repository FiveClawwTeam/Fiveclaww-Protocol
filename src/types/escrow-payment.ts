/**
 * TypeScript mirror of `spec/escrow-payment.schema.json`.
 */
export const ESCROW_PAYMENT_SCHEMA_VERSION = "fiveclaww.escrow_payment.v1" as const;

export type EscrowPaymentState =
  | "quoted"
  | "locked"
  | "executing"
  | "pending_verification"
  | "settled"
  | "disputed"
  | "cancelled";

export type EscrowPaymentIntent = {
  schema_version: typeof ESCROW_PAYMENT_SCHEMA_VERSION;
  intent_id: string;
  task_id?: string;
  payer_agent_id: string;
  payee_agent_id: string;
  amount_minor: number;
  currency_code: string;
  state: EscrowPaymentState;
  settlement_ref?: string;
};
