import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import type { Action, InstantAction } from '@/context/actions'
import { ActionButton } from '@/lib/ActionButton'
import type { ButtonStatus, ButtonVariant } from '@/ui/Button'
import { Toolbar, type ToolbarProps } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { cn, propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

type ToolbarTool = {
  alternatives?: Action[]
} & ( // biome-ignore lint/suspicious/noExplicitAny: Toolbars need to accept actions with different parameter types.
  | { mainAction: Action<any>; trackOnly: true; onClick: () => void }
  | { mainAction: Action<void>; trackOnly?: false }
  | { mainAction: InstantAction }
)

interface ActionToolbarProps extends ToolbarProps {
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
   * Whether the buttons in the toolbar will be displayed in their compact form.
   */
  compact?: boolean
}

/**
 * Component that displays a set of related actions, each triggered and tracked by an {@link ActionButton}.
 */
const ActionToolbar = (props: ActionToolbarProps) => {
  const {
    tools,
    variant = 'filled',
    status = 'neutral',
    size = 'md',
    compact = true,
    ...toolbarProps
  } = props

  return (
    <Toolbar {...toolbarProps}>
      {tools.map((tool, index) => (
        <ToolbarItem
          key={
            tool.mainAction.type === 'instant'
              ? `${tool.mainAction.label}_${index}`
              : `${tool.mainAction.label.idle}_${index}`
          }
          fixed={toolbarProps.fixed}
          className={cn(
            'not-last:border-solid not-last:border-r-1',
            match(status)
              .with('primary', () => 'not-last:border-r-primary-800')
              .with('cta', () => 'not-last:border-r-accent-700')
              .with('success', () => 'not-last:border-r-green-800')
              .with('error', () => 'not-last:border-r-danger-900')
              .with('neutral', () => 'not-last:border-r-dark-500')
              .exhaustive(),
          )}
          render={
            <ActionButton
              variant={variant}
              status={status}
              size={size}
              compact={compact}
              menuButtonProps={{ render: <Ariakit.ToolbarItem /> }}
              {...tool}
              disabled={toolbarProps.disabled}
            />
          }
        />
      ))}
    </Toolbar>
  )
}

export { ActionToolbar, type ActionToolbarProps, type ToolbarTool }
