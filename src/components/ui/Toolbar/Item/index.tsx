import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

interface ToolbarItemProps extends Ariakit.ToolbarItemProps {
  /**
   * If `true`, it's assumed that the toolbar has a fixed width, and the item will grow proportionally to fill the available space.
   * If `false`, the item will take only as much space as it needs.
   */
  fixed?: boolean

  /**
   * The size of the item.
   */
  size?: Size
}

const ToolbarItem = (props: ToolbarItemProps) => {
  const { fixed = false, size = 'md', ...itemProps } = props

  return (
    <Ariakit.ToolbarItem
      {...propsWithCn(
        itemProps,
        'flex flex-row items-center justify-center',
        match(size)
          .with('sm', () => 'text-xs')
          .with('md', () => 'text-sm')
          .with('lg', () => 'text-md')
          .exhaustive(),
        fixed && 'w-full',
        'not-first:rounded-l-none',
        'not-last:rounded-r-none',
      )}
    />
  )
}

export { ToolbarItem, type ToolbarItemProps }
