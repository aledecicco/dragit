import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import { matchSorter } from 'match-sorter'
import { type ReactNode, startTransition, useMemo, useState } from 'react'

import { Button } from '@lib/Button'
import { Separator } from '@lib/Separator'
import { mapOr } from '@utils/array'

interface ComboboxProps extends Omit<Ariakit.SelectProps, 'value'> {
  options: string[]
  renderOption?: (option: string) => ReactNode
  value: string
  setValue: Ariakit.SelectProviderProps['setValue']
  placeholder?: string
}

const Combobox = (props: ComboboxProps) => {
  const {
    options,
    renderOption,
    value,
    setValue,
    placeholder,
    ...selectProps
  } = props

  const [search, setSearch] = useState('')

  const matchingOptions = useMemo(() => {
    return matchSorter(options, search)
  }, [options, search])

  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => setSearch(value))
      }}
    >
      <Ariakit.SelectProvider value={value} setValue={setValue} defaultValue="">
        <Ariakit.Select
          render={
            <Button
              variant="plain"
              size="lg"
              className={clsx(
                'group gap-2 text-sm',
                value === '' && 'font-thin [&]:text-light-300',
              )}
            />
          }
          {...selectProps}
        >
          {value === ''
            ? placeholder
            : renderOption
              ? renderOption(value)
              : value}
          <Ariakit.SelectArrow
            className={clsx('group-aria-expanded:rotate-180')}
          />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          portal
          sameWidth
          gutter={4}
          className={clsx('rounded-lg shadow-md', 'bg-dark-900 p-2')}
        >
          <Ariakit.Combobox
            placeholder="Search..."
            className={clsx(
              'w-full px-2 py-3 rounded-sm',
              'text-sm bg-dark-950/40',
            )}
            autoSelect
          />

          <Separator className={clsx('my-2')} />

          <Ariakit.ComboboxList className={clsx('max-h-80 overflow-y-auto')}>
            {mapOr(
              <div
                className={clsx(
                  'text-center p-2',
                  'text-sm italic text-dark-400',
                )}
              >
                No matches found
              </div>,
              matchingOptions,
              (option) => (
                <Ariakit.SelectItem
                  key={option}
                  value={option}
                  render={
                    <Ariakit.ComboboxItem
                      className={clsx(
                        'text-sm text-center',
                        'p-2 rounded-sm',
                        'cursor-pointer data-[active-item]:bg-dark-700',
                      )}
                    />
                  }
                >
                  {renderOption ? renderOption(option) : option}
                </Ariakit.SelectItem>
              ),
            )}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  )
}

export { Combobox, type ComboboxProps }
