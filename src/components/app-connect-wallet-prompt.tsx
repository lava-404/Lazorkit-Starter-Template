'use client'

import { Wallet } from 'lucide-react'
import { useWallet } from '@lazorkit/wallet'

export default function ConnectWalletStrip() {
  const { connect, isConnecting } = useWallet()

  return (
    <div className="relative w-full overflow-hidden border-2 border-[#7857FF]/30 bg-gradient-to-br from-[#7857FF]/10 via-white to-[#7857FF]/10 px-6 py-16 sm:py-20 mb-10">
      {/* Animated liquid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7857FF]/5 via-transparent to-[#7857FF]/5" />
        
        <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            </filter>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7857FF" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#7857FF" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#7857FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Multiple flowing wave layers */}
          <g filter="url(#goo)">
            <ellipse fill="#7857FF" opacity="0.15" cx="10%" cy="30%" rx="15%" ry="20%">
              <animate attributeName="cx" dur="20s" repeatCount="indefinite" values="10%;90%;10%" />
              <animate attributeName="cy" dur="15s" repeatCount="indefinite" values="30%;70%;30%" />
            </ellipse>
            <ellipse fill="#FFFFFF" opacity="0.2" cx="90%" cy="70%" rx="18%" ry="25%">
              <animate attributeName="cx" dur="25s" repeatCount="indefinite" values="90%;10%;90%" />
              <animate attributeName="cy" dur="18s" repeatCount="indefinite" values="70%;30%;70%" />
            </ellipse>
            <ellipse fill="#7857FF" opacity="0.18" cx="50%" cy="50%" rx="20%" ry="22%">
              <animate attributeName="cx" dur="22s" repeatCount="indefinite" values="50%;30%;70%;50%" />
              <animate attributeName="cy" dur="20s" repeatCount="indefinite" values="50%;30%;70%;50%" />
            </ellipse>
            <ellipse fill="#FFFFFF" opacity="0.15" cx="70%" cy="40%" rx="16%" ry="18%">
              <animate attributeName="cx" dur="18s" repeatCount="indefinite" values="70%;20%;80%;70%" />
              <animate attributeName="cy" dur="16s" repeatCount="indefinite" values="40%;60%;35%;40%" />
            </ellipse>
            <ellipse fill="#7857FF" opacity="0.2" cx="30%" cy="60%" rx="14%" ry="20%">
              <animate attributeName="cx" dur="23s" repeatCount="indefinite" values="30%;80%;25%;30%" />
              <animate attributeName="cy" dur="19s" repeatCount="indefinite" values="60%;40%;65%;60%" />
            </ellipse>
          </g>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center justify-center gap-8">
        
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-[#7857FF]/40 border-2 border-[#7857FF]/20">
          <Wallet className="h-10 w-10 text-[#7857FF]" />
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Connect Your Wallet
          </h2>
          <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto">
            Unlock gasless transfers, seamless swaps, and automatic subscriptions with your smart wallet
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => connect()}
          disabled={isConnecting}
          className={`
            relative overflow-hidden rounded-xl px-8 py-4 text-base font-bold text-white
            transition-all duration-300 shadow-2xl shadow-[#7857FF]/50
            ${
              isConnecting
                ? 'bg-[#7857FF]/60 cursor-not-allowed scale-95'
                : 'bg-[#7857FF] hover:shadow-[#7857FF]/60 hover:scale-105 active:scale-100'
            }
          `}
        >
          <span className="relative z-10">
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </span>
          {!isConnecting && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="absolute inset-0 bg-[#6b4df5] opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}