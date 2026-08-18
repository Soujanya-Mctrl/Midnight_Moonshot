import React from 'react';
import { useMidnight } from '../hooks/useMidnight';

export interface FeedItem {
  hash: string;
  rating: number;
  category: string;
  projectName?: string;
  commentPreview: string;
  timestamp: string;
}

interface LiveFeedStreamProps {
  items: FeedItem[];
  onGoToSubmit?: () => void;
  onClearActivity?: () => void;
}

export const LiveFeedStream: React.FC<LiveFeedStreamProps> = ({
  items,
  onGoToSubmit,
  onClearActivity,
}) => {
  const { contractAddress } = useMidnight();

  return (
    <div className="protocol-view-wrapper">
      <div className="protocol-hero">
        <div className="hero-eyebrow">TRANSACTION STREAM</div>
        <div className="hero-title-row">
          <h1 className="hero-headline">
            SESSION<br />
            <span>ACTIVITY.</span>
          </h1>
          {items.length > 0 && onClearActivity && (
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
        <p className="hero-subtext">
          Zero-knowledge feedback proofs submitted from your browser session across ecosystem projects.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="empty-protocol-state">
          <div className="empty-glyph">🛡️</div>
          <div className="empty-title">NO RECENT SUBMISSIONS IN THIS SESSION</div>
          <p className="empty-sub">
            Submissions verified with zero-knowledge proofs from your browser will be securely recorded here.
          </p>
          {onGoToSubmit && (
            <button
              type="button"
              className="btn-empty-submit"
              onClick={onGoToSubmit}
            >
              + SUBMIT ANONYMOUS PROOF
            </button>
          )}
        </div>
      ) : (
        <div className="activity-table">
          <div className="table-header-row">
            <span className="col-score">SCORE</span>
            <span className="col-proj">TARGET PROJECT</span>
            <span className="col-memo">CONFIDENTIAL MEMO</span>
            <span className="col-cat">CATEGORY</span>
            <span className="col-tx">PROOF HASH</span>
            <span className="col-action">EXPLORER</span>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="table-data-row">
              <span className="col-score score-badge">{item.rating} ★</span>
              <span className="col-proj proj-badge">{item.projectName || '1AM Midnight Wallet'}</span>
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
  );
};
