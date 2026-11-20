import { useEffect } from 'react'

import {
  type DragType,
  looseCollisionDetector,
  useCurrentDrag,
  useDroppable,
} from '@/lib/DragAndDrop/utils'
import { useUniqueId } from '@/state/ids'
import { revealSideColumn, type SideColumn } from '@/state/layout'
import { Button, type ButtonProps } from '@/ui/Button'
import { type Glyph, Icon } from '@/ui/Icon'
import { Tooltip } from '@/ui/Tooltip'
import { propsWithCn } from '@/utils/styles'

interface ColumnContents {
  /**
   * The label of the column.
   */
  label: string

  /**
   * Icons standing for each thing the column holds.
   */
  glyphs: Glyph[]
}

interface ColumnRailProps extends ButtonProps {
  /**
   * The hidden side column this rail brings back into view.
   */
  column: SideColumn

  /**
   * The drag types the column has a drop area for.
   */
  acceptedTypes: DragType[]

  /**
   * What the column holds.
   */
  contents: ColumnContents

  /**
   * What the column holds once a drag is under way.
   */
  whileDragging?: ColumnContents
}

/**
 * A slim strip standing in for a side column that the compact layout is hiding.
 */
const ColumnRail = (props: ColumnRailProps) => {
  const { column, acceptedTypes, contents, whileDragging, ...buttonProps } =
    props

  const currentDrag = useCurrentDrag(acceptedTypes)

  const { label, glyphs } = currentDrag ? (whileDragging ?? contents) : contents

  const id = useUniqueId()
  const { ref: dropRef, isDropTarget } = useDroppable({
    id,
    accept: acceptedTypes,
    collisionDetector: looseCollisionDetector,
  })

  useEffect(() => {
    if (isDropTarget) {
      revealSideColumn(column)
    }
  }, [isDropTarget, column])

  return (
    <Tooltip
      placement={column === 'left' ? 'right' : 'left'}
      description={`Show ${label}`}
      anchor={
        <Button
          aria-label={`Show ${label}`}
          variant="plain"
          status="neutral"
          size="sm"
          ref={dropRef}
          onClick={() => {
            revealSideColumn(column)
          }}
          {...propsWithCn(
            buttonProps,
            'h-full w-full min-w-6 shrink-0 px-0 active:scale-100',
            'flex-col gap-3',
            'border border-dark-50/50 text-light-900',
            currentDrag && 'border-dashed border-primary-400 text-primary-300',
          )}
        >
          {glyphs.map((Glyph) => (
            <Icon key={Glyph.displayName} Glyph={Glyph} size="sm" />
          ))}
        </Button>
      }
    />
  )
}

export { ColumnRail, type ColumnRailProps }
