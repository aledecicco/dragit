import { type ReactNode, useRef } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import {
  DecoratedButton,
  type DecoratedButtonProps,
} from '@/lib/DecoratedButton'
import { Dropdown } from '@/ui/Dropdown'
import { cn, propsWithCn } from '@/utils/styles'

interface SplitButtonProps extends Omit<DecoratedButtonProps, 'round'> {
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
  const { items, menuButtonProps, className, ...buttonProps } = props

  const anchorRef = useRef<HTMLDivElement>(null)
  const size = buttonProps.size ?? 'md'
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
      className={cn(className, 'flex flex-row items-stretch rounded-md')}
      ref={anchorRef}
    >
      <DecoratedButton
        {...buttonProps}
        round={false}
        className={cn(
          'rounded-l-[inherit] rounded-r-none grow',
          'border-r border-solid',
          match(buttonProps.status)
            .with('primary', () => 'border-r-primary-800')
            .with('cta', () => 'border-r-accent-700')
            .with('success', () => 'border-r-green-800')
            .with('error', () => 'border-r-danger-900')
            .with(P.union('neutral', undefined), () => 'border-r-dark-500')
            .exhaustive(),
          match(size)
            .with('sm', () => 'pr-1')
            .with('md', () => 'pr-1.5')
            .with('lg', () => 'pr-2')
            .exhaustive(),
        )}
        size={size}
      />

      <Dropdown
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
                .with('sm', () => 'px-0.5')
                .with('md', () => 'px-0.75')
                .with('lg', () => 'px-1')
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
        getAnchorRect={getAnchorRect}
      >
        {items}
      </Dropdown>
    </div>
  )
}

export { SplitButton, type SplitButtonProps }
