import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import { propsWithCn } from '@/utils/styles'

import { type DragType, type MatchingPayload, useDraggable } from '../utils'

interface DraggableProps<T extends DragType>
  extends Omit<Ariakit.RoleProps, 'children' | 'render'> {
  children: Ariakit.RoleProps['render']

  /**
   * The unique identifier for the draggable item.
   */
  id: string

  /**
   * Extra data carried by the item.
   */
  dragPayload: MatchingPayload<T>
}

/**
 * An abstract component that makes its child draggable.
 */
const Draggable = <T extends DragType>(props: DraggableProps<T>) => {
  const { id, dragPayload, children, ref, ...roleProps } = props

  const { ref: dragRef, isDragging } = useDraggable({
    id,
    type: dragPayload.type,
    data: dragPayload,
  })

  return (
    <Ariakit.Role
      {...propsWithCn(
        roleProps,
        'touch-manipulation',
        isDragging && 'border border-neutral-600',
      )}
      ref={mergeRefs([dragRef, ref])}
      render={children}
    />
  )
}

export { Draggable, type DraggableProps }
