import { type ComponentProps, useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import {
  getContentSegments,
  type HighlightedContent,
} from '@/highlighting/utils'
import { cn, propsWithCn } from '@/utils/styles'

import { useFileViewerContext } from '../Container/context'

interface FileViewerRulerProps extends Omit<ComponentProps<'div'>, 'content'> {
  /**
   * The contents for which to display the changes.
   */
  content: HighlightedContent
}

/**
 * Displays the position of every change in a file as a colored segment along its scrollbar.
 */
const FileViewerRuler = (props: FileViewerRulerProps) => {
  const { content, ...divProps } = props
  const { scrollElement } = useFileViewerContext()

  const [size, setSize] = useState<ScrollSize>({ height: 0, contentHeight: 0 })

  const [observer] = useState(
    () =>
      new ResizeObserver((entries) => {
        for (const entry of entries) {
          setSize(measureScroll(entry.target))
        }
      }),
  )

  useEffect(() => {
    if (scrollElement) {
      observer.observe(scrollElement)
    }

    return () => {
      observer.disconnect()
    }
  }, [observer, scrollElement])

  // biome-ignore lint/correctness/useExhaustiveDependencies(content): recalculate size when content changes
  useEffect(() => {
    if (scrollElement) {
      setSize(measureScroll(scrollElement))
    }
  }, [scrollElement, content])

  const segments = getContentSegments(content.rows)

  if (size.contentHeight <= size.height || segments.length === 0) {
    return undefined
  }

  return (
    <div
      {...propsWithCn(
        divProps,
        'bg-dark-400',
        'row-start-3 col-start-1 self-start justify-self-end',
        'relative w-2.5',
        'pointer-events-none select-none',
      )}
      style={{ height: size.height, ...divProps.style }}
    >
      {segments.map((segment, i) => {
        const prev = segments.at(i - 1)
        const next = segments.at(i + 1)

        return (
          <div
            key={`${segment.type}-${segment.start}`}
            className={cn(
              'min-h-1',
              'absolute inset-x-0.5 rounded-xs',

              prev &&
                prev.start + prev.height === segment.start &&
                'rounded-t-none',
              next &&
                segment.start + segment.height === next.start &&
                'rounded-b-none',

              match(segment.type)
                .with('added', () => 'bg-success-500/70')
                .with('removed', () => 'bg-danger-600/70')
                .with('ours', () => 'bg-primary-500/70')
                .with('theirs', () => 'bg-warning-600/70')
                .with('unchanged', () => '')
                .exhaustive(),
            )}
            style={{
              top: `${(segment.start / size.contentHeight) * 100}%`,
              height: (segment.height / size.contentHeight) * size.height,
            }}
          />
        )
      })}
    </div>
  )
}

interface ScrollSize {
  /**
   * The visible height of the scrollable element.
   */
  height: number

  /**
   * The total height of its contents.
   */
  contentHeight: number
}

const measureScroll = (element: Element): ScrollSize => ({
  height: element.clientHeight,
  contentHeight: element.scrollHeight,
})

export { FileViewerRuler, type FileViewerRulerProps }
