/**
 * Template Features Component
 * 
 * Displays a grid of feature cards showcasing Lazorkit capabilities.
 * Highlights gasless swaps, message signing, subscriptions, and smart wallet features.
 */

import {
  ArrowRight,
  Repeat,
  MessageSquareText,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'


/**
 * Feature showcase section component
 * Renders a grid of feature cards with icons and descriptions
 */
export default function TemplateFeatures() {
  return (
    <section id="features" className="pt-0 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header with title and description */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Built for developers
          </h2>
          <p className="text-lg text-gray-600">
            Explore real-world features implemented using LazorKit's
            passkey-native smart wallets.
          </p>
        </div>

        {/* Responsive feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gasless Swap feature card */}
          <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-[#7857FF]/10 flex items-center justify-center mb-4">
              <Repeat className="w-5 h-5 text-[#7857FF]" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gasless Swap
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Token swaps powered by smart wallets with transaction fees
              sponsored via paymaster.
            </p>

            
              <button
                onClick={() => {
                  const el = document.getElementById('features')
                  el?.scrollIntoView({ behavior: 'smooth' })

                  window.dispatchEvent(
                    new CustomEvent('select-demo', {
                      detail: { feature: 'swap', scroll: true },
                    })
                  )
                  
                }}
                className="flex items-center gap-1 text-sm font-medium text-[#7857FF] hover:underline"
              >
                View demo
                <ArrowRight className="w-4 h-4" />
              </button>

            
          </div>

          {/* Message signing feature card */}
          <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-[#7857FF]/10 flex items-center justify-center mb-4">
              <MessageSquareText className="w-5 h-5 text-[#7857FF]" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign & Send Messages
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              A passkey-authenticated notes app demonstrating gasless
              signing and message submission on Solana.
            </p>

            
            <div
              className="flex items-center gap-1 text-sm font-medium text-[#7857FF] cursor-pointer hover:underline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()

                window.dispatchEvent(
                  new CustomEvent('select-demo', {
                    detail: { feature: 'notes', scroll: true },
                  })
                )
              }}
            >
              Explore example dApp
              <ArrowRight className="w-4 h-4" />
            </div>

            

          </div>

          {/* Subscription billing feature card */}
          <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-[#7857FF]/10 flex items-center justify-center mb-4">
              <CreditCard className="w-5 h-5 text-[#7857FF]" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              USDC Subscriptions
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Automated recurring USDC billing on Solana, powered by
              smart wallet authorization.
            </p>

            
            <div
              className="flex items-center gap-1 text-sm font-medium text-[#7857FF] cursor-pointer hover:underline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()

                window.dispatchEvent(
                  new CustomEvent('select-demo', {
                    detail: { feature: 'subscription', scroll: true },
                  })
                )
              }}
            >
              View subscription flow
              <ArrowRight className="w-4 h-4" />
            </div>

            

          </div>

          {/* Smart wallet core feature card */}
          <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-[#7857FF]/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-[#7857FF]" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Wallet Core
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Passkey-bound smart wallets with on-chain verification,
              session control, and upgradeable logic.
            </p>

            <div className="flex items-center gap-1 text-sm font-medium text-[#7857FF] hover:underline cursor-pointer">
              Learn more
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
