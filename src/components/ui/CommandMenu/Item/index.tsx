import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

import { CommandMenu } from '..'

interface CommandMenuItemProps extends Ariakit.ComboboxItemProps {}

/**
 * A single item inside a {@link CommandMenu}.
 *
 * The callback to trigger the action of the item is handled by the parent.
 */
const CommandMenuItem = (props: CommandMenuItemProps) => {
  const { ...itemProps } = props

  return (
    <Ariakit.ComboboxItem
      focusOnHover
      {...propsWithCn(
        itemProps,
        'text-sm',
        'py-2 px-3 rounded-none cursor-pointer',
        'data-active-item:bg-dark-100',
      )}
    />
  )
}

export { CommandMenuItem, type CommandMenuItemProps }
