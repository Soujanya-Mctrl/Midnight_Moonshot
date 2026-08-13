import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { HDWallet, generateRandomSeed, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';

async function createFreshWallet() {
  console.log('\n🎲 Generating fresh Midnight Preview wallet...');
  
  setNetworkId('preview');

  const seedBytes = generateRandomSeed();
  const seedHex = Buffer.from(seedBytes).toString('hex');

  const hdWallet = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));
  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HDWallet from seed');
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== 'keysDerived') {
    throw new Error('Failed to derive keys from seed');
  }

  const keys = derivationResult.keys;
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');
  const address = unshieldedKeystore.getBech32Address();

  console.log('====================================================');
  console.log('🔑 Fresh Seed Generated and saved to .env:');
  console.log(`MIDNIGHT_PREVIEW_SEED=${seedHex}`);
  console.log('\n📍 Unshielded Address:');
  console.log(address);
  console.log('====================================================\n');

  // Update .env file automatically
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

  if (envContent.includes('MIDNIGHT_PREVIEW_SEED=')) {
    envContent = envContent.replace(/MIDNIGHT_PREVIEW_SEED=.*/g, `MIDNIGHT_PREVIEW_SEED=${seedHex}`);
  } else {
    envContent += `\nMIDNIGHT_PREVIEW_SEED=${seedHex}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log('✅ Updated .env with new wallet seed!\n');
  console.log('👉 Paste your address into the Preview faucet to fund it:');
  console.log('   https://midnight-tmnight-preview.nethermind.dev/\n');
}

createFreshWallet().catch(console.error);
