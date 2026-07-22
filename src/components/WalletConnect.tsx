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
            padding: '0.9rem 1.1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            fontFamily: 'JetBrains Mono',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            <span>{error}</span>
          </div>
          <XCircle size={16} style={{ cursor: 'pointer', minWidth: '16px', color: '#fca5a5' }} onClick={clearError} />
        </div>
      )}

      {/* Wallet Extension Missing Alert + Install Button */}
      {!isLaceInstalled && !isConnected && !error && (
        <div
          style={{
            padding: '0.9rem 1.1rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            color: '#fcd34d',
            fontSize: '0.78rem',
            fontFamily: 'JetBrains Mono',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: 600 }}>Lace Wallet extension not detected in browser.</span>
          </div>
          <a
            href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjbfnlhbdpkhbedigapahu"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
            }}
          >
            <ExternalLink size={14} />
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
