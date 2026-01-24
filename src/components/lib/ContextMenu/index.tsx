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

  /**
   * Whether this context menu is an outer menu that has priority over children.
   */
  isOuter?: boolean
}

/**
 * A context menu that appears on right-click.
 */
const ContextMenu = (props: ContextMenuProps) => {
  const { children, items, menuProps, isOuter, ...anchorProps } = props

  const menu = Ariakit.useMenuStore({ focusLoop: true })
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })

  return (
    <>
      <Ariakit.Role
        render={children}
        onContextMenu={(e) => {
          anchorProps.onContextMenu?.(e)

          if (e.defaultPrevented && !isOuter) {
            return
          }

          e.preventDefault()
          e.stopPropagation()
          setAnchorRect({ x: e.clientX + 5, y: e.clientY - 5 })
          menu.show()
        }}
        {...anchorProps}
      />

      <Ariakit.MenuProvider store={menu}>
        <Menu
          modal={true}
          unmountOnHide
          autoFocusOnShow
          getAnchorRect={() => anchorRect}
          {...propsWithCn(menuProps, 'min-w-30 border border-dark-50')}
        >
          {items}
        </Menu>
      </Ariakit.MenuProvider>
    </>
  )
}

export { ContextMenu, type ContextMenuProps }
