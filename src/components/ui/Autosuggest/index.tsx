import { useDeferredValue, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'

import { cn, propsWithCn } from '@/utils/styles'

import { AutosuggestItem } from './Item'

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
   * Callback that updates the value of the input.
   *
   * @param value - The new value to set. If `undefined`, the input will be cleared.
   */
  setValue: (value: string | undefined) => void
}

/**
 * Input field that displays suggestions from a list as the user types with autocomplete functionality.
 *
 * Automatically filters suggestions based on the current input value.
 */
const Autosuggest = (props: AutosuggestProps) => {
  const { value, suggestions = [], setValue, store, ...comboboxProps } = props

  const [search, setSearch] = useState(value ?? '')
  const deferredSearch = useDeferredValue(search)

  const matchingSuggestions = matchSorter(suggestions, deferredSearch)

  return (
    <Ariakit.ComboboxProvider store={store} value={search} setValue={setSearch}>
      <Ariakit.Combobox
        autoComplete="both"
        placeholder={comboboxProps.placeholder ?? 'Select...'}
        {...propsWithCn(
          comboboxProps,
          'px-2.5 py-1.75 bg-dark-800 rounded-sm text-sm text-light-800',
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
          className={cn('rounded-lg shadow-md', 'bg-dark-300 p')}
        >
          <Ariakit.ComboboxList className={cn('max-h-80 overflow-y-auto')}>
            {suggestions.length === 0 ? (
              <div
                className={cn(
                  'text-center p-2',
                  'text-sm italic text-light-950',
                )}
              >
                No options found
              </div>
            ) : matchingSuggestions.length === 0 ? (
              <div
                className={cn(
                  'text-center p-2',
                  'text-sm italic text-light-950',
                )}
              >
                No matches found
              </div>
            ) : (
              matchingSuggestions.map((suggestion) => (
                <AutosuggestItem
                  key={suggestion}
                  value={suggestion}
                  onClick={() => {
                    setValue(suggestion)
                  }}
                />
              ))
            )}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxPopover>
      )}
    </Ariakit.ComboboxProvider>
  )
}

export { Autosuggest, type AutosuggestProps }
