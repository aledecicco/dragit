import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as Select from '@radix-ui/react-select'
import clsx from 'clsx'
import { type ReactNode, forwardRef } from 'react'

interface SelectInputProps extends Select.SelectProps {
  options: {
    value: string
    render?: () => ReactNode
  }[]
  placeholder?: ReactNode
  ariaLabel?: string | undefined
}

const SelectInput = forwardRef<HTMLButtonElement, SelectInputProps>(
  (props, ref) => {
    const { options, placeholder, ariaLabel, ...selectProps } = props

    return (
      <Select.Root {...selectProps}>
        <Select.Trigger
          aria-label={ariaLabel}
          ref={ref}
          className={clsx(
            'h-max outline-none inline-flex items-center px-2',
            'rounded-lg font-normal text-md',
            'border-1 border-light-accent text-light-accent bg-light-shade',
            'not-disabled:cursor-pointer hover:bg-light-shade-darker active:bg-light-shade-darkest',
          )}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={0}
            className={clsx(
              'overflow-hidden bg-light-shade rounded-sm shadow-sm',
            )}
          >
            <Select.ScrollUpButton>
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport>
              {options.map((option) => (
                <SelectInputItem
                  key={option.value}
                  value={option.value}
                  render={option.render}
                />
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton>
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    )
  },
)

interface SelectInputItemProps extends Select.SelectItemProps {
  render?: () => ReactNode
}

const SelectInputItem = forwardRef<HTMLDivElement, SelectInputItemProps>(
  (props, ref) => {
    const { render, ...selectItemProps } = props

    return (
      <Select.SelectItem
        ref={ref}
        {...selectItemProps}
        className={clsx(
          'text-sm flex flex-row items-center justify-center px-4 py-1',
          'relative select-none outline-none not-disabled:cursor-pointer',
          'data-highlighted:bg-light-shade-darker data-[state=checked]:bg-light-accent-lightest',
          selectItemProps.className,
        )}
      >
        <Select.ItemText>
          {render ? render() : selectItemProps.value}
        </Select.ItemText>
      </Select.SelectItem>
    )
  },
)

export { SelectInput, type SelectInputProps }
