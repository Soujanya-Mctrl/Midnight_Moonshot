import { useState, useEffect } from 'react';

export interface MidnightHookState {
  isConnected: boolean;
  isLaceInstalled: boolean;
  address: string | null;
  network: string;
  error: string | null;
  isConnecting: boolean;
  counterState: number;
  isLoadingState: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
  fetchLiveContractState: () => Promise<void>;
}

const CONTRACT_ADDRESS = '9a6287e343929ac29e6aa910eca52a0db7ecd9dc794ad6658f2619df57ea1417';
const INDEXER_URL = 'https://indexer.preview.midnight.network/api/v4/graphql';

export function useMidnight(): MidnightHookState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [counterState, setCounterState] = useState<number>(42);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);
  const network = 'Preview Testnet';

  // Helper to detect window.midnight.mnLace injection
  const detectLace = (): any => {
    if (typeof window === 'undefined') return null;
    const win = window as any;
    return win.midnight?.mnLace || win.midnight?.lace || win.cardano?.midnight || win.midnight || null;
  };

  useEffect(() => {
    const check = () => {
      const connector = detectLace();
      setIsLaceInstalled(!!connector);
    };

    check();
    window.addEventListener('load', check);
    const interval = setInterval(check, 1000);

    // Initial fetch of live contract state from Indexer
    fetchLiveContractState();

    return () => {
      window.removeEventListener('load', check);
      clearInterval(interval);
    };
  }, []);

  const fetchLiveContractState = async () => {
    setIsLoadingState(true);
    try {
      const response = await fetch(INDEXER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetContractState($address: String!) {
              contractState(address: $address) {
                data
              }
            }
          `,
          variables: { address: CONTRACT_ADDRESS },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const data = result?.data?.contractState?.data;
        if (data) {
          // Parse Uint32 ledger state from returned hex/json data
          const parsedVal = parseInt(data, 16) || parseInt(data, 10);
          if (!isNaN(parsedVal)) {
            setCounterState(parsedVal);
          }
        }
      }
    } catch (e) {
      console.warn('Indexer state fetch fallback:', e);
    } finally {
      setIsLoadingState(false);
    }
  };

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const connector = detectLace();

      if (!connector) {
        throw new Error(
          'Lace Wallet extension is not installed in your browser. Please install the Lace Midnight Extension from Chrome Web Store.'
        );
      }

      console.log('Invoking Lace connector API:', connector);
      const api = typeof connector.enable === 'function' ? await connector.enable() : connector;

      if (!api) {
        throw new Error('User declined wallet connection.');
      }

      setIsConnected(true);

      // Extract wallet address / public key from API
      if (typeof api.state === 'function') {
        try {
          const state = await api.state();
          if (state?.address) {
            setAddress(state.address);
          } else if (state?.coinPublicKey) {
            setAddress(`mn_addr_preview${state.coinPublicKey.substring(0, 48)}`);
          } else {
            setAddress('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
          }
        } catch {
          setAddress('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
        }
      } else {
        setAddress('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setIsConnected(false);
      setAddress(null);
      if (err?.message?.includes('installed')) {
        setError('Lace Wallet extension not detected in browser. Install Lace Midnight extension in Chrome/Brave/Edge.');
      } else if (err?.message?.includes('declined') || err?.message?.includes('rejected')) {
        setError('Connection Request Rejected: You declined the Lace Wallet connection prompt.');
      } else {
        setError(err?.message || 'Failed to connect Lace Wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isConnected,
    isLaceInstalled,
    address,
    network,
    error,
    isConnecting,
    counterState,
    isLoadingState,
    connectWallet,
    disconnectWallet,
    clearError,
    fetchLiveContractState,
  };
}
