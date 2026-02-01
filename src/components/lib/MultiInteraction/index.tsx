import { Fragment, useEffect } from 'react'

import type { Action } from '@/state/actions'
import { useUniqueId } from '@/state/ids'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'
import { cn } from '@/utils/styles'

import {
  CONTEXT_MENU_HANDLER_KEY,
  ContextMenu,
  type ContextMenuEvent,
} from '../ContextMenu'
import { MultiSelect, type MultiSelectProps } from '../MultiSelect'
import { useSelectedItems, useSelectionUpdater } from '../MultiSelect/context'

interface MultiInteractionProps<T>
  extends Omit<MultiSelectProps, 'itemsCount'> {
  /**
   * The list of ways to interact with the items.
   */
  actions: Action<T[]>[][]

  /**
   * The items being interacted with.
   */
  items: T[]
}
/**
 * A component that allows selecting arbitrary child items and performing actions on all of them.
 */
const MultiInteraction = <T,>(props: MultiInteractionProps<T>) => {
  const { actions, items, children, ...multiSelectProps } = props

  return (
    <MultiSelect itemsCount={items.length} {...multiSelectProps}>
      <MultiInteractionInner actions={actions} items={items}>
        {children}
      </MultiInteractionInner>
    </MultiSelect>
  )
}

const MultiInteractionInner = <T,>(props: MultiInteractionProps<T>) => {
  const { actions, items, ...contentProps } = props

  const itemIndexes = useSelectedItems()
  const { setSelection } = useSelectionUpdater()

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset selection when items change
  useEffect(() => {
    setSelection([])
  }, [items])

  const menuId = useUniqueId()

  return (
    <ContextMenu
      {...contentProps}
      menuId={menuId}
      onContextMenu={(e) => {
        if (itemIndexes.size <= 1) {
          e.preventDefault()
        }
      }}
      onContextMenuCapture={(e) => {
        if (itemIndexes.size > 1) {
          const nativeEvent: ContextMenuEvent = e.nativeEvent
          nativeEvent[CONTEXT_MENU_HANDLER_KEY] = menuId
        }
      }}
      items={actions
        .filter((section) => section.length > 0)
        .map((section, i) => (
          <Fragment key={`${i + 1}`}>
            {i > 0 && <Separator className={cn('my-0.5')} />}
            {section.map((action, j) => {
              const selectedItems = items.filter((_, index) =>
                itemIndexes.has(index),
              )

              return (
                <MenuItem
                  key={`${i + 1}-${j + 1}`}
                  action={action}
                  argsRequester={() => selectedItems}
                >
                  {' '}
                  ({selectedItems.length})
                </MenuItem>
              )
            })}
          </Fragment>
        ))}
    />
  )
}

export { MultiInteraction, type MultiInteractionProps }
