# Gasless Swap with LazorKit

A Next.js implementation demonstrating **gasless token swaps** on Solana using [LazorKit's wallet infrastructure](https://lazorkit.com). This example shows how to build a user-friendly swap interface where users can exchange SOL for USDC without paying gas fees.

## ✨ Features

- 🔗 **LazorKit Wallet Integration** - Seamless smart wallet connection
- ⛽ **Gasless Transactions** - Users swap without holding SOL for gas
- 💱 **Real-time Price Quotes** - Live exchange rates via Jupiter API
- 🔄 **Atomic Swaps** - Secure SOL → USDC exchanges
- 📊 **Balance Tracking** - Real-time SOL and USDC balance updates
- 🌐 **Network Aware** - Configurable for mainnet/devnet

## 🚀 Quick Start

### Prerequisites

```bash
npm install @lazorkit/wallet @solana/web3.js
```

### Environment Variables

```env
NEXT_PUBLIC_USDC_POOL_WALLET=your_pool_wallet_address
```

## 📖 LazorKit Integration Guide

### 1. Wallet Connection

Use LazorKit's `useWallet` hook to access the user's smart wallet:

```typescript
import { useWallet } from '@lazorkit/wallet'

const { smartWalletPubkey, isConnected } = useWallet()
```

**Key Features:**
- `smartWalletPubkey` - User's smart wallet public key
- `isConnected` - Connection state tracking

### 2. Transaction Signing

Implement gasless transactions using LazorKit's transaction signing:

```typescript
import { useSafeWallet } from '@/hooks/useSafeWallet'
import { SystemProgram } from '@solana/web3.js'

const { signAndSendTransaction } = useSafeWallet()

// Create transfer instruction
const ix = SystemProgram.transfer({
  fromPubkey: smartWalletPubkey,
  toPubkey: poolWallet,
  lamports: Math.floor(parseFloat(solAmount) * 1_000_000_000),
})

// Sign and send without gas fees
const signature = await signAndSendTransaction({
  instructions: [ix],
})
```

### 3. Network Configuration

Configure token addresses for different networks:

```typescript
import { getNetworkTokens, CURRENT_NETWORK } from '@/config/lazorkit'

const tokens = getNetworkTokens()

export const USDC_CONFIG = {
  symbol: tokens.USDC.symbol,
  mintAddress: tokens.USDC.mint,
  decimals: tokens.USDC.decimals,
  poolWallet: process.env.NEXT_PUBLIC_USDC_POOL_WALLET || '',
}
```

### 4. Balance Monitoring

Track user balances with LazorKit-compatible hooks:

```typescript
const { solBalance, usdcBalance, isLoading, refresh } = useWalletBalance(address)

// Refresh after transactions
await refresh()
```

### 5. Transaction Explorer Links

Generate network-aware explorer URLs:

```typescript
import { txExplorerUrl } from '@/config/lazorkit'

<a href={txExplorerUrl(signature)} target="_blank">
  View transaction
</a>
```

## 🔧 Core Implementation

### Complete Swap Flow

```typescript
const handleSwap = async () => {
  if (!smartWalletPubkey || !quote || !isConnected) return

  try {
    setTxState('swapping')
    
    const poolWallet = new PublicKey(USDC_CONFIG.poolWallet)
    const lamports = Math.floor(parseFloat(solAmount) * 1_000_000_000)

    // 1️⃣ User sends SOL → pool (gasless via LazorKit)
    const ix = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: poolWallet,
      lamports,
    })

    setTxState('confirming')

    const signature = await signAndSendTransaction({
      instructions: [ix],
    })

    // 2️⃣ Backend sends USDC → user
    const res = await fetch('/api/swap/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userWallet: smartWalletPubkey.toString(),
        solAmount: parseFloat(solAmount),
        solTxSignature: signature,
      }),
    })

    const data = await res.json()
    setTxSig(data.signature || signature)
    setTxState('success')
    
    await refresh() // Update balances
  } catch (err) {
    setTxState('error')
    setError(err instanceof Error ? err.message : 'Swap failed')
  }
}
```

### Real-time Price Quotes

```typescript
const fetchQuote = useCallback(async (amount: string) => {
  if (!amount || parseFloat(amount) <= 0) {
    setQuote(null)
    return
  }

  try {
    setTxState('quoting')
    const res = await fetch('/api/swap')
    const data = await res.json()

    const sol = parseFloat(amount)
    setQuote({
      rate: data.solPrice,
      usdcAmount: sol * data.solPrice,
    })

    setTxState('idle')
  } catch (e) {
    setError('Failed to fetch price')
  }
}, [])

// Debounced quote fetching
useEffect(() => {
  const t = setTimeout(() => fetchQuote(solAmount), 500)
  return () => clearTimeout(t)
}, [solAmount, fetchQuote])
```

## 🎯 Transaction States

The component handles multiple transaction states for smooth UX:

| State | Description |
|-------|-------------|
| `idle` | Ready for swap |
| `quoting` | Fetching live prices |
| `swapping` | User signing transaction |
| `confirming` | Transaction confirming on-chain |
| `success` | Swap completed |
| `error` | Error occurred |

## 🔒 Security Features

- ✅ Balance validation before transactions
- ✅ Error handling for failed swaps
- ✅ Smart wallet verification via LazorKit
- ✅ Secure transaction signing

## 📦 Dependencies

```json
{
  "@lazorkit/wallet": "latest",
  "@solana/web3.js": "^1.x.x",
  "lucide-react": "latest",
  "next": "14.x.x",
  "react": "^18.x.x"
}
```

## 🌐 Network Support

Works seamlessly across Solana networks:
- ✅ Mainnet Beta
- ✅ Devnet
- ✅ Testnet

Configure via `CURRENT_NETWORK` in your LazorKit config.

## 📝 License

MIT

---

**Built with [LazorKit](https://lazorkit.com)** - The easiest way to build gasless Solana dApps