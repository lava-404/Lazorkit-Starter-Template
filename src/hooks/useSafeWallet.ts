/**
 * useSafeWallet Hook
 * 
 * Wraps the Lazorkit wallet with retry logic and timeout handling.
 * Provides automatic retry for rate-limited requests with exponential backoff.
 * Includes transaction timeout protection and submission state tracking.
 */

import { useWallet } from '@lazorkit/wallet'
import { useCallback, useState } from 'react'
import { TX_RETRY_POLICY } from '../config/lazorkit'

/**
 * Utility function to wait for a specified number of milliseconds
 * Used for exponential backoff delays between retry attempts
 * 
 * @param ms - Milliseconds to wait
 */
const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * Checks if an error indicates rate limiting
 * Detects common rate limit error messages from API responses
 * 
 * @param err - Error object to check
 * @returns True if error indicates rate limiting
 */
const isRateLimited = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('throttle')
  )
}

/**
 * Safe wallet hook with retry and timeout logic
 * Wraps wallet.signAndSendTransaction with automatic retries for rate limits
 * Includes timeout protection and submission state tracking
 * 
 * @returns Wallet object with enhanced signAndSendTransaction and isSubmitting state
 */
export function useSafeWallet() {
  const wallet = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Enhanced signAndSendTransaction with retry logic
   * Automatically retries on rate limit errors with exponential backoff
   * Includes timeout protection to prevent hanging requests
   * 
   * @param args - Transaction arguments passed to wallet.signAndSendTransaction
   * @returns Transaction signature string
   * @throws Error if all retry attempts fail or transaction times out
   */
  const signAndSendWithRetry = useCallback(
    async (
      args: Parameters<typeof wallet.signAndSendTransaction>[0]
    ): Promise<string> => {
      let lastError: Error | null = null
      setIsSubmitting(true)

      try {
        /**
         * Retry loop with configurable attempts
         * Retries only on rate limit errors, fails immediately on other errors
         */
        for (let attempt = 0; attempt < TX_RETRY_POLICY.attempts; attempt++) {
          let timeoutId: ReturnType<typeof setTimeout> | undefined

          try {
            /**
             * Timeout promise to prevent hanging requests
             * Rejects if transaction takes longer than configured timeout
             */
            const timeout = new Promise<never>((_, reject) => {
              timeoutId = setTimeout(() => {
                reject(
                  new Error(
                    'Transaction submission timed out. It may still be processing.'
                  )
                )
              }, TX_RETRY_POLICY.timeoutMs)
            })

            /**
             * Race between transaction submission and timeout
             * Returns whichever completes first
             */
            const result = await Promise.race([
              wallet.signAndSendTransaction(args),
              timeout,
            ])

            if (timeoutId) clearTimeout(timeoutId)

            /**
             * Handle different response formats
             * Supports both string signatures and object responses
             */
            if (typeof result === 'string') return result

            if (
              typeof result === 'object' &&
              result !== null &&
              'signature' in result
            ) {
              return (result as any).signature
            }

            throw new Error('Unexpected wallet response')
          } catch (err) {
            if (timeoutId) clearTimeout(timeoutId)

            lastError =
              err instanceof Error
                ? err
                : new Error(String(err))

            /**
             * Retry logic for rate limit errors
             * Uses exponential backoff: delay = baseDelay * 2^attempt
             * Only retries if not on the last attempt
             */
            if (
              isRateLimited(err) &&
              attempt < TX_RETRY_POLICY.attempts - 1
            ) {
              const delay =
                TX_RETRY_POLICY.backoffMs * Math.pow(2, attempt)
              
              await wait(delay)
              continue
            }

            /**
             * Break on non-rate-limit errors or final attempt
             * Allows error to propagate to outer catch block
             */
            break
          }
        }

        /**
         * Final error handling
         * Provides user-friendly message for rate limit exhaustion
         */
        if (isRateLimited(lastError)) {
          throw new Error(
            'Wallet service is temporarily rate limited. Please wait a moment and try again.'
          )
        }

        throw lastError ?? new Error('Transaction failed')
      } finally {
        setIsSubmitting(false)
      }
    },
    [wallet]
  )

  return {
    ...wallet,
    signAndSendTransaction: signAndSendWithRetry,
    isSubmitting, // Exposes submission state for UI loading indicators
  }
}
