import type { ComponentProps } from 'react'

import type { ViewerRow } from '@/highlighting/utils'
import { propsWithCn } from '@/utils/styles'

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
    <div {...propsWithCn(divProps, 'flex flex-row')}>
      <ViewerGutter rows={rows} />
      <ViewerCode rows={rows} />
    </div>
  )
}

export { ViewerChunk, type ViewerChunkProps }
