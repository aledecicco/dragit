import React, { type ReactNode, useState } from 'react'
import * as Ariakit from '@ariakit/react'

import { Menu, type MenuProps } from '@/ui/Menu'
import { propsWithCn } from '@/utils/styles'

interface ContextMenuProps extends Omit<MenuProps, 'children'> {
  children: Ariakit.RoleProps['render']

  /**
   * The contents to be displayed in the context menu.
   */
  items: ReactNode
}

/**
 * A context menu that appears on right-click.
 */
const ContextMenu = (props: ContextMenuProps) => {
  const { children, items, ...menuProps } = props

  const menu = Ariakit.useMenuStore({ focusLoop: true })
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })

  return (
    <>
      <Ariakit.Role
        render={children}
        onContextMenu={(e: React.MouseEvent) => {
          setAnchorRect({ x: e.clientX + 5, y: e.clientY - 5 })
          menu.show()
        }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          e.preventDefault()
        }}
      />

      <Menu
        store={menu}
        modal
        getAnchorRect={() => anchorRect}
        {...propsWithCn(menuProps, 'min-w-30 border border-dark-50')}
      >
        {items}
      </Menu>
    </>
  )
}

export { ContextMenu, type ContextMenuProps }
