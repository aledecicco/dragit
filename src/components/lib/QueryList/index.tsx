import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { usePrevious } from 'react-use'

import { QueryLoader } from '@/lib/Loader/Query'
import { VirtualizedDiv, type VirtualizedDivProps } from '@/lib/VirtualizedDiv'
import { Skeleton } from '@/ui/Skeleton'
import { range } from '@/utils/array'
import { cn } from '@/utils/styles'

interface QueryListProps<T, I> extends Omit<VirtualizedDivProps<I>, 'items'> {
  /**
   * The query to get the data from.
   */
  query: UseQueryResult<T>

  /**
   * The name of the items being displayed.
   */
  name: string

  /**
   * A function that extracts the list of items from the query data.
   *
   * @param data - The data returned by the query.
   */
  getItems?: (data: T) => I[]

  /**
   * The number of placeholder list items to display while loading.
   * Defaults to the previous count of items or 3 if not available.
   */
  placeholdersCount?: number
}

function QueryList<T, I>(
  props: QueryListProps<T, I> & { getItems: (data: T) => I[] },
): ReactNode

function QueryList<I>(
  props: QueryListProps<I[], I> & { getItems?: never },
): ReactNode

function QueryList<T, I>(props: QueryListProps<T, I>) {
  const {
    query,
    name,
    getItems,
    placeholdersCount,
    className,
    ...virtualizedDivProps
  } = props

  const prevCount = usePrevious(
    query.data
      ? (getItems ? getItems(query.data) : (query.data as I[])).length
      : 0,
  )

  return (
    <QueryLoader
      query={query}
      loadingFallback={
        <div
          className={cn(
            'flex flex-col relative overflow-hidden max-h-full px-2',
            className,
          )}
          style={{
            paddingTop: virtualizedDivProps.options?.paddingStart ?? 8,
            paddingBottom: virtualizedDivProps.options?.paddingEnd ?? 8,
            gap: virtualizedDivProps.options?.gap ?? 8,
          }}
        >
          {range(
            placeholdersCount ?? (prevCount ? Math.min(prevCount, 30) : 30),
          ).map((i) => (
            <Skeleton
              key={i}
              style={{
                minHeight: virtualizedDivProps.itemSize,
                animationDelay: `${(i % 2) * -1}s`,
              }}
              variant="fill"
            />
          ))}

          <div
            className={cn(
              'w-full h-2.5 absolute -bottom-1 left-0',
              'bg-linear-to-t from-dark-950/70 to-transparent from-30% rounded-t-full',
              'pointer-events-none',
            )}
          />
        </div>
      }
    >
      {(data) => {
        const items = getItems ? getItems(data) : (data as I[])

        return (
          <VirtualizedDiv
            size="sm"
            items={items}
            fallback={
              <p
                className={cn(
                  'text-sm text-light-950/50 italic select-none',
                  'p-3 rounded-md h-full',
                )}
              >
                No {name} found.
              </p>
            }
            {...virtualizedDivProps}
            className={cn('h-full px-2', className)}
          />
        )
      }}
    </QueryLoader>
  )
}

export { QueryList, type QueryListProps }
