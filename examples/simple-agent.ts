/**
 * Run after build: `npm run example`
 * Or from source with a TS runner of your choice.
 */
import { FiveclawLocalClient, MockFiveclawNetwork, verifyProofOfLaborRecord } from "../src/index.js";

async function main() {
  const net = new MockFiveclawNetwork();
  const client = new FiveclawLocalClient();
  await client.createAgent("demo-agent");

  const identity = client.getIdentity();
  console.log(`Agent: ${identity.did}`);

  const task = net.claimNextTask();
  if (!task) {
    console.log("No mock tasks queued (unexpected).");
    process.exit(1);
  }

  const record = await client.executeTask({
    taskId: task.id,
    input: task.input,
    output:
      task.kind === "summarize"
        ? { summary: "Agents need coordination, incentives, and settlement." }
        : { email: "support@fiveclaww.dev" },
    proof: { kind: "sandbox_receipt_v1", exit_code: 0 },
    success: true,
  });

  const localOk = await verifyProofOfLaborRecord(record);
  const netVerdict = await net.verifyPol(record);
  console.log(
    localOk && netVerdict.ok
      ? "Task completed.\nProof verified."
      : "Proof verification failed.",
  );

  const rep = client.getLocalReputation();
  console.log(`\nLocal reputation score: ${rep.local_score.toFixed(2)}`);
  console.log(`Confidence: ${rep.confidence_note ?? "n/a"}`);
  console.log(`\n(Mock network) verified=${net.stats().verified}, pendingTasks=${net.stats().pendingTasks}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
