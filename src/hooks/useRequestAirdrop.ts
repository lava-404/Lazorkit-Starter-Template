/**
 * useRequestAirdrop Hook
 * 
 * Custom hook for requesting SOL airdrops on devnet/testnet.
 * Handles transaction submission, confirmation, and error states.
 */

'use client'

import { useState } from 'react'
import { useWallet } from '@lazorkit/wallet'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { CURRENT_NETWORK } from '@/config/lazorkit'

/**
 * Hook for requesting SOL airdrops
 * Provides loading state, error handling, and transaction signature
 * 
 * @returns Object with requestAirdrop function and state values
 */
export function useRequestAirdrop() {
  const { smartWalletPubkey, isConnected } = useWallet()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)

  /**
   * Requests an airdrop of SOL to the connected wallet
   * Converts SOL amount to lamports and confirms transaction
   * 
   * @param amountSol - Amount of SOL to request (default: 1)
   * @returns Transaction signature string
   * @throws Error if wallet is not connected or airdrop fails
   */
  const requestAirdrop = async (amountSol: number = 1) => {
    if (!isConnected || !smartWalletPubkey) {
      throw new Error('Wallet not connected')
    }

    try {
      setLoading(true)
      setError(null)
      setSignature(null)

      /**
       * Create RPC connection with confirmed commitment level
       * Ensures transaction is confirmed before proceeding
       */
      const connection = new Connection(
        CURRENT_NETWORK.rpcEndpoint,
        'confirmed'
      )

      /**
       * Request airdrop from Solana network
       * Amount is converted from SOL to lamports (1 SOL = 1e9 lamports)
       */
      const sig = await connection.requestAirdrop(
        smartWalletPubkey,
        amountSol * LAMPORTS_PER_SOL
      )

      /**
       * Get latest blockhash for transaction confirmation
       * Required to ensure transaction is included in a recent block
       */
      const latest = await connection.getLatestBlockhash()

      /**
       * Confirm transaction with latest blockhash
       * Waits until transaction is confirmed on-chain
       */
      await connection.confirmTransaction(
        {
          signature: sig,
          ...latest,
        },
        'confirmed'
      )

      setSignature(sig)
      return sig
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Airdrop failed'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    requestAirdrop,
    loading,
    error,
    signature,
  }
}
