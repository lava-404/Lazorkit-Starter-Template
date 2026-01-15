/**
 * Client Polyfills Component
 * 
 * Provides browser polyfills required for Solana and crypto libraries.
 * Ensures Buffer is available in the browser environment for Web3 operations.
 */

'use client'

import { useEffect } from 'react'

/**
 * Client-side polyfill component
 * Adds Buffer polyfill to window object for Solana SDK compatibility
 * Required because Buffer is a Node.js global not available in browsers
 */
function ClientPolyfills() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.Buffer = window.Buffer || require('buffer').Buffer
    }
  }, [])

  return null
}

export default ClientPolyfills;
