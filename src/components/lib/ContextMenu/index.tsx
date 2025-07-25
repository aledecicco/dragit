import { type ComponentType, type HTMLAttributes, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconLoader2 } from '@tabler/icons-react'
import { useEffectOnce } from 'react-use'

import { type Action, runAction, useActionStatuses } from '@/context/actions'
import { Icon } from '@/ui/Icon'
import { Menu, type MenuItem } from '@/ui/Menu'
import { cn } from '@/utils/styles'
import type { AnyObject } from '@/utils/types'

interface ContextMenuProps {
  actions: Action<void>[]
}

/**
 * HOC that wraps a component and gives it a context menu.
 *
 * @param WrappedComponent - The constructor of the component to augment.
 * @param useActions - A hook that returns the actions that can be triggered from the context menu.
 */
const withContextMenu = <P extends AnyObject>(
  WrappedComponent: ComponentType<
    HTMLAttributes<HTMLElement> & Omit<P, keyof ContextMenuProps>
  >,
  useActions: (props: P) => ContextMenuProps['actions'],
) => {
  const TrackedComponent = (props: P) => {
    const { ...componentProps } = props

    const actions = useActions(props)
    const actionStatuses = useActionStatuses(actions.map((action) => action.id))

    const menuItems: MenuItem[] =
      actions.map((action, index) => {
        const status = actionStatuses.at(index) ?? 'idle'

        return {
          label:
            status === 'running' ? action.label.running : action.label.idle,
          decorator: (
            <Icon
              Glyph={status === 'running' ? IconLoader2 : action.Glyph}
              className={cn(status === 'running' && 'animate-spin')}
              size="sm"
            />
          ),
          disabled: status === 'running',
          onClick: () => {
            runAction(action)
          },
        }
      }) ?? []

    const menu = Ariakit.useMenuStore()
    const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 })

    return (
      <>
        <WrappedComponent
          {...componentProps}
          onContextMenu={(e) => {
            setAnchorRect({ x: e.clientX + 5, y: e.clientY - 5 })
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
