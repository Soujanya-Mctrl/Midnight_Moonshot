import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import {
  ShieldIcon,
  PlusIcon,
  ArrowRightIcon,
  CustomTargetIcon,
  TerminalIcon,
} from './Icons';

export interface Campaign {
  id: string;
  name: string;
  category: string;
  description: string;
  indexCode?: string;
  isCustom?: boolean;
}

interface CampaignSelectorProps {
  onSelectCampaign: (campaign: Campaign) => void;
}

const CATEGORY_OPTIONS = [
  'DEFI PROTOCOL',
  'WALLET // CLIENT',
  'SMART CONTRACTS',
  'INFRASTRUCTURE',
  'GOVERNANCE // DAO',
  'DEVELOPER TOOLING',
];

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({ onSelectCampaign }) => {
  const { isConnected, connectWallet, isConnecting, network } = useMidnight();
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('DEFI PROTOCOL');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');

  // Load user-created campaigns from localStorage
  const userCampaigns: Campaign[] = (() => {
    try {
      const saved = window.localStorage.getItem('midnight_custom_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
    return [];
  })();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenCat = category === 'CUSTOM'
      ? (customCategory.trim().toUpperCase() || 'GENERAL')
      : category;

    const newCampaign: Campaign = {
      id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name.trim(),
      category: `TARGET // ${chosenCat}`,
      description: description.trim() || 'Verifiable zero-knowledge feedback campaign.',
      indexCode: String(userCampaigns.length + 1).padStart(2, '0'),
      isCustom: true,
    };

    // Persist to localStorage
    try {
      const existing: Campaign[] = userCampaigns.filter((c) => c.id !== newCampaign.id);
      existing.unshift(newCampaign);
      window.localStorage.setItem('midnight_custom_campaigns', JSON.stringify(existing));
    } catch { /* ignore */ }

    setShowCreationForm(false);
    onSelectCampaign(newCampaign);
  };

  return (
    <div className="campaign-selector-wrapper">
      {/* Protocol Header */}
      <div className="protocol-hero" style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="hero-eyebrow">MIDNIGHT NETWORK • COMPACT ZK-SNARK</div>
        <h1 className="hero-headline" style={{ fontSize: '2.1rem', letterSpacing: '0.01em', fontWeight: 800, margin: '0.3rem 0 0.5rem 0', color: 'var(--text-white)' }}>
          ANONYMOUS FEEDBACK REGISTRY
        </h1>
        <p className="hero-subtext" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 auto', maxWidth: '540px', lineHeight: 1.5 }}>
          Deploy evaluation targets, generate zero-knowledge share links, and collect private ratings on-chain.
        </p>
      </div>

      {/* Wallet Gate */}
      {!isConnected ? (
        <div className="campaign-wallet-gate">
          <div className="gate-tag">AUTH REQUIRED</div>
          <h3 className="gate-title">CONNECT WALLET TO CONTINUE</h3>
          <p className="gate-desc">
            Link 1AM Wallet or Lace to interact with Midnight {network.toUpperCase()}.
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
      ) : showCreationForm ? (
        /* ═══ CAMPAIGN CREATION INTERFACE ═══ */
        <div className="creation-panel-wrapper view-fade-in">
          <form onSubmit={handleCreateSubmit} className="protocol-form form-panel">
            <div className="panel-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TerminalIcon size={15} color="var(--text-white)" />
                <span className="panel-bar-title">NEW CAMPAIGN TARGET</span>
              </div>
              <span className="panel-bar-meta">CIRCUIT: REGISTRY</span>
            </div>

            <div className="input-block">
              <label className="input-label">PROJECT NAME / TARGET IDENTIFIER</label>
              <input
                type="text"
                required
                className="protocol-input"
                placeholder="e.g. Midnight Swap DEX"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="input-block">
              <label className="input-label">TARGET CATEGORY</label>
              <div className="segmented-grid">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`segment-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  className={`segment-btn ${category === 'CUSTOM' ? 'active' : ''}`}
                  onClick={() => setCategory('CUSTOM')}
                >
                  + CUSTOM
                </button>
              </div>
              {category === 'CUSTOM' && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Custom category name..."
                    className="protocol-input"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="input-block">
              <label className="input-label">SCOPE / FOCUS AREA (OPTIONAL)</label>
              <input
                type="text"
                className="protocol-input"
                placeholder="Brief focus area or evaluation scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="custom-form-actions">
              <button type="submit" className="btn-protocol-primary" disabled={!name.trim()}>
                CREATE CAMPAIGN →
              </button>
              <button
                type="button"
                className="btn-protocol-secondary"
                onClick={() => { setShowCreationForm(false); setName(''); setDescription(''); }}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      ) : userCampaigns.length === 0 ? (
        /* ═══ CONCISE EMPTY STATE ═══ */
        <div className="empty-campaign-state-card">
          <div className="empty-state-badge">
            <ShieldIcon size={24} color="#38bdf8" />
          </div>
          <h2 className="empty-state-heading">NO CAMPAIGNS REGISTERED</h2>
          <p className="empty-state-description">
            Create a campaign to generate a dedicated feedback link and collect zero-knowledge ratings.
          </p>

          <div className="empty-state-badges">
            <span className="badge-tag">SPONSORED GAS (0 NIGHT)</span>
            <span className="badge-tag">PRIVATE WITNESS PROOFS</span>
            <span className="badge-tag">UNIQUE SHAREABLE SID</span>
          </div>

          <button
            type="button"
            className="btn-protocol-primary btn-create-first"
            onClick={() => setShowCreationForm(true)}
          >
            <PlusIcon size={15} />
            <span>CREATE YOUR FIRST CAMPAIGN</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      ) : (
        /* ═══ USER'S REGISTERED CAMPAIGNS ═══ */
        <>
          <div className="campaign-section-label">
            <span className="section-tag">CAMPAIGNS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="section-meta">{userCampaigns.length} ACTIVE</span>
              <button
                type="button"
                className="btn-add-target-compact"
                onClick={() => setShowCreationForm(true)}
              >
                <PlusIcon size={12} />
                <span>NEW</span>
              </button>
            </div>
          </div>

          <div className="campaign-grid">
            {userCampaigns.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                className="campaign-card campaign-card-active"
                onClick={() => onSelectCampaign(campaign)}
              >
                <div className="campaign-card-icon-box active-icon-box">
                  <ShieldIcon size={18} color="var(--text-white)" />
                </div>
                <div className="campaign-card-body">
                  <h3 className="campaign-card-name">{campaign.name}</h3>
                  <span className="directory-tag campaign-system-label">
                    {campaign.category.replace('TARGET // ', 'TARGET: ')}
                  </span>
                  <p className="campaign-card-desc">{campaign.description}</p>
                </div>
                <div className="campaign-card-arrow">
                  <ArrowRightIcon size={16} />
                </div>
              </button>
            ))}

            {/* Restrained Dashed Create Campaign Action Card */}
            <button
              type="button"
              className="campaign-card campaign-card-custom"
              onClick={() => setShowCreationForm(true)}
            >
              <div className="campaign-card-icon-box custom-icon-box">
                <PlusIcon size={16} color="var(--text-muted)" />
              </div>
              <div className="campaign-card-body">
                <h3 className="campaign-card-name custom-card-title">Create Campaign</h3>
                <span className="directory-tag campaign-system-label">
                  TARGET: ACTION
                </span>
                <p className="campaign-card-desc">Add a new evaluation target.</p>
              </div>
              <div className="campaign-card-arrow">
                <PlusIcon size={16} />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
