import * as Ariakit from '@ariakit/react'
import type { MouseEventHandler } from 'react'
import { match } from 'ts-pattern'

import { type Glyph, Icon } from '@ui/Icon'
import { cn, propsWithCn } from '@utils/styles'
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
      <Ariakit.MenuButton render={anchor} className={cn('group/menu')}>
        <Ariakit.MenuButtonArrow
          className={cn('group-aria-expanded/menu:rotate-180')}
        />
      </Ariakit.MenuButton>

      <Ariakit.Menu
        gutter={4}
        portal
        unmountOnHide
        {...propsWithCn(
          menuProps,
          'rounded-lg shadow-md p-1',
          'bg-dark-300 min-w-max',
        )}
      >
        {items.map((menuItem) => {
          const { Glyph, label, action, ...menuItemProps } = menuItem
          return (
            <Ariakit.MenuItem
              key={label}
              onClick={action}
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
