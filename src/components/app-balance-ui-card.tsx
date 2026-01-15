/**
 * Balance Card Component
 * 
 * Displays wallet balance (SOL and USDC) with loading states and low balance warnings.
 * Includes airdrop functionality for devnet SOL when balance is low.
 */

import { useRequestAirdrop } from "@/hooks/useRequestAirdrop"
import { useSafeWallet } from "@/hooks/useSafeWallet"
import { useWallet } from "@lazorkit/wallet"
import { Wallet, AlertCircle, Sparkles } from "lucide-react"
import { useWalletBalance } from "@/hooks/useWalletBalance"

/**
 * Balance card component
 * Shows SOL and USDC balances with airdrop option for low balances
 */
const BalanceCard = () => {
  const { smartWalletPubkey, isConnected } = useWallet()
  
  /**
   * Initializes safe wallet wrapper with retry logic
   * Must be called to enable transaction retry functionality
   */
  useSafeWallet()

  const address = smartWalletPubkey?.toString() || null

  /**
   * Fetches wallet balances for SOL and USDC
   * Automatically refreshes when address changes
   */
  const {
    solBalance,
    usdcBalance,
    isLoading,
    refresh,
  } = useWalletBalance(address)

  /**
   * Airdrop functionality for devnet SOL
   * Allows requesting test SOL when balance is low
   */
  const {
    requestAirdrop,
    loading: airdropLoading,
  } = useRequestAirdrop()

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header section with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white/80">Wallet Balance</h2>
            <p className="text-xs text-white/60">Solana Devnet</p>
          </div>
        </div>

        {/* SOL balance display */}
        <div className="mt-6">
          {isLoading ? (
            <div className="text-white">Loading…</div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {solBalance.toFixed(4)}
              </span>
              <span className="text-xl text-white/70">SOL</span>
            </div>
          )}
        </div>

        {/* USDC balance display */}
        <div className="mt-2 text-sm text-white/70">
          {usdcBalance.toFixed(2)} USDC
        </div>
      </div>

      {/* Low balance warning and airdrop button */}
      {solBalance < 0.001 && (
        <div className="p-4 bg-amber-50">
          <div className="flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">Low balance</p>
              <p className="text-xs">Get devnet SOL to continue</p>
            </div>
          </div>

          {/* Airdrop request button */}
          <div className="mt-3 flex justify-end">
            <button
              disabled={airdropLoading}
              onClick={async () => {
                await requestAirdrop(1)
                refresh() // Refreshes balances after airdrop completes
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              {airdropLoading ? "Airdropping…" : "Get 1 SOL"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BalanceCard
