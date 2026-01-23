import { type ReactNode, useState } from 'react'
import * as Ariakit from '@ariakit/react'

import { Menu, type MenuProps } from '@/ui/Menu'
import { propsWithCn } from '@/utils/styles'

interface ContextMenuProps extends Omit<Ariakit.RoleProps, 'children'> {
  children: Ariakit.RoleProps['render']

  /**
   * The contents to be displayed in the context menu.
   */
  items: ReactNode

  /**
   * Additional props to pass to the menu.
   */
  menuProps?: MenuProps
}

/**
 * A context menu that appears on right-click.
 */
const ContextMenu = (props: ContextMenuProps) => {
  const { children, items, menuProps, ...anchorProps } = props

  const menu = Ariakit.useMenuStore({ focusLoop: true })
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })

  return (
    <>
      <Ariakit.Role
        render={children}
        onContextMenu={(e) => {
          anchorProps.onContextMenu?.(e)

          e.preventDefault()
          e.stopPropagation()
          setAnchorRect({ x: e.clientX + 5, y: e.clientY - 5 })
          menu.show()
        }}
        {...anchorProps}
      />

      <Menu
        store={menu}
        modal={false}
        getAnchorRect={() => anchorRect}
        {...propsWithCn(menuProps, 'min-w-30 border border-dark-50')}
      >
        {items}
      </Menu>
    </>
  )
}

export { ContextMenu, type ContextMenuProps }
