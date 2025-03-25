import * as Ariakit from '@ariakit/react'
import type { ComponentProps, ReactNode } from 'react'

import type { FileInfo } from '@api/models'
import { type Glyph, Icon } from '@ui/Icon'
import { ListItem } from '@ui/ListItem'
import { Marquee } from '@ui/Marquee'
import { Toolbar, type ToolbarTool } from '@ui/Toolbar'
import { cn } from '@utils/styles'

interface FileStatusItemProps extends ComponentProps<'div'> {
  file: FileInfo
  statusMessage?: ReactNode
  Glyph: Glyph
  actions?: ToolbarTool[]
}

const FileStatusItem = (props: FileStatusItemProps) => {
  const { file, statusMessage, Glyph, actions, ...divProps } = props

  return (
    <Ariakit.CompositeItem render={<ListItem {...divProps} />}>
      <div className={cn('min-w-0 overflow-x-hidden')}>
        <div className={cn('flex flex-row gap-x-1 items-center')}>
          <Icon Glyph={Glyph} size="md" />

          <Marquee className={cn('text-sm')}>{file.path}</Marquee>
        </div>

        {statusMessage}
      </div>

      {actions?.length && <Toolbar tools={actions} size="sm" />}
    </Ariakit.CompositeItem>
  )
}

export { FileStatusItem, type FileStatusItemProps }
