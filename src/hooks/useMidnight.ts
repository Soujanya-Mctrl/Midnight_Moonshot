import { useState, useEffect } from 'react';

export interface MidnightHookState {
  isConnected: boolean;
  isLaceInstalled: boolean;
  address: string | null;
  network: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export function useMidnight(): MidnightHookState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const network = 'Preview Testnet';

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).midnight?.mnLace) {
      setIsLaceInstalled(true);
    }
  }, []);

  const connectWallet = async () => {
    const midnight = (window as any).midnight;
    if (typeof window !== 'undefined' && midnight?.mnLace) {
      try {
        const walletAPI = await midnight.mnLace.enable();
        setIsConnected(true);
        setAddress('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
        console.log('Midnight Lace Wallet API connected:', walletAPI);
      } catch (err) {
        console.error('Wallet connection rejected:', err);
      }
    } else {
      // Fallback demo mode for development
      setIsConnected(true);
      setAddress('mn_addr_preview1y3g0z6rjlqlc3uj65ztglnlvklc3w3vm3mketp7tdaxpfp9e6nrq5s494v');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  return {
    isConnected,
    isLaceInstalled,
    address,
    network,
    connectWallet,
    disconnectWallet,
  };
}
