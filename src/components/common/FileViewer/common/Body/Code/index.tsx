import type { ComponentProps } from 'react'

import type { ViewerRow } from '@/highlighting/utils'
import { renderRows } from '@/highlighting/utils'
import { propsWithCn } from '@/utils/styles'

interface ViewerCodeProps extends ComponentProps<'div'> {
  /**
   * The rows to display the code for.
   */
  rows: ViewerRow[]
}

/**
 * Displays the highlighted code for a chunk of rows.
 */
const ViewerCode = (props: ViewerCodeProps) => {
  const { rows, ...divProps } = props

  return <div {...propsWithCn(divProps, 'pl-2')}>{renderRows(rows)}</div>
}

export { ViewerCode, type ViewerCodeProps }
