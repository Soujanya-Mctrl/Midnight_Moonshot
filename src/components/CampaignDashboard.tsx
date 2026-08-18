import React, { useState, useEffect } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import type { Campaign } from './CampaignSelector';
import type { FeedItem } from './LiveFeedStream';

const CATEGORIES = [
  { id: 'any', label: 'Any Category' },
  { id: 'dx', label: 'Developer Experience' },
  { id: 'privacy', label: 'Privacy & Cryptography' },
  { id: 'ui', label: 'Interface & Usability' },
  { id: 'network', label: 'Network & Indexer' },
  { id: 'defi', label: 'DeFi & Payments' },
  { id: 'general', label: 'General Ecosystem' },
  { id: 'custom', label: '+ Custom Topic...' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'POOR',
  2: 'FAIR',
  3: 'GOOD',
  4: 'VERY GOOD',
  5: 'EXCELLENT',
};

interface CampaignDashboardProps {
  campaign: Campaign;
  onBack: () => void;
  feedItems: FeedItem[];
  onFeedbackSubmitted: (record: FeedItem) => void;
  onClearActivity: () => void;
}

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaign,
  onBack,
  feedItems,
  onFeedbackSubmitted,
  onClearActivity,
}) => {
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
    feedbackState,
    isLoadingState,
    tnightBalance,
    dustBalance,
    fetchLiveContractState,
  } = useMidnight();

  const [selectedCategory, setSelectedCategory] = useState<string>('any');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [copiedBadgeMd, setCopiedBadgeMd] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeCategoryLabel =
    selectedCategory === 'custom'
      ? customCategoryName.trim() || 'Custom Topic'
      : CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Any Category';

  // On-chain metrics
  const total = feedbackState?.totalResponses ?? 0;
  const avg = feedbackState?.averageRating ?? 0;
  const positiveRate = feedbackState?.positivePercentage ?? 0;
  const positiveCount = feedbackState?.positiveCount ?? 0;

  // Campaign-filtered feed items
  const campaignFeed = feedItems.filter(
    (item) => !item.projectName || item.projectName === campaign.name
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveContractState();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || isCallingCircuit) return;

    const txHash = await submitAnonymousFeedback(rating, comment);
    if (txHash) {
      onFeedbackSubmitted({
        hash: txHash,
        rating,
        category: activeCategoryLabel,
        projectName: campaign.name,
        commentPreview: comment.trim() ? `${comment.trim().substring(0, 48)}...` : 'Confidential contribution',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
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
    return `${origin}/?project=${encodeURIComponent(campaign.id)}&topic=${encodeURIComponent(selectedCategory === 'custom' ? activeCategoryLabel : selectedCategory)}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(generateShareUrl());
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  const getBadgeMarkdown = () => {
    const shareUrl = generateShareUrl();
    return `[![Midnight Feedback](https://img.shields.io/badge/Midnight_ZK-Feedback-38bdf8?style=flat&logo=shield)](${shareUrl})`;
  };

  const copyBadgeMarkdown = () => {
    navigator.clipboard.writeText(getBadgeMarkdown());
    setCopiedBadgeMd(true);
    setTimeout(() => setCopiedBadgeMd(false), 2000);
  };

  return (
    <div className="campaign-dashboard">
      {/* Campaign Header Bar */}
      <div className="campaign-header-bar">
        <button type="button" className="btn-back-campaigns" onClick={onBack}>
          ← ALL CAMPAIGNS
        </button>
        <div className="campaign-header-info">
          <span className="campaign-header-emoji">{campaign.emoji}</span>
          <div>
            <h2 className="campaign-header-name">{campaign.name}</h2>
            <span className="campaign-header-desc">{campaign.description}</span>
          </div>
        </div>
        <button
          type="button"
          className="btn-ask-feedback"
          onClick={() => setShowShareModal(true)}
        >
          📋 SHARE FEEDBACK LINK
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">SHARE FEEDBACK CAMPAIGN</span>
              <button type="button" className="btn-modal-close" onClick={() => setShowShareModal(false)}>✕</button>
            </div>
            <p className="modal-description">
              Share this dedicated link with your users or DAO members. Their feedback will be submitted with client-side Zero-Knowledge proofs with zero gas fees.
            </p>

            <div className="input-block">
              <label className="input-label">CAMPAIGN TARGET</label>
              <input type="text" readOnly className="share-url-input" value={campaign.name} />
            </div>

            <div className="input-block">
              <label className="input-label">SHAREABLE FEEDBACK URL</label>
              <div className="share-url-row">
                <input type="text" readOnly className="share-url-input" value={generateShareUrl()} />
                <button type="button" className="btn-copy-url" onClick={copyShareLink}>
                  {copiedShareUrl ? 'COPIED ✓' : 'COPY'}
                </button>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">README / GITHUB BADGE</label>
              <div className="share-url-row">
                <input type="text" readOnly className="share-url-input" value={getBadgeMarkdown()} />
                <button type="button" className="btn-copy-url" onClick={copyBadgeMarkdown}>
                  {copiedBadgeMd ? 'COPIED ✓' : 'COPY MARKDOWN'}
                </button>
              </div>
            </div>

            <div className="modal-privacy-note">
              🛡️ <strong>Zero-Knowledge Guarantee</strong>: Respondents pay 0 gas fees (sponsored by ProofStation) and their identities remain 100% confidential.
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ SECTION 1: ANALYTICS TELEMETRY ═══════════ */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <span className="dashboard-section-title">📊 CAMPAIGN ANALYTICS</span>
          <button
            type="button"
            className={`btn-refresh-metrics ${isRefreshing || isLoadingState ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingState}
            title="Fetch latest state from Midnight Indexer"
          >
            <span className="refresh-icon">↻</span>
            <span>{isRefreshing || isLoadingState ? 'SYNCING...' : 'REFRESH'}</span>
          </button>
        </div>

        <div className="telemetry-grid compact">
          <div className="telemetry-card">
            <div className="card-top-tag">TOTAL RESPONSES</div>
            <div className="telemetry-giant-num">
              {isLoadingState ? <span className="skeleton-pulse">...</span> : total}
            </div>
          </div>
          <div className="telemetry-card">
            <div className="card-top-tag">AVG RATING</div>
            <div className="telemetry-giant-num">
              {isLoadingState ? <span className="skeleton-pulse">...</span> : `${avg.toFixed(1)} ★`}
            </div>
          </div>
          <div className="telemetry-card">
            <div className="card-top-tag">POSITIVE</div>
            <div className="telemetry-giant-num">
              {isLoadingState ? <span className="skeleton-pulse">...</span> : `${positiveRate}%`}
            </div>
          </div>
          <div className="telemetry-card">
            <div className="card-top-tag">WALLET BALANCE</div>
            <div className="wallet-balance-stats">
              <div className="b-stat">
                <span className="b-label">tNIGHT</span>
                <span className="b-val">{isConnected ? `${tnightBalance}` : '—'}</span>
              </div>
              <div className="b-stat">
                <span className="b-label">DUST</span>
                <span className="b-val">{isConnected ? `${dustBalance}` : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 2: FEEDBACK FORM ═══════════ */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <span className="dashboard-section-title">✍️ SUBMIT FEEDBACK</span>
          <span className="dashboard-section-meta">CIRCUIT: submitFeedback</span>
        </div>

        <form onSubmit={handleSubmit} className="protocol-form dashboard-form">
          {/* Category */}
          <div className="input-block">
            <label className="input-label">FEEDBACK TOPIC / CATEGORY</label>
            <select
              className="protocol-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            {selectedCategory === 'custom' && (
              <div style={{ marginTop: '6px' }}>
                <input
                  type="text"
                  required
                  placeholder="Enter your custom topic..."
                  className="protocol-input"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="input-block">
            <div className="input-label-split">
              <label className="input-label">SATISFACTION RATING</label>
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

          {/* Comment */}
          <div className="input-block">
            <div className="input-label-split">
              <label className="input-label">CONFIDENTIAL MEMO</label>
              <span className="char-count-meta">{comment.length} / 280</span>
            </div>
            <textarea
              className="protocol-textarea"
              rows={3}
              maxLength={280}
              placeholder={`Share your feedback for ${campaign.name} (processed locally as a private witness)...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="protocol-alert-error">
              <div className="alert-content">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{error}</span>
              </div>
              <button type="button" className="btn-dismiss-error" onClick={clearError} title="Dismiss">✕</button>
            </div>
          )}

          {/* ZK Progress */}
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

          {/* Submit Button */}
          <div className="form-actions-row">
            {isConnected ? (
              <button
                type="submit"
                className="btn-protocol-primary"
                disabled={isCallingCircuit}
              >
                {isCallingCircuit ? 'GENERATING ZK PROOF...' : `SUBMIT PROOF FOR ${campaign.name.toUpperCase()}`}
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

      {/* ═══════════ SECTION 3: PRIVACY BOUNDARY ═══════════ */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <span className="dashboard-section-title">🔐 PRIVACY BOUNDARY</span>
        </div>

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
      </div>

      {/* ═══════════ SECTION 4: SESSION ACTIVITY ═══════════ */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <span className="dashboard-section-title">📜 SESSION ACTIVITY</span>
          {campaignFeed.length > 0 && (
            <button
              type="button"
              className="btn-clear-activity"
              onClick={onClearActivity}
              title="Clear stored session entries"
            >
              CLEAR LOG ✕
            </button>
          )}
        </div>

        {campaignFeed.length === 0 ? (
          <div className="empty-protocol-state compact">
            <div className="empty-glyph">🛡️</div>
            <div className="empty-title">NO SUBMISSIONS YET</div>
            <p className="empty-sub">
              Submit your first ZK feedback proof above — it will appear here.
            </p>
          </div>
        ) : (
          <div className="activity-table">
            <div className="table-header-row">
              <span className="col-score">SCORE</span>
              <span className="col-memo">CONFIDENTIAL MEMO</span>
              <span className="col-cat">CATEGORY</span>
              <span className="col-tx">PROOF HASH</span>
              <span className="col-action">EXPLORER</span>
            </div>
            {campaignFeed.map((item, idx) => (
              <div key={idx} className="table-data-row">
                <span className="col-score score-badge">{item.rating} ★</span>
                <span className="col-memo memo-text">"{item.commentPreview}"</span>
                <span className="col-cat cat-tag">{item.category}</span>
                <span className="col-tx tx-code" title={item.hash}>
                  {item.hash.length > 18
                    ? `${item.hash.substring(0, 8)}...${item.hash.substring(item.hash.length - 6)}`
                    : item.hash}
                </span>
                <span className="col-action">
                  {contractAddress && (
                    <a
                      href={`https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="row-action-link"
                    >
                      INSPECT ↗
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ SECTION 5: HOW IT WORKS ═══════════ */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <span className="dashboard-section-title">⚙️ HOW IT WORKS</span>
        </div>

        <div className="architecture-grid compact">
          <div className="arch-card">
            <div className="arch-step">01 / WITNESS GENERATION</div>
            <h3 className="arch-heading">Client-Side Memory</h3>
            <p className="arch-body">
              Your rating and optional comment are held strictly inside your local browser memory as a private witness. The submitter's wallet address is never bound to the proof statement.
            </p>
            <div className="arch-data-tags">
              <span className="tag-hidden">SUBMITTER ADDRESS: UNLINKED</span>
              <span className="tag-hidden">RAW COMMENTS: LOCAL WITNESS ONLY</span>
            </div>
          </div>

          <div className="arch-card">
            <div className="arch-step">02 / COMPACT CIRCUIT EXECUTION</div>
            <h3 className="arch-heading">Zero-Knowledge Assertion</h3>
            <p className="arch-body">
              The Compact smart contract verifies that the score satisfies mathematical constraints (1 ≤ rating ≤ 5) and generates a proof verifying the tally transition.
            </p>
            <div className="arch-code-box">
              <code>assert rating &gt;= 1 &amp;&amp; rating &lt;= 5;</code>
              <code>ratingSum += disclose(rating);</code>
              <code>totalResponses += 1;</code>
            </div>
          </div>

          <div className="arch-card">
            <div className="arch-step">03 / ON-CHAIN SETTLEMENT</div>
            <h3 className="arch-heading">Public Ledger State</h3>
            <p className="arch-body">
              The Midnight blockchain ledger updates only public aggregate counters. Observers and auditors can mathematically verify the result without ever knowing individual contributors.
            </p>
            <div className="arch-data-tags">
              <span className="tag-public">TOTAL RESPONSES: PUBLIC ON-CHAIN</span>
              <span className="tag-public">AVERAGE TALLY: PUBLIC ON-CHAIN</span>
            </div>
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
    </div>
  );
};
