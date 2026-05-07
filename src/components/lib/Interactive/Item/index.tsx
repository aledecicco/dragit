import { Fragment } from 'react'
import * as Ariakit from '@ariakit/react'

import { ActionIndicator } from '@/common/ActionIndicator'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'
import { cn, propsWithCn } from '@/utils/styles'

import type { AnyInteraction } from '../../ActionButton'
import { ContextMenu } from '../../ContextMenu'

interface InteractiveItemProps extends Ariakit.RoleProps {
  /**
   * The list of ways to interact with this item.
   */
  interactions: AnyInteraction[][]

  /**
   * The action to trigger by default when this item is double-clicked.
   */
  defaultAction?: () => void
}

/**
 * An abstract component that's equipped to handle action tracking through different interactions.
 */
const InteractiveItem = (props: InteractiveItemProps) => {
  const { interactions, defaultAction, children, ...itemProps } = props

  const actions = interactions.flatMap((section) =>
    section.map((interaction) => interaction.action),
  )

  return (
    <ContextMenu
      items={interactions
        .filter((section) => section.length > 0)
        .map((section, i) => (
          <Fragment key={`${i + 1}`}>
            {i > 0 && <Separator className={cn('my-0.5')} />}
            {section.map((interaction, j) => (
              <MenuItem key={`${i + 1}-${j + 1}`} {...interaction} />
            ))}
          </Fragment>
        ))}
    >
      <Ariakit.Role
        {...propsWithCn(itemProps, 'relative')}
        onDoubleClick={(e) => {
          itemProps.onDoubleClick?.(e)
          defaultAction?.()
        }}
        onKeyDown={(e) => {
          console.log(e)
          itemProps.onKeyDown?.(e)
          console.log('after')
          if (e.key === 'Enter') {
            console.log('in')
            defaultAction?.()
          }
        }}
      >
        {children}

        <ActionIndicator
          actions={actions}
          className={cn('absolute top-1 right-1')}
        />
      </Ariakit.Role>
    </ContextMenu>
  )
}

export { InteractiveItem, type InteractiveItemProps }
