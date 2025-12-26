import { type ReactNode, startTransition, useState } from 'react'
import * as Ariakit from '@ariakit/react'
import { IconChevronDown } from '@tabler/icons-react'
import { matchSorter } from 'match-sorter'

import { Button, type ButtonProps } from '@/ui/Button'
import { Marquee } from '@/ui/Marquee'
import { Separator } from '@/ui/Separator'
import { mapOr } from '@/utils/array'
import { cn, propsWithCn } from '@/utils/styles'

import { type Glyph, Icon, type IconProps } from '../Icon'
import { ComboboxItem } from './Item'

interface BaseComboboxProps<T> extends Partial<ButtonProps> {
  /**
   * The currently selected option.
   */
  option: T | undefined

  /**
   * The list of all available options.
   */
  options: T[]

  /**
   * Function that gets the string value of an option.
   *
   * @param option - The option to get the value for.
   */
  getValue?: (option: T) => string

  /**
   * Function that renders an option.
   *
   * @param option - The option to render.
   */
  renderOption?: (option: T) => ReactNode

  /**
   * Placeholder text to display when no option is selected.
   */
  placeholder?: string

  /**
   * A decorator for the input.
   */
  Glyph?: Glyph

  /**
   * Additional props to pass to the decorator icon.
   */
  iconProps?: Partial<IconProps>
}

interface WithEmptyComboboxProps<T> extends BaseComboboxProps<T> {
  /**
   * Callback that updates the selected option.
   *
   * @param option - The new option to set.
   */
  setOption: (option: T | undefined) => void

  /**
   * Text for an optional empty option.
   */
  emptyOption: string
}

interface WithoutEmptyComboboxProps<T> extends BaseComboboxProps<T> {
  /**
   * Callback that updates the selected option.
   *
   * @param option - The new option to set.
   */
  setOption: (option: T) => void

  /**
   * Text for an optional empty option.
   */
  emptyOption?: never
}

type ComboboxProps<T> = WithEmptyComboboxProps<T> | WithoutEmptyComboboxProps<T>

/**
 * A select field that allows searching through a list of options.
 *
 * Automatically filters options based on the current input value.
 */
function Combobox(props: ComboboxProps<string>): ReactNode

function Combobox<T>(
  props: ComboboxProps<T> & { getValue: (option: T) => string },
): ReactNode

function Combobox<T>(props: ComboboxProps<T>) {
  const {
    option,
    options,
    getValue,
    setOption,
    renderOption,
    emptyOption,
    placeholder = 'Select...',
    Glyph,
    iconProps,
    ...buttonProps
  } = props

  const getOptionValue = (option: T): string =>
    getValue ? getValue(option) : (option as string)

  const [search, setSearch] = useState('')
  const value = option ? getOptionValue(option) : ''

  const matchingOptions = matchSorter(options, search, {
    keys: [getOptionValue],
  })

  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      includesBaseElement={false}
      setValue={(newValue) => {
        startTransition(() => setSearch(newValue))
      }}
    >
      <Ariakit.SelectProvider
        value={value}
        setValue={(newValue) => {
          if (newValue === '' && emptyOption) {
            setOption(undefined)
            return
          }

          const newOption = options.find(
            (_option) => newValue === getOptionValue(_option),
          )

          if (newOption) {
            setOption(newOption)
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
                !option && 'font-thin text-light-300',
              )}
            />
          }
        >
          {Glyph && (
            <Icon Glyph={Glyph} size={buttonProps.size} {...iconProps} />
          )}
          <Marquee reverse={false}>
            {option
              ? (renderOption?.(option) ?? getOptionValue(option))
              : placeholder}
          </Marquee>
          <Icon
            Glyph={IconChevronDown}
            size={buttonProps.size}
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
            {search === '' && emptyOption && (
              <ComboboxItem value="">{emptyOption}</ComboboxItem>
            )}

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
              (_option) => {
                const _value = getOptionValue(_option)
                return (
                  <ComboboxItem key={_value} value={_value}>
                    {renderOption ? renderOption(_option) : _value}
                  </ComboboxItem>
                )
              },
            )}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  )
}

export { Combobox, type ComboboxProps }
