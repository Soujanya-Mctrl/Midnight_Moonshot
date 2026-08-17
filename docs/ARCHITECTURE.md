# Architecture

How the Midnight Whisper Anonymous Feedback Protocol fits together.

## Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│              Midnight Whisper Web DApp (React)          │
│       FeedbackStudio → useMidnight.ts → 1 AM / Lace     │
└───────────┬───────────────────────┬─────────────────────┘
            │                       │
            ▼                       ▼
     ┌──────────────┐        ┌──────────────┐
     │   Indexer    │        │ Proof Server │
     │  (GraphQL)   │        │  (ZK proofs) │
     └──────────────┘        └──────────────┘
```

## Key Concepts

### Compact Privacy Protocol (`feedback.compact`)
- **Ledger** — public aggregate metrics (`totalResponses`, `ratingSum`, `positiveCount`)
- **Circuits** — `submitFeedback(rating: Uint<32>)` verifies rating bounds and updates aggregates
- **`disclose()`** — discloses only the numerical score into the aggregate tally
- **Zero Linkability** — submitter address and private comments are never written to the ledger

### Project Structure

```
L1_Midnight_Setup/
├── contracts/
│   ├── feedback.compact          # Smart contract (Compact language)
│   └── index.ts                  # Contract exports & config
├── managed/
│   └── feedback/                 # Compiled contract artifacts
├── src/
│   ├── components/               # React components (FeedbackStudio, MetricsDashboard, etc.)
│   ├── hooks/                    # useMidnight hook for wallet & ZK transactions
│   ├── lib/                      # Midnight.js SDK integration & providers
│   ├── App.tsx                   # Main layout
│   └── App.css                   # Obsidian dark mode styling
├── tests/
│   └── feedback.test.ts          # Vitest test suite (Circuits, State, Privacy)
└── scripts/                      # Deployment and verification utilities
```
