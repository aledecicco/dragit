import {
  IconFileUnknown,
  IconFolderQuestion,
  IconPlus,
} from '@tabler/icons-react'
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
      className={clsx('text-light-600')}
      Glyph={file.isDir ? IconFolderQuestion : IconFileUnknown}
      actions={
        <IconButton
          Glyph={IconPlus}
          variant="neutral"
          size="sm"
          aria-label="Stage file"
          onClick={() => stage.mutateAsync([file.path])}
        />
      }
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
