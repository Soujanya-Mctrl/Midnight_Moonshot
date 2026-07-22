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
  tnightBalance: string;
  dustBalance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
  fetchLiveContractState: () => Promise<void>;
  connectedAPI: any;
}

const CONTRACT_ADDRESS = '9a6287e343929ac29e6aa910eca52a0db7ecd9dc794ad6658f2619df57ea1417';
const INDEXER_URL = 'https://indexer.preprod.midnight.network/api/v4/graphql';

export function useMidnight(): MidnightHookState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLaceInstalled, setIsLaceInstalled] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [counterState, setCounterState] = useState<number>(42);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false);
  const [tnightBalance, setTnightBalance] = useState<string>('0.00');
  const [dustBalance, setDustBalance] = useState<string>('0.00');
  const [network, setNetwork] = useState<string>('Preprod Testnet');
  const [connectedAPI, setConnectedAPI] = useState<any>(null);

  // Locate injected window.midnight provider
  const getMidnightWalletProvider = (): { id: string; provider: any } | null => {
    if (typeof window === 'undefined') return null;
    const win = window as any;
    if (!win.midnight) return null;

    const walletKeys = Object.keys(win.midnight);
    for (const key of walletKeys) {
      const p = win.midnight[key];
      if (p && (typeof p.connect === 'function' || typeof p.enable === 'function')) {
        return { id: key, provider: p };
      }
    }
    return null;
  };

  useEffect(() => {
    const check = () => {
      const walletInfo = getMidnightWalletProvider();
      setIsLaceInstalled(!!walletInfo);
    };

    check();
    window.addEventListener('load', check);
    const interval = setInterval(check, 1000);

    fetchLiveContractState();

    return () => {
      window.removeEventListener('load', check);
      clearInterval(interval);
    };
  }, []);

  // Account switch auto-sync effect
  useEffect(() => {
    if (!connectedAPI) return;

    const syncAccountState = async () => {
      try {
        const { addr, tnight, dust } = await extractAddressAndState(connectedAPI);
        if (addr && addr !== address) {
          setAddress(addr);
        }
        if (tnight) setTnightBalance(tnight);
        if (dust) setDustBalance(dust);
      } catch (e) {
        console.warn('Account sync error:', e);
      }
    };

    const accountInterval = setInterval(syncAccountState, 2000);
    return () => clearInterval(accountInterval);
  }, [connectedAPI, address]);

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
          const parsedVal = parseInt(data, 16) || parseInt(data, 10);
          if (!isNaN(parsedVal)) {
            setCounterState(parsedVal);
          }
        }
      }
    } catch (e) {
      console.warn('Indexer query error:', e);
    } finally {
      setIsLoadingState(false);
    }
  };

  const extractAddressAndState = async (api: any): Promise<{ addr: string | null; tnight: string; dust: string }> => {
    let addr: string | null = null;
    let tnight = '0.00';
    let dust = '0.00';

    if (!api) return { addr, tnight, dust };

    console.log('Inspecting connected Lace API object:', api);

    // 1. Try DApp Connector API methods
    try {
      if (typeof api.getUnshieldedAddress === 'function') {
        const addrRes = await api.getUnshieldedAddress();
        addr = typeof addrRes === 'string' ? addrRes : (addrRes?.unshieldedAddress || addrRes);
      } else if (typeof api.getShieldedAddresses === 'function') {
        const addrs = await api.getShieldedAddresses();
        addr = Array.isArray(addrs) ? addrs[0] : (addrs?.shieldedAddress || addrs);
      }
    } catch (e) {
      console.warn('Direct address method call error:', e);
    }

    // 2. Try state() observable / promise
    if (!addr && typeof api.state === 'function') {
      try {
        const stateRes = await api.state();
        if (stateRes) {
          if (typeof stateRes.subscribe === 'function') {
            await new Promise<void>((resolve) => {
              stateRes.subscribe((s: any) => {
                if (s?.address) addr = s.address;
                else if (s?.unshieldedAddress) addr = s.unshieldedAddress;
                else if (s?.coinPublicKey) addr = `mn_addr1${s.coinPublicKey}`;
                resolve();
              });
            });
          } else {
            addr = stateRes.address || stateRes.unshieldedAddress || (stateRes.coinPublicKey ? `mn_addr1${stateRes.coinPublicKey}` : null);
          }
        }
      } catch (e) {
        console.warn('State call error:', e);
      }
    }

    // 3. Check direct object properties
    if (!addr) {
      addr =
        api.address ||
        api.unshieldedAddress ||
        (Array.isArray(api.accounts) ? api.accounts[0] : null);
    }

    // 4. Try balance & config methods
    try {
      if (typeof api.getUnshieldedBalances === 'function') {
        const b = await api.getUnshieldedBalances();
        if (b) tnight = typeof b === 'object' ? String(Object.values(b)[0] || '0.00') : String(b);
      }
      if (typeof api.getDustBalance === 'function') {
        const d = await api.getDustBalance();
        if (d && typeof d === 'object' && d.balance !== undefined) {
           dust = String(d.balance);
        } else if (d !== undefined && d !== null) {
           dust = String(d);
        }
      }
    } catch (e) {
      console.warn('Balance query error:', e);
    }

    return { addr, tnight, dust };
  };

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const walletInfo = getMidnightWalletProvider();

      if (!walletInfo) {
        throw new Error(
          'Lace Wallet extension is not detected in your browser. Make sure the Lace Midnight extension is installed and active.'
        );
      }

      console.log(`Attempting connection with Midnight Wallet (${walletInfo.id})...`, walletInfo.provider);

      const provider = walletInfo.provider;
      let api: any = null;
      let lastErr: any = null;

      const networkIds = ['preprod', 'preview', 'undeployed', 'mainnet'];

      for (const netId of networkIds) {
        try {
          if (typeof provider.connect === 'function') {
            api = await provider.connect(netId);
          } else if (typeof provider.enable === 'function') {
            api = await provider.enable(netId);
          }
          if (api) {
            const formattedName =
              netId === 'mainnet'
                ? 'Mainnet'
                : netId === 'undeployed'
                ? 'Undeployed Localnet'
                : `${netId.charAt(0).toUpperCase() + netId.slice(1)} Testnet`;
            setNetwork(formattedName);
            break;
          }
        } catch (err: any) {
          lastErr = err;
          const msg = (err?.message || '').toLowerCase();
          if (msg.includes('network id mismatch') || msg.includes('unsupported network id') || msg.includes('invalid network id')) {
            console.warn(`Lace connect mismatch/unsupported for '${netId}', trying next network...`);
            continue;
          }
          throw err;
        }
      }

      if (!api && lastErr) {
        throw lastErr;
      }

      if (!api) {
        throw new Error('Lace Wallet API is unavailable.');
      }

      const { addr, tnight, dust } = await extractAddressAndState(api);

      const finalAddr = addr || 'mn_addr1_lace_wallet';

      setConnectedAPI(api);
      setIsConnected(true);
      setAddress(finalAddr);
      setTnightBalance(tnight);
      setDustBalance(dust);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setIsConnected(false);
      setAddress(null);
      setConnectedAPI(null);
      setError(err?.message || 'Failed to connect Lace Wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setConnectedAPI(null);
    setError(null);
    setTnightBalance('0.00');
    setDustBalance('0.00');
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
    tnightBalance,
    dustBalance,
    connectWallet,
    disconnectWallet,
    clearError,
    fetchLiveContractState,
    connectedAPI,
  };
}
