import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

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
        'text-xs text-light-500',
        'px-2 py-3 rounded-none cursor-pointer',
        'data-[active-item]:bg-dark-100',
      )}
    >
      <Ariakit.ComboboxItemValue
        className={cn(
          'tracking-wider',
          '[&>[data-autocomplete-value]]:font-thin [&>[data-autocomplete-value]]:text-light-300',
          '[&>[data-user-value]]:font-bold [&>[data-user-value]]:text-light-50',
        )}
      />
    </Ariakit.ComboboxItem>
  )
}

export { CommandMenuItem, type CommandMenuItemProps }
