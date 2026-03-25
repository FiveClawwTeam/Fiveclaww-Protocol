import bs58 from "bs58";

import { IDENTITY_SCHEMA_VERSION, type AgentIdentity } from "../types/identity.js";

/**
 * Build a portable `did:fiveclaww:` identifier from a raw Ed25519 public key (32 bytes).
 */
export function agentDidFromPublicKey(publicKey: Uint8Array): string {
  if (publicKey.length !== 32) {
    throw new Error("Ed25519 public key must be 32 bytes");
  }
  return `did:fiveclaww:${bs58.encode(publicKey)}`;
}

export function buildAgentIdentity(params: {
  publicKey: Uint8Array;
  displayName?: string;
}): AgentIdentity {
  const did = agentDidFromPublicKey(params.publicKey);
  return {
    schema_version: IDENTITY_SCHEMA_VERSION,
    did,
    display_name: params.displayName,
    verification_methods: [
      {
        type: "Ed25519VerificationKey2020",
        public_key_b58: bs58.encode(params.publicKey),
      },
    ],
  };
}
