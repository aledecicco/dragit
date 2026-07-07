import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

import { MenuItem } from './Item'

interface MenuProps extends Ariakit.MenuProps {}

/**
 * Menu that displays a list of menu items, each of which can have an icon and a label.
 *
 * Should contain {@link MenuItem} components as children.
 */
const Menu = (props: MenuProps) => {
  const { ...menuProps } = props

  return (
    <Ariakit.Menu
      gutter={4}
      modal
      {...propsWithCn(
        menuProps,
        'z-8',
        'opacity-0 data-enter:opacity-100 transition-opacity duration-100 ease-in-out',
        'rounded-md shadow-md',
        'bg-dark-300',
        '*:[[role=menuitem]]:not-first-of-type:rounded-t-none',
        '*:[[role=menuitem]]:not-last-of-type:rounded-b-none',
      )}
      onBlur={(e) => {
        menuProps.onBlur?.(e)

        if (!e.relatedTarget) {
          // Hide the menu if focus leaves to an element that's not a menu item.
          menuProps.store?.hide()
        }
      }}
    />
  )
}

export { Menu, type MenuProps }
