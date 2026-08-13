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

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { WebSocket } from 'ws';
import pino from 'pino';
import { getConfig } from '../src/config.js';
import { MidnightWalletProvider, syncWallet } from '../src/wallet.js';
import * as Rx from 'rxjs';

// @ts-expect-error WebSocket global assignment
globalThis.WebSocket = WebSocket;

const logger = pino({ level: 'info' });

async function inspectCoins() {
  const config = getConfig();
  setNetworkId(config.networkId);

  const seedHex = process.env.MIDNIGHT_PREVIEW_SEED!;
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

  const wallet = await MidnightWalletProvider.build(logger, envConfig, { kind: 'seed', value: seedHex });
  await wallet.start();
  await syncWallet(logger, wallet.wallet, 60_000);

  const state: any = await Rx.firstValueFrom(wallet.wallet.state());

  console.log('\n--- WALLET STATE INSPECTION ---');
  console.log('Unshielded Address:', wallet.unshieldedKeystore.getBech32Address());
  console.log('Unshielded Balances:', JSON.stringify(state.unshielded.balances, null, 2));
  console.log('Unshielded Available Coins:', JSON.stringify(state.unshielded.availableCoins, null, 2));
  console.log('Dust Coins:', JSON.stringify(state.dust.availableCoins, null, 2));
  console.log('-------------------------------\n');

  await wallet.stop();
}

inspectCoins().catch(console.error);
