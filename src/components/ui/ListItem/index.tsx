import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

interface ListItemProps extends Ariakit.CompositeItemProps {
  /**
   * Whether the list item should be interactive.
   *
   * If `true`, it will render as a button.
   */
  interactive?: boolean
}

/**
 * Base list item component with default styles, that can be set as interactive or not.
 */
const ListItem = (props: ListItemProps) => {
  const { interactive = false, ...itemProps } = props

  return (
    <Ariakit.CompositeItem
      render={interactive ? undefined : <div />}
      {...propsWithCn(
        itemProps,
        'w-full p-1.5 bg-dark-600 rounded-xs shadow-md',
        'hover:bg-dark-500 aria-selected:bg-dark-400',
        'hover:aria-selected:bg-dark-300',
        'border border-transparent',
        'aria-current:border-accent-300',
        interactive && 'cursor-pointer',
      )}
    />
  )
}

export { ListItem, type ListItemProps }
