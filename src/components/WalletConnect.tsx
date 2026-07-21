import React from 'react';
import { Wallet, ShieldCheck, ChevronRight, LogOut, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { useMidnight } from '../hooks/useMidnight';

export const WalletConnect: React.FC = () => {
  const {
    isConnected,
    isLaceInstalled,
    address,
    network,
    error,
    isConnecting,
    connectWallet,
    disconnectWallet,
    clearError,
  } = useMidnight();

  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <span className="panel-label">
          <ShieldCheck size={14} />
          WALLET_CONNECTION_STATUS
        </span>
        <span className="hud-status-badge">
          <span className="status-dot" style={{ background: isConnected ? '#ffffff' : '#6b7280' }}></span>
          {isConnected ? `${network} [CONNECTED]` : 'DISCONNECTED'}
        </span>
      </div>

      {/* Error Alert Message */}
      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.8rem',
            fontFamily: 'JetBrains Mono',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
          <XCircle size={14} style={{ cursor: 'pointer', minWidth: '14px' }} onClick={clearError} />
        </div>
      )}

      {/* Wallet Extension Missing Alert + Install Button */}
      {!isLaceInstalled && !isConnected && !error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#fbbf24',
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={14} />
            <span>Lace Wallet extension not detected in browser.</span>
          </div>
          <a
            href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjbfnlhbdpkhbedigapahu"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#ffffff',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 'bold',
            }}
          >
            <ExternalLink size={12} />
            Install Lace Wallet Extension
          </a>
        </div>
      )}

      {/* Connected Address vs Disconnected Banner */}
      <div className="address-block" style={{ color: isConnected ? '#ffffff' : '#94a3b8' }}>
        {isConnected ? (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>CONNECTED LACE ADDRESS:</div>
            {address}
          </div>
        ) : (
          'DISCONNECTED // NO ACTIVE LACE SESSION'
        )}
      </div>

      {/* Connect / Disconnect Action Buttons */}
      <div className="hud-actions">
        {!isConnected ? (
          <button className="btn-tech primary" onClick={connectWallet} disabled={isConnecting}>
            <Wallet size={16} />
            {isConnecting ? 'CONNECTING TO LACE...' : 'CONNECT LACE WALLET'}
            <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn-tech" onClick={disconnectWallet}>
            <LogOut size={16} />
            DISCONNECT WALLET
          </button>
        )}
      </div>
    </div>
  );
};
