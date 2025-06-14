import * as Ariakit from '@ariakit/react'
import type { UseQueryResult } from '@tanstack/react-query'
import { usePrevious } from 'react-use'

import { QueryLoader } from '@/lib/Loader/Query'
import { VirtualizedDiv, type VirtualizedDivProps } from '@/lib/VirtualizedDiv'
import { Skeleton } from '@/ui/Skeleton'
import { range } from '@/utils/array'
import { cn, propsWithCn } from '@/utils/styles'

interface QueryListProps<T, I> extends Omit<VirtualizedDivProps<I>, 'items'> {
  /**
   * The query to get the data from.
   */
  query: UseQueryResult<T>

  /**
   * The name of the items being displayed, used for fallback messages.
   */
  name: string

  /**
   * A function that extracts the list of items from the query data.
   *
   * @param data - The data returned by the query.
   */
  getItems: (data: T) => I[]

  /**
   * Whether this list is standalone or rendered in a group of lists.
   * If not standalone, it's rendered as a composite element to allow navigating between lists.
   */
  isStandalone?: boolean

  /**
   * The number of placeholder list items to display while loading.
   * Defaults to the previous count of items or 3 if not available.
   */
  placeholdersCount?: number
}

/**
 * A virtualized list that displays data from a query, with fallback loading and error states.
 */
const QueryList = <T, I>(props: QueryListProps<T, I>) => {
  const {
    query,
    name,
    getItems,
    isStandalone = true,
    placeholdersCount,
    ...virtualizedDivProps
  } = props

  const prevCount = usePrevious(
    query.data ? Math.min(getItems(query.data).length, 10) : undefined,
  )

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
          {range(placeholdersCount ?? prevCount ?? 3).map((i) => (
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
