import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createUnprovenCallTx, createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import type { ConnectedSession, FeedbackLedgerData, WalletProviderEntry } from '../lib/midnight';
import {
  FEEDBACK_CIRCUIT_ID,
  connectInjectedWallet,
  createFeedbackCompiledContract,
  createFeedbackPublicDataProvider,
  createConnectedSession,
  detectInjectedWalletProviders,
  deployFeedbackContract,
  submitFeedbackTx,
  formatNetworkLabel,
  getFeedbackLedgerState,
  waitForFeedbackLedgerState,
  waitForTransactionIndexing,
} from '../lib/midnight';

export interface WalletProviderInfo {
  id: string;
  name: string;
  icon?: string;
  provider: WalletProviderEntry['provider'];
}

export interface MidnightHookState {
  isConnected: boolean;
  isLaceInstalled: boolean;
  address: string | null;
  network: string;
  error: string | null;
  isConnecting: boolean;
  feedbackState: FeedbackLedgerData | null;
  isLoadingState: boolean;
  tnightBalance: string;
  dustBalance: string;
  availableWallets: WalletProviderInfo[];
  selectedWalletId: string | null;
  contractAddress: string | null;
  session: ConnectedSession | null;
  isDeploying: boolean;
  isCallingCircuit: boolean;
  provingStep: string | null;
  lastTxHash: string | null;
  connectWallet: (walletId?: string) => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
  resetContractAddress: () => void;
  fetchLiveContractState: () => Promise<void>;
  deployContract: () => Promise<string | null>;
  submitAnonymousFeedback: (rating: number, comment?: string) => Promise<string | null>;
  connectedAPI: any;
}

const LOCAL_STORAGE_KEY = 'midnight_feedback_contract_address_v4';
const LEGACY_STORAGE_KEY = 'midnight_feedback_contract_address';
const LEGACY_STORAGE_KEY_V2 = 'midnight_feedback_contract_address_v2';
const LEGACY_STORAGE_KEY_V3 = 'midnight_feedback_contract_address_v3';

const MidnightContext = createContext<MidnightHookState | undefined>(undefined);

function formatBalance(value: unknown): string {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toFixed(2) : '0.00';
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return '0.00';
}

async function readWalletBalances(api: any): Promise<{ tnightBalance: string; dustBalance: string }> {
  let tnightBalance = '0.00';
  let dustBalance = '0.00';

  try {
    if (typeof api.getUnshieldedBalances === 'function') {
      const balances = await api.getUnshieldedBalances();
      if (balances && typeof balances === 'object') {
        const [firstBalance] = Object.values(balances as Record<string, unknown>);
        tnightBalance = formatBalance(firstBalance);
      }
    }

    if (typeof api.getDustBalance === 'function') {
      const dust = await api.getDustBalance();
      if (dust && typeof dust === 'object' && 'balance' in dust) {
        dustBalance = formatBalance((dust as { balance: unknown }).balance);
      } else {
        dustBalance = formatBalance(dust);
      }
    }
  } catch {
    // balance reads are informational only
  }

  return { tnightBalance, dustBalance };
}

