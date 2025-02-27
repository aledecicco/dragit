import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { MouseEventHandler } from 'react'

import { Button } from '@lib/Button'
import { type Glyph, Icon } from '@lib/Icon'
import { Tooltip } from '@lib/Tooltip'

interface ToolbarTool extends Ariakit.ToolbarItemProps {
  Glyph: Glyph
  label: string
  action: MouseEventHandler<HTMLButtonElement>
}

interface ToolbarProps extends Ariakit.ToolbarProps {
  tools: ToolbarTool[]
}

const Toolbar = (props: ToolbarProps) => {
  const { tools, ...toolbarProps } = props

  return (
    <Ariakit.ToolbarProvider>
      <Ariakit.Toolbar
        {...toolbarProps}
        className={clsx(
          'p-1 grid grid-flow-col auto-cols-fr',
          toolbarProps.className,
        )}
      >
        {tools.map(({ Glyph, label, action, ...toolbarItemProps }) => (
          <Tooltip
            key={label}
            anchor={
              <Ariakit.ToolbarItem
                onClick={action}
                render={
                  <Button
                    variant="neutral"
                    className={clsx(
                      '[&]:w-full',
                      'not-first:rounded-l-none',
                      'not-last:rounded-r-none not-last:border-r-1 not-last:border-solid not-last:border-dark-950',
                    )}
                  />
                }
                {...toolbarItemProps}
              >
                <Icon Glyph={Glyph} />
              </Ariakit.ToolbarItem>
            }
            description={label}
          />
        ))}
      </Ariakit.Toolbar>
    </Ariakit.ToolbarProvider>
  )
}

export { Toolbar, type ToolbarProps, type ToolbarTool }
