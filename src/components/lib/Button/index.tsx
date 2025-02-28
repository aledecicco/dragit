import * as Ariakit from '@ariakit/react'
import clsx from 'clsx'
import { match } from 'ts-pattern'

import type { Size } from '@utils/types'

interface ButtonProps extends Ariakit.ButtonProps {
  variant: 'primary' | 'cta' | 'neutral' | 'plain'
  rounded?: boolean
  size?: Size
}

const Button = (props: ButtonProps) => {
  const { variant, rounded = false, size = 'md', ...buttonProps } = props

  return (
    <Ariakit.Button
      {...buttonProps}
      className={clsx(
        'w-max h-max',
        'flex flex-row justify-center items-center text-center',
        'border-none font-semibold',
        'cursor-pointer active:scale-98',
        rounded && 'aspect-square',
        match(size)
          .with('sm', () => [
            'text-sm gap-2',
            rounded ? 'p-1 rounded-4xl' : 'px-2 py-1.25 rounded-lg',
          ])
          .with('md', () => [
            'text-md gap-2',
            rounded ? 'p-1.5 rounded-4xl' : 'px-2.5 py-1.75 rounded-lg',
          ])
          .with('lg', () => [
            'text-lg gap-3',
            rounded ? 'p-2 rounded-4xl' : 'px-3.5 py-2.25 rounded-lg',
          ])
          .exhaustive(),
        variant === 'primary' && [
          'shadow-xs bg-primary-700 text-light-50',
          'hover:bg-primary-600',
          'aria-expanded:bg-primary-600',
          'aria-disabled:bg-primary-500/40 aria-disabled:text-light-800',
        ],
        variant === 'cta' && [
          'shadow-xs bg-accent-600 text-light-50',
          'hover:bg-accent-500',
          'aria-expanded:bg-accent-500',
          'aria-disabled:bg-accent-600/40 aria-disabled:text-light-700',
        ],
        variant === 'neutral' && [
          'shadow-xs bg-dark-300 text-light-50',
          'hover:bg-dark-200',
          'aria-expanded:bg-dark-200',
          'aria-disabled:bg-dark-400/70 aria-disabled:text-light-950',
        ],
        variant === 'plain' && [
          'hover:shadow-xs bg-transparent text-light-50',
          'hover:bg-dark-400',
          'aria-expanded:bg-dark-400',
          'aria-disabled:text-light-800',
        ],
        buttonProps.className,
      )}
    />
  )
}

export { Button, type ButtonProps }
