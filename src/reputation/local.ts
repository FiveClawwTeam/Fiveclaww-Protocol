import { REPUTATION_SCHEMA_VERSION, type ReputationSnapshot } from "../types/reputation.js";

/**
 * Local-only reputation approximation. Not comparable to Fiveclaww network reputation.
 */
export function computeLocalReputationSnapshot(params: {
  agentId: string;
  tasksCompleted: number;
  tasksFailed: number;
}): ReputationSnapshot {
  const total = params.tasksCompleted + params.tasksFailed;
  const local_score = total === 0 ? 0 : params.tasksCompleted / total;
  const confidence_note =
    total === 0
      ? "no local history"
      : total < 5
        ? "low (insufficient network data)"
        : "medium (local simulation only)";

  return {
    schema_version: REPUTATION_SCHEMA_VERSION,
    agent_id: params.agentId,
    scope: "local",
    tasks_completed: params.tasksCompleted,
    tasks_failed: params.tasksFailed,
    local_score,
    confidence_note,
  };
}
