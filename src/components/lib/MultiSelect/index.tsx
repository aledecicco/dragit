import { useRef } from 'react'
import * as Ariakit from '@ariakit/react'
import { mergeRefs } from 'react-merge-refs'
import { useClickAway } from 'react-use'

import { MultiSelectContextProvider, useSelectionUpdater } from './context'
import { MultiSelectItem } from './Item'

interface MultiSelectProps extends Omit<Ariakit.CompositeProps, 'children'> {
  children: Ariakit.CompositeProps['render']
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
  const { children, ...compositeProps } = props

  const { setSelection } = useSelectionUpdater()
  const ref = useRef(null)

  useClickAway(ref, () => {
    console.log('A')
    setSelection([])
  })

  return (
    <Ariakit.CompositeProvider>
      <Ariakit.Composite
        role="listbox"
        aria-multiselectable
        {...compositeProps}
        render={children}
        ref={mergeRefs([compositeProps.ref, ref])}
      />
    </Ariakit.CompositeProvider>
  )
}

export { MultiSelect, type MultiSelectProps }
