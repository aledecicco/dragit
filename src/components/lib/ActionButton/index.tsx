import type { MouseEvent } from 'react'
import { match } from 'ts-pattern'

import { type Action, runAction } from '@/context/actions'
import { Button, type ButtonStatus } from '@/ui/Button'
import { MenuItem } from '@/ui/Menu/Item'
import { SplitButton } from '@/ui/SplitButton'
import { propsWithCn } from '@/utils/styles'

import { DecoratedButton, type DecoratedButtonProps } from '../DecoratedButton'
import { useActionButtonTracker } from './utils'

interface BaseActionButtonProps extends Partial<DecoratedButtonProps> {
  /**
   * Additional props used for the dropdown menu if alternatives are provided.
   */
  menuButtonProps?: Partial<DecoratedButtonProps>

  /**
   * A list of alternative actions that can be selected from a dropdown menu.
   *
   * When selected, they are run and tracked like the main action.
   */
  alternatives?: Action[]
}

type TrackOnlyActionButtonProps<T> = BaseActionButtonProps & {
  /**
   * The action that is tracked by the button.
   */
  mainAction: Action<T>

  /**
   * If `true`, the button will only track the action's state, and not trigger it when clicked.
   * If `false`, the button will run the action when clicked.
   */
  trackOnly: true
}

type RunnerActionButtonProps = BaseActionButtonProps & {
  /**
   * The action that is triggered when the button is clicked.
   */
  mainAction: Action

  /**
   * If `true`, the button will only track the action's state, and not trigger it when clicked.
   * If `false`, the button will run the action when clicked.
   */
  trackOnly?: false
}

type ActionButtonProps<T> =
  | TrackOnlyActionButtonProps<T>
  | RunnerActionButtonProps

/**
 * A {@link Button} that triggers and tracks an action, reflecting its state during its lifecycle.
 *
 * It can also display and track alternatives through a dropdown menu, in which case it becomes a {@link SplitButton}.
 */
const ActionButton = <T,>(props: ActionButtonProps<T>) => {
  const {
    status,
    mainAction,
    alternatives,
    menuButtonProps,
    trackOnly,
    ...buttonProps
  } = props

  const { Glyph, label, actionStatus } = useActionButtonTracker(
    mainAction,
    alternatives,
  )
  const buttonStatus = match(actionStatus)
    .returnType<ButtonStatus>()
    .with('idle', () => status ?? 'neutral')
    .with('running', () => status ?? 'neutral')
    .with('success', () => 'success')
    .with('error', () => 'danger')
    .exhaustive()

  const commonProps = {
    ...buttonProps,
    label: label,
    Glyph: Glyph,
    status: buttonStatus,
    iconProps: propsWithCn(
      buttonProps.iconProps,
      actionStatus === 'running' ? 'animate-spin' : undefined,
    ),
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      buttonProps.onClick?.(e)
      if (!trackOnly && actionStatus !== 'running') {
        runAction(mainAction)
      }
    },
  }

  return alternatives ? (
    <SplitButton
      {...commonProps}
      items={alternatives.map((alternative) => (
        <MenuItem
          key={alternative.label.idle}
          label={alternative.label.idle}
          Glyph={alternative.Glyph}
          onClick={() => {
            if (actionStatus !== 'running') {
              runAction(alternative)
            }
          }}
        />
      ))}
      menuButtonProps={{
        label: 'View alternatives',
        ...menuButtonProps,
        disabled:
          actionStatus === 'running' ||
          menuButtonProps?.disabled ||
          buttonProps.disabled,
      }}
    />
  ) : (
    <DecoratedButton {...commonProps} />
  )
}

export {
  ActionButton,
  type ActionButtonProps,
  type TrackOnlyActionButtonProps,
  type RunnerActionButtonProps,
}
