/**
 * Swap Completion API Route
 * 
 * POST /api/swap/complete
 * 
 * Completes a SOL → USDC swap transaction by:
 * 1. Verifying the user's SOL payment transaction signature
 * 2. Fetching the current SOL/USDC exchange rate from Jupiter
 * 3. Calculating USDC amount based on SOL received
 * 4. Sending USDC from the pool wallet to the user's Associated Token Account
 * 
 * This is a server-side operation that requires pool wallet keypair
 * to sign the USDC transfer transaction.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { getNetworkTokens, LAZORKIT_CONFIG } from '@/config/lazorkit'

// Token metadata from Lazorkit
const { USDC } = getNetworkTokens()

// Jupiter price API
const JUPITER_API = 'https://lite-api.jup.ag/swap/v1'
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const JUPITER_USDC_MAINNET =
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'


// Pool config (NO hardcoded addresses)
const POOL_KEYPAIR_BASE64 = process.env.USDC_POOL_KEYPAIR?.trim()
const POOL_SOL_WALLET = process.env.NEXT_PUBLIC_USDC_POOL_WALLET?.trim() as string
const POOL_USDC_ACCOUNT = process.env.USDC_POOL_TOKEN_ACCOUNT?.trim() as string


interface CompleteSwapRequest {
  userWallet: string
  solAmount: number
  solTxSignature: string
}

// Fetch SOL → USDC price
async function getSOLPrice(): Promise<number> {
  const res = await fetch(
    `${JUPITER_API}/quote?inputMint=${SOL_MINT}&outputMint=${JUPITER_USDC_MAINNET}&amount=${LAMPORTS_PER_SOL}&slippageBps=50`
  )

  if (!res.ok) throw new Error('Failed to fetch price')

  const quote = await res.json()
  return Number(quote.outAmount) / 10 ** USDC.decimals
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userWallet, solAmount, solTxSignature }: CompleteSwapRequest =
      await req.json()

    if (!userWallet || !solAmount || solAmount <= 0 || !solTxSignature) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!POOL_KEYPAIR_BASE64 || !POOL_SOL_WALLET || !POOL_USDC_ACCOUNT) {
      return NextResponse.json(
        { error: 'Pool not configured' },
        { status: 500 }
      )
    }

    const connection = new Connection(LAZORKIT_CONFIG.rpcUrl, 'confirmed')

    // ─── 1️⃣ Verify SOL payment ────────────────────────────────
    let confirmed = false
    for (let i = 0; i < 5; i++) {
      const status = await connection.getSignatureStatus(solTxSignature)
      if (status.value && !status.value.err) {
        confirmed = true
        break
      }
      await new Promise(r => setTimeout(r, 2000))
    }

    if (!confirmed) {
      return NextResponse.json(
        { error: 'SOL transaction not confirmed' },
        { status: 400 }
      )
    }

    // ─── 2️⃣ Calculate USDC amount ─────────────────────────────
    const solPrice = await getSOLPrice()
    const usdcAmount = solAmount * solPrice
    const usdcRaw = BigInt(Math.floor(usdcAmount * 10 ** USDC.decimals))

    // ─── 3️⃣ Prepare token transfer ────────────────────────────
    const poolKeypair = Keypair.fromSecretKey(
      Buffer.from(POOL_KEYPAIR_BASE64, 'base64')
    )

    const userPubkey = new PublicKey(userWallet)
    const usdcMint = new PublicKey(USDC.mint)
    const poolTokenAccount = new PublicKey(POOL_USDC_ACCOUNT)

    // User’s USDC ATA (PDA wallets need allowOwnerOffCurve=true)
    const userATA = await getAssociatedTokenAddress(
      usdcMint,
      userPubkey,
      true
    )

    const tx = new Transaction()

    // Create ATA if missing
    try {
      await getAccount(connection, userATA)
    } catch {
      tx.add(
        createAssociatedTokenAccountInstruction(
          poolKeypair.publicKey,
          userATA,
          userPubkey,
          usdcMint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    // Transfer USDC
    tx.add(
      createTransferInstruction(
        poolTokenAccount,
        userATA,
        poolKeypair.publicKey,
        usdcRaw
      )
    )

    // ─── 4️⃣ Send transaction ─────────────────────────────────
    const signature = await sendAndConfirmTransaction(
      connection,
      tx,
      [poolKeypair],
      { commitment: 'confirmed' }
    )

    return NextResponse.json({
      success: true,
      signature,
      usdcAmount,
      solPrice,
    })
  } catch (err) {
    console.error('Swap completion error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Swap failed' },
      { status: 500 }
    )
  }
}
