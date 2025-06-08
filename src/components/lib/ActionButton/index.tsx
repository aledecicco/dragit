import { Button, type ButtonProps } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { SplitButton } from '@ui/SplitButton'
import { cn } from '@utils/styles'
import { type Action, type ActionState, useActionTracker } from './utils'

interface ActionButtonProps extends ButtonProps {
  /**
   * The action that is triggered when the button is clicked.
   */
  mainAction: Action

  /**
   * A list of alternative actions that can be selected from a dropdown menu.
   *
   * When selected, they are run and tracked like the main action.
   */
  alternatives?: Action[]

  /**
   * Whether to display the button in its compact form,
   * displaying only its icon, and with its label in a tooltip
   */
  compact?: boolean

  /**
   * Additional props used for the dropdown menu if alternatives are provided.
   */
  menuButtonProps?: Partial<ButtonProps>
}

/**
 * A {@link Button} that triggers and tracks an action, reflecting its state during its lifecycle.
 *
 * It can also display and track alternatives through a dropdown menu, in which case it becomes a {@link SplitButton}.
 */
const ActionButton = (props: ActionButtonProps) => {
  const { mainAction, alternatives, compact, menuButtonProps, ...buttonProps } =
    props

  const { Glyph, label, buttonStatus, actionState, trackAction } =
    useActionTracker(mainAction, buttonProps.status ?? 'primary')

  const menuItems =
    alternatives?.map((alternative) => ({
      label:
        typeof alternative.label === 'string'
          ? alternative.label
          : alternative.label.idle,
      onClick: () => {
        trackAction(alternative.run(), alternative)
      },
      disabled: actionState === 'running',
    })) ?? []

  return alternatives?.length ? (
    <SplitButton
      {...buttonProps}
      items={menuItems}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        trackAction(mainAction.run(), mainAction)
      }}
      description={compact ? label : undefined}
      status={buttonStatus}
      menuButtonProps={menuButtonProps}
    >
      <Icon
        size={buttonProps.size}
        Glyph={Glyph}
        className={cn(actionState === 'running' && 'animate-spin')}
      />
      {!compact && label}
    </SplitButton>
  ) : (
    <Button
      {...buttonProps}
      onClick={(e) => {
        buttonProps.onClick?.(e)
        trackAction(mainAction.run(), mainAction)
      }}
      description={compact ? label : undefined}
      status={buttonStatus}
    >
      <Icon
        size={buttonProps.size}
        Glyph={Glyph}
        className={cn(actionState === 'running' && 'animate-spin')}
      />
      {!compact && label}
    </Button>
  )
}

export { ActionButton, type ActionButtonProps, type Action, type ActionState }
