import { Fragment } from 'react'

import type { DecoratedButtonProps } from '@/lib/DecoratedButton'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'
import { cn } from '@/utils/styles'

import type { InteractionEntry } from '../types'

interface InteractiveMenuItemsProps {
  /**
   * The list of ways to interact with the selected items.
   */
  interactions: InteractionEntry[][]

  /**
   * Props to be passed to all rendered items.
   */
  itemProps?: Partial<DecoratedButtonProps>
}
/**
 * Renders a list of interactions as {@link MenuItem}s, separated into sections.
 */
const InteractiveMenuItems = (props: InteractiveMenuItemsProps) => {
  const { interactions, itemProps } = props

  return interactions
    .filter((section) => section.length > 0)
    .map((section, i) => (
      <Fragment key={`${i + 1}`}>
        {i > 0 && <Separator className={cn('my-0.5')} />}
        {section.map((interaction, j) => (
          <MenuItem key={`${i + 1}-${j + 1}`} {...itemProps} {...interaction} />
        ))}
      </Fragment>
    ))
}

export { InteractiveMenuItems, type InteractiveMenuItemsProps }
