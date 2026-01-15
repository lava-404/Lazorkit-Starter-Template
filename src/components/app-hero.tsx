/**
 * Hero Section Component
 * 
 * Main landing page hero section with marketing content, CTAs, and code examples.
 * Displays passkey smart wallet value proposition with animated visual card.
 */

import { ArrowRight, Github, Shield, Wallet, Sparkles } from "lucide-react";
import AppHeroCard from "./app-hero-card";

/**
 * Hero section component
 * Displays marketing content, call-to-action buttons, and installation instructions
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-[#7857FF]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-purple-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left column */}
        <div>
          {/* Feature badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-gray-200 text-xs sm:text-sm text-gray-700">
            <span className="px-2 py-0.5 rounded-full bg-[#7857FF] text-white text-xs">
              New
            </span>
            Passkey smart-wallet SDK for Solana
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-4xl lg:text-6xl font-bold leading-tight text-gray-900 mb-5">
            <span className="text-[#7857FF]">Smart Wallets.</span>
            <br />
            Powered by Passkeys.
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-lg text-gray-600 max-w-xl mb-8">
            A clean, real-world starter template demonstrating passkey
            authentication and gasless smart wallet flows using LazorKit.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#7857FF] text-white font-medium hover:bg-[#6b4df5] transition">
              Explore Docs
              <ArrowRight className="w-4 h-4" />
            </button>

            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition">
              <Github className="w-4 h-4" />
              View on GitHub
            </button>
          </div>

          {/* Code block */}
          <div className="mt-8 sm:mt-10">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-400 ml-2 font-mono">
                  terminal
                </span>
              </div>

              <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm">
                <div className="flex items-start gap-2 mb-3 break-all">
                  <span className="text-green-400">➜</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-gray-300">
                    git clone https://github.com/lazorkit/starter-template
                  </span>
                </div>
                <div className="flex items-start gap-2 break-all">
                  <span className="text-green-400">➜</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-gray-300">
                    npm install && npm run dev
                  </span>
                  <span className="animate-pulse text-gray-400">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full flex justify-center lg:justify-end">
          <AppHeroCard />
        </div>
      </div>
    </section>
  )
}

