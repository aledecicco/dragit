import { useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'
import { useClickAway } from 'react-use'

import {
  MultiSelectContextProvider,
  useSelectionAnchors,
  useSelectionUpdater,
} from './context'
import { MultiSelectItem } from './Item'

interface MultiSelectProps
  extends Omit<Ariakit.CompositeProps, 'children' | 'render'> {
  children: Ariakit.CompositeProps['render']

  /**
   * The total number of items in the multiselect list.
   */
  itemsCount: number
}

/**
 * A component that allows tracking the selection of arbitrary child items.
 * Handles modifier keys for multi-selection and clears selection on click-away.
 *
 * Should contain {@link MultiSelectItem} components as children.
 */
const MultiSelect = (props: MultiSelectProps) => {
  return (
    <MultiSelectContextProvider>
      <MultiSelectInner {...props} />
    </MultiSelectContextProvider>
  )
}

const MultiSelectInner = (props: MultiSelectProps) => {
  const { children, itemsCount, store, ...compositeProps } = props

  const { lastSelected } = useSelectionAnchors()
  const { setSelection, extendSelection } = useSelectionUpdater()
  const ref = useRef<HTMLDivElement>(null)

  const composite = Ariakit.useCompositeStore({ store })

  useClickAway(ref, () => {
    if (!document.querySelector('[role="menu"], [role="dialog"]')) {
      setSelection([])
    }
  })

  return (
    <Ariakit.Composite
      store={composite}
      onClick={(e) => {
        const target = e.target

        if (!(target instanceof HTMLElement)) {
          return
        }

        const containsAnyItem = composite
          .getState()
          .renderedItems.some((item) => item.element?.contains(target))

        if (!containsAnyItem) {
          setSelection([])
        }
      }}
      onKeyDown={(e) => {
        if (!(e.target instanceof Element)) {
          return
        }

        if (
          (e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
          e.shiftKey &&
          lastSelected !== undefined
        ) {
          const newExtension = composite.getState().activeId

          if (newExtension) {
            extendSelection(Number(newExtension))
          }

          return
        }

        if (e.key === 'Escape' && lastSelected !== undefined) {
          setSelection([])
          e.preventDefault()
          e.stopPropagation()
          return
        }

        if ((e.key === 'a' || e.key === 'A') && (e.metaKey || e.ctrlKey)) {
          const lastItem = composite.getState().items.at(-1)?.id

          if (lastItem) {
            composite.move(lastItem)
          }

          setSelection(0)
          extendSelection(itemsCount - 1)

          e.preventDefault()
          e.stopPropagation()

          return
        }
      }}
      role="listbox"
      data-has-selection={lastSelected !== undefined}
      aria-multiselectable
      {...compositeProps}
      render={children}
      focusable
      ref={mergeRefs([ref, compositeProps.ref])}
    />
  )
}

export { MultiSelect, type MultiSelectProps }
