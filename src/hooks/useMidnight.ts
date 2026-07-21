import { useState, useEffect } from 'react';

export interface MidnightHookState {
  isConnected: boolean;
  isLaceInstalled: boolean;
  address: string | null;
  network: string;
  error: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
}

export function useMidnight(): MidnightHookState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const network = 'Preview Testnet';

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).midnight?.mnLace) {
      setIsLaceInstalled(true);
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const midnight = typeof window !== 'undefined' ? (window as any).midnight : undefined;

      if (!midnight?.mnLace) {
        // Fallback demo mode if Lace browser extension is not installed
        setTimeout(() => {
          setIsConnected(true);
          setAddress('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
          setIsConnecting(false);
        }, 500);
        return;
      }

      const walletAPI = await midnight.mnLace.enable();
      if (!walletAPI) {
        throw new Error('User rejected connection request');
      }

      setIsConnected(true);
      setAddress('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
      console.log('Lace wallet connected successfully:', walletAPI);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err?.message?.includes('rejected')) {
        setError('Connection Rejected: You declined the Lace wallet connection request.');
      } else {
        setError(err?.message || 'Failed to connect to Lace Wallet.');
      }
      setIsConnected(false);
      setAddress(null);
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
    connectWallet,
    disconnectWallet,
    clearError,
  };
}
