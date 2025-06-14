import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { MS_IN_SECOND } from '@/utils/time'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: 3 * MS_IN_SECOND,
      retry: false,
      networkMode: 'always',
    },
  },
})

/**
 * Provides the app with a query client with default options, and enables the Dev Tools.
 */
const ClientProvider = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export { ClientProvider }
