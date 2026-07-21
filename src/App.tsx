import React, { useState } from 'react';
import { Terminal, Cpu, Database, Activity } from 'lucide-react';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import '../frontend/src/App.css';

interface TxRecord {
  hash: string;
  circuit: string;
  witness: string;
  block: number;
  dustFee: string;
  status: string;
  time: string;
}

export function App() {
  const [blockHeight, setBlockHeight] = useState<number>(184920);

  const [terminalLogs, setTerminalLogs] = useState<Array<{ time: string; tag: string; msg: string }>>([
    { time: '16:10:02', tag: '[SYS_INIT]', msg: 'COMPACT_RUNTIME v0.23 initialized' },
    { time: '16:10:05', tag: '[NETWORK]', msg: 'Connected to Midnight Preview Testnet' },
    { time: '16:10:11', tag: '[CONTRACT]', msg: 'Counter state resolved: count = 42' },
    { time: '16:10:14', tag: '[INDEXER]', msg: 'Syncing chain blocks at height #184920' },
  ]);

  const [onChainTxs, setOnChainTxs] = useState<TxRecord[]>([
    {
      hash: '0x32c9025a256d6785b91c5d7181df08a160dadad99f46352f43fb77a6d6da4c48',
      circuit: 'counter (genesis)',
      witness: 'Public Setup',
      block: 184915,
      dustFee: '0.00 DUST',
      status: 'VERIFIED',
      time: '12m ago',
    },
    {
      hash: '0x1b49cb68465b23457496a5a2a6e7fae484595216db93d81e0ccd43c161bae6de',
      circuit: 'incrementBy',
      witness: 'Disclosed Witness',
      block: 184919,
      dustFee: '0.15 DUST',
      status: 'VERIFIED',
      time: '3m ago',
    },
  ]);

  const handleCircuitExecuted = (txHash: string, newCount: number) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newHeight = blockHeight + 1;
    setBlockHeight(newHeight);

    setTerminalLogs((prev) => [
      ...prev,
      { time: timeStr, tag: '[CIRCUIT]', msg: `Disclosed secretWitness -> count = ${newCount}` },
      { time: timeStr, tag: '[PROOF_GEN]', msg: `ZK Prover generated proof in 1.2s [OK]` },
    ]);

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

        <nav className="hud-nav-items">
          <div className="nav-link active">
            <Terminal size={14} />
            [01] CONSOLE
          </div>
          <div className="nav-link">
            <Cpu size={14} />
            [02] CIRCUITS
          </div>
          <div className="nav-link">
            <Database size={14} />
            [03] LEDGER
          </div>
        </nav>

        <div className="hud-status-badge">
          <span className="status-dot"></span>
          PREVIEW_TESTNET [LIVE]
        </div>
      </header>

      {/* Master 2-Column Dashboard Layout */}
      <div className="master-layout">
        {/* Left Column: Circuit Controls & Asset Cards */}
        <CircuitCall onCircuitExecuted={handleCircuitExecuted} />

        {/* Right Column: Wallet Connection & System Event Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <WalletConnect />

          <div className="terminal-panel" style={{ flex: 1 }}>
            <div className="terminal-header">
              <div className="terminal-title">
                <Terminal size={14} />
                SYSTEM_EVENT_CONSOLE
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.7rem', color: '#94a3b8' }}>
                [{terminalLogs.length} EVENTS]
              </div>
            </div>

            <div className="terminal-feed">
              {terminalLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-tag">{log.tag}</span>
                  <span className="log-msg">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
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
      </div>
    </div>
  );
}

export default App;
