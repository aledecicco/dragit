import { Fragment, useEffect } from 'react'

import type { Action } from '@/state/actions'
import { MenuItem } from '@/ui/Menu/Item'
import { Separator } from '@/ui/Separator'
import { cn } from '@/utils/styles'

import { ContextMenu } from '../ContextMenu'
import { MultiSelect, type MultiSelectProps } from '../MultiSelect'
import { useSelectedItems, useSelectionUpdater } from '../MultiSelect/context'

interface MultiInteractionProps<T> extends MultiSelectProps {
  /**
   * The list of ways to interact with the items.
   */
  actions: Action<T[]>[][]

  /**
   * The items being interacted with.
   */
  items: T[]
}

const MultiInteraction = <T,>(props: MultiInteractionProps<T>) => {
  const { actions, items, children, ...multiSelectProps } = props

  return (
    <MultiSelect {...multiSelectProps}>
      <MultiInteractionInner actions={actions} items={items}>
        {children}
      </MultiInteractionInner>
    </MultiSelect>
  )
}

const MultiInteractionInner = <T,>(props: MultiInteractionProps<T>) => {
  const { actions, items, children } = props

  const itemIndexes = useSelectedItems()
  const { setSelection } = useSelectionUpdater()

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset selection when items change
  useEffect(() => {
    setSelection([])
  }, [items])

  return (
    <ContextMenu
      items={actions
        .filter((section) => section.length > 0)
        .map((section, i) => (
          <Fragment key={`${i + 1}`}>
            {i > 0 && <Separator className={cn('my-0.5')} />}
            {section.map((action, j) => (
              <MenuItem
                key={`${i + 1}-${j + 1}`}
                action={action}
                argsRequester={() =>
                  items.filter((_, index) => itemIndexes.has(index))
                }
              />
            ))}
          </Fragment>
        ))}
    >
      {children}
    </ContextMenu>
  )
}

export { MultiInteraction, type MultiInteractionProps }
