import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from '../managed/feedback/contract/index.js';
import { Contract } from '../managed/feedback/contract/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(currentDir, '..', 'managed', 'feedback');

export const CompiledFeedbackContract = CompiledContract.make(
  'FeedbackContract',
  Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);
