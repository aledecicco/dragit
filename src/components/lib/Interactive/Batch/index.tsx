import { Draggable, type DraggableProps } from '@/lib/DragAndDrop/Draggable'
import type { DragPayload, DragType } from '@/lib/DragAndDrop/utils'
import { WithContextMenu } from '@/lib/WithContextMenu'
import type { AnyInteraction } from '@/state/actions'

import { InteractiveMenuItems } from '../MenuItems'

interface InteractiveBatchProps
  extends Omit<DraggableProps<DragType>, 'dragPayload'> {
  /**
   * Label that represents the number of items contained.
   */
  count: string | undefined

  /**
   * Callback that returns the list of ways to interact with the items.
   */
  getInteractions: () => AnyInteraction[][]

  /**
   * Callback that returns the payload to be used when dragging.
   */
  getDragPayload: () => DragPayload
}

/**
 * A container that allows interacting with a batch of items at once.
 */
const InteractiveBatch = (props: InteractiveBatchProps) => {
  const {
    count,
    getInteractions,
    getDragPayload,
    children,
    ...draggableProps
  } = props

  return (
    <Draggable {...draggableProps} dragPayload={getDragPayload()}>
      <WithContextMenu
        onContextMenu={(e) => {
          if (!count) {
            e.preventDefault()
          }
        }}
        items={
          <InteractiveMenuItems
            interactions={getInteractions()}
            itemProps={{ children: `(${count})` }}
          />
        }
      >
        {children}
      </WithContextMenu>
    </Draggable>
  )
}

export { InteractiveBatch, type InteractiveBatchProps }
