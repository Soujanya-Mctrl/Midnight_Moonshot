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

import { getConfig } from '../src/config.js';

interface GraphQLResponse {
  data?: {
    contractAction?: {
      state?: string;
      zswapState?: string;
    } | null;
  };
  errors?: Array<{ message: string }>;
}

export async function verifyContractDeployment(
  contractAddress: string,
  network = process.env.MIDNIGHT_NETWORK || 'preview',
): Promise<boolean> {
  const config = getConfig();
  console.log(`\n🔍 Verifying deployment on network '${network}'...`);
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Indexer URL:     ${config.indexer}\n`);

  const query = `
    query LatestContractAction($address: HexEncoded!) {
      contractAction(address: $address) {
        state
        zswapState
      }
    }
  `;

  try {
    const response = await fetch(config.indexer, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { address: contractAddress },
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return false;
    }

    const result = (await response.json()) as GraphQLResponse;

    if (result.errors && result.errors.length > 0) {
      console.error(`❌ GraphQL Error: ${result.errors[0].message}`);
      return false;
    }

    const stateData = result.data?.contractAction?.state;

    if (stateData !== undefined && stateData !== null) {
      console.log('✅ Verification SUCCESS: Contract exists and is live on Midnight Preview ledger!');
      console.log(`📊 Raw Ledger State Data: ${stateData.substring(0, 64)}...\n`);
      return true;
    } else {
      console.log('⚠️ Contract address query returned null state (contract may still be deploying or indexing).');
      return false;
    }
  } catch (error: any) {
    console.error(`❌ Network request failed: ${error?.message || error}`);
    return false;
  }
}

// CLI entrypoint
const contractAddress =
  process.env['VITE_CONTRACT_ADDRESS'] ??
  process.env['NEXT_PUBLIC_MIDNIGHT_CONTRACT_ADDRESS'] ??
  'b7840834b9d2c13eeb676efa94271ee3e8b28cdab086b8212675d11f965aa8ac';
verifyContractDeployment(contractAddress).catch(console.error);
