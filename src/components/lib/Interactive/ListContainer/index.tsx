import { Draggable, type DraggableProps } from '@/lib/DragAndDrop/Draggable'
import type { DragPayload, DragType } from '@/lib/DragAndDrop/utils'
import { WithContextMenu } from '@/lib/WithContextMenu'
import type { AnyInteraction } from '@/state/actions'

import { InteractiveMenuItems } from '../MenuItems'

interface InteractiveListContainerProps<T>
  extends Omit<DraggableProps<DragType>, 'dragPayload'> {
  /**
   * The items being interacted with.
   */
  items: T[]

  /**
   * Callback that returns the list of ways to interact with the selected items.
   */
  getInteractions: (items: T[]) => AnyInteraction[][]

  /**
   * Callback that returns the payload to be used when dragging.
   */
  getDragPayload: (items: T[]) => DragPayload
}

/**
 * A list that allows interacting with all of its items at once.
 */
const InteractiveListContainer = <T,>(
  props: InteractiveListContainerProps<T>,
) => {
  const {
    items,
    getInteractions,
    getDragPayload,
    children,
    ...draggableProps
  } = props

  const interactions = getInteractions(items)

  return (
    <Draggable {...draggableProps} dragPayload={getDragPayload(items)}>
      <WithContextMenu
        onContextMenu={(e) => {
          if (!items.length) {
            e.preventDefault()
          }
        }}
        items={
          <InteractiveMenuItems
            interactions={interactions}
            itemProps={{ children: ` (${items.length})` }}
          />
        }
      >
        {children}
      </WithContextMenu>
    </Draggable>
  )
}

export { InteractiveListContainer, type InteractiveListContainerProps }
