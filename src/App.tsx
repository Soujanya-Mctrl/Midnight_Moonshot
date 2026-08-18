import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CampaignSelector, type Campaign } from './components/CampaignSelector';
import { CampaignDashboard } from './components/CampaignDashboard';
import type { FeedItem } from './components/LiveFeedStream';
import './App.css';

const ACTIVITY_STORAGE_KEY = 'midnight_whisper_activity_log';

// Preset campaign lookup for URL deep-linking
const PRESET_CAMPAIGN_MAP: Record<string, Campaign> = {
  '1am-wallet': { id: '1am-wallet', name: '1AM Midnight Wallet', description: 'Browser extension wallet for Midnight Network transactions and ZK proving.', emoji: '🌙' },
  'compact-dx': { id: 'compact-dx', name: 'Compact Language Toolchain', description: 'Smart contract language, compiler, and developer tooling for ZK circuits.', emoji: '⚡' },
  'proofstation': { id: 'proofstation', name: 'ProofStation Prover API', description: 'Cloud-hosted ZK proof generation service for dust-free transactions.', emoji: '🔐' },
  'midnight-indexer': { id: 'midnight-indexer', name: 'Midnight Indexer v4', description: 'GraphQL API for querying on-chain state, blocks, and contract actions.', emoji: '📡' },
  'midnight-explorer': { id: 'midnight-explorer', name: 'Midnight Block Explorer', description: 'Web interface for inspecting transactions, contracts, and network health.', emoji: '🔍' },
};

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
        const presetKey = projectParam.toLowerCase();
        if (PRESET_CAMPAIGN_MAP[presetKey]) {
          setActiveCampaign(PRESET_CAMPAIGN_MAP[presetKey]);
        } else {
          // Try custom campaigns from localStorage
          try {
            const saved = window.localStorage.getItem('midnight_custom_campaigns');
            const customs: Campaign[] = saved ? JSON.parse(saved) : [];
            const found = customs.find((c) => c.id === presetKey);
            if (found) {
              setActiveCampaign(found);
            } else {
              // Create a campaign from the URL param
              setActiveCampaign({
                id: presetKey,
                name: decodeURIComponent(projectParam),
                description: 'Campaign from shared feedback link',
                emoji: '🎯',
                isCustom: true,
              });
            }
          } catch {
            setActiveCampaign({
              id: presetKey,
              name: decodeURIComponent(projectParam),
              description: 'Campaign from shared feedback link',
              emoji: '🎯',
              isCustom: true,
            });
          }
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

  return (
    <div className="site-layout">
      {/* Top Navbar */}
      <Header campaignActive={!!activeCampaign} />

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
