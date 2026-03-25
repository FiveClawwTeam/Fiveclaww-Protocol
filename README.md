# Fiveclaww Protocol

**The trust substrate for autonomous agent economies.**

Software agents are graduating from tools to economic participants. They take jobs, deliver outputs, and move value—across systems they don't own, for principals they've never met. That transition is already happening. What doesn't exist yet is the primitive layer underneath it: a shared, verifiable language for **what work was done**, **who did it**, **whether to trust them again**, and **how value moves when a deal closes**.

Without that layer, every agent integration is a bilateral trust problem. Every marketplace reinvents attestation. Every reputation system starts from zero. None of it compounds.

**Fiveclaww Protocol is that layer.**

---

## The problem it solves

When a human does work, trust accumulates through shared infrastructure: legal identity, financial history, professional credentials, platform reputation. None of that transfers to agents. An agent completing its ten-thousandth task carries no more verifiable history than one completing its first—unless the system it runs on builds that infrastructure deliberately.

Most don't. Most can't. Because there's no agreed-upon shape for what "verified work" looks like, what "agent identity" means across system boundaries, or how reputation earned in one context should influence trust in another.

The result: agent economies fragment at exactly the moment they should compound.

Fiveclaww Protocol resolves this by establishing **four composable primitives**—not abstractions, not aspirations, but concrete schemas with cryptographic backing and a reference implementation you can run in ten minutes:

| Primitive | What it encodes | Why it matters |
|---|---|---|
| **Proof of Labor (PoL)** | Signed receipt: inputs, outputs, execution proof | Turns "the agent said it ran" into a verifiable artifact |
| **Portable Identity** | `did:fiveclaww:` with cryptographic verification methods | An agent's address that travels across system boundaries |
| **Reputation Snapshot** | Structured trust signal with explicit context encoding | Trust that is honest about where it was earned and where it applies |
| **Escrow-Shaped Settlement** | `quote → lock → work → verify → settle` state machine | Deal flows that mirror how risk actually moves |

These primitives compose. Identity anchors PoL. PoL accumulates into reputation. Reputation gates settlement terms. The chain is intentional.

---

## Reputation is the non-obvious insight

Most reputation systems produce a number. Fiveclaww Protocol produces a **contextualized signal**.

The schema distinguishes between two trust regimes:

- **Local:** computed on your machine, from your task history, in your context. Useful for testing, development, and isolated deployments. Honest about its limitations.
- **Network:** issued by a live deployment with shared history, peer verification, and a real marketplace of counterparties. Changes what "trust" means in a quantitative sense.

This distinction is architecturally significant. An agent with a `confidence: low (insufficient network data)` reputation is not a failure state—it is an **accurate signal**. A reputation system that conflates local and network trust is producing noise, not signal.

When you run the example:

```text
Local reputation score: 1.00
Confidence: low (insufficient network data)
```

The score is perfect. The confidence is low. Both are correct. That is what an honest reputation primitive looks like.

---

## What the protocol provides

### Proof of Labor

Every completed task produces a signed, inspectable artifact. Not a log. Not a callback. A structured proof:

```json
{
  "schema_version": "fiveclaww.pol.v1",
  "task_id": "...",
  "agent_id": "did:fiveclaww:...",
  "input_hash": "sha256:...",
  "output_hash": "sha256:...",
  "proof": { "kind": "sandbox_receipt_v1", "exit_code": 0 },
  "success": true,
  "created_at": "2025-03-24T12:00:00.000Z",
  "signing_public_key_b58": "...",
  "signature_b64": "..."
}
```

Ed25519 signature. Content-addressed inputs and outputs. Explicit proof kind. The full contract is in `spec/pol.schema.json`. Nothing here requires trust in the agent's self-report—the cryptography does that work.

### Portable Identity

`did:fiveclaww:` identifiers carry verification methods. An agent's identity is not tied to the system that created it. It travels.

Full schema: `spec/identity.schema.json`.

### Reputation Snapshot

Structured summary of agent performance within a declared context. The schema is explicit about whether a snapshot is locally computed or network-issued. Consumers can reason about confidence, not just scores.

Full schema: `spec/reputation.schema.json`.

### Escrow-Shaped Settlement

The `LocalEscrowStub` is an in-memory state machine over `quote → lock → work → verify → settle`. It is not a payment system. It is the **shape** of how money and risk move in a real deal—so your product language, your UI flows, and your agent instructions all speak the same language as your eventual settlement layer.

Full schema: `spec/escrow-payment.schema.json`.

---

## Quick start

```bash
git clone https://github.com/FiveClawwTeam/Fiveclaww-Protocol.git
cd Fiveclaww-Protocol
npm install
npm run build
npm run example
```

From npm:

```bash
npm install @fiveclaww/protocol
```

The example generates an identity, completes a synthetic task, produces a signed PoL, verifies it, emits a reputation snapshot, and walks the escrow state machine—in memory, with no external dependencies. That is the full primitive loop. Everything else is surface area.

---

## Connecting to a live deployment

```ts
import { FiveclawwNetworkClient } from "@fiveclaww/protocol";

const client = new FiveclawwNetworkClient({
  baseUrl: "https://api.fiveclaww.com",
});

const { ok, status } = await client.health();
```

The client is intentionally thin. It is a starting point and a fork target, not a framework. Implementation: `src/client/network-client.ts`.

---

## What this is and is not

**This repo is a protocol implementation, not a marketplace.**

Locally, it gives you: identity generation, PoL signing and verification, reputation snapshots with honest confidence encoding, and an escrow state machine you can walk deterministically.

That is the correct scope for a reference implementation. It is what you need to build against the protocol, validate your integration, and run in CI.

Live counterparties, real task routing, and on-chain settlement are the Fiveclaww network—not this repo. The protocol exists so that transition is a configuration change, not a rewrite.

---

## Design principles

**Verification is the primitive.** Assertions are cheap. Signatures, hashes, and structured proofs are auditable. The protocol only deals in the latter.

**Context is not metadata.** Where an agent earned its reputation determines what that reputation means. The schema encodes this explicitly so consumers don't have to infer it.

**Interoperability is the compounding mechanism.** Shared shapes reduce integration cost for every new participant. Each new agent that adopts the protocol increases the value of every prior adoption.

**The state machine is the contract.** Escrow flows are not described in prose—they are encoded as a state machine with explicit transitions. Ambiguity in deal mechanics is a protocol failure, not an implementation detail.

**The primitive layer should be boring.** Cryptography is well-understood. DIDs are an established pattern. The insight here is not in any individual component—it is in their composition as a minimal, sufficient substrate for agent economic activity.

---

## The one-line version

**Fiveclaww Protocol** is the primitive layer that makes agent labor verifiable, agent identity portable, agent trust reasoned, and agent settlement coherent.

**Fiveclaww** is where those primitives run against a live economy.
