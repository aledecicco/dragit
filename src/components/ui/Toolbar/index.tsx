import * as Ariakit from '@ariakit/react'

import { type Action, ActionButton } from '@lib/ActionButton'
import type { ButtonStatus, ButtonVariant } from '@ui/Button'
import { cn, propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'
import { memo } from 'react'

interface ToolbarTool {
  action: Action
  alternatives?: Action[]
}

interface ToolbarProps extends Ariakit.ToolbarProps {
  /**
   * Descriptions of the actions in the toolbar.
   */
  tools: ToolbarTool[]

  /**
   * The visual variant of the buttons in the toolbar.
   */
  variant?: ButtonVariant

  /**
   * The default status of the buttons in the toolbar.
   */
  status?: ButtonStatus

  /**
   * The size of the buttons in the toolbar.
   */
  size?: Size

  /**
   * Whether the toolbar will have a fixed width.
   *
   * If `true`, it's assumed that the toolbar has a fixed width, and the buttons will grow proportionally to fill the available space.
   * If `false`, the toolbar will grow with the size of its buttons, and each button will take only as much space as it needs.
   */
  fixed?: boolean

  /**
   * Whether the buttons in the toolbar will be displayed in their compact form.
   */
  compact?: boolean
}

/**
 * Component that displays a set of related actions, each triggered and tracked by an {@link ActionButton}.
 */
const Toolbar = memo((props: ToolbarProps) => {
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
})

export { Toolbar, type ToolbarProps, type ToolbarTool }
