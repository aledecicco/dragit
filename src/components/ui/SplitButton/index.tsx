import { type ReactNode, useRef } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import { Dropdown } from '@/ui/Dropdown'
import { cn, propsWithCn } from '@/utils/styles'

type SplitButtonProps = DecoratedButtonProps & {
  /**
   * The list of items to display in the dropdown menu.
   */
  items: ReactNode

  /**
   * Props for the button that triggers the dropdown menu.
   */
  menuButtonProps?: Partial<DecoratedButtonProps>
}

/**
 * A {@link DecoratedButton} with a primary action, and a dropdown menu next to it for alternatives.
 *
 * The props go straight to the main button,
 * except for `className` which is applied to the container that wraps both buttons.
 */
const SplitButton = (props: SplitButtonProps) => {
  const {
    items,
    menuButtonProps,
    className,
    size = 'md',
    ...buttonProps
  } = props

  const anchorRef = useRef<HTMLDivElement>(null)
  const menuSize = menuButtonProps?.size ?? size

  const getAnchorRect = () => {
    const rect = anchorRef.current?.getBoundingClientRect()

    if (!rect) {
      return null
    }

    return {
      x: rect.x,
      y: rect.y,
      width: rect.width * 2,
      height: rect.height,
    }
  }

  return (
    <div
      className={cn(
        className,
        'grid grid-cols-[1fr_max-content] items-stretch',
        match(size)
          .with('xs', () => 'rounded-sm')
          .with('sm', () => 'rounded-sm')
          .with('md', () => 'rounded-md')
          .with('lg', () => 'rounded-md')
          .exhaustive(),
      )}
      ref={anchorRef}
    >
      <DecoratedButton
        {...buttonProps}
        round={false}
        size={size}
        className={cn(
          'rounded-l-[inherit] rounded-r-none grow overflow-hidden',
          buttonProps.variant !== 'plain' && 'border-r',
          match(buttonProps.status)
            .with('primary', () => 'border-r-primary-800')
            .with('success', () => 'border-r-green-800')
            .with('warning', () => 'border-r-warning-700')
            .with('danger', () => 'border-r-danger-900')
            .with(P.union('neutral', undefined), () => 'border-r-dark-500')
            .exhaustive(),
          match(size)
            .with('xs', () => 'pr-1')
            .with('sm', () => 'pr-1')
            .with('md', () => 'pr-1.5')
            .with('lg', () => 'pr-2')
            .exhaustive(),
        )}
      />

      <Dropdown
        portal
        sameWidth
        getAnchorRect={getAnchorRect}
        className={cn(
          'border max-w-max',
          match(buttonProps.status)
            .with('primary', () => 'border-primary-300/20')
            .with('success', () => 'border-success-300/20')
            .with('warning', () => 'border-warning-200/20')
            .with('danger', () => 'border-danger-600/20')
            .with(P.union('neutral', undefined), () => 'border-light-50/5')
            .exhaustive(),
        )}
        anchor={
          <DecoratedButton
            label="More"
            Glyph={IconChevronDown}
            compact
            {...propsWithCn(
              menuButtonProps,
              'h-full',
              'rounded-l-none rounded-r-[inherit]',
              match(menuSize)
                .with('xs', () => 'px-0.5')
                .with('sm', () => 'px-0.75')
                .with('md', () => 'px-1')
                .with('lg', () => 'px-1.25')
                .exhaustive(),
            )}
            iconProps={propsWithCn(
              menuButtonProps?.iconProps,
              'group-aria-expanded/menu:rotate-180',
            )}
            disabled={buttonProps.disabled || menuButtonProps?.disabled}
            variant={menuButtonProps?.variant ?? buttonProps.variant}
            status={menuButtonProps?.status ?? buttonProps.status}
            round={false}
            size={menuSize}
          />
        }
      >
        {items}
      </Dropdown>
    </div>
  )
}

export { SplitButton, type SplitButtonProps }
