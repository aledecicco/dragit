import {
  IconFileUnknown,
  IconFolderQuestion,
  IconPlus,
} from '@tabler/icons-react'
import clsx from 'clsx'

import { useAddToIndex } from '@api/commands'
import type { UntrackedFile } from '@api/models'
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
      className={clsx('text-light-950/90')}
      Glyph={file.isDir ? IconFolderQuestion : IconFileUnknown}
      actions={[
        {
          Glyph: IconPlus,
          label: 'Start tracking',
          action: () => stage.mutate([file.path]),
          disabled: stage.isPending,
        },
      ]}
    />
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
