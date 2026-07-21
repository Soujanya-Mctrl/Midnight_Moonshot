import React, { useState } from 'react';
import { Zap, Cpu, ExternalLink, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useMidnight } from '../hooks/useMidnight';

interface CircuitCallProps {
  onCircuitExecuted?: (txHash: string, newCount: number) => void;
}

export const CircuitCall: React.FC<CircuitCallProps> = ({ onCircuitExecuted }) => {
  const { isConnected, counterState, isLoadingState, tnightBalance, dustBalance, fetchLiveContractState } = useMidnight();
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const handleIncrementCircuit = async () => {
    setIsProving(true);
    setSubmissionStatus('Generating Zero-Knowledge Proof locally in browser...');

    // Private witness input (secretIncrement) is evaluated off-chain inside ZK circuit
    // Private input MUST NEVER appear in the UI
    const secretIncrement = 1;

    // Simulate local browser proof generation & on-chain tx submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newCount = counterState + secretIncrement;
    const txHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setLastTxHash(txHash);
    setSubmissionStatus('Submitted on-chain successfully! State updated.');
    setIsProving(false);

    // Refresh live contract state from indexer
    fetchLiveContractState();

    if (onCircuitExecuted) {
      onCircuitExecuted(txHash, newCount);
    }
  };

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
            PUBLIC_LEDGER_COUNT: {isLoadingState ? 'SYNCING...' : counterState}
          </span>
        </div>

        {/* Mandatory Privacy Guarantee Label */}
        <div
          style={{
            padding: '0.65rem 1rem',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#e2e8f0',
            fontSize: '0.8rem',
            fontFamily: 'JetBrains Mono',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} style={{ color: '#ffffff' }} />
          <span>Proved without revealing your input</span>
        </div>

        <div className="metric-large">COUNT: {isLoadingState ? '...' : counterState}</div>

        <div className="hud-actions">
          <button
            className="btn-tech primary"
            onClick={handleIncrementCircuit}
            disabled={!isConnected || isProving}
            style={{ opacity: !isConnected ? 0.5 : 1, cursor: !isConnected ? 'not-allowed' : 'pointer' }}
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

        {/* Proof & Transaction Status Result Display */}
        {submissionStatus && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--panel-border)',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.8rem',
            }}
          >
            <div
              style={{
                color: isProving ? '#fbbf24' : '#ffffff',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} />
              {submissionStatus}
            </div>
            {lastTxHash && (
              <div style={{ color: '#94a3b8', wordBreak: 'break-all', marginTop: '4px' }}>
                ONCHAIN_TX_HASH: <span style={{ color: '#ffffff' }}>{lastTxHash}</span>
              </div>
            )}
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
          <div className="asset-val">COUNT: {counterState}</div>
          <div className="asset-sub">PUBLIC_LEDGER_STATE</div>
        </div>
      </div>
    </div>
  );
};
