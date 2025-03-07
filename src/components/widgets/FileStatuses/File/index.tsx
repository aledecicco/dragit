import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'

import type { FileInfo } from '@api/models'
import { type Glyph, Icon } from '@lib/Icon'
import { Toolbar, type ToolbarTool } from '@lib/Toolbar'

interface FileStatusItemProps extends ComponentProps<'div'> {
  file: FileInfo
  statusMessage?: ReactNode
  Glyph: Glyph
  actions?: ToolbarTool[]
}

const FileStatusItem = (props: FileStatusItemProps) => {
  const { file, statusMessage, Glyph, actions, ...divProps } = props

  return (
    <div
      {...divProps}
      className={clsx(
        'flex flex-row items-center justify-between gap-4',
        'p-1.5 bg-dark-600 rounded-xs',
        divProps.className,
      )}
    >
      <div>
        <div className={clsx('flex flex-row gap-x-1 items-center')}>
          <Icon Glyph={Glyph} size="md" />

          <p
            className={clsx(
              'flex flex-row-reverse text-sm',
              'overflow-x-auto pb-2.5 -mb-2.5',
            )}
          >
            {file.path}
          </p>
        </div>

        {statusMessage}
      </div>

      {actions?.length && <Toolbar tools={actions} size="sm" />}
    </div>
  )
}

export { FileStatusItem, type FileStatusItemProps }
