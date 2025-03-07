import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { MouseEventHandler } from 'react'

import type { Glyph } from '@lib/Icon'
import { IconButton } from '@lib/IconButton'
import type { Size } from '@utils/types'

interface ToolbarTool extends Ariakit.ToolbarItemProps {
  Glyph: Glyph
  label: string
  action: MouseEventHandler<HTMLButtonElement>
}

interface ToolbarProps extends Ariakit.ToolbarProps {
  tools: ToolbarTool[]
  size?: Size
  fixed?: boolean
}

const Toolbar = (props: ToolbarProps) => {
  const { tools, size, fixed, ...toolbarProps } = props

  return (
    <Ariakit.ToolbarProvider>
      <Ariakit.Toolbar
        {...toolbarProps}
        className={clsx(
          'p-1 grid grid-flow-col',
          fixed ? 'auto-cols-fr' : 'auto-cols-max',
          toolbarProps.className,
        )}
      >
        {tools.map(({ Glyph, label, action, ...toolbarItemProps }) => (
          <Ariakit.ToolbarItem
            key={label}
            onClick={action}
            render={
              <IconButton
                variant="neutral"
                Glyph={Glyph}
                label={label}
                round={false}
                size={size}
                className={clsx(
                  fixed && '[&]:w-full',
                  'not-first:rounded-l-none',
                  'not-last:rounded-r-none not-last:border-r-1 not-last:border-solid not-last:border-dark-950',
                )}
              />
            }
            {...toolbarItemProps}
            disabled={toolbarProps.disabled || toolbarItemProps.disabled}
          />
        ))}
      </Ariakit.Toolbar>
    </Ariakit.ToolbarProvider>
  )
}

export { Toolbar, type ToolbarProps, type ToolbarTool }
