import { MidnightWalletProvider } from '../src/wallet.js';
import { getConfig } from '../src/config.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledFeedbackContract, zkConfigPath } from '../contracts/index.js';
import { buildProviders } from '../src/providers.js';
import { syncWallet } from '../src/wallet.js';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import pino from 'pino';
import fs from 'node:fs';
import path from 'node:path';

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
} catch (e) {}

// @ts-expect-error WebSocket global assignment
globalThis.WebSocket = WebSocket;

async function testDeploy() {
  const logger = pino({ level: 'info' });
  const config = getConfig();
  setNetworkId('preview');

  const envConfig: any = {
    walletNetworkId: 'preview',
    networkId: 'preview',
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  const mnemonic = process.env.MIDNIGHT_PREVIEW_MNEMONIC || '';

  const wallet = await MidnightWalletProvider.build(logger, envConfig, {
    kind: 'mnemonic',
    value: mnemonic,
  });

  const providers = buildProviders(wallet, zkConfigPath, config);

  providers.midnightProvider.submitTx = async (tx: any) => {
    console.log('\n================ INSIDE SUBMIT_TX ================');
    console.log('Tx object keys:', Object.keys(tx));
    console.log('Tx public keys:', tx.public ? Object.keys(tx.public) : 'none');
    console.log('Tx stringified:', JSON.stringify(tx, (k, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
    console.log('====================================================\n');
    throw new Error('INTERCEPTED');
  };

  await wallet.start();
  logger.info('Syncing wallet...');
  await syncWallet(logger, wallet.wallet, 300_000);
  const state: any = await Rx.firstValueFrom(wallet.wallet.state());
  logger.info(`Dust coins count: ${state.dust?.availableCoins?.length || 0}`);

  try {
    await (deployContract as any)(providers, {
      compiledContract: CompiledFeedbackContract,
      privateStateId: 'FeedbackPrivateState',
      initialPrivateState: {},
      args: [],
    });
  } catch (err: any) {
    console.log('Result:', err.message);
  }

  await wallet.stop();
}

testDeploy();
