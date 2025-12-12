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
}

/**
 * A single item in a {@link ToggleGroup} component.
 */
const ToggleGroupItem = (props: ToggleGroupItemProps) => {
  const { value, ...buttonProps } = props

  return (
    <Ariakit.Radio
      render={
        <DecoratedButton
          {...propsWithCn(
            buttonProps,
            'not-first:rounded-l-none not-last:rounded-r-none',
          )}
        />
      }
      value={value}
    />
  )
}

export { ToggleGroupItem, type ToggleGroupItemProps }
