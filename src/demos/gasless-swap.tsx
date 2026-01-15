'use client'

import { useEffect, useState, useCallback } from 'react'
import { Wallet,  ArrowLeftRight } from 'lucide-react'
import { useWallet } from '@lazorkit/wallet'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useSafeWallet } from '@/hooks/useSafeWallet'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { getNetworkTokens, CURRENT_NETWORK } from '@/config/lazorkit'
import { txExplorerUrl } from '@/config/lazorkit'

type Quote = {
  rate: number
  usdcAmount: number
}

const tokens = getNetworkTokens()

export const USDC_CONFIG = {
  symbol: tokens.USDC.symbol,
  mintAddress: tokens.USDC.mint,
  decimals: tokens.USDC.decimals,

  // this must be your pool’s real USDC token account
  poolWallet:
  process.env.NEXT_PUBLIC_USDC_POOL_WALLET || '',

}

type TxState = 'idle' | 'quoting' | 'swapping' | 'confirming' | 'success' | 'error'

export default function GaslessSwap() {
  const { smartWalletPubkey, isConnected } = useWallet()
  const { signAndSendTransaction } = useSafeWallet()

  const address = smartWalletPubkey?.toString() || null
  const { solBalance, usdcBalance, isLoading, refresh } = useWalletBalance(address)

  const [solAmount, setSolAmount] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [txState, setTxState] = useState<TxState>('idle')
  const [txSig, setTxSig] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ───────── Fetch quote (Jupiter price via backend) ─────────
  const fetchQuote = useCallback(async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null)
      return
    }

    try {
      setTxState('quoting')
      const res = await fetch('/api/swap')
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to get price')
      }

      const sol = parseFloat(amount)
      setQuote({
        rate: data.solPrice,
        usdcAmount: sol * data.solPrice,
      })

      setTxState('idle')
    } catch (e) {
      setQuote(null)
      setTxState('error')
      setError('Failed to fetch price')
    }
  }, [])

  // Debounce price fetch
  useEffect(() => {
    if (!solAmount || parseFloat(solAmount) <= 0) {
      setQuote(null)
      return
    }

    const t = setTimeout(() => fetchQuote(solAmount), 500)
    return () => clearTimeout(t)
  }, [solAmount, fetchQuote])

  // ───────── Execute swap ─────────
  const handleSwap = async () => {
    if (!smartWalletPubkey || !quote || !isConnected) return

    try {
      if (parseFloat(solAmount) > solBalance) {
        throw new Error('Insufficient SOL balance')
      }

      setTxState('swapping')
      setError(null)
 
      const poolWallet = new PublicKey(USDC_CONFIG.poolWallet)
      const lamports = Math.floor(parseFloat(solAmount) * 1_000_000_000)

      // 1️⃣ User sends SOL → pool
      const ix = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: poolWallet,
        lamports,
      })

      setTxState('confirming')

      const signature = await signAndSendTransaction({
        instructions: [ix],
      })

      // 2️⃣ Backend sends USDC → user
      const res = await fetch('/api/swap/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userWallet: smartWalletPubkey.toString(),
          solAmount: parseFloat(solAmount),
          solTxSignature: signature,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Swap failed')

      setTxSig(data.signature || signature)
      setTxState('success')
      setSolAmount('')
      setQuote(null)
      await refresh()
    } catch (err) {
      setTxState('error')
      setError(err instanceof Error ? err.message : 'Swap failed')
    }
  }

  if (!isConnected) {
    return <div>Please connect wallet</div>
  }

  // ───────── UI (yours, untouched) ─────────
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pb-6">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Gasless Swap</h1>
          </div>
          <p className="text-purple-100">
            Swap SOL → {USDC_CONFIG.symbol} without gas
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* SOL */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex gap-2">
              <Wallet className="w-4 h-4" /> You Pay (SOL)
            </label>
            <input
              type="number"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg border-2"
            />
            <p className="mt-2 text-xs">
              Balance: {solBalance.toFixed(4)} SOL
            </p>
          </div>

          {/* USDC */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex gap-2">
              <Wallet className="w-4 h-4" /> You Receive ({USDC_CONFIG.symbol})
            </label>
            <input
              disabled
              value={quote ? quote.usdcAmount.toFixed(2) : ''}
              className="w-full px-4 py-3 rounded-lg border-2 bg-gray-100"
            />
            <p className="mt-2 text-xs">
              Balance: {usdcBalance.toFixed(2)} {USDC_CONFIG.symbol}
            </p>
          </div>

          {quote && (
            <div className="text-xs text-gray-500">
              1 SOL ≈ {quote.rate.toFixed(2)} {USDC_CONFIG.symbol}
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            onClick={handleSwap}
            disabled={!quote || txState !== 'idle'}
            className="w-full font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 bg-purple-600 text-white"
          >
            <ArrowLeftRight />
            {txState === 'swapping'
              ? 'Sign…'
              : txState === 'confirming'
              ? 'Confirming…'
              : 'SWAP GASLESS'}
          </button>

          {txSig && (
            <a
              href={txExplorerUrl(txSig)}
              target="_blank"
              className="block text-center text-xs text-purple-600 underline"
            >
              View transaction
            </a>
          )}
        </div>
        <p className={`text-center text-xs`}>
          Transfers are processed instantly on Devnet
        </p>
      </div>
      
    </div>
  )
}
