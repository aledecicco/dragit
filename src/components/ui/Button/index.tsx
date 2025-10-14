import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

type ButtonVariant = 'filled' | 'plain'

type ButtonStatus = 'primary' | 'cta' | 'neutral' | 'success' | 'error'

interface ButtonProps extends Ariakit.ButtonProps {
  /**
   * The visual style of the button.
   */
  variant?: ButtonVariant

  /**
   * The status of the button, which affects its color and style.
   */
  status?: ButtonStatus

  /**
   * Whether the button should be round, with a square aspect ratio.
   */
  round?: boolean

  /**
   * The size of the button, which affects its padding and font size.
   */
  size?: Size
}

/**
 * Base button component with different styles, variants, and sizes.
 */
const Button = (props: ButtonProps) => {
  const {
    variant = 'filled',
    status = 'neutral',
    round = false,
    size = 'md',
    ...buttonProps
  } = props

  return (
    <Ariakit.Button
      {...propsWithCn(
        buttonProps,
        'min-w-max w-max h-max text-nowrap',
        'flex flex-row justify-center items-center text-center',
        'border-none font-semibold',
        'cursor-pointer active:scale-98',

        round && 'aspect-square',

        match(size)
          .with('sm', () => [
            'text-xs gap-2',
            round ? 'p-1 rounded-full' : 'px-1.75 py-1 rounded-sm',
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

        match(variant)
          .with('filled', () => 'shadow-xs')
          .with('plain', () => 'bg-transparent hover:shadow-xs')
          .exhaustive(),

        match({ variant, status })
          .with({ variant: 'filled', status: 'primary' }, () => [
            'bg-primary-700 text-light-50',
            'hover:bg-primary-600',
            'aria-expanded:bg-primary-600',
            'aria-checked:bg-primary-600',
            'focus:bg-primary-600 data-focus:bg-primary-600',
            'aria-disabled:bg-primary-500/40 aria-disabled:text-light-800',
          ])
          .with({ variant: 'plain', status: 'primary' }, () => [
            'text-primary-300',
            'hover:bg-primary-300/4',
            'aria-expanded:bg-primary-300/4',
            'aria-checked:bg-primary-300/4',
            'focus:bg-primary-300/4 data-focus:bg-primary-300/4',
            'aria-disabled:text-primary-400/40',
          ])
          .with({ variant: 'filled', status: 'cta' }, () => [
            'bg-accent-600 text-light-50',
            'hover:bg-accent-500',
            'aria-expanded:bg-accent-500',
            'aria-checked:bg-accent-500',
            'focus:bg-accent-500 data-focus:bg-accent-500',
            'aria-disabled:bg-accent-600/40 aria-disabled:text-light-700',
          ])
          .with({ variant: 'plain', status: 'cta' }, () => [
            'text-accent-600',
            'hover:bg-accent-600/4',
            'aria-expanded:bg-accent-600/4',
            'aria-checked:bg-accent-600/4',
            'focus:bg-accent-600/4 data-focus:bg-accent-600/4',
            'aria-disabled:text-accent-500/40',
          ])
          .with({ variant: 'filled', status: 'neutral' }, () => [
            'bg-dark-300 text-light-50',
            'hover:bg-dark-100',
            'aria-expanded:bg-dark-100',
            'aria-checked:bg-dark-100',
            'focus:bg-dark-100 data-focus:bg-dark-100',
            'aria-disabled:bg-dark-400 aria-disabled:text-light-950/50',
          ])
          .with({ variant: 'plain', status: 'neutral' }, () => [
            'text-light-50',
            'hover:bg-light-50/4',
            'aria-expanded:bg-light-50/4',
            'aria-checked:bg-light-50/4',
            'focus:bg-light-50/4 data-focus:bg-light-50/4',
            'aria-disabled:text-light-800',
          ])
          .with({ variant: 'filled', status: 'success' }, () => [
            'bg-success-700 text-light-50',
            'hover:bg-success-600',
            'aria-expanded:bg-success-600',
            'aria-checked:bg-success-600',
            'focus:bg-success-600 data-focus:bg-success-600',
            'aria-disabled:bg-success-300/30 aria-disabled:text-light-900',
          ])
          .with({ variant: 'plain', status: 'success' }, () => [
            'text-success-300',
            'hover:bg-success-300/4',
            'aria-expanded:bg-success-300/4',
            'aria-checked:bg-success-300/4',
            'focus:bg-success-300/4 data-focus:bg-success-300/4',
            'aria-disabled:text-success-200/30',
          ])
          .with({ variant: 'filled', status: 'error' }, () => [
            'bg-danger-800 text-light-50',
            'hover:bg-danger-700',
            'aria-expanded:bg-danger-700',
            'aria-checked:bg-danger-700',
            'focus:bg-danger-700 data-focus:bg-danger-700',
            'aria-disabled:bg-danger-300/30 aria-disabled:text-light-800',
          ])
          .with({ variant: 'plain', status: 'error' }, () => [
            'text-danger-600',
            'hover:bg-danger-300/4',
            'aria-expanded:bg-danger-300/4',
            'aria-checked:bg-danger-300/4',
            'focus:bg-danger-300/4 data-focus:bg-danger-300/4',
            'aria-disabled:text-danger-300/50',
          ])
          .exhaustive(),
      )}
      onClick={(e) => {
        e.stopPropagation()
        buttonProps.onClick?.(e)
      }}
    />
  )
}

export { Button, type ButtonProps, type ButtonVariant, type ButtonStatus }
