import * as Ariakit from '@ariakit/react'
import { match } from 'ts-pattern'

import { propsWithCn } from '@/utils/styles'
import type { Size } from '@/utils/types'

type ButtonVariant = 'filled' | 'plain'

type ButtonStatus =
  | 'primary'
  | 'cta'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'

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
        'h-max text-nowrap',
        'flex flex-row justify-center items-center text-center',
        'border-none font-semibold',
        'cursor-pointer active:scale-98',

        match(size)
          .with('xs', () => [
            'text-xs gap-2',
            round ? 'p-1 rounded-full' : 'px-1.75 py-1.25 rounded-sm',
          ])
          .with('sm', () => [
            'text-xs gap-2',
            round ? 'p-1.25 rounded-full' : 'px-2.5 py-1.75 rounded-sm',
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
            'aria-selected:bg-primary-600',
            'data-active-item:aria-selected:bg-primary-500',
            'focus:bg-primary-600 data-focus:bg-primary-600',
            'aria-disabled:bg-primary-500/40 aria-disabled:text-light-800',
          ])
          .with({ variant: 'plain', status: 'primary' }, () => [
            'text-primary-300',
            'hover:bg-primary-300/8',
            'aria-expanded:bg-primary-300/8',
            'aria-checked:bg-primary-300/8',
            'aria-selected:bg-primary-300/8',
            'data-active-item:aria-selected:bg-primary-300/10',
            'focus:bg-primary-300/8 data-focus:bg-primary-300/8',
            'aria-disabled:text-primary-400/40',
          ])
          .with({ variant: 'filled', status: 'cta' }, () => [
            'bg-accent-600 text-light-50',
            'hover:bg-accent-500',
            'aria-expanded:bg-accent-500',
            'aria-checked:bg-accent-500',
            'aria-selected:bg-accent-500',
            'data-active-item:aria-selected:bg-accent-400',
            'focus:bg-accent-500 data-focus:bg-accent-500',
            'aria-disabled:bg-accent-600/40 aria-disabled:text-light-700',
          ])
          .with({ variant: 'plain', status: 'cta' }, () => [
            'text-accent-400',
            'hover:bg-accent-400/8',
            'aria-expanded:bg-accent-400/8',
            'aria-checked:bg-accent-400/8',
            'aria-selected:bg-accent-400/10',
            'data-active-item:aria-selected:bg-accent-400/12',
            'focus:bg-accent-400/8 data-focus:bg-accent-400/8',
            'aria-disabled:text-accent-500/40',
          ])
          .with({ variant: 'filled', status: 'neutral' }, () => [
            'bg-dark-300 text-light-50',
            'hover:bg-dark-100',
            'aria-expanded:bg-dark-100',
            'aria-checked:bg-dark-100',
            'aria-selected:bg-dark-100',
            'data-active-item:aria-selected:bg-dark-50',
            'focus:bg-dark-100 data-focus:bg-dark-100',
            'aria-disabled:bg-dark-400 aria-disabled:text-light-950/50',
          ])
          .with({ variant: 'plain', status: 'neutral' }, () => [
            'text-light-50',
            'hover:bg-light-50/4',
            'aria-expanded:bg-light-50/4',
            'aria-checked:bg-light-50/4',
            'aria-selected:bg-light-50/6',
            'data-active-item:aria-selected:bg-light-50/8',
            'focus:bg-light-50/4 data-focus:bg-light-50/4',
            'aria-disabled:text-light-800',
          ])
          .with({ variant: 'filled', status: 'success' }, () => [
            'bg-success-700 text-light-50',
            'hover:bg-success-600',
            'aria-expanded:bg-success-600',
            'aria-checked:bg-success-600',
            'aria-selected:bg-success-600',
            'data-active-item:aria-selected:bg-success-500',
            'focus:bg-success-600 data-focus:bg-success-600',
            'aria-disabled:bg-success-300/30 aria-disabled:text-light-900',
          ])
          .with({ variant: 'plain', status: 'success' }, () => [
            'text-success-300',
            'hover:bg-success-300/8',
            'aria-expanded:bg-success-300/8',
            'aria-checked:bg-success-300/8',
            'aria-selected:bg-success-300/10',
            'data-active-item:aria-selected:bg-success-300/12',
            'focus:bg-success-300/8 data-focus:bg-success-300/8',
            'aria-disabled:text-success-200/30',
          ])
          .with({ variant: 'filled', status: 'warning' }, () => [
            'bg-warning-700 text-warning-100',
            'hover:bg-warning-600',
            'aria-expanded:bg-warning-600',
            'aria-checked:bg-warning-600',
            'aria-selected:bg-warning-600',
            'data-active-item:aria-selected:bg-warning-500',
            'focus:bg-warning-600 data-focus:bg-warning-600',
            'aria-disabled:bg-warning-700/40 aria-disabled:text-warning-700',
          ])
          .with({ variant: 'plain', status: 'warning' }, () => [
            'text-warning-200/90',
            'hover:bg-warning-200/8',
            'aria-expanded:bg-warning-200/8',
            'aria-checked:bg-warning-200/8',
            'aria-selected:bg-warning-200/10',
            'data-active-item:aria-selected:bg-warning-200/12',
            'focus:bg-warning-200/8 data-focus:bg-warning-200/8',
            'aria-disabled:text-warning-300/40',
          ])
          .with({ variant: 'filled', status: 'danger' }, () => [
            'bg-danger-800 text-light-50',
            'hover:bg-danger-700',
            'aria-expanded:bg-danger-700',
            'aria-checked:bg-danger-700',
            'aria-selected:bg-danger-700',
            'data-active-item:aria-selected:bg-danger-600',
            'focus:bg-danger-700 data-focus:bg-danger-700',
            'aria-disabled:bg-danger-300/30 aria-disabled:text-light-800',
          ])
          .with({ variant: 'plain', status: 'danger' }, () => [
            'text-danger-300',
            'hover:bg-danger-300/8',
            'aria-expanded:bg-danger-300/8',
            'aria-checked:bg-danger-300/8',
            'aria-selected:bg-danger-300/10',
            'data-active-item:aria-selected:bg-danger-300/12',
            'focus:bg-danger-300/8 data-focus:bg-danger-300/8',
            'aria-disabled:text-danger-300/50',
          ])
          .exhaustive(),
      )}
    />
  )
}

export { Button, type ButtonProps, type ButtonVariant, type ButtonStatus }
