import * as Ariakit from '@ariakit/react'

import { useIsSelected, useSelectionUpdater } from '../context'

interface MultiSelectItemProps extends Ariakit.CompositeItemProps {
  /**
   * The unique numeric index of this item in the multiselect list.
   */
  itemIndex: number
}

const MultiSelectItem = (props: MultiSelectItemProps) => {
  const { itemIndex, ...itemProps } = props

  const isSelected = useIsSelected(itemIndex)

  const { toggle, extendSelection, setSelection } = useSelectionUpdater()

  return (
    <Ariakit.CompositeItem
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
          setSelection(itemIndex)
        }
      }}
    />
  )
}

export { MultiSelectItem, type MultiSelectItemProps }
