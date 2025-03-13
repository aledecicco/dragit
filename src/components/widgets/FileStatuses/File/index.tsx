import type { ComponentProps, ReactNode } from 'react'

import type { FileInfo } from '@api/models'
import { type Glyph, Icon } from '@ui/Icon'
import { Marquee } from '@ui/Marquee'
import { Toolbar, type ToolbarTool } from '@ui/Toolbar'
import { cn, propsWithCn } from '@utils/styles'

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
      {...propsWithCn(
        divProps,
        'flex flex-row items-center justify-between gap-4',
        'p-1.5 bg-dark-600 rounded-xs',
      )}
    >
      <div className={cn('min-w-0 overflow-x-hidden')}>
        <div className={cn('flex flex-row gap-x-1 items-center')}>
          <Icon Glyph={Glyph} size="md" />

          <Marquee className={cn('text-sm')}>{file.path}</Marquee>
        </div>

        {statusMessage}
      </div>

      {actions?.length && <Toolbar tools={actions} size="sm" />}
    </div>
  )
}

export { FileStatusItem, type FileStatusItemProps }
