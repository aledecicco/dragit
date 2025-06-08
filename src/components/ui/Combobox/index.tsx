import * as Ariakit from '@ariakit/react'
import { matchSorter } from 'match-sorter'
import { type ReactNode, memo, startTransition, useMemo, useState } from 'react'

import { Button, type ButtonProps } from '@ui/Button'
import { type Glyph, Icon } from '@ui/Icon'
import { Marquee } from '@ui/Marquee'
import { Separator } from '@ui/Separator'
import { mapOr } from '@utils/array'
import { cn, propsWithCn } from '@utils/styles'

interface ComboboxOption<T> {
  value: string
  data: T
}

interface ComboboxProps<T> extends Partial<ButtonProps> {
  /**
   * The currently selected option.
   */
  option: ComboboxOption<T> | undefined

  /**
   * The list of all available options.
   */
  options: ComboboxOption<T>[]

  /**
   * An icon decorator for the input.
   */
  Glyph?: Glyph

  /**
   * Function that renders an option.
   *
   * @param option - The option to render.
   */
  renderOption: (option: ComboboxOption<T>) => ReactNode

  /**
   * Callback that updates the selected option.
   *
   * @param option - The new option to set.
   */
  setOption: (option: ComboboxOption<T>) => void

  /**
   * Placeholder text to display when no option is selected.
   */
  placeholder?: string
}

const LIMIT = 20

/**
 * A select field that allows searching through a list of options.
 *
 * Automatically filters options based on the current input value.
 */
const Combobox = <T,>(props: ComboboxProps<T>) => {
  const {
    option,
    options,
    Glyph,
    renderOption,
    setOption,
    placeholder = 'Select...',
    ...buttonProps
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
              status="neutral"
              size="lg"
              {...propsWithCn(
                buttonProps,
                'min-w-0 group/combobox gap-2 text-sm',
                option === undefined && 'font-thin text-light-300',
              )}
            />
          }
        >
          {Glyph && <Icon Glyph={Glyph} size="md" />}
          <Marquee reverse={false}>
            {option === undefined ? placeholder : renderOption(option)}
          </Marquee>
          <Ariakit.SelectArrow
            className={cn('group-aria-expanded/combobox:rotate-180')}
          />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          portal
          sameWidth
          gutter={4}
          className={cn('rounded-lg shadow-md', 'bg-dark-300 p-2')}
        >
          <Ariakit.Combobox
            placeholder="Search..."
            className={cn('w-full p-2 rounded-sm', 'text-sm bg-dark-500')}
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
              matchingOptions.slice(0, LIMIT),
              (option) => (
                <ComboboxItem key={option.value} item={option}>
                  {renderOption(option)}
                </ComboboxItem>
              ),
            )}

            {matchingOptions.length > LIMIT && (
              <div
                className={cn(
                  'text-center p-2',
                  'text-xs italic text-light-950',
                )}
              >
                ...
              </div>
            )}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  )
}

interface ComboboxItemProps<T> extends Ariakit.SelectItemProps {
  item: ComboboxOption<T>
}

const ComboboxItem = memo(<T,>(props: ComboboxItemProps<T>) => {
  const { item, ...itemProps } = props

  return (
    <Ariakit.SelectItem
      {...itemProps}
      value={item.value}
      render={
        <Ariakit.ComboboxItem
          className={cn(
            'text-sm text-center text-light-50',
            'p-2 rounded-sm cursor-pointer',
            'wrap-anywhere',
            item.value === '' && 'italic not-aria-selected:text-light-800',
            'data-[active-item]:bg-dark-100',
            'aria-selected:bg-accent-300/15',
            'data-[active-item]:aria-selected:bg-accent-300/20',
          )}
        />
      }
    />
  )
})

export { Combobox, type ComboboxProps, type ComboboxOption }
