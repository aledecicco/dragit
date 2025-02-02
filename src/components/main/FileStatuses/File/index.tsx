import type { IconProps } from '@tabler/icons-react'
import clsx from 'clsx'
import type { HTMLProps, ReactNode } from 'react'

import type { FileInfo } from '@api/models'
import { Tooltip } from '@lib/Tooltip'
import { FileStatusMoreInfo } from '../MoreInfo'

interface FileStatusItemProps
  extends Omit<HTMLProps<HTMLDivElement>, 'children'> {
  file: FileInfo
  Icon: React.ComponentType<IconProps>
  actions?: ReactNode
}

const FileStatusItem = (props: FileStatusItemProps) => {
  const { file, Icon, actions, ...divProps } = props

  return (
    <Tooltip content={<FileStatusMoreInfo file={file} />}>
      <div
        {...divProps}
        className={clsx(
          'flex flex-row items-center gap-2 min-w-0',
          divProps.className,
        )}
      >
        <Icon className={clsx('shrink-0 stroke-[1.5] size-5')} />
        <p className={clsx('text-sm overflow-hidden overflow-ellipsis')}>
          {file.path}
        </p>
        {actions}
      </div>
    </Tooltip>
  )
}

export { FileStatusItem, type FileStatusItemProps }
