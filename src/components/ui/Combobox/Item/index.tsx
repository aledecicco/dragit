import * as Ariakit from '@ariakit/react'

import { cn } from '@/utils/styles'

import type { ComboboxOption } from '..'

interface ComboboxItemProps<T> extends Ariakit.SelectItemProps {
  item: ComboboxOption<T>
}

const ComboboxItem = <T,>(props: ComboboxItemProps<T>) => {
  const { item, ...itemProps } = props

  return (
    <Ariakit.SelectItem
      {...itemProps}
      value={item.value}
      render={
        <Ariakit.ComboboxItem
          className={cn(
            'text-sm text-center text-light-50',
            'p-1.5 rounded-sm cursor-pointer',
            'wrap-anywhere',
            item.value === '' && 'italic not-aria-selected:text-light-800',
            'data-active-item:bg-dark-100',
            'aria-selected:bg-accent-300/15',
            'data-active-item:aria-selected:bg-accent-300/20',
          )}
        />
      }
    />
  )
}

export { ComboboxItem, type ComboboxItemProps }
