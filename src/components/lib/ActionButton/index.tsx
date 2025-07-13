import { type Action, useRunAction } from '@/context/actions'
import { Button, type ButtonProps } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import type { MenuItem } from '@/ui/Menu'
import { SplitButton } from '@/ui/SplitButton'
import { cn } from '@/utils/styles'

import { useActionButtonTracker } from './utils'

type TrackOnlyActionButtonProps<T> = BaseActionButtonProps & {
  /**
   * The action that is tracked by the button.
   */
  mainAction: Action<T>

  /**
   * If `true`, the button will only track the action's state, and not trigger it when clicked.
   */
  trackOnly: true
}

type RunnerActionButtonProps = BaseActionButtonProps & {
  /**
   * The action that is triggered when the button is clicked.
   */
  mainAction: Action

  /**
   * If `false`, the button will run the action when clicked.
   */
  trackOnly?: false
}

type ActionButtonProps<T> =
  | TrackOnlyActionButtonProps<T>
  | RunnerActionButtonProps

interface BaseActionButtonProps extends ButtonProps {
  /**
   * Whether to display the button in its compact form,
   * showing only its icon, and with its label in a tooltip.
   */
  compact?: boolean

  /**
   * Additional props used for the dropdown menu if alternatives are provided.
   */
  menuButtonProps?: Partial<ButtonProps>

  /**
   * A list of alternative actions that can be selected from a dropdown menu.
   *
   * When selected, they are run and tracked like the main action.
   */
  alternatives?: Action[]
}

/**
 * A {@link Button} that triggers and tracks an action, reflecting its state during its lifecycle.
 *
 * It can also display and track alternatives through a dropdown menu, in which case it becomes a {@link SplitButton}.
 */
const ActionButton = <T,>(props: ActionButtonProps<T>) => {
  const {
    mainAction,
    alternatives,
    trackOnly,
    compact,
    menuButtonProps,
    ...buttonProps
  } = props

  const runAction = useRunAction()

  const { Glyph, label, actionStatus, buttonStatus } = useActionButtonTracker(
    mainAction,
    alternatives,
    buttonProps.status ?? 'neutral',
  )

  const menuItems: MenuItem[] =
    alternatives?.map((alternative) => ({
      label: alternative.label.idle,
      Glyph: alternative.Glyph,
      onClick: () => {
        if (actionStatus !== 'running') {
          runAction(alternative.id, alternative.run)
        }
      },
    })) ?? []

  return alternatives?.length ? (
    <SplitButton
      {...buttonProps}
      items={menuItems}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        if (!trackOnly && actionStatus !== 'running') {
          runAction(mainAction.id, mainAction.run)
        }
      }}
      description={compact ? label : undefined}
      status={buttonStatus}
      menuButtonProps={menuButtonProps}
    >
      <Icon
        size={buttonProps.size}
        Glyph={Glyph}
        className={cn(actionStatus === 'running' && 'animate-spin')}
      />
      {!compact && label}
    </SplitButton>
  ) : (
    <Button
      {...buttonProps}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        if (!trackOnly && actionStatus !== 'running') {
          runAction(mainAction.id, mainAction.run)
        }
      }}
      description={compact ? label : undefined}
      status={buttonStatus}
    >
      <Icon
        size={buttonProps.size}
        Glyph={Glyph}
        className={cn(actionStatus === 'running' && 'animate-spin')}
      />
      {!compact && label}
    </Button>
  )
}

export {
  ActionButton,
  type ActionButtonProps,
  type TrackOnlyActionButtonProps,
  type RunnerActionButtonProps,
}
