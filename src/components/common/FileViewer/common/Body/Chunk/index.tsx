import type { ComponentProps } from 'react'

import type { ViewerRow } from '@/highlighting/utils'
import { cn, propsWithCn } from '@/utils/styles'

import { ViewerCode } from '../Code'
import { ViewerGutter } from '../Gutter'

interface ViewerChunkProps extends ComponentProps<'div'> {
  /**
   * The rows to display.
   */
  rows: ViewerRow[]
}

/**
 * Displays a chunk of rows.
 */
const ViewerChunk = (props: ViewerChunkProps) => {
  const { rows, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'absolute left-0 w-full flex flex-row')}>
      <ViewerGutter rows={rows} />
      <ViewerCode rows={rows} className={cn('grow')} />
    </div>
  )
}

export { ViewerChunk, type ViewerChunkProps }
