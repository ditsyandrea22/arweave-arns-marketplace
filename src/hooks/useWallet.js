import { useState, useEffect } from 'react';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.arweaveWallet) {
      try {
        const permissions = await window.arweaveWallet.getPermissions();
        if (permissions.includes('ACCESS_ADDRESS')) {
          const addr = await window.arweaveWallet.getActiveAddress();
          setAddress(addr);
          setIsConnected(true);
          await updateBalance(addr);
        }
      } catch (error) {
        console.error('Connection check failed:', error);
      }
    }
  };

  const connect = async () => {
    if (!window.arweaveWallet) {
      alert('Please install ArConnect to use this dApp');
      return;
    }

    setIsLoading(true);
    try {
      await window.arweaveWallet.connect([
        'ACCESS_ADDRESS',
        'ACCESS_ALL_ADDRESSES',
        'SIGN_TRANSACTION'
      ]);
      const addr = await window.arweaveWallet.getActiveAddress();
      setAddress(addr);
      setIsConnected(true);
      await updateBalance(addr);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      await window.arweaveWallet.disconnect();
      setIsConnected(false);
      setAddress('');
      setBalance(0);
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const updateBalance = async (addr) => {
    try {
      const winstonBalance = await window.arweaveWallet.getBalance(addr);
      const arBalance = winstonBalance / 1000000000000;
      setBalance(arBalance.toFixed(6));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  return {
    connect,
    disconnect,
    isConnected,
    address,
    balance,
    isLoading
  };
}