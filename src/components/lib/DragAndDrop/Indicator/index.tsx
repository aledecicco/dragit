import { Chip, type ChipProps } from '@/ui/Chip'
import { type Glyph, Icon } from '@/ui/Icon'
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
    <Chip
      size="lg"
      {...propsWithCn(chipProps, 'z-3', 'flex flex-row gap-1 drop-shadow-sm ')}
    >
      <Icon Glyph={Glyph} size="md" />
      <span
        className={cn(
          'text-sm text-light-900 max-w-50 text-ellipsis overflow-hidden whitespace-nowrap',
        )}
      >
        {label}
      </span>
    </Chip>
  )
}

export { DragAndDropIndicator, type DragAndDropIndicatorProps }
