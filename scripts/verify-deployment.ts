import { getConfig } from '../src/config.js';

interface GraphQLResponse {
  data?: {
    contractState?: {
      data?: string;
    } | null;
  };
  errors?: Array<{ message: string }>;
}

/**
 * Verifies that a deployed Midnight contract address is queryable on-chain via the Indexer GraphQL API.
 */
export async function verifyContractDeployment(
  contractAddress: string,
  network = process.env.MIDNIGHT_NETWORK || 'preview',
): Promise<boolean> {
  const config = getConfig();
  console.log(`\n🔍 Verifying deployment on network '${network}'...`);
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Indexer URL:     ${config.indexer}\n`);

  const query = `
    query GetContractState($address: String!) {
      contractState(address: $address) {
        data
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

    const stateData = result.data?.contractState?.data;

    if (stateData !== undefined && stateData !== null) {
      console.log('✅ Verification SUCCESS: Contract exists and state is live on-chain!');
      console.log(`📊 Raw Ledger State Data: ${stateData}\n`);
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
const addressArg = process.argv[2] || '9a6287e343929ac29e6aa910eca52a0db7ecd9dc794ad6658f2619df57ea1417';
verifyContractDeployment(addressArg).catch(console.error);
