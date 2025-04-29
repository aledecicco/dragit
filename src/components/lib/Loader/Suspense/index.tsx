import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { type PropsWithChildren, type ReactNode, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { RetryError } from '@lib/RetryError'
import { Skeleton } from '@ui/Skeleton'
import { getErrorMessage } from '@utils/error'

interface SuspenseLoaderProps extends PropsWithChildren {
  loadingFallback?: ReactNode
  errorFallback?: (props: ErrorFallbackProps) => ReactNode
}

interface ErrorFallbackProps {
  retry: () => void
  error: unknown
}

const SuspenseLoader = (props: SuspenseLoaderProps) => {
  const { loadingFallback, errorFallback, children } = props

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={(fallbackProps) =>
            errorFallback ? (
              errorFallback({
                retry: fallbackProps.resetErrorBoundary,
                error: fallbackProps.error,
              })
            ) : (
              <RetryError
                message={getErrorMessage(fallbackProps.error)}
                retry={fallbackProps.resetErrorBoundary}
              />
            )
          }
        >
          <Suspense fallback={loadingFallback ?? <Skeleton variant="fill" />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export { SuspenseLoader, type SuspenseLoaderProps, type ErrorFallbackProps }
