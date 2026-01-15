/**
 * Gasless Transfer Demo Component
 * 
 * Demonstrates gasless SOL transfers using Lazorkit smart wallets.
 * Users can send SOL without holding SOL for fees - transaction fees
 * are sponsored via the paymaster. Shows balance validation and transaction
 * submission with proper error handling.
 */

import React, { useState } from 'react';
import { Send, Wallet, ArrowRight } from 'lucide-react';
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { useSafeWallet } from '@/hooks/useSafeWallet';
import { CURRENT_NETWORK } from '@/config/lazorkit';
import { useWalletBalance } from '@/hooks/useWalletBalance';

/**
 * Gasless transfer component
 * Allows users to send SOL with zero transaction fees
 */
const GaslessTransfer = () => {
  const [recipient_address, setAddress] = useState('2HHtMGWfMzr6Rr5gq8xvmcMZcRUCv3t6pdNfx1XzNycY');
  const [amount, setAmount] = useState('0.001');
  const { signAndSendTransaction, isSubmitting } = useSafeWallet();
  const { isConnected, smartWalletPubkey } = useWallet()

  const address = smartWalletPubkey?.toString() || null
  const { solBalance } = useWalletBalance(address)



  /**
   * Handles SOL transfer transaction
   * Validates inputs, checks balance, builds transfer instruction,
   * and submits via gasless transaction (fees sponsored by paymaster)
   */
  const handleTransfer = async () => {
    /**
     * Validate form inputs
     * Ensures recipient address and amount are provided with minimum amount
     */
    if (!address || !amount || parseFloat(amount) < 0.001) {
      alert('Please fill in all fields with valid values');
      return;
    }
    console.log('Transfer:', { recipient_address, amount });

    /**
     * Verify wallet connection
     * All transactions require an active wallet connection
     */
    if (!isConnected || !smartWalletPubkey) {
      alert('Connect wallet first');
      return;
    }
  
    try {
      /**
       * Validate recipient address format
       * Converts string to PublicKey, throws if invalid
       */
      let destinationPubkey: PublicKey;
      try {
          destinationPubkey = new PublicKey(recipient_address);
      } catch (e) {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          throw new Error(`Invalid recipient address: ${msg}`);
      }

      /**
       * Check wallet balance before transfer
       * Prevents attempting transfers with insufficient funds
       */
      if (solBalance == null) {
        throw new Error('Balance not loaded yet')
      }
      
      const balance = Math.floor(solBalance * LAMPORTS_PER_SOL)
      
      /**
       * Convert SOL amount to lamports
       * 1 SOL = 1e9 lamports (smallest unit)
       */
      const lamports = Math.floor(Number(amount) * LAMPORTS_PER_SOL);

      /**
       * Validate amount is finite and positive
       * Prevents invalid or negative amounts
       */
      if (!Number.isFinite(lamports) || lamports <= 0) {
        throw new Error('Invalid amount');
      }
      
      if (lamports <= 0n) throw new Error('Invalid amount');

      /**
       * Check sufficient balance
       * Compares available balance with transfer amount
       */
      if (BigInt(balance) < lamports) {
        throw new Error(
            `Insufficient balance. You have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL ` +
            `but trying to send ${amount} SOL`
        );
    }
  
      /**
       * Build Solana transfer instruction
       * Standard SystemProgram transfer - no special gasless code needed
       * The gasless magic happens in signAndSendTransaction wrapper
       */
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: destinationPubkey,
        lamports,
      });
  
      /**
       * Submit transaction via gasless wrapper
       * signAndSendTransaction from useSafeWallet handles paymaster sponsorship
       * User doesn't need SOL for fees - paymaster covers transaction costs
       */
      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });
  
      alert(`Transfer successful!\nTx: ${signature}`);
      alert(`Transfer initiated: ${amount} SOL to ${recipient_address}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Transfer failed');
    }
  };

  return (
    <div>
    
    <div className={`flex items-center justify-center transition-colors duration-200`}>
      {/* Theme Toggle */}
      
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-colors duration-200`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Fast Transfer</h1>
          </div>
          <p className="text-purple-100">Send cryptocurrency instantly</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Recipient Section */}
          <div>
            <label className={`block text-sm font-semibold mb-2 flex items-center gap-2`}>
              <Wallet className="w-4 h-4" />
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient_address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address..."
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-purple-500`}
            />
            <p className={`mt-2 text-xs `}>
              Any valid Solana address on Devnet
            </p>
          </div>

          {/* Amount Section */}
          <div>
            <label className={`block text-sm font-semibold mb-2`}>
              Amount (SOL)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.001"
                min="0.001"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:border-purple-500`}
              />
              <span className={`absolute right-10 top-1/2 -translate-y-1/2 font-`}>
                SOL
              </span>
            </div>
            <p className={`mt-2 text-xs`}>
              Minimum: 0.001 SOL
            </p>
          </div>

          {/* Info Box */}
          <div className={`p-4 rounded-lg border-l-4 border-purple-500 `}>
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className={`text-sm font-semibold mb-1 `}>
                  Zero Gas Fees
                </p>
                <p className={`text-xs`}>
                  This transfer is completely free - no transaction fees required
                </p>
              </div>
            </div>
          </div>

          {/* Transfer Button */}
          <button
            onClick={handleTransfer}
            disabled={isSubmitting}
            className={`w-full font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2
              ${
                isSubmitting
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-[1.02] active:scale-[0.98]'
              }
              text-white
            `}
          >
            <Send className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
            {isSubmitting ? 'Sending transfer…' : 'SEND TRANSFER'}
          </button>


          {/* Footer Note */}
          <p className={`text-center text-xs`}>
            Transfers are processed instantly on Devnet
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default GaslessTransfer; 