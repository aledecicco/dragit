import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

type ButtonVariant = 'primary' | 'cta' | 'neutral' | 'plain'

interface ButtonOwnProps {
  variant: ButtonVariant
  round?: boolean
  size?: Size
}

type ButtonProps = ButtonOwnProps & Ariakit.ButtonProps

const Button = (props: ButtonProps) => {
  const { variant, round = false, size = 'md', ...buttonProps } = props

  return (
    <Ariakit.Button
      {...propsWithCn(
        buttonProps,
        'min-w-max h-max text-nowrap',
        'flex flex-row justify-center items-center text-center',
        'border-none font-semibold',
        'cursor-pointer active:scale-98',
        round && 'aspect-square',
        match(size)
          .with('sm', () => [
            'text-xs gap-2',
            round ? 'p-1 rounded-full' : 'px-1.75 py-1 rounded-md',
          ])
          .with('md', () => [
            'text-sm gap-2',
            round ? 'p-1.5 rounded-full' : 'px-2.5 py-1.75 rounded-md',
          ])
          .with('lg', () => [
            'gap-3',
            round ? 'p-2 rounded-full' : 'px-3.5 py-2 rounded-md',
          ])
          .exhaustive(),
        variant === 'primary' && [
          'shadow-xs bg-primary-700 text-light-50',
          'hover:bg-primary-600',
          'aria-expanded:bg-primary-600',
          'focus:bg-primary-600 data-focus:bg-primary-600',
          'aria-disabled:bg-primary-500/40 aria-disabled:text-light-800',
        ],
        variant === 'cta' && [
          'shadow-xs bg-accent-600 text-light-50',
          'hover:bg-accent-500',
          'aria-expanded:bg-accent-500',
          'focus:bg-accent-500 data-focus:bg-accent-500',
          'aria-disabled:bg-accent-600/40 aria-disabled:text-light-700',
        ],
        variant === 'neutral' && [
          'shadow-xs bg-dark-300 text-light-50',
          'hover:bg-dark-200',
          'aria-expanded:bg-dark-200',
          'focus:bg-dark-200 data-focus:bg-dark-200',
          'aria-disabled:bg-dark-400 aria-disabled:text-light-950/50',
        ],
        variant === 'plain' && [
          'hover:shadow-xs bg-transparent text-light-50',
          'hover:bg-dark-400',
          'aria-expanded:bg-dark-400',
          'focus:bg-dark-400 data-focus:bg-dark-400',
          'aria-disabled:text-light-800',
        ],
      )}
      onClick={(e) => {
        e.stopPropagation()
        buttonProps.onClick?.(e)
      }}
    />
  )
}

export { Button, type ButtonProps, type ButtonOwnProps, type ButtonVariant }
