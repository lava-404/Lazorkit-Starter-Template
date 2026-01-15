/**
 * Application Providers Component
 * 
 * Wraps the application with necessary context providers.
 * Currently provides React Query for data fetching and caching.
 */

'use client'

import { ReactQueryProvider } from '@/components/react-query-provider'
import React from 'react'

/**
 * Root provider component that wraps all application providers
 * Ensures React Query is available throughout the app for data fetching
 * 
 * @param children - React children to be wrapped with providers
 */
export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
        {children}
    </ReactQueryProvider>
  )
}
