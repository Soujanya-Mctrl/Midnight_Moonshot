import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);
const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);
const _descriptor_2 = __compactRuntime.CompactTypeBoolean;
const _descriptor_3 = new __compactRuntime.CompactTypeBytes(32);
const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  circuits;
  impureCircuits;
  provableCircuits;

  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof witnesses_0 !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      submitFeedback: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`submitFeedback: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const rating_0 = args_1[1];
        if (!(typeof contextOrig_0 === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError(
            'submitFeedback',
            'argument 1 (as invoked from Typescript)',
            'feedback.compact line 7 char 1',
            'CircuitContext',
            contextOrig_0,
          );
        }
        if (!(typeof rating_0 === 'bigint' && rating_0 >= 1n && rating_0 <= 5n)) {
          __compactRuntime.typeError(
            'submitFeedback',
            'argument 1 (argument 2 as invoked from Typescript)',
            'feedback.compact line 7 char 1',
            'Uint<1..5>',
            rating_0,
          );
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(rating_0),
            alignment: _descriptor_0.alignment(),
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: [],
        };
        const result_0 = this._submitFeedback_0(context, partialProofData, rating_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
    };
    this.impureCircuits = { submitFeedback: this.circuits.submitFeedback };
    this.provableCircuits = { submitFeedback: this.circuits.submitFeedback };
  }

  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument, received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('submitFeedback', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(
      __compactRuntime.dummyContractAddress(),
      constructorContext_0.initialZswapLocalState.coinPublicKey,
      state_0.data,
      constructorContext_0.initialPrivateState,
    );
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: [],
    };
    __compactRuntime.queryLedgerState(context, partialProofData, [
      { push: { storage: false, value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n), alignment: _descriptor_7.alignment() }).encode() } },
      { push: { storage: true, value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n), alignment: _descriptor_0.alignment() }).encode() } },
      { ins: { cached: false, n: 1 } },
      { push: { storage: false, value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(1n), alignment: _descriptor_7.alignment() }).encode() } },
      { push: { storage: true, value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n), alignment: _descriptor_0.alignment() }).encode() } },
      { ins: { cached: false, n: 1 } },
      { push: { storage: false, value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(2n), alignment: _descriptor_7.alignment() }).encode() } },
      { push: { storage: true, value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n), alignment: _descriptor_0.alignment() }).encode() } },
      { ins: { cached: false, n: 1 } },
    ]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState,
    };
  }

  _submitFeedback_0(context, partialProofData, rating_0) {
    if (rating_0 < 1n || rating_0 > 5n) {
      throw new __compactRuntime.CompactError('Rating must be between 1 and 5 stars');
    }

    const currentTotal = _descriptor_0.fromValue(
      __compactRuntime.queryLedgerState(context, partialProofData, [
        { dup: { n: 0 } },
        { idx: { cached: false, pushPath: false, path: [{ tag: 'value', value: { value: _descriptor_7.toValue(0n), alignment: _descriptor_7.alignment() } }] } },
        { popeq: { cached: false, result: undefined } },
      ]).value,
    );
    const newTotal = currentTotal + 1n;

    const currentSum = _descriptor_0.fromValue(
      __compactRuntime.queryLedgerState(context, partialProofData, [
        { dup: { n: 0 } },
        { idx: { cached: false, pushPath: false, path: [{ tag: 'value', value: { value: _descriptor_7.toValue(1n), alignment: _descriptor_7.alignment() } }] } },
        { popeq: { cached: false, result: undefined } },
      ]).value,
    );
    const newSum = currentSum + rating_0;

    const currentPos = _descriptor_0.fromValue(
      __compactRuntime.queryLedgerState(context, partialProofData, [
        { dup: { n: 0 } },
        { idx: { cached: false, pushPath: false, path: [{ tag: 'value', value: { value: _descriptor_7.toValue(2n), alignment: _descriptor_7.alignment() } }] } },
        { popeq: { cached: false, result: undefined } },
      ]).value,
    );
    const newPos = rating_0 >= 3n ? currentPos + 1n : currentPos;

    __compactRuntime.queryLedgerState(context, partialProofData, [
      { push: { storage: false, value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(0n), alignment: _descriptor_7.alignment() }).encode() } },
      { push: { storage: true, value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newTotal), alignment: _descriptor_0.alignment() }).encode() } },
      { ins: { cached: false, n: 1 } },
      { push: { storage: false, value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(1n), alignment: _descriptor_7.alignment() }).encode() } },
      { push: { storage: true, value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newSum), alignment: _descriptor_0.alignment() }).encode() } },
      { ins: { cached: false, n: 1 } },
      { push: { storage: false, value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(2n), alignment: _descriptor_7.alignment() }).encode() } },
      { push: { storage: true, value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newPos), alignment: _descriptor_0.alignment() }).encode() } },
      { ins: { cached: false, n: 1 } },
    ]);

    return [];
  }
}

export function ledger(stateOrChargedState) {
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel(),
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: [],
  };

  return {
    get totalResponses() {
      try {
        return _descriptor_0.fromValue(
          __compactRuntime.queryLedgerState(context, partialProofData, [
            { dup: { n: 0 } },
            { idx: { cached: false, pushPath: false, path: [{ tag: 'value', value: { value: _descriptor_7.toValue(0n), alignment: _descriptor_7.alignment() } }] } },
            { popeq: { cached: false, result: undefined } },
          ]).value,
        );
      } catch {
        return 0n;
      }
    },
    get ratingSum() {
      try {
        return _descriptor_0.fromValue(
          __compactRuntime.queryLedgerState(context, partialProofData, [
            { dup: { n: 0 } },
            { idx: { cached: false, pushPath: false, path: [{ tag: 'value', value: { value: _descriptor_7.toValue(1n), alignment: _descriptor_7.alignment() } }] } },
            { popeq: { cached: false, result: undefined } },
          ]).value,
        );
      } catch {
        return 0n;
      }
    },
    get positiveCount() {
      try {
        return _descriptor_0.fromValue(
          __compactRuntime.queryLedgerState(context, partialProofData, [
            { dup: { n: 0 } },
            { idx: { cached: false, pushPath: false, path: [{ tag: 'value', value: { value: _descriptor_7.toValue(2n), alignment: _descriptor_7.alignment() } }] } },
            { popeq: { cached: false, result: undefined } },
          ]).value,
        );
      } catch {
        return 0n;
      }
    },
  };
}

export const pureCircuits = {};
export const contractReferenceLocations = { tag: 'publicLedgerArray', indices: {} };
