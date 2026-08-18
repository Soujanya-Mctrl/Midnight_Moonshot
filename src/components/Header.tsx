import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';

interface HeaderProps {
  campaignActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ campaignActive }) => {
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
        <div className="brand-group">
          <div className="brand-icon">
            <span className="brand-dot glow-pulse" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">WHISPER FEEDBACK</h1>
            <span className="brand-badge">MIDNIGHT NETWORK</span>
          </div>
        </div>

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

          {isConnected && (
            <span className="header-network-badge">{network}</span>
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
