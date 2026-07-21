import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Wallet, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Coins, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Terminal,
  Database,
  Lock,
  Unlock,
  CheckCircle2
} from 'lucide-react';
import './App.css';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<any>;
        name: string;
      };
    };
  }
}

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
  const [isConnected, setIsConnected] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [address, setAddress] = useState<string>('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
  const [tNightBalance, setTNightBalance] = useState<number>(250.00);
  const [dustBalance, setDustBalance] = useState<number>(120.50);
  const [counterValue, setCounterValue] = useState<number>(42);
  const [blockHeight, setBlockHeight] = useState<number>(184920);
  const [isLaceInstalled, setIsLaceInstalled] = useState<boolean>(false);

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

  useEffect(() => {
    if (window.midnight?.mnLace) {
      setIsLaceInstalled(true);
    }
  }, []);

  const connectWallet = async () => {
    if (window.midnight?.mnLace) {
      try {
        const walletAPI = await window.midnight.mnLace.enable();
        setIsConnected(true);
        addLog('[WALLET]', `Connected to Lace Wallet (${address.substring(0, 10)}...)`);
      } catch (err) {
        console.error('Wallet connection rejected:', err);
      }
    } else {
      setIsConnected(true);
      addLog('[WALLET]', `Connected via Demo Provider (${address.substring(0, 14)}...)`);
    }
  };

  const addLog = (tag: string, msg: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTerminalLogs((prev) => [...prev, { time: timeStr, tag, msg }]);
  };

  const handleIncrement = () => {
    const newCount = counterValue + 1;
    const newHeight = blockHeight + 1;
    const newTxHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setCounterValue(newCount);
    setBlockHeight(newHeight);
    setDustBalance((prev) => Math.max(0, prev - 0.15));

    addLog('[CIRCUIT]', `Disclosed secretWitness -> count = ${newCount}`);
    addLog('[PROOF_GEN]', `ZK Prover generated proof in 1.2s [OK]`);

    setOnChainTxs((prev) => [
      {
        hash: newTxHash,
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
        {/* Left Column: Hero Balance & Asset Cards */}
        <div className="left-column">
          {/* Portfolio Hero Card */}
          <div className="tech-panel">
            <div className="tech-panel-header">
              <span className="panel-label">
                <ShieldCheck size={14} />
                PORTFOLIO_TOTAL_UNSHIELDED
              </span>
              <span className="privacy-eye-btn" onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>

            <div className="metric-large">
              {showBalance ? (isConnected ? '$ 1,432.50 USD' : '$ 0.00 USD') : '••••••••••••'}
            </div>

            <div className="hud-actions">
              {!isConnected ? (
                <button className="btn-tech primary" onClick={connectWallet}>
                  <Wallet size={16} />
                  {isLaceInstalled ? 'CONNECT LACE WALLET' : 'CONNECT LACE WALLET (DEMO)'}
                  <ChevronRight size={16} />
                </button>
              ) : (
                <>
                  <button className="btn-tech primary" onClick={handleIncrement}>
                    <Zap size={16} />
                    EXECUTE ZK INCREMENT
                  </button>
                  <button className="btn-tech" onClick={() => window.open('https://midnight-tmnight-preview.nethermind.dev', '_blank')}>
                    <ExternalLink size={16} />
                    TESTNET FAUCET
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 3-Column Asset Section Grid */}
          <div className="asset-grid-tech">
            {/* tNIGHT Box */}
            <div className="asset-box-tech">
              <div className="asset-tag">
                <Coins size={14} />
                ASSET_01 :: TNIGHT_NATIVE
              </div>
              <div className="asset-val">
                {showBalance ? (isConnected ? `${tNightBalance.toFixed(2)} TNIGHT` : '0.00') : '••••'}
              </div>
              <div className="asset-sub">STATE: UNSHIELDED // RATE: $4.25</div>
            </div>

            {/* DUST Box */}
            <div className="asset-box-tech">
              <div className="asset-tag">
                <Zap size={14} />
                ASSET_02 :: DUST_ZK_FEE
              </div>
              <div className="asset-val">
                {showBalance ? (isConnected ? `${dustBalance.toFixed(2)} DUST` : '0.00') : '••••'}
              </div>
              <div className="asset-sub">PROOF_RESOURCE_BALANCE</div>
            </div>

            {/* Counter Contract Box */}
            <div className="asset-box-tech">
              <div className="asset-tag">
                <Cpu size={14} />
                CONTRACT :: COUNTER.COMPACT
              </div>
              <div className="asset-val">COUNT: {counterValue}</div>
              <div className="asset-sub">PUBLIC_LEDGER_STATE</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dedicated Real-Time Terminal Console Panel */}
        <div className="terminal-panel">
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

      {/* Bottom Section: Full-Width On-Chain Transaction & ZK Proof Explorer */}
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
                  <span className="witness-badge">
                    <Unlock size={12} />
                    {tx.witness}
                  </span>
                </td>
                <td className="mono-val">#{tx.block}</td>
                <td className="mono-val">{tx.dustFee}</td>
                <td>
                  <span className="status-badge-ok">
                    <CheckCircle2 size={12} />
                    {tx.status}
                  </span>
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
