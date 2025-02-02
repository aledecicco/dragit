import type { IconProps } from '@tabler/icons-react'
import clsx from 'clsx'
import type { HTMLProps, ReactNode } from 'react'

import type { FileInfo } from '@api/models'
import { EllipsisText } from '@lib/EllipsisText'

interface FileStatusItemProps<F extends FileInfo>
  extends Omit<HTMLProps<HTMLDivElement>, 'children'> {
  file: F
  Icon: React.ComponentType<IconProps>
  actions?: ReactNode
}

const FileStatusItem = <F extends FileInfo>(props: FileStatusItemProps<F>) => {
  const { file, Icon, actions, ...divProps } = props

  return (
    <div
      {...divProps}
      className={clsx(
        'flex flex-row items-center gap-2 min-w-0',
        divProps.className,
      )}
    >
      <Icon className={clsx('shrink-0 stroke-[1.5] size-5')} />
      <EllipsisText className={clsx('text-sm')}>{file.path}</EllipsisText>
      {actions}
    </div>
  )
}

export { FileStatusItem, type FileStatusItemProps }
