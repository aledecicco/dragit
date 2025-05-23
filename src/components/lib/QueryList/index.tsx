import * as Ariakit from '@ariakit/react'
import type { UseQueryResult } from '@tanstack/react-query'

import { QueryLoader } from '@lib/Loader/Query'
import { VirtualizedDiv, type VirtualizedDivProps } from '@lib/VirtualizedDiv'
import { Skeleton } from '@ui/Skeleton'
import { cn, propsWithCn } from '@utils/styles'

interface QueryListProps<T, I> extends Omit<VirtualizedDivProps<I>, 'items'> {
  query: UseQueryResult<T>
  name: string
  getItems: (data: T) => I[]
  isStandalone?: boolean
  placeholdersCount?: number
}

const QueryList = <T, I>(props: QueryListProps<T, I>) => {
  const {
    query,
    name,
    getItems,
    isStandalone = true,
    placeholdersCount = 3,
    ...virtualizedDivProps
  } = props

  return (
    <QueryLoader
      query={query}
      loadingFallback={
        <div
          className={cn('flex flex-col px-2')}
          style={{
            paddingTop: virtualizedDivProps.options?.paddingStart ?? 8,
            paddingBottom: virtualizedDivProps.options?.paddingEnd ?? 8,
            gap: virtualizedDivProps.options?.gap ?? 8,
          }}
        >
          {[...Array(placeholdersCount).keys()].map((i) => (
            <Skeleton
              key={i}
              style={{ height: virtualizedDivProps.itemSize }}
              variant="fill"
            />
          ))}
        </div>
      }
    >
      {(data) => {
        const items = getItems(data)

        const list = (
          <VirtualizedDiv
            size="sm"
            items={items}
            fallback={
              <p className={cn('text-sm text-light-950/50 italic p-3')}>
                No {name} found.
              </p>
            }
            {...propsWithCn(virtualizedDivProps, 'h-full')}
          />
        )

        return isStandalone ? (
          <Ariakit.CompositeProvider focusLoop>
            <Ariakit.Composite render={list} />
          </Ariakit.CompositeProvider>
        ) : (
          <Ariakit.CompositeRow render={list} />
        )
      }}
    </QueryLoader>
  )
}

export { QueryList, type QueryListProps }
