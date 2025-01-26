import { FilePlusIcon, MinusIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'

import { useRemoveFromIndex } from '@api/commands'
import type { StagedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'
import { FileStatusItem } from '../File'

interface StagedFileStatusItemProps {
  file: StagedFile
}

const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { file } = props
  const unstage = useRemoveFromIndex()

  return (
    <FileStatusItem
      file={file}
      className={clsx('text-success')}
      Icon={FilePlusIcon}
      actions={
        <IconButton
          Icon={MinusIcon}
          variant="neutral"
          size="sm"
          aria-label="Unstage file"
          onClick={() => unstage([file.path])}
        />
      }
    />
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }
