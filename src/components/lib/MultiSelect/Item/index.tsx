import { ListItem, type ListItemProps } from '@/ui/ListItem'

import { MultiSelect } from '..'
import { useSelectedItems, useSelectionUpdater } from '../context'

interface MultiSelectItemProps extends ListItemProps {
  /**
   * The unique numeric index of this item in the multiselect list.
   */
  itemIndex: number
}

/**
 * A single item inside a {@link MultiSelect}.
 */
const MultiSelectItem = (props: MultiSelectItemProps) => {
  const { itemIndex, ...itemProps } = props

  const selectedItems = useSelectedItems()
  const isSelected = selectedItems.has(itemIndex)

  const { toggle, extendSelection, setSelection } = useSelectionUpdater()

  return (
    <ListItem
      id={`${itemIndex}`}
      role="option"
      aria-selected={isSelected}
      {...itemProps}
      onClick={(e) => {
        itemProps.onClick?.(e)

        if (e.shiftKey) {
          extendSelection(itemIndex)
        } else if (e.metaKey || e.ctrlKey) {
          toggle(itemIndex)
        } else {
          if (isSelected && selectedItems.size === 1) {
            setSelection([])
          } else {
            setSelection(itemIndex)
          }
        }
      }}
    />
  )
}

export { MultiSelectItem, type MultiSelectItemProps }
