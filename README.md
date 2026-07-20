# Midnight Counter DApp

> A privacy-preserving Counter smart contract built on the Midnight Network using the Compact language.

## Contract Address

| Network  | Address                                                          |
|----------|------------------------------------------------------------------|
| Preview  | `9a6287e343929ac29e6aa910eca52a0db7ecd9dc794ad6658f2619df57ea1417` |
| Preprod  | `[PASTE ADDRESS AFTER DEPLOY]`                                   |

## What This Does

This smart contract implements a privacy-preserving counter. It allows users to increment a global, public counter value on the Midnight ledger while keeping the exact increment amount (private witness input) completely private off-chain until explicitly disclosed via zero-knowledge proofs.

## Privacy Model

- **What is PUBLIC (on-chain, visible to anyone):**
  - `count`: The `Uint<32>` public ledger state variable representing the current counter total.
- **What is PRIVATE (private witness, never on-chain):**
  - `secretIncrement`: The `Uint<32>` private circuit witness passed from the client machine.
- **What the user PROVES without revealing:**
  - The user proves they possess a valid `Uint<32>` increment value and that the new state accurately reflects the previous counter state incremented by `disclose(secretIncrement)` without exposing sensitive private context on-chain.

## Tech Stack

- **Midnight Network**: Privacy-focused zero-knowledge blockchain platform
- **Compact Language**: Smart contract domain-specific language (v0.23)
- **Node.js**: v22.21.1
- **Docker**: Proof Server containerization (`midnightntwrk/proof-server:8.1.0`)

## Prerequisites

- **Node.js** v22 or higher
- **Yarn** v1.22+ or **npm** v11+
- **Docker Desktop** (with WSL2 integration on Windows)
- **Compact Compiler** CLI (v0.5.1+ / toolchain v0.31.1+)

## Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd L1_Midnight_Setup
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Compile the Compact contract:**
   ```bash
   compact compile contracts/counter.compact managed/counter
   ```

4. **Start local devnet (proof server, node, and indexer):**
   ```bash
   yarn env:up
   ```

## Run Tests

Run the Vitest test suite covering circuit logic, state transitions, and zero-knowledge privacy:

```bash
npx vitest run tests/counter.test.ts
```

## Initial Idea

[LEAVE PLACEHOLDER — I will fill this in manually]

## Screenshots

[LEAVE PLACEHOLDER — I will add compile output and contract address screenshots]