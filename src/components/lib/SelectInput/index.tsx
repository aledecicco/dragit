import { Button } from '@lib/Button'
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
        <Select.Trigger aria-label={ariaLabel} ref={ref} asChild>
          <Button variant="plain" className={clsx('group gap-4')}>
            <Select.Value placeholder={placeholder} />
            <Select.Icon className={clsx(' group-aria-expanded:rotate-180')}>
              <ChevronDownIcon />
            </Select.Icon>
          </Button>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className={clsx(
              'overflow-hidden rounded-sm shadow-sm',
              'bg-light-100 dark:bg-dark-900',
              'w-max',
            )}
          >
            <Select.ScrollUpButton
              className={clsx(
                'flex items-center justify-center',
                'border-b-2 border-b-dark/5 dark:border-b-light/5',
              )}
            >
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
            <Select.ScrollDownButton
              className={clsx(
                'flex items-center justify-center',
                'border-t-2 border-t-dark/5 dark:border-t-light/5',
              )}
            >
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
          'text-sm flex flex-row items-center justify-center px-6 py-2',
          'select-none outline-none not-disabled:cursor-pointer',
          'data-highlighted:bg-dark/5 data-highlighted:dark:bg-light/5',
          'data-[state=checked]:bg-primary/50',
          'data-highlighted:data-[state=checked]:bg-primary/70',
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
