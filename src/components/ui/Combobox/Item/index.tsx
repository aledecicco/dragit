import * as Ariakit from '@ariakit/react'

import { cn } from '@/utils/styles'

import { Combobox } from '..'

interface ComboboxItemProps extends Ariakit.SelectItemProps {}

/**
 * A single menu item inside a {@link Combobox}.
 */
const ComboboxItem = (props: ComboboxItemProps) => {
  const { children, ...itemProps } = props

  return (
    <Ariakit.SelectItem
      {...itemProps}
      render={
        <Ariakit.ComboboxItem
          value={itemProps.value}
          className={cn(
            'text-sm text-center text-light-200 tracking-wider',
            'p-1.5 rounded-sm cursor-pointer',
            'wrap-anywhere',
            !itemProps.value && 'italic not-aria-selected:text-light-800',
            'data-active-item:bg-dark-100',
            'aria-selected:bg-accent-300/15',
            'data-active-item:aria-selected:bg-accent-300/20',
          )}
        />
      }
    >
      {children ?? (
        <Ariakit.ComboboxItemValue
          className={cn(
            '*:data-user-value:font-bold *:data-user-value:text-light-50',
          )}
        />
      )}
    </Ariakit.SelectItem>
  )
}

export { ComboboxItem, type ComboboxItemProps }
