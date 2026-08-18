import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import type { Campaign } from './CampaignSelector';
import type { FeedItem } from './LiveFeedStream';
import {
  ShieldIcon,
  CheckIcon,
  CopyIcon,
  CloseIcon,
  AlertCircleIcon,
  RefreshIcon,
  ExternalLinkIcon,
  ShareIcon,
  ArrowLeftIcon,
  CpuIcon,
} from './Icons';

const CATEGORIES = [
  { id: 'any', label: 'Any Topic' },
  { id: 'dx', label: 'Developer Experience' },
  { id: 'privacy', label: 'Privacy & Cryptography' },
  { id: 'ui', label: 'Interface & Usability' },
  { id: 'network', label: 'Network & Performance' },
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
    fetchLiveContractState,
  } = useMidnight();

  const [selectedCategory, setSelectedCategory] = useState<string>('any');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLinkId, setShareLinkId] = useState<string>('');
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [copiedBadgeMd, setCopiedBadgeMd] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrivacySpecs, setShowPrivacySpecs] = useState(false);

  const generateUniqueId = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const openShareModal = () => {
    setShareLinkId(generateUniqueId());
    setCopiedShareUrl(false);
    setCopiedBadgeMd(false);
    setShowShareModal(true);
  };

  const activeCategoryLabel =
    selectedCategory === 'custom'
      ? customCategoryName.trim() || 'Custom Topic'
      : CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Any Topic';

  // Format system target tag cleanly
  const formattedTargetTag = campaign.category
    .replace(/^TARGET\s*\/\/\s*/i, 'TARGET: ')
    .replace(/^TARGET\s*:\s*/i, 'TARGET: ');

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
    const sid = shareLinkId || generateUniqueId();
    return `${origin}/?project=${encodeURIComponent(campaign.id)}&topic=${encodeURIComponent(selectedCategory === 'custom' ? activeCategoryLabel : selectedCategory)}&sid=${sid}`;
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
    <div className="protocol-view-wrapper">
      {/* Unified Compact Campaign Header */}
      <div className="campaign-header-bar">
        <div className="campaign-header-left">
          <button type="button" className="btn-back-campaigns" onClick={onBack}>
            <ArrowLeftIcon size={13} />
            <span>CAMPAIGNS</span>
          </button>
          <div className="campaign-title-group">
            <h2 className="campaign-header-name">{campaign.name}</h2>
            <span className="directory-tag campaign-system-label">{formattedTargetTag}</span>
          </div>
        </div>

        <button type="button" className="btn-ask-feedback" onClick={openShareModal}>
          <ShareIcon size={13} />
          <span>SHARE FEEDBACK LINK</span>
          <ExternalLinkIcon size={11} />
        </button>
      </div>

      {/* Sub-header context note */}
      <div className="campaign-subtitle-bar">
        <span className="subtitle-text">
          Zero-knowledge feedback protocol. Ratings are verified off-chain; submitter identity remains 100% private.
        </span>
      </div>

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">SHARE FEEDBACK LINK</span>
              <button type="button" className="btn-modal-close" onClick={() => setShowShareModal(false)}>
                <CloseIcon size={14} />
              </button>
            </div>
            <p className="modal-description">
              Send this link to your users to collect zero-knowledge feedback (0 gas cost for submitters).
            </p>

            <div className="input-block">
              <label className="input-label">SHAREABLE FEEDBACK URL</label>
              <div className="share-url-row">
                <input type="text" readOnly className="share-url-input" value={generateShareUrl()} />
                <button type="button" className="btn-copy-url" onClick={copyShareLink}>
                  {copiedShareUrl ? (
                    <>
                      <CheckIcon size={12} />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={12} />
                      <span>COPY LINK</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">README MARKDOWN BADGE</label>
              <div className="share-url-row">
                <input type="text" readOnly className="share-url-input" value={getBadgeMarkdown()} />
                <button type="button" className="btn-copy-url" onClick={copyBadgeMarkdown}>
                  {copiedBadgeMd ? (
                    <>
                      <CheckIcon size={12} />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={12} />
                      <span>COPY BADGE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Interface */}
      <div className="spatial-grid" style={{ marginTop: '1.25rem' }}>
        {/* Left Column: Form Panel */}
        <div className="form-panel">
          <div className="panel-bar">
            <span className="panel-bar-title">FEEDBACK SUBMISSION</span>
            <span className="panel-bar-meta">0 GAS FEES</span>
          </div>

          <form onSubmit={handleSubmit} className="protocol-form">
            {/* Topic Selection */}
            <div className="input-block">
              <label className="input-label">SELECT TOPIC</label>
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
              {selectedCategory === 'custom' && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Custom topic..."
                    className="protocol-input"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Satisfaction Rating */}
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

            {/* Private Memo */}
            <div className="input-block">
              <div className="input-label-split">
                <label className="input-label">PRIVATE NOTE (OPTIONAL)</label>
                <span className="char-count-meta">{comment.length} / 280</span>
              </div>
              <textarea
                className="protocol-textarea"
                rows={3}
                maxLength={280}
                placeholder="Share your detailed feedback (processed strictly in local browser memory)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div className="protocol-alert-error">
                <div className="alert-content">
                  <AlertCircleIcon size={15} color="#ef4444" />
                  <span className="alert-text">{error}</span>
                </div>
                <button type="button" className="btn-dismiss-error" onClick={clearError} title="Dismiss">
                  <CloseIcon size={13} />
                </button>
              </div>
            )}

            {/* ZK Proving Progress */}
            {isCallingCircuit && (
              <div className="protocol-alert-proving-card">
                <div className="proving-spinner-row">
                  <div className="proving-spinner" />
                  <div className="proving-header">
                    <span className="proving-title">GENERATING ZERO-KNOWLEDGE PROOF</span>
                    <span className="proving-subtitle">{provingStep || 'Computing proof...'}</span>
                  </div>
                </div>
                <div className="proving-progress-bar">
                  <div className="proving-progress-fill" />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions-row">
              {isConnected ? (
                <button
                  type="submit"
                  className="btn-protocol-primary"
                  disabled={isCallingCircuit}
                >
                  {isCallingCircuit ? 'GENERATING PROOF...' : 'SUBMIT ANONYMOUS FEEDBACK'}
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
            </div>
          </form>

          {/* Confirmed Tx Banner */}
          {lastTxHash && (
            <div className="tx-verified-card">
              <div className="tx-verified-header">
                <span className="verified-glyph">
                  <CheckIcon size={14} color="#34d399" />
                </span>
                <span className="verified-title">FEEDBACK SUBMITTED ON-CHAIN</span>
              </div>
              <div className="tx-hash-row">
                <span className="tx-hash-val">{lastTxHash}</span>
                <button type="button" className="btn-copy-hash" onClick={copyHash}>
                  {copiedHash ? (
                    <>
                      <CheckIcon size={12} />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={12} />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Unified Results Panel */}
        <div className="protocol-sidebar">
          {/* Main Results Container Card */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldIcon size={14} color="var(--text-white)" />
                <span className="sidebar-title">LIVE CAMPAIGN RESULTS</span>
              </div>
              <button
                type="button"
                className={`btn-refresh-metrics ${isRefreshing || isLoadingState ? 'refreshing' : ''}`}
                onClick={handleRefresh}
                disabled={isRefreshing || isLoadingState}
                title="Refresh state"
              >
                <RefreshIcon size={12} className={isRefreshing || isLoadingState ? 'spin-icon' : ''} />
                <span>{isRefreshing || isLoadingState ? 'SYNCING...' : 'REFRESH'}</span>
              </button>
            </div>

            <div className="witness-table">
              <div className="witness-row">
                <span className="w-key">TOTAL RESPONSES</span>
                <span className="w-val w-active">{isLoadingState ? '...' : total}</span>
              </div>
              <div className="witness-row">
                <span className="w-key">AVERAGE RATING</span>
                <span className="w-val w-active">{isLoadingState ? '...' : `${avg.toFixed(1)} ★`}</span>
              </div>
              <div className="witness-row">
                <span className="w-key">POSITIVE SENTIMENT</span>
                <span className="w-val w-public">{isLoadingState ? '...' : `${positiveRate}% (${positiveCount}/${total})`}</span>
              </div>
              <div className="witness-row">
                <span className="w-key">NETWORK</span>
                <span className="w-val">{network.toUpperCase()}</span>
              </div>
              {isConnected && (
                <div className="witness-row">
                  <span className="w-key">YOUR BALANCE</span>
                  <span className="w-val">{tnightBalance} tNIGHT</span>
                </div>
              )}
            </div>

            {/* Quick Share Link Section */}
            <div className="sidebar-sub-section">
              <span className="sidebar-sub-title">SHAREABLE LINK</span>
              <div className="share-url-row">
                <input type="text" readOnly className="share-url-input" value={generateShareUrl()} />
                <button type="button" className="btn-copy-url" onClick={copyShareLink}>
                  {copiedShareUrl ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Collapsible Privacy Specs Section */}
            <div className="sidebar-sub-section">
              <div
                className="sidebar-accordion-header"
                onClick={() => setShowPrivacySpecs((prev) => !prev)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CpuIcon size={13} color="var(--text-muted)" />
                  <span className="sidebar-sub-title" style={{ margin: 0 }}>PROTOCOL PRIVACY SPECS</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {showPrivacySpecs ? '▲ HIDE' : '▼ SHOW'}
                </span>
              </div>

              {showPrivacySpecs && (
                <div className="witness-table view-fade-in" style={{ marginTop: '0.6rem' }}>
                  <div className="witness-row">
                    <span className="w-key">PROOF ENGINE</span>
                    <span className="w-val">COMPACT ZK-SNARK</span>
                  </div>
                  <div className="witness-row">
                    <span className="w-key">SUBMITTER WALLET</span>
                    <span className="w-val w-private">UNLINKED & PRIVATE</span>
                  </div>
                  <div className="witness-row">
                    <span className="w-key">DISCLOSURE</span>
                    <span className="w-val w-public">AGGREGATE TALLY</span>
                  </div>
                  {contractAddress && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={`https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="tx-explorer-link"
                      >
                        <span>Contract on Explorer</span>
                        <ExternalLinkIcon size={10} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      {campaignFeed.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: '2rem' }}>
          <div className="dashboard-section-header">
            <span className="dashboard-section-title">RECENT PROOFS LOG</span>
            <button
              type="button"
              className="btn-clear-activity"
              onClick={onClearActivity}
            >
              CLEAR LOG
            </button>
          </div>

          <div className="activity-table">
            <div className="table-header-row">
              <span className="col-score">SCORE</span>
              <span className="col-memo">NOTE</span>
              <span className="col-cat">TOPIC</span>
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
                      <span>INSPECT</span>
                      <ExternalLinkIcon size={11} />
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
