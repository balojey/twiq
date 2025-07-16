import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useWallet() {
  const wallet = useSolanaWallet();
  const { connection } = useConnection();

  const shortAddress = useMemo(() => {
    if (!wallet.publicKey) return '';
    const address = wallet.publicKey.toString();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, [wallet.publicKey]);

  const getBalance = async () => {
    if (!wallet.publicKey) return 0;
    try {
      const balance = await connection.getBalance(wallet.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  };

  return {
    ...wallet,
    shortAddress,
    getBalance,
    connection,
  };
}

export { useConnection } from '@solana/wallet-adapter-react';