import clsx from 'clsx'
import type { HTMLProps, ReactNode } from 'react'

import type { FileInfo } from '@api/models'
import { type Glyph, Icon } from '@lib/Icon'
import { Tooltip } from '@lib/Tooltip'
import { FileStatusMoreInfo } from '../MoreInfo'

interface FileStatusItemProps
  extends Omit<HTMLProps<HTMLDivElement>, 'children'> {
  file: FileInfo
  Glyph: Glyph
  actions?: ReactNode
}

const FileStatusItem = (props: FileStatusItemProps) => {
  const { file, Glyph, actions, ...divProps } = props

  return (
    <Tooltip content={<FileStatusMoreInfo file={file} />}>
      <div
        {...divProps}
        className={clsx(
          'flex flex-row items-center gap-2 min-w-0',
          divProps.className,
        )}
      >
        <Icon Glyph={Glyph} size="sm" />
        <p className={clsx('text-sm overflow-hidden overflow-ellipsis')}>
          {file.path}
        </p>
        {actions}
      </div>
    </Tooltip>
  )
}

export { FileStatusItem, type FileStatusItemProps }
