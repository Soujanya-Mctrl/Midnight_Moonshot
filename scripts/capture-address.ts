import { MidnightWalletProvider } from '../src/wallet.js';
import { getConfig } from '../src/config.js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
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

async function printContractAddress() {
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

  // Mock submitTx to capture the transaction object and contract address before submitting
  providers.midnightProvider.submitTx = async (tx: any) => {
    const address = tx.public?.contractAddress || tx.contractAddress;
    console.log('\n=====================================');
    console.log('📍 PREVIEW CONTRACT ADDRESS:', address);
    console.log(`🌐 Preview Explorer: https://explorer.preview.midnight.network/contract/${address}`);
    console.log('=====================================\n');
    throw new Error('CAPTURED_ADDRESS_SUCCESS');
  };

  await wallet.start();

  try {
    await (deployContract as any)(providers, {
      compiledContract: CompiledHelloWorldContract,
      privateStateId: 'CounterPrivateState',
      initialPrivateState: {},
      args: [],
    });
  } catch (err: any) {
    if (err.message !== 'CAPTURED_ADDRESS_SUCCESS') {
      console.log('Deploy error:', err.message);
    }
  }

  await wallet.stop();
}

printContractAddress();
