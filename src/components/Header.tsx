import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import { LayersIcon, ExternalLinkIcon } from './Icons';

interface HeaderProps {
  onHomeClick?: () => void;
  onHowItWorksClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHomeClick, onHowItWorksClick }) => {
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

  return (
    <header className="protocol-header">
      <div className="header-inner container">
        {/* Brand */}
        <div className="brand-group" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <LayersIcon size={20} color="#ffffff" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">MIDNIGHT WHISPER</h1>
            <span className="brand-badge">ZK FEEDBACK PROTOCOL</span>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="header-nav">
          <button type="button" className="nav-link-btn" onClick={onHomeClick}>
            CAMPAIGNS
          </button>
          <button type="button" className="nav-link-btn" onClick={onHowItWorksClick}>
            HOW IT WORKS
          </button>
          {contractAddress && (
            <a
              href={`https://explorer.preview.midnight.network/contracts/stream/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="nav-link-btn nav-link-external"
            >
              <span>EXPLORER</span>
              <ExternalLinkIcon size={11} />
            </a>
          )}
        </nav>

        {/* Right Actions: Network & Wallet */}
        <div className="header-right-group">
          {isConnected && (
            <span className="header-network-badge">{network.toUpperCase()}</span>
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
