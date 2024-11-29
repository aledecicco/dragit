import clsx from 'clsx'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'flat'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { variant, ...buttonProps } = props

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={clsx(
        'flex flex-row justify-center items-center text-center',
        'not-disabled:cursor-pointer',
        variant === 'primary' && [
          'px-4 py-2',
          'rounded-lg font-semibold text-md',
          'border-none bg-brand text-light-shade',
          'hover:bg-brand-lighter active:bg-brand active:scale-98',
        ],
        variant === 'flat' && [
          'px-5',
          'rounded-lg font-normal text-md',
          'border-2 border-light-accent text-light-accent bg-light-shade',
          'hover:bg-light-shade-darker active:bg-light-shade-darkest active:scale-98',
        ],
        props.className,
      )}
    />
  )
})

export { Button, type ButtonProps }
