import { FilePlusIcon, MinusIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'

import { useRemoveFromIndex } from '@api/commands'
import type { StagedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'

interface StagedFileStatusItemProps {
  file: StagedFile
}

const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { file } = props
  const unstage = useRemoveFromIndex()

  return (
    <div className={clsx('flex flex-row items-center gap-2', 'text-success')}>
      <FilePlusIcon />
      <p className={clsx('text-sm')}>{file.path}</p>
      <IconButton
        Icon={MinusIcon}
        variant="neutral"
        size="sm"
        aria-label="Unstage file"
        onClick={() => unstage([file.path])}
      />
    </div>
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }
