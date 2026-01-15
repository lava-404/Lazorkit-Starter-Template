/**
 * useSolana Hook
 * 
 * Custom hook that abstracts Wallet UI and Solana client functionality.
 * Provides access to wallet UI state and Gill client for Solana operations.
 * This is a good place to add custom shared Solana logic or clients.
 */

import { useWalletUi } from '@wallet-ui/react'
import { useWalletUiGill } from '@wallet-ui/react-gill'

/**
 * Hook providing Solana wallet UI and client functionality
 * Combines wallet UI state management with Gill client for blockchain operations
 * 
 * @returns Object containing wallet UI state and Gill client instance
 */
export function useSolana() {
  const walletUi = useWalletUi()
  const client = useWalletUiGill()

  return {
    ...walletUi,
    client,
  }
}