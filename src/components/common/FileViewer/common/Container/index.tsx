import {
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useEffect,
  useState,
} from 'react'
import * as Ariakit from '@ariakit/react'
import type { UseQueryResult } from '@tanstack/react-query'
import { mergeRefs } from 'react-merge-refs'

import { QueryLoader } from '@/lib/QueryLoader'
import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'

import { FileViewerLoader } from '../Loader'
import { FileViewerTitle } from '../Title'
import { FileViewerContextProvider } from './context'

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

  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset scroll when a different file is selected
  useEffect(() => {
    scrollElement?.scrollTo({ top: 0, left: 0 })
  }, [filepath, children, scrollElement])

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
        ref={mergeRefs<HTMLDivElement>([setScrollElement, viewerRef])}
        render={<div />}
        className={cn(
          'py-1 text-sm overflow-auto',
          'grid grid-cols-[max-content_max-content_1fr] grid-rows-[1fr]',
        )}
      >
        <FileViewerContextProvider scrollElement={scrollElement}>
          <QueryLoader query={query} loadingFallback={<FileViewerLoader />}>
            {children}
          </QueryLoader>
        </FileViewerContextProvider>
      </Ariakit.Focusable>
    </div>
  )
}

export { FileViewerContainer, type FileViewerContainerProps }
