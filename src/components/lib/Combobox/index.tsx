import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'
import { type ReactNode, startTransition, useMemo, useState } from 'react'

import { Button } from '@lib/Button'
import { Separator } from '@lib/Separator'
import { mapOr } from '@utils/array'
import { cn } from '@utils/styles'

interface ComboboxOption<T> {
  value: string
  data: T
}

interface ComboboxProps<T> extends Omit<Ariakit.SelectProps, 'value'> {
  option: ComboboxOption<T> | undefined
  options: ComboboxOption<T>[]
  renderOption: (option: ComboboxOption<T>) => ReactNode
  setOption: (option: ComboboxOption<T>) => void
  placeholder?: string
}

const Combobox = <T,>(props: ComboboxProps<T>) => {
  const {
    option,
    options,
    renderOption,
    setOption,
    placeholder = 'Select...',
    className,
    ...selectProps
  } = props

  const [search, setSearch] = useState('')

  const matchingOptions = useMemo(() => {
    return matchSorter(options, search, { keys: ['value'] })
  }, [options, search])

  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      includesBaseElement={false}
      setValue={(value) => {
        startTransition(() => setSearch(value))
      }}
    >
      <Ariakit.SelectProvider
        value={option?.value ?? ''}
        setValue={(value) => {
          const option = options.find((option) => value === option.value)

          if (option) {
            setOption(option)
          }
        }}
        defaultValue=""
      >
        <Ariakit.Select
          render={
            <Button
              variant="plain"
              size="lg"
              className={cn(
                'group gap-2 text-sm',
                option === undefined && 'font-thin text-light-300',
                className,
              )}
            />
          }
          {...selectProps}
        >
          {option === undefined ? placeholder : renderOption(option)}
          <Ariakit.SelectArrow
            className={cn('group-aria-expanded:rotate-180')}
          />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          unmountOnHide
          portal
          sameWidth
          gutter={4}
          className={cn('rounded-lg shadow-md', 'bg-dark-300 p-2')}
        >
          <Ariakit.Combobox
            placeholder="Search..."
            className={cn(
              'w-full px-2 py-3 rounded-sm',
              'text-sm bg-dark-950/40',
            )}
            autoSelect
          />

          <Separator className={cn('my-2')} />

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
              matchingOptions,
              (option) => {
                return (
                  <Ariakit.SelectItem
                    key={option.value}
                    value={option.value}
                    render={
                      <Ariakit.ComboboxItem
                        className={cn(
                          'text-sm text-center',
                          'p-2 rounded-sm',
                          'cursor-pointer data-[active-item]:bg-dark-200',
                        )}
                      />
                    }
                  >
                    {renderOption(option)}
                  </Ariakit.SelectItem>
                )
              },
            )}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  )
}

export { Combobox, type ComboboxProps, type ComboboxOption }
