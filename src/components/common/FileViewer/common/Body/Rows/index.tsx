import {
  type HighlightedContent,
  ROW_HEIGHT,
  SEPARATOR_HEIGHT,
} from '@/highlighting/utils'
import { splitIntoChunks } from '@/utils/array'
import { useVirtualizer } from '@/utils/performance'
import { cn } from '@/utils/styles'

import { useFileViewerContext } from '../../Container/context'
import { LineIndicator } from '../../LineIndicator'
import { LineNumber } from '../../LineNumber'
import { ViewerChunk } from '../Chunk'

export const CHUNK_SIZE = 25

interface FileViewerRowsProps {
  /**
   * The highlighted contents to display.
   */
  content: HighlightedContent
}

/**
 * Displays highlighted contents through a virtualized list of chunks.
 */
const FileViewerRows = (props: FileViewerRowsProps) => {
  const { content } = props

  const { scrollElement } = useFileViewerContext()

  const chunks = splitIntoChunks(content.rows, CHUNK_SIZE)

  const { totalSize, virtualItems } = useVirtualizer({
    count: chunks.length,
    getScrollElement: () => scrollElement.current,
    estimateSize: (index) =>
      chunks[index].reduce(
        (acc, row) => acc + (row.empty ? SEPARATOR_HEIGHT : ROW_HEIGHT),
        0,
      ),
    overscan: 2,
    getItemKey: (index) => chunks[index][0].key,
  })

  return (
    <div
      className={cn(
        'col-start-1 -col-end-1 flex flex-col',
        'whitespace-pre font-mono',
      )}
      style={{
        lineHeight: `${ROW_HEIGHT}px`,
        minWidth: `calc(${content.maxLineLength}ch + 2rem)`,
      }}
    >
      <div className={cn('relative')} style={{ height: totalSize }}>
        {virtualItems.map((item) => (
          <ViewerChunk
            key={item.key}
            rows={chunks[item.index]}
            style={{ top: item.start }}
          />
        ))}
      </div>

      <div
        className={cn('grow flex flex-row')}
        style={{ minHeight: ROW_HEIGHT }}
      >
        <div
          className={cn(
            'sticky left-0 z-10 shrink-0 flex flex-row select-none bg-dark-600',
          )}
        >
          <LineNumber
            className={cn('rounded-bl-sm')}
            style={{ height: '100%' }}
            type="unchanged"
            lineNumber={content.finalLineNumber}
            faded
          />
          <LineIndicator style={{ height: '100%' }} type="unchanged" empty />
        </div>

        {content.rows.length === 0 && (
          <p className={cn('pl-2 text-light-950/50 italic select-none')}>
            Empty
          </p>
        )}
      </div>
    </div>
  )
}

export { FileViewerRows, type FileViewerRowsProps }
