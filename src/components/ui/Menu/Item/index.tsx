import * as Ariakit from '@ariakit/react'

import { ActionButton, type ActionButtonProps } from '@/lib/ActionButton'
import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import { cn } from '@/utils/styles'

import { Menu } from '..'

type MenuItemProps<T> = ActionButtonProps<T> | DecoratedButtonProps

/**
 * A single menu item inside a {@link Menu}.
 */
const MenuItem = <T,>(props: MenuItemProps<T>) => {
  const { ...buttonProps } = props

  return (
    <Ariakit.MenuItem
      className={cn(
        'shrink-0 gap-x-2 justify-start text-nowrap min-w-max w-full',
        'font-medium',
        'nth-[n+3]:rounded-t-none not-last-of-type:rounded-b-none',
      )}
      render={
        'action' in buttonProps ? (
          <ActionButton
            variant="plain"
            size="sm"
            {...(buttonProps as ActionButtonProps<T>)}
          />
        ) : (
          <DecoratedButton variant="plain" size="sm" {...buttonProps} />
        )
      }
    />
  )
}

export { MenuItem, type MenuItemProps }
