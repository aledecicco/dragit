import clsx from 'clsx'
import { match } from 'ts-pattern'

import { useRemoveFromIndex } from '@api/commands'
import type { StagedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'
import {
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
  IconMinus,
} from '@tabler/icons-react'
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
      Icon={match(file.staged)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('copied', () => IconFiles)
        .with('renamed', () => IconFileArrowRight)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive()}
      actions={
        <IconButton
          Icon={IconMinus}
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
