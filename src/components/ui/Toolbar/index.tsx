import * as Ariakit from '@ariakit/react'

import { type Action, ActionButton } from '@lib/ActionButton'
import type { ButtonStatus, ButtonVariant } from '@ui/Button'
import { cn, propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

interface ToolbarTool {
  action: Action
  alternatives?: Action[]
}

interface ToolbarProps extends Ariakit.ToolbarProps {
  tools: ToolbarTool[]
  variant?: ButtonVariant
  status?: ButtonStatus
  size?: Size
  fixed?: boolean
  compact?: boolean
}

const Toolbar = (props: ToolbarProps) => {
  const {
    tools,
    variant = 'filled',
    status = 'neutral',
    size = 'md',
    fixed = false,
    compact = true,
    ...toolbarProps
  } = props

  return (
    <Ariakit.ToolbarProvider>
      <Ariakit.Toolbar
        {...propsWithCn(
          toolbarProps,
          'grid grid-flow-col',
          fixed ? 'auto-cols-fr' : 'auto-cols-max',
        )}
      >
        {tools.map((tool) => (
          <ActionButton
            key={
              typeof tool.action.label === 'string'
                ? tool.action.label
                : tool.action.label.idle
            }
            className={cn(
              fixed && 'w-full',
              'not-first:rounded-l-none',
              'not-last:rounded-r-none not-last:border-r-2 not-last:border-solid not-last:border-r-dark-500',
            )}
            mainAction={tool.action}
            alternatives={tool.alternatives}
            size={size}
            variant={variant}
            status={status}
            compact={compact}
            disabled={toolbarProps.disabled}
            render={<Ariakit.ToolbarItem />}
            menuButtonProps={{ render: <Ariakit.ToolbarItem /> }}
          />
        ))}
      </Ariakit.Toolbar>
    </Ariakit.ToolbarProvider>
  )
}

export { Toolbar, type ToolbarProps, type ToolbarTool }
