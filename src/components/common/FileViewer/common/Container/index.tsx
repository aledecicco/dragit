import {
  type ComponentProps,
  type ReactNode,
  type RefObject,
  useEffect,
  useState,
} from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import type { HighlightedContent } from '@/highlighting/utils'
import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'

import { FileViewerRuler } from '../Ruler'
import { FileViewerTitle } from '../Title'
import { FileViewerContextProvider } from './context'

interface FileViewerContainerProps
  extends Omit<ComponentProps<'div'>, 'render' | 'content'> {
  /**
   * The highlighted contents being displayed, once available.
   */
  content: HighlightedContent | undefined

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
}

/**
 * Displays the contents of a file, showing changes made to it on each line.
 */
const FileViewerContainer = (props: FileViewerContainerProps) => {
  const {
    content,
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
        'size-full isolate',
        'grid grid-rows-[max-content_max-content_1fr]',
      )}
    >
      <div className={cn('flex flex-row items-center gap-x-2 p-2 pr-9')}>
        {decoration}

        <FileViewerTitle filepath={filepath} annotation={annotation} />
      </div>

      <Separator />

      <FileViewerContextProvider scrollElement={scrollElement}>
        {content && <FileViewerRuler content={content} />}

        <Ariakit.Focusable
          ref={mergeRefs<HTMLDivElement>([setScrollElement, viewerRef])}
          render={<div />}
          className={cn(
            'row-start-3 col-start-1',
            'text-sm overflow-auto',
            'grid grid-cols-[max-content_max-content_1fr] grid-rows-[1fr]',
          )}
        >
          {children}
        </Ariakit.Focusable>
      </FileViewerContextProvider>
    </div>
  )
}

export { FileViewerContainer, type FileViewerContainerProps }
