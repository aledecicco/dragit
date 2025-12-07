import type { MouseEvent } from 'react'
import { match } from 'ts-pattern'

import { type Action, hashId, runAction } from '@/context/actions'
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
  // biome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the actions.
  alternatives?: ActionProps<any>[]
}

type ActionProps<T> =
  | {
      /**
       * The action that is triggered when the button is clicked.
       */
      action: Action<T>

      /**
       * Callback that requests the arguments to run the action.
       */
      argsRequester: () => Promise<T>
    }
  | {
      /**
       * The action that is triggered when the button is clicked.
       */
      action: Action

      /**
       * Callback that requests the arguments to run the action.
       */
      argsRequester?: never
    }

type ActionButtonProps<T> = BaseActionButtonProps & ActionProps<T>

/**
 * A {@link Button} that triggers and tracks an action, reflecting its state during its lifecycle.
 *
 * It can also display and track alternatives through a dropdown menu, in which case it becomes a {@link SplitButton}.
 */
const ActionButton = <T,>(props: ActionButtonProps<T>) => {
  const {
    status,
    action,
    argsRequester,
    alternatives,
    menuButtonProps,

    ...buttonProps
  } = props

  const { Glyph, label, actionStatus } = useActionButtonTracker(
    action,
    alternatives?.map((alt) => alt.action),
  )
  const buttonStatus = match(actionStatus)
    .returnType<ButtonStatus>()
    .with('idle', () => status ?? 'neutral')
    .with('running', () => status ?? 'neutral')
    .with('success', () => 'success')
    .with('error', () => 'danger')
    .with('disabled', () => status ?? 'neutral')
    .exhaustive()

  const commonProps = {
    ...buttonProps,
    label: label,
    Glyph: Glyph,
    status: buttonStatus,
    disabled: buttonProps.disabled || actionStatus === 'disabled',
    iconProps: propsWithCn(
      buttonProps.iconProps,
      actionStatus === 'running' ? 'animate-spin' : undefined,
    ),
    onClick: async (e: MouseEvent<HTMLButtonElement>) => {
      buttonProps.onClick?.(e)

      if (actionStatus !== 'running') {
        if (argsRequester) {
          const args = await argsRequester()
          runAction(action, args)
        } else {
          runAction(action)
        }
      }
    },
  }

  return alternatives ? (
    <SplitButton
      {...commonProps}
      items={alternatives.map((alternative) => (
        <MenuItem key={hashId(alternative.action.id)} {...alternative} />
      ))}
      menuButtonProps={{
        label: 'View alternatives',
        ...menuButtonProps,
        disabled:
          actionStatus === 'running' ||
          actionStatus === 'disabled' ||
          menuButtonProps?.disabled ||
          buttonProps.disabled,
      }}
    />
  ) : (
    <DecoratedButton {...commonProps} />
  )
}

export { ActionButton, type ActionButtonProps }
