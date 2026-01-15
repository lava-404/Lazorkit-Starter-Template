'use client'

import { useState } from 'react'
import { CreditCard, ArrowRight, CheckCircle } from 'lucide-react'
import { useWallet } from '@lazorkit/wallet'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createApproveInstruction,
} from '@solana/spl-token'
import { useSafeWallet } from '@/hooks/useSafeWallet'
import { CURRENT_NETWORK } from '@/config/lazorkit'

const USDC_MINT = new PublicKey(
  'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
)

const SERVICE_WALLET = new PublicKey(
  '2HHtMGWfMzr6Rr5gq8xvmcMZcRUCv3t6pdNfx1XzNycY' // replace with your demo wallet
)

const SUBSCRIPTION_PRICE_USDC = 0.5

function SubscriptionComponent() {
  const { smartWalletPubkey } = useWallet()
  const { signAndSendTransaction } = useSafeWallet()

  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async () => {
    if (!smartWalletPubkey) {
      alert('Connect wallet first')
      return
    }

    try {
      setLoading(true)

      const connection = new Connection(CURRENT_NETWORK.rpcEndpoint)
      
      // 1️⃣ Find USDC ATA (smart wallets are PDAs → allowOwnerOffCurve = true)
      const ata = await getAssociatedTokenAddress(
        USDC_MINT,
        smartWalletPubkey,
        true
      )
      console.log('RPC:', CURRENT_NETWORK.rpcEndpoint)
      console.log('Smart wallet:', smartWalletPubkey.toBase58())
      console.log('USDC ATA:', ata.toBase58())


      const accountInfo = await connection.getParsedAccountInfo(ata)

      if (!accountInfo.value) {
        throw new Error(
          'No USDC account found. Get devnet USDC before subscribing.'
        )
      }

      const parsed = accountInfo.value.data as any
      const balance = parsed.parsed.info.tokenAmount.uiAmount

      if (balance < SUBSCRIPTION_PRICE_USDC) {
        throw new Error(
          `Insufficient USDC. You have ${balance} USDC, need ${SUBSCRIPTION_PRICE_USDC} USDC`
        )
      }

      // 2️⃣ Approve allowance (THIS is the subscription)
      const decimals = parsed.parsed.info.tokenAmount.decimals
      const amount = BigInt(
        SUBSCRIPTION_PRICE_USDC * Math.pow(10, decimals)
      )

      const approveIx = createApproveInstruction(
        ata,                 // source (user USDC)
        SERVICE_WALLET,      // delegate (service)
        smartWalletPubkey,   // owner
        amount
      )

      await signAndSendTransaction({
        instructions: [approveIx],
      })

      setSubscribed(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Lazor + Pro
              </h1>
              <p className="text-sm text-purple-100">
                Premium subscription
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* PRICE */}
          <div className="text-center py-4">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-5xl font-bold text-gray-900">$0.50</span>
              <span className="text-base text-gray-500 font-medium">/ month</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Billed in USDC</p>
          </div>

          {/* FEATURES */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What's included</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                </div>
                <span className="text-gray-700">Gasless transactions</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                </div>
                <span className="text-gray-700">Passkey-based wallet</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
                </div>
                <span className="text-gray-700">Automated USDC billing</span>
              </li>
            </ul>
          </div>

          {/* INFO BOX */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-1 bg-purple-100 rounded-lg">
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  How it works
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You approve a USDC allowance. The service can bill you
                  later, no payment happens now.
                </p>
              </div>
            </div>
          </div>

          {/* ACTION */}
          {subscribed ? (
            <div className="w-full py-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700 font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              Subscription Active
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 bg-purple-600 text-white"
            >
              <CreditCard />
              {loading ? 'Authorizing…' : 'Subscribe (Gasless)'}
            </button>
          )}

          {/* FOOTER */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              No wallet installs • No gas fees • Devnet only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionComponent