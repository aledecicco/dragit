import { type ReactNode, useRef } from 'react'
import * as Ariakit from '@ariakit/react'

import { Menu } from '@/ui/Menu'
import { cn } from '@/utils/styles'

export const CONTEXT_MENU_HANDLER_KEY = Symbol.for(
  'dragit/CONTEXT_MENU_HANDLER',
)

interface ContextMenuEvent extends MouseEvent {
  [CONTEXT_MENU_HANDLER_KEY]?: string
}

interface ContextMenuProps
  extends Omit<Ariakit.RoleProps, 'children' | 'render'> {
  children: Ariakit.RoleProps['render']

  /**
   * The contents to be displayed in the context menu.
   */
  items: ReactNode

  /**
   * Additional props to pass to the menu.
   */
  menuProps?: Ariakit.MenuStoreProps

  /**
   * An optional id for ownership tracking of events.
   */
  menuId?: string
}

/**
 * A context menu that appears on right-click.
 */
const ContextMenu = (props: ContextMenuProps) => {
  const { children, items, menuProps, menuId, ...anchorProps } = props

  const menu = Ariakit.useMenuStore({ focusLoop: true, ...menuProps })
  const anchorRect = useRef({ x: 0, y: 0 })

  return (
    <>
      <Ariakit.Role
        render={children}
        {...anchorProps}
        onContextMenu={(e) => {
          const nativeEvent: ContextMenuEvent = e.nativeEvent

          if (
            nativeEvent[CONTEXT_MENU_HANDLER_KEY] &&
            nativeEvent[CONTEXT_MENU_HANDLER_KEY] !== menuId
          ) {
            return
          }

          anchorProps.onContextMenu?.(e)

          if (e.defaultPrevented) {
            return
          }

          e.preventDefault()
          e.stopPropagation()

          anchorRect.current = { x: e.clientX + 5, y: e.clientY - 5 }
          menu.show()
        }}
      />

      <Menu
        store={menu}
        modal
        unmountOnHide
        autoFocus
        getAnchorRect={() => anchorRect.current}
        className={cn('min-w-30 border border-dark-50')}
      >
        {items}
      </Menu>
    </>
  )
}

export { ContextMenu, type ContextMenuProps, type ContextMenuEvent }
