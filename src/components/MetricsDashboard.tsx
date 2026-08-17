import React from 'react';
import { useMidnight } from '../hooks/useMidnight';

export const MetricsDashboard: React.FC = () => {
  const { isConnected, feedbackState, isLoadingState, tnightBalance, dustBalance, contractAddress } = useMidnight();

  const total = feedbackState?.totalResponses ?? 0;
  const avg = feedbackState?.averageRating ?? 0;
  const positiveRate = feedbackState?.positivePercentage ?? 0;
  const positiveCount = feedbackState?.positiveCount ?? 0;

  return (
    <div className="protocol-view-wrapper">
      <div className="protocol-hero">
        <div className="hero-eyebrow">TELEMETRY & ON-CHAIN STATE</div>
        <h1 className="hero-headline">
          VERIFIABLE LEDGER<br />
          <span>METRICS.</span>
        </h1>
        <p className="hero-subtext">
          Zero-knowledge proofs continuously update public ledger aggregates without recording any private participant identity.
        </p>
      </div>

      <div className="telemetry-grid">
        <div className="telemetry-card">
          <div className="card-top-tag">AGGREGATE COUNT</div>
          <div className="telemetry-giant-num">{isLoadingState ? '—' : total}</div>
          <div className="telemetry-foot">Verified anonymous submissions on Midnight ledger</div>
        </div>

        <div className="telemetry-card">
          <div className="card-top-tag">SATISFACTION SCORE</div>
          <div className="telemetry-giant-num">{isLoadingState ? '—' : `${avg.toFixed(1)} ★`}</div>
          <div className="telemetry-foot">Weighted average calculated on-chain via ZK circuits</div>
        </div>

        <div className="telemetry-card">
          <div className="card-top-tag">POSITIVE SENTIMENT</div>
          <div className="telemetry-giant-num">{isLoadingState ? '—' : `${positiveRate}%`}</div>
          <div className="telemetry-foot">{positiveCount} responses rated 3 stars or higher</div>
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
          <div className="telemetry-foot">Tokens available for zero-knowledge proving transactions</div>
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