async function resolveConnectedAddress(api: any): Promise<string | null> {
  try {
    if (typeof api.getUnshieldedAddress === 'function') {
      const addressResult = await api.getUnshieldedAddress();
      if (typeof addressResult === 'string') {
        return addressResult;
      }
      return addressResult?.unshieldedAddress ?? addressResult?.address ?? null;
    }

    if (typeof api.getShieldedAddresses === 'function') {
      const shielded = await api.getShieldedAddresses();
      const firstEntry = Array.isArray(shielded) ? shielded[0] : shielded;
      return firstEntry?.unshieldedAddress ?? firstEntry?.address ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export const MidnightProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState('PREVIEW');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackLedgerData | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [tnightBalance, setTnightBalance] = useState('0.00');
  const [dustBalance, setDustBalance] = useState('0.00');
  const [availableWallets, setAvailableWallets] = useState<WalletProviderInfo[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    // Clear legacy contract address keys from browser storage
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY_V2);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY_V3);

    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const envAddr = (import.meta as any).env?.VITE_CONTRACT_ADDRESS as string;
    return (saved && saved.trim()) ? saved.trim() : (envAddr && envAddr.trim()) ? envAddr.trim() : 'b7840834b9d2c13eeb676efa94271ee3e8b28cdab086b8212675d11f965aa8ac';
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCallingCircuit, setIsCallingCircuit] = useState(false);
  const [provingStep, setProvingStep] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [connectedAPI, setConnectedAPI] = useState<any>(null);

  const previewIndexerProvider = useMemo(
    () => createFeedbackPublicDataProvider(
      'https://indexer.preview.midnight.network/api/v4/graphql',
      'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    ),
    [],
  );

  useEffect(() => {
    const refreshWallets = () => {
      const wallets = detectInjectedWalletProviders();
      setAvailableWallets(wallets);
      setIsLaceInstalled(wallets.length > 0);
    };

    refreshWallets();
    const intervalId = window.setInterval(refreshWallets, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!contractAddress || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY, contractAddress);
  }, [contractAddress]);

  const fetchLiveContractState = useCallback(async () => {
    if (!contractAddress) {
      setFeedbackState(null);
      return;
    }

    setIsLoadingState(true);
    try {
      const provider = session?.providers.publicDataProvider ?? previewIndexerProvider;
      if (provider) {
        const state = await getFeedbackLedgerState(provider, contractAddress);
        setFeedbackState(state);
      }
    } finally {
      setIsLoadingState(false);
    }
  }, [contractAddress, previewIndexerProvider, session]);

  useEffect(() => {
    void fetchLiveContractState();
  }, [fetchLiveContractState]);

  const connectWallet = useCallback(async (walletId?: string) => {
    setError(null);
    setIsConnecting(true);

    try {
      const wallets = detectInjectedWalletProviders();
      setAvailableWallets(wallets);
      setIsLaceInstalled(wallets.length > 0);

      if (!wallets.length) {
        throw new Error('No Midnight wallet extension detected. Install 1 AM Wallet or Lace and reload the page.');
      }

      const walletInfo = walletId ? wallets.find((entry) => entry.id === walletId) ?? wallets[0] : wallets[0];
      setSelectedWalletId(walletInfo.id);

      const { api, networkId } = await connectInjectedWallet(walletInfo.provider);
      const connectedSession = await createConnectedSession(api);
      const resolvedAddress = connectedSession.unshieldedAddress || (await resolveConnectedAddress(api));
      const { tnightBalance: nextTnightBalance, dustBalance: nextDustBalance } = await readWalletBalances(api);

      setSession(connectedSession);
      setConnectedAPI(api);
      setIsConnected(true);
      setNetwork(formatNetworkLabel(networkId));
      setAddress(resolvedAddress);
      setTnightBalance(nextTnightBalance);
      setDustBalance(nextDustBalance);
    } catch (connectError: any) {
      setIsConnected(false);
      setSession(null);
      setConnectedAPI(null);
      setAddress(null);
      setError(connectError?.message ?? 'Failed to connect wallet.');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const formatFriendlyError = (rawErr: any): string => {
    const msg = (rawErr?.message || String(rawErr || '')).toLowerCase();
    if (msg.includes('user rejected') || msg.includes('declined') || msg.includes('cancel') || msg.includes('closed')) {
      return 'Wallet request was cancelled. Please open your 1AM wallet and confirm the action.';
    }
    if (msg.includes('not installed') || msg.includes('no midnight wallet')) {
      return 'No Midnight wallet extension found. Please install 1AM Wallet or Lace from the Chrome Web Store.';
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
      return 'Network connection interrupted. Please check your internet connection and retry.';
    }
    if (msg.includes('costmodel')) {
      return 'Cryptographic runtime re-initialized. Please retry submission.';
    }
    return rawErr?.message || 'Transaction submission failed. Please try again.';
  };

  const deployContract = useCallback(async (): Promise<string | null> => {
    if (!session) {
      setError('Connect a wallet before deploying the feedback contract.');
      return null;
    }

    setIsDeploying(true);
    setProvingStep('Preparing deploy transaction...');
    setError(null);

    try {
      const contractAddressHex = await deployFeedbackContract(session);
      setLastTxHash('Contract Deployed');
      setContractAddress(contractAddressHex);
      await fetchLiveContractState();
      return contractAddressHex;
    } catch (deployError: any) {
      setError(formatFriendlyError(deployError));
      return null;
    } finally {
      setIsDeploying(false);
      setProvingStep(null);
    }
  }, [fetchLiveContractState, session]);

  const submitAnonymousFeedback = useCallback(
    async (rating: number, comment?: string): Promise<string | null> => {
      if (!session) {
        setError('Please connect your 1AM wallet before submitting feedback.');
        return null;
      }

      if (!contractAddress) {
        setError('Feedback contract address is not configured.');
        return null;
      }

      const ratingNum = Math.max(1, Math.min(5, Math.round(rating)));
      setIsCallingCircuit(true);
      setError(null);
      setProvingStep('1/4: Synthesizing ZK witness & checking score bounds...');

      try {
        setProvingStep('2/4: Computing Zero-Knowledge Proof (ZK-SNARK)...');
        const txId = await submitFeedbackTx(session, contractAddress, ratingNum);
        setProvingStep('3/4: Broadcasting unsigned extrinsic to Preview network...');
        setLastTxHash(typeof txId === 'string' ? txId : 'Transaction Submitted');
        setProvingStep('4/4: Polling ledger indexer for state finality...');
        await fetchLiveContractState();
        return typeof txId === 'string' ? txId : 'tx_confirmed';
      } catch (callError: any) {
        setError(formatFriendlyError(callError));
        await fetchLiveContractState();
        return null;
      } finally {
        setIsCallingCircuit(false);
        setProvingStep(null);
      }
    },
    [contractAddress, fetchLiveContractState, session],
  );

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setSession(null);
    setConnectedAPI(null);
    setSelectedWalletId(null);
    setNetwork('PREVIEW');
    setTnightBalance('0.00');
    setDustBalance('0.00');
    setFeedbackState(null);
    setLastTxHash(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetContractAddress = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    setContractAddress(null);
    setFeedbackState(null);
    setError(null);
  }, []);

  const value: MidnightHookState = {
    isConnected,
    isLaceInstalled,
    address,
    network,
    error,
    isConnecting,
    feedbackState,
    isLoadingState,
    tnightBalance,
    dustBalance,
    availableWallets,
    selectedWalletId,
    contractAddress,
    session,
    isDeploying,
    isCallingCircuit,
    provingStep,
    lastTxHash,
    connectWallet,
    disconnectWallet,
    clearError,
    resetContractAddress,
    fetchLiveContractState,
    deployContract,
    submitAnonymousFeedback,
    connectedAPI,
  };

  return React.createElement(MidnightContext.Provider, { value }, children);
};

export function useMidnight(): MidnightHookState {
  const context = useContext(MidnightContext);
  if (!context) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }

  return context;
}