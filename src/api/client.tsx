import { type PropsWithChildren, type ReactPortal, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createPortal } from 'react-dom'
import { useEffectOnce } from 'react-use'

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

  const [devtools, setDevtools] = useState<ReactPortal>()

  useEffectOnce(() => {
    const elem = document.createElement('div')
    elem.id = 'devtools-root'
    elem.style.position = 'fixed'
    elem.style.zIndex = '999999'
    elem.style.pointerEvents = 'auto'
    document.documentElement.appendChild(elem)

    setDevtools(
      createPortal(<ReactQueryDevtools initialIsOpen={false} />, elem),
    )

    return () => {
      document.documentElement.removeChild(elem)
      setDevtools(undefined)
    }
  })

  return (
    <QueryClientProvider client={client}>
      {children}
      {devtools}
    </QueryClientProvider>
  )
}

export { client, ClientProvider }
