import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'
import { useDeferredValue, useState } from 'react'

import type { Glyph } from '@ui/Icon'
import { mapOr } from '@utils/array'
import { cn, propsWithCn } from '@utils/styles'

interface AutosuggestProps extends Ariakit.ComboboxProps {
  /**
   * The current value of the input.
   */
  value: string | undefined

  /**
   * The list of all possible suggestions that could be displayed.
   * If not provided, the suggestions dropdown won't be displayed.
   */
  suggestions?: string[]

  /**
   * An icon decorator for the input.
   */
  Glyph?: Glyph

  /**
   * Callback that updates the value of the input.
   *
   * @param value - The new value to set. If `undefined`, the input will be cleared.
   */
  setValue: (value: string | undefined) => void

  /**
   * Placeholder text for the input when no value is set.
   */
  placeholder?: string
}

/**
 * Input field that displays suggestions from a list as the user types with autocomplete functionality.
 *
 * Automatically filters suggestions based on the current input value.
 */
const Autosuggest = (props: AutosuggestProps) => {
  const {
    value,
    suggestions = [],
    Glyph,
    setValue,
    placeholder = 'Select...',
    store,
    ...comboboxProps
  } = props

  const [search, setSearch] = useState(value ?? '')
  const deferredSearch = useDeferredValue(search)

  const matchingSuggestions = matchSorter(suggestions, deferredSearch)

  return (
    <Ariakit.ComboboxProvider store={store} value={search} setValue={setSearch}>
      <Ariakit.Combobox
        autoComplete="both"
        placeholder={placeholder}
        {...propsWithCn(
          comboboxProps,
          'p-2 bg-dark-800 rounded-sm text-sm text-light-800',
          'min-w-0 text-sm',
          value === undefined && 'font-thin text-light-300',
        )}
        onKeyDown={(e) => {
          comboboxProps.onKeyDown?.(e)

          if (e.key === 'Enter') {
            setValue(search === '' ? undefined : search)
          }
        }}
      />

      {suggestions.length > 0 && (
        <Ariakit.ComboboxPopover
          portal
          sameWidth
          gutter={4}
          className={cn('rounded-lg shadow-md', 'bg-dark-300 p-2')}
        >
          <Ariakit.ComboboxList className={cn('max-h-80 overflow-y-auto')}>
            {mapOr(
              <div
                className={cn(
                  'text-center p-2',
                  'text-sm italic text-light-950',
                )}
              >
                No matches found
              </div>,
              matchingSuggestions,
              (suggestion) => (
                <AutosuggestItem
                  key={suggestion}
                  value={suggestion}
                  onClick={() => {
                    setValue(suggestion)
                  }}
                />
              ),
            )}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      )}
    </Ariakit.ComboboxProvider>
  )
}

interface AutosuggestItemProps extends Ariakit.ComboboxItemProps {}

const AutosuggestItem = (props: AutosuggestItemProps) => {
  const { ...itemProps } = props

  return (
    <Ariakit.ComboboxItem
      focusOnHover
      {...propsWithCn(
        itemProps,
        'text-sm text-center text-light-50',
        'p-2 rounded-sm cursor-pointer',
        'wrap-anywhere',
        itemProps.value === '' && 'italic',
        'data-[active-item]:bg-dark-100',
      )}
    >
      <Ariakit.ComboboxItemValue
        className={cn('*:data-[user-value]:text-accent-300')}
      />
    </Ariakit.ComboboxItem>
  )
}

export { Autosuggest, type AutosuggestProps }
