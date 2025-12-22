import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  useEffect,
  useRef,
} from 'react'
import { IconFile } from '@tabler/icons-react'
import type { UseQueryResult } from '@tanstack/react-query'

import { QueryLoader } from '@/lib/Loader/Query'
import { Icon } from '@/ui/Icon'
import { Separator } from '@/ui/Separator'
import { Skeleton } from '@/ui/Skeleton'
import { range } from '@/utils/array'
import { cn, propsWithCn } from '@/utils/styles'

import { FileViewerTitle } from '../Title'

interface FileViewerContainerProps<T>
  extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The query result to wait for.
   */
  query: UseQueryResult<T>

  /**
   * The path of the file being displayed.
   */
  filepath: string

  /**
   * An optional annotation to display alongside the file path.
   */
  annotation?: string

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
  const { query, filepath, annotation, children, ...divProps } = props

  const viewerRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset scroll when a different file is selected
  useEffect(() => {
    viewerRef.current?.scrollTo({ top: 0, left: 0 })
  }, [filepath])

  // TODO: show old path on moved files

  return (
    <div
      {...propsWithCn(
        divProps,
        'w-full h-full',
        'grid grid-rows-[max-content_max-content_1fr]',
      )}
    >
      <div className={cn('flex flex-row items-center gap-x-2 p-2 pr-9')}>
        <Icon Glyph={IconFile} size="lg" />

        <FileViewerTitle filepath={filepath} annotation={annotation} />
      </div>

      <Separator />

      <div
        ref={viewerRef}
        className={cn(
          'pl-1 py-1 text-sm overflow-y-auto',
          'grid grid-cols-[max-content_max-content_1fr] grid-rows-[1fr]',
        )}
      >
        <QueryLoader
          query={query}
          loadingFallback={range(50).map((i) => (
            <Fragment key={i}>
              <div
                className={cn(
                  'h-7 flex flex-row items-center font-mono',
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
      </div>
    </div>
  )
}

export { FileViewerContainer, type FileViewerContainerProps }
