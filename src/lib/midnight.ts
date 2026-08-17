import { Buffer } from 'buffer';

if (typeof globalThis !== 'undefined' && !(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { LedgerParameters, Transaction, ZswapChainState } from '@midnight-ntwrk/ledger-v8';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { Contract as FeedbackContract, ledger as feedbackLedger } from '../../managed/feedback/contract/index.js';

export type InjectedWalletProvider = {
  connect?: (networkId: string) => Promise<any>;
  enable?: (networkId: string) => Promise<any>;
  name?: string;
  icon?: string;
};

export type WalletProviderEntry = {
  id: string;
  name: string;
  icon?: string;
  provider: InjectedWalletProvider;
};

export type NormalizedWalletConfig = {
  networkId: string;
  indexerUri: string;
  indexerWsUri: string;
  nodeUri: string;
  nodeWsUri: string;
};

export type ConnectedSession = {
  api: any;
  config: NormalizedWalletConfig;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createFeedbackPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider<string>;
    proofProvider: { proveTx: (unprovenTx: any, config: any) => Promise<any> };
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
  shieldedCoinPublicKey: string;
};

export const FEEDBACK_CONTRACT_NAME = 'FeedbackContract';
export const FEEDBACK_CIRCUIT_ID = 'submitFeedback' as const;
export const FEEDBACK_CONTRACT_ASSET_BASE_URL = '/contract/feedback';

export interface FeedbackLedgerData {
  totalResponses: number;
  ratingSum: number;
  positiveCount: number;
  averageRating: number;
  positivePercentage: number;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) {
    throw new Error('Invalid hex string.');
  }

  const bytes = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
  }

  return bytes;
}

export function formatNetworkLabel(networkId: string): string {
  switch (networkId) {
    case 'preview':
      return 'PREVIEW';
    case 'preprod':
      return 'PREPROD';
    case 'mainnet':
      return 'MAINNET';
    case 'undeployed':
      return 'LOCAL';
    default:
      return networkId.toUpperCase();
  }
}

export function detectInjectedWalletProviders(): WalletProviderEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const injected = (window as any).midnight;
  if (!injected || typeof injected !== 'object') {
    return [];
  }

  return Object.entries(injected).flatMap(([id, provider]) => {
    if (!provider || (typeof (provider as InjectedWalletProvider).connect !== 'function' && typeof (provider as InjectedWalletProvider).enable !== 'function')) {
      return [];
    }

    const walletProvider = provider as InjectedWalletProvider;
    const name = walletProvider.name ?? (id.toLowerCase().includes('1am') ? '1 AM Wallet' : id.toLowerCase().includes('lace') ? 'Lace Wallet' : id);

    return [
      {
        id,
        name,
        icon: walletProvider.icon,
        provider: walletProvider,
      },
    ] satisfies WalletProviderEntry[];
  });
}

