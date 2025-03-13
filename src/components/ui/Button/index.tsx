import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@utils/styles'
import type { Size } from '@utils/types'

interface ButtonOwnProps {
  variant: 'primary' | 'cta' | 'neutral' | 'plain'
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
        'w-max',
        'flex flex-row justify-center items-center text-center',
        'border-none font-semibold',
        'cursor-pointer active:scale-98',
        round && 'aspect-square',
        match(size)
          .with('sm', () => [
            'text-xs gap-2',
            round ? 'p-1 rounded-4xl' : 'px-2 py-1.25 rounded-md',
          ])
          .with('md', () => [
            'text-sm gap-2',
            round ? 'p-1.5 rounded-4xl' : 'px-2.5 py-1.75 rounded-md',
          ])
          .with('lg', () => [
            'gap-3',
            round ? 'p-2 rounded-4xl' : 'px-3.5 py-2 rounded-md',
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
          'aria-disabled:bg-dark-400 aria-disabled:text-light-950/50',
        ],
        variant === 'plain' && [
          'hover:shadow-xs bg-transparent text-light-50',
          'hover:bg-dark-400',
          'aria-expanded:bg-dark-400',
          'aria-disabled:text-light-800',
        ],
      )}
    />
  )
}

export { Button, type ButtonProps, type ButtonOwnProps }
