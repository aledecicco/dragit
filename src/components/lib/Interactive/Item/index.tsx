import * as Ariakit from '@ariakit/react'

import { ActionIndicator } from '@/common/ActionIndicator'
import { WithContextMenu } from '@/lib/WithContextMenu'
import { type AnyInteraction, triggerInteraction } from '@/state/actions'
import { cn, propsWithCn } from '@/utils/styles'

import { InteractiveMenuItems } from '../MenuItems'
import type { InteractionEntry } from '../types'

interface InteractiveItemProps extends Ariakit.RoleProps {
  /**
   * The list of ways to interact with this item.
   */
  interactions: InteractionEntry[][]

  /**
   * The action to trigger by default when this item is activated.
   */
  activationAction?: () => void

  /**
   * The interaction to trigger when this item is deleted.
   */
  onDelete?: AnyInteraction
}

/**
 * An abstract component that's equipped to handle action tracking through different interactions.
 */
const InteractiveItem = (props: InteractiveItemProps) => {
  const { interactions, activationAction, onDelete, children, ...itemProps } =
    props

  const actions = interactions.flatMap((section) =>
    section.flatMap((interaction) =>
      'action' in interaction ? [interaction.action] : [],
    ),
  )

  return (
    <WithContextMenu
      items={<InteractiveMenuItems interactions={interactions} />}
      onContextMenu={
        actions.length === 0 ? (e) => e.preventDefault() : undefined
      }
    >
      <Ariakit.Role
        {...propsWithCn(itemProps, 'relative')}
        onDoubleClick={(e) => {
          itemProps.onDoubleClick?.(e)
          activationAction?.()
        }}
        onKeyDown={(e) => {
          itemProps.onKeyDown?.(e)

          if (e.key === 'Enter') {
            activationAction?.()
          }

          if (e.key === 'Delete' && onDelete) {
            triggerInteraction(onDelete)
          }
        }}
      >
        {children}

        <ActionIndicator
          actions={actions}
          containerProps={{ className: cn('absolute top-1 right-1') }}
        />
      </Ariakit.Role>
    </WithContextMenu>
  )
}

export { InteractiveItem, type InteractiveItemProps }
