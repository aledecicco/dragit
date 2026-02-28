import type { ComponentProps } from 'react'
import { IconDragDrop, IconForbid2 } from '@tabler/icons-react'
import { mergeRefs } from 'react-merge-refs'

import { useUniqueId } from '@/state/ids'
import { Icon } from '@/ui/Icon'
import { cn, propsWithCn } from '@/utils/styles'

import {
  type DragType,
  type MatchingPayload,
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
   * A callback function that validates if a specific payload of an accepted type can be dropped on this area.
   */
  extraValidation?: (payload: MatchingPayload<T>) => boolean

  /**
   * The label to display when a drag operation of an accepted type is in progress.
   */
  label: {
    [K in T]: string
  }

  /**
   * Additional props to pass to the overlay displayed during drag operations.
   */
  overlayProps?: ComponentProps<'div'>
}

/**
 * An abstract component that makes its child able to receive dropped items of a given type.
 */
const DropArea = <T extends DragType>(props: DropAreaProps<T>) => {
  const {
    acceptedTypes,
    handleDrop,
    extraValidation,
    label,
    overlayProps,
    children,
    ref,
    ...divProps
  } = props

  const id = useUniqueId()

  const { ref: dropRef, isDropTarget } = useDroppable({
    id,
    accept: acceptedTypes,
  })

  const currentDrag = useCurrentDrag(acceptedTypes)

  const disabledByValidation =
    currentDrag && extraValidation && !extraValidation(currentDrag.data)

  useOnDrop(id, acceptedTypes, ({ source }) => {
    if (!disabledByValidation) {
      handleDrop(source.data)
    }
  })

  return (
    <div
      {...propsWithCn(
        divProps,
        'relative',
        !children && !currentDrag && 'pointer-events-none',
      )}
      ref={mergeRefs([dropRef, ref])}
    >
      {children}

      {currentDrag && (
        <div
          {...propsWithCn(
            overlayProps,
            'z-3',
            'absolute top-0 left-0 w-full h-full overflow-hidden',
            'flex flex-col items-center justify-center gap-2 p-4',
            'rounded-md border border-dashed border-primary-400 bg-dark-400',
            'text-md text-light-950/50 text-center',
            isDropTarget && 'border-accent-400 bg-dark-300 text-light-950/80',
            disabledByValidation &&
              'border-dark-50 bg-dark-500 text-light-950/30',
          )}
        >
          <Icon
            size="lg"
            Glyph={disabledByValidation ? IconForbid2 : IconDragDrop}
            className={cn('size-7')}
          />
          {disabledByValidation ? "Can't" : 'Drop here to'}{' '}
          {label[currentDrag.type]}
        </div>
      )}
    </div>
  )
}

export { DropArea, type DropAreaProps }
