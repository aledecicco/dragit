import { useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'
import { useClickAway } from 'react-use'

import { MultiSelectContextProvider, useSelectionUpdater } from './context'
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
  const { children, itemsCount, ...compositeProps } = props

  const { setSelection } = useSelectionUpdater()
  const ref = useRef<HTMLDivElement>(null)

  useClickAway(ref, () => {
    if (!document.querySelector('[role="menu"], [role="dialog"]')) {
      setSelection([])
    }
  })

  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite
        onClick={(e) => {
          if (!(e.target instanceof Element)) {
            return
          }

          const item = e.target.closest('[role="option"]')
          if (!item) {
            setSelection([])
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setSelection([])
            return
          }

          if ((e.key === 'a' || e.key === 'A') && (e.metaKey || e.ctrlKey)) {
            setSelection([...Array(itemsCount).keys()])
            return
          }
        }}
        role="listbox"
        aria-multiselectable
        {...compositeProps}
        render={children}
        ref={mergeRefs([ref, compositeProps.ref])}
      />
    </Ariakit.CompositeProvider>
  )
}

export { MultiSelect, type MultiSelectProps }
