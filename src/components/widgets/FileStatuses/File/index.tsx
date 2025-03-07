import { IconFile, IconFolder } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ComponentProps } from 'react'

import type { FileInfo } from '@api/models'
import { type Glyph, Icon } from '@lib/Icon'
import { Toolbar, type ToolbarTool } from '@lib/Toolbar'

interface FileStatusItemProps extends ComponentProps<'div'> {
  file: FileInfo
  Glyph: Glyph
  actions?: ToolbarTool[]
}

const FileStatusItem = (props: FileStatusItemProps) => {
  const { file, Glyph, actions, ...divProps } = props

  return (
    <div
      {...divProps}
      className={clsx(
        'flex flex-row items-center justify-between gap-4',
        divProps.className,
      )}
    >
      <div className={clsx('flex flex-row items-center gap-x-1')}>
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

      {actions && <Toolbar tools={actions} size="sm" />}
    </div>
  )
}

export { FileStatusItem, type FileStatusItemProps }
