import type { ComponentProps } from 'react'

import { Accordion } from '@ui/Accordion'
import { propsWithCn } from '@utils/styles'
import { StagedFiles } from './StagedFiles'
import { UnmergedFiles } from './UnmergedFiles'
import { UnstagedFiles } from './UnstagedFiles'
import { UntrackedFiles } from './UntrackedFiles'

interface FileStatusesProps extends ComponentProps<'div'> {}

const FileStatuses = (props: FileStatusesProps) => {
  const { ...divProps } = props

  return (
    <Accordion {...propsWithCn(divProps, 'overflow-hidden')}>
      <UntrackedFiles />

      <UnmergedFiles />

      <UnstagedFiles />

      <StagedFiles />
    </Accordion>
  )
}

export { FileStatuses, type FileStatusesProps }
