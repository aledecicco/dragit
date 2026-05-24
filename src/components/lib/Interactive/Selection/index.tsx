import { useEffect, useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'
import { match } from 'ts-pattern'

import { Draggable } from '@/lib/DragAndDrop/Draggable'
import {
  type DragPayload,
  overridePayload,
  useBeforeDrag,
} from '@/lib/DragAndDrop/utils'
import { MultiSelect, type MultiSelectProps } from '@/lib/MultiSelect'
import {
  useSelectedItems,
  useSelectionUpdater,
} from '@/lib/MultiSelect/context'
import {
  CONTEXT_MENU_HANDLER_KEY,
  type ContextMenuEvent,
  WithContextMenu,
} from '@/lib/WithContextMenu'
import type { AnyInteraction } from '@/state/actions'
import { useUniqueId } from '@/state/ids'
import { cn } from '@/utils/styles'

import { InteractiveMenuItems } from '../MenuItems'
import { classifyItemEvent } from './utils'

interface InteractiveSelectionProps<T>
  extends Omit<MultiSelectProps, 'itemsCount'> {
  /**
   * The items being interacted with.
   */
  items: T[]

  /**
   * Callback that returns the list of ways to interact with the selected items.
   */
  getInteractions: (items: T[]) => AnyInteraction[][]
  /**
   * Callback that returns the payload to be used when dragging the selected items.
   */
  getDragPayload: (items: T[]) => DragPayload

  /**
   * The action to trigger when the selected items are deleted.
   */
  deleteAction?: (items: T[]) => void
}
/**
 * A component that allows selecting arbitrary child items and performing actions on all of them.
 */
const InteractiveSelection = <T,>(props: InteractiveSelectionProps<T>) => {
  const {
    items,
    getInteractions,
    getDragPayload,
    deleteAction,
    children,
    ...multiSelectProps
  } = props

  return (
    <MultiSelect itemsCount={items.length} {...multiSelectProps}>
      <InteractiveSelectionInner
        getInteractions={getInteractions}
        items={items}
        getDragPayload={getDragPayload}
        deleteAction={deleteAction}
      >
        {children}
      </InteractiveSelectionInner>
    </MultiSelect>
  )
}

type InteractiveSelectionInnerProps<T> = Pick<
  InteractiveSelectionProps<T>,
  'getInteractions' | 'items' | 'getDragPayload' | 'deleteAction' | 'children'
> &
  Omit<Ariakit.RoleProps, 'children'>

const InteractiveSelectionInner = <T,>(
  props: InteractiveSelectionInnerProps<T>,
) => {
  const {
    getInteractions,
    items,
    getDragPayload,
    deleteAction,
    children,
    ref,
    ...contentProps
  } = props

  const composite = Ariakit.useCompositeContext()
  const { setSelection } = useSelectionUpdater()
  const selectedItemIndexes = useSelectedItems()
  const selectedItems = items.filter((_, index) =>
    selectedItemIndexes.has(index),
  )

  const menuId = useUniqueId()
  const interactions = getInteractions(selectedItems)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset selection when items change
  useEffect(() => {
    setSelection([])
  }, [items])

  const allItemsPayload = getDragPayload(items)
  const containerRef = useRef<HTMLDivElement>(null)

  useBeforeDrag(({ element, source, manager }) => {
    if (!containerRef.current?.contains(element)) {
      return
    }

    const eventKind = classifyItemEvent(element, composite, selectedItemIndexes)

    match(eventKind)
      .with({ kind: 'multiSelection' }, () => {
        // If the drag is initiated on an already selected set of items,
        // we want to drag that selection.
        overridePayload(() => getDragPayload(selectedItems), source, manager)
      })
      .with({ kind: 'singleItem' }, ({ itemIndex }) => {
        // If the drag is initiated on an unselected item, we want to select just that item.
        setSelection(itemIndex)
      })
      .with({ kind: 'outside' }, () => {
        // If the drag is initiated outside of any item, we want to select all items.
        setSelection([...Array(items.length).keys()])
      })
      .exhaustive()
  })

  return (
    <Draggable
      dragPayload={allItemsPayload}
      className={cn(
        'border border-transparent',
        'focus:border-dark-100',
        'rounded-[inherit]',
      )}
      ref={mergeRefs([ref, containerRef])}
    >
      <WithContextMenu
        {...contentProps}
        menuId={menuId}
        onKeyDownCapture={(e) => {
          if (e.key === 'Delete') {
            const eventKind = classifyItemEvent(
              e.target,
              composite,
              selectedItemIndexes,
            )

            match(eventKind)
              .with({ kind: 'multiSelection' }, () => {
                // If the delete key is pressed while multiple items are selected,
                // we want to delete all of them.
                e.stopPropagation()
                e.preventDefault()
                deleteAction?.(selectedItems)
              })
              .with({ kind: 'singleItem' }, ({ itemIndex }) => {
                // If the delete key is pressed while a single unselected item is focused,
                // we want to select just that item.
                setSelection(itemIndex)
              })
          }
        }}
        onContextMenu={(e) => {
          if (selectedItemIndexes.size < 1) {
            e.preventDefault()
          }

          if (!interactions.length) {
            e.preventDefault()
          }
        }}
        onContextMenuCapture={(e) => {
          const eventKind = classifyItemEvent(
            e.target,
            composite,
            selectedItemIndexes,
          )

          match(eventKind)
            .with({ kind: 'multiSelection' }, () => {
              // If the context menu is triggered on an already selected set of items,
              // we want to take ownership of that context menu event.
              const nativeEvent: ContextMenuEvent = e.nativeEvent
              nativeEvent[CONTEXT_MENU_HANDLER_KEY] = menuId
            })
            .with({ kind: 'singleItem' }, ({ itemIndex }) => {
              // If the context menu is triggered on an unselected item, we want to select just that item.
              setSelection(itemIndex)
            })
            .with({ kind: 'outside' }, () => {
              // If the context menu is triggered outside of any item, we want to select all items.
              setSelection([...Array(items.length).keys()])
            })
            .exhaustive()
        }}
        items={
          <InteractiveMenuItems
            interactions={interactions}
            itemProps={{ children: ` (${selectedItems.length})` }}
          />
        }
      >
        {children}
      </WithContextMenu>
    </Draggable>
  )
}

export { InteractiveSelection, type InteractiveSelectionProps }
