import { useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import type * as Dnd from '@dnd-kit/react'
import { mergeRefs } from 'react-merge-refs'

import { useUniqueId } from '@/state/ids'
import { propsWithCn } from '@/utils/styles'
import type { MakeRequired } from '@/utils/types'

import {
  type Draggable as DraggableSource,
  type DragType,
  isEmptyDragPayload,
  type MatchingPayload,
  useBeforeDrag,
  useDraggable,
} from '../utils'

interface DraggableProps<T extends DragType>
  extends Omit<Ariakit.RoleProps, 'children' | 'render'> {
  children: Ariakit.RoleProps['render']

  /**
   * Extra data carried by the item.
   */
  dragPayload?: MatchingPayload<T>

  /**
   * Callback to trigger on drag.
   */
  onBeforeDrag?: (args: {
    element: HTMLElement
    source: DraggableSource<T>
    manager: Dnd.DragDropManager
  }) => void
}

/**
 * An abstract component that makes its child draggable.
 */
const Draggable = <T extends DragType>(props: DraggableProps<T>) => {
  const { dragPayload, onBeforeDrag, children, ...roleProps } = props

  const isDisabled = !dragPayload || isEmptyDragPayload(dragPayload)

  return isDisabled ? (
    <Ariakit.Role {...roleProps} render={children} />
  ) : (
    <DraggableInner
      {...roleProps}
      dragPayload={dragPayload}
      onBeforeDrag={onBeforeDrag}
    >
      {children}
    </DraggableInner>
  )
}

const DraggableInner = <T extends DragType>(
  props: MakeRequired<DraggableProps<T>, 'dragPayload'>,
) => {
  const { dragPayload, onBeforeDrag, children, ref, ...roleProps } = props
  const id = useUniqueId()

  const componentRef = useRef<HTMLDivElement>(null)
  const { ref: dragRef, isDragging } = useDraggable({
    id,
    type: dragPayload.type,
    data: dragPayload,
  })

  useBeforeDrag(({ element, source, manager }) => {
    if (
      componentRef.current?.contains(element) &&
      source.data.type === dragPayload.type
    ) {
      onBeforeDrag?.({ element, source: source as DraggableSource<T>, manager })
    }
  })

  return (
    <Ariakit.Role
      {...propsWithCn(
        roleProps,
        'touch-manipulation cursor-pointer',
        'transition-colors duration-150',
        isDragging && 'border border-neutral-600',
      )}
      ref={mergeRefs([componentRef, dragRef, ref])}
      render={children}
    />
  )
}

export { Draggable, type DraggableProps }
