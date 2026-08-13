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

import * as Rx from 'rxjs';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { WebSocket } from 'ws';
import pino from 'pino';
import { getConfig } from '../src/config.js';
import { MidnightWalletProvider } from '../src/wallet.js';
import { buildProviders } from '../src/providers.js';
import { CompiledHelloWorldContract, zkConfigPath } from '../contracts/index.js';

// @ts-expect-error WebSocket global assignment
globalThis.WebSocket = WebSocket;

async function checkDeployedAddress() {
  const logger = pino({ level: 'info' });
  const network = 'preview';
  setNetworkId(network);
  const config = getConfig(network);

  const mnemonic = process.env.MIDNIGHT_PREVIEW_MNEMONIC || '';
  const envConfig: any = {
    walletNetworkId: config.networkId,
    networkId: config.networkId,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  const wallet = await MidnightWalletProvider.build(logger, envConfig, {
    kind: 'mnemonic',
    value: mnemonic,
  });

  const providers = buildProviders(wallet, zkConfigPath, config);

  await wallet.start();
  const state: any = await Rx.firstValueFrom(wallet.wallet.state());
  console.log(`Dust available coins count: ${state.dust?.availableCoins?.length || 0}`);

  try {
    console.log('Building deployment payload...');
    const deployed: any = await (deployContract as any)(providers, {
      compiledContract: CompiledHelloWorldContract,
      privateStateId: 'CounterPrivateState',
      initialPrivateState: {},
      args: [],
    });
    console.log('\n=====================================');
    console.log('📍 Contract Address:', deployed.deployTxData.public.contractAddress);
    console.log('=====================================\n');
  } catch (err: any) {
    console.log('Error output:', err?.message || err);
    if (err?.deployTxData?.public?.contractAddress) {
      console.log('\n📍 Contract Address from tx payload:', err.deployTxData.public.contractAddress);
    }
  }

  await wallet.stop();
}

checkDeployedAddress();