export async function connectInjectedWallet(
  provider: InjectedWalletProvider,
  preferredNetworks: string[] = ['preview', 'preprod', 'undeployed', 'mainnet'],
): Promise<{ api: any; networkId: string }> {
  let lastError: unknown = null;

  for (const networkId of preferredNetworks) {
    try {
      const api = typeof provider.connect === 'function' ? await provider.connect(networkId) : await provider.enable?.(networkId);
      if (api) {
        return { api, networkId };
      }
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('network') || message.includes('unsupported') || message.includes('invalid')) {
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to connect wallet.');
}

export function resolveWalletConfig(rawConfig: any): NormalizedWalletConfig {
  const networkId = rawConfig?.networkId ?? rawConfig?.network ?? 'preview';
  const indexerUri = rawConfig?.indexerUri ?? rawConfig?.indexer ?? rawConfig?.indexerUrl ?? '';
  const indexerWsUri = rawConfig?.indexerWsUri ?? rawConfig?.indexerWSUri ?? rawConfig?.indexerWs ?? rawConfig?.indexerWS ?? '';
  const nodeUri = rawConfig?.nodeUri ?? rawConfig?.node ?? rawConfig?.nodeUrl ?? '';
  const nodeWsUri = rawConfig?.nodeWsUri ?? rawConfig?.nodeWSUri ?? rawConfig?.nodeWs ?? rawConfig?.nodeWS ?? '';

  return {
    networkId,
    indexerUri,
    indexerWsUri,
    nodeUri,
    nodeWsUri,
  };
}

export function createPrivateStateProvider() {
  const scopedState = new Map<string, unknown>();
  const signingKeys = new Map<string, unknown>();
  let contractScope = '';

  const scopedKey = (id: string) => `${contractScope}:${id}`;

  return {
    setContractAddress(address: string) {
      contractScope = address;
    },
    async set(id: string, state: unknown) {
      scopedState.set(scopedKey(id), state);
    },
    async get(id: string) {
      return scopedState.get(scopedKey(id)) ?? null;
    },
    async remove(id: string) {
      scopedState.delete(scopedKey(id));
    },
    async clear() {
      scopedState.clear();
    },
    async setSigningKey(address: string, key: unknown) {
      signingKeys.set(address, key);
    },
    async getSigningKey(address: string) {
      return signingKeys.get(address) ?? null;
    },
    async removeSigningKey(address: string) {
      signingKeys.delete(address);
    },
    async clearSigningKeys() {
      signingKeys.clear();
    },
    async exportPrivateStates(): Promise<never> {
      throw new Error('Private state export is not supported in this browser session.');
    },
    async importPrivateStates(): Promise<never> {
      throw new Error('Private state import is not supported in this browser session.');
    },
    async exportSigningKeys(): Promise<never> {
      throw new Error('Signing key export is not supported in this browser session.');
    },
    async importSigningKeys(): Promise<never> {
      throw new Error('Signing key import is not supported in this browser session.');
    },
  };
}

export function createFeedbackCompiledContract() {
  return CompiledContract.make(FEEDBACK_CONTRACT_NAME, FeedbackContract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(FEEDBACK_CONTRACT_ASSET_BASE_URL),
  );
}

export function createFeedbackPublicDataProvider(indexerUri: string, indexerWsUri: string) {
  const base = indexerPublicDataProvider(indexerUri, indexerWsUri);

  async function fetchLatestContractAction(contractAddress: string) {
    const response = await fetch(indexerUri, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `
          query LatestContractAction($address: HexEncoded!) {
            contractAction(address: $address) {
              state
              zswapState
              transaction {
                block {
                  ledgerParameters
                }
              }
            }
          }
        `,
        variables: { address: contractAddress },
      }),
    });

    if (!response.ok) {
      throw new Error(`Indexer request failed with HTTP ${response.status}.`);
    }

    const payload = await response.json();
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((entry: any) => entry.message).join('; '));
    }

    return payload.data?.contractAction ?? null;
  }

  return {
    ...base,
    async queryContractState(contractAddress: string, config?: any) {
      if (config) {
        return base.queryContractState(contractAddress, config);
      }

      try {
        const action = await fetchLatestContractAction(contractAddress);
        return action?.state ? ContractState.deserialize(fromHex(action.state)) : null;
      } catch (err) {
        console.warn('queryContractState warning:', err);
        return null;
      }
    },
    async queryZSwapAndContractState(contractAddress: string, config?: any) {
      if (config) {
        return base.queryZSwapAndContractState(contractAddress, config);
      }

      try {
        const action = await fetchLatestContractAction(contractAddress);
        if (!action?.state || !action?.zswapState) {
          return null;
        }

        return [
          ZswapChainState.deserialize(fromHex(action.zswapState)),
          ContractState.deserialize(fromHex(action.state)),
          action.transaction?.block?.ledgerParameters
            ? LedgerParameters.deserialize(fromHex(action.transaction.block.ledgerParameters))
            : LedgerParameters.initialParameters(),
        ];
      } catch (err) {
        console.warn('queryZSwapAndContractState warning:', err);
        return null;
      }
    },
  };
}

