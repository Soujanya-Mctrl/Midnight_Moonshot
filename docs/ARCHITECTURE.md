# Architecture

How the Midnight Hello World DApp fits together.

## Stack Overview

```
┌─────────────────────────────────────────────────┐
│                  Your DApp (TypeScript)          │
│    src/test/hw.test.ts → providers.ts → wallet  │
└───────────┬─────────────┬───────────────┬───────┘
            │             │               │
            ▼             ▼               ▼
     ┌──────────┐  ┌───────────┐  ┌──────────────┐
     │  Indexer  │  │   Node    │  │ Proof Server │
     │ :8088     │  │  :9944    │  │   :6300      │
     │ (GraphQL) │  │ (RPC/WS)  │  │  (ZK proofs) │
     └──────────┘  └───────────┘  └──────────────┘
          Docker Compose (compose.yml)
```

## Key Concepts

### Compact Language
- **Ledger** — public on-chain state visible to everyone
- **Circuits** — functions that modify state and generate ZK proofs
- **`disclose()`** — explicitly moves private data to public state
- **Circuit params are private by default** — ZK proofs keep inputs hidden

### Compilation Pipeline

```
hello-world.compact
        │
        ▼  compact compile
  ┌─────────────────────┐
  │ managed/hello-world/ │
  ├─ contract/           │ → TypeScript API + JS implementation
  ├─ keys/               │ → Proving & verifying keys
  ├─ zkir/               │ → Zero-Knowledge IR
  └─ compiler/           │ → Compiler JSON metadata
  └─────────────────────┘
```

### Runtime Flow

1. **User calls circuit** → DApp sends transaction via `submitCallTx()`
2. **Proof Server** generates ZK proof locally (your data never leaves your machine)
3. **Node** validates the proof and updates ledger state on-chain
4. **Indexer** picks up state change → queryable via GraphQL

## Project Structure

```
L1_Midnight_Setup/
├── contracts/
│   ├── hello-world.compact       # Smart contract (Compact language)
│   ├── index.ts                  # Contract exports & config
│   └── managed/hello-world/      # Compiled output (auto-generated)
│       ├── contract/             # JS/TS API bindings
│       ├── keys/                 # ZK proving/verifying keys
│       ├── zkir/                 # ZK Intermediate Representation
│       └── compiler/             # Compiler metadata
├── src/
│   ├── config.ts                 # Network configs (local/preview/preprod)
│   ├── providers.ts              # Midnight JS provider wiring
│   ├── wallet.ts                 # Wallet management (seed/mnemonic)
│   └── test/
│       └── hw.test.ts            # Vitest test suite
├── docs/
│   ├── SETUP.md                  # Setup & installation guide
│   ├── ARCHITECTURE.md           # This file
│   ├── CHANGELOG.md              # Version history
│   ├── CODE_OF_CONDUCT.md        # Community guidelines
│   ├── CONTRIBUTING.md           # Contribution process
│   └── SECURITY.md               # Security policy
├── scripts/
│   └── wait-for-dust.ts          # DUST token wait utility
├── compose.yml                   # Docker services (node, indexer, proof-server)
├── package.json                  # Dependencies & npm scripts
├── tsconfig.json                 # TypeScript config
├── vitest.config.ts              # Test runner config
├── LICENSE                       # Apache 2.0
└── README.md                     # Project overview
```

## Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **proof-server** | `midnightntwrk/proof-server:8.1.0` | 6300 | Generates ZK proofs locally |
| **indexer** | `midnightntwrk/indexer-standalone:4.3.3` | 8088 | GraphQL API for on-chain state |
| **node** | `midnightntwrk/midnight-node:1.0.0` | 9944 | Local blockchain (dev preset) |

## Network Configurations

| Network | Network ID | Use Case |
|---------|-----------|----------|
| `local` | `undeployed` | Development via Docker Compose |
| `preview` | `preview` | Testing on preview testnet |
| `preprod` | `preprod` | Pre-production validation |
