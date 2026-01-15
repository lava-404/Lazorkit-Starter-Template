# Token Approval Subscription with LazorKit

A Next.js component demonstrating **gasless token approvals** for subscription services using [LazorKit's smart wallet infrastructure](https://lazorkit.com). This example shows how to implement delegated token spending - allowing services to charge users automatically without requiring manual payments each time.

## ✨ Features

- 🔗 **LazorKit Smart Wallet Integration** - Seamless passkey-based authentication
- ⛽ **Gasless Token Approvals** - Zero-fee subscription authorization
- 💳 **Delegated Spending** - Approve USDC allowances for recurring billing
- 🔒 **SPL Token Support** - Full Solana token program integration
- ✅ **Balance Validation** - Pre-approval balance checking
- 🎨 **Production-Ready UI** - Complete subscription interface

## 🚀 Quick Start

### Prerequisites

```bash
npm install @lazorkit/wallet @solana/web3.js @solana/spl-token lucide-react
```

### Environment Setup

```typescript
// Configure your service wallet and token mint
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
const SERVICE_WALLET = new PublicKey('your_service_wallet_address')
const SUBSCRIPTION_PRICE_USDC = 0.5
```

## 📖 LazorKit Integration Guide

### 1. Smart Wallet Connection

Access the user's smart wallet for token operations:

```typescript
import { useWallet } from '@lazorkit/wallet'

const { smartWalletPubkey } = useWallet()
```

**Key Point:** LazorKit smart wallets are PDAs (Program Derived Addresses), which is important for token account derivation.

### 2. Network Configuration

Import network settings for RPC connections:

```typescript
import { CURRENT_NETWORK } from '@/config/lazorkit'
import { Connection } from '@solana/web3.js'

const connection = new Connection(CURRENT_NETWORK.rpcEndpoint)
```

### 3. Associated Token Address (ATA) Derivation

**CRITICAL:** Smart wallets require special handling when deriving token accounts:

```typescript
import { getAssociatedTokenAddress } from '@solana/spl-token'

// ⚠️ IMPORTANT: Set allowOwnerOffCurve = true for smart wallets (PDAs)
const ata = await getAssociatedTokenAddress(
  USDC_MINT,           // Token mint address
  smartWalletPubkey,   // Smart wallet (owner)
  true                 // allowOwnerOffCurve = true for PDAs
)
```

**Why `allowOwnerOffCurve = true`?**
- LazorKit smart wallets are PDAs (off the ed25519 curve)
- Regular wallets are on-curve ed25519 keys
- Without this flag, ATA derivation fails for smart wallets

### 4. Token Balance Validation

Check user's token balance before approval:

```typescript
const accountInfo = await connection.getParsedAccountInfo(ata)

if (!accountInfo.value) {
  throw new Error('No USDC account found. Get devnet USDC before subscribing.')
}

const parsed = accountInfo.value.data as any
const balance = parsed.parsed.info.tokenAmount.uiAmount
const decimals = parsed.parsed.info.tokenAmount.decimals

if (balance < SUBSCRIPTION_PRICE_USDC) {
  throw new Error(
    `Insufficient USDC. You have ${balance} USDC, need ${SUBSCRIPTION_PRICE_USDC} USDC`
  )
}
```

### 5. Gasless Token Approval

Create and submit a token approval instruction without gas fees:

```typescript
import { createApproveInstruction } from '@solana/spl-token'
import { useSafeWallet } from '@/hooks/useSafeWallet'

const { signAndSendTransaction } = useSafeWallet()

// Calculate amount in base units (with decimals)
const amount = BigInt(
  SUBSCRIPTION_PRICE_USDC * Math.pow(10, decimals)
)

// Create approval instruction
const approveIx = createApproveInstruction(
  ata,                 // source: user's USDC token account
  SERVICE_WALLET,      // delegate: service that can spend tokens
  smartWalletPubkey,   // owner: user's smart wallet
  amount               // amount: how much can be spent
)

// Submit gasless transaction
await signAndSendTransaction({
  instructions: [approveIx],
})
```

**What This Does:**
- Authorizes `SERVICE_WALLET` to spend up to `amount` USDC from user's account
- Service can later call `transferChecked` to bill the user
- No payment happens immediately - just authorization
- User retains full custody of tokens until service bills them

## 🔧 Complete Implementation

### Full Subscription Handler

```typescript
const handleSubscribe = async () => {
  if (!smartWalletPubkey) {
    alert('Connect wallet first')
    return
  }

  try {
    setLoading(true)

    const connection = new Connection(CURRENT_NETWORK.rpcEndpoint)
    
    // 1️⃣ Find USDC ATA (smart wallets are PDAs → allowOwnerOffCurve = true)
    const ata = await getAssociatedTokenAddress(
      USDC_MINT,
      smartWalletPubkey,
      true  // CRITICAL for smart wallets
    )

    console.log('RPC:', CURRENT_NETWORK.rpcEndpoint)
    console.log('Smart wallet:', smartWalletPubkey.toBase58())
    console.log('USDC ATA:', ata.toBase58())

    // 2️⃣ Verify USDC account exists and has sufficient balance
    const accountInfo = await connection.getParsedAccountInfo(ata)

    if (!accountInfo.value) {
      throw new Error(
        'No USDC account found. Get devnet USDC before subscribing.'
      )
    }

    const parsed = accountInfo.value.data as any
    const balance = parsed.parsed.info.tokenAmount.uiAmount

    if (balance < SUBSCRIPTION_PRICE_USDC) {
      throw new Error(
        `Insufficient USDC. You have ${balance} USDC, need ${SUBSCRIPTION_PRICE_USDC} USDC`
      )
    }

    // 3️⃣ Create approval instruction
    const decimals = parsed.parsed.info.tokenAmount.decimals
    const amount = BigInt(
      SUBSCRIPTION_PRICE_USDC * Math.pow(10, decimals)
    )

    const approveIx = createApproveInstruction(
      ata,                 // source (user USDC)
      SERVICE_WALLET,      // delegate (service)
      smartWalletPubkey,   // owner
      amount
    )

    // 4️⃣ Submit gasless transaction
    await signAndSendTransaction({
      instructions: [approveIx],
    })

    setSubscribed(true)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Subscription failed')
  } finally {
    setLoading(false)
  }
}
```

### State Management

```typescript
const [loading, setLoading] = useState(false)
const [subscribed, setSubscribed] = useState(false)
```

### Subscription Button with States

```typescript
{subscribed ? (
  <div className="w-full py-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-700 font-semibold flex items-center justify-center gap-2">
    <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
    Subscription Active
  </div>
) : (
  <button
    onClick={handleSubscribe}
    disabled={loading}
    className="w-full font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 bg-purple-600 text-white"
  >
    <CreditCard />
    {loading ? 'Authorizing…' : 'Subscribe (Gasless)'}
  </button>
)}
```

## 🎯 How Token Approvals Work

### The Approval Flow

```
1. User approves allowance → SPL Token Program records delegation
2. Service can later spend up to approved amount
3. User retains custody until service actually bills
4. Service calls transferChecked when charging
```

### Code Flow Diagram

```typescript
// USER SIDE (This component)
createApproveInstruction(userATA, serviceWallet, user, amount)
  ↓
signAndSendTransaction() // Gasless via LazorKit
  ↓
Approval recorded on-chain

// SERVICE SIDE (Your backend)
createTransferCheckedInstruction(userATA, mint, serviceATA, serviceWallet, amount)
  ↓
Service charges user automatically
```

## 🔑 Key Concepts

### Token Approval vs Transfer

| Approval | Transfer |
|----------|----------|
| Grants spending permission | Moves tokens immediately |
| No tokens move yet | Tokens leave user's account |
| Can be revoked | Permanent once confirmed |
| Enables recurring billing | One-time payment |

### Smart Wallet Considerations

```typescript
// ❌ WRONG - Regular wallet derivation
const ata = await getAssociatedTokenAddress(
  USDC_MINT,
  smartWalletPubkey,
  false  // Fails for PDAs!
)

// ✅ CORRECT - Smart wallet derivation
const ata = await getAssociatedTokenAddress(
  USDC_MINT,
  smartWalletPubkey,
  true   // allowOwnerOffCurve = true
)
```

## 💡 Use Cases

This pattern is perfect for:

- 📱 **Subscription Services** - Monthly/yearly billing
- 🎮 **Gaming** - In-game purchases and microtransactions
- 📊 **SaaS Products** - Recurring software licenses
- 💰 **DeFi Protocols** - Automated yield harvesting
- 🛒 **E-commerce** - Saved payment methods

## 🔒 Security Features

- ✅ Balance verification before approval
- ✅ Explicit amount limits on delegation
- ✅ User retains full custody until service bills
- ✅ Token account validation
- ✅ Smart wallet PDA handling
- ✅ Comprehensive error messages

## 📦 Dependencies

```json
{
  "@lazorkit/wallet": "latest",
  "@solana/web3.js": "^1.x.x",
  "@solana/spl-token": "^0.3.x",
  "lucide-react": "latest",
  "next": "14.x.x",
  "react": "^18.x.x"
}
```

## 🌐 Network Support

Configure via `CURRENT_NETWORK`:
- ✅ Mainnet Beta (production subscriptions)
- ✅ Devnet (testing - shown in example)
- ✅ Testnet

## 🎨 UI Features

Production-ready subscription interface includes:

- 💳 Premium pricing display
- ✅ Feature list with checkmarks
- 📋 Clear "how it works" explanation
- 🔄 Loading states during authorization
- ✨ Success state after approval
- 🎯 Call-to-action optimization

## 🔄 Backend Integration

After user approves, your service can bill them:

```typescript
// Backend code to charge approved subscription
import { createTransferCheckedInstruction } from '@solana/spl-token'

const transferIx = createTransferCheckedInstruction(
  userATA,           // source: user's approved token account
  USDC_MINT,         // mint
  serviceATA,        // destination: your service account
  SERVICE_WALLET,    // authority: your service (the delegate)
  amount,            // amount to charge
  decimals           // token decimals
)

// Service submits and pays gas fees
const signature = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(transferIx),
  [serviceKeypair]
)
```

## 🚨 Important Notes

1. **Approvals are per-token** - Each token mint needs separate approval
2. **Approvals don't expire** - Service can bill until allowance exhausted or revoked
3. **User can revoke** - Users can revoke approvals by setting amount to 0
4. **Service pays gas** - When billing, service pays transaction fees (not user)

## 📝 Usage Example

```typescript
'use client'

import SubscriptionComponent from '@/components/SubscriptionComponent'

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <SubscriptionComponent />
    </div>
  )
}
```

## 📝 License

MIT

---

**Built with [LazorKit](https://lazorkit.com)** - Enabling gasless token operations for seamless Web3 subscriptions