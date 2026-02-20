import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import { propsWithCn } from '@/utils/styles'

import { type DragType, useDraggable } from '../utils'

interface DraggableProps
  extends Omit<Ariakit.RoleProps, 'children' | 'render'> {
  children: Ariakit.RoleProps['render']

  /**
   * The unique identifier for the draggable item.
   */
  id: string

  /**
   * Extra data carried by the item.
   */
  dragPayload: DragType
}

/**
 * An abstract component that makes its child draggable.
 */
const Draggable = (props: DraggableProps) => {
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
        isDragging && 'opacity-80',
      )}
      ref={mergeRefs([dragRef, ref])}
      render={children}
    />
  )
}

export { Draggable, type DraggableProps }
