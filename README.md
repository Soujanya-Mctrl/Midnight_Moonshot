# Midnight Whisper // Anonymous Feedback & Sentiment Protocol

[![CI Pipeline](https://github.com/Soujanya-Mctrl/Midnight_Moonshot/actions/workflows/ci.yml/badge.svg)](https://github.com/Soujanya-Mctrl/Midnight_Moonshot/actions/workflows/ci.yml)

> A privacy-preserving Anonymous Feedback & Survey platform built on the Midnight Network using Compact smart contracts and a modern React + Vite glassmorphic web application.

---

## Live Demo

[https://midnightmoonshot.vercel.app](https://midnightmoonshot.vercel.app)

---

## Contract Address

| Network  | Address                                                          | Explorer Link |
|----------|------------------------------------------------------------------|---------------|
| Preview  | `07ea1c598023eade80a88d01d30ef0758415be7dee6fe6e5a95a22fc69e94ea5` | [View on Midnight Preview Explorer](https://explorer.preview.midnight.network/contracts/stream/07ea1c598023eade80a88d01d30ef0758415be7dee6fe6e5a95a22fc69e94ea5) |

---

## What This Does

**Midnight Whisper** provides a zero-knowledge anonymous feedback and satisfaction sentiment protocol on the Midnight Network (Preview Testnet).

Users connect their **1 AM Wallet** or **Lace Wallet** to submit confidential ratings (1 to 5 stars) and private memos. The client synthesizes a zero-knowledge proof ensuring the score is valid without ever disclosing the user's wallet address or raw comments on the public ledger.

---

## Zero-Knowledge Privacy Model

- **What is PUBLIC (On-Chain Ledger State):**
  - `totalResponses`: The total number of verified submissions.
  - `ratingSum`: The cumulative score sum for aggregate satisfaction computation.
  - `positiveCount`: The count of positive entries (rating >= 3 stars).
- **What is PRIVATE (Client-Side Witness):**
  - Submitter wallet address (never written to ledger state).
  - Raw feedback memo text (processed locally in browser memory).
  - Private rating value before circuit disclosure.
- **Zero-Knowledge Privacy Claim:**
  - An on-chain observer or block explorer sees the updated public aggregate counters on the Midnight ledger, but **CANNOT** infer or link which wallet address submitted any individual feedback or rating.

---

## Compact Smart Contract (`feedback.compact`)

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

## Project Structure

```text
my-project/
├── contracts/
│   ├── feedback.compact        # Compact smart contract
│   └── index.ts                # Contract exports & ZK config path
├── managed/
│   └── feedback/               # Compiled TypeScript & JS artifacts
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Modern HUD navigation bar
│   │   ├── MetricsDashboard.tsx# Live on-chain analytics & sentiment
│   │   ├── FeedbackStudio.tsx  # Interactive star rating & ZK submitter
│   │   ├── PrivacyInspector.tsx# ZK privacy audit visualizer
│   │   ├── LiveFeedStream.tsx  # Recent transaction feed
│   │   └── WalletConnect.tsx   # 1 AM / Lace wallet connector
│   ├── hooks/
│   │   └── useMidnight.ts      # React hook for Midnight state & ZK proving
│   ├── lib/
│   │   └── midnight.ts         # Midnight.js SDK integration & providers
│   ├── App.tsx                 # Master Dashboard Layout
│   └── main.tsx
├── tests/
│   └── feedback.test.ts        # Vitest suite for circuits & state
├── .github/
│   └── workflows/
│       └── ci.yml              # Automated GitHub Actions CI pipeline
├── PROPOSAL.md                 # Project architecture & privacy proposal
├── README.md
└── package.json
```

---

## Quick Start (Run Locally)

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Run local dev server:**
   ```bash
   npm run dev
   ```

3. **Run unit tests:**
   ```bash
   yarn test
   ```

4. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## Tech Stack

- **Blockchain**: Midnight Network (Preview Testnet)
- **Smart Contracts**: Compact Language v0.23
- **SDK**: Midnight.js DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- **Frontend**: React 19, Vite, TypeScript, Lucide Icons, Vanilla Glassmorphic CSS
- **Wallets**: 1 AM Wallet, Lace Wallet
