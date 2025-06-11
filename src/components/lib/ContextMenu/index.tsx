import * as Ariakit from '@ariakit/react'
import { type ComponentType, type HTMLAttributes, useState } from 'react'
import { useEffectOnce } from 'react-use'

import { Menu, type MenuProps } from '@ui/Menu'
import { cn } from '@utils/styles'
import type { AnyObject } from '@utils/types'

interface ContextMenuProps {
  contextMenuItems: MenuProps['items']
}

/**
 * HOC that wraps a component and gives it a context menu.
 *
 * @param WrappedComponent - The constructor of the component to augment.
 * @param useMenuItems - A hook that returns the items to be displayed in the context menu.
 */
const withContextMenu = <P extends AnyObject>(
  WrappedComponent: ComponentType<
    HTMLAttributes<HTMLElement> & Omit<P, keyof ContextMenuProps>
  >,
  useMenuItems: (props: P) => ContextMenuProps['contextMenuItems'],
) => {
  const TrackedComponent = (props: P) => {
    const { ...componentProps } = props
    const menuItems = useMenuItems(props)

    const menu = Ariakit.useMenuStore()
    const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })
    return (
      <>
        <WrappedComponent
          {...componentProps}
          onContextMenu={(e) => {
            setAnchorRect({ x: e.clientX + 10, y: e.clientY - 20 })
            menu.show()
          }}
        />

        <Menu
          className={cn('min-w-30 border-1 border-dark-50')}
          modal
          size="md"
          store={menu}
          items={menuItems}
          getAnchorRect={() => anchorRect}
        />
      </>
    )
  }

  return TrackedComponent
}

/**
 * Hook that prevents the default context menu from appearing on right-click.
 */
const useContextMenuHandler = () => {
  useEffectOnce(() => {
    window.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })
  })
}

export { withContextMenu, useContextMenuHandler }
