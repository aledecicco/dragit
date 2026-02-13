import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

import { Autosuggest } from '..'

interface AutosuggestItemProps extends Ariakit.ComboboxItemProps {}

/**
 * A single item in an {@link Autosuggest} component.
 */
const AutosuggestItem = (props: AutosuggestItemProps) => {
  const { ...itemProps } = props

  return (
    <Ariakit.ComboboxItem
      focusOnHover
      {...propsWithCn(
        itemProps,
        'text-sm text-center text-light-200 tracking-wider',
        'p-2 rounded-sm cursor-pointer',
        'wrap-anywhere',
        itemProps.value === '' && 'italic',
        'data-active-item:bg-dark-100',
      )}
    >
      <Ariakit.ComboboxItemValue
        className={cn(
          '*:data-user-value:font-bold *:data-user-value:text-light-50',
        )}
      />
    </Ariakit.ComboboxItem>
  )
}

export { AutosuggestItem, type AutosuggestItemProps }
