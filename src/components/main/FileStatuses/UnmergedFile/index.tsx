import { IconCheck, IconFileText, IconTrash } from '@tabler/icons-react'
import clsx from 'clsx'
import { P, match } from 'ts-pattern'

import { useAddToIndex, useRemoveFromTree } from '@api/commands'
import type { UnmergedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'
import { FileStatusItem } from '../File'

interface UnmergedFileStatusItemProps {
  file: UnmergedFile
}

const UnmergedFileStatusItem = (props: UnmergedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()
  const remove = useRemoveFromTree()

  return (
    <FileStatusItem
      file={file}
      className={clsx('text-warning')}
      Icon={IconFileText}
      actions={
        <>
          <IconButton
            Icon={IconCheck}
            variant="neutral"
            size="sm"
            aria-label="Mark conflict as resolved"
            onClick={() => stage([file.path])}
          />

          {match(file.unstaged)
            .with(
              P.union('bothDeleted', 'deletedByThem', 'deletedByUs'),
              () => (
                <IconButton
                  Icon={IconTrash}
                  variant="neutral"
                  size="sm"
                  aria-label="Delete file"
                  onClick={() => remove([file.path])}
                />
              ),
            )
            .otherwise(() => undefined)}
        </>
      }
    />
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
