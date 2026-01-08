import * as Ariakit from '@ariakit/react'

import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import { propsWithCn } from '@/utils/styles'

import { ToggleGroup } from '..'

type ToggleGroupItemProps = DecoratedButtonProps & {
  /**
   * The value and identifier of the toggle item.
   */
  value: string

  /**
   * If `true`, it's assumed that the toolbar has a fixed width, and the item will grow proportionally to fill the available space.
   * If `false`, the item will take only as much space as it needs.
   */
  fixed?: boolean
}

/**
 * A single item in a {@link ToggleGroup}.
 */
const ToggleGroupItem = (props: ToggleGroupItemProps) => {
  const { value, fixed = false, ...buttonProps } = props

  return (
    <Ariakit.Radio
      render={
        <DecoratedButton
          {...propsWithCn(
            buttonProps,
            'not-first:rounded-l-none not-last:rounded-r-none',
            fixed && 'w-full',
          )}
        />
      }
      value={value}
    />
  )
}

export { ToggleGroupItem, type ToggleGroupItemProps }
