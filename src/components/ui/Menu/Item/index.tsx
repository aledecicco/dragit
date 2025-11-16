import * as Ariakit from '@ariakit/react'

import type { Action } from '@/context/actions'
import { ActionButton } from '@/lib/ActionButton'
import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import { propsWithCn } from '@/utils/styles'

import { Menu } from '..'

interface BaseMenuItemProps extends Ariakit.MenuItemProps {}

type MenuItemProps = CommonMenuItemProps | ActionMenuItemProps

type CommonMenuItemProps = BaseMenuItemProps & DecoratedButtonProps

type ActionMenuItemProps = BaseMenuItemProps &
  Partial<DecoratedButtonProps> &
  (
    | {
        // biome-ignore lint/suspicious/noExplicitAny: Menu items need to accept actions with different parameter types.
        action: Action<any>
        trackOnly: true
        onClick: () => void
      }
    | { action: Action<void>; trackOnly?: false }
  )

/**
 * A single menu item inside a {@link Menu}.
 */
const MenuItem = (props: MenuItemProps) => {
  if ('action' in props) {
    return <ActionMenuItem {...props} />
  }

  return (
    <BaseMenuItem
      render={<DecoratedButton variant="plain" size="sm" {...props} />}
    />
  )
}

const ActionMenuItem = (props: ActionMenuItemProps) => {
  const { action, trackOnly, ...itemProps } = props

  const actionProps = trackOnly
    ? { onClick: props.onClick, mainAction: action, trackOnly }
    : { mainAction: action, trackOnly }

  return (
    <BaseMenuItem
      render={
        <ActionButton
          variant="plain"
          size="sm"
          {...actionProps}
          {...itemProps}
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
