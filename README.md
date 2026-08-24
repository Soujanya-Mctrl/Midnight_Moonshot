# Midnight Whisper // Anonymous Feedback & Sentiment Protocol

[![CI Pipeline](https://github.com/Soujanya-Mctrl/Midnight_Moonshot/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Soujanya-Mctrl/Midnight_Moonshot/actions/workflows/ci.yml)

## Video Demo & Live App
- **Demo Video**: [Watch Demo Video](https://drive.google.com/file/d/1sPxFpPAZyLoX109I2lobiN7n6u2wA2c5/view?usp=sharing)
- **Live dApp**: [https://midnightmoonshot.vercel.app](https://midnightmoonshot.vercel.app)

## Contract Address
| Network  | Address                                                          |
|----------|------------------------------------------------------------------|
| Preview  | `b7840834b9d2c13eeb676efa94271ee3e8b28cdab086b8212675d11f965aa8ac` |

[View on Midnight Preview Explorer](https://explorer.preview.midnight.network/contracts/stream/b7840834b9d2c13eeb676efa94271ee3e8b28cdab086b8212675d11f965aa8ac)

## What This Does
Midnight Whisper allows community members, employees, and users to submit verifiable feedback ratings (1 to 5 stars) and confidential comments without linking their wallet address or real-world identity to their response on-chain.

The smart contract maintains aggregate statistics (`totalResponses`, `ratingSum`, `positiveCount`) while ensuring each submission generates a zero-knowledge proof proving valid rating bounds without exposing individual user identities.

## Privacy Model
- **PUBLIC**: Aggregate metrics on the ledger (`totalResponses`, `ratingSum`, `positiveCount`, and global sentiment scores).
- **PRIVATE**: Submitter wallet address, client-side rating witness, and encrypted raw feedback text.
- **PROVED without revealing**: That the rating is an integer between 1 and 5 and the aggregate state transitions are computed correctly, without revealing the submitter's identity or specific individual response.

## Privacy Claim
- **What an on-chain observer sees**: The incrementing of `totalResponses`, updated `ratingSum`, updated `positiveCount`, and the zero-knowledge transaction validity proof on the ledger.
- **What an on-chain observer cannot see**: Who submitted the feedback, the submitter's wallet address, the timestamp linkability, or the raw private comment payload.

## Tech Stack
- **Smart Contract Language**: Compact v0.23 (`contracts/feedback.compact`)
- **Blockchain Network**: Midnight Network (Preview Testnet)
- **Proving Service**: 1AM ProofStation (`https://api-preview.1am.xyz`) / Local Proof Server
- **Client & Wallet**: 1AM Wallet / Lace Wallet via `@midnight-ntwrk/dapp-connector-api`
- **Frontend**: React 19, TypeScript, Vite, CSS Glassmorphism
- **Testing**: Vitest (`tests/feedback.test.ts`)
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

## Prerequisites
- **Node.js**: v22.x or higher
- **npm** or **yarn**
- **1AM Wallet Browser Extension** (configured for Midnight Preview Testnet)
- **tNIGHT Tokens** (from [Midnight Preview Faucet](https://faucet.preview.midnight.network))

## Setup & Run Locally
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Soujanya-Mctrl/Midnight_Moonshot.git
   cd Midnight_Moonshot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file from `.env.preview.example`:
   ```bash
   cp .env.preview.example .env
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Run Tests
```bash
npm test
```

## CI/CD
The continuous integration pipeline in `.github/workflows/ci.yml` runs automatically on every `push` and `pull_request` to the `main` branch. It executes:
1. **Source Checkout**: Clones the repository codebase.
2. **Node Setup**: Configures Node.js v22 environment.
3. **Dependency Installation**: Runs clean `npm install`.
4. **Contract Compilation**: Compiles `contracts/feedback.compact` using the official Midnight Compact compiler.
5. **Test Suite**: Executes all Vitest unit tests verifying circuit logic, state transitions, and zero-knowledge privacy guarantees.
6. **Frontend Build**: Validates production bundling with `npm run build`.

## Product Proposal
See [PROPOSAL.md](PROPOSAL.md)
