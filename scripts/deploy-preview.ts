import fs from 'node:fs';
import path from 'node:path';

// Load .env into process.env if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length > 0 && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    }
  }
} catch (e) {
  // ignore
}

import * as Rx from 'rxjs';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { WebSocket } from 'ws';
import pino from 'pino';
import { getConfig } from '../src/config.js';
import { MidnightWalletProvider, syncWallet, type WalletSecret } from '../src/wallet.js';
import { buildProviders } from '../src/providers.js';
import { CompiledFeedbackContract, zkConfigPath } from '../contracts/index.js';

// Required for Node.js WebSocket subscriptions
// @ts-expect-error WebSocket global assignment
globalThis.WebSocket = WebSocket;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

function resolvePreviewSecret(): WalletSecret {
  const mnemonic = process.env.MIDNIGHT_PREVIEW_MNEMONIC?.trim().replace(/\s+/g, ' ');
  const seedHex = process.env.MIDNIGHT_PREVIEW_SEED?.trim();

  if (mnemonic) return { kind: 'mnemonic', value: mnemonic };
  if (seedHex) return { kind: 'seed', value: seedHex };

  throw new Error(
    'Missing wallet credentials! Please set MIDNIGHT_PREVIEW_SEED or MIDNIGHT_PREVIEW_MNEMONIC in your .env file.'
  );
}

async function deployToPreview() {
  console.log('\n🚀 Midnight Preview Contract Deployer');
  console.log('=====================================\n');

  const config = getConfig(); // returns PREVIEW_CONFIG when MIDNIGHT_NETWORK=preview
  setNetworkId(config.networkId);

  const secret = resolvePreviewSecret();

  logger.info(`Building wallet for network '${config.networkId}'...`);
  const envConfig = {
    walletNetworkId: config.networkId,
    networkId: config.networkId,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  const wallet = await MidnightWalletProvider.build(logger, envConfig, secret);
  await wallet.start();

  console.log(`\n📍 Unshielded Address: ${wallet.unshieldedKeystore.getBech32Address()}\n`);

  logger.info('Syncing wallet state with Preview Testnet...');
  await syncWallet(logger, wallet.wallet, 300_000);

  const state: any = await Rx.firstValueFrom(wallet.wallet.state());
  logger.info(`Dust available coins count: ${state.dust?.availableCoins?.length || 0}`);

  if (!state.dust?.availableCoins || state.dust.availableCoins.length === 0) {
    const nightUtxos = state.unshielded?.availableCoins || [];
    if (nightUtxos.length > 0) {
      logger.info(`Registering ${nightUtxos.length} NIGHT UTXOs for DUST generation...`);
      try {
        const recipe = await wallet.wallet.registerNightUtxosForDustGeneration(
          nightUtxos,
          wallet.unshieldedKeystore.getPublicKey(),
          (payload: Uint8Array) => wallet.unshieldedKeystore.signData(payload),
        );
        const finalized = await wallet.wallet.finalizeRecipe(recipe);
        await wallet.wallet.submitTransaction(finalized);
        logger.info('✅ DUST registration transaction submitted to Preview!');
      } catch (err: any) {
        logger.info(`DUST registration notice: ${err?.message || err}`);
      }
    } else {
      logger.info('No unshielded NIGHT UTXOs found to register for DUST.');
    }

    logger.info('Waiting for DUST coins to accrue on Preview Testnet (this may take a couple of minutes)...');
    await Rx.firstValueFrom(
      wallet.wallet.state().pipe(
        Rx.tap((s: any) => {
          logger.info(`Checking DUST: availableCoins=${s.dust?.availableCoins?.length || 0}`);
        }),
        Rx.filter((s: any) => (s.dust?.availableCoins?.length || 0) > 0),
      ),
    );
    logger.info('✅ DUST coins now available!');
  }

  const providers = buildProviders(wallet, zkConfigPath, config);

  const origSubmitTx = providers.midnightProvider.submitTx.bind(providers.midnightProvider);
  providers.midnightProvider.submitTx = async (tx: any) => {
    const addr = tx.public?.contractAddress || tx.contractAddress || tx.address;
    if (addr) {
      console.log('\n=====================================');
      console.log(`📍 Contract Address: ${addr}`);
      console.log(`🌐 Preview Explorer: https://explorer.preview.midnight.network/contracts/stream/${addr}`);
      console.log('=====================================\n');
    }
    try {
      return await origSubmitTx(tx);
    } catch (err: any) {
      if (addr) {
        console.log(`📍 Deployed Contract Address: ${addr}`);
      }
      throw err;
    }
  };

  logger.info('Submitting feedback contract deployment to Midnight Preview Testnet...');
  const deployed: any = await (deployContract as any)(providers, {
    compiledContract: CompiledFeedbackContract,
    privateStateId: `FeedbackPrivateState_${Date.now()}`,
    initialPrivateState: {},
    args: [],
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;

  console.log('\n=====================================');
  console.log('✅ DEPLOYMENT SUCCESSFUL!');
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Preview Explorer: https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`);
  console.log('=====================================\n');

  await wallet.stop();
}

deployToPreview().catch((err) => {
  console.error('\n❌ Deployment failed:', err?.message || err);
  process.exit(1);
});
