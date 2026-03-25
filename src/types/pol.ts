/**
 * TypeScript mirror of `spec/pol.schema.json`.
 * Canonical source of truth for interoperability is the JSON Schema in `/spec`.
 */
export const POL_SCHEMA_VERSION = "fiveclaww.pol.v1" as const;

export type ProofOfLaborRecord = {
  schema_version: typeof POL_SCHEMA_VERSION;
  task_id: string;
  agent_id: string;
  input_hash: `sha256:${string}`;
  output_hash: `sha256:${string}`;
  proof: Record<string, unknown>;
  success: boolean;
  created_at: string;
  signing_public_key_b58: string;
  signature_b64: string;
};
