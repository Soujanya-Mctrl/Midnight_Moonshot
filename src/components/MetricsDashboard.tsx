import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';

export const MetricsDashboard: React.FC = () => {
  const {
    isConnected,
    feedbackState,
    isLoadingState,
    tnightBalance,
    dustBalance,
    contractAddress,
    fetchLiveContractState,
  } = useMidnight();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const total = feedbackState?.totalResponses ?? 0;
  const avg = feedbackState?.averageRating ?? 0;
  const positiveRate = feedbackState?.positivePercentage ?? 0;
  const positiveCount = feedbackState?.positiveCount ?? 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveContractState();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="protocol-view-wrapper">
      <div className="protocol-hero">
        <div className="hero-eyebrow">TELEMETRY & ON-CHAIN STATE</div>
        <div className="hero-title-row">
          <h1 className="hero-headline">
            VERIFIABLE LEDGER<br />
            <span>METRICS.</span>
          </h1>
          <button
            type="button"
            className={`btn-refresh-metrics ${isRefreshing || isLoadingState ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingState}
            title="Fetch latest state from Midnight Indexer"
          >
            <span className="refresh-icon">↻</span>
            <span>{isRefreshing || isLoadingState ? 'SYNCING...' : 'REFRESH ON-CHAIN'}</span>
          </button>
        </div>
        <p className="hero-subtext">
          Zero-knowledge proofs continuously update public ledger aggregates without recording any private participant identity.
        </p>
      </div>

      <div className="telemetry-grid">
        <div className="telemetry-card">
          <div className="card-top-tag">AGGREGATE COUNT</div>
          <div className="telemetry-giant-num">
            {isLoadingState ? <span className="skeleton-pulse">...</span> : total}
          </div>
          <div className="telemetry-foot">Verified anonymous submissions on Midnight ledger</div>
        </div>

        <div className="telemetry-card">
          <div className="card-top-tag">SATISFACTION SCORE</div>
          <div className="telemetry-giant-num">
            {isLoadingState ? <span className="skeleton-pulse">...</span> : `${avg.toFixed(1)} ★`}
          </div>
          <div className="telemetry-foot">
            {total > 0 ? `Weighted average: ${feedbackState?.ratingSum ?? 0} sum / ${total} responses` : 'Calculated on-chain via ZK circuits'}
          </div>
        </div>

        <div className="telemetry-card">
          <div className="card-top-tag">POSITIVE SENTIMENT</div>
          <div className="telemetry-giant-num">
            {isLoadingState ? <span className="skeleton-pulse">...</span> : `${positiveRate}%`}
          </div>
          <div className="telemetry-foot">{positiveCount} of {total} responses rated ≥ 3 stars</div>
        </div>

        <div className="telemetry-card">
          <div className="card-top-tag">ZK PROVER ASSETS</div>
          <div className="wallet-balance-stats">
            <div className="b-stat">
              <span className="b-label">tNIGHT</span>
              <span className="b-val">{isConnected ? `${tnightBalance}` : '0.00'}</span>
            </div>
            <div className="b-stat">
              <span className="b-label">DUST</span>
              <span className="b-val">{isConnected ? `${dustBalance}` : '0.00'}</span>
            </div>
          </div>
          <div className="telemetry-foot">Gas fees are 100% sponsored by 1AM ProofStation</div>
        </div>
      </div>

      {/* Cryptographic Boundary Breakdown */}
      <div className="telemetry-privacy-breakdown">
        <div className="breakdown-card public-side">
          <div className="breakdown-tag">🌐 PUBLIC ON-CHAIN LEDGER</div>
          <ul className="breakdown-list">
            <li>✓ Total Verified Submissions: <strong>{total}</strong></li>
            <li>✓ Rating Accumulator: <strong>{feedbackState?.ratingSum ?? 0}</strong></li>
            <li>✓ Positive Ratings Count: <strong>{positiveCount}</strong></li>
          </ul>
        </div>
        <div className="breakdown-card private-side">
          <div className="breakdown-tag">🔒 PRIVATE ZERO-KNOWLEDGE WITNESS</div>
          <ul className="breakdown-list">
            <li>🔒 Submitter Wallet Address: <strong>Unlinked & Hidden</strong></li>
            <li>🔒 Confidential Feedback Notes: <strong>Local Memory Only</strong></li>
            <li>🔒 Individual Star Scores: <strong>Evaluated Inside ZK-SNARK</strong></li>
          </ul>
        </div>
      </div>

      {contractAddress && (
        <div className="contract-address-bar">
          <span className="c-label">DEPLOYED CONTRACT:</span>
          <code className="c-addr">{contractAddress}</code>
          <a
            href={`https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="c-link"
          >
            VIEW STREAM ↗
          </a>
        </div>
      )}
    </div>
  );
};