export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  const [configResult, unshieldedResult, shieldedResult] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  const config = resolveWalletConfig(configResult);
  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider<string>(
    new URL(`${FEEDBACK_CONTRACT_ASSET_BASE_URL}/`, window.location.origin).toString(),
    window.fetch.bind(window),
  );

  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  const proofProvider = {
    async proveTx(unprovenTx: any, _config: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const shieldedAddress = Array.isArray(shieldedResult) ? shieldedResult[0] : shieldedResult;
  const shieldedCoinPublicKey = shieldedAddress?.shieldedCoinPublicKey ?? shieldedAddress?.coinPublicKey ?? shieldedAddress?.publicKey ?? '';
  const shieldedEncryptionPublicKey = shieldedAddress?.shieldedEncryptionPublicKey ?? shieldedAddress?.encryptionPublicKey ?? '';
  const unshieldedAddress = typeof unshieldedResult === 'string'
    ? unshieldedResult
    : unshieldedResult?.unshieldedAddress ?? unshieldedResult?.address ?? '';

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const balanced = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
      if (!balanced?.tx) {
        throw new Error('Wallet failed to balance the transaction.');
      }

      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx)) as any;
    },
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const result = await api.submitTransaction(toHex(tx.serialize()));
      if (typeof result === 'string' && result) {
        return result;
      }
      if (result?.transactionId) {
        return result.transactionId;
      }
      if (result?.id) {
        return result.id;
      }
      return toHex(tx.serialize()).slice(0, 64);
    },
  };

  return {
    api,
    config,
    providers: {
      privateStateProvider: createPrivateStateProvider(),
      publicDataProvider: createFeedbackPublicDataProvider(config.indexerUri, config.indexerWsUri),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress,
    shieldedCoinPublicKey,
  };
}

export async function getFeedbackLedgerState(
  publicDataProvider: ReturnType<typeof createFeedbackPublicDataProvider>,
  contractAddress: string,
): Promise<FeedbackLedgerData | null> {
  try {
    const contractState = await publicDataProvider.queryContractState(contractAddress);
    if (!contractState?.data) {
      return null;
    }

    const state = feedbackLedger(contractState.data);
    const totalResponses = Number(state.totalResponses);
    const ratingSum = Number(state.ratingSum);
    const positiveCount = Number(state.positiveCount);
    const averageRating = totalResponses > 0 ? Number((ratingSum / totalResponses).toFixed(2)) : 0;
    const positivePercentage = totalResponses > 0 ? Math.round((positiveCount / totalResponses) * 100) : 0;

    return {
      totalResponses,
      ratingSum,
      positiveCount,
      averageRating,
      positivePercentage,
    };
  } catch {
    return null;
  }
}

export async function waitForFeedbackLedgerState(
  publicDataProvider: ReturnType<typeof createFeedbackPublicDataProvider>,
  contractAddress: string,
  targetCount?: number,
  pollIntervalMs = 2000,
  maxAttempts = 60,
): Promise<FeedbackLedgerData> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const current = await getFeedbackLedgerState(publicDataProvider, contractAddress);
    if (current !== null && (targetCount === undefined || current.totalResponses >= targetCount)) {
      return current;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Feedback state was not indexed after ${Math.round((pollIntervalMs * maxAttempts) / 1000)}s.`);
}

export async function waitForTransactionIndexing(
  publicDataProvider: ReturnType<typeof createFeedbackPublicDataProvider>,
  txId: string,
  pollIntervalMs = 2000,
  maxAttempts = 60,
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const txData = await publicDataProvider.watchForTxData(txId);
      if (txData) {
        return;
      }
    } catch {
      // keep polling
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Transaction ${txId} was not indexed after waiting.`);
}
