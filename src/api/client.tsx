import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
      retry: false,
    },
  },
})

const ClientProvider = (props: PropsWithChildren) => {
  const { children } = props

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export { ClientProvider }
