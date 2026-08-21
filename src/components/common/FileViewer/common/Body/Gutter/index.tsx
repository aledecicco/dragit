import type { ComponentProps } from 'react'

import {
  ROW_HEIGHT,
  SEPARATOR_HEIGHT,
  type ViewerRow,
} from '@/highlighting/utils'
import { cn, propsWithCn } from '@/utils/styles'

import { LineIndicator } from '../../LineIndicator'
import { LineNumber } from '../../LineNumber'

interface ViewerGutterProps extends ComponentProps<'div'> {
  /**
   * The rows to display the gutter for.
   */
  rows: ViewerRow[]
}

/**
 * Displays the gutter (line numbers and indicators) for a chunk of rows.
 */
const ViewerGutter = (props: ViewerGutterProps) => {
  const { rows, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        // Pinned to the left so line numbers stay visible while scrolling horizontally.
        'sticky left-0 z-10 shrink-0 flex flex-col select-none bg-dark-600',
      )}
    >
      {rows.map((row) => {
        const height = row.empty ? SEPARATOR_HEIGHT : ROW_HEIGHT

        return (
          <div key={row.key} className={cn('flex flex-row')}>
            <LineNumber
              type={row.type}
              lineNumber={row.lineNumber}
              style={{ height }}
            />
            <LineIndicator
              type={row.type}
              empty={row.empty}
              style={{ height }}
            />
          </div>
        )
      })}
    </div>
  )
}

export { ViewerGutter, type ViewerGutterProps }
