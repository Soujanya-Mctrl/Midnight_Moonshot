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
    isDeploying,
    deployContract,
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
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-lockup" onClick={() => setActivePage('submit')}>
          <div className="brand-symbol">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-text">MIDNIGHT WHISPER</span>
          <span className="network-pill">{network}</span>
        </div>

        {/* Flat Text Nav */}
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
          {isConnected && (
            <button
              type="button"
              className="btn-header-deploy"
              onClick={() => deployContract()}
              disabled={isDeploying}
              title="Deploy a new instance of the FeedbackContract via connected wallet"
            >
              {isDeploying ? 'DEPLOYING...' : 'DEPLOY CONTRACT'}
            </button>
          )}

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
