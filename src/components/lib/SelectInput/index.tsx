import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as SelectPrimitive from '@radix-ui/react-select'
import clsx from 'clsx'
import { type ReactNode, forwardRef } from 'react'

import { Button } from '@lib/Button'

interface SelectInputProps extends SelectPrimitive.SelectProps {
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
      <SelectPrimitive.Root {...selectProps}>
        <SelectPrimitive.Trigger aria-label={ariaLabel} ref={ref} asChild>
          <Button
            variant="plain"
            className={clsx(
              'group gap-3 active:scale-100 data-placeholder:font-thin data-placeholder:italic',
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon
              className={clsx('group-aria-expanded:rotate-180')}
            >
              <ChevronDownIcon />
            </SelectPrimitive.Icon>
          </Button>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={clsx(
              'overflow-hidden rounded-lg shadow-sm',
              'bg-light-100 dark:bg-dark-900',
              'w-max',
            )}
          >
            <SelectPrimitive.ScrollUpButton
              className={clsx(
                'flex items-center justify-center',
                'border-b-2 border-b-dark/5 dark:border-b-light/5',
              )}
            >
              <ChevronUpIcon />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectInputItem
                  key={option.value}
                  value={option.value}
                  render={option.render}
                />
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton
              className={clsx(
                'flex items-center justify-center',
                'border-t-2 border-t-dark/5 dark:border-t-light/5',
              )}
            >
              <ChevronDownIcon />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    )
  },
)

interface SelectInputItemProps extends SelectPrimitive.SelectItemProps {
  render?: () => ReactNode
}

const SelectInputItem = forwardRef<HTMLDivElement, SelectInputItemProps>(
  (props, ref) => {
    const { render, ...selectItemProps } = props

    return (
      <SelectPrimitive.SelectItem
        ref={ref}
        {...selectItemProps}
        className={clsx(
          'text-sm flex flex-row items-center justify-center px-6 py-2',
          'select-none outline-none not-disabled:cursor-pointer',
          'data-highlighted:bg-dark/5 data-highlighted:dark:bg-light/5',
          'data-[state=checked]:bg-primary/50',
          'data-highlighted:data-[state=checked]:bg-primary/70',
          selectItemProps.className,
        )}
      >
        <SelectPrimitive.ItemText>
          {render ? render() : selectItemProps.value}
        </SelectPrimitive.ItemText>
      </SelectPrimitive.SelectItem>
    )
  },
)

export { SelectInput, type SelectInputProps }
