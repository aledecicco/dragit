import * as Ariakit from '@ariakit/react'
import { memo } from 'react'

import { propsWithCn } from '@utils/styles'

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
const ListItem = memo((props: ListItemProps) => {
  const { interactive = false, ...itemProps } = props

  return (
    <Ariakit.CompositeItem
      render={interactive ? undefined : <div />}
      {...propsWithCn(
        itemProps,
        'w-full p-1.5 bg-dark-600 rounded-xs shadow-md',
        'hover:bg-dark-500 focus:bg-dark-500 data-focus:bg-dark-500 aria-checked:bg-dark-500',
        interactive && 'cursor-pointer',
      )}
    />
  )
})

export { ListItem, type ListItemProps }
