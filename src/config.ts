export type NetworkConfig = {
  networkId: string;
  indexer: string;
  indexerWS: string;
  node: string;
  nodeWS: string;
  proofServer: string;
  faucet: string;
  contractAddress?: string;
  relayerKey?: string;
  proofGeneratorSecret?: string;
};

function getEnv(key: string, nextKey?: string, viteKey?: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
    if (nextKey && process.env[nextKey]) return process.env[nextKey];
    if (viteKey && process.env[viteKey]) return process.env[viteKey];
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env;
    if (env[key]) return env[key];
    if (nextKey && env[nextKey]) return env[nextKey];
    if (viteKey && env[viteKey]) return env[viteKey];
  }
  return undefined;
}

export const LOCAL_CONFIG: NetworkConfig = {
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  node: 'http://127.0.0.1:9944',
  nodeWS: 'ws://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  faucet: '',
};

export const PREVIEW_CONFIG: NetworkConfig = {
  networkId: 'preview',
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  nodeWS: 'wss://rpc.preview.midnight.network',
  proofServer: getEnv('MIDNIGHT_PROOF_SERVER', 'NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL', 'VITE_MIDNIGHT_PROOF_SERVER_URL') ?? 'http://127.0.0.1:6300',
  faucet: 'https://midnight-tmnight-preview.nethermind.dev/',
};

export const PREPROD_CONFIG: NetworkConfig = {
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
  proofServer: getEnv('MIDNIGHT_PROOF_SERVER', 'NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL', 'VITE_MIDNIGHT_PROOF_SERVER_URL') ?? 'http://127.0.0.1:6300',
  faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
};

export function getConfig(): NetworkConfig {
  const customIndexer = getEnv('MIDNIGHT_INDEXER_URL', 'NEXT_PUBLIC_MIDNIGHT_INDEXER_URL', 'VITE_MIDNIGHT_INDEXER_URL');
  const customNode = getEnv('MIDNIGHT_NODE_URL', 'NEXT_PUBLIC_MIDNIGHT_NODE_URL', 'VITE_MIDNIGHT_NODE_URL');
  const customProofServer = getEnv('MIDNIGHT_PROOF_SERVER', 'NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL', 'VITE_MIDNIGHT_PROOF_SERVER_URL');
  const customNetworkId = getEnv('MIDNIGHT_NETWORK_ID', 'NEXT_PUBLIC_MIDNIGHT_NETWORK_ID', 'VITE_MIDNIGHT_NETWORK_ID');
  const customContractAddress = getEnv('MIDNIGHT_CONTRACT_ADDRESS', 'NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS', 'VITE_CONTRACT_ADDRESS');
  const relayerKey = getEnv('MIDNIGHT_RELAYER_PRIVATE_KEY');
  const proofGeneratorSecret = getEnv('MIDNIGHT_PROOF_GENERATOR_SECRET');

  const network = getEnv('MIDNIGHT_NETWORK', 'NEXT_PUBLIC_MIDNIGHT_NETWORK', 'VITE_MIDNIGHT_NETWORK') ?? 'preview';

  let baseConfig = PREVIEW_CONFIG;
  if (network === 'local' || network === 'undeployed' || network === 'undeployed-testnet') baseConfig = LOCAL_CONFIG;
  else if (network === 'preview') baseConfig = PREVIEW_CONFIG;
  else if (network === 'preprod') baseConfig = PREPROD_CONFIG;

  return {
    ...baseConfig,
    networkId: customNetworkId ?? baseConfig.networkId,
    indexer: customIndexer ? (customIndexer.includes('/api/') ? customIndexer : `${customIndexer.replace(/\/$/, '')}/api/v4/graphql`) : baseConfig.indexer,
    indexerWS: customIndexer ? `${customIndexer.replace(/^http/, 'ws').replace(/\/$/, '')}/api/v4/graphql/ws` : baseConfig.indexerWS,
    node: customNode ?? baseConfig.node,
    nodeWS: customNode ? customNode.replace(/^http/, 'ws') : baseConfig.nodeWS,
    proofServer: customProofServer ?? baseConfig.proofServer,
    contractAddress: customContractAddress,
    relayerKey,
    proofGeneratorSecret,
  };
}
