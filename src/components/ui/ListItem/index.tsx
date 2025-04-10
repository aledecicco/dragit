import type { ComponentProps } from 'react'

import { propsWithCn } from '@utils/styles'

interface ListItemProps extends ComponentProps<'div'> {}

const ListItem = (props: ListItemProps) => {
  const { ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'flex flex-row items-start justify-between gap-4',
        'p-1.5 bg-dark-600 rounded-xs',
        'shadow-md',
        'hover:bg-dark-500 focus:bg-dark-500 data-focus:bg-dark-500',
      )}
    />
  )
}

export { ListItem, type ListItemProps }
