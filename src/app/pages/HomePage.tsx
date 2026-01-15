'use client'
/**
 * Home Page Component
 * 
 * Main dashboard page displaying interactive demos of Lazorkit features.
 * Shows wallet balance, feature tabs, and demo components for gasless transactions,
 * subscriptions, and swaps. Requires wallet connection to function.
 */

import { useState } from 'react'
import { useWallet } from '@lazorkit/wallet'
import GaslessTransfer from '@/demos/gaslesstransfer'
import { useSafeWallet } from '@/hooks/useSafeWallet'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import BalanceCard from '@/components/app-balance-ui-card'
import SubscriptionComponent from '@/demos/usdc-subscriptiion'
import GaslessSwap from '@/demos/gasless-swap'
import { useEffect } from 'react'
import AppConnectWalletPrompt from '@/components/app-connect-wallet-prompt'


/**
 * Available feature demo types
 */
type FeatureKey = 'swap' | 'subscription' | 'transfers'

/**
 * Feature configuration mapping
 * Defines metadata and demo components for each feature tab
 */
const FEATURES = {
  transfers: {
    title: 'Gasless Transfers',
    subtitle: 'Send SOL instantly without holding any SOL for fees. Your smart wallet signs, the paymaster sponsors the gas, and the transaction just… works.',
    howItWorks: [
      'You initiate a SOL transfer from your smart wallet.',
      'The transaction is signed using passkey authentication.',
      'Lazorkit’s paymaster sponsors the gas fee.',
      'The transaction is submitted and finalized on-chain.',
    ],
    demo: <GaslessTransfer />,
  },
  subscription: {
    title: 'USDC Subscriptions',
    subtitle: 'Approve a USDC allowance once and let payments happen automatically. No repeated signing, no manual payments — just seamless recurring billing.',
    howItWorks: [
      'You approve a USDC allowance for the service.',
      'No payment is made immediately.',
      'The service can charge against the allowance later.',
      'No repeated signatures are required.',
    ],
    demo: <SubscriptionComponent />,
  },
  swap: {
    title: 'Gasless Swap',
    subtitle: 'Swap SOL to USDC at live market prices without worrying about gas. You send SOL, the backend settles the swap, and fees are handled automatically.',
    howItWorks: [
      'You enter the amount of SOL to swap.',
      'Live SOL/USDC price is fetched.',
      'You send SOL to the pool wallet.',
      'Backend sends USDC back to your smart wallet.',
    ],
    demo: <GaslessSwap />,
  },
}


/**
 * Home page component displaying feature demos
 * Shows wallet balance, feature tabs, and interactive demo components
 */
export default function HomePage() {
  useEffect(() => {
    const handler = (e: any) => {
      const { feature, scroll } = e.detail
  
      setActiveFeature(feature)
  
      if (scroll) {
        // Wait for React to re-render before scrolling
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const el = document.getElementById('demo-section')
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          })
        })
      }
    }
  
    window.addEventListener('select-demo', handler)
    return () => window.removeEventListener('select-demo', handler)
  }, [])
  
  
  
  
  const [activeFeature, setActiveFeature] = useState<FeatureKey>('swap')
  const feature = FEATURES[activeFeature]

  const { wallet, isConnected, smartWalletPubkey } = useWallet()
  
  /**
   * Initializes safe wallet wrapper with retry logic
   * Must be called even if return value is unused to enable retry functionality
   */
  useSafeWallet()

  const address = smartWalletPubkey?.toString() || null
  const { solBalance } = useWalletBalance(address)

  /**
   * Early return if wallet is not connected
   * All demos require an active wallet connection
   */
  if (!isConnected || !wallet) {
    return <AppConnectWalletPrompt />
  }

  

  return (
    <div>
      <div
        id="demo-section"
        className="border-t border-gray-200"
      >
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-32">

          {/* 🔹 TOP ROW: Title + Subtitle (full width always) */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h2>

            <p className="text-sm sm:text-base text-gray-600">
              {feature.subtitle}
            </p>
          </div>

          {/* 🔹 BOTTOM ROW: Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* LEFT COLUMN */}
            <div className="flex flex-col">
              {/* Wallet balance */}
              <div className="mb-6 sm:mb-10">
                <BalanceCard />
              </div>

              {/* How it works */}
              <div className="mb-6 sm:mb-8">
                <div className="rounded-xl border border-[#7857FF]/15 bg-[#7857FF]/5 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    How it works
                  </h3>

                  <ul className="space-y-2 text-sm text-gray-600">
                    {feature.howItWorks.map((step, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-[#7857FF] font-medium">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feature tabs */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <FeatureTab
                  label="Gasless Transfers"
                  active={activeFeature === 'transfers'}
                  onClick={() => setActiveFeature('transfers')}
                />
                <FeatureTab
                  label="USDC Subscriptions"
                  active={activeFeature === 'subscription'}
                  onClick={() => setActiveFeature('subscription')}
                />
                <FeatureTab
                  label="Gasless Swap"
                  active={activeFeature === 'swap'}
                  onClick={() => setActiveFeature('swap')}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-none">
                {feature.demo}
              </div>
            </div>

          </div>
          </section>

      </div>
    </div>
  )
  
}

/**
 * Feature tab button component
 * Displays a tab with active/inactive states for feature selection
 * 
 * @param label - Text displayed on the tab
 * @param active - Whether this tab is currently selected
 * @param onClick - Callback when tab is clicked
 */
function FeatureTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition
        ${
          active
            ? 'bg-[#7857FF] text-white border-[#7857FF]'
            : 'bg-white text-gray-700 border-gray-200 hover:border-[#7857FF]/40'
        }`}
    >
      {label}
    </button>
  )
}

