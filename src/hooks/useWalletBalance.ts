/**
 * useWalletBalance Hook
 * 
 * Custom hook to fetch SOL and USDC balances for a wallet address.
 * Automatically refreshes when the address changes and handles token account
 * derivation for smart wallets (PDAs).
 * 
 * @example
 * ```tsx
 * const { solBalance, usdcBalance, isLoading, refresh } = useWalletBalance(address);
 * ```
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { LAZORKIT_CONFIG, getNetworkTokens } from '@/config/lazorkit'

/**
 * Return type for useWalletBalance hook
 */
interface UseWalletBalanceReturn {
  solBalance: number;
  usdcBalance: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage wallet balances
 * Fetches native SOL balance and USDC token balance for a given address
 * 
 * @param address - Wallet address string or null if not connected
 * @returns Object containing balances, loading state, error, and refresh function
 */
export function useWalletBalance(address: string | null): UseWalletBalanceReturn {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches both SOL and USDC balances from the blockchain
   * Handles token account derivation for smart wallets (PDAs)
   * Automatically resets balances to 0 if address is null
   */
  const fetchBalances = useCallback(async () => {
    if (!address) {
      setSolBalance(0);
      setUsdcBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      /**
       * Create RPC connection with confirmed commitment level
       * Ensures we get confirmed balance data
       */
      const connection = new Connection(LAZORKIT_CONFIG.rpcUrl, 'confirmed');
      const publicKey = new PublicKey(address);

      /**
       * Fetch native SOL balance
       * getBalance returns lamports (1 SOL = 1e9 lamports)
       * Convert to SOL for display
       */
      const lamports = await connection.getBalance(publicKey);
      setSolBalance(lamports / LAMPORTS_PER_SOL);

      /**
       * Fetch USDC token balance
       * Requires deriving the Associated Token Account (ATA) address first
       */
      try {
        const tokens = getNetworkTokens()
        const usdcMint = new PublicKey(tokens.USDC.mint)

        /**
         * Derive ATA address for USDC
         * allowOwnerOffCurve=true is required because Lazorkit smart wallets are PDAs
         * PDAs can own token accounts even though they're not standard keypairs
         */
        const ataAddress = await getAssociatedTokenAddress(usdcMint, publicKey, true);

        /**
         * Fetch token account information
         * Contains the actual USDC balance
         */
        const tokenAccount = await getAccount(connection, ataAddress);

        /**
         * Convert from raw token amount to UI amount
         * USDC has 6 decimals, so divide by 10^6
         */
        const rawBalance = Number(tokenAccount.amount);
        setUsdcBalance(rawBalance / Math.pow(10, tokens.USDC.decimals))

      } catch {
        /**
         * Token account doesn't exist = 0 balance
         * This is normal for new wallets that haven't received USDC yet
         * Not an error condition, just set balance to 0
         */
        setUsdcBalance(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      setError(errorMessage);
      console.error('Balance fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  /**
   * Automatically fetch balances when address changes
   * Uses fetchBalances as dependency to ensure fresh data
   */
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    solBalance,
    usdcBalance,
    isLoading,
    error,
    refresh: fetchBalances,
  };
}