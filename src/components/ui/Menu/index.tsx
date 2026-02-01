import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

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
      {...propsWithCn(
        menuProps,
        'z-1',
        'rounded-md shadow-md p-1',
        'bg-dark-300 min-w-max',
      )}
    />
  )
}

export { Menu, type MenuProps }
