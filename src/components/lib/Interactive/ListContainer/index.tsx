import { Fragment } from 'react/jsx-runtime'

import { Draggable, type DraggableProps } from '@/lib/DragAndDrop/Draggable'
import type { DragPayload, DragType } from '@/lib/DragAndDrop/utils'
import { WithContextMenu } from '@/lib/WithContextMenu'
import type { Action } from '@/state/actions'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'
import { cn } from '@/utils/styles'

interface InteractiveListContainerProps<T>
  extends Omit<DraggableProps<DragType>, 'dragPayload'> {
  /**
   * The items being interacted with.
   */
  items: T[]

  /**
   * Callback that returns the list of ways to interact with the selected items.
   */
  getActions: (items: T[]) => Action<T[]>[][]

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
  const { items, getActions, getDragPayload, children, ...draggableProps } =
    props

  return (
    <Draggable {...draggableProps} dragPayload={getDragPayload(items)}>
      <WithContextMenu
        onContextMenu={(e) => {
          if (!items.length) {
            e.preventDefault()
          }
        }}
        items={getActions(items)
          .filter((section) => section.length > 0)
          .map((section, i) => (
            <Fragment key={`${i + 1}`}>
              {i > 0 && <Separator className={cn('my-0.5')} />}
              {section.map((action, j) => (
                <MenuItem
                  key={`${i + 1}-${j + 1}`}
                  action={action}
                  argsRequester={() => items}
                >
                  {' '}
                  ({items.length})
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

export { InteractiveListContainer, type InteractiveListContainerProps }
