import * as Ariakit from '@ariakit/react'

import type { DecoratedButtonProps } from '@/lib/DecoratedButton'
import { ToolbarItem } from '@/ui/Toolbar/Item'

import { ToggleGroup } from '..'

interface ToggleGroupItemProps extends DecoratedButtonProps {
  /**
   * The value and identifier of the toggle item.
   */
  value: string
}

/**
 * A single item in a {@link ToggleGroup} component.
 */
const ToggleGroupItem = (props: ToggleGroupItemProps) => {
  const { value, ...itemProps } = props

  return <Ariakit.Radio render={<ToolbarItem {...itemProps} />} value={value} />
}

export { ToggleGroupItem, type ToggleGroupItemProps }
