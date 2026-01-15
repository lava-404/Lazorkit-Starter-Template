/**
 * Swap Price API Route
 * 
 * GET /api/swap
 * 
 * Returns the current SOL/USDC exchange rate from Jupiter aggregator.
 * Used by the frontend to display swap prices and calculate USDC amounts.
 * Includes pool wallet configuration for swap completion.
 */

import { NextResponse } from 'next/server'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getNetworkTokens } from '@/config/lazorkit'

/**
 * Token metadata from Lazorkit configuration
 * Provides USDC mint address and decimals
 */
const { USDC } = getNetworkTokens()

/**
 * Jupiter aggregator API endpoint
 * Provides real-time token swap quotes and pricing
 */
const JUPITER_API = 'https://lite-api.jup.ag/swap/v1'
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const JUPITER_USDC_MAINNET =
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

/**
 * Pool wallet address from environment variables
 * Used to hold USDC reserves for swaps (no hardcoded addresses)
 */
const POOL_WALLET = process.env.NEXT_PUBLIC_USDC_POOL_WALLET?.trim()

/**
 * Fetches current SOL/USDC price from Jupiter aggregator
 * Queries for 1 SOL worth of USDC to get exchange rate
 * 
 * @returns SOL price in USDC (e.g., 150.50 means 1 SOL = $150.50 USDC)
 */
async function getSOLPrice(): Promise<number> {
  const response = await fetch(
    `${JUPITER_API}/quote?inputMint=${SOL_MINT}&outputMint=${JUPITER_USDC_MAINNET}&amount=${LAMPORTS_PER_SOL}&slippageBps=50`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch price from Jupiter')
  }

  const quote = await response.json()

  /**
   * Convert Jupiter response to USDC amount
   * Jupiter returns raw amount in USDC smallest units (6 decimals)
   * Divide by 10^6 to get human-readable USDC amount
   */
  return Number(quote.outAmount) / 10 ** USDC.decimals
}

/**
 * GET handler for swap price API
 * Returns current SOL price, USDC mint, and pool configuration
 * 
 * @returns JSON response with solPrice, usdcMint, poolWallet, and configured status
 */
export async function GET(): Promise<NextResponse> {
  try {
    const solPrice = await getSOLPrice()

    return NextResponse.json({
      solPrice,
      usdcMint: USDC.mint,
      poolWallet: POOL_WALLET,
      configured: Boolean(POOL_WALLET),
    })
  } catch (err) {
    console.error('Price API error:', err)

    return NextResponse.json(
      {
        error: 'Failed to fetch price',
        solPrice: 180, // safe fallback for UI
        usdcMint: USDC.mint,
        poolWallet: POOL_WALLET,
        configured: Boolean(POOL_WALLET),
      },
      { status: 500 }
    )
  }
}
