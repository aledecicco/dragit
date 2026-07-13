import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

interface ListItemProps extends Ariakit.CompositeItemProps {}

/**
 * Base list item component with default style.
 */
const ListItem = (props: ListItemProps) => {
  const { ...itemProps } = props

  return (
    <Ariakit.CompositeItem
      {...propsWithCn(
        itemProps,
        'group cursor-pointer select-none',
        'w-full p-1.5 bg-dark-600 rounded-xs shadow-md',
        'transition-colors duration-150',
        'hover:bg-dark-500 focus:bg-dark-500 data-focus:bg-dark-500',
        'aria-selected:bg-dark-400',
        'hover:aria-selected:bg-dark-300 focus:aria-selected:bg-dark-300 data-focus:aria-selected:bg-dark-300',
        'border border-transparent',
        'aria-current:border-primary-300 aria-checked:border-primary-300',
      )}
    />
  )
}

export { ListItem, type ListItemProps }
