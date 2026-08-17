import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { ledger as feedbackLedger } from '../managed/feedback/contract/index.js';

const address = '07ea1c598023eade80a88d01d30ef0758415be7dee6fe6e5a95a22fc69e94ea5';

function fromHex(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
}

const res = await fetch('https://indexer.preview.midnight.network/api/v4/graphql', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    query: `
      query GetActions($address: HexEncoded!) {
        contractAction(address: $address) {
          state
          zswapState
        }
      }
    `,
    variables: { address },
  }),
});

const data = await res.json();
console.log('Contract Stream Status:', JSON.stringify(data, null, 2));
