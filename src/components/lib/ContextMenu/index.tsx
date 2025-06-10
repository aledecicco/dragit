import * as Ariakit from '@ariakit/react'
import { type ComponentType, type HTMLAttributes, useState } from 'react'
import { useEffectOnce } from 'react-use'

import { Menu, type MenuProps } from '@ui/Menu'
import type { AnyObject } from '@utils/types'

interface ContextMenuProps {
  contextMenuItems: MenuProps['items']
}

/**
 * HOC that wraps a component and gives it a context menu.
 */
const withContextMenu = <P extends AnyObject>(
  WrappedComponent: ComponentType<
    HTMLAttributes<HTMLElement> & Omit<P, keyof ContextMenuProps>
  >,
) => {
  const TrackedComponent = (props: P & ContextMenuProps) => {
    const { contextMenuItems, ...componentProps } = props

    const menu = Ariakit.useMenuStore()
    const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })
    return (
      <>
        <WrappedComponent
          {...componentProps}
          onContextMenu={(e) => {
            e.stopPropagation()
            setAnchorRect({ x: e.clientX, y: e.clientY })
            menu.show()
          }}
        />

        <Menu
          store={menu}
          items={contextMenuItems}
          getAnchorRect={() => anchorRect}
        />
      </>
    )
  }

  return TrackedComponent
}

const useContextMenuHandler = () => {
  useEffectOnce(() => {
    window.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    })
  })
}

export { withContextMenu, useContextMenuHandler }
