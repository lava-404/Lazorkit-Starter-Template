Gasless Swap with LazorKit (SOL → USDC)

This tutorial explains how to build a gasless token swap flow on Solana using LazorKit smart wallets.

Users can:

Authenticate with passkeys

Sign transactions without holding SOL for fees

Swap SOL → USDC with paymaster-sponsored gas

This demo uses LazorKit for wallet management and transaction signing, while delegating price discovery and settlement to a backend.

What you’ll build

A gasless swap UI where:

Users input a SOL amount

A price quote is fetched

The user signs one gasless transaction

USDC is delivered after confirmation

Prerequisites

LazorKit configured in your app

A deployed USDC pool wallet (backend-controlled)

Backend endpoints:

/api/swap → returns SOL/USDC price

/api/swap/complete → sends USDC to user

Step 1: Access the LazorKit smart wallet

LazorKit exposes the user’s smart wallet public key and connection state.

import { useWallet } from '@lazorkit/wallet'

const { smartWalletPubkey, isConnected } = useWallet()


This wallet:

Is passkey-authenticated

Requires no seed phrase

Can sign transactions without SOL

Step 2: Use LazorKit’s gasless transaction wrapper

Instead of using sendTransaction directly, LazorKit provides a safe wrapper that:

Sponsors fees via a paymaster

Handles retries and blockhash refresh

Works with passkey signatures

import { useSafeWallet } from '@/hooks/useSafeWallet'

const { signAndSendTransaction } = useSafeWallet()


This is the key enabler of gasless UX.

Step 3: Fetch a swap quote (off-chain)

Price discovery is handled off-chain (e.g. Jupiter, custom oracle).

const res = await fetch('/api/swap')
const data = await res.json()

setQuote({
  rate: data.solPrice,
  usdcAmount: sol * data.solPrice,
})


Why off-chain?

Faster UX

No unnecessary on-chain compute

Cleaner separation of concerns

Step 4: Build the SOL transfer instruction

The only on-chain instruction the user signs is a SOL transfer
from their smart wallet → your USDC pool wallet.

import { SystemProgram } from '@solana/web3.js'

const ix = SystemProgram.transfer({
  fromPubkey: smartWalletPubkey,
  toPubkey: poolWallet,
  lamports,
})


This keeps signing minimal and secure.

Step 5: Sign & send gaslessly with LazorKit

This is where LazorKit shines ✨

const signature = await signAndSendTransaction({
  instructions: [ix],
})


What happens under the hood:

LazorKit injects a fresh blockhash

Paymaster covers gas fees

User signs via passkey

Transaction is retried if needed

User never pays gas.

Step 6: Complete the swap (backend)

Once the SOL transfer is confirmed, the backend:

Verifies the SOL transaction

Sends USDC → user wallet

await fetch('/api/swap/complete', {
  method: 'POST',
  body: JSON.stringify({
    userWallet: smartWalletPubkey.toString(),
    solAmount,
    solTxSignature: signature,
  }),
})


This keeps:

Liquidity custody server-side

Client logic simple

Attack surface minimal

Step 7: Show the transaction

Use LazorKit helpers to link users to the explorer.

import { txExplorerUrl } from '@/config/lazorkit'

<a href={txExplorerUrl(txSig)} target="_blank">
  View transaction
</a>

Why LazorKit matters here

Without LazorKit, this flow would require:

Browser wallet extensions

Users holding SOL

Manual fee management

Worse mobile UX

With LazorKit:

✅ Passkey authentication

✅ Gasless signing

✅ Mobile-first UX

✅ Clean retry & simulation handling

Summary

You built a real-world gasless swap by combining:

LazorKit smart wallets

Paymaster-sponsored transactions

Minimal on-chain instructions

Backend settlement logic

This pattern scales to:

Subscriptions

In-app purchases

DeFi onboarding

Web2-style crypto UX