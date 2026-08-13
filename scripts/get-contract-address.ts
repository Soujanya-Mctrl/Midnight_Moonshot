import { MidnightWalletProvider } from '../src/wallet.js';
import { getConfig } from '../src/config.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { createUnprovenDeployTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledHelloWorldContract, zkConfigPath } from '../contracts/index.js';
import { buildProviders } from '../src/providers.js';
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

async function getAddressFromUnprovenTx() {
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

  await wallet.start();

  try {
    const unprovenTx: any = await (createUnprovenDeployTx as any)(providers, {
      compiledContract: CompiledHelloWorldContract,
      privateStateId: 'CounterPrivateState',
      initialPrivateState: {},
      args: [],
    });

    console.log('\n=====================================');
    console.log('UnprovenTx object keys:', Object.keys(unprovenTx));
    console.log('UnprovenTx.deployTxData keys:', unprovenTx.deployTxData ? Object.keys(unprovenTx.deployTxData) : 'none');
    console.log('UnprovenTx.deployTxData.public keys:', unprovenTx.deployTxData?.public ? Object.keys(unprovenTx.deployTxData.public) : 'none');

    const address = unprovenTx.deployTxData?.public?.contractAddress || unprovenTx.public?.contractAddress;
    console.log(`📍 PREVIEW CONTRACT ADDRESS: ${address}`);
    console.log(`🌐 Preview Explorer: https://explorer.preview.midnight.network/contract/${address}`);
    console.log('=====================================\n');
  } catch (err: any) {
    console.error('Error generating unproven deploy tx:', err?.message || err);
  }

  await wallet.stop();
}

getAddressFromUnprovenTx();
