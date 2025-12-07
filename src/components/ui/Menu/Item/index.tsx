import * as Ariakit from '@ariakit/react'

import { ActionButton, type ActionButtonProps } from '@/lib/ActionButton'
import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import { propsWithCn } from '@/utils/styles'

import { Menu } from '..'

interface BaseMenuItemProps extends Ariakit.MenuItemProps {}

type MenuItemProps<T = void> = CommonMenuItemProps | ActionMenuItemProps<T>

type CommonMenuItemProps = BaseMenuItemProps & DecoratedButtonProps

type ActionMenuItemProps<T = void> = BaseMenuItemProps &
  Omit<ActionButtonProps<T>, 'alternatives'>

/**
 * A single menu item inside a {@link Menu}.
 */
const MenuItem = <T = void>(props: MenuItemProps<T>) => {
  if ('action' in props) {
    return <ActionMenuItem {...props} />
  }

  return (
    <BaseMenuItem
      render={<DecoratedButton variant="plain" size="sm" {...props} />}
    />
  )
}

const ActionMenuItem = <T = void>(props: ActionMenuItemProps<T>) => {
  return (
    <BaseMenuItem
      render={
        <ActionButton
          variant="plain"
          size="sm"
          {...(props as ActionButtonProps<T>)}
        />
      }
    />
  )
}

const BaseMenuItem = (props: BaseMenuItemProps) => {
  const { ...itemProps } = props

  return (
    <Ariakit.MenuItem
      focusable
      {...propsWithCn(
        itemProps,
        'shrink-0 gap-x-2 justify-start text-nowrap min-w-max w-full',
        'font-medium',
        'nth-[n+3]:rounded-t-none not-last-of-type:rounded-b-none',
      )}
    />
  )
}

export { MenuItem, type MenuItemProps }
