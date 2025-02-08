import { IconCaretDownFilled } from '@tabler/icons-react'
import clsx from 'clsx'
import { Select } from 'radix-ui'
import { type ReactNode, forwardRef } from 'react'

import { Button } from '@lib/Button'

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
          <Button
            variant="plain"
            className={clsx(
              'group gap-2 active:scale-100',
              'data-placeholder:font-thin data-placeholder:italic',
            )}
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className={clsx('group-aria-expanded:rotate-180')}>
              <IconCaretDownFilled size={16} />
            </Select.Icon>
          </Button>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className={clsx(
              'overflow-hidden rounded-lg shadow-md',
              'bg-dark-900',
              'w-max',
            )}
          >
            <Select.Viewport>
              {options.map((option) => (
                <SelectInputItem
                  key={option.value}
                  value={option.value}
                  render={option.render}
                />
              ))}
            </Select.Viewport>
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
          'data-highlighted:bg-light/5',
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
