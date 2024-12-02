import clsx from 'clsx'
import { type HTMLProps, forwardRef } from 'react'

interface TextInputProps extends HTMLProps<HTMLInputElement> {}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const { ...inputProps } = props

  return (
    <input
      {...inputProps}
      ref={ref}
      className={clsx(
        'flex flex-row items-center',
        'rounded-md px-2 py-1 outline-none border-1',
        'dark:bg-dark-900 dark:text-light-100 dark:border-dark-700',
        'bg-light-100 text-dark-900 border-light-300',
        inputProps.className,
      )}
    />
  )
})

export { TextInput, type TextInputProps }
