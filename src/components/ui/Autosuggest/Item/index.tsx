import * as Ariakit from '@ariakit/react'

import { cn, propsWithCn } from '@/utils/styles'

interface AutosuggestItemProps extends Ariakit.ComboboxItemProps {}

const AutosuggestItem = (props: AutosuggestItemProps) => {
  const { ...itemProps } = props

  return (
    <Ariakit.ComboboxItem
      focusOnHover
      {...propsWithCn(
        itemProps,
        'text-sm text-center text-light-50',
        'p-2 rounded-sm cursor-pointer',
        'wrap-anywhere',
        itemProps.value === '' && 'italic',
        'data-active-item:bg-dark-100',
      )}
    >
      <Ariakit.ComboboxItemValue
        className={cn('*:data-user-value:text-accent-300')}
      />
    </Ariakit.ComboboxItem>
  )
}

export { AutosuggestItem, type AutosuggestItemProps }
