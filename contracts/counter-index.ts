import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from '../managed/counter/contract/index.js';
import { Contract } from '../managed/counter/contract/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkCounterConfigPath = path.resolve(currentDir, '..', 'managed', 'counter');

export const CompiledCounterContract = CompiledContract.make(
  'CounterContract',
  Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkCounterConfigPath),
);
