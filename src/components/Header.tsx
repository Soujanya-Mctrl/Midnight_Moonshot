import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';

export type PageId = 'submit' | 'analytics' | 'privacy' | 'explorer';

interface HeaderProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const {
    network,
    isConnected,
    address,
    contractAddress,
    availableWallets,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useMidnight();

  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'submit', label: 'Submit' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'privacy', label: 'Protocol' },
    { id: 'explorer', label: 'Activity' },
  ];

  return (
    <header className="protocol-header">
      <div className="header-inner container">
        {/* Brand */}
        <div className="brand-group">
          <div className="brand-icon">
            <span className="brand-dot glow-pulse" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">WHISPER FEEDBACK</h1>
            <span className="brand-badge">MIDNIGHT NETWORK</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link-btn ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
              {activePage === item.id && <span className="nav-active-bar" />}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="header-right-group">
          {contractAddress && (
            <a
              href={`https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-link-subtle"
            >
              Explorer ↗
            </a>
          )}

          {!isConnected ? (
            <div className="wallet-btn-wrapper">
              <button
                type="button"
                className="btn-wallet-connect"
                onClick={() => {
                  if (availableWallets.length <= 1) {
                    connectWallet();
                  } else {
                    setShowWalletDropdown((prev) => !prev);
                  }
                }}
                disabled={isConnecting}
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
              </button>

              {showWalletDropdown && availableWallets.length > 1 && (
                <div className="wallet-popover">
                  {availableWallets.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className="wallet-popover-item"
                      onClick={() => {
                        connectWallet(w.id);
                        setShowWalletDropdown(false);
                      }}
                    >
                      Connect {w.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn-wallet-connected"
              onClick={disconnectWallet}
              title="Click to disconnect"
            >
              <span className="pulse-green" />
              <span className="addr-short">
                {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Connected'}
              </span>
              <span className="disconnect-label">Disconnect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
