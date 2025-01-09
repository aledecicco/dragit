import { CheckIcon, FileTextIcon, TrashIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'
import { P, match } from 'ts-pattern'

import { useAddToIndex, useRemoveFromTree } from '@api/commands'
import type { UnmergedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'

interface UnmergedFileStatusItemProps {
  file: UnmergedFile
}

const UnmergedFileStatusItem = (props: UnmergedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()
  const remove = useRemoveFromTree()

  return (
    <div className={clsx('flex flex-row items-center gap-2', 'text-warning')}>
      <FileTextIcon />
      <p className={clsx('text-sm')}>{file.path}</p>
      <IconButton
        Icon={CheckIcon}
        variant="neutral"
        size="sm"
        aria-label="Mark conflict as resolved"
        onClick={() => stage([file.path])}
      />

      {match(file.unstaged)
        .with(P.union('bothDeleted', 'deletedByThem', 'deletedByUs'), () => (
          <IconButton
            Icon={TrashIcon}
            variant="neutral"
            size="sm"
            aria-label="Delete file"
            onClick={() => remove([file.path])}
          />
        ))
        .otherwise(() => undefined)}
    </div>
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }
