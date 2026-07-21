# Midnight Counter DApp

> A privacy-preserving Counter smart contract DApp built on the Midnight Network using the Compact language and React + Vite frontend.

## Live Demo

[https://midnightmoonshot.vercel.app](https://midnightmoonshot.vercel.app)

## Contract Address

| Network  | Address                                                          |
|----------|------------------------------------------------------------------|
| Preprod  | `9a6287e343929ac29e6aa910eca52a0db7ecd9dc794ad6658f2619df57ea1417` |

## What This Does

This DApp implements a privacy-preserving counter on the Midnight Network. It allows users to connect their Lace Wallet and execute zero-knowledge circuit calls (`incrementBy`) to update a global counter on the Midnight ledger while keeping the increment amount (private witness) completely private off-chain until explicitly disclosed via zero-knowledge proofs.

## Privacy Model

- **What is PUBLIC:**
  - `count`: The `Uint<32>` public ledger state variable representing the current counter total on-chain.
- **What is PRIVATE:**
  - `secretIncrement`: The `Uint<32>` private circuit witness passed locally from the client machine.
- **What the user PROVES without revealing:**
  - The user proves they possess a valid `Uint<32>` increment value and that the updated state reflects `count + disclose(secretIncrement)` without exposing sensitive private context on-chain.

## Privacy Claim

An on-chain observer or block explorer sees the updated public `count` value on the Midnight ledger, but CANNOT see the exact private witness input value (`secretIncrement`) used during the zero-knowledge circuit execution.

## Tech Stack

- **Midnight Network**: Privacy-focused zero-knowledge blockchain platform
- **Compact Language**: Smart contract domain-specific language (v0.23)
- **Midnight.js SDK**: DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- **React / Vite**: Modern TypeScript frontend UI framework
- **Lace Wallet**: Browser wallet extension for Midnight network transactions

## Prerequisites

- **Lace Wallet** browser extension installed
- **Node.js** v22 or higher

## Run Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd L1_Midnight_Setup
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Build production web app:**
   ```bash
   npm run build
   ```

## Demo Video

[PLACEHOLDER — I will add the link after recording]