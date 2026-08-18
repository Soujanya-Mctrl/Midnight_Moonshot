import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isCustom?: boolean;
}

const PRESET_CAMPAIGNS: Campaign[] = [
  {
    id: '1am-wallet',
    name: '1AM Midnight Wallet',
    description: 'Browser extension wallet for Midnight Network transactions and ZK proving.',
    emoji: '🌙',
  },
  {
    id: 'compact-dx',
    name: 'Compact Language Toolchain',
    description: 'Smart contract language, compiler, and developer tooling for ZK circuits.',
    emoji: '⚡',
  },
  {
    id: 'proofstation',
    name: 'ProofStation Prover API',
    description: 'Cloud-hosted ZK proof generation service for dust-free transactions.',
    emoji: '🔐',
  },
  {
    id: 'midnight-indexer',
    name: 'Midnight Indexer v4',
    description: 'GraphQL API for querying on-chain state, blocks, and contract actions.',
    emoji: '📡',
  },
  {
    id: 'midnight-explorer',
    name: 'Midnight Block Explorer',
    description: 'Web interface for inspecting transactions, contracts, and network health.',
    emoji: '🔍',
  },
];

interface CampaignSelectorProps {
  onSelectCampaign: (campaign: Campaign) => void;
}

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({ onSelectCampaign }) => {
  const { isConnected, connectWallet, isConnecting } = useMidnight();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newCampaign: Campaign = {
      id: customName.trim().toLowerCase().replace(/\s+/g, '-'),
      name: customName.trim(),
      description: customDesc.trim() || 'Custom feedback campaign',
      emoji: '🎯',
      isCustom: true,
    };

    // Save to localStorage for persistence
    try {
      const saved = window.localStorage.getItem('midnight_custom_campaigns');
      const existing: Campaign[] = saved ? JSON.parse(saved) : [];
      if (!existing.find((c) => c.id === newCampaign.id)) {
        existing.push(newCampaign);
        window.localStorage.setItem('midnight_custom_campaigns', JSON.stringify(existing));
      }
    } catch { /* ignore */ }

    onSelectCampaign(newCampaign);
  };

  // Load saved custom campaigns from localStorage
  const savedCampaigns: Campaign[] = (() => {
    try {
      const saved = window.localStorage.getItem('midnight_custom_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
    return [];
  })();

  const allCampaigns = [...PRESET_CAMPAIGNS, ...savedCampaigns];

  return (
    <div className="campaign-selector-wrapper">
      {/* Hero */}
      <div className="protocol-hero">
        <div className="hero-eyebrow">MIDNIGHT NETWORK • ZERO-KNOWLEDGE FEEDBACK PROTOCOL</div>
        <h1 className="hero-headline">
          ANONYMOUS FEEDBACK<br />
          <span>FOR THE ECOSYSTEM.</span>
        </h1>
        <p className="hero-subtext">
          Select a campaign to submit verifiable, privacy-preserving feedback. Your identity stays completely hidden — only aggregate sentiment is recorded on-chain.
        </p>
      </div>

      {/* Wallet Gate */}
      {!isConnected && (
        <div className="campaign-wallet-gate">
          <div className="gate-icon">🔒</div>
          <h3 className="gate-title">CONNECT YOUR WALLET TO CONTINUE</h3>
          <p className="gate-desc">
            Link your 1AM Wallet or Lace extension to submit zero-knowledge feedback proofs to the Midnight Preview Network.
          </p>
          <button
            type="button"
            className="btn-protocol-primary"
            onClick={() => connectWallet()}
            disabled={isConnecting}
          >
            {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
          </button>
        </div>
      )}

      {/* Campaign Grid */}
      {isConnected && (
        <>
          <div className="campaign-section-label">
            <span className="section-tag">SELECT A CAMPAIGN</span>
            <span className="section-meta">{allCampaigns.length} AVAILABLE</span>
          </div>

          <div className="campaign-grid">
            {allCampaigns.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                className="campaign-card"
                onClick={() => onSelectCampaign(campaign)}
              >
                <div className="campaign-card-emoji">{campaign.emoji}</div>
                <div className="campaign-card-body">
                  <h3 className="campaign-card-name">{campaign.name}</h3>
                  <p className="campaign-card-desc">{campaign.description}</p>
                </div>
                <div className="campaign-card-arrow">→</div>
              </button>
            ))}

            {/* Create Custom Campaign Card */}
            <button
              type="button"
              className={`campaign-card campaign-card-custom ${showCustomForm ? 'expanded' : ''}`}
              onClick={() => !showCustomForm && setShowCustomForm(true)}
            >
              {!showCustomForm ? (
                <>
                  <div className="campaign-card-emoji">✨</div>
                  <div className="campaign-card-body">
                    <h3 className="campaign-card-name">Create Custom Campaign</h3>
                    <p className="campaign-card-desc">Set up feedback for your own dApp, product, or DAO proposal.</p>
                  </div>
                  <div className="campaign-card-arrow">+</div>
                </>
              ) : (
                <form onSubmit={handleCustomSubmit} className="custom-campaign-form" onClick={(e) => e.stopPropagation()}>
                  <div className="input-block">
                    <label className="input-label">CAMPAIGN NAME</label>
                    <input
                      type="text"
                      required
                      className="protocol-input"
                      placeholder="e.g. My DeFi Protocol"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="input-block">
                    <label className="input-label">DESCRIPTION (OPTIONAL)</label>
                    <input
                      type="text"
                      className="protocol-input"
                      placeholder="Brief description of what you're collecting feedback for..."
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                    />
                  </div>
                  <div className="custom-form-actions">
                    <button type="submit" className="btn-protocol-primary" disabled={!customName.trim()}>
                      START CAMPAIGN →
                    </button>
                    <button
                      type="button"
                      className="btn-protocol-secondary"
                      onClick={() => { setShowCustomForm(false); setCustomName(''); setCustomDesc(''); }}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
