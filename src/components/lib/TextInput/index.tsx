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
        'text-dark-accent bg-light-shade border-1 border-dark-accent-lightest',
        props.className,
      )}
    />
  )
})

export { TextInput, type TextInputProps }
