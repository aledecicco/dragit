import type { ComponentProps } from 'react'

import { Accordion } from '@ui/Accordion'
import { propsWithCn } from '@utils/styles'
import { FileStatusesSection } from './Section'

interface FileStatusesProps extends ComponentProps<'div'> {}

/**
 * Main app widget that displays the files in the current work tree grouped by status.
 */
const FileStatuses = (props: FileStatusesProps) => {
  const { ...divProps } = props

  return (
    <Accordion {...propsWithCn(divProps, 'overflow-hidden')}>
      <FileStatusesSection type="untracked" defaultOpen={false} />
      <FileStatusesSection type="unstaged" defaultOpen />
      <FileStatusesSection type="unmerged" defaultOpen />
      <FileStatusesSection type="staged" defaultOpen />
    </Accordion>
  )
}

export { FileStatuses, type FileStatusesProps }
