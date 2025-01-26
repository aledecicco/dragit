import { FileMinusIcon, PlusIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'

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
      Icon={FileMinusIcon}
      actions={
        <IconButton
          Icon={PlusIcon}
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
