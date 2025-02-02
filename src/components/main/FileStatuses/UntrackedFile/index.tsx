import { IconFileUnknown, IconPlus } from '@tabler/icons-react'
import clsx from 'clsx'

import { useAddToIndex } from '@api/commands'
import type { UntrackedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'
import { FileStatusItem } from '../File'

interface UntrackedFileStatusItemProps {
  file: UntrackedFile
}

const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <FileStatusItem
      file={file}
      className={clsx('text-light-400')}
      Icon={IconFileUnknown}
      actions={
        <IconButton
          Icon={IconPlus}
          variant="neutral"
          size="sm"
          aria-label="Stage file"
          onClick={() => stage([file.path])}
        />
      }
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
