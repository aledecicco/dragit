import { IconFile, IconFolder } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'

import type { FileInfo } from '@api/models'
import { Hovercard } from '@lib/Hovercard'
import { type Glyph, Icon } from '@lib/Icon'
import { FileStatusMoreInfo } from '../MoreInfo'

interface FileStatusItemProps extends Omit<ComponentProps<'div'>, 'children'> {
  file: FileInfo
  Glyph: Glyph
  actions?: ReactNode
}

const FileStatusItem = (props: FileStatusItemProps) => {
  const { file, Glyph, actions, ...divProps } = props

  return (
    <Hovercard
      placement="top"
      anchor={
        <div
          {...divProps}
          className={clsx(
            'flex flex-row items-center gap-2 min-w-0 w-max',
            divProps.className,
          )}
        >
          <Icon Glyph={Glyph} size="md" />
          <p className={clsx('text-sm overflow-hidden overflow-ellipsis')}>
            {file.path}
          </p>
          {actions}
        </div>
      }
      heading={
        <div className={clsx('flex flex-row items-center gap-1.5')}>
          {file.isDir ? (
            <Icon Glyph={IconFolder} size="md" />
          ) : (
            <Icon Glyph={IconFile} size="md" />
          )}
          <p
            className={clsx(
              'flex flex-row-reverse',
              'overflow-x-auto pb-2.5 -mb-2.5',
            )}
          >
            {file.path}
          </p>
        </div>
      }
      description={<FileStatusMoreInfo file={file} />}
    />
  )
}

export { FileStatusItem, type FileStatusItemProps }
