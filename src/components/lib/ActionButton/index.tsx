import type { MouseEvent } from 'react'

import {
  type Action,
  hashId,
  runAction,
  useActionStatuses,
} from '@/context/actions'
import { Button } from '@/ui/Button'
import { MenuItem } from '@/ui/Menu/Item'
import { SplitButton } from '@/ui/SplitButton'

import { DecoratedButton, type DecoratedButtonProps } from '../DecoratedButton'
import { useActionButtonAction } from './utils'

/**
 * Flows that will be triggered with a click, and that result in an action being run.
 */
type Interaction<T> =
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
      action: Action

      argsRequester?: never
    }

type AnyInteraction = Interaction<never>

type BaseActionButtonProps = Partial<DecoratedButtonProps> & {
  /**
   * Additional props used for the dropdown menu if alternatives are provided.
   */
  menuButtonProps?: Partial<DecoratedButtonProps>

  /**
   * A list of alternative actions that can be selected from a dropdown menu.
   *
   * When selected, they are run and tracked like the main action.
   */
  alternatives?: AnyInteraction[]
}

type ActionButtonProps<T> = BaseActionButtonProps & Interaction<T>

/**
 * A {@link Button} that triggers and tracks an action, reflecting its state during its lifecycle.
 *
 * It can also display and track alternatives through a dropdown menu, in which case it becomes a {@link SplitButton}.
 */
const ActionButton = <T,>(props: ActionButtonProps<T>) => {
  const {
    action,
    argsRequester,
    alternatives,
    menuButtonProps,
    ...buttonProps
  } = props

  const activeAction = useActionButtonAction(
    action,
    alternatives?.map((alt) => alt.action),
  )
  const actionStatus = useActionStatuses(activeAction)

  const commonProps = {
    ...buttonProps,

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
      track={activeAction}
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
    <DecoratedButton {...commonProps} track={activeAction} />
  )
}

export {
  ActionButton,
  type ActionButtonProps,
  type Interaction,
  type AnyInteraction,
}
