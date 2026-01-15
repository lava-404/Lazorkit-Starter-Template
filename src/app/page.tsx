/**
 * Home Page Component
 * 
 * The main landing page that displays the hero section, template features,
 * and wraps the interactive demo components with Lazorkit wallet provider.
 * Provides wallet connection and gasless transaction capabilities.
 */

'use client'
import AppHero from '@/components/app-hero';
import TemplateFeatures from '@/components/template-features';
import HomePage from './pages/HomePage';
import { LazorkitProvider } from '@lazorkit/wallet'

/**
 * Home page component
 * Renders marketing content and wraps interactive demos with wallet provider
 */
export default function Home() {
  /**
   * Lazorkit configuration for wallet provider
   * Connects to Solana devnet with passkey authentication and gasless transactions
   */
  const CONFIG = {
    rpcUrl: 'https://api.devnet.solana.com',
    portalUrl: 'https://portal.lazor.sh',
    paymasterConfig: {
      paymasterUrl: 'https://kora.devnet.lazorkit.com'
    }
  };
  
  return (
    <>
      {/* Hero section with marketing content */}
      <AppHero />
      
      {/* Template features showcase */}
      <TemplateFeatures />

      {/* Wallet provider enables passkey authentication and gasless transactions */}
      <LazorkitProvider
        rpcUrl={CONFIG.rpcUrl}
        portalUrl={CONFIG.portalUrl}
        paymasterConfig={CONFIG.paymasterConfig}
      >
        {/* Interactive demo components requiring wallet connection */}
        <HomePage />
      </LazorkitProvider>
    </>
  )
}
