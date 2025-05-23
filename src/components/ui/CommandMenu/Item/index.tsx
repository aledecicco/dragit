import * as Ariakit from '@ariakit/react'

import { cn } from '@utils/styles'

interface CommandMenuItemProps extends Ariakit.ComboboxItemProps {
  item: string
}

const CommandMenuItem = (props: CommandMenuItemProps) => {
  const { item } = props

  return (
    <Ariakit.ComboboxItem
      focusOnHover
      value={item}
      className={cn(
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
