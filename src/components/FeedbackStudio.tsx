import React, { useState, useEffect } from 'react';
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
    provingStep,
    lastTxHash,
    error,
    clearError,
    contractAddress,
    submitAnonymousFeedback,
    connectWallet,
    network,
  } = useMidnight();

  const [rating, setRating] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>('dx');
  const [comment, setComment] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTopic, setShareTopic] = useState('Developer Experience');
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  // Read URL query parameters to pre-fill topic if shared
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const topicParam = params.get('topic');
      if (topicParam) {
        const found = CATEGORIES.find(
          (c) => c.label.toLowerCase() === topicParam.toLowerCase() || c.id === topicParam.toLowerCase()
        );
        if (found) {
          setSelectedCategory(found.id);
          setShareTopic(found.label);
        }
      }
    }
  }, []);

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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
      setComment('');
    }
  };

  const copyHash = () => {
    if (!lastTxHash) return;
    navigator.clipboard.writeText(lastTxHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const generateShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${origin}/?topic=${encodeURIComponent(shareTopic)}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(generateShareUrl());
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
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

        <div className="hero-action-buttons">
          <button
            type="button"
            className="btn-ask-feedback"
            onClick={() => setShowShareModal(true)}
          >
            📋 ASK FOR FEEDBACK / SHARE LINK
          </button>
        </div>
      </div>

      {/* Share / Request Feedback Modal */}
      {showShareModal && (
        <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">COLLECT ANONYMOUS FEEDBACK</span>
              <button type="button" className="btn-modal-close" onClick={() => setShowShareModal(false)}>✕</button>
            </div>
            <p className="modal-description">
              Share this link with your community, DAO members, or users. Their feedback ratings will be verified by Zero-Knowledge proofs without ever revealing their wallet addresses.
            </p>

            <div className="input-block">
              <label className="input-label">CAMPAIGN / TOPIC</label>
              <select
                className="protocol-select"
                value={shareTopic}
                onChange={(e) => setShareTopic(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.label}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="input-block">
              <label className="input-label">SHAREABLE FEEDBACK URL</label>
              <div className="share-url-row">
                <input
                  type="text"
                  readOnly
                  className="share-url-input"
                  value={generateShareUrl()}
                />
                <button type="button" className="btn-copy-url" onClick={copyShareLink}>
                  {copiedShareUrl ? 'COPIED ✓' : 'COPY'}
                </button>
              </div>
            </div>

            <div className="modal-privacy-note">
              🛡️ <strong>Zero-Knowledge Guarantee</strong>: Respondents will pay 0 gas fees (sponsored by ProofStation) and their identities will remain 100% confidential.
            </div>
          </div>
        </div>
      )}

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
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShareTopic(cat.label);
                    }}
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
                placeholder="Provide feedback details (Executed solely in client memory as a private local witness)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Error Message with Dismiss */}
            {error && (
              <div className="protocol-alert-error">
                <div className="alert-content">
                  <span className="alert-icon">⚠️</span>
                  <span className="alert-text">{error}</span>
                </div>
                <button type="button" className="btn-dismiss-error" onClick={clearError} title="Dismiss">✕</button>
              </div>
            )}

            {/* ZK Proving Active Multi-Step Progress */}
            {isCallingCircuit && (
              <div className="protocol-alert-proving-card">
                <div className="proving-spinner-row">
                  <div className="proving-spinner" />
                  <div className="proving-header">
                    <span className="proving-title">SYNTHESIZING COMPACT ZERO-KNOWLEDGE PROOF</span>
                    <span className="proving-subtitle">{provingStep || 'Computing proof in client runtime...'}</span>
                  </div>
                </div>
                <div className="proving-progress-bar">
                  <div className="proving-progress-fill" />
                </div>
                <div className="proving-gas-badge">
                  <span>⚡ 100% Sponsored Gas (Cost: 0.00 NIGHT / 0 DUST)</span>
                </div>
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
                  {copiedHash ? 'COPIED ✓' : 'COPY'}
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
              <span className="sidebar-title">PRIVACY EXECUTION STATE</span>
              <span className="live-indicator"><span className="live-dot" /> LIVE</span>
            </div>

            <div className="witness-table">
              <div className="witness-row">
                <span className="w-key">SUBMITTER IDENTITY</span>
                <span className="w-val w-private">OFF-CHAIN [UNLINKED]</span>
              </div>
              <div className="witness-row">
                <span className="w-key">PRIVATE WITNESS</span>
                <span className="w-val w-active">{rating} STARS • {selectedCategory.toUpperCase()}</span>
              </div>
              <div className="witness-row">
                <span className="w-key">ZK PROOF TYPE</span>
                <span className="w-val">ZK-SNARK (COMPACT)</span>
              </div>
              <div className="witness-row">
                <span className="w-key">ON-CHAIN DISCLOSURE</span>
                <span className="w-val w-public">AGGREGATE SUM INCREMENT</span>
              </div>
              <div className="witness-row">
                <span className="w-key">TARGET NETWORK</span>
                <span className="w-val">{network.toUpperCase()} TESTNET</span>
              </div>
              <div className="witness-row">
                <span className="w-key">TRACEABILITY</span>
                <span className="w-val w-private">ZERO (MATHEMATICALLY OBFUSCATED)</span>
              </div>
            </div>
          </div>

          {/* Contract Instance & In-App Deployment Panel */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <span className="sidebar-title">ACTIVE CONTRACT INSTANCE</span>
              <span className="state-version">COMPACT v0.24</span>
            </div>

            <div className="contract-deploy-panel">
              <div className="contract-address-display">
                <div className="input-label-split">
                  <span className="addr-label">ON-CHAIN ADDRESS</span>
                </div>
                <span className="addr-value">{contractAddress || 'Not Deployed'}</span>
              </div>

              {contractAddress && (
                <a
                  href={`https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-deploy-instance text-center"
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  VIEW CONTRACT ON EXPLORER ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
