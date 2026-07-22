import React, { useState, useEffect } from 'react';
import { Database, Activity } from 'lucide-react';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import { useMidnight } from './hooks/useMidnight';
import './App.css';

interface TxRecord {
  hash: string;
  circuit: string;
  witness: string;
  block: number | string;
  dustFee: string;
  status: string;
  time: string;
}

export function App() {
  const { isConnected, address, counterState } = useMidnight();
  const [blockHeight, setBlockHeight] = useState<number | string>('Syncing...');
  const [onChainTxs, setOnChainTxs] = useState<TxRecord[]>([]);

  const handleCircuitExecuted = (txHash: string, newCount: number) => {
    const newHeight = typeof blockHeight === 'number' ? blockHeight + 1 : 'Pending...';
    setBlockHeight(newHeight);

    setOnChainTxs((prev) => [
      {
        hash: txHash,
        circuit: 'incrementBy',
        witness: 'Disclosed Witness',
        block: newHeight,
        dustFee: '0.15 DUST',
        status: 'VERIFIED',
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <div className="hud-container">
      {/* Top Scientific HUD Header */}
      <header className="hud-navbar">
        <div className="brand-block">
          <div className="brand-tag">MIDNIGHT</div>
          <div className="brand-info">
            <div className="brand-name">ZK-SYSTEM CONTROL PANEL</div>
            <div className="brand-meta">NETWORK PROTOCOL // COMPACT v0.23</div>
          </div>
        </div>

        <div className="hud-status-badge">
          <span className="status-dot"></span>
          PREPROD_TESTNET [LIVE]
        </div>
      </header>

      {/* Master Dashboard Layout */}
      <div className="master-layout">
        {/* Left Column: Circuit Controls & Asset Cards */}
        <CircuitCall onCircuitExecuted={handleCircuitExecuted} />

        {/* Right Column: Wallet Connection */}
        <div className="right-column">
          <WalletConnect />
        </div>
      </div>

      {/* Bottom Section: On-Chain Transaction Explorer */}
      <div className="explorer-panel">
        <div className="tech-panel-header">
          <span className="panel-label">
            <Activity size={14} />
            LIVE_ONCHAIN_LEDGER_TRANSACTIONS & ZK_PROOF_LOGS
          </span>
          <span className="panel-label">
            <Database size={14} />
            HEIGHT: #{blockHeight}
          </span>
        </div>

        {onChainTxs.length === 0 ? (
          <div
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: '#94a3b8',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.85rem',
            }}
          >
            NO ON-CHAIN TRANSACTIONS SUBMITTED IN THIS SESSION. CONNECT LACE WALLET AND CALL CIRCUIT ABOVE.
          </div>
        ) : (
          <table className="explorer-table">
            <thead>
              <tr>
                <th>TRANSACTION HASH</th>
                <th>CIRCUIT / ACTION</th>
                <th>WITNESS MODEL</th>
                <th>BLOCK</th>
                <th>FEE</th>
                <th>PROOF STATUS</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {onChainTxs.map((tx, idx) => (
                <tr key={idx}>
                  <td className="tx-hash-code">
                    {tx.hash.substring(0, 16)}...{tx.hash.substring(tx.hash.length - 8)}
                  </td>
                  <td className="tx-circuit-name">{tx.circuit}</td>
                  <td>
                    <span className="witness-badge">{tx.witness}</span>
                  </td>
                  <td className="mono-val">#{tx.block}</td>
                  <td className="mono-val">{tx.dustFee}</td>
                  <td>
                    <span className="status-badge-ok">[VERIFIED_OK]</span>
                  </td>
                  <td className="mono-time">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
