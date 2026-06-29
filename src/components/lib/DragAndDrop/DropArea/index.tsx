import { type ComponentProps, useLayoutEffect, useRef, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconDragDrop } from '@tabler/icons-react'
import { mergeRefs } from 'react-merge-refs'

import { useUniqueId } from '@/state/ids'
import { type Glyph, Icon } from '@/ui/Icon'
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
   * Icon override for the overlay displayed during drag operations.
   */
  Glyph?: Glyph

  /**
   * Additional props to pass to the overlay displayed during drag operations.
   */
  overlayProps?:
    | ComponentProps<'div'>
    | ((payload: MatchingPayload<T>) => ComponentProps<'div'> | undefined)
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
    Glyph,
    overlayProps,
    children,
    ref,
    ...divProps
  } = props

  const currentDrag = useCurrentDrag(acceptedTypes)

  const disabledByValidation =
    !!currentDrag && !!extraValidation && !extraValidation(currentDrag.data)

  const id = useUniqueId()

  const { ref: dropRef, isDropTarget } = useDroppable({
    id,
    accept: acceptedTypes,
    disabled: disabledByValidation,
  })

  useOnDrop(id, acceptedTypes, ({ source }) => {
    if (!disabledByValidation) {
      handleDrop(source.data)
    }
  })

  const sizeRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useLayoutEffect(() => {
    if (currentDrag && !disabledByValidation && sizeRef.current) {
      const newRect = sizeRef.current.getBoundingClientRect()
      setRect({
        top: newRect.top,
        left: newRect.left,
        width: newRect.width,
        height: newRect.height,
      })
    }
  }, [currentDrag, disabledByValidation])

  return (
    <div
      {...propsWithCn(
        divProps,
        'relative',
        !children &&
          (!currentDrag || disabledByValidation) &&
          'pointer-events-none',
      )}
      ref={mergeRefs([dropRef, ref, sizeRef])}
    >
      {children}

      {currentDrag && !disabledByValidation && (
        <Ariakit.Portal>
          <div
            {...propsWithCn(
              typeof overlayProps === 'function'
                ? overlayProps(currentDrag.data)
                : overlayProps,
              'z-3',
              'fixed overflow-hidden',
              'flex flex-col items-center justify-center gap-2 p-4',
              'rounded-md border border-dashed border-primary-400 bg-dark-400',
              'text-base text-light-950/50 text-center select-none',
              isDropTarget && 'border-accent-400 bg-dark-300 text-light-950/80',
            )}
            style={rect}
          >
            <Icon
              size="lg"
              Glyph={Glyph ?? IconDragDrop}
              className={cn('size-7')}
            />
            Drop here to {label[currentDrag.data.type]}
          </div>
        </Ariakit.Portal>
      )}
    </div>
  )
}

export { DropArea, type DropAreaProps }
