import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { Buffer } from 'buffer';

const seedHex = process.env.MIDNIGHT_PREVIEW_SEED || '9aadb11c836bcce8fd6c41520cf5ecd6534942d3e4c67da9bb4fc398eab93981';

setNetworkId('preview');

const hdWallet = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
if (hdWallet.type !== 'seedOk') {
  console.error('Failed to initialize HDWallet from seed');
  process.exit(1);
}

const derivationResult = hdWallet.hdWallet
  .selectAccount(0)
  .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
  .deriveKeysAt(0);

if (derivationResult.type !== 'keysDerived') {
  console.error('Failed to derive keys from seed');
  process.exit(1);
}

const keys = derivationResult.keys;
const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');
const address = unshieldedKeystore.getBech32Address();

console.log('\n====================================================');
console.log('🔑 MIDNIGHT_PREVIEW_SEED:');
console.log(seedHex);
console.log('\n📍 UNSHIELDED ADDRESS (Preview Testnet):');
console.log(address.toString());
console.log('====================================================\n');
