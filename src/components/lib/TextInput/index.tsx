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
        'rounded-md px-2 py-1 outline-none',
        'bg-light-50 border-1 border-dark-600 text-dark-800',
        props.className,
      )}
    />
  )
})

export { TextInput, type TextInputProps }
