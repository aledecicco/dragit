import clsx from 'clsx'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { match } from 'ts-pattern'

import type { Size } from '@utils/types'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'cta' | 'neutral' | 'plain'
  rounded?: boolean
  size?: Size
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { variant, rounded = false, size = 'md', ...buttonProps } = props

  return (
    <button
      {...buttonProps}
      ref={ref}
      className={clsx(
        'w-max h-max',
        'flex flex-row justify-center items-center text-center',
        'border-none outline-none font-semibold',
        'enabled:cursor-pointer enabled:active:scale-98',
        match(size)
          .with('sm', () => [
            'text-sm gap-2',
            rounded ? 'p-1.5 rounded-4xl' : 'px-2 py-1.5 rounded-lg',
          ])
          .with('md', () => [
            'text-md gap-2',
            rounded ? 'p-2 rounded-4xl' : 'px-3 py-2 rounded-lg',
          ])
          .with('lg', () => [
            'text-lg gap-3',
            rounded ? 'p-2.5 rounded-4xl' : 'px-4 py-2.5 rounded-lg',
          ])
          .exhaustive(),
        rounded && 'aspect-square',
        variant === 'primary' && [
          'shadow-xs bg-primary-600 text-light-50',
          'enabled:hover:bg-primary-500',
          'disabled:bg-primary-600/40 disabled:text-light-500',
        ],
        variant === 'cta' && [
          'shadow-xs bg-accent-500 text-light-50',
          'enabled:hover:bg-accent-400',
          'disabled:bg-accent-500/40 disabled:text-light-400',
        ],
        variant === 'neutral' && [
          'shadow-xs bg-dark-900 text-light-50',
          'enabled:hover:bg-dark-800',
          'disabled:bg-dark-900/50 disabled:text-light-500',
        ],
        variant === 'plain' && [
          'hover:shadow-xs bg-transparent text-light-50',
          'enabled:hover:bg-light/5',
          'disabled:text-light-600',
        ],
        buttonProps.className,
      )}
    />
  )
})

export { Button, type ButtonProps }
