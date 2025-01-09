import { FileMinusIcon, PlusIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'

import { useAddToIndex } from '@api/commands'
import type { UnstagedFile } from '@api/models'
import { IconButton } from '@lib/IconButton'

interface UnstagedFileStatusItemProps {
  file: UnstagedFile
}

const UnstagedFileStatusItem = (props: UnstagedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <div className={clsx('flex flex-row items-center gap-2', 'text-danger')}>
      <FileMinusIcon />
      <p className={clsx('text-sm')}>{file.path}</p>
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

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }
