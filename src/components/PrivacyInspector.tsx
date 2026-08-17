import React from 'react';

export const PrivacyInspector: React.FC = () => {
  return (
    <div className="protocol-view-wrapper">
      <div className="protocol-hero">
        <div className="hero-eyebrow">COMPACT ARCHITECTURE</div>
        <h1 className="hero-headline">
          HOW IT WORKS:<br />
          <span>PROOF WITHOUT DISCLOSURE.</span>
        </h1>
        <p className="hero-subtext">
          Midnight Whisper proves correctness of feedback rating boundaries and aggregates on-chain while keeping identity completely hidden.
        </p>
      </div>

      <div className="architecture-grid">
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
            The Compact smart contract verifies that the score satisfies mathematical constraints (1 ≤ rating ≤ 5) and generates a proof verifying the tally transition without revealing who generated it.
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
    </div>
  );
};
