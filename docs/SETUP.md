# Setup Guide

Step-by-step instructions for running Midnight Whisper Anonymous Feedback Protocol locally and on Preview Testnet.

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| **Node.js** | v22+ | [nodejs.org](https://nodejs.org/) |
| **Yarn / npm** | Latest | `npm install -g yarn` |
| **Docker** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Compact** | v0.31+ | See below |

## 1. Smart Contract (`contracts/feedback.compact`)

```compact
pragma language_version 0.23;

export ledger totalResponses: Uint<32>;
export ledger ratingSum: Uint<32>;
export ledger positiveCount: Uint<32>;

export circuit submitFeedback(rating: Uint<32>): [] {
  assert rating >= 1 && rating <= 5;
  totalResponses += 1;
  ratingSum += disclose(rating);
  if (rating >= 3) {
    positiveCount += 1;
  }
}
```

## 2. Compile & Test

```bash
npm run compile
npm test
```

## 3. Run Web Application

```bash
npm run dev
```

## 4. Testnet Deployment

Active Preview Contract: `07ea1c598023eade80a88d01d30ef0758415be7dee6fe6e5a95a22fc69e94ea5`

To deploy or verify on Midnight Preview Testnet:

```bash
npm run verify
npm run deploy:preview
```
