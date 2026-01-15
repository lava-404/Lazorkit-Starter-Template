# Gasless Transfer with LazorKit

A Next.js component demonstrating **gasless SOL transfers** on Solana using [LazorKit's smart wallet infrastructure](https://lazorkit.com). This example shows how users can send SOL without holding any SOL for transaction fees - all fees are sponsored via LazorKit's paymaster.

## ✨ Features

- 🔗 **LazorKit Smart Wallet Integration** - Seamless wallet connection and management
- ⛽ **Zero Gas Fees** - Complete fee sponsorship via paymaster
- 💸 **Instant Transfers** - Send SOL without holding SOL for fees
- ✅ **Balance Validation** - Real-time balance checks and validation
- 🛡️ **Error Handling** - Comprehensive validation and error management
- 🌐 **Network Aware** - Configurable for mainnet/devnet/testnet

## 🚀 Quick Start

### Prerequisites

```bash
npm install @lazorkit/wallet @solana/web3.js lucide-react
```

### Basic Setup

```typescript
import GaslessTransfer from '@/components/GaslessTransfer'

export default function App() {
  return <GaslessTransfer />
}
```

## 📖 LazorKit Integration Guide

### 1. Wallet Connection

Access the user's smart wallet using LazorKit's `useWallet` hook:

```typescript
import { useWallet } from '@lazorkit/wallet'

const { isConnected, smartWalletPubkey } = useWallet()
```

**Key Features:**
- `isConnected` - Connection state tracking
- `smartWalletPubkey` - User's smart wallet public key (PublicKey object)

### 2. Balance Monitoring

Track user balances with LazorKit-compatible hooks:

```typescript
import { useWalletBalance } from '@/hooks/useWalletBalance'

const address = smartWalletPubkey?.toString() || null
const { solBalance } = useWalletBalance(address)
```

**Features:**
- Real-time SOL balance tracking
- Automatic updates after transactions
- Null-safe address handling

### 3. Gasless Transaction Signing

The core of gasless transfers - LazorKit's transaction wrapper handles fee sponsorship:

```typescript
import { useSafeWallet } from '@/hooks/useSafeWallet'
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

const { signAndSendTransaction, isSubmitting } = useSafeWallet()

// Build standard Solana transfer instruction
const instruction = SystemProgram.transfer({
  fromPubkey: smartWalletPubkey,
  toPubkey: destinationPubkey,
  lamports: Math.floor(Number(amount) * LAMPORTS_PER_SOL),
})

// Submit via gasless wrapper - paymaster sponsors fees automatically
const signature = await signAndSendTransaction({
  instructions: [instruction],
})
```

**Key Points:**
- Standard Solana instructions work out of the box
- No special gasless code needed in instructions
- `signAndSendTransaction` handles paymaster sponsorship automatically
- `isSubmitting` tracks transaction state

### 4. Network Configuration

Import network settings for environment-aware development:

```typescript
import { CURRENT_NETWORK } from '@/config/lazorkit'

// Use CURRENT_NETWORK for network-specific logic
// Supports: mainnet-beta, devnet, testnet
```

## 🔧 Complete Implementation

### Full Transfer Handler with Validation

```typescript
const handleTransfer = async () => {
  // 1️⃣ Validate form inputs
  if (!recipient_address || !amount || parseFloat(amount) < 0.001) {
    alert('Please fill in all fields with valid values')
    return
  }

  // 2️⃣ Verify wallet connection
  if (!isConnected || !smartWalletPubkey) {
    alert('Connect wallet first')
    return
  }

  try {
    // 3️⃣ Validate recipient address format
    let destinationPubkey: PublicKey
    try {
      destinationPubkey = new PublicKey(recipient_address)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      throw new Error(`Invalid recipient address: ${msg}`)
    }

    // 4️⃣ Check wallet balance
    if (solBalance == null) {
      throw new Error('Balance not loaded yet')
    }
    
    const balance = Math.floor(solBalance * LAMPORTS_PER_SOL)
    const lamports = Math.floor(Number(amount) * LAMPORTS_PER_SOL)

    // 5️⃣ Validate amount
    if (!Number.isFinite(lamports) || lamports <= 0) {
      throw new Error('Invalid amount')
    }

    // 6️⃣ Check sufficient balance
    if (BigInt(balance) < lamports) {
      throw new Error(
        `Insufficient balance. You have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL ` +
        `but trying to send ${amount} SOL`
      )
    }

    // 7️⃣ Build standard transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: destinationPubkey,
      lamports,
    })

    // 8️⃣ Submit gasless transaction (fees sponsored automatically)
    const signature = await signAndSendTransaction({
      instructions: [instruction],
    })

    alert(`Transfer successful!\nTx: ${signature}`)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Transfer failed')
  }
}
```

### Form State Management

```typescript
const [recipient_address, setAddress] = useState('')
const [amount, setAmount] = useState('0.001')

// Recipient input
<input
  type="text"
  value={recipient_address}
  onChange={(e) => setAddress(e.target.value)}
  placeholder="Enter wallet address..."
/>

// Amount input
<input
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  step="0.001"
  min="0.001"
/>
```

### Transaction Button with Loading State

```typescript
<button
  onClick={handleTransfer}
  disabled={isSubmitting}
  className={`w-full font-bold py-4 rounded-lg transition-all
    ${isSubmitting 
      ? 'bg-purple-400 cursor-not-allowed' 
      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:scale-[1.02]'
    }
  `}
>
  <Send className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
  {isSubmitting ? 'Sending transfer…' : 'SEND TRANSFER'}
</button>
```

## 🎯 Validation Checklist

The component performs comprehensive validation:

| Check | Description |
|-------|-------------|
| ✅ Form validation | Ensures recipient and amount are provided |
| ✅ Wallet connection | Verifies active wallet connection |
| ✅ Address format | Validates Solana public key format |
| ✅ Balance check | Confirms sufficient funds before transfer |
| ✅ Amount validation | Ensures positive, finite amounts |
| ✅ Minimum amount | Enforces 0.001 SOL minimum |

## 💡 Key Advantages

### Traditional vs LazorKit Gasless

**Traditional Solana Transfer:**
```typescript
// ❌ User needs SOL for fees
// ❌ Must hold enough SOL for both amount + fees
// ❌ New users can't send their first transaction
```

**LazorKit Gasless Transfer:**
```typescript
// ✅ Zero gas fees
// ✅ User only needs the amount they want to send
// ✅ Perfect onboarding - no initial SOL required
// ✅ Same standard Solana instructions
```

## 🔒 Security Features

- ✅ Comprehensive input validation
- ✅ Balance verification before submission
- ✅ PublicKey format validation
- ✅ Safe error handling and user feedback
- ✅ Smart wallet verification via LazorKit
- ✅ Amount boundary checks (minimum 0.001 SOL)

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

Works seamlessly across all Solana networks:
- ✅ Mainnet Beta
- ✅ Devnet (shown in example)
- ✅ Testnet

Configure via `CURRENT_NETWORK` in your LazorKit config.

## 🎨 UI Components

The example includes a complete, production-ready UI featuring:

- 🎨 Beautiful gradient design with purple theme
- 📱 Fully responsive layout
- ♿ Accessible form inputs with labels
- 🔄 Loading states with animations
- ℹ️ Informative helper text and validation messages
- 🎯 Clear call-to-action buttons

## 📝 Usage Example

```typescript
'use client'

import GaslessTransfer from '@/components/GaslessTransfer'

export default function TransferPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GaslessTransfer />
    </div>
  )
}
```

## 🤔 How It Works

1. **User Input** - User enters recipient address and amount
2. **Validation** - Component validates all inputs and checks balance
3. **Instruction Building** - Creates standard Solana transfer instruction
4. **Gasless Magic** - `signAndSendTransaction` submits to paymaster
5. **Fee Sponsorship** - Paymaster covers transaction fees automatically
6. **Confirmation** - Transaction completes, user receives signature

No special gasless code in your instructions - LazorKit handles everything! ✨

## 📝 License

MIT

---

**Built with [LazorKit](https://lazorkit.com)** - Enabling gasless transactions for the next billion users