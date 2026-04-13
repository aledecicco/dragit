import type { MouseEvent } from 'react'
import { match } from 'ts-pattern'

import {
  type AnyInteraction,
  hashId,
  type Interaction,
  triggerInteraction,
  useActionStatuses,
} from '@/state/actions'
import { Button } from '@/ui/Button'
import { MenuItem } from '@/ui/Menu/Item'
import { SplitButton } from '@/ui/SplitButton'
import { cn } from '@/utils/styles'
import type { Size } from '@/utils/types'

import { DecoratedButton, type DecoratedButtonProps } from '../DecoratedButton'
import { useActionButtonAction } from './utils'

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
    isDangerous,
    details,
    alternatives,
    menuButtonProps,
    ...buttonProps
  } = props

  const activeAction = useActionButtonAction(
    action,
    alternatives?.map((alt) => alt.action),
  )
  const actionStatus = useActionStatuses(activeAction)

  const commonProps: Partial<DecoratedButtonProps> = {
    ...buttonProps,

    status: isDangerous ? 'danger' : buttonProps.status,

    onClick: async (e: MouseEvent<HTMLButtonElement>) => {
      buttonProps.onClick?.(e)

      if (actionStatus === 'idle') {
        if (argsRequester) {
          triggerInteraction({ action, argsRequester, isDangerous, details })
        } else {
          triggerInteraction({ action, isDangerous, details })
        }
      }
    },
  }

  return alternatives ? (
    <SplitButton
      {...commonProps}
      track={activeAction}
      items={alternatives.map((alternative) => (
        <MenuItem
          key={hashId(alternative.action.id)}
          {...alternative}
          className={cn('max-w-full overflow-hidden')}
          size={match(commonProps.size)
            .returnType<Size>()
            .with('xs', () => 'xs')
            .with('sm', () => 'xs')
            .with('md', () => 'sm')
            .with('lg', () => 'md')
            .with(undefined, () => 'sm')
            .exhaustive()}
          status={commonProps.status}
          disabled={actionStatus === 'running' || actionStatus === 'disabled'}
        />
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
