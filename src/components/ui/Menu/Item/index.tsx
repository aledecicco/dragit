import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { type Action, runAction, useActionPresenters } from '@/context/actions'
import { type Glyph, Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

import { Menu } from '..'

interface BaseMenuItemProps extends Ariakit.MenuItemProps {
  /**
   * The size of the item.
   */
  size?: Size
}

type MenuItemProps = CommonMenuItemProps | ActionMenuItemProps

interface CommonMenuItemProps extends BaseMenuItemProps {
  /**
   * The label of the item.
   */
  label: string

  /**
   * The icon of the item.
   */
  Glyph: Glyph
}

type ActionMenuItemProps = BaseMenuItemProps &
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

  const { label, Glyph, ...itemProps } = props

  return (
    <BaseMenuItem {...itemProps}>
      <Icon Glyph={Glyph} />
      {label}
    </BaseMenuItem>
  )
}

const ActionMenuItem = (props: ActionMenuItemProps) => {
  const { action, trackOnly, ...itemProps } = props
  const { Glyph, label, actionStatus } = useActionPresenters(action)

  return (
    <BaseMenuItem
      {...itemProps}
      onClick={(e) => {
        itemProps.onClick?.(e)

        if (!trackOnly && actionStatus !== 'running') {
          runAction(action)
        }
      }}
    >
      <Icon
        Glyph={Glyph}
        className={cn(actionStatus === 'running' && 'animate-spin')}
      />
      {label}
    </BaseMenuItem>
  )
}

const BaseMenuItem = (props: BaseMenuItemProps) => {
  const { size = 'md', ...itemProps } = props

  return (
    <Ariakit.MenuItem
      focusable
      {...propsWithCn(
        itemProps,
        'flex flex-row shrink-0 items-center gap-x-2 text-nowrap min-w-max',
        'rounded-sm text-light-50 aria-disabled:text-light-50/50',
        match(size)
          .with('sm', () => 'text-xs p-0.5')
          .with('md', () => 'text-xs p-1')
          .with('lg', () => 'text-sm p-2')
          .exhaustive(),
        'cursor-pointer hover:bg-dark-100 data-[active-item]:bg-dark-100',
      )}
    />
  )
}

export { MenuItem, type MenuItemProps }
