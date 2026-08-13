import React from 'react';
import { Zap, Cpu, ExternalLink, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useMidnight } from '../hooks/useMidnight';

interface CircuitCallProps {
  onCircuitExecuted?: (txHash: string, newCount: number) => void;
}

export const CircuitCall: React.FC<CircuitCallProps> = ({ onCircuitExecuted }) => {
  const {
    isConnected,
    counterState,
    isLoadingState,
    tnightBalance,
    dustBalance,
    fetchLiveContractState,
    contractAddress,
    isCallingCircuit,
    lastTxHash,
    error,
    callIncrementCircuit,
  } = useMidnight();

  const handleIncrementCircuit = async () => {
    const txHash = await callIncrementCircuit();
    if (txHash && onCircuitExecuted) {
      onCircuitExecuted(txHash, (counterState ?? 0) + 1);
    }
  };

  const displayCount = counterState !== null ? counterState : '—';
  const isProving = isCallingCircuit;

  return (
    <div className="left-column">
      {/* Circuit Execution Hero Card */}
      <div className="tech-panel">
        <div className="tech-panel-header">
          <span className="panel-label">
            <Cpu size={14} />
            CIRCUIT_EXECUTION :: COUNTER.COMPACT (incrementBy)
          </span>
          <span className="panel-label">
            <CheckCircle2 size={14} />
            PUBLIC_LEDGER_COUNT: {isLoadingState ? 'SYNCING...' : displayCount}
          </span>
        </div>

        {/* Privacy Guarantee Label */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            color: '#e5e5e5',
            fontSize: '0.82rem',
            fontFamily: 'JetBrains Mono',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <ShieldCheck size={18} style={{ color: '#ffffff' }} />
          <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
            Real wallet proof flow active :: Zero-Knowledge Increments
          </span>
        </div>

        <div className="metric-large">COUNT: {isLoadingState ? '...' : displayCount}</div>

        <div className="hud-actions">
          <button
            className="btn-tech primary"
            onClick={handleIncrementCircuit}
            disabled={!isConnected || isProving}
          >
            {isProving ? <Loader2 size={16} className="spin-icon" /> : <Zap size={16} />}
            {isProving ? 'GENERATING ZK PROOF...' : 'CALL INCREMENT CIRCUIT'}
          </button>
          <button
            className="btn-tech"
            onClick={() => window.open('https://midnight-tmnight-preview.nethermind.dev', '_blank')}
          >
            <ExternalLink size={16} />
            TESTNET FAUCET
          </button>
        </div>

        {/* Contract Address Display */}
        {contractAddress && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.25rem',
              background: 'rgba(20, 20, 20, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ color: '#a3a3a3', marginBottom: '4px' }}>CONTRACT_ADDRESS:</div>
            <div style={{ color: '#ffffff', fontWeight: 600, wordBreak: 'break-all' }}>
              {contractAddress}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.25rem',
              background: 'rgba(255, 50, 50, 0.1)',
              border: '1px solid rgba(255, 50, 50, 0.3)',
              borderRadius: '10px',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.78rem',
              color: '#ff6b6b',
              wordBreak: 'break-all',
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Transaction Status */}
        {lastTxHash && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem 1.25rem',
              background: 'rgba(20, 20, 20, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '10px',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.82rem',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div
              style={{
                color: '#ffffff',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} />
              On-chain transaction confirmed!
            </div>
            <div style={{ color: '#a3a3a3', wordBreak: 'break-all', marginTop: '6px', fontSize: '0.78rem' }}>
              ONCHAIN_TX_HASH: <span style={{ color: '#ffffff', fontWeight: 600 }}>{lastTxHash}</span>
            </div>
          </div>
        )}
      </div>

      {/* Asset Cards Row */}
      <div className="asset-grid-tech">
        <div className="asset-box-tech">
          <div className="asset-tag">ASSET_01 :: TNIGHT_NATIVE</div>
          <div className="asset-val">{isConnected ? `${tnightBalance} TNIGHT` : '0.00 TNIGHT'}</div>
          <div className="asset-sub">STATE: {isConnected ? 'UNSHIELDED' : 'NOT CONNECTED'}</div>
        </div>

        <div className="asset-box-tech">
          <div className="asset-tag">ASSET_02 :: DUST_ZK_FEE</div>
          <div className="asset-val">{isConnected ? `${dustBalance} DUST` : '0.00 DUST'}</div>
          <div className="asset-sub">PROOF_RESOURCE_BALANCE</div>
        </div>

        <div className="asset-box-tech">
          <div className="asset-tag">CONTRACT :: COUNTER.COMPACT</div>
          <div className="asset-val">COUNT: {displayCount}</div>
          <div className="asset-sub">ON-CHAIN LEDGER STATE</div>
        </div>
      </div>
    </div>
  );
};
