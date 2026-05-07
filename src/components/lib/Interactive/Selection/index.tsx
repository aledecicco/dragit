import {
  Fragment,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
} from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import type { Action } from '@/state/actions'
import { useUniqueId } from '@/state/ids'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'
import { cn } from '@/utils/styles'

import { Draggable } from '../../DragAndDrop/Draggable'
import {
  type DragPayload,
  overridePayload,
  useBeforeDrag,
} from '../../DragAndDrop/utils'
import { MultiSelect, type MultiSelectProps } from '../../MultiSelect'
import {
  useSelectedItems,
  useSelectionUpdater,
} from '../../MultiSelect/context'
import {
  CONTEXT_MENU_HANDLER_KEY,
  type ContextMenuEvent,
  WithContextMenu,
} from '../../WithContextMenu'

interface InteractiveSelectionProps<T>
  extends Omit<MultiSelectProps, 'itemsCount'> {
  /**
   * The items being interacted with.
   */
  items: T[]

  /**
   * Callback that returns the list of ways to interact with the selected items.
   */
  getActions: (items: T[]) => Action<T[]>[][]
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
    getActions,
    getDragPayload,
    deleteAction,
    children,
    ...multiSelectProps
  } = props

  return (
    <MultiSelect itemsCount={items.length} {...multiSelectProps}>
      <InteractiveSelectionInner
        getActions={getActions}
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
  'getActions' | 'items' | 'getDragPayload' | 'deleteAction' | 'children'
> &
  Omit<Ariakit.RoleProps, 'children'>

const InteractiveSelectionInner = <T,>(
  props: InteractiveSelectionInnerProps<T>,
) => {
  const {
    getActions,
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
  const actions = getActions(selectedItems)

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

    const compositeItem = composite
      ?.getState()
      .renderedItems.find((item) => item.element?.contains(element))

    if (compositeItem) {
      const itemId = Number(compositeItem.id)
      const draggedItem = items.at(itemId)

      if (draggedItem) {
        if (selectedItemIndexes.size > 1 && selectedItemIndexes.has(itemId)) {
          // If more than one item is selected upon dragging, and the dragged item is among the selected ones,
          // set the drag payload to include all selected items.
          overridePayload(() => getDragPayload(selectedItems), source, manager)
        } else {
          setSelection(itemId)
        }
      }
    } else {
      setSelection([...Array(items.length).keys()])
    }
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
            onItemEvent(
              e,
              composite?.getState().renderedItems ?? [],
              selectedItemIndexes,
              () => {
                e.stopPropagation()
                e.preventDefault()
                deleteAction?.(selectedItems)
              },
              (itemIndex) => {
                setSelection(itemIndex)
              },
            )
          }
        }}
        onContextMenu={(e) => {
          if (selectedItemIndexes.size < 1) {
            e.preventDefault()
          }

          if (!actions.length) {
            e.preventDefault()
          }
        }}
        onContextMenuCapture={(e) => {
          onItemEvent(
            e,
            composite?.getState().renderedItems ?? [],
            selectedItemIndexes,
            () => {
              const nativeEvent: ContextMenuEvent = e.nativeEvent
              nativeEvent[CONTEXT_MENU_HANDLER_KEY] = menuId
            },
            (itemIndex) => {
              setSelection(itemIndex)
            },
            () => {
              setSelection([...Array(items.length).keys()])
            },
          )
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
      </WithContextMenu>
    </Draggable>
  )
}

const onItemEvent = (
  e: MouseEvent | KeyboardEvent,
  compositeItems: Ariakit.CompositeStoreState['items'],
  selectedItems: Set<number>,
  onIncluded?: (item: number) => void,
  onNotIncluded?: (item: number) => void,
  onOutside?: () => void,
) => {
  const target = e.target

  if (!(target instanceof HTMLElement)) {
    return
  }
  const itemIndex =
    compositeItems.findIndex((item) => item.element?.contains(target)) ?? -1

  if (itemIndex >= 0) {
    if (selectedItems.size > 1 && selectedItems.has(itemIndex)) {
      onIncluded?.(itemIndex)
    } else {
      onNotIncluded?.(itemIndex)
    }
  } else {
    onOutside?.()
  }
}

export { InteractiveSelection, type InteractiveSelectionProps }
