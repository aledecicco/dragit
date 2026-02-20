import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'

import { useUniqueId } from '@/state/ids'
import { propsWithCn } from '@/utils/styles'

import { type DragType, useDroppable, useOnDrop } from '../utils'

interface DropAreaProps<T extends DragType['type']>
  extends Omit<Ariakit.RoleProps, 'children' | 'render'> {
  children: Ariakit.RoleProps['render']

  /**
   * The type of draggable items that this area can accept.
   */
  acceptedTypes: T[]

  /**
   * A callback function that is called when a draggable item of an accepted type is dropped on this area.
   */
  handleDrop: (payload: Extract<DragType, { type: T }>) => void
}

/**
 * An abstract component that makes its child able to receive dropped items of a given type.
 */
const DropArea = <T extends DragType['type']>(props: DropAreaProps<T>) => {
  const { acceptedTypes, handleDrop, children, ref, ...roleProps } = props

  const id = useUniqueId()

  const { isDropTarget, ref: dropRef } = useDroppable({
    id,
    accept: acceptedTypes,
  })

  useOnDrop(({ source, target }) => {
    if (target.id === id) {
      handleDrop(source.data as Extract<DragType, { type: T }>)
    }
  })

  return (
    <Ariakit.Role
      {...propsWithCn(
        roleProps,
        'border-2 border-transparent',
        isDropTarget && 'border-dashed border-accent-400',
      )}
      ref={mergeRefs([dropRef, ref])}
      render={children}
    />
  )
}

export { DropArea, type DropAreaProps }
