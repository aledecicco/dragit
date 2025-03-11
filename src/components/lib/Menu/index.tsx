import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import type { MouseEventHandler } from 'react'
import { match } from 'ts-pattern'

import { type Glyph, Icon } from '@lib/Icon'
import type { Size } from '@utils/types'

interface MenuItem extends Ariakit.MenuItemProps {
  Glyph?: Glyph
  label: string
  action: MouseEventHandler<HTMLDivElement>
}

interface MenuProps extends Ariakit.MenuProps {
  anchor: NonNullable<Ariakit.MenuButtonProps['render']>
  items: MenuItem[]
  size?: Size
}

const Menu = (props: MenuProps) => {
  const { anchor, items, size = 'md', ...menuProps } = props

  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton render={anchor}>
        <Ariakit.MenuButtonArrow
          className={clsx('group-aria-expanded:rotate-180')}
        />
      </Ariakit.MenuButton>

      <Ariakit.Menu
        gutter={4}
        portal
        unmountOnHide
        {...menuProps}
        className={clsx(
          'rounded-lg shadow-md p-1',
          'bg-dark-300',
          menuProps.className,
        )}
      >
        {items.map((menuItem) => {
          const { Glyph, label, action, ...menuItemProps } = menuItem
          return (
            <Ariakit.MenuItem
              key={label}
              onClick={action}
              {...menuItemProps}
              className={clsx(
                'flex flex-row items-center gap-x-2 text-nowrap',
                'rounded-sm text-light-50',
                match(size)
                  .with('sm', () => 'text-xs p-0.5')
                  .with('md', () => 'text-xs p-1')
                  .with('lg', () => 'text-sm p-2')
                  .exhaustive(),
                'cursor-pointer hover:bg-dark-200 data-[active-item]:bg-dark-200',
                menuItemProps.className,
              )}
            >
              {Glyph && <Icon Glyph={Glyph} size="sm" />}
              {label}
            </Ariakit.MenuItem>
          )
        })}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  )
}

export { Menu, type MenuProps, type MenuItem }
