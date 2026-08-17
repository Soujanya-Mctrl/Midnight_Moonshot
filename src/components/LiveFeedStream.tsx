import React from 'react';
import { useMidnight } from '../hooks/useMidnight';

export interface FeedItem {
  hash: string;
  rating: number;
  category: string;
  commentPreview: string;
  timestamp: string;
}

interface LiveFeedStreamProps {
  items: FeedItem[];
}

export const LiveFeedStream: React.FC<LiveFeedStreamProps> = ({ items }) => {
  const { contractAddress } = useMidnight();

  return (
    <div className="protocol-view-wrapper">
      <div className="protocol-hero">
        <div className="hero-eyebrow">TRANSACTION STREAM</div>
        <h1 className="hero-headline">
          SESSION<br />
          <span>ACTIVITY.</span>
        </h1>
        <p className="hero-subtext">
          Zero-knowledge feedback proofs submitted in this browser session.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="empty-protocol-state">
          <div className="empty-title">NO RECENT SUBMISSIONS</div>
          <p className="empty-sub">
            Submissions verified in your active session will be logged here.
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
          {items.map((item, idx) => (
            <div key={idx} className="table-data-row">
              <span className="col-score score-badge">{item.rating} ★</span>
              <span className="col-memo memo-text">"{item.commentPreview}"</span>
              <span className="col-cat cat-tag">{item.category}</span>
              <span className="col-tx tx-code">{item.hash.substring(0, 10)}...{item.hash.substring(item.hash.length - 6)}</span>
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
