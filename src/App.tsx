import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CampaignSelector, type Campaign } from './components/CampaignSelector';
import { CampaignDashboard } from './components/CampaignDashboard';
import type { FeedItem } from './components/LiveFeedStream';
import './App.css';

const ACTIVITY_STORAGE_KEY = 'midnight_whisper_activity_log';

export function App() {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore storage parse errors
      }
    }
    return [];
  });

  // Check URL params for deep-linking into a campaign
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const projectParam = params.get('project');

      if (projectParam) {
        const key = projectParam.toLowerCase();
        // Try user-created campaigns from localStorage
        try {
          const saved = window.localStorage.getItem('midnight_custom_campaigns');
          const customs: Campaign[] = saved ? JSON.parse(saved) : [];
          const found = customs.find((c) => c.id === key);
          if (found) {
            setActiveCampaign(found);
          } else {
            // Dynamic campaign reconstructed from URL parameter
            setActiveCampaign({
              id: key,
              name: decodeURIComponent(projectParam),
              category: 'TARGET // FEEDBACK',
              description: 'Zero-knowledge feedback campaign from shared verification link.',
              indexCode: '01',
              isCustom: true,
            });
          }
        } catch {
          setActiveCampaign({
            id: key,
            name: decodeURIComponent(projectParam),
            category: 'TARGET // FEEDBACK',
            description: 'Zero-knowledge feedback campaign from shared verification link.',
            indexCode: '01',
            isCustom: true,
          });
        }
      }
    }
  }, []);

  const handleFeedbackSubmitted = (record: FeedItem) => {
    setFeedItems((prev) => {
      const updated = [record, ...prev];
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const handleClearActivity = () => {
    setFeedItems([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setActiveCampaign(campaign);
    // Update URL without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('project', campaign.id);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleBackToCampaigns = () => {
    setActiveCampaign(null);
    // Clean URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('project');
      url.searchParams.delete('topic');
      window.history.pushState({}, '', url.pathname);
    }
  };

  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const toggleHowItWorks = () => {
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowHowItWorks((prev) => !prev);
    }
  };

  return (
    <div className="site-layout">
      {/* Top Navbar */}
      <Header
        onHomeClick={handleBackToCampaigns}
        onHowItWorksClick={toggleHowItWorks}
      />

      {/* Main Content */}
      <main className="main-content-centered">
        <div className="page-container">
          {!activeCampaign ? (
            <div className="view-fade-in">
              <CampaignSelector onSelectCampaign={handleSelectCampaign} />
            </div>
          ) : (
            <div className="view-fade-in">
              <CampaignDashboard
                campaign={activeCampaign}
                onBack={handleBackToCampaigns}
                feedItems={feedItems}
                onFeedbackSubmitted={handleFeedbackSubmitted}
                onClearActivity={handleClearActivity}
              />
            </div>
          )}
        </div>
      </main>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="modal-backdrop" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">HOW IT WORKS // PROTOCOL ARCHITECTURE</span>
              <button type="button" className="btn-modal-close" onClick={() => setShowHowItWorks(false)}>
                ✕
              </button>
            </div>
            <div className="how-it-works-steps-grid">
              <div className="how-step-card">
                <span className="how-step-num">01 // TARGET REGISTRATION</span>
                <h4 className="how-step-title">Create Evaluation Target</h4>
                <p className="how-step-desc">
                  Deploy a campaign for your dApp, wallet, or smart contract. Each target receives a cryptographically unique identifier.
                </p>
              </div>

              <div className="how-step-card">
                <span className="how-step-num">02 // ZK SHARE LINK</span>
                <h4 className="how-step-title">Distribute 0-Gas Link</h4>
                <p className="how-step-desc">
                  Generate a shareable feedback URL containing an 8-character random session ID (`sid`). Submitters incur zero gas costs.
                </p>
              </div>

              <div className="how-step-card">
                <span className="how-step-num">03 // BROWSER WITNESS PROOF</span>
                <h4 className="how-step-title">Compute Off-Chain ZK Proof</h4>
                <p className="how-step-desc">
                  Users select a rating and note. The Compact ZK-SNARK circuit evaluates the proof in local browser memory. Wallet addresses are never published.
                </p>
              </div>

              <div className="how-step-card">
                <span className="how-step-num">04 // VERIFIABLE AGGREGATES</span>
                <h4 className="how-step-title">On-Chain State Commit</h4>
                <p className="how-step-desc">
                  The Midnight ledger verifies the proof transcript, updating public aggregate metrics while preserving 100% individual privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-copy">Midnight Whisper • Zero-Knowledge Anonymous Feedback Protocol</span>
          <div className="footer-links">
            <a href="https://midnight.network" target="_blank" rel="noreferrer" className="footer-link">Midnight Network</a>
            <a href="https://docs.midnight.network" target="_blank" rel="noreferrer" className="footer-link">Documentation</a>
            <a href="https://explorer.preview.midnight.network" target="_blank" rel="noreferrer" className="footer-link">Explorer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
