import {
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconPlus,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { match } from 'ts-pattern'

import { useAddToIndex } from '@api/commands'
import type { UnstagedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'
import { FileStatusItem } from '../File'

interface UnstagedFileStatusItemProps {
  file: UnstagedFile
}

const UnstagedFileStatusItem = (props: UnstagedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <FileStatusItem
      file={file}
      className={clsx('text-danger')}
      Icon={match(file.unstaged)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive()}
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

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }
