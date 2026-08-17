import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';

interface FeedbackStudioProps {
  onFeedbackSubmitted?: (record: {
    hash: string;
    rating: number;
    category: string;
    commentPreview: string;
    timestamp: string;
  }) => void;
}

const CATEGORIES = [
  { id: 'dx', label: 'Developer Experience' },
  { id: 'privacy', label: 'Privacy & Cryptography' },
  { id: 'ui', label: 'Interface & Usability' },
  { id: 'network', label: 'Network & Indexer' },
  { id: 'general', label: 'General Ecosystem' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'POOR',
  2: 'FAIR',
  3: 'GOOD',
  4: 'VERY GOOD',
  5: 'EXCELLENT',
};

export const FeedbackStudio: React.FC<FeedbackStudioProps> = ({ onFeedbackSubmitted }) => {
  const {
    isConnected,
    isCallingCircuit,
    isDeploying,
    deployContract,
    resetContractAddress,
    lastTxHash,
    error,
    contractAddress,
    submitAnonymousFeedback,
    connectWallet,
    feedbackState,
    network,
  } = useMidnight();

  const [rating, setRating] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('dx');
  const [comment, setComment] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || isCallingCircuit) return;

    const txHash = await submitAnonymousFeedback(rating, comment);
    if (txHash) {
      const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted({
          hash: txHash,
          rating,
          category: catObj ? catObj.label : 'General',
          commentPreview: comment.trim() ? `${comment.trim().substring(0, 48)}...` : 'Confidential contribution',
          timestamp: 'Just now',
        });
      }
      setComment('');
    }
  };

  const copyHash = () => {
    if (!lastTxHash) return;
    navigator.clipboard.writeText(lastTxHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="protocol-view-wrapper">
      {/* Editorial Hero Header */}
      <div className="protocol-hero">
        <div className="hero-eyebrow">MIDNIGHT NETWORK • COMPACT PRIVACY PROTOCOL</div>
        <h1 className="hero-headline">
          PRIVATE FEEDBACK<br />
          <span>WITHOUT IDENTITY.</span>
        </h1>
        <p className="hero-subtext">
          Submit verifiable sentiment metrics compiled locally into zero-knowledge proofs. Public ledgers aggregate total satisfaction without linking submitter wallet addresses.
        </p>
      </div>

      {/* Spatial Composition Grid */}
      <div className="spatial-grid">
        {/* Left Column: Feedback Form */}
        <div className="form-panel">
          <div className="panel-bar">
            <span className="panel-bar-title">SUBMISSION PARAMETERS</span>
            <span className="panel-bar-meta">CIRCUIT: FEEDBACK</span>
          </div>

          <form onSubmit={handleSubmit} className="protocol-form">
            {/* Category Segmented Row */}
            <div className="input-block">
              <label className="input-label">TOPIC CATEGORY</label>
              <div className="segmented-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`segment-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Selector */}
            <div className="input-block">
              <div className="input-label-split">
                <label className="input-label">SATISFACTION SCORE</label>
                <span className="score-desc">{rating} / 5 • {RATING_LABELS[rating]}</span>
              </div>
              <div className="rating-grid">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`rating-block-btn ${rating === val ? 'active' : ''}`}
                    onClick={() => setRating(val)}
                  >
                    <span className="rating-num">{val}</span>
                    <span className="rating-star">★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="input-block">
              <div className="input-label-split">
                <label className="input-label">CONFIDENTIAL MEMO</label>
                <span className="char-count-meta">{comment.length} / 280</span>
              </div>
              <textarea
                className="protocol-textarea"
                rows={3}
                maxLength={280}
                placeholder="Provide feedback details (Executed solely in client memory as a local witness)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && <div className="protocol-alert-error">{error}</div>}

            {/* ZK Proving Active Notification */}
            {isCallingCircuit && (
              <div className="protocol-alert-proving">
                <span className="proving-pulse" />
                <span>Synthesizing Compact ZK Proof & Submitting Unsigned Extrinsic...</span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="form-actions-row">
              {isConnected ? (
                <button
                  type="submit"
                  className="btn-protocol-primary"
                  disabled={isCallingCircuit}
                >
                  {isCallingCircuit ? 'GENERATING ZK PROOF...' : 'SUBMIT WITH ZK PROOF'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-protocol-primary"
                  onClick={() => connectWallet()}
                >
                  CONNECT WALLET TO SUBMIT
                </button>
              )}

              <a
                href="https://midnight-tmnight-preview.nethermind.dev"
                target="_blank"
                rel="noreferrer"
                className="btn-protocol-secondary"
              >
                TESTNET FAUCET ↗
              </a>
            </div>
          </form>

          {/* Confirmed Tx Banner */}
          {lastTxHash && (
            <div className="tx-verified-card">
              <div className="tx-verified-header">
                <span className="verified-glyph">✓</span>
                <span className="verified-title">PROOF VERIFIED & ON-CHAIN COMMITTED</span>
              </div>
              <div className="tx-hash-row">
                <span className="tx-hash-val">{lastTxHash}</span>
                <button type="button" className="btn-copy-hash" onClick={copyHash}>
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
              {contractAddress && (
                <a
                  href={`https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tx-explorer-link"
                >
                  Inspect State Transition on Midnight Explorer →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Protocol Status & Cryptographic Witness Panel */}
        <div className="protocol-sidebar">
          {/* Live Dynamic Protocol Witness Panel */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <span className="sidebar-title">PROTOCOL EXECUTION STATE</span>
              <span className="live-indicator"><span className="live-dot" /> LIVE</span>
            </div>

            <div className="witness-table">
              <div className="witness-row">
                <span className="w-key">IDENTITY</span>
                <span className="w-val w-private">OFF-CHAIN [HIDDEN]</span>
              </div>
              <div className="witness-row">
                <span className="w-key">LOCAL WITNESS</span>
                <span className="w-val w-active">{rating} STARS • {selectedCategory.toUpperCase()}</span>
              </div>
              <div className="witness-row">
                <span className="w-key">PROOF TYPE</span>
                <span className="w-val">ZK-SNARK (COMPACT)</span>
              </div>
              <div className="witness-row">
                <span className="w-key">DISCLOSURE</span>
                <span className="w-val w-public">AGGREGATE SUM INCREMENT</span>
              </div>
              <div className="witness-row">
                <span className="w-key">TARGET NETWORK</span>
                <span className="w-val">{network.toUpperCase()} TESTNET</span>
              </div>
              <div className="witness-row">
                <span className="w-key">LINKABILITY</span>
                <span className="w-val w-private">ZERO (MATHEMATICALLY PROVEN)</span>
              </div>
            </div>
          </div>

          {/* Contract Instance & In-App Deployment Panel */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <span className="sidebar-title">ACTIVE CONTRACT INSTANCE</span>
              <span className="state-version">COMPACT</span>
            </div>

            <div className="contract-deploy-panel">
              <div className="contract-address-display">
                <div className="input-label-split">
                  <span className="addr-label">ON-CHAIN ADDRESS</span>
                  {contractAddress && (
                    <button
                      type="button"
                      className="btn-text-reset"
                      onClick={resetContractAddress}
                      title="Clear saved contract address"
                    >
                      RESET
                    </button>
                  )}
                </div>
                <span className="addr-value">{contractAddress || 'Not Deployed'}</span>
              </div>

              {isConnected ? (
                <button
                  type="button"
                  className="btn-deploy-instance"
                  onClick={() => deployContract()}
                  disabled={isDeploying}
                >
                  {isDeploying ? 'DEPLOYING CONTRACT VIA WALLET...' : '⚡ DEPLOY NEW CONTRACT INSTANCE'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-deploy-instance"
                  onClick={() => connectWallet()}
                >
                  CONNECT WALLET TO DEPLOY
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
