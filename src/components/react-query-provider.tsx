/**
 * React Query Provider Component
 * 
 * Provides React Query (TanStack Query) context for data fetching and caching.
 * Implements SSR-safe singleton pattern to prevent duplicate QueryClient instances
 * during server-side rendering and client hydration.
 * 
 * Reference: https://tanstack.com/query/5/docs/framework/react/guides/advanced-ssr
 */

'use client'

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Creates a new QueryClient instance with default options
 * Sets staleTime to 60 seconds to reduce unnecessary refetches
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

/**
 * Browser-side QueryClient singleton
 * Prevents creating multiple instances during client-side navigation
 */
let browserQueryClient: QueryClient | undefined = undefined

/**
 * Gets or creates a QueryClient instance
 * Returns a new instance on the server, reuses singleton on the client
 * This prevents hydration mismatches in Next.js SSR
 */
function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

/**
 * React Query provider wrapper component
 * Makes QueryClient available to all child components via context
 * 
 * @param children - React children to be wrapped with QueryClientProvider
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
