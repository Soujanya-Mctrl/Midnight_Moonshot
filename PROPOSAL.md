# Proposal: Anonymous Feedback & Verifiable Survey DApp

## Project Overview

The **Anonymous Feedback & Survey DApp** provides a privacy-preserving mechanism for users, community members, and employees to submit verifiable ratings and feedback on Midnight Network without exposing their wallet address, identity, or private payload details on the public ledger.

---

## Key Features

1. **Zero-Knowledge Anonymity**: Submitter wallet addresses are never linked to responses on-chain.
2. **On-Chain Verifiable Aggregates**: Tracks `totalResponses`, rating sums, and favorable response counts.
3. **Local Witness Privacy**: Ratings and comments are processed locally into zero-knowledge proofs via Compact circuits (`submitFeedback`).
4. **Instant Verification**: Anyone can verify the total response tally and aggregate satisfaction score on the Midnight Preview Explorer.

---

## Technical Stack & Architecture

- **Blockchain**: Midnight Network (Preview Testnet)
- **Smart Contract Language**: Compact v0.23 (`contracts/feedback.compact`)
- **SDK & Providers**: Midnight.js DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- **Frontend**: React, Vite, TypeScript, Lucide Icons
- **Testing**: Vitest (`tests/feedback.test.ts`)
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

---

## Smart Contract Specification (`feedback.compact`)

```compact
pragma language_version 0.23;

export ledger totalResponses: Uint<32>;
export ledger ratingSum: Uint<32>;
export ledger positiveCount: Uint<32>;

export circuit submitFeedback(rating: Uint<32>): [] {
  assert rating >= 1 "Rating must be at least 1 star";
  assert rating <= 5 "Rating cannot exceed 5 stars";

  const discRating = disclose(rating);
  totalResponses = (totalResponses + 1) as Uint<32>;
  ratingSum = (ratingSum + discRating) as Uint<32>;

  if (discRating >= 3) {
    positiveCount = (positiveCount + 1) as Uint<32>;
  }
}
```

---

## Zero-Knowledge Privacy Claim

An on-chain observer or block explorer sees only the global aggregate statistics (`totalResponses`, `ratingSum`, `positiveCount`) updated on the ledger, but **cannot** infer who submitted which rating or track any wallet address association.
