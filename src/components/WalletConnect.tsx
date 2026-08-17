import React, { useState } from 'react';
import { useMidnight } from '../hooks/useMidnight';

export const WalletConnect: React.FC = () => {
  const {
    isConnected,
    isLaceInstalled,
    address,
    network,
    error,
    isConnecting,
    availableWallets,
    connectWallet,
    disconnectWallet,
  } = useMidnight();

  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wallet-card">
      <div className="panel-header">
        <span className="panel-title-tag">WALLET SESSION</span>
        <span className={`panel-chip ${isConnected ? '' : 'disconnected'}`}>
          {isConnected ? `${network} CONNECTED` : 'DISCONNECTED'}
        </span>
      </div>

      {/* Error Alert Message */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Missing Wallet Extension */}
      {!isLaceInstalled && !isConnected && !error && (
        <div className="wallet-missing-banner">
          <div className="missing-title">No Midnight Wallet Detected</div>
          <p className="missing-text">
            Install 1 AM Wallet or Lace (set to Preview Testnet) to interact with the contract.
          </p>
          <a
            href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjbfnlhbdpkhbedigapahu"
            target="_blank"
            rel="noreferrer"
            className="btn-install-wallet"
          >
            Get Extension
          </a>
        </div>
      )}

      {/* Connected Address Card */}
      <div className="address-display-box">
        <div className="address-box-header">
          <span className="address-box-label">UNSHIELDED ACCOUNT</span>
          {isConnected && address && (
            <button type="button" className="btn-copy-mini" onClick={copyAddress}>
              {copied ? 'COPIED' : 'COPY'}
            </button>
          )}
        </div>
        <div className="address-box-value">
          {isConnected && address ? address : 'No active wallet session'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="wallet-action-buttons">
        {!isConnected ? (
          availableWallets.length > 1 ? (
            availableWallets.map((w) => (
              <button
                key={w.id}
                type="button"
                className="btn-connect-wallet"
                onClick={() => connectWallet(w.id)}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : `Connect ${w.name}`}
              </button>
            ))
          ) : (
            <button
              type="button"
              className="btn-connect-wallet"
              onClick={() => connectWallet()}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )
        ) : (
          <button type="button" className="btn-disconnect" onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        )}
      </div>
    </div>
  );
};
