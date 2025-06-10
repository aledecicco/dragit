import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { type Glyph, Icon } from '@ui/Icon'
import { propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

interface MenuItem extends Ariakit.MenuItemProps {
  Glyph?: Glyph
  label?: string
}

interface MenuProps extends Ariakit.MenuProps {
  /**
   * Descriptions of the menu items to display.
   */
  items: MenuItem[]

  /**
   * Size of the menu items.
   */
  size?: Size
}

/**
 * Menu that displays a list of menu items, each of which can have an icon and a label.
 */
const Menu = (props: MenuProps) => {
  const { items, size = 'md', ...menuProps } = props

  return (
    <Ariakit.Menu
      gutter={4}
      portal
      unmountOnHide
      {...propsWithCn(
        menuProps,
        'rounded-md shadow-md p-1',
        'bg-dark-300 min-w-max',
      )}
    >
      {items.map((menuItem) => {
        const { Glyph, label, ...menuItemProps } = menuItem
        return (
          <Ariakit.MenuItem
            key={label}
            {...propsWithCn(
              menuItemProps,
              'flex flex-row shrink-0 items-center gap-x-2 text-nowrap min-w-max',
              'rounded-sm text-light-50',
              match(size)
                .with('sm', () => 'text-xs p-0.5')
                .with('md', () => 'text-xs p-1')
                .with('lg', () => 'text-sm p-2')
                .exhaustive(),
              'cursor-pointer hover:bg-dark-100 data-[active-item]:bg-dark-100',
            )}
          >
            {Glyph && <Icon Glyph={Glyph} size={size} />}
            {label}
          </Ariakit.MenuItem>
        )
      })}
    </Ariakit.Menu>
  )
}

export { Menu, type MenuProps, type MenuItem }
