import type { ComponentProps } from 'react'
import { IconDragDrop } from '@tabler/icons-react'
import { mergeRefs } from 'react-merge-refs'

import { useUniqueId } from '@/state/ids'
import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'

import {
  type DragType,
  type MatchingPayload,
  useCanDrop,
  useCurrentDrag,
  useDroppable,
  useOnDrop,
} from '../utils'

interface DropAreaProps<T extends DragType> extends ComponentProps<'div'> {
  /**
   * The type of draggable items that this area can accept.
   */
  acceptedTypes: T[]

  /**
   * A callback function that is called when a draggable item of an accepted type is dropped on this area.
   */
  handleDrop: (payload: MatchingPayload<T>) => void

  /**
   * The label to display when a drag operation of an accepted type is in progress.
   */
  label: {
    [K in T]: string
  }
}

/**
 * An abstract component that makes its child able to receive dropped items of a given type.
 */
const DropArea = <T extends DragType>(props: DropAreaProps<T>) => {
  const { acceptedTypes, handleDrop, label, children, ref, ...divProps } = props

  const id = useUniqueId()

  const { ref: dropRef, isDropTarget } = useDroppable({
    id,
    accept: acceptedTypes,
  })

  useOnDrop(id, acceptedTypes, ({ source }) => {
    handleDrop(source.data)
  })

  const canDrop = useCanDrop(acceptedTypes)
  const currentDrag = useCurrentDrag()

  return (
    <div {...propsWithCn(divProps, 'relative')} ref={mergeRefs([dropRef, ref])}>
      {children}

      {canDrop && currentDrag.source && (
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-full overflow-hidden',
            'flex flex-col items-center justify-center gap-2 p-4',
            'rounded-md border border-dashed border-primary-500 bg-dark-400',
            'text-md text-light-950/50 text-center',
            isDropTarget && 'border-accent-400 bg-dark-300 text-light-950/80',
          )}
        >
          <Icon size="lg" Glyph={IconDragDrop} className={cn('size-7')} />
          Drop here to {label[currentDrag.source.type as T]}
        </div>
      )}
    </div>
  )
}

export { DropArea, type DropAreaProps }
