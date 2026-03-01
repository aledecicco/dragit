import { Fragment, useEffect } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

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
import { Draggable } from '../DragAndDrop/Draggable'
import { type DragPayload, overridePayload } from '../DragAndDrop/utils'
import { MultiSelect, type MultiSelectProps } from '../MultiSelect'
import { useSelectedItems, useSelectionUpdater } from '../MultiSelect/context'

interface MultiInteractionProps<T>
  extends Omit<MultiSelectProps, 'itemsCount'> {
  /**
   * Callback that returns the list of ways to interact with the selected items.
   */
  getActions: (items: T[]) => Action<T[]>[][]

  /**
   * The items being interacted with.
   */
  items: T[]

  /**
   * Callback that returns the payload to be used when dragging the selected items.
   *
   * @param items - The currently selected items.
   */
  getDragPayload: (items: T[]) => DragPayload
}
/**
 * A component that allows selecting arbitrary child items and performing actions on all of them.
 */
const MultiInteraction = <T,>(props: MultiInteractionProps<T>) => {
  const { getActions, items, getDragPayload, children, ...multiSelectProps } =
    props

  return (
    <MultiSelect itemsCount={items.length} {...multiSelectProps}>
      <MultiInteractionInner
        getActions={getActions}
        items={items}
        getDragPayload={getDragPayload}
      >
        {children}
      </MultiInteractionInner>
    </MultiSelect>
  )
}

type MultiInteractionInnerProps<T> = Pick<
  MultiInteractionProps<T>,
  'getActions' | 'items' | 'getDragPayload' | 'children'
> &
  Omit<Ariakit.RoleProps, 'children'>

const MultiInteractionInner = <T,>(props: MultiInteractionInnerProps<T>) => {
  const { getActions, items, getDragPayload, children, ref, ...contentProps } =
    props

  const composite = Ariakit.useCompositeContext()
  const { setSelection } = useSelectionUpdater()
  const selectedItemIndexes = useSelectedItems()
  const selectedItems = items.filter((_, index) =>
    selectedItemIndexes.has(index),
  )

  const menuId = useUniqueId()
  const actions = getActions(selectedItems)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset selection when items change
  useEffect(() => {
    setSelection([])
  }, [items])

  const allItemsPayload = getDragPayload(items)

  return (
    <Draggable
      dragPayload={allItemsPayload}
      onBeforeDrag={({ element, source, manager }) => {
        const compositeItem = composite
          ?.getState()
          .renderedItems.find((item) => item.element?.contains(element))

        if (compositeItem) {
          const itemId = Number(compositeItem.id)
          const draggedItem = items.at(itemId)

          if (draggedItem) {
            // If more than one item is selected upon dragging, and the dragged item is among the selected ones,
            // set the drag payload to include all selected items.
            if (
              selectedItemIndexes.size > 1 &&
              selectedItemIndexes.has(itemId)
            ) {
              overridePayload(
                () => getDragPayload(selectedItems),
                source,
                manager,
              )
            } else {
              setSelection(itemId)
            }
          }
        } else {
          setSelection([...Array(items.length).keys()])
        }
      }}
      className={cn('border-none')}
    >
      <ContextMenu
        {...contentProps}
        ref={mergeRefs([ref])}
        menuId={menuId}
        onContextMenu={(e) => {
          if (selectedItemIndexes.size <= 1) {
            e.preventDefault()
          }
        }}
        onContextMenuCapture={(e) => {
          const target = e.target

          if (!(target instanceof HTMLElement)) {
            return
          }

          const itemIndex =
            composite
              ?.getState()
              .renderedItems.findIndex((item) =>
                item.element?.contains(target),
              ) ?? -1

          if (
            selectedItemIndexes.size > 1 &&
            itemIndex >= 0 &&
            selectedItemIndexes.has(itemIndex)
          ) {
            const nativeEvent: ContextMenuEvent = e.nativeEvent
            nativeEvent[CONTEXT_MENU_HANDLER_KEY] = menuId
          }
        }}
        items={actions
          .filter((section) => section.length > 0)
          .map((section, i) => (
            <Fragment key={`${i + 1}`}>
              {i > 0 && <Separator className={cn('my-0.5')} />}
              {section.map((action, j) => (
                <MenuItem
                  key={`${i + 1}-${j + 1}`}
                  action={action}
                  argsRequester={() => selectedItems}
                >
                  {' '}
                  ({selectedItems.length})
                </MenuItem>
              ))}
            </Fragment>
          ))}
      >
        {children}
      </ContextMenu>
    </Draggable>
  )
}

export { MultiInteraction, type MultiInteractionProps }
