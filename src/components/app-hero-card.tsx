/**
 * Hero Card Component
 * 
 * Animated visual component displaying passkey authentication features.
 * Shows a fingerprint icon with floating animations and security badges
 * to illustrate WebAuthn-based smart wallet authentication.
 */

import { ShieldCheck, KeyRound, CircleCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Animated passkey visual component
 * Displays fingerprint icon with floating, rotating, and sliding animations
 * to demonstrate passkey-bound smart wallet security
 */
export default function PasskeyVisualComponent() {
  const [floatOffset, setFloatOffset] = useState(0);
  const [rotateOffset, setRotateOffset] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);

  /**
   * Animation loop using requestAnimationFrame
   * Creates smooth floating, rotating, and sliding effects
   */
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame += 0.02;
      setFloatOffset(Math.sin(frame) * 6);
      setRotateOffset(Math.sin(frame * 0.5) * 0.8);
      setSlideOffset(Math.sin(frame * 0.7) * 8);
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div className="relative z-10 grid h-full w-full place-items-center min-h-[400px] p-8">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-12 w-full max-w-md">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Main fingerprint icon with vertical floating animation */}
            <div 
              className="grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-lg ring-1 ring-neutral-200"
              style={{ transform: `translateY(${floatOffset}px)` }}
            >
              <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
                <defs>
                  <linearGradient id="fp" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7857ff" stopOpacity="1"></stop>
                    <stop offset="100%" stopColor="#a99aff" stopOpacity="1"></stop>
                  </linearGradient>
                </defs>
                <path 
                  d="M32 8c-9.94 0-18 8.06-18 18" 
                  stroke="url(#fp)" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                ></path>
                <path 
                  d="M14 34c0-9.94 8.06-18 18-18s18 8.06 18 18" 
                  stroke="url(#fp)" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                ></path>
                <path 
                  d="M20 42c0-6.63 5.37-12 12-12s12 5.37 12 12" 
                  stroke="url(#fp)" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                ></path>
                <path 
                  d="M24 50c0-4.42 3.58-8 8-8s8 3.58 8 8" 
                  stroke="url(#fp)" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeLinecap="round"
                ></path>
              </svg>
            </div>

            {/* Security shield icon with rotation animation */}
            <div 
              className="absolute -right-6 -top-6 grid h-12 w-12 place-items-center rounded-xl bg-white shadow ring-1 ring-neutral-200"
              style={{ transform: `rotate(${rotateOffset}deg)` }}
            >
              <ShieldCheck className="h-6 w-6 text-[#7857FF]" strokeWidth={2} />
            </div>

            {/* Key icon with horizontal sliding animation */}
            <div 
              className="absolute -left-6 -bottom-6 grid h-12 w-12 place-items-center rounded-xl bg-white shadow ring-1 ring-neutral-200"
              style={{ transform: `translateX(${slideOffset}px)` }}
            >
              <KeyRound className="h-6 w-6 text-[#7857FF]" strokeWidth={2} />
            </div>
          </div>

          {/* Verification badge text */}
          <div className="text-center mt-8">
            <p className="text-sm text-neutral-600">WebAuthn verified</p>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
              <CircleCheck className="h-3.5 w-3.5 text-[#7857FF]" strokeWidth={2} />
              Passkey bound smart wallet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}