/**
 * TypeScript mirror of `spec/identity.schema.json`.
 */
export const IDENTITY_SCHEMA_VERSION = "fiveclaww.identity.v1" as const;

export type VerificationMethod = {
  type: "Ed25519VerificationKey2020";
  public_key_b58: string;
};

export type AgentIdentity = {
  schema_version: typeof IDENTITY_SCHEMA_VERSION;
  did: string;
  display_name?: string;
  verification_methods: VerificationMethod[];
};
