import React from 'react';
import { Wallet, ShieldCheck, ChevronRight, LogOut } from 'lucide-react';
import { useMidnight } from '../hooks/useMidnight';

export const WalletConnect: React.FC = () => {
  const { isConnected, isLaceInstalled, address, network, connectWallet, disconnectWallet } = useMidnight();

  return (
    <div className="tech-panel">
      <div className="tech-panel-header">
        <span className="panel-label">
          <ShieldCheck size={14} />
          WALLET_CONNECTION_STATUS
        </span>
        <span className="hud-status-badge">
          <span className="status-dot"></span>
          {network}
        </span>
      </div>

      <div className="address-block">
        {isConnected ? address : 'DISCONNECTED // NO_ACTIVE_LACE_SESSION'}
      </div>

      <div className="hud-actions">
        {!isConnected ? (
          <button className="btn-tech primary" onClick={connectWallet}>
            <Wallet size={16} />
            {isLaceInstalled ? 'CONNECT LACE WALLET' : 'CONNECT LACE WALLET (DEMO)'}
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
