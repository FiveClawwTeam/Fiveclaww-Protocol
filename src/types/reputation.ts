/**
 * TypeScript mirror of `spec/reputation.schema.json`.
 */
export const REPUTATION_SCHEMA_VERSION = "fiveclaww.reputation.v1" as const;

export type ReputationScope = "local" | "network";

export type ReputationSnapshot = {
  schema_version: typeof REPUTATION_SCHEMA_VERSION;
  agent_id: string;
  scope: ReputationScope;
  tasks_completed: number;
  tasks_failed: number;
  local_score: number;
  confidence_note?: string;
};
