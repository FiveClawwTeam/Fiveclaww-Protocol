import * as ed from "@noble/ed25519";
import bs58 from "bs58";
import { createHash } from "node:crypto";

import { stableStringify } from "./canonical.js";
import { agentDidFromPublicKey } from "../identity/did.js";
import { POL_SCHEMA_VERSION, type ProofOfLaborRecord } from "../types/pol.js";

export function sha256Utf8(data: string): `sha256:${string}` {
  const hex = createHash("sha256").update(data, "utf8").digest("hex");
  return `sha256:${hex}`;
}

export type UnsignedPolPayload = {
  schema_version: typeof POL_SCHEMA_VERSION;
  task_id: string;
  agent_id: string;
  input_hash: `sha256:${string}`;
  output_hash: `sha256:${string}`;
  proof: Record<string, unknown>;
  success: boolean;
  created_at: string;
};

export function polSigningPayload(payload: UnsignedPolPayload): Uint8Array {
  return new TextEncoder().encode(stableStringify(payload));
}

export async function createProofOfLaborRecord(params: {
  secretKey: Uint8Array;
  taskId: string;
  input: unknown;
  output: unknown;
  proof: Record<string, unknown>;
  success: boolean;
  createdAt?: string;
}): Promise<ProofOfLaborRecord> {
  const publicKey = await ed.getPublicKey(params.secretKey);
  const agentId = agentDidFromPublicKey(publicKey);
  const input_hash = sha256Utf8(stableStringify(params.input));
  const output_hash = sha256Utf8(stableStringify(params.output));
  const created_at = params.createdAt ?? new Date().toISOString();

  const payload: UnsignedPolPayload = {
    schema_version: POL_SCHEMA_VERSION,
    task_id: params.taskId,
    agent_id: agentId,
    input_hash,
    output_hash,
    proof: params.proof,
    success: params.success,
    created_at,
  };

  const sig = await ed.sign(polSigningPayload(payload), params.secretKey);
  const signature_b64 = Buffer.from(sig).toString("base64");

  return {
    ...payload,
    signing_public_key_b58: bs58.encode(publicKey),
    signature_b64,
  };
}

export async function verifyProofOfLaborRecord(record: ProofOfLaborRecord): Promise<boolean> {
  if (record.schema_version !== POL_SCHEMA_VERSION) return false;

  let publicKey: Uint8Array;
  try {
    publicKey = bs58.decode(record.signing_public_key_b58);
  } catch {
    return false;
  }
  if (publicKey.length !== 32) return false;

  const expectedDid = agentDidFromPublicKey(publicKey);
  if (record.agent_id !== expectedDid) return false;

  const payload: UnsignedPolPayload = {
    schema_version: POL_SCHEMA_VERSION,
    task_id: record.task_id,
    agent_id: record.agent_id,
    input_hash: record.input_hash,
    output_hash: record.output_hash,
    proof: record.proof,
    success: record.success,
    created_at: record.created_at,
  };

  let sig: Uint8Array;
  try {
    sig = Buffer.from(record.signature_b64, "base64");
  } catch {
    return false;
  }
  if (sig.length !== 64) return false;

  return ed.verify(sig, polSigningPayload(payload), publicKey);
}
