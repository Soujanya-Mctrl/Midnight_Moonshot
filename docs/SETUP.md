# Setup Guide

Step-by-step instructions for getting the Midnight Hello World DApp running locally.

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| **Node.js** | v22+ | [nodejs.org](https://nodejs.org/) |
| **Yarn** | v1.22+ | `npm install -g yarn` |
| **Docker** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Compact** | v0.31+ | See below |
| **WSL2** (Windows only) | Ubuntu | `wsl --install` |

## 1. Install the Compact Compiler

The Compact compiler must be installed via the shell installer (Linux/macOS/WSL):

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
```

Then update the toolchain:

```bash
compact self update
compact update
```

Verify:

```bash
compact --version       # CLI version
compact compile --help  # Compiler available
```

## 2. Clone & Install Dependencies

```bash
git clone https://github.com/midnightntwrk/example-hello-world.git
cd example-hello-world
yarn install
```

## 3. Write the Smart Contract

Create `contracts/hello-world.compact`:

```compact
pragma language_version 0.23;

export ledger message: Opaque<"string">;

export circuit storeMessage(newMessage: Opaque<"string">): [] {
  message = disclose(newMessage);
}
```

## 4. Compile

```bash
compact compile contracts/hello-world.compact contracts/managed/hello-world
```

Expected output:

```
Compiling 1 circuits:
  circuit "storeMessage" (k=6, rows=26)
```

## 5. Deploy & Test (Local Devnet)

Start the Docker infrastructure:

```bash
yarn env:up        # Starts proof server, indexer, and node
```

Wait ~30 seconds for the indexer to sync, then run:

```bash
yarn test:local    # Deploys contract + runs test suite
```

Expected output:

```
✓ Hello World Contract > Deploys the contract
✓ Hello World Contract > Stores Hello World!
```

Clean up:

```bash
yarn env:down
```

## 6. Deploy to Testnet (Optional)

For Preview or Preprod networks:

1. Generate a wallet and fund it via the faucet:
   - [Preview Faucet](https://midnight-tmnight-preview.nethermind.dev/)
   - [Preprod Faucet](https://midnight-tmnight-preprod.nethermind.dev/)
2. Copy `.env.<network>.example` → `.env.<network>` and fill in your seed/mnemonic
3. Start the proof server: `yarn proof:up`
4. Run tests: `yarn test:<network>`

## Resources

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact by Example](https://compact-by-example.org/)
- [Midnight Discord](https://discord.com/invite/midnightnetwork)
- [Tutorials](https://docs.midnight.network/category/tutorials)
