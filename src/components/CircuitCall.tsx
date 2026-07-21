import React, { useState } from 'react';
import { Zap, Cpu, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useMidnight } from '../hooks/useMidnight';

interface CircuitCallProps {
  onCircuitExecuted?: (txHash: string, newCount: number) => void;
}

export const CircuitCall: React.FC<CircuitCallProps> = ({ onCircuitExecuted }) => {
  const { isConnected } = useMidnight();
  const [counterValue, setCounterValue] = useState<number>(42);
  const [dustBalance, setDustBalance] = useState<number>(120.50);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [isProving, setIsProving] = useState<boolean>(false);

  const handleIncrementCircuit = async () => {
    setIsProving(true);
    // Simulate ZK circuit proof generation and execution
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newCount = counterValue + 1;
    const txHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setCounterValue(newCount);
    setDustBalance((prev) => Math.max(0, prev - 0.15));
    setLastTxHash(txHash);
    setIsProving(false);

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
            CIRCUIT_EXECUTION :: COUNTER.COMPACT
          </span>
          <span className="panel-label">
            <CheckCircle2 size={14} />
            PUBLIC_LEDGER_COUNT: {counterValue}
          </span>
        </div>

        <div className="metric-large">COUNT: {counterValue}</div>

        <div className="hud-actions">
          <button
            className="btn-tech primary"
            onClick={handleIncrementCircuit}
            disabled={!isConnected || isProving}
            style={{ opacity: !isConnected ? 0.5 : 1, cursor: !isConnected ? 'not-allowed' : 'pointer' }}
          >
            <Zap size={16} />
            {isProving ? 'GENERATING ZK PROOF...' : 'EXECUTE ZK INCREMENT CIRCUIT'}
          </button>
          <button
            className="btn-tech"
            onClick={() => window.open('https://midnight-tmnight-preview.nethermind.dev', '_blank')}
          >
            <ExternalLink size={16} />
            TESTNET FAUCET
          </button>
        </div>

        {lastTxHash && (
          <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>
            LAST_TX_HASH: <span style={{ color: '#ffffff' }}>{lastTxHash}</span>
          </div>
        )}
      </div>

      {/* Asset Cards Row */}
      <div className="asset-grid-tech">
        <div className="asset-box-tech">
          <div className="asset-tag">ASSET_01 :: TNIGHT_NATIVE</div>
          <div className="asset-val">250.00 TNIGHT</div>
          <div className="asset-sub">STATE: UNSHIELDED // RATE: $4.25</div>
        </div>

        <div className="asset-box-tech">
          <div className="asset-tag">ASSET_02 :: DUST_ZK_FEE</div>
          <div className="asset-val">{dustBalance.toFixed(2)} DUST</div>
          <div className="asset-sub">PROOF_RESOURCE_BALANCE</div>
        </div>

        <div className="asset-box-tech">
          <div className="asset-tag">CONTRACT :: COUNTER.COMPACT</div>
          <div className="asset-val">COUNT: {counterValue}</div>
          <div className="asset-sub">PUBLIC_LEDGER_STATE</div>
        </div>
      </div>
    </div>
  );
};
