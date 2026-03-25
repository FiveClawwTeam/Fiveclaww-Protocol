/**
 * Run after build: `npm run example`
 * Or from source with a TS runner of your choice.
 */
import { FiveclawLocalClient, verifyProofOfLaborRecord } from "../src/index.js";

async function main() {
  const client = new FiveclawLocalClient();
  await client.createAgent("demo-agent");

  const identity = client.getIdentity();
  console.log(`Agent: ${identity.did}`);

  const taskId = crypto.randomUUID();
  const record = await client.executeTask({
    taskId,
    input: { prompt: "Summarize this paragraph", text: "Fiveclaww coordinates autonomous work." },
    output: { summary: "Autonomous agents coordinate work on Fiveclaww." },
    proof: { kind: "sandbox_receipt_v1", exit_code: 0 },
    success: true,
  });

  const ok = await verifyProofOfLaborRecord(record);
  console.log(ok ? "Task completed.\nProof verified." : "Proof verification failed.");

  const rep = client.getLocalReputation();
  console.log(`\nLocal reputation score: ${rep.local_score.toFixed(2)}`);
  console.log(`Confidence: ${rep.confidence_note ?? "n/a"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
