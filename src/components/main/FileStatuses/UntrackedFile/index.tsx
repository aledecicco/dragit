import { FileIcon, PlusIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'

import { useAddToIndex } from '@api/commands'
import type { UntrackedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'

interface UntrackedFileStatusItemProps {
  file: UntrackedFile
}

const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <div
      className={clsx(
        'flex flex-row items-center gap-2 min-w-0',
        'text-light-500',
      )}
    >
      <FileIcon />
      <p className={clsx('text-sm overflow-ellipsis')}>{file.path}</p>
      <IconButton
        Icon={PlusIcon}
        variant="neutral"
        size="sm"
        aria-label="Stage file"
        onClick={() => stage([file.path])}
      />
    </div>
  )
}

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }
