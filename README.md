# LazorKit Starter – Passkey Smart Wallet Demos

This project demonstrates how to build passkey-native smart wallets
and gasless transactions on Solana using LazorKit.

## ✨ Features
- Passkey-based wallet authentication
- Gasless SOL transfers (paymaster sponsored)
- Session persistence across devices
- On-chain notes demo

## 📘 Tutorials
- [How to create a passkey-based wallet](./tutorials/01-passkey-wallet.md)
- [How to trigger a gasless transaction](./tutorials/02-gasless-transaction.md)
- [How session persistence works](./tutorials/03-session-persistence.md)


# LazorKit Integration Guide

A comprehensive guide to integrating [LazorKit](https://lazorkit.com) - the easiest way to build gasless, user-friendly Solana dApps with passkey-based smart wallets.

## 🌟 What is LazorKit?

LazorKit is a **smart wallet infrastructure** for Solana that eliminates the biggest friction points in Web3:

- 🔑 **Passkey Authentication** - No seed phrases, no browser extensions
- ⛽ **Gasless Transactions** - Users never need SOL for fees
- 🎯 **Smart Wallets** - Program Derived Addresses (PDAs) with enhanced capabilities
- 🚀 **Instant Onboarding** - Users can transact in seconds, not hours

### Why LazorKit?

Traditional Solana dApps require users to:
1. Install a browser wallet extension
2. Save a 12-24 word seed phrase securely
3. Acquire SOL for transaction fees
4. Understand gas fees and priority fees

**LazorKit eliminates ALL of this** - users authenticate with biometrics (Face ID, Touch ID, Windows Hello) and transact immediately without holding SOL.

---

## 📦 Installation

```bash
npm install @lazorkit/wallet @solana/web3.js @solana/spl-token
```

---

## 🏗️ Core Integration Components

### 1. ConnectButton Component

The entry point for user authentication - handles the entire connection flow with passkey-based authentication.

#### Key LazorKit Features:

**Passkey Authentication:**
```typescript
import { useWallet } from '@lazorkit/wallet'

const { connect, isConnecting } = useWallet()

// Initiates biometric authentication with gasless mode
<button onClick={() => connect({ feeMode: 'paymaster' })}>
  {isConnecting ? 'Connecting…' : 'Connect Wallet'}
</button>
```

**What `feeMode: 'paymaster'` does:**
- Enables automatic fee sponsorship for all transactions
- Users never need SOL for gas fees
- Paymaster service covers all transaction costs

**Smart Wallet Access:**
```typescript
const { smartWalletPubkey, isConnected } = useWallet()

// smartWalletPubkey is a PDA (Program Derived Address), not a regular keypair
// This matters for token account derivation and advanced features
```

---

### 2. useSafeWallet Hook

A resilient wrapper that adds retry logic and timeout protection to LazorKit's transaction submission.

#### Why This Hook Matters:

**Automatic Retry with Exponential Backoff:**
```typescript
// Retries rate-limited requests automatically
// Delays: 1s → 2s → 4s between attempts
const isRateLimited = (err: unknown): boolean => {
  const msg = err.message.toLowerCase()
  return msg.includes('429') || 
         msg.includes('rate limit') || 
         msg.includes('too many requests')
}

// Only retries on rate limits, fails fast on other errors
if (isRateLimited(err) && attempt < TX_RETRY_POLICY.attempts - 1) {
  const delay = TX_RETRY_POLICY.backoffMs * Math.pow(2, attempt)
  await wait(delay)
  continue
}
```

**Timeout Protection:**
```typescript
// Prevents hanging transactions
const timeout = new Promise<never>((_, reject) => {
  timeoutId = setTimeout(() => {
    reject(new Error('Transaction timed out'))
  }, TX_RETRY_POLICY.timeoutMs)
})

// Race between transaction and timeout
const result = await Promise.race([
  wallet.signAndSendTransaction(args),
  timeout,
])
```

**Submission State Tracking:**
```typescript
const { signAndSendTransaction, isSubmitting } = useSafeWallet()

// Use isSubmitting for loading indicators and button states
<button disabled={isSubmitting}>
  {isSubmitting ? 'Sending…' : 'Send'}
</button>
```

---

### 3. ClientPolyfills Component

Provides browser compatibility for Solana's cryptographic libraries.

#### Why Buffer Polyfill is Required:

```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    window.Buffer = window.Buffer || require('buffer').Buffer
  }
}, [])
```

**The Problem:**
- Solana SDK uses Node.js `Buffer` for cryptographic operations
- `Buffer` is a Node.js global, not available in browsers
- Required for transaction serialization, keypair operations

**The Solution:**
- Polyfill adds Buffer to browser's window object
- Must be loaded before any Solana operations
- Place in root layout for app-wide availability

---

## 🔧 Configuration

### Network & Retry Policy

```typescript
// config/lazorkit.ts
export const CURRENT_NETWORK = {
  name: 'devnet',
  rpcEndpoint: 'https://api.devnet.solana.com',
}

export const TX_RETRY_POLICY = {
  attempts: 3,        // Max retry attempts for rate limits
  backoffMs: 1000,    // Base delay (exponential: 1s, 2s, 4s)
  timeoutMs: 30000,   // 30 second timeout per attempt
}
```

---

## 🎯 Complete Transaction Flow

### How Gasless Transactions Work

```
User Action → Build Instructions → signAndSendTransaction
                                         ↓
                    ┌────────────────────┴─────────────────────┐
                    │       LazorKit Magic                     │
                    │  1. User signs with biometrics           │
                    │  2. Submit to paymaster                  │
                    │  3. Paymaster sponsors fees              │
                    │  4. Transaction lands on-chain           │
                    └──────────────────────────────────────────┘
```

### Example: Gasless SOL Transfer

```typescript
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useSafeWallet } from '@/hooks/useSafeWallet'
import { useWallet } from '@lazorkit/wallet'

const { smartWalletPubkey } = useWallet()
const { signAndSendTransaction } = useSafeWallet()

// 1️⃣ Build standard Solana instruction (no special gasless code!)
const instruction = SystemProgram.transfer({
  fromPubkey: smartWalletPubkey,
  toPubkey: new PublicKey(recipient),
  lamports: amount * LAMPORTS_PER_SOL,
})

// 2️⃣ Submit via LazorKit - automatic fee sponsorship + retry logic
const signature = await signAndSendTransaction({
  instructions: [instruction],
})
```

**Key Insight:** You write standard Solana instructions. LazorKit handles the gasless magic automatically.

---

## 🔑 Critical: Smart Wallet (PDA) Considerations

### The Most Important Thing to Know

LazorKit smart wallets are **Program Derived Addresses (PDAs)**, not regular Ed25519 keypairs. This has ONE critical implication for token operations:

```typescript
import { getAssociatedTokenAddress } from '@solana/spl-token'

// ❌ WRONG - Fails for smart wallets
const ata = await getAssociatedTokenAddress(
  tokenMint,
  smartWalletPubkey,
  false  // Assumes on-curve Ed25519 key
)

// ✅ CORRECT - Works for smart wallets
const ata = await getAssociatedTokenAddress(
  tokenMint,
  smartWalletPubkey,
  true   // allowOwnerOffCurve = true for PDAs
)
```

**Why This Matters:**
- Token account derivation uses different math for PDAs vs regular keys
- Without `allowOwnerOffCurve: true`, your token operations will fail
- **Always set this flag to `true` when working with LazorKit wallets**

---

## 📊 Common Integration Patterns

### Pattern 1: Token Approvals (Subscriptions)

```typescript
import { createApproveInstruction } from '@solana/spl-token'

// Get user's token account (remember: allowOwnerOffCurve = true!)
const ata = await getAssociatedTokenAddress(USDC_MINT, smartWalletPubkey, true)

// Create approval instruction
const approveIx = createApproveInstruction(
  ata,                 // user's token account
  SERVICE_WALLET,      // delegate (your service)
  smartWalletPubkey,   // owner
  amount               // how much service can spend
)

// Submit gasless
await signAndSendTransaction({ instructions: [approveIx] })
```

### Pattern 2: Error Handling with Retry Logic

```typescript
try {
  const signature = await signAndSendTransaction({ instructions })
  // Success!
} catch (err) {
  // useSafeWallet already retried rate limits automatically
  // Only user-actionable errors reach here
  if (err.message.includes('Insufficient')) {
    alert('Insufficient balance')
  } else {
    alert('Transaction failed: ' + err.message)
  }
}
```

---

## 🚀 Integration Checklist

### Setup Phase
- [ ] Install `@lazorkit/wallet` and dependencies
- [ ] Add `ClientPolyfills` to root layout
- [ ] Configure network and retry policy

### Component Phase
- [ ] Add `ConnectButton` with `feeMode: 'paymaster'`
- [ ] Use `useSafeWallet()` for all transactions
- [ ] Track submission state with `isSubmitting`

### Transaction Phase
- [ ] Build standard Solana instructions
- [ ] **Always use `allowOwnerOffCurve: true`** for token accounts
- [ ] Submit via `signAndSendTransaction`
- [ ] Handle errors appropriately

---

## 🎓 Key Takeaways

### What LazorKit Handles

✅ Passkey authentication (no seed phrases)  
✅ Fee sponsorship (users never need SOL)  
✅ Smart wallet management (PDA lifecycle)  
✅ Transaction submission (with our retry wrapper)  

### What You Control

🎯 Business logic and transaction flow  
🎯 UI/UX design  
🎯 Standard Solana instruction building  
🎯 Error handling and user feedback  

### The Magic

```typescript
// You write this (standard Solana):
const ix = SystemProgram.transfer({ ... })

// LazorKit does this:
// • User signs with Face ID/Touch ID
// • Paymaster sponsors gas fees
// • Transaction succeeds instantly
// • No SOL needed!
```

---

## 📚 Additional Resources

- **LazorKit Docs**: [https://docs.lazorkit.com](https://docs.lazorkit.com)
- **Example Components**: See gasless swap, transfer, and subscription examples in this repo
- **Solana Docs**: [https://docs.solana.com](https://docs.solana.com)

---

**Built with [LazorKit](https://lazorkit.com)** - Making Solana accessible to everyone

## 🚀 Quick Start
```bash
pnpm install
pnpm dev
