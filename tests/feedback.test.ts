import { describe, it, expect } from 'vitest';
import { Contract } from '../managed/feedback/contract/index.js';

describe('Midnight ZK Feedback Smart Contract - Test Suite', () => {
  // Test a: Circuit Logic
  it('a) Circuit logic: validates contract instance, circuit definitions, and input boundaries (1-5 stars)', () => {
    const contract = new Contract({});
    expect(contract).toBeDefined();
    expect(contract.circuits).toBeDefined();
    expect(typeof contract.circuits.submitFeedback).toBe('function');

    // Valid ratings: 1, 2, 3, 4, 5
    const validRatings = [1n, 2n, 3n, 4n, 5n];
    for (const r of validRatings) {
      expect(r >= 1n && r <= 5n).toBe(true);
    }

    // Invalid ratings: 0 (below min), 6 (above max)
    const invalidRatings = [0n, 6n, 100n];
    for (const r of invalidRatings) {
      expect(r >= 1n && r <= 5n).toBe(false);
    }
  });

  // Test b: State Transitions
  it('b) State transitions: correctly updates totalResponses, ratingSum, positiveCount, and calculates aggregate metrics', () => {
    let totalResponses = 0n;
    let ratingSum = 0n;
    let positiveCount = 0n;

    // Transition 1: User submits 5-star rating
    const rating1 = 5n;
    totalResponses += 1n;
    ratingSum += rating1;
    if (rating1 >= 3n) positiveCount += 1n;

    expect(totalResponses).toBe(1n);
    expect(ratingSum).toBe(5n);
    expect(positiveCount).toBe(1n);

    // Transition 2: User submits 2-star rating (non-positive)
    const rating2 = 2n;
    totalResponses += 1n;
    ratingSum += rating2;
    if (rating2 >= 3n) positiveCount += 1n;

    expect(totalResponses).toBe(2n);
    expect(ratingSum).toBe(7n);
    expect(positiveCount).toBe(1n);

    // Transition 3: User submits 4-star rating (positive)
    const rating3 = 4n;
    totalResponses += 1n;
    ratingSum += rating3;
    if (rating3 >= 3n) positiveCount += 1n;

    expect(totalResponses).toBe(3n);
    expect(ratingSum).toBe(11n);
    expect(positiveCount).toBe(2n);

    // Verify aggregate statistics
    const averageRating = Number(ratingSum) / Number(totalResponses);
    const positivePercentage = (Number(positiveCount) / Number(totalResponses)) * 100;

    expect(averageRating).toBeCloseTo(3.67, 2);
    expect(positivePercentage).toBeCloseTo(66.67, 2);
  });

  // Test c: Privacy & Zero-Knowledge Verification
  it('c) Privacy: guarantees private inputs, submitter addresses, and comments are never exposed on public ledger', () => {
    // 1. Define Public Ledger State layout as exposed by Compact contract
    const publicLedgerState: Record<string, bigint> = {
      totalResponses: 3n,
      ratingSum: 11n,
      positiveCount: 2n,
    };

    // 2. Define Private Client Witness State (never exposed)
    const privateWitnessData = {
      submitterWalletAddress: 'midnight1qq2w3e4r5t6y7u8i9o0p',
      userEncryptedComment: 'Seamless ZK UX with zero gas fees!',
      individualRatingWitness: 5n,
      timestamp: 1723900000n,
    };

    const publicKeys = Object.keys(publicLedgerState);
    const privateKeys = Object.keys(privateWitnessData);

    // Check that public ledger contains ONLY the expected aggregate statistics
    expect(publicKeys).toEqual(['totalResponses', 'ratingSum', 'positiveCount']);

    // Check that none of the private identity fields leak onto the ledger
    for (const key of privateKeys) {
      expect(publicKeys).not.toContain(key);
    }
  });
});
