import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
} from 'react'
import * as Ariakit from '@ariakit/react'
import type { UseQueryResult } from '@tanstack/react-query'
import { mergeRefs } from 'react-merge-refs'

import { QueryLoader } from '@/lib/QueryLoader'
import { Separator } from '@/ui/Separator'
import { Skeleton } from '@/ui/Skeleton'
import { range } from '@/utils/array'
import { cn, propsWithCn } from '@/utils/styles'

import { FileViewerTitle } from '../Title'

interface FileViewerContainerProps<T>
  extends Omit<ComponentProps<'div'>, 'children' | 'render'> {
  /**
   * The query result to wait for.
   */
  query: UseQueryResult<T>

  /**
   * The path of the file being displayed.
   */
  filepath: string

  /**
   * The icon to display alongside the file path.
   */
  decoration?: ReactNode

  /**
   * An optional annotation to display alongside the file path.
   */
  annotation?: ReactNode

  /**
   * Optional ref to hook into the file viewer.
   */
  viewerRef?: RefObject<HTMLDivElement | null>

  /**
   * Function that accepts the query's result and returns the children to render.
   *
   * @param result - The resulting data of the query.
   */
  children: (result: T) => ReactNode
}

/**
 * Displays the contents of a file, showing changes made to it on each line.
 */
const FileViewerContainer = <T,>(props: FileViewerContainerProps<T>) => {
  const {
    query,
    filepath,
    decoration,
    annotation,
    viewerRef,
    children,
    ...divProps
  } = props

  const ref = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset scroll when a different file is selected
  useEffect(() => {
    ref.current?.scrollTo({ top: 0, left: 0 })
  }, [filepath, children])

  return (
    <div
      {...propsWithCn(
        divProps,
        'size-full',
        'grid grid-rows-[max-content_max-content_1fr]',
      )}
    >
      <div className={cn('flex flex-row items-center gap-x-2 p-2 pr-9')}>
        {decoration}

        <FileViewerTitle filepath={filepath} annotation={annotation} />
      </div>

      <Separator />

      <Ariakit.Focusable
        ref={mergeRefs([ref, viewerRef])}
        render={<div />}
        className={cn(
          'pl-1 py-1 text-sm overflow-y-auto',
          'grid grid-cols-[max-content_max-content_1fr] grid-rows-[1fr]',
          'border border-transparent focus:border-x-dark-50 focus:border-b-dark-50',
        )}
      >
        <QueryLoader
          query={query}
          loadingFallback={range(50).map((i) => (
            <Fragment key={i}>
              <div
                className={cn(
                  'h-6.5 flex flex-row items-center font-mono',
                  'text-xs w-19 px-1 overflow-hidden',
                  'bg-dark-600 text-light-950/30',
                )}
              >
                {i + 1}
              </div>
              <Skeleton
                variant="line"
                className={cn('col-span-2 m-1.5 mx-2')}
              />
            </Fragment>
          ))}
        >
          {children}
        </QueryLoader>
      </Ariakit.Focusable>
    </div>
  )
}

export { FileViewerContainer, type FileViewerContainerProps }
