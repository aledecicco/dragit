import clsx from 'clsx'
import type { ComponentProps } from 'react'

interface TextInputProps extends ComponentProps<'input'> {}

const TextInput = (props: TextInputProps) => {
  const { ...inputProps } = props

  return (
    <input
      {...inputProps}
      className={clsx(
        'flex flex-row items-center',
        'rounded-md px-2 py-1 outline-none border-1',
        'bg-dark-900 text-light-100 border-dark-700',
        inputProps.className,
      )}
    />
  )
}

export { TextInput, type TextInputProps }
