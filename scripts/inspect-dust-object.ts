import { MidnightWalletProvider } from '../src/wallet.js';
import { getConfig } from '../src/config.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { WebSocket } from 'ws';
import pino from 'pino';
import * as Rx from 'rxjs';
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

async function inspectDustObject() {
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

  await wallet.start();
  const state: any = await Rx.firstValueFrom(wallet.wallet.state());

  console.log('\n=== DUST OBJECT INSPECTION ===');
  console.log('Dust State Keys:', Object.keys(state.dust || {}));
  console.log('Available Coins:', state.dust?.availableCoins);
  if (state.dust?.walletBalance) {
    console.log('Wallet Balance (now):', state.dust.walletBalance(new Date()));
  }
  console.log('Dust Progress:', state.dust?.state?.progress);
  console.log('==============================\n');

  await wallet.stop();
}

inspectDustObject().catch((err) => console.error(err));
