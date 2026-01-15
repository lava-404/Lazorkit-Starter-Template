/**
 * Connect Button Component
 * 
 * Wallet connection button with dropdown menu for connected state.
 * Displays balance, wallet address, and disconnect functionality.
 * Uses Lazorkit wallet for passkey-based authentication.
 */

'use client'

import { useWallet } from '@lazorkit/wallet'
import { useState, useEffect, useRef } from 'react'
import { Copy } from 'lucide-react'
import { useWalletBalance } from '@/hooks/useWalletBalance'

/**
 * Wallet connect/disconnect button component
 * Shows connect button when disconnected, account menu when connected
 */
export function ConnectButton() {
  const { connect, disconnect, isConnecting, wallet } = useWallet()
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const { isConnected, smartWalletPubkey } = useWallet()
  const address = smartWalletPubkey?.toString() || null

  /**
   * Fetches wallet balance for display in dropdown
   */
  const { solBalance, isLoading } = useWalletBalance(address)

  /**
   * Closes dropdown when clicking outside the component
   * Uses event listener to detect clicks outside the dropdown ref
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  /**
   * Copies wallet address to clipboard
   * Shows temporary checkmark confirmation
   */
  const handleCopyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /**
   * Connected state: Shows account avatar with dropdown menu
   */
  if (isConnected && wallet) {
    return (
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <img src="/image.png" alt="Account"  width={32} height={32}
          onClick={() => setIsOpen(v => !v)} className='cursor-pointer'
        />

        {/* Dropdown menu with balance and wallet info */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 52,
              right: 0,
              width: 280,
              background: '#fff',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 1000,
            }}
          >
            {/* Balance display */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#666' }}>Balance</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>
                {isLoading
                  ? 'Loading…'
                  : solBalance != null
                  ? `${solBalance.toFixed(4)} SOL`
                  : '—'}
              </div>
            </div>

            <div style={{ height: 1, background: '#e5e5e5', margin: '16px 0' }} />

            {/* Wallet address with copy button */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#666' }}>Wallet</div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f5f5f5',
                  padding: '10px 12px',
                  borderRadius: 8,
                }}
              >
                <span style={{ fontFamily: 'monospace' }}>
                  {address
                    ? `${address.slice(0, 6)}…${address.slice(-4)}`
                    : '—'}
                </span>
                <button onClick={handleCopyAddress}>
                  {copied ? '✓' : <Copy/>}
                </button>
              </div>
            </div>

            {/* Disconnect button */}
            <button
              onClick={() => {
                disconnect()
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                padding: 12,
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  /**
   * Disconnected state: Shows connect button
   * Initiates passkey authentication flow with paymaster fee mode
   */
  return (
    <button
      onClick={() => connect({ feeMode: 'paymaster' })}
      disabled={isConnecting}
      style={{
        padding: '12px 24px',
        background: '#7857FF',
        color: '#fff',
        borderRadius: 8,
        fontWeight: 600,
      }}
    >
      {isConnecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  )
}
