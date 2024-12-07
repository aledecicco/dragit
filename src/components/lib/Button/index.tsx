import clsx from 'clsx'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'cta' | 'neutral' | 'plain'
  rounded?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { variant, rounded, ...buttonProps } = props

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={clsx(
        'w-max h-max',
        'flex flex-row justify-center items-center text-center',
        'border-none outline-none font-semibold text-md',
        'enabled:cursor-pointer enabled:active:scale-98',
        rounded ? 'p-2 rounded-4xl' : 'px-4 py-2 rounded-lg',
        variant === 'primary' && [
          'shadow-xs bg-primary-600 text-light-50',
          'enabled:hover:bg-primary-700 enabled:dark:hover:bg-primary-500',
        ],
        variant === 'cta' && [
          'shadow-xs bg-accent-500 text-light-50',
          'enabled:hover:bg-accent-600 enabled:dark:hover:bg-accent-400',
        ],
        variant === 'neutral' && [
          'shadow-xs bg-light-200 text-dark-700 dark:bg-dark-900 dark:text-light-50',
          'enabled:hover:bg-light-300 enabled:dark:hover:bg-dark-800',
        ],
        variant === 'plain' && [
          'hover:shadow-xs bg-transparent text-dark-800 dark:text-light-50',
          'enabled:hover:bg-dark/5 enabled:dark:hover:bg-light/5',
        ],
        buttonProps.className,
      )}
    />
  )
})

export { Button, type ButtonProps }
