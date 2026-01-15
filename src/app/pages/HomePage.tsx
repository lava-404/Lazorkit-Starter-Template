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
    subtitle: 'Swap tokens without holding SOL. Fees are sponsored via smart wallets.',
    cta: 'Explore gasless swaps',
    demo: <GaslessTransfer />,
  },
  subscription: {
    title: 'USDC Subscriptions',
    subtitle: 'Automated recurring USDC billing powered by smart wallet authorization.',
    cta: 'View subscription flow',
    demo: <SubscriptionComponent/>
  },
  swap: {
    title: 'Gasless Swap',
    subtitle: 'A passkey-authenticated notes app demonstrating gasless signing.',
    cta: 'Explore notes app',
    demo: <GaslessSwap />
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
    return <div>Please connect your wallet</div>
  }

  

  return (
    <div>
      <div
        id="demo-section"
        className="border-t border-gray-200"
      >
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Left column */}
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h2>
  
              <p className="text-sm sm:text-base text-gray-600 max-w-xl mb-6 sm:mb-8">
                {feature.subtitle}
              </p>
  
              {/* Wallet balance */}
              <div className="mb-6 sm:mb-10">
                <BalanceCard />
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
  
            {/* Right column (demo) */}
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

