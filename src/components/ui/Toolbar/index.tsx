import * as Ariakit from '@ariakit/react'

import { propsWithCn } from '@/utils/styles'

interface ToolbarProps extends Ariakit.ToolbarProps {
  /**
   * If `true`, it's assumed that the toolbar has a fixed width, and each item will grow proportionally to fill the available space.
   * If `false`, each item will take only as much space as it needs.
   */
  fixed?: boolean
}

/**
 * Component to contain a set of related tools.
 *
 * Should contain {@link ToolbarItem} components as children.
 */
const Toolbar = (props: ToolbarProps) => {
  const { fixed = false, ...toolbarProps } = props

  return (
    <Ariakit.Toolbar
      {...propsWithCn(
        toolbarProps,
        'grid grid-flow-col',
        fixed ? 'auto-cols-fr' : 'auto-cols-max',
      )}
    />
  )
}

export { Toolbar, type ToolbarProps }
