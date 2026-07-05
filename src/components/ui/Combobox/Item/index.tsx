import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { cn } from '@/utils/styles'
import type { Size } from '@/utils/types'

import { Combobox } from '..'

interface ComboboxItemProps extends Ariakit.SelectItemProps {
  /**
   * The size of the item.
   */
  size?: Size
}

/**
 * A single menu item inside a {@link Combobox}.
 */
const ComboboxItem = (props: ComboboxItemProps) => {
  const { size = 'md', children, ...itemProps } = props

  return (
    <Ariakit.SelectItem
      {...itemProps}
      render={
        <Ariakit.ComboboxItem
          value={itemProps.value}
          className={cn(
            'cursor-pointer wrap-anywhere text-light-50',
            'transition-colors duration-150',

            !itemProps.value && 'italic not-aria-selected:text-light-800',
            'data-active-item:bg-light-50/8',
            'aria-selected:bg-accent-400/40',
            'data-active-item:aria-selected:bg-accent-400/50',
            'not-first-of-type:rounded-t-none not-last-of-type:rounded-b-none',

            match(size)
              .with('xs', () => 'p-1 rounded-xs text-xs')
              .with('sm', () => 'p-1.25 rounded-xs text-xs')
              .with('md', () => 'p-1.5 rounded-sm text-sm')
              .with('lg', () => 'p-1.75 rounded-sm text-base')
              .exhaustive(),
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
