import type { ComponentProps } from 'react'

import { propsWithCn } from '@/utils/styles'

import { useCurrentDrag } from '../utils'

interface DragAndDropBackdropProps extends ComponentProps<'div'> {}

const DragAndDropBackdrop = (props: DragAndDropBackdropProps) => {
  const { ...divProps } = props

  const isDragging = !!useCurrentDrag()

  return (
    isDragging && (
      <div
        {...propsWithCn(
          divProps,
          'z-2',
          'fixed top-0 left-0 size-full bg-black/15',
        )}
      />
    )
  )
}

export { DragAndDropBackdrop, type DragAndDropBackdropProps }
