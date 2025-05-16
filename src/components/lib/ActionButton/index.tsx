import { useMemo } from 'react'

import { Button, type ButtonProps } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { SplitButton } from '@ui/SplitButton'
import { cn } from '@utils/styles'
import { type Action, type ActionState, useActionTracker } from './utils'

interface ActionButtonProps extends ButtonProps {
  mainAction: Action
  alternatives?: Action[]
  compact?: boolean
  menuButtonProps?: Partial<ButtonProps>
}

const ActionButton = (props: ActionButtonProps) => {
  const { mainAction, alternatives, compact, menuButtonProps, ...buttonProps } =
    props

  const { Glyph, label, buttonStatus, actionState, trackAction } =
    useActionTracker(mainAction, buttonProps.status ?? 'primary')

  const menuItems = useMemo(() => {
    return (
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
    )
  }, [alternatives, trackAction, actionState])

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
