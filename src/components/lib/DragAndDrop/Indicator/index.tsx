import { Focusable } from '@ariakit/react'

import { Chip, type ChipProps } from '@/ui/Chip'
import { type Glyph, Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'

interface DragAndDropIndicatorProps extends ChipProps {
  /**
   * The icon to display in the drag-and-drop indicator.
   */
  Glyph: Glyph

  /**
   * The label to display in the drag-and-drop indicator.
   */
  label: string
}

/**
 * The indicator that is rendered when dragging an item, following the cursor.
 */
const DragAndDropIndicator = (props: DragAndDropIndicatorProps) => {
  const { Glyph, label, ...chipProps } = props

  return (
    <Focusable
      autoFocus
      render={
        <Chip
          autoFocus
          size="lg"
          {...propsWithCn(
            chipProps,
            'z-4 group',
            'flex flex-row gap-1 items-center',
            'bg-dark-50 text-light-500/90',
          )}
        >
          <Icon Glyph={Glyph} size="md" />
          <Marquee
            infinite
            speed={30}
            className={cn(
              'text-sm text-light-900 max-w-50 text-ellipsis overflow-hidden whitespace-nowrap',
            )}
          >
            {label}
          </Marquee>
        </Chip>
      }
    />
  )
}

export { DragAndDropIndicator, type DragAndDropIndicatorProps }
